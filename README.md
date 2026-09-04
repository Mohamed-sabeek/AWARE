# AWARE - Automated Warning and Air Pollution Reporting & Evidence System

AWARE is a next-generation, premium environmental ecosystem designed to monitor air quality, record pollution violations, and empower authorities to take swift action—all from a single, immersive platform.

Built with a gorgeous, Apple/Linear-inspired modern UI, AWARE leverages real-time IoT sensors, dual-core ESP32-CAM computer vision, satellite telemetry, and dynamic multi-client live streaming to provide actionable environmental intelligence.

---

## 🌟 Key Features

- **Real-Time Air Quality Telemetry:** High-precision gas and particulate monitoring using ADS1115 (16-bit ADC) and MQ gas sensors.
- **Hardware-Triggered Evidence Capture:** Automatic shutter and flash activation upon threshold breach ($\ge 0.400\text{ V}$) with recurring 5-second evidence capture and debounced clearing.
- **Dedicated RAW Binary Evidence Ingestion (`POST /api/evidence/upload-raw`):** Robust microcontroller image upload path with magic byte validation (SOI `0xFFD8` / EOI `0xFFD9`).
- **Multi-Client Live MJPEG Stream Relay (`GET /api/live/stream/:deviceId`):** Node.js stream relay maintaining a single upstream connection to ESP32 Port 81, serving any number of concurrent viewers without hardware strain.
- **Dynamic Cloudflare Quick Tunnel Integration:** Automatic discovery and propagation of transient `https://*.trycloudflare.com` URLs to Authority incident alerts without requiring static `.env` edits or server restarts.
- **Authority Incident Response:** Authority and emergency response officers receive instant Socket.IO alerts with one-click **[ View Live Camera ]** access requiring no login.
- **Satellite Monitoring (Sentinel-5P):** Direct integration with the **Copernicus Data Space Ecosystem (CDSE)** for tracking state-wide emissions with a 7-day historical fallback algorithm.
- **Interactive Geolocation Maps:** Incident and sensor mapping using Leaflet and historical coordinate snapshots.

---

## 💻 Tech Stack

**Frontend:**
- React 19 & Vite
- Tailwind CSS v4
- Framer Motion (Micro-interactions, parallax, and smooth entrance transitions)
- Lucide React Icons
- Leaflet (Interactive mapping)

**Backend:**
- Node.js & Express.js
- MongoDB Atlas & Mongoose
- Socket.IO (Real-time telemetry and incident alerts)
- Cloudflare Quick Tunnel Service (Dynamic auto-detection)
- CDSE Statistical API (Sentinel-5P atmospheric monitoring)
- Cloudinary & Local disk evidence storage

**Firmware (ESP32-CAM):**
- FreeRTOS Dual-Core Architecture (Core 0: MJPEG Stream Server | Core 1: Sensor & Evidence Upload)
- AI-Thinker OV2640 Camera
- Adafruit ADS1115 (16-bit I2C ADC on GPIO 13/14)
- High-power Flash LED (GPIO 4)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn
- Arduino IDE (for ESP32-CAM firmware flashing)

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mohamed-sabeek/AWARE.git
   cd AWARE
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   ```
   *Create a `.env` file in the `server` directory:*
   ```env
   PORT=5009
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/AWARE
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   
   # ESP32-CAM Upstream Stream URL
   ESP32_STREAM_URL=http://192.168.1.19:81/stream
   
   # Optional static fallback (Dynamic Quick Tunnel overrides automatically)
   PUBLIC_LIVE_STREAM_BASE_URL=
   
   # Copernicus Data Space Ecosystem (CDSE) Credentials
   CDSE_CLIENT_ID=your_cdse_client_id
   CDSE_CLIENT_SECRET=your_cdse_client_secret
   ```

3. **Seed Default Admin Account:**
   ```bash
   node seed/adminSeed.js
   ```
   *Default Admin Credentials:*
   - Email: `awareadmin@gmail.com`
   - Password: `aware@admin`

4. **Start the Backend Server:**
   ```bash
   npm run dev
   ```

5. **Start Cloudflare Quick Tunnel (Optional / Prototype Remote Streaming):**
   ```bash
   npm run tunnel
   ```
   *The backend will automatically detect the dynamic `https://xxxxx.trycloudflare.com` URL and attach it to new incident alerts.*

6. **Frontend Setup:**
   In a new terminal:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Open `http://localhost:5183` in your browser.

7. **ESP32-CAM Firmware Setup:**
   - Open `firmware/aware_esp32_cam/aware_esp32_cam.ino` in Arduino IDE.
   - Configure Wi-Fi credentials (`ssid`, `password`) and backend IP (`serverHost`).
   - Select Board: **AI Thinker ESP32-CAM** (PSRAM Enabled).
   - Flash the board and open Serial Monitor at **`115200 baud`**.

---

## 📡 IoT & Evidence Streaming Pipeline

```
                       [ ESP32-CAM ]
                     /               \
       Core 0 (Port 81)              Core 1 (Sensor Loop)
              |                               |
       Local MJPEG Stream           ADS1115 (>= 0.400 V Breach)
              |                               |
              v                               v
    [ Node.js Stream Relay ]      [ POST /api/evidence/upload-raw ]
              |                               |
              +--------------+----------------+
                             |
                             v
                  [ MongoDB & Socket.IO ]
                             |
           +-----------------+-----------------+
           |                                   |
           v                                   v
  [ Authority Dashboard ]             [ Public Live Stream ]
  (Realtime Alert + Live Link)      (No Auth / Multi-Client)
```

---

## 🎨 UI/UX Highlights

- **Glassmorphism:** Soft backdrop blurs and subtle gradient borders for clean readability.
- **Asymmetrical Bento Grid:** Visually engaging telemetry, satellite, and incident cards.
- **Seamless Real-time Sync:** Socket.IO updates metrics, live alerts, and notifications instantly without manual refreshes.
- **Interactive Mapping:** Color-coded status pins and historical coordinates for every incident.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📄 License
This project is licensed under the MIT License.