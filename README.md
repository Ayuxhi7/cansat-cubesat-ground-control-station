# 🛰️ CanSat Ground Control Station (GCS)

A web-based Ground Control Station for monitoring, visualizing, and controlling a CanSat mission using simulated and serial telemetry data.

> Developed as an internship project with **India Space Lab (ISL)** during June–July 2026.

![CanSat GCS](screenshots/gcs-dashboard.png)

---

## 🚀 Overview

The **CanSat Ground Control Station (GCS)** provides a centralized interface for monitoring mission telemetry, tracking the CanSat's position and orientation, visualizing flight data, logging telemetry, and issuing mission commands.

The system includes a **physics-based telemetry simulator** for testing and demonstration, along with support for receiving telemetry through a serial connection.

The project was designed as an educational and simulation-oriented GCS rather than flight-certified software.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📡 Telemetry | Simulated and serial telemetry input |
| 📊 Visualization | Real-time flight telemetry charts |
| 🗺️ GPS | Live coordinates and flight-path tracking |
| 🧭 Orientation | Roll, pitch and yaw visualization |
| 🚨 Mission Commands | Separation and emergency command interface |
| 📹 Video | Browser camera selection and live feed |
| 💾 Data Logging | Telemetry tables and CSV export |
| 📈 Graph Export | Export telemetry graphs as images |
| 🧪 Simulation | Physics-based CanSat flight simulation |

---

## 📊 Mission Dashboard

The GCS provides a centralized mission dashboard containing:

- Mission status
- Telemetry monitoring
- System health indicators
- Start/Stop telemetry controls
- Reset and synchronization controls
- Mission console
- Telemetry packet monitoring
- Data export controls

---

## 📡 Telemetry Monitoring

The project includes a physics-based telemetry simulator capable of demonstrating different CanSat flight phases:

```text
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
