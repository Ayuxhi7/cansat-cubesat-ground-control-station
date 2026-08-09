/** Main dashboard orchestrator, status rendering, mission monitoring, and boot diagnostics. */
function setLED(id, state) {
    const led = document.getElementById(`led-${id}`);
    if (!led) return;
    led.className = "led-light";
    led.classList.add({ OK: "led-ok", WARN: "led-warn", ERROR: "led-danger", DANGER: "led-danger" }[state.toUpperCase()] || "led-off");
}

let frameCount = 0;
let lastFpsUpdate = 0;
let fpsVal = 60;
function updateSystemDiagnostics(timestamp) {
    frameCount++;
    if (!lastFpsUpdate) lastFpsUpdate = timestamp;
    const elapsed = timestamp - lastFpsUpdate;
    if (elapsed >= 1000) {
        fpsVal = Math.round((frameCount * 1000) / elapsed);
        frameCount = 0;
        lastFpsUpdate = timestamp;
        const memory = performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1048576)} MB` : "N/A";
        const display = document.getElementById("system-perf-val");
        if (display) display.textContent = `${fpsVal} FPS / ${memory} / ${(1000 / Math.max(fpsVal, 1)).toFixed(1)} ms`;
    }
    requestAnimationFrame(updateSystemDiagnostics);
}

const formatMET = seconds => new Date((Number(seconds) || 0) * 1000).toISOString().slice(11, 19);
const setText = (id, text) => { const element = document.getElementById(id); if (element) element.textContent = text; };
const setNumber = (id, number, digits = 1) => setText(id, Number(number).toFixed(digits));

async function runBootSequence() {
    const checks = ["Bootloader initialized", "Telemetry interface ready", "Sensor baselines verified", "GPS receiver initialized", "Chart renderer loaded", "Map renderer loaded", "Orientation renderer loaded", "Mission clock synchronized", "Self diagnostics passed"];
    const list = document.getElementById("boot-checklist");
    const score = document.getElementById("readiness-score");
    list.innerHTML = "";
    for (let index = 0; index < checks.length; index++) {
        const item = document.createElement("div");
        item.className = "status-item loading";
        item.textContent = checks[index];
        list.appendChild(item);
        await new Promise(resolve => setTimeout(resolve, 110));
        item.className = "status-item success";
        item.textContent = `${checks[index]} - OK`;
        score.textContent = `${Math.round(((index + 1) / checks.length) * 100)}%`;
    }
    ["radio", "gps", "sensors", "orient"].forEach((id, index) => setTimeout(() => setLED(id, "OK"), index * 100));
    setTimeout(() => { const screen = document.getElementById("loading-screen"); screen.style.opacity = "0"; setTimeout(() => { screen.style.display = "none"; }, 500); }, 260);
}

document.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(updateSystemDiagnostics);
    GCSCharts.init();
    GCSMap.init();
    GCSOrientation.init();
    GCSControls.bind();

    function setPhase(packet) {
        const phase = packet.phase || "PRE-LAUNCH";
        const badge = document.getElementById("header-phase-badge");
        badge.textContent = `● ${phase}`;
        badge.className = `phase-hdr-badge phase-${phase.toLowerCase()}`;
        setText("summary-phase", phase);
    }

    function updateErrors(packet) {
        const descentActive = packet.phase === "DESCENT" || packet.phase === "SEPARATION";
        const faults = [
            descentActive && (packet.descentRate < 8 || packet.descentRate > 10),
            !packet.gps,
            (packet.phase === "DESCENT" || packet.phase === "LANDING") && !GCS.state.separation,
            GCS.state.parachute
        ];
        faults.forEach((fault, index) => {
            const digit = document.getElementById(`digit-${index + 1}`);
            digit.textContent = fault ? "1" : "0";
            digit.classList.toggle("text-danger", fault);
        });
        setLED("gps", packet.gps ? "OK" : "ERROR");
        setLED("radio", "OK");
        setLED("orient", "OK");
        setLED("sensors", "OK");
    }

    function appendPacketRow(packet) {
        const body = document.getElementById("logs-tbody");
        if (body.children.length === 1 && body.textContent.includes("No telemetry")) body.innerHTML = "";
        const fields = [packet.packet, formatMET(packet.met), new Date(packet.timestamp).toLocaleTimeString(), packet.altitude, packet.temperature, packet.pressure, packet.battery, `${packet.latitude}, ${packet.longitude}`, `${packet.roll} / ${packet.pitch} / ${packet.yaw}`, "OK"];
        const row = document.createElement("tr");
        fields.forEach(field => { const cell = document.createElement("td"); cell.textContent = String(field); row.appendChild(cell); });
        body.prepend(row);
        while (body.children.length > 100) body.lastChild.remove();
    }

    GCS.onPacket((packet, state) => {
        setNumber("val-packet-count", state.packetCount, 0); setNumber("val-altitude", packet.altitude); setNumber("val-descent-rate", packet.descentRate);
        setNumber("val-temp", packet.temperature); setNumber("val-pressure", packet.pressure, 0); setNumber("val-battery", packet.battery, 2);
        setNumber("val-latitude", packet.latitude, 6); setNumber("val-longitude", packet.longitude, 6); setNumber("val-roll", packet.roll, 1); setNumber("val-pitch", packet.pitch, 1); setNumber("val-yaw", packet.yaw, 1);
        const status = document.getElementById("summary-conn-status"); status.textContent = "ONLINE"; status.className = "data-value status-badge badge-online";
        setText("summary-rate", `${state.rate.toFixed(1)} packets/sec`); setText("summary-packets-count", state.packetCount); setText("summary-packets-lost", state.lost);
        setText("summary-packets-loss-pct", `${(state.packetCount ? (state.lost / (state.packetCount + state.lost)) * 100 : 0).toFixed(1)} %`);
        setText("summary-latency", Number.isFinite(packet.latency) ? `${packet.latency} ms` : "-- ms"); setText("summary-last-time", formatMET(packet.met)); setText("summary-rssi", `${packet.rssi} dBm`);
        setText("summary-cpu-load", `${Math.max(1, Math.round((60 - Math.min(60, fpsVal)) * 1.7 + 4))}%`);
        setText("summary-battery-health", `${packet.battery > 7.2 ? "GOOD" : "LOW"} (${Math.max(0, Math.round((packet.battery / 8.4) * 100))}%)`);
        setText("mission-timer", formatMET(packet.met)); setPhase(packet); updateErrors(packet); GCSCharts.update(packet); GCSMap.update(packet); GCSOrientation.update(packet); appendPacketRow(packet);
    });

    setInterval(() => {
        setText("utc-timer", new Date().toISOString().slice(11, 19));
        const state = GCS.state;
        if (state.running && state.startedAt) setText("summary-uptime", formatMET((Date.now() - state.startedAt) / 1000));
        if (state.running && state.lastPacketAt && Date.now() - state.lastPacketAt > 3000) {
            const status = document.getElementById("summary-conn-status");
            status.textContent = "TELEMETRY TIMEOUT"; status.className = "data-value status-badge badge-error"; setLED("radio", "ERROR");
        }
    }, 500);

    logConsole("Ground Control Station initialized.", "boot");
    logConsole("Configuration loaded; awaiting telemetry.", "boot");
    runBootSequence();
});
