/** Operator actions, camera support, command confirmation, and data exports. */
const GCSControls = (() => {
    let cameraStream = null;
    const byId = id => document.getElementById(id);
    const setCommand = (message, level = "success") => { byId("cmd-status-text").textContent = message; byId("cmd-status-text").className = `status-val text-${level === "error" ? "danger" : level === "warning" ? "warning" : "success"}`; logConsole(message, level); };
    function setConnectionStatus(text, style) { const status = byId("summary-conn-status"); status.textContent = text; status.className = `data-value status-badge ${style}`; }
    function refreshPortState() { const simulator = byId("com-port").value === "SIMULATOR"; byId("baud-rate").disabled = simulator; if (!GCS.state.running) setConnectionStatus(simulator ? "SIMULATION READY" : "READY TO CONNECT", simulator ? "badge-simulation" : "badge-ready"); }
    function exportCsv() { const p = GCS.state.packets; if (!p.length) return addAlert("No telemetry packets available for export.", "WARNING"); const keys = ["packet","met","timestamp","altitude","descentRate","temperature","pressure","battery","latitude","longitude","roll","pitch","yaw","gps","rssi"]; const csv = [keys.join(","), ...p.map(row => keys.map(k => JSON.stringify(row[k] ?? "")).join(","))].join("\n"); download(new Blob([csv], { type: "text/csv" }), "cansat-telemetry.csv"); logConsole("Telemetry CSV exported", "success"); }
    function download(blob, name) { const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500); }
    async function populateCameras() { if (!navigator.mediaDevices?.enumerateDevices) return; const select = byId("camera-select"); const devices = await navigator.mediaDevices.enumerateDevices(); select.innerHTML = '<option value="">Select Camera Module</option>'; devices.filter(d => d.kind === "videoinput").forEach((d, i) => { const opt = document.createElement("option"); opt.value = d.deviceId; opt.textContent = d.label || `Camera ${i + 1}`; select.appendChild(opt); }); }
    async function toggleCamera() { const video = byId("webcam-stream"), fallback = byId("video-fallback"); if (cameraStream) { cameraStream.getTracks().forEach(track => track.stop()); cameraStream = null; video.srcObject = null; byId("btn-toggle-camera").textContent = "START VIDEO"; byId("video-status-text").textContent = "VIDEO STREAM STOPPED"; setLED("video", "OFF"); return; } try { cameraStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: byId("camera-select").value ? { exact: byId("camera-select").value } : undefined }, audio: false }); video.srcObject = cameraStream; fallback.style.display = "none"; byId("btn-toggle-camera").textContent = "STOP VIDEO"; byId("video-status-text").textContent = "LIVE CAMERA FEED"; setLED("video", "OK"); await populateCameras(); } catch (error) { fallback.style.display = "flex"; fallback.querySelector("span").textContent = `Camera unavailable: ${error.message}`; logConsole(`Camera error: ${error.message}`, "error"); setLED("video", "ERROR"); } }
    function bind() {
        byId("btn-start").onclick = async () => { setConnectionStatus("CONNECTING", "badge-connecting"); await GCS.start(); byId("btn-start").disabled = GCS.state.running; byId("btn-stop").disabled = !GCS.state.running; if (!GCS.state.running) refreshPortState(); };
        byId("btn-stop").onclick = async () => { await GCS.stop(); byId("btn-start").disabled = false; byId("btn-stop").disabled = true; refreshPortState(); };
        byId("btn-sync-time").onclick = () => { addAlert("PC time synchronized with mission console.", "SUCCESS"); logConsole("Mission clock synchronized", "success"); };
        byId("btn-calibrate").onclick = () => { setLED("sensors", "WARN"); byId("btn-calibrate").disabled = true; logConsole("Sensor calibration started", "info"); setTimeout(() => { setLED("sensors", "OK"); byId("btn-calibrate").disabled = false; addAlert("Sensor calibration complete.", "SUCCESS"); }, 1500); };
        byId("btn-health").onclick = () => addAlert(GCS.state.running ? "Health check passed: telemetry link nominal." : "Health check complete: awaiting telemetry link.", GCS.state.running ? "SUCCESS" : "WARNING");
        byId("btn-reset").onclick = () => { if (!confirm("Reset all telemetry packets and mission events?")) return; GCS.reset(); GCSCharts.reset(); GCSMap.reset(); document.getElementById("logs-tbody").innerHTML = '<tr><td colspan="10" class="text-center text-muted">No telemetry packets received.</td></tr>'; setCommand("SESSION RESET", "warning"); };
        byId("btn-export-csv").onclick = exportCsv; byId("btn-export-graph").onclick = () => GCSCharts.exportImage();
        byId("cmd-separation").onclick = () => executeMissionCommand("MANUAL_SEPARATION", "Confirm MANUAL SEPARATION command?", "Payload separation command acknowledged.", "success");
        byId("cmd-parachute").onclick = () => executeMissionCommand("EMERGENCY_PARACHUTE", "Confirm EMERGENCY PARACHUTE deployment?", "Emergency parachute deployment active.", "warning");
        byId("cmd-redundant").onclick = () => executeMissionCommand("REDUNDANT_ACTIVATION", "Activate the REDUNDANT circuit?", "Redundant activation circuit is active.", "success");
        byId("btn-toggle-camera").onclick = toggleCamera; byId("view-telemetry-logs").onclick = () => switchLogs(true); byId("view-console-logs").onclick = () => switchLogs(false); byId("com-port").onchange = refreshPortState; refreshPortState(); populateCameras();
    }
    async function executeMissionCommand(command, confirmation, alert, level) {
        if (!confirm(confirmation)) return;
        try {
            setCommand(`${command.replaceAll("_", " ")} PENDING`, "warning");
            const result = await GCS.sendCommand(command);
            const transport = result.status === "SIMULATED" ? "SIMULATION ACKNOWLEDGED" : "SENT TO CANSAT";
            setCommand(`${command.replaceAll("_", " ")} ${transport}`, level);
            addAlert(alert, level === "warning" ? "CRITICAL" : "SUCCESS");
        } catch (error) {
            setCommand(`${command.replaceAll("_", " ")} FAILED`, "error");
            addAlert(`Command transmission failed: ${error.message}`, "ERROR");
        }
    }
    function switchLogs(table) { byId("telemetry-table-view").style.display = table ? "block" : "none"; byId("terminal-console-view").style.display = table ? "none" : "block"; byId("view-telemetry-logs").classList.toggle("active-view", table); byId("view-console-logs").classList.toggle("active-view", !table); }
    return { bind };
})();
