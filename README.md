# 🚖 BharatOne: Premium 3-Tier Real-Time Cab Booking Application

Welcome to **BharatOne**, a premium, production-grade 3-tier cab booking clone. This project is built using **React Native (Expo Web)** for the mobile-first frontend, **Node.js (Express + Socket.io)** for the real-time backend, and **PostgreSQL** for persistent database storage.

To make development and testing incredibly fast, the backend includes an **intelligent in-memory database fallback and a Driver AI movement simulator**. If PostgreSQL is not yet configured on your machine, the server will alert you and run in in-memory mode instantly out of the box, allowing you to test bookings and watch vehicles drive on the map with zero setup!

---

## 🏗️ Project Architecture

```
BharatOne-app/
├── backend/                  # Node.js + Express API & Socket.io WebSockets
│   ├── routes/               # REST API Routers (Auth, Rides)
│   ├── middleware/           # Route guards (JWT verification)
│   ├── db.js                 # PostgreSQL connection & Intelligent Fallback
│   ├── schema.sql            # Database schema & seeded users/drivers
│   ├── server.js             # Express entrypoint & Driver AI Simulator
│   └── .env                  # Server and database environment variables
│
└── frontend/                 # Mobile-first React Native (Expo Web)
    ├── App.js                # App entrypoint & State navigation
    ├── app.json              # Expo configuration (favicon, icons, etc.)
    └── src/
        ├── components/       # Reusable components (Frosted Glass panels, Map)
        ├── context/          # Shared Authentication & Live WebSockets Context
        ├── screens/          # Login, Registration, Rider, & Driver Panels
        ├── theme/            # Obsidian and glowing violet colors palette
        └── utils/            # Axios/Fetch wrapper with JWT attachment
```

---

## ⚡ Quick Start: 3-Step Setup

Follow these simple steps to set up and run the entire stack on your local or remote machine.

### 📋 Prerequisites
Ensure you have **Node.js** (v18+) and **PostgreSQL** installed on your system.

---

### Step 1: Database Setup (PostgreSQL)

1. Open your PostgreSQL terminal (`psql` or pgAdmin) and create a database named `BharatOne`:
   ```sql
   CREATE DATABASE BharatOne;
   ```
2. Connect to the database and run the schema query script inside [backend/schema.sql](file:///C:/Users/Softelevation-Devops/.gemini/antigravity/scratch/BharatOne-app/backend/schema.sql) to create tables and pre-populate seed accounts.
   - If using terminal:
     ```bash
     psql -U postgres -d BharatOne -f backend/schema.sql
     ```
     *(The script inserts 1 test Rider and 3 test Drivers representing Economy, Premium, and SUV vehicles).*

---

### Step 2: Backend Configuration & Startup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the server-side node packages:
   ```bash
   npm install
   ```
3. Configure the environment variables:
   - Open the [.env](file:///C:/Users/Softelevation-Devops/.gemini/antigravity/scratch/BharatOne-app/backend/.env) file.
   - Update `DB_PASSWORD` and `DB_USER` to match your local PostgreSQL credentials.
4. Launch the server in development mode:
   ```bash
   npm run dev
   ```
   - The server will run on **`http://localhost:5000`**.
   - *If PostgreSQL is online: You will see `✅ PostgreSQL Connected Successfully!`*
   - *If PostgreSQL is offline/not setup: You will see `⚡ AUTOMATIC SWITCH TO IN-MEMORY DEMO MODE` (the app will still run perfectly).*

---

### Step 3: Frontend Configuration & Startup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install the React Native and Expo dependencies:
   ```bash
   npm install
   ```
3. Launch the Expo Dev Server for the Web:
   ```bash
   npm run web
   ```
   - The application will automatically compile and open in your web browser at **`http://localhost:8081`** or **`http://localhost:19006`**.

---

## 🎮 How to Test & Demo the Application

BharatOne is configured with **two highly engaging demo avenues** to let you inspect every edge of the 3-tier WebSocket flow:

### Avenue A: Interactive Single-Player Demo (Automatic AI Simulator)
1. Open the frontend browser page (`http://localhost:8081`).
2. On the login screen, click **`👤 Rider Demo`** to instantly autofill the credentials (`rider@BharatOne.com`). Click **Log In**.
3. Select one of our **✨ Quick Demo Journey Routes** (e.g., *Wall Street to SoHo*).
4. Tap **Request BharatOne**.
5. The matching radar turns on. After 2 seconds, the server matches you with **Sarah's Hyundai Ioniq**.
6. **Watch the live Map**: Sarah's vehicle will appear, change status to *Arrived*, transition to *Active Trip*, and you will watch the vehicle marker move smoothly along the highway lines in real-time, ultimately ending in a detailed electronic fare receipt!

### Avenue B: Two-Player Dispatch Match (Multi-Tab Multi-Role Testing)
1. Open **Tab A** in your browser, log in as **`👤 Rider Demo`**, select a route, but do **NOT** click request yet.
2. Open **Tab B** (Incognito window recommended so sessions don't clash), log in using the **`🚗 Driver Demo`** button (Autofills `driver_eco@BharatOne.com` representing Sarah).
3. In Tab B, click the toggle to mark Sarah's status as **`🟢 ONLINE`**.
4. Return to Tab A (Rider) and click **Request BharatOne**.
5. Look at Tab B (Driver): An **Incoming Dispatch Offer** card flashes with a bright glowing outline, displaying the passenger's pickup location, dropoff location, and payout fare!
6. Click **Accept Offer** in Tab B:
   - Sarah is now matched. Tab A (Rider) instantly receives the update over WebSockets!
   - In Tab B, click **"I Have Arrived"**, **"Start Trip"**, and **"Complete Trip"** sequentially. Watch how the Passenger tab reacts immediately to each stage in real time, delivering a fully integrated ride-hailing experience!
