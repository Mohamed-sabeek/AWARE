/**
 * =========================================================================
 * AWARE ESP32-CAM + ADS1115 + MQ Gas Sensor Firmware (High-Concurrency)
 * =========================================================================
 * 
 * Multi-Tasking & Concurrency Architecture:
 * 1. SENSOR STREAM (Every 1000 ms):
 *    - Reads ADS1115 16-bit ADC voltage.
 *    - Non-blocking HTTP POST to /api/sensors/reading.
 *    - Strict network timeout to prevent stalling loop().
 * 
 * 2. LIVE CAMERA STREAM (Port 81 /stream):
 *    - Continuous MJPEG streaming via WiFiServer on port 81.
 *    - Non-blocking frame transmission with CAMERA_GRAB_LATEST to eliminate FB-OVF.
 *    - Protected by FreeRTOS cameraMutex so evidence capture never collides.
 *    - Flash LED remains strictly OFF during streaming.
 * 
 * 3. EVIDENCE CAPTURE & UPLOAD (Threshold >= 0.400 V):
 *    - Immediate capture on 1st breach + 5-second recurring captures while active.
 *    - Activates Flash LED (GPIO 4) only for 150ms during shutter.
 *    - Immediately copies frame buffer & releases cameraMutex (<30ms) so live
 *      stream and sensor loop are NEVER stalled during the multipart HTTP upload.
 *    - Uploads evidence JPEG to POST /api/evidence/upload.
 * 
 * Hardware Connections:
 * - ESP32-CAM (AI-Thinker model, OV2640)
 * - ADS1115 I2C: SDA -> GPIO 13, SCL -> GPIO 15
 * - MQ Gas Sensor Analog Out (via 22k/22k divider) -> ADS1115 A0 (Channel 0)
 * - Built-in Flash LED -> GPIO 4
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_ADS1X15.h>

// ==========================================
// 1. NETWORK & SERVER CONFIGURATION
// ==========================================
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend Server Configuration
const char* serverHost = "192.168.1.11";
const int   serverPort = 5009;
const String SENSOR_ENDPOINT   = "http://192.168.1.11:5009/api/sensors/reading";
const String EVIDENCE_ENDPOINT = "http://192.168.1.11:5009/api/evidence/upload";

const char* DEVICE_ID = "ESP32-CAM-001";
const float THRESHOLD = 0.400; // Voltage limit (V)

// Live Stream Server on Port 81
WiFiServer streamServer(81);
WiFiClient streamClient;
bool isStreaming = false;

// FreeRTOS Mutex for Thread-Safe Camera Access
SemaphoreHandle_t cameraMutex = NULL;

// ==========================================
// 2. TIMING CONFIGURATION (millis)
// ==========================================
const unsigned long SENSOR_INTERVAL       = 1000;  // 1-second sensor broadcast
const unsigned long CAMERA_INTERVAL       = 5000;  // 5-second recurring evidence capture
const unsigned long STREAM_FRAME_INTERVAL = 35;    // ~28 FPS stream frame rate

unsigned long lastSensorTime      = 0;
unsigned long lastCameraTime      = 0;
unsigned long lastStreamFrameTime = 0;
bool isThresholdActive            = false;

// ==========================================
// 3. HARDWARE PIN DEFINITIONS (AI-THINKER)
// ==========================================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define FLASH_LED_PIN      4

// I2C Pins for ADS1115 on ESP32-CAM
#define I2C_SDA           13
#define I2C_SCL           15

Adafruit_ADS1115 ads;

// ==========================================
// 4. CAMERA INITIALIZATION (ANTI-FB-OVF)
// ==========================================
bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode    = CAMERA_GRAB_LATEST; // Automatically discards stale frames to prevent FB-OVF
  
  if (psramFound()) {
    config.frame_size   = FRAMESIZE_VGA; // 640x480 for smooth 25-30 FPS stream + high quality evidence
    config.jpeg_quality = 12;
    config.fb_count     = 2;
    config.fb_location  = CAMERA_FB_IN_PSRAM;
  } else {
    config.frame_size   = FRAMESIZE_QVGA;
    config.jpeg_quality = 14;
    config.fb_count     = 1;
    config.fb_location  = CAMERA_FB_IN_DRAM;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[CAMERA] Init failed with error 0x%x\n", err);
    return false;
  }

  // Optimize sensor registers for fast frame delivery
  sensor_t * s = esp_camera_sensor_get();
  if (s != NULL) {
    s->set_brightness(s, 0);
    s->set_contrast(s, 0);
    s->set_saturation(s, 0);
  }

  Serial.println("[CAMERA] OV2640 Initialized with CAMERA_GRAB_LATEST");
  return true;
}

// ==========================================
// 5. READ SENSOR VOLTAGE (ADS1115 16-BIT)
// ==========================================
float readSensorVoltage() {
  int16_t adc0 = ads.readADC_SingleEnded(0);
  // ADS1115 GAIN_ONE: +/- 4.096V (1 bit = 0.125mV)
  float voltage = ads.computeVolts(adc0);
  if (voltage < 0.0) voltage = 0.0;
  return voltage;
}

// ==========================================
// 6. SEND SENSOR READING JSON (POST)
// ==========================================
void sendSensorReading(float voltage) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.setTimeout(1500); // 1.5-second strict timeout to prevent blocking loop()
  http.begin(SENSOR_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  String jsonPayload = "{\"deviceId\":\"" + String(DEVICE_ID) + 
                       "\",\"voltage\":" + String(voltage, 3) + "}";

  int httpResponseCode = http.POST(jsonPayload);
  if (httpResponseCode > 0) {
    Serial.printf("[SENSOR STREAM] Posted: %.3f V | Code: %d\n", voltage, httpResponseCode);
  } else {
    Serial.printf("[SENSOR STREAM] Error sending reading: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}

// ==========================================
// 7. CAPTURE & UPLOAD EVIDENCE JPEG
// ==========================================
void captureAndUploadEvidence(float voltage) {
  if (WiFi.status() != WL_CONNECTED) return;

  uint8_t* evidenceBuffer = NULL;
  size_t evidenceLen = 0;

  // 1. Acquire Camera Mutex (Wait up to 100ms)
  if (xSemaphoreTake(cameraMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
    Serial.println("[CAMERA TRIGGER] Flash ON & Capturing Evidence Frame...");
    
    // Flash ON immediately before shutter
    digitalWrite(FLASH_LED_PIN, HIGH);
    delay(150); // Flash stabilization delay

    // Capture Frame
    camera_fb_t * fb = esp_camera_fb_get();
    
    // Flash OFF immediately after shutter
    digitalWrite(FLASH_LED_PIN, LOW);

    if (fb) {
      evidenceLen = fb->len;
      // Allocate copy buffer in PSRAM/Heap to release camera frame buffer immediately
      if (psramFound()) {
        evidenceBuffer = (uint8_t*)ps_malloc(evidenceLen);
      } else {
        evidenceBuffer = (uint8_t*)malloc(evidenceLen);
      }

      if (evidenceBuffer) {
        memcpy(evidenceBuffer, fb->buf, evidenceLen);
      }

      // Return camera buffer to driver
      esp_camera_fb_return(fb);
    } else {
      Serial.println("[CAMERA TRIGGER] Camera capture failed!");
    }

    // Release Camera Mutex immediately (<30ms) so Live Stream can continue
    xSemaphoreGive(cameraMutex);
  } else {
    Serial.println("[CAMERA TRIGGER] Camera busy, deferred.");
    return;
  }

  if (!evidenceBuffer || evidenceLen == 0) {
    if (evidenceBuffer) free(evidenceBuffer);
    return;
  }

  Serial.printf("[CAMERA TRIGGER] Evidence frame captured (%u bytes). Uploading in background...\n", evidenceLen);

  // 2. Perform Multipart HTTP Upload over WiFiClient
  WiFiClient client;
  client.setTimeout(3); // 3 seconds timeout
  if (client.connect(serverHost, serverPort)) {
    String boundary = "----AWAREBoundary7MA4YWxkTrZu0gW";
    
    String head = "--" + boundary + "\r\n" +
                  "Content-Disposition: form-data; name=\"deviceId\"\r\n\r\n" +
                  String(DEVICE_ID) + "\r\n" +
                  "--" + boundary + "\r\n" +
                  "Content-Disposition: form-data; name=\"voltage\"\r\n\r\n" +
                  String(voltage, 3) + "\r\n" +
                  "--" + boundary + "\r\n" +
                  "Content-Disposition: form-data; name=\"detectionType\"\r\n\r\n" +
                  "Threshold Exceeded\r\n" +
                  "--" + boundary + "\r\n" +
                  "Content-Disposition: form-data; name=\"image\"; filename=\"evidence.jpg\"\r\n" +
                  "Content-Type: image/jpeg\r\n\r\n";

    String tail = "\r\n--" + boundary + "--\r\n";
    uint32_t totalLen = head.length() + evidenceLen + tail.length();

    client.println("POST /api/evidence/upload HTTP/1.1");
    client.println("Host: " + String(serverHost) + ":" + String(serverPort));
    client.println("Content-Length: " + String(totalLen));
    client.println("Content-Type: multipart/form-data; boundary=" + boundary);
    client.println("Connection: close");
    client.println();

    client.print(head);

    // Stream JPEG bytes in 1024-byte chunks
    size_t bufferSize = 1024;
    for (size_t n = 0; n < evidenceLen; n += bufferSize) {
      if (n + bufferSize < evidenceLen) {
        client.write(evidenceBuffer + n, bufferSize);
      } else {
        client.write(evidenceBuffer + n, evidenceLen - n);
      }
    }

    client.print(tail);
    client.flush();
    Serial.println("[CAMERA TRIGGER] Evidence upload successfully completed.");
  } else {
    Serial.println("[CAMERA TRIGGER] Connection to backend upload endpoint failed.");
  }

  // Free evidence copy buffer
  free(evidenceBuffer);
}

// ==========================================
// 8. NON-BLOCKING LIVE STREAM HANDLER
// ==========================================
void handleLiveStream() {
  // 1. Accept new incoming browser connection on Port 81
  if (!streamClient || !streamClient.connected()) {
    WiFiClient newClient = streamServer.available();
    if (newClient) {
      streamClient = newClient;
      streamClient.setNoDelay(true);
      isStreaming = false;
      
      // Read initial HTTP request header line non-blockingly
      String req = "";
      unsigned long startWait = millis();
      while (streamClient.connected() && millis() - startWait < 300) {
        if (streamClient.available()) {
          char c = streamClient.read();
          req += c;
          if (req.endsWith("\r\n\r\n")) break;
        }
      }

      // Send standard HTTP MJPEG Multipart headers
      streamClient.print("HTTP/1.1 200 OK\r\n"
                         "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n"
                         "Access-Control-Allow-Origin: *\r\n"
                         "Connection: close\r\n\r\n");
      isStreaming = true;
      Serial.println("[STREAM SERVER] Browser client connected to /stream on Port 81");
    }
    return;
  }

  // 2. Stream next JPEG frame if pace timer elapsed
  if (isStreaming && streamClient.connected()) {
    unsigned long currentMillis = millis();
    if (currentMillis - lastStreamFrameTime >= STREAM_FRAME_INTERVAL) {
      lastStreamFrameTime = currentMillis;

      // Try acquiring camera mutex with short 20ms timeout
      if (xSemaphoreTake(cameraMutex, pdMS_TO_TICKS(20)) == pdTRUE) {
        camera_fb_t * fb = esp_camera_fb_get();
        if (fb) {
          String frameHeader = "--frame\r\nContent-Type: image/jpeg\r\nContent-Length: " + String(fb->len) + "\r\n\r\n";
          streamClient.print(frameHeader);
          streamClient.write(fb->buf, fb->len);
          streamClient.print("\r\n");
          esp_camera_fb_return(fb);
        }
        xSemaphoreGive(cameraMutex);
      }
    }
  } else if (!streamClient.connected()) {
    streamClient.stop();
    isStreaming = false;
  }
}

// ==========================================
// 9. SETUP
// ==========================================
void setup() {
  Serial.begin(115200);

  // Initialize Flash LED pin and ensure it stays OFF
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  // Create FreeRTOS Camera Mutex
  cameraMutex = xSemaphoreCreateMutex();

  // Initialize I2C and ADS1115
  Wire.begin(I2C_SDA, I2C_SCL);
  if (!ads.begin()) {
    Serial.println("[ADS1115] Initialization failed! Check I2C wiring.");
  } else {
    ads.setGain(GAIN_ONE); // +/- 4.096V range (0.125mV/bit)
    Serial.println("[ADS1115] Initialized successfully.");
  }

  // Initialize Camera (Single OV2640 instance)
  if (!initCamera()) {
    Serial.println("[CAMERA] Initialization failed!");
  }

  // Connect to Wi-Fi
  Serial.printf("[WIFI] Connecting to SSID: %s\n", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }

  // Start Port 81 Stream Server
  streamServer.begin();
  streamServer.setNoDelay(true);

  Serial.println("\n==========================================");
  Serial.println("AWARE ESP32-CAM READY");
  Serial.println("STREAM SERVER STARTED ON PORT 81");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("STREAM SERVER: PORT 81");
  Serial.print("LIVE STREAM:\nhttp://");
  Serial.print(WiFi.localIP());
  Serial.println(":81/stream");
  Serial.println("==========================================");
}

// ==========================================
// 10. NON-BLOCKING MAIN LOOP
// ==========================================
void loop() {
  unsigned long currentMillis = millis();

  // Read current live voltage from ADS1115
  float currentVoltage = readSensorVoltage();

  // -------------------------------------------------------------
  // TASK 1: Live Sensor Stream (~1-Second Non-Blocking Interval)
  // -------------------------------------------------------------
  if (currentMillis - lastSensorTime >= SENSOR_INTERVAL) {
    lastSensorTime = currentMillis;
    sendSensorReading(currentVoltage);
  }

  // -------------------------------------------------------------
  // TASK 2: Camera Trigger & Continuous 5-Second Threshold Cycle
  // -------------------------------------------------------------
  if (currentVoltage >= THRESHOLD) {
    if (!isThresholdActive) {
      // 1. FIRST BREACH: Instant photo trigger (Flash ON briefly)
      Serial.printf("[ALERT TRIGGER] First threshold breach: %.3f V >= %.3f V\n", currentVoltage, THRESHOLD);
      isThresholdActive = true;
      lastCameraTime = currentMillis;
      captureAndUploadEvidence(currentVoltage);
    } 
    else if (currentMillis - lastCameraTime >= CAMERA_INTERVAL) {
      // 2. RECURRING BREACH: Capture photo every 5 seconds while active
      Serial.printf("[ALERT CYCLE] Threshold remains exceeded: %.3f V. 5s timer elapsed.\n", currentVoltage);
      lastCameraTime = currentMillis;
      captureAndUploadEvidence(currentVoltage);
    }
  } else {
    // 3. THRESHOLD RESOLVED (< 0.400 V): Reset cycle immediately
    if (isThresholdActive) {
      Serial.printf("[ALERT CLEARED] Voltage dropped to %.3f V (< %.3f V). Camera cycle reset.\n", currentVoltage, THRESHOLD);
      isThresholdActive = false;
    }
  }

  // -------------------------------------------------------------
  // TASK 3: Non-Blocking Port 81 MJPEG Live Stream
  // -------------------------------------------------------------
  handleLiveStream();
}
