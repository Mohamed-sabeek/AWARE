/**
 * AWARE ESP32-CAM + ADS1115 + MQ Gas Sensor Firmware
 * 
 * Architecture:
 * - Dual Non-Blocking Timers using millis() (Zero blocking delay()):
 *   1. Sensor Stream Loop: Reads ADS1115 and POSTs reading every ~1000 ms (1 second).
 *   2. Camera Capture Loop:
 *      - When voltage >= 0.400 V for the first time: Instantly turns on Flash LED (GPIO 4)
 *        and uploads a high-res JPEG to POST /api/evidence/upload.
 *      - While voltage remains >= 0.400 V: Automatically captures and uploads a new JPEG every 5000 ms (5 seconds).
 *      - When voltage drops < 0.400 V: Immediately resets the trigger state so the next breach
 *        triggers an instant photo.
 *   3. Continuous Live MJPEG Stream Server (Port 81):
 *      - Non-blocking HTTP MJPEG streaming on port 81 (/stream)
 *      - Flash LED remains OFF during streaming
 *      - Camera mutex prevents conflict between live streaming and evidence capture
 * 
 * Hardware Connections:
 * - ESP32-CAM (AI-Thinker model)
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
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend Endpoints
const char* serverHost = "172.17.144.124";
const int   serverPort = 5009;
const String SENSOR_ENDPOINT   = "http://172.17.144.124:5009/api/sensors/reading";
const String EVIDENCE_ENDPOINT = "http://172.17.144.124:5009/api/evidence/upload";

const char* DEVICE_ID = "ESP32-CAM-001";
const float THRESHOLD = 0.400; // Voltage limit (V)

// Live Stream Server on Port 81
WiFiServer streamServer(81);
WiFiClient streamClient;
bool isStreaming = false;
bool isCameraBusy = false; // Mutex to prevent simultaneous camera access

// ==========================================
// 2. TIMING CONFIGURATION (millis)
// ==========================================
const unsigned long SENSOR_INTERVAL = 1000;  // 1-second sensor broadcast
const unsigned long CAMERA_INTERVAL = 5000;  // 5-second recurring evidence capture
const unsigned long STREAM_FRAME_INTERVAL = 40; // ~25 FPS max stream frame pacing

unsigned long lastSensorTime = 0;
unsigned long lastCameraTime = 0;
unsigned long lastStreamFrameTime = 0;
bool isThresholdActive = false; // Tracks active breach session

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
// 4. CAMERA INITIALIZATION
// ==========================================
bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // High quality frame buffer setup for streaming + evidence capture
  if(psramFound()){
    config.frame_size = FRAMESIZE_VGA; // 640x480 for smooth 25fps stream + high quality upload
    config.jpeg_quality = 12;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 14;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return false;
  }
  return true;
}

// ==========================================
// 5. READ SENSOR VOLTAGE (ADS1115 16-BIT)
// ==========================================
float readSensorVoltage() {
  int16_t adc0 = ads.readADC_SingleEnded(0);
  // ADS1115 GAIN_ONE: +/- 4.096V (1 bit = 0.125mV)
  float voltage = ads.computeVolts(adc0);
  if (voltage < 0) voltage = 0.0;
  return voltage;
}

// ==========================================
// 6. SEND SENSOR READING JSON (POST)
// ==========================================
void sendSensorReading(float voltage) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
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
// 7. CAPTURE & UPLOAD EVIDENCE JPEG (MULTIPART)
// ==========================================
void captureAndUploadEvidence(float voltage) {
  if (WiFi.status() != WL_CONNECTED) return;

  // Set camera mutex busy
  isCameraBusy = true;

  Serial.println("[CAMERA TRIGGER] Activating Flash & Capturing Evidence Frame...");
  
  // 1. Turn on Flash LED
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, HIGH);
  delay(150); // Short flash stabilization before shutter

  // 2. Capture frame
  camera_fb_t * fb = esp_camera_fb_get();
  
  // 3. Turn off Flash LED immediately
  digitalWrite(FLASH_LED_PIN, LOW);

  if (!fb) {
    Serial.println("[CAMERA TRIGGER] Camera capture failed!");
    isCameraBusy = false;
    return;
  }

  Serial.printf("[CAMERA TRIGGER] Captured %u bytes. Uploading to backend...\n", fb->len);

  // 4. Construct Multipart HTTP POST Request
  WiFiClient client;
  if (client.connect(serverHost, serverPort)) {
    String boundary = "----AWAREBoundary7MA4YWxkTrZu0gW";
    
    // Multipart header fields
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

    uint32_t totalLen = head.length() + fb->len + tail.length();

    client.println("POST /api/evidence/upload HTTP/1.1");
    client.println("Host: " + String(serverHost) + ":" + String(serverPort));
    client.println("Content-Length: " + String(totalLen));
    client.println("Content-Type: multipart/form-data; boundary=" + boundary);
    client.println("Connection: close");
    client.println();

    // Stream multipart body
    client.print(head);

    uint8_t *fbBuf = fb->buf;
    size_t fbLen = fb->len;
    size_t bufferSize = 1024;
    for (size_t n = 0; n < fbLen; n += bufferSize) {
      if (n + bufferSize < fbLen) {
        client.write(fbBuf + n, bufferSize);
      } else {
        client.write(fbBuf + n, fbLen - n);
      }
    }

    client.print(tail);
    
    Serial.println("[CAMERA TRIGGER] Evidence upload completed successfully.");
  } else {
    Serial.println("[CAMERA TRIGGER] Connection to backend failed.");
  }

  // Release camera buffer and release mutex
  esp_camera_fb_return(fb);
  isCameraBusy = false;
}

// ==========================================
// 8. LIVE STREAM HANDLING (PORT 81 MJPEG)
// ==========================================
void handleLiveStream() {
  // Check for incoming client if none active
  if (!streamClient || !streamClient.connected()) {
    WiFiClient newClient = streamServer.available();
    if (newClient) {
      streamClient = newClient;
      streamClient.setNoDelay(true);
      isStreaming = false;
      
      // Read HTTP Request
      String req = "";
      unsigned long startWait = millis();
      while (streamClient.connected() && millis() - startWait < 500) {
        if (streamClient.available()) {
          char c = streamClient.read();
          req += c;
          if (req.endsWith("\r\n\r\n")) break;
        }
      }

      // Send MJPEG Multipart Headers
      streamClient.print("HTTP/1.1 200 OK\r\n"
                         "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n"
                         "Access-Control-Allow-Origin: *\r\n"
                         "Connection: close\r\n\r\n");
      isStreaming = true;
      Serial.println("[STREAM SERVER] Browser client connected to /stream");
    }
    return;
  }

  // Send next frame if client is connected and camera is not busy capturing evidence
  if (isStreaming && streamClient.connected() && !isCameraBusy) {
    unsigned long currentMillis = millis();
    if (currentMillis - lastStreamFrameTime >= STREAM_FRAME_INTERVAL) {
      lastStreamFrameTime = currentMillis;

      isCameraBusy = true;
      camera_fb_t * fb = esp_camera_fb_get();
      if (fb) {
        String frameHeader = "--frame\r\nContent-Type: image/jpeg\r\nContent-Length: " + String(fb->len) + "\r\n\r\n";
        streamClient.print(frameHeader);
        streamClient.write(fb->buf, fb->len);
        streamClient.print("\r\n");
        esp_camera_fb_return(fb);
      }
      isCameraBusy = false;
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
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW); // Flash LED stays OFF for live stream

  // Initialize I2C and ADS1115
  Wire.begin(I2C_SDA, I2C_SCL);
  if (!ads.begin()) {
    Serial.println("Failed to initialize ADS1115! Check I2C wiring.");
  } else {
    ads.setGain(GAIN_ONE); // +/- 4.096V range
    Serial.println("ADS1115 initialized successfully.");
  }

  // Initialize Camera (Single OV2640 instance)
  if (!initCamera()) {
    Serial.println("Camera initialization failed!");
  } else {
    Serial.println("ESP32-CAM initialized successfully.");
  }

  // Connect to Wi-Fi
  Serial.printf("Connecting to Wi-Fi SSID: %s\n", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  // Explicitly Start Port 81 Stream Server
  streamServer.begin();
  streamServer.setNoDelay(true);

  Serial.println("\n==========================================");
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
      Serial.printf("[ALERT TRIGGER] First threshold breach detected: %.3f V >= %.3f V\n", currentVoltage, THRESHOLD);
      isThresholdActive = true;
      lastCameraTime = currentMillis; // Record instant trigger time
      captureAndUploadEvidence(currentVoltage);
    } 
    else if (currentMillis - lastCameraTime >= CAMERA_INTERVAL) {
      // 2. RECURRING BREACH: Capture photo every 5 seconds while still active
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
