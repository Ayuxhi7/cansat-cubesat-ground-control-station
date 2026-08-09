# 🛰️ CanSat Ground Control Station (GCS)

A web-based **Ground Control Station (GCS)** for monitoring, visualizing, and controlling a CanSat mission using simulated and serial telemetry data.

Developed as an internship project with **India Space Lab (ISL)** during June–July 2026.

---

## 🚀 Overview

The CanSat Ground Control Station provides a centralized interface for monitoring mission telemetry, tracking the CanSat's location and orientation, visualizing flight parameters, logging mission data, and issuing mission commands.

The system includes a **physics-based telemetry simulator** for testing different flight phases without requiring physical hardware. It also includes support for receiving telemetry through a serial connection.

The project is designed for **educational, simulation, and demonstration purposes**.

---

## ✨ Features

### 📊 Mission Dashboard

- Responsive Ground Control Station interface
- Mission status monitoring
- Start/Stop telemetry controls
- Reset and synchronization controls
- System health indicators
- Mission console
- Telemetry packet monitoring

### 📡 Telemetry Monitoring

- Physics-based CanSat flight simulation
- Serial telemetry input
- JSON telemetry packets
- CSV telemetry support
- Live telemetry monitoring
- Mission status tracking

### 📈 Real-Time Telemetry Visualization

The dashboard provides real-time visualization of:

- Altitude
- Temperature
- Pressure
- Descent rate
- Battery level

Charts are implemented using **Chart.js**.

### 🗺️ GPS Tracking

The GCS provides GPS-based mission tracking including:

- Latitude and longitude display
- Live position tracking
- Flight-path visualization
- Bounded trajectory history
- Map-based mission monitoring

GPS visualization uses **Leaflet** and **OpenStreetMap**.

### 🧭 Orientation Monitoring

An artificial-horizon interface provides visualization of:

- Roll
- Pitch
- Yaw

Orientation data is rendered using **HTML Canvas**.

### 🚨 Mission Controls

The interface provides confirmation-protected controls for mission commands including:

```text
MANUAL_SEPARATION
EMERGENCY_PARACHUTE
REDUNDANT_ACTIVATION

Example command packet:

{
  "type": "command",
  "command": "MANUAL_SEPARATION",
  "timestamp": "2026-07-23T00:00:00.000Z",
  "missionTime": 32,
  "packet": 8
}

> These controls are intended for simulation and demonstration. They are not flight-certified safety systems.



📹 Video Monitoring

The dashboard supports:

Browser camera selection

Live camera feed

Mission observation through the GCS interface


💾 Data Management

Mission data can be monitored and exported through the dashboard.

Supported functionality includes:

Live telemetry packet table

Mission console

CSV telemetry export

Graph/image export



---

🧪 Telemetry Simulation

The built-in physics-based simulator demonstrates different stages of a CanSat mission:

Launch
   ↓
Ascent
   ↓
Apogee
   ↓
Separation
   ↓
Descent
   ↓
Landing

During the simulation, telemetry values are continuously generated and displayed throughout the mission.

The dashboard updates:

Altitude

Descent rate

Temperature

Pressure

Battery

GPS position

Roll

Pitch

Yaw

Mission status



---

🔄 System Workflow

┌─────────────────────┐
                 │   Telemetry Source  │
                 └──────────┬──────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
        ┌────────▼────────┐   ┌────────▼────────┐
        │ Physics         │   │ Serial          │
        │ Simulator       │   │ Telemetry       │
        └────────┬────────┘   └────────┬────────┘
                 │                     │
                 └──────────┬──────────┘
                            ▼
                  ┌──────────────────┐
                  │ Telemetry Parser │
                  └────────┬─────────┘
                           ▼
                  ┌──────────────────┐
                  │   GCS Dashboard  │
                  └────────┬─────────┘
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
     GPS Tracking     Orientation      Real-Time
                      Monitoring        Telemetry
                                        Charts
          │                │                 │
          └────────────────┼─────────────────┘
                           ▼
                    Mission Logging
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                CSV Export    Graph Export


---

📡 Telemetry Protocol

The GCS accepts newline-delimited JSON telemetry packets.

Example JSON Packet

{
  "packet": 1,
  "altitude": 125.5,
  "descentRate": 0,
  "temperature": 26.3,
  "pressure": 99828,
  "battery": 8.39,
  "latitude": 28.613918,
  "longitude": 77.209022,
  "roll": 4.8,
  "pitch": -2.3,
  "yaw": 12,
  "gps": true
}

CSV Format

packet,altitude,descentRate,temperature,pressure,battery,latitude,longitude,roll,pitch,yaw


---

🚨 Mission Command Protocol

The GCS supports the following mission commands:

MANUAL_SEPARATION
EMERGENCY_PARACHUTE
REDUNDANT_ACTIVATION

Commands are represented using structured JSON packets.

Example:

{
  "type": "command",
  "command": "MANUAL_SEPARATION",
  "timestamp": "2026-07-23T00:00:00.000Z",
  "missionTime": 32,
  "packet": 8
}

The interface uses confirmation dialogs for critical mission commands to reduce accidental activation during operation.


---

▶️ How to Run

Windows

1. Clone the repository

git clone https://github.com/Ayuxhi7/cansat-cubesat-ground-control-station.git

2. Open the project directory

cd cansat-cubesat-ground-control-station

3. Launch the GCS

Run:

Launch_GCS.bat

This opens the Ground Control Station in the default web browser.

Alternatively, open:

index.html

directly in a supported browser.


---

🧪 Start the Telemetry Simulator

Inside the GCS:

1. Select:



SIMULATOR - Physics Engine

2. Click:



START TELEMETRY

3. Monitor the simulated mission through the dashboard.



The simulator demonstrates:

Ascent → Apogee → Separation → Descent → Landing


---

🖥️ Interface

Screenshots of the Ground Control Station interface are available in the:

screenshots/

directory.

The screenshots demonstrate the dashboard, telemetry visualization, GPS tracking, orientation monitoring, and mission-control interface.


---

🛠️ Technologies Used

Technology	Purpose

HTML5	GCS structure and interface
CSS3	Responsive dashboard styling
JavaScript	Application logic and telemetry processing
Chart.js	Real-time telemetry charts
Leaflet	GPS/map visualization
OpenStreetMap	Map data
Web Serial API	Serial telemetry communication
HTML Canvas	Orientation visualization
JSON	Telemetry and command packets
CSV	Telemetry data export



---

📁 Project Structure

cansat-cubesat-ground-control-station/
│
├── css/
│   └── ...
│
├── data/
│   └── ...
│
├── js/
│   └── ...
│
├── screenshots/
│   └── ...
│
├── index.html
├── Launch_GCS.bat
│
├── README.md
├── PROJECT_DOCUMENTATION.md
└── PROJECT_DOCUMENTATION.pdf


---

🔍 Verification

The following checks were performed during development:

JavaScript syntax validation

DOM element and reference checks

Chart configuration checks

CSS structure validation

Sample telemetry JSON validation


Hardware Verification

Hardware-level flight verification was not performed.

Actual deployment would require testing and validation with:

Target microcontroller

Sensors

GPS module

Serial communication hardware

Command acknowledgement system

Power system

Recovery mechanisms

Actual CanSat hardware



---

👨‍💻 My Contribution

This project was developed as part of my internship with India Space Lab (ISL) during June–July 2026.

My work focused on the development and organization of the Ground Control Station, including:

GCS dashboard interface

Telemetry visualization

Physics-based telemetry simulation

Mission monitoring

GPS tracking

Orientation visualization

Mission command interface

Telemetry logging

Data export

Project documentation



---

🎯 Project Goals

The project was developed with the following goals:

1. Build a functional CanSat Ground Control Station.


2. Simulate realistic mission telemetry.


3. Visualize flight parameters in real time.


4. Monitor GPS position and spacecraft orientation.


5. Demonstrate mission command interfaces.


6. Provide telemetry logging and export functionality.


7. Create a foundation that can be integrated with real CanSat hardware.




---

📚 Documentation

Detailed technical documentation is available in:

PROJECT_DOCUMENTATION.md

PROJECT_DOCUMENTATION.pdf



---

⚠️ Disclaimer

This project is intended for educational, simulation, and demonstration purposes.

The simulated telemetry and mission-control interface should not be considered flight-certified software.

Actual CanSat deployment requires hardware integration, communication testing, safety validation, command verification, and recovery-system testing.


---

⭐ Project

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.
