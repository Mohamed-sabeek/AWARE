# AWARE - Automated Warning and Air Pollution Reporting & Evidence System

AWARE is a next-generation, premium environmental ecosystem designed to monitor air quality, record pollution violations, and empower authorities to take swift action—all from a single, immersive platform.

Built with a gorgeous, Apple/Linear-inspired modern UI, AWARE leverages real-time IoT sensors and AI to provide actionable environmental data.

## 🌟 Key Features

- **Real-Time Air Quality Monitoring (AQI):** Instantaneous tracking of dangerous pollutants like PM2.5 and CO2.
- **AI Smoke Detection:** Computer vision algorithms identify visual smoke plumes automatically in real-time, eliminating false positives.
- **Evidence Image Capture:** Triggers high-res photo captures the moment a pollution threshold is crossed.
- **Government Dashboard:** A centralized, beautiful command center tailored for municipality response teams and officials.
- **Instant Alerts:** Real-time WebSocket alerts instantly notify authorities of breaches.
- **Citizen Reporting:** Empowers locals to report anomalies directly into the platform.

## 💻 Tech Stack

**Frontend:**
- React 19 & Vite
- Tailwind CSS v4
- Framer Motion (Premium micro-interactions, parallax, and 3D tilts)
- Lucide React Icons

**Backend (In Progress):**
- Node.js & Express.js
- MongoDB Atlas & Mongoose
- Socket.IO (Real-time sync)
- Cloudinary (Cloud image storage)

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

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
   *Create a `.env` file in the `server` directory and configure your MongoDB connection:*
   ```env
   PORT=5009
   MONGO_URI=mongodb://127.0.0.1:27017/aware
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

3. **Seed the Database:**
   Run the seed script to create the default Administrator account:
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

5. **Frontend Setup:**
   Open a new terminal window:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The application will start on `http://localhost:5183`.

## 🎨 UI/UX Highlights

AWARE features a stunning, $100M SaaS-style interface:
- **Glassmorphism:** Elegant glass UI elements with soft backdrop blurs and subtle white borders.
- **Asymmetrical Bento Grid:** A modern, visually engaging layout for the Features ecosystem.
- **3D Parallax & Magnetic Hover:** Interactive elements that respond smoothly to cursor movement.
- **Micro-animations:** Lift effects, glowing ambient gradients, and stagger entrances using Framer Motion.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📄 License
This project is licensed under the MIT License.
