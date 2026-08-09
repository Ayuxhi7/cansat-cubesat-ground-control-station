# 🛰️ CanSat Ground Control Station (GCS)

A web-based Ground Control Station designed to monitor, visualize, and control a CanSat mission through simulated and serial telemetry data.

## 📌 Overview

This project was developed during my internship with **India Space Lab (ISL)**.

The Ground Control Station (GCS) provides a centralized interface for monitoring mission telemetry, tracking the CanSat's location and orientation, visualizing flight data, and issuing mission-critical commands.

The system includes a physics-based telemetry simulator as well as support for receiving telemetry through a serial connection.

## ✨ Features

### Mission Dashboard

* Responsive mission monitoring dashboard
* Start/Stop telemetry controls
* Reset and synchronization controls
* System health monitoring
* Telemetry and mission-log export

### 📡 Telemetry Monitoring

* Physics-based CanSat flight simulation
* Support for serial telemetry input
* JSON and CSV telemetry packet formats
* Live packet monitoring
* Mission status tracking

### 📊 Real-Time Telemetry Visualization

The dashboard provides real-time plots for:

* Altitude
* Temperature
* Pressure
* Descent rate
* Battery level

Charts are implemented using **Chart.js**.

### 🗺️ GPS Tracking

* Live GPS coordinate display
* Flight-path visualization
* Map-based location tracking
* Bounded trajectory history

GPS visualization is implemented using **Leaflet** and **OpenStreetMap**.

### 🧭 Orientation Monitoring

The system includes an artificial-horizon interface for visualizing:

* Roll
* Pitch
* Yaw

Orientation data is rendered through a browser canvas.

### 🚨 Mission Controls

The GCS provides confirmation-protected controls for:

* Manual separation
* Emergency parachute deployment
* Redundant activation

These controls are intended to demonstrate the command interface required for a CanSat mission.

### 📹 Video Monitoring

The dashboard supports browser camera selection and a live video feed for mission monitoring.

### 💾 Data Management

* Live telemetry packet table
* Mission console
* CSV telemetry export
* Graph image export

## 🏗️ System Workflow

```text
Telemetry Source
      │
      ├── Physics Simulator
      │
      └── Serial Telemetry
              │
              ▼
        Telemetry Parser
              │
              ▼
       GCS Dashboard
        │     │     │
        │     │     ├── GPS Tracking
        │     │
        │     ├── Orientation
        │     │
        │     ├── Real-Time Charts
        │     │
        │     └── Mission Controls
        │
        ▼
     Data Logging
        │
        ├── CSV Export
        └── Graph Export
```

## 🧪 Telemetry Protocol

The GCS accepts newline-delimited JSON telemetry packets.

Example:

```json
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
```

CSV telemetry packets are also supported in the following format:

```text
packet,altitude,descentRate,temperature,pressure,battery,latitude,longitude,roll,pitch,yaw
```

## 🎮 Mission Command Protocol

The GCS supports the following mission commands:

* `MANUAL_SEPARATION`
* `EMERGENCY_PARACHUTE`
* `REDUNDANT_ACTIVATION`

Example command:

```json
{
  "type": "command",
  "command": "MANUAL_SEPARATION",
  "timestamp": "2026-07-23T00:00:00.000Z",
  "missionTime": 32,
  "packet": 8
}
```

## ▶️ How to Run

### 1. Launch the GCS

Run:

```text
Launch_GCS.bat
```

This opens the Ground Control Station in the default web browser.

### 2. Start the Telemetry Simulator

Select:

```text
SIMULATOR - Physics Engine
```

and click:

```text
START TELEMETRY
```

### 3. Monitor the Mission

The simulator demonstrates different flight phases including:

* Ascent
* Apogee
* Separation
* Descent
* Landing

During the simulation, telemetry charts, GPS tracking, orientation data, and system indicators update in real time.

### 4. Test Mission Controls

The interface provides confirmation-protected controls for the critical mission commands.

### 5. Export Mission Data

The dashboard provides options to export:

* Telemetry logs as CSV
* Graph snapshots as PNG

## 🔍 Verification

The following verification checks were performed during development:

* JavaScript syntax validation
* DOM element and chart reference checks
* CSS structure validation
* Sample telemetry JSON validation

Hardware-level flight verification was not performed. Actual deployment would require validation with the target microcontroller, sensors, GPS module, serial configuration, command acknowledgements, and recovery mechanisms.

## 🛠️ Technologies Used

* HTML5
* CSS3
* JavaScript
* Chart.js
* Leaflet
* OpenStreetMap
* Web Serial API
* HTML Canvas
* JSON
* CSV

## 📁 Project Structure

```text
cansat-cubesat-ground-control-station/
│
├── README.md
├── Launch_GCS.bat
├── HTML/
├── CSS/
├── JavaScript/
├── Data/
├── Documentation/
└── Demonstration/
```

> The exact directory structure may vary depending on the final project organization.

## 🎥 Demonstration

A demonstration video is included with the project files and showcases:

* Launching the GCS
* Starting the telemetry simulator
* Real-time telemetry plots
* GPS flight-path tracking
* Artificial-horizon orientation monitoring
* Mission command controls
* Telemetry packet logging
* Dashboard controls

## 👩‍💻 Project Context

Developed as part of an internship project with **India Space Lab (ISL)** during June–July 2026.

### My Work

My work on this project included the development and organization of the Ground Control Station interface, telemetry visualization, mission monitoring features, GPS and orientation displays, and mission-control functionality.

## ⚠️ Disclaimer

This project is intended for educational, simulation, and demonstration purposes.

The simulated telemetry and mission-control interface should not be considered flight-certified software. Hardware and safety validation are required before use in an actual CanSat mission.
