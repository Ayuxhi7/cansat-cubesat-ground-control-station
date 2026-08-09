# Internship Project Report: CanSat Ground Control Station (GCS)

* **Project Name**: CanSat Ground Control Station (GCS)
* **Student Name**: Ayushi Bargali
* **Institute Name**: KCC Institute of Technology & Management, Greater Noida
* **Roll No.**: 2504921520067
* **Enrollment No.**: ISL-420638
* **Internship Period**: 17 June – 31 July 2026
* **Organization**: India Space Lab (ISL)

---


## Purpose

This single-page Ground Control Station (GCS) supports a CanSat mission by ingesting telemetry, monitoring flight health, displaying location and attitude, issuing mission commands, and exporting mission data. The implementation follows the CanSat assignment PDF; the module order is used only to organize development.

## Requirements coverage

| PDF requirement | Implementation |
| --- | --- |
| Mission dashboard and control bar | Responsive HTML/CSS dashboard with start/stop, reset, sync, calibration, health, and export controls. |
| Mission controls | Confirmation-protected separation, emergency parachute, and redundant activation commands. |
| Continuous telemetry | Physics-based simulator and optional Web Serial receiver accepting JSON or CSV packets. |
| Fault monitoring | Live four-digit descent-rate, GPS, separation, and parachute indicator. |
| Five real-time plots | Chart.js altitude, temperature, pressure, descent-rate, and battery charts. |
| GPS tracking | Leaflet/OpenStreetMap marker, coordinates, and bounded 300-point trajectory. |
| Orientation | Canvas artificial horizon using roll, pitch, and yaw. |
| Video | Browser camera selection and start/stop feed. |
| Data management | Packet table, 100-entry console, CSV export, and combined graph PNG export. |

## How to Run & Test

1. **Launcher**: Double-click `Launch_GCS.bat` to open the Ground Control Station dashboard in your default web browser.
2. **Internet Connection**: Ensure your machine has an active internet connection to load external Leaflet maps and Chart.js dependencies.
3. **Start Telemetry**: Keep the telemetry connection source selector on **SIMULATOR - Physics Engine** and click **START TELEMETRY** to initialize the flight.
4. **Observe Flight Phases**: Observe the metrics panel updates. You will see the altitude climb during ascent, separation trigger at apogee (700m), descent speed adjustments, and landing confirmation.
5. **Verify Subsystems**:
   - Check the **GPS Map** to see the red flight path updates around Haldwani.
   - Check the **Real-Time Telemetry Plots** updating instantly on the second row.
   - Check the **Orientation Gauge** rendering roll, pitch, and yaw canvas tilt.
   - Select your camera and click **START VIDEO** to allow browser camera access and verify the live webcam card.
6. **Trigger Critical Commands**: Click **MANUAL SEPARATION** and **DEPLOY EMERGENCY PARACHUTE** buttons. Confirm the browser prompt dialogs and monitor warning logs.
7. **Diagnostic Error Bytes**: Watch the 4-digit binary indicators (`digit-1` to `digit-4`) update live (e.g., descent rate flags, GPS flags, and parachute indicators).
8. **Export Data**: Click **EXPORT LOGS** to download the CSV telemetry database, and click **EXPORT GRAPHS** to save a graphic snapshot of the charts.


## Serial telemetry format

The GCS accepts a newline-delimited JSON telemetry object. A CSV packet is also accepted in this order:

`packet,altitude,descentRate,temperature,pressure,battery,latitude,longitude,roll,pitch,yaw`

Example JSON packet:

```json
{"packet":1,"altitude":125.5,"descentRate":0,"temperature":26.3,"pressure":99828,"battery":8.39,"latitude":28.613918,"longitude":77.209022,"roll":4.8,"pitch":-2.3,"yaw":12,"gps":true}
```

## Serial command format

For a connected CanSat, command messages are newline-delimited JSON. Firmware must parse this format and respond using the telemetry protocol.

```json
{"type":"command","command":"MANUAL_SEPARATION","timestamp":"2026-07-23T00:00:00.000Z","missionTime":32,"packet":8}
```

Supported commands are `MANUAL_SEPARATION`, `EMERGENCY_PARACHUTE`, and `REDUNDANT_ACTIVATION`.

## Verification performed

- JavaScript syntax checks on every module.
- DOM ID and chart-canvas reference checks.
- CSS brace-balance check.
- Sample telemetry JSON validation.

Hardware verification remains necessary before flight use: validate the exact serial protocol, baud rate, sensors, command acknowledgements, GPS lock, camera permission, and recovery mechanisms with the supplied microcontroller kit.

## Demonstration Video

A professional video walkthrough demonstrating the functional features of this Ground Control Station is included in the package:
* **Location**: `Demonstration/CanSat_GCS_Demonstration.mp4`
* **Content Covered**:
  - Launching the dashboard using `Launch_GCS.bat`.
  - Activating the telemetry simulation stream and watching real-time plots.
  - Verifying coordinates path tracking on the GPS Map.
  - Verifying attitude pitch and roll on the Artificial Horizon canvas.
  - Initiating critical command separation and emergency parachute prompts.
  - Syncing clock times and resetting telemetry packet logs.

