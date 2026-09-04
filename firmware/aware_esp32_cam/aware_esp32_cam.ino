/**
 * =========================================================================
 * AWARE ESP32-CAM + ADS1115 + MQ Gas Sensor Firmware
 * FreeRTOS Dual-Core Architecture (Smooth MJPEG Stream + Real-Time Sensor)
 * Dedicated Hardware RAW Binary JPEG Ingestion (No Busboy / No Multipart)
 * Version: RAW-UPLOAD-V2
 * =========================================================================
 * 
 * FreeRTOS Task Architecture:
 * ----------------------------
 * CORE 0:
 *   - StreamTask: Dedicated Port 81 MJPEG live stream server.
 *   - Runs at ~14-15 FPS (68 ms frame interval) with VGA/QVGA & JPEG.
 *   - Zero heap-churn frame loop + CAMERA_GRAB_LATEST.
 *   - Yields to FreeRTOS/lwIP stack so WiFi remains completely responsive.
 * 
 * CORE 1:
 *   - SensorTask (loop): Reads ADS1115 (16-bit ADC) every 1000 ms.
 *   - Sends JSON HTTP POST to /api/sensors/reading.
 *   - Threshold State Machine with Debounced Clearing:
 *       Trigger: Voltage >= 0.400 V  --> Capture immediately + every 5s while active.
 *       Hysteresis: 0.390 V <= Voltage < 0.400 V  --> Stays active, continues 5s captures.
 *       Clear: Voltage < 0.390 V continuously for 3000 ms  --> Incident cleared.
 * 
 * EVIDENCE CAPTURE (Mutex-Protected):
 *   - Flash LED (GPIO 4) turned ON only during shutter (~120ms), then OFF immediately.
 *   - Frame buffer copied to memory and cameraMutex released immediately (<20ms).
 *   - Validates JPEG SOI (0xFFD8) and EOI (0xFFD9).
 *   - Direct raw binary HTTP POST to /api/evidence/upload-raw.
 *   - Awaits HTTP 201 Created server response.
 * 
 * Hardware Connections:
 * - ESP32-CAM (AI-Thinker model, OV2640)
 * - ADS1115 I2C: SDA -> GPIO 13, SCL -> GPIO 14
 * - MQ Gas Sensor Analog Out -> ADS1115 A0 (Channel 0)
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
const char* ssid     = "Airtel_Vaathiyare";
const char* password = "Nanavanapoduren@69";

// Backend Server Configuration
const char* serverHost = "192.168.1.11";
const int   serverPort = 5009;
const String SENSOR_ENDPOINT   = "http://192.168.1.11:5009/api/sensors/reading";
const String RAW_EVIDENCE_PATH = "/api/evidence/upload-raw";

const char* DEVICE_ID = "ESP32-CAM-001";

// Threshold & Debounce Configuration
const float TRIGGER_THRESHOLD   = 0.400; // Voltage to start incident (V)
const float CLEAR_THRESHOLD     = 0.390; // Voltage to clear incident (V)
const unsigned long CLEAR_DEBOUNCE_MS = 3000; // 3 seconds continuous below 0.390V to clear

// Timing Configuration (millis)
const unsigned long SENSOR_INTERVAL       = 1000;  // 1-second sensor broadcast
const unsigned long EVIDENCE_INTERVAL     = 5000;  // 5-second recurring evidence capture
const unsigned long STREAM_FRAME_INTERVAL = 68;    // ~14.7 FPS (Smooth, stable frame rate)

// Live Stream Server on Port 81 (Managed on Core 0)
WiFiServer streamServer(81);
WiFiClient streamClient;
bool isStreaming = false;

// FreeRTOS Synchronization & Task Handles
SemaphoreHandle_t cameraMutex = NULL;
TaskHandle_t streamTaskHandle = NULL;

// Runtime State Variables
unsigned long lastSensorTime           = 0;
unsigned long lastEvidenceTime         = 0;
unsigned long belowClearThresholdTime  = 0;
bool isIncidentActive                  = false;

// ==========================================
// 2. HARDWARE PIN DEFINITIONS (AI-THINKER)
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
#define I2C_SCL           14

Adafruit_ADS1115 ads;

// ==========================================
// 3. CAMERA INITIALIZATION (OV2640)
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
  config.xclk_freq_hz = 20000000; // Preserved working 20MHz clock
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode    = CAMERA_GRAB_LATEST; // Discards stale frames automatically
  
  if (psramFound()) {
    config.frame_size   = FRAMESIZE_VGA;
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

  // Set sensor tuning registers
  sensor_t * s = esp_camera_sensor_get();
  if (s != NULL) {
    s->set_brightness(s, 0);
    s->set_contrast(s, 0);
    s->set_saturation(s, 0);
  }

  Serial.println("[CAMERA] OV2640 Initialized");
  return true;
}

// ==========================================
// 4. READ SENSOR VOLTAGE (ADS1115 16-BIT)
// ==========================================
float readSensorVoltage() {
  int16_t adc0 = ads.readADC_SingleEnded(0);
  // ADS1115 GAIN_ONE: +/- 4.096V (1 bit = 0.125mV)
  float voltage = ads.computeVolts(adc0);
  if (voltage < 0.0) voltage = 0.0;
  return voltage;
}

// ==========================================
// 5. SEND SENSOR READING JSON (POST)
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
    Serial.printf("[SENSOR STREAM] Post error (%.3f V): %s\n", voltage, http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}

// ==========================================
// 6. CAPTURE & UPLOAD EVIDENCE (RAW JPEG BINARY)
// ==========================================
void captureAndUploadEvidence(float voltage) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[UPLOAD] WiFi not connected. Aborting evidence capture.");
    return;
  }

  uint8_t* evidenceBuffer = NULL;
  size_t evidenceLen = 0;

  Serial.println("[CAMERA] Evidence capture started");

  // 1. Acquire Camera Mutex (Wait up to 100ms)
  if (xSemaphoreTake(cameraMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
    // Flash ON immediately before shutter
    digitalWrite(FLASH_LED_PIN, HIGH);
    Serial.println("[FLASH] ON");
    delay(120); // Flash & sensor exposure stabilization delay

    // Capture Frame
    camera_fb_t * fb = esp_camera_fb_get();
    
    // Flash OFF immediately after shutter
    digitalWrite(FLASH_LED_PIN, LOW);
    Serial.println("[FLASH] OFF");

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
        Serial.printf("[CAMERA] JPEG captured: %u bytes\n", (unsigned int)evidenceLen);
      } else {
        Serial.println("[CAMERA] Memory allocation failed for evidence buffer!");
      }

      // Return camera buffer to driver immediately
      esp_camera_fb_return(fb);
    } else {
      Serial.println("[CAMERA] Camera capture failed! Framebuffer is NULL");
    }

    // Release Camera Mutex immediately (<20ms) so Live Stream on Core 0 can resume
    xSemaphoreGive(cameraMutex);
  } else {
    Serial.println("[CAMERA] Camera busy, skipping evidence frame.");
    return;
  }

  if (!evidenceBuffer || evidenceLen < 4) {
    if (evidenceBuffer) free(evidenceBuffer);
    return;
  }

  // 2. Validate JPEG SOI (0xFF, 0xD8) and EOI (0xFF, 0xD9)
  if (evidenceBuffer[0] == 0xFF && evidenceBuffer[1] == 0xD8 &&
      evidenceBuffer[evidenceLen - 2] == 0xFF && evidenceBuffer[evidenceLen - 1] == 0xD9) {
    Serial.println("[CAMERA] JPEG VALID");
    Serial.printf("[CAMERA] JPEG size: %u bytes\n", (unsigned int)evidenceLen);
  } else {
    Serial.println("[CAMERA] JPEG INVALID (Magic bytes mismatch)");
    free(evidenceBuffer);
    return;
  }

  // 3. Perform Direct Raw Binary JPEG Upload (No Multipart / No Busboy)
  Serial.printf("[UPLOAD] Connecting to %s:%d\n", serverHost, serverPort);
  WiFiClient client;
  client.setTimeout(4000); // 4 seconds timeout

  if (!client.connect(serverHost, serverPort)) {
    Serial.println("[UPLOAD] Backend connection FAILED");
    free(evidenceBuffer);
    return;
  }

  Serial.println("[UPLOAD] POST /api/evidence/upload-raw");
  Serial.printf("[UPLOAD] Sending JPEG: %u bytes\n", (unsigned int)evidenceLen);

  // Send raw HTTP request headers
  client.printf("POST /api/evidence/upload-raw HTTP/1.1\r\n"
                "Host: %s:%d\r\n"
                "User-Agent: AWARE-ESP32-CAM/1.0\r\n"
                "Content-Type: image/jpeg\r\n"
                "Content-Length: %u\r\n"
                "X-Device-ID: %s\r\n"
                "X-Voltage: %.4f\r\n"
                "X-Detection-Type: Threshold Exceeded\r\n"
                "Connection: close\r\n\r\n",
                serverHost, serverPort, (unsigned int)evidenceLen, DEVICE_ID, voltage);

  // Stream raw JPEG binary in 1024-byte chunks
  size_t bufferSize = 1024;
  size_t sentBytes = 0;
  for (size_t n = 0; n < evidenceLen; n += bufferSize) {
    size_t chunk = (n + bufferSize < evidenceLen) ? bufferSize : (evidenceLen - n);
    size_t written = client.write(evidenceBuffer + n, chunk);
    if (written == 0) {
      Serial.println("[UPLOAD] Socket write failed mid-stream!");
      break;
    }
    sentBytes += written;
  }
  client.flush();

  Serial.printf("[UPLOAD] Sent: %u / %u bytes\n", (unsigned int)sentBytes, (unsigned int)evidenceLen);
  Serial.println("[UPLOAD] Waiting for backend response...");

  // 4. Await and verify HTTP 201 Created server response
  unsigned long respStart = millis();
  int statusCode = 0;
  while (client.connected() && millis() - respStart < 4000) {
    if (client.available()) {
      String statusLine = client.readStringUntil('\n');
      if (statusLine.startsWith("HTTP/1.")) {
        int firstSpace = statusLine.indexOf(' ');
        if (firstSpace > 0) {
          statusCode = statusLine.substring(firstSpace + 1, firstSpace + 4).toInt();
        }
        break;
      }
    }
    vTaskDelay(pdMS_TO_TICKS(5));
  }

  if (statusCode == 201 || statusCode == 200) {
    Serial.printf("[UPLOAD] HTTP %d Created\n", statusCode);
    Serial.println("[UPLOAD] Evidence upload SUCCESS\n");
  } else if (statusCode > 0) {
    Serial.printf("[UPLOAD] Evidence upload FAILED - HTTP %d\n\n", statusCode);
  } else {
    Serial.println("[UPLOAD] Backend response TIMEOUT\n");
  }

  client.stop();
  free(evidenceBuffer);
}

// ==========================================
// 7. DEDICATED STREAM TASK (PINNED TO CORE 0)
// ==========================================
void streamTask(void *pvParameters) {
  Serial.printf("[STREAM TASK] Started on Core %d\n", xPortGetCoreID());

  // Cloudflare/Proxy compliant multipart HTTP response header
  static const char* mjpegResponseHeader = 
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n"
    "Cache-Control: no-cache, no-store, must-revalidate, pre-check=0, post-check=0, max-age=0\r\n"
    "Pragma: no-cache\r\n"
    "Expires: -1\r\n"
    "Access-Control-Allow-Origin: *\r\n"
    "Access-Control-Allow-Headers: *\r\n"
    "Access-Control-Allow-Methods: GET, OPTIONS\r\n"
    "Connection: keep-alive\r\n\r\n";

  char frameHeader[96];

  for (;;) {
    // 1. Accept new incoming browser / Cloudflare tunnel connection on Port 81
    if (!streamClient || !streamClient.connected()) {
      WiFiClient newClient = streamServer.available();
      if (newClient) {
        streamClient = newClient;
        streamClient.setNoDelay(true);
        streamClient.setTimeout(2000); // 2-second timeout for streaming operations
        isStreaming = false;

        // Drain full HTTP request header from proxy / client to prevent socket pipeline stalls
        unsigned long startWait = millis();
        bool isBlankLine = false;
        char prevChar = 0;
        while (streamClient.connected() && (millis() - startWait < 500)) {
          while (streamClient.available()) {
            char c = streamClient.read();
            if (prevChar == '\n' && (c == '\r' || c == '\n')) {
              isBlankLine = true;
              break;
            }
            prevChar = c;
            startWait = millis();
          }
          if (isBlankLine) break;
          vTaskDelay(pdMS_TO_TICKS(2));
        }

        // Send standard MJPEG streaming HTTP response headers
        streamClient.print(mjpegResponseHeader);
        streamClient.flush();
        isStreaming = true;
        Serial.println("[STREAM SERVER] Stream client connected (Cloudflare/Browser) on Port 81");
      } else {
        vTaskDelay(pdMS_TO_TICKS(20));
        continue;
      }
    }

    // 2. Stream next JPEG frame if client is connected
    if (isStreaming && streamClient.connected()) {
      camera_fb_t * fb = NULL;

      // Acquire camera mutex briefly to grab the latest frame
      if (xSemaphoreTake(cameraMutex, pdMS_TO_TICKS(25)) == pdTRUE) {
        fb = esp_camera_fb_get();
        xSemaphoreGive(cameraMutex);
      }

      if (fb) {
        // Zero dynamic heap allocation: format header into fixed static buffer
        int headerLen = snprintf(frameHeader, sizeof(frameHeader),
          "--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n", (unsigned int)fb->len);

        size_t writtenHeader = streamClient.write((const uint8_t*)frameHeader, headerLen);
        bool writeSuccess = (writtenHeader == (size_t)headerLen);

        // Progressive chunked transmission (2KB chunks) to feed HTTP proxy progressively
        const size_t chunkSize = 2048;
        const uint8_t* bufPtr = fb->buf;
        size_t remaining = fb->len;

        while (writeSuccess && remaining > 0 && streamClient.connected()) {
          size_t toWrite = (remaining < chunkSize) ? remaining : chunkSize;
          size_t bytesWritten = streamClient.write(bufPtr, toWrite);
          if (bytesWritten == 0) {
            writeSuccess = false;
            break;
          }
          bufPtr += bytesWritten;
          remaining -= bytesWritten;
        }

        if (writeSuccess && streamClient.connected()) {
          streamClient.write((const uint8_t*)"\r\n", 2);
          streamClient.flush(); // Flush frame immediately down the wire
        } else {
          isStreaming = false;
        }

        // Always return camera frame buffer immediately
        esp_camera_fb_return(fb);
      }

      // Frame pacing: ~14.7 FPS (68 ms interval)
      vTaskDelay(pdMS_TO_TICKS(STREAM_FRAME_INTERVAL));
    } else {
      if (streamClient) {
        streamClient.stop();
      }
      isStreaming = false;
      vTaskDelay(pdMS_TO_TICKS(20));
    }
  }
}

// ==========================================
// 8. SETUP
// ==========================================
void setup() {
  Serial.begin(115200);

  // Initialize Flash LED pin and ensure it stays OFF
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  // Print Version & Mode Verification Banner
  Serial.println("\n========================================");
  Serial.println("AWARE ESP32-CAM FIRMWARE VERSION: RAW-UPLOAD-V2");
  Serial.println("5-SECOND EVIDENCE MODE: ENABLED");
  Serial.println("========================================\n");

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
// 9. MAIN SENSOR & THRESHOLD LOOP (CORE 1)
// ==========================================
void loop() {
  unsigned long currentMillis = millis();

  // Read current live voltage from ADS1115
  float currentVoltage = readSensorVoltage();

  // -------------------------------------------------------------
  // TASK 1: Live Sensor Telemetry Stream (~1-Second Interval)
  // -------------------------------------------------------------
  if (currentMillis - lastSensorTime >= SENSOR_INTERVAL) {
    lastSensorTime = currentMillis;
    sendSensorReading(currentVoltage);
  }

  // -------------------------------------------------------------
  // TASK 2: 5-Second Evidence Capture + Debounced Hysteresis
  // -------------------------------------------------------------
  if (currentVoltage >= TRIGGER_THRESHOLD) {
    // Voltage is at or above trigger threshold (>= 0.400 V)
    belowClearThresholdTime = 0; // Reset clear debounce timer

    if (!isIncidentActive) {
      // 1. FIRST BREACH: Start incident immediately & take first photo
      isIncidentActive = true;
      lastEvidenceTime = currentMillis;
      Serial.printf("\n[THRESHOLD] NEW BREACH: %.3f V >= %.3f V\n", currentVoltage, TRIGGER_THRESHOLD);
      captureAndUploadEvidence(currentVoltage);
    } 
    else if (currentMillis - lastEvidenceTime >= EVIDENCE_INTERVAL) {
      // 2. RECURRING 5-SECOND CAPTURE: Take another photo every 5 seconds while active
      lastEvidenceTime = currentMillis;
      Serial.printf("\n[CAMERA] 5-second evidence interval reached (Voltage: %.3f V)\n", currentVoltage);
      captureAndUploadEvidence(currentVoltage);
    }
  } 
  else if (currentVoltage < CLEAR_THRESHOLD) {
    // Voltage dropped below clear threshold (< 0.390 V)
    if (isIncidentActive) {
      if (belowClearThresholdTime == 0) {
        belowClearThresholdTime = currentMillis; // Start debounce timer
      } 
      else if (currentMillis - belowClearThresholdTime >= CLEAR_DEBOUNCE_MS) {
        // Voltage remained continuously below CLEAR_THRESHOLD for 3 seconds -> CLEAR INCIDENT
        isIncidentActive = false;
        belowClearThresholdTime = 0;
        Serial.printf("\n[THRESHOLD] INCIDENT CLEARED (Voltage: %.3f V < %.3f V continuously for %lu ms)\n", 
                      currentVoltage, CLEAR_THRESHOLD, CLEAR_DEBOUNCE_MS);
        Serial.println("[THRESHOLD] Evidence capture cycle stopped\n");
      }
    }
  } 
  else {
    // Voltage is in Hysteresis Band (0.390 V <= Voltage < 0.400 V)
    // Sensor is fluctuating: remain in active incident state, reset clear timer
    belowClearThresholdTime = 0;

    if (isIncidentActive && (currentMillis - lastEvidenceTime >= EVIDENCE_INTERVAL)) {
      lastEvidenceTime = currentMillis;
      Serial.printf("\n[CAMERA] 5-second evidence interval reached in hysteresis band (Voltage: %.3f V)\n", currentVoltage);
      captureAndUploadEvidence(currentVoltage);
    }
  }

  // Yield loop to Core 1 FreeRTOS scheduler
  vTaskDelay(pdMS_TO_TICKS(10));
}
