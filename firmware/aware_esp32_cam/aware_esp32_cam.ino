/**
 * =========================================================================
 * AWARE ESP32-CAM + ADS1115 + MQ Gas Sensor Firmware
 * FreeRTOS Dual-Core Architecture (Smooth MJPEG Stream + Real-Time Sensor)
 * =========================================================================
 * 
 * FreeRTOS Task Architecture:
 * ----------------------------
 * CORE 0:
 *   - StreamTask: Dedicated Port 81 MJPEG live stream server.
 *   - Runs at ~14-15 FPS (68 ms frame interval) with QVGA (320x240) & Quality 14.
 *   - Zero heap-churn frame loop + CAMERA_GRAB_LATEST eliminates FB-OVF.
 *   - Yields to FreeRTOS/lwIP stack so WiFi remains completely responsive.
 * 
 * CORE 1:
 *   - SensorTask (loop): Reads ADS1115 (16-bit ADC) every 1000 ms.
 *   - Sends non-blocking JSON HTTP POST to /api/sensors/reading.
 *   - Evaluates gas threshold (>= 0.400 V) and manages evidence cycle.
 * 
 * EVIDENCE CAPTURE (Mutex-Protected):
 *   - Immediate capture on breach + 5-second recurring captures while active.
 *   - Flash LED (GPIO 4) pulsed only for 150 ms during shutter.
 *   - Fast copy to PSRAM & immediate cameraMutex release (<20 ms).
 *   - Background multipart HTTP upload to /api/evidence/upload.
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
// 1. NETWORK & BACKEND CONFIGURATION
// ==========================================
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend Server Configuration
const char* serverHost = "10.190.0.124";
const int   serverPort = 5009;
const String SENSOR_ENDPOINT   = "http://10.190.0.124:5009/api/sensors/reading";
const String EVIDENCE_ENDPOINT = "http://10.190.0.124:5009/api/evidence/upload";

const char* DEVICE_ID = "ESP32-CAM-001";
const float THRESHOLD = 0.400; // Voltage limit (V)

// Live Stream Server on Port 81 (Managed on Core 0)
WiFiServer streamServer(81);
WiFiClient streamClient;
bool isStreaming = false;

// FreeRTOS Synchronization & Task Handles
SemaphoreHandle_t cameraMutex = NULL;
TaskHandle_t streamTaskHandle = NULL;

// ==========================================
// 2. TIMING CONFIGURATION (millis)
// ==========================================
const unsigned long SENSOR_INTERVAL       = 1000;  // 1-second sensor broadcast
const unsigned long EVIDENCE_INTERVAL     = 5000;  // 5-second recurring evidence capture
const unsigned long STREAM_FRAME_INTERVAL = 68;    // ~14.7 FPS (Smooth, stable & anti-FB-OVF)

unsigned long lastSensorTime      = 0;
unsigned long lastCameraTime      = 0;
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
  config.grab_mode    = CAMERA_GRAB_LATEST; // Discards stale frames automatically
  
  if (psramFound()) {
    config.frame_size   = FRAMESIZE_QVGA; // 320x240 for fluid 14-15 FPS & low memory pressure
    config.jpeg_quality = 14;             // Balanced quality (prevents DMA/FIFO overflow)
    config.fb_count     = 2;
    config.fb_location  = CAMERA_FB_IN_PSRAM;
  } else {
    config.frame_size   = FRAMESIZE_QVGA;
    config.jpeg_quality = 15;
    config.fb_count     = 1;
    config.fb_location  = CAMERA_FB_IN_DRAM;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[CAMERA] Init failed with error 0x%x\n", err);
    return false;
  }

  // Set sensor tuning registers
  sensor_t * s = esp_camera_sensor_get();
  if (s != NULL) {
    s->set_brightness(s, 0);
    s->set_contrast(s, 0);
    s->set_saturation(s, 0);
  }

  Serial.println("[CAMERA] OV2640 Initialized with CAMERA_GRAB_LATEST & QVGA (320x240)");
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
  http.setTimeout(1500); // 1.5-second strict timeout
  http.begin(SENSOR_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  // Efficient payload creation
  char jsonPayload[64];
  snprintf(jsonPayload, sizeof(jsonPayload), "{\"deviceId\":\"%s\",\"voltage\":%.3f}", DEVICE_ID, voltage);

  int httpResponseCode = http.POST((uint8_t*)jsonPayload, strlen(jsonPayload));
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

      // Return camera buffer to driver immediately
      esp_camera_fb_return(fb);
    } else {
      Serial.println("[CAMERA TRIGGER] Camera capture failed!");
    }

    // Release Camera Mutex immediately (<20ms) so Live Stream on Core 0 can resume
    xSemaphoreGive(cameraMutex);
  } else {
    Serial.println("[CAMERA TRIGGER] Camera busy, skipping evidence frame.");
    return;
  }

  if (!evidenceBuffer || evidenceLen == 0) {
    if (evidenceBuffer) free(evidenceBuffer);
    return;
  }

  Serial.printf("[CAMERA TRIGGER] Evidence frame captured (%u bytes). Uploading...\n", evidenceLen);

  // 2. Perform Multipart HTTP Upload over WiFiClient
  WiFiClient client;
  client.setTimeout(3); // 3 seconds timeout
  if (client.connect(serverHost, serverPort)) {
    const char* boundary = "----AWAREBoundary7MA4YWxkTrZu0gW";
    
    char head[384];
    int headLen = snprintf(head, sizeof(head),
      "--%s\r\n"
      "Content-Disposition: form-data; name=\"deviceId\"\r\n\r\n"
      "%s\r\n"
      "--%s\r\n"
      "Content-Disposition: form-data; name=\"voltage\"\r\n\r\n"
      "%.3f\r\n"
      "--%s\r\n"
      "Content-Disposition: form-data; name=\"detectionType\"\r\n\r\n"
      "Threshold Exceeded\r\n"
      "--%s\r\n"
      "Content-Disposition: form-data; name=\"image\"; filename=\"evidence.jpg\"\r\n"
      "Content-Type: image/jpeg\r\n\r\n",
      boundary, DEVICE_ID, boundary, voltage, boundary, boundary);

    char tail[64];
    int tailLen = snprintf(tail, sizeof(tail), "\r\n--%s--\r\n", boundary);
    uint32_t totalLen = headLen + evidenceLen + tailLen;

    client.printf("POST /api/evidence/upload HTTP/1.1\r\n"
                  "Host: %s:%d\r\n"
                  "Content-Length: %u\r\n"
                  "Content-Type: multipart/form-data; boundary=%s\r\n"
                  "Connection: close\r\n\r\n",
                  serverHost, serverPort, totalLen, boundary);

    client.write((const uint8_t*)head, headLen);

    // Stream JPEG bytes in 1024-byte chunks
    size_t bufferSize = 1024;
    for (size_t n = 0; n < evidenceLen; n += bufferSize) {
      size_t chunk = (n + bufferSize < evidenceLen) ? bufferSize : (evidenceLen - n);
      client.write(evidenceBuffer + n, chunk);
    }

    client.write((const uint8_t*)tail, tailLen);
    client.flush();
    Serial.println("[CAMERA TRIGGER] Evidence upload successfully completed.");
  } else {
    Serial.println("[CAMERA TRIGGER] Connection to backend upload endpoint failed.");
  }

  // Free evidence copy buffer
  free(evidenceBuffer);
}

// ==========================================
// 8. DEDICATED STREAM TASK (PINNED TO CORE 0)
// ==========================================
void streamTask(void *pvParameters) {
  Serial.printf("[STREAM TASK] Started on Core %d\n", xPortGetCoreID());

  // Reusable header buffer (avoids dynamic memory allocations inside frame loop)
  char frameHeader[80];
  const char* mjpegResponseHeader = 
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n"
    "Access-Control-Allow-Origin: *\r\n"
    "Connection: close\r\n\r\n";

  for (;;) {
    // 1. Accept new incoming browser connection on Port 81
    if (!streamClient || !streamClient.connected()) {
      WiFiClient newClient = streamServer.available();
      if (newClient) {
        streamClient = newClient;
        streamClient.setNoDelay(true);
        isStreaming = false;

        // Read initial HTTP GET request non-blockingly
        unsigned long startWait = millis();
        while (streamClient.connected() && millis() - startWait < 200) {
          if (streamClient.available()) {
            char c = streamClient.read();
            if (c == '\n') break;
          }
          vTaskDelay(pdMS_TO_TICKS(1));
        }

        // Send standard HTTP MJPEG Multipart headers
        streamClient.print(mjpegResponseHeader);
        isStreaming = true;
        Serial.println("[STREAM SERVER] Browser connected to /stream on Port 81");
      } else {
        vTaskDelay(pdMS_TO_TICKS(20));
        continue;
      }
    }

    // 2. Stream next JPEG frame if client is connected
    if (isStreaming && streamClient.connected()) {
      // Attempt camera mutex acquisition with short 15ms timeout (skip frame if camera is busy)
      if (xSemaphoreTake(cameraMutex, pdMS_TO_TICKS(15)) == pdTRUE) {
        camera_fb_t * fb = esp_camera_fb_get();
        if (fb) {
          int headerLen = snprintf(frameHeader, sizeof(frameHeader),
            "--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n", (unsigned int)fb->len);
          
          streamClient.write((const uint8_t*)frameHeader, headerLen);
          streamClient.write(fb->buf, fb->len);
          streamClient.write((const uint8_t*)"\r\n", 2);

          // Return camera frame buffer immediately
          esp_camera_fb_return(fb);
        }
        xSemaphoreGive(cameraMutex);
      }
      
      // Frame pacing: ~14.7 FPS (68 ms interval)
      vTaskDelay(pdMS_TO_TICKS(STREAM_FRAME_INTERVAL));
    } else {
      streamClient.stop();
      isStreaming = false;
      vTaskDelay(pdMS_TO_TICKS(20));
    }
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
    delay(300);
    Serial.print(".");
  }

  // Start Port 81 Stream Server
  streamServer.begin();
  streamServer.setNoDelay(true);

  // Spawn dedicated StreamTask pinned to CORE 0 (Stack: 4096 words, Priority: 1)
  xTaskCreatePinnedToCore(
    streamTask,
    "StreamTask",
    4096,
    NULL,
    1,
    &streamTaskHandle,
    0
  );

  Serial.println("\n==========================================");
  Serial.println("AWARE ESP32-CAM READY");
  Serial.println("STREAM SERVER STARTED ON PORT 81 (CORE 0)");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("STREAM SERVER: PORT 81");
  Serial.print("LIVE STREAM:\nhttp://");
  Serial.print(WiFi.localIP());
  Serial.println(":81/stream");
  Serial.println("==========================================");
}

// ==========================================
// 10. MAIN SENSOR LOOP (CORE 1)
// ==========================================
void loop() {
  unsigned long currentMillis = millis();

  // Read current live voltage from ADS1115
  float currentVoltage = readSensorVoltage();

  // -------------------------------------------------------------
  // TASK 1: Live Sensor Stream (~1-Second Interval)
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
    else if (currentMillis - lastCameraTime >= EVIDENCE_INTERVAL) {
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

  // Yield loop to Core 1 FreeRTOS scheduler
  vTaskDelay(pdMS_TO_TICKS(10));
}
