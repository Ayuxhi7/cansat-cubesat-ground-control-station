/** Telemetry transport, simulator, packet history, and mission fault logic. */
const GCS = (() => {
    const state = { running: false, startedAt: null, timer: null, packetCount: 0, lastPacketNumber: null, lost: 0, rate: 0, arrivalTimes: [], simTime: 0, phase: "PRE-LAUNCH",
        packets: [], listeners: [], serialPort: null, serialReader: null, serialWriter: null, commandHistory: [],
        separation: false, parachute: false, redundant: false, lastPacketAt: null };

    const emit = (packet) => state.listeners.forEach(listener => listener(packet, state));
    const onPacket = (listener) => state.listeners.push(listener);
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    /**
     * Physics-inspired mission model. Four simulated seconds pass per packet, so
     * an operator can observe a complete launch-to-recovery sequence quickly.
     */
    function makeSimulatorPacket() {
        const t = state.simTime;
        const peakAltitude = 850;
        let altitude = 0, descentRate = 0, phase = "PRE-LAUNCH";
        if (t < 8) phase = "PRE-LAUNCH";
        else if (t < 48) { phase = "ASCENT"; const progress = (t - 8) / 40; altitude = peakAltitude * progress * progress; }
        else if (t < 52) { phase = "APOGEE"; altitude = peakAltitude; }
        else if (t < 56) { phase = "SEPARATION"; altitude = peakAltitude - 8 * (t - 52); descentRate = 8; }
        else if (t < 148) { phase = "DESCENT"; descentRate = 8.7 + Math.sin(t / 7) * 0.45; altitude = Math.max(0, peakAltitude - 32 - descentRate * (t - 56)); }
        else if (t < 156) phase = "LANDING";
        else phase = "RECOVERY";
        const drift = Math.max(0, t - 8);
        return {
            packet: state.packetCount + 1, met: t,
            timestamp: new Date().toISOString(), altitude: +altitude.toFixed(1),
            descentRate: +descentRate.toFixed(1), temperature: +(27 - altitude * 0.0065 + Math.sin(t / 9)).toFixed(1),
            pressure: Math.round(101325 * Math.pow(1 - (2.25577e-5 * altitude), 5.25588)),
            battery: +(8.4 - t * 0.003).toFixed(2), latitude: +(28.6139 + drift * 0.000018).toFixed(6),
            longitude: +(77.2090 + drift * 0.000022).toFixed(6), roll: +(Math.sin(t / 5) * 18).toFixed(1),
            pitch: +(Math.cos(t / 6) * 14).toFixed(1), yaw: +((t * 3) % 360).toFixed(1), gps: true,
            rssi: Math.round(-61 - Math.abs(Math.sin(t / 13)) * 18), latency: Math.round(42 + Math.abs(Math.sin(t / 8)) * 18), phase
        };
    }

    function parsePacket(raw) {
        if (typeof raw === "object") return raw;
        const text = String(raw).trim();
        if (!text) return null;
        try { return JSON.parse(text); } catch (_) {
            const p = text.split(",").map(v => v.trim());
            if (p.length < 11) throw new Error("Expected JSON or CSV with 11 telemetry fields");
            return { packet: +p[0], altitude: +p[1], descentRate: +p[2], temperature: +p[3], pressure: +p[4], battery: +p[5], latitude: +p[6], longitude: +p[7], roll: +p[8], pitch: +p[9], yaw: +p[10], gps: true };
        }
    }

    function ingest(raw) {
        let packet;
        try { packet = parsePacket(raw); } catch (error) { logConsole(`Packet rejected: ${error.message}`, "error"); return; }
        if (!packet) return;
        packet.packet = Number.isFinite(+packet.packet) ? +packet.packet : state.packetCount + 1;
        packet.met ??= Math.floor((Date.now() - state.startedAt) / 1000);
        packet.timestamp ??= new Date().toISOString(); packet.gps = packet.gps !== false;
        if (state.lastPacketNumber !== null && packet.packet > state.lastPacketNumber + 1) state.lost += packet.packet - state.lastPacketNumber - 1;
        state.lastPacketNumber = packet.packet;
        state.packetCount++; state.lastPacketAt = Date.now();
        state.arrivalTimes.push(state.lastPacketAt); state.arrivalTimes = state.arrivalTimes.filter(time => time >= state.lastPacketAt - 1000); state.rate = state.arrivalTimes.length;
        state.packets.push(packet); if (state.packets.length > 500) state.packets.shift();
        if (packet.phase && packet.phase !== state.phase) {
            state.phase = packet.phase;
            if (packet.phase === "SEPARATION") state.separation = true;
            const messages = { ASCENT: "Launch detected: mission entered ascent.", APOGEE: "Apogee detected: awaiting payload separation.", SEPARATION: "Payload separation confirmed.", DESCENT: "Parachute descent telemetry established.", LANDING: "Landing detected: altitude is zero.", RECOVERY: "Recovery mode active: mission complete." };
            if (messages[packet.phase]) { logConsole(messages[packet.phase], packet.phase === "LANDING" ? "success" : "info"); addAlert(messages[packet.phase], packet.phase === "SEPARATION" || packet.phase === "LANDING" ? "SUCCESS" : "INFO"); }
        }
        emit(packet);
    }

    function startSimulation() { state.timer = setInterval(() => { ingest(makeSimulatorPacket()); state.simTime += 4; }, 1000); ingest(makeSimulatorPacket()); state.simTime += 4; }
    async function start() {
        if (state.running) return; state.running = true; state.startedAt = Date.now();
        const port = document.getElementById("com-port").value;
        if (port === "SIMULATOR") { startSimulation(); logConsole("Simulator telemetry stream started", "success"); return; }
        if (!navigator.serial) { logConsole("Web Serial requires Chrome/Edge. Use SIMULATOR for this browser.", "warning"); stop(); return; }
        try {
            state.serialPort = await navigator.serial.requestPort();
            await state.serialPort.open({ baudRate: +document.getElementById("baud-rate").value });
            state.serialWriter = state.serialPort.writable.getWriter();
            const decoder = new TextDecoderStream(); state.serialPort.readable.pipeTo(decoder.writable);
            state.serialReader = decoder.readable.getReader(); logConsole("Serial telemetry link connected", "success");
            let buffer = ""; while (state.running) { const { value, done } = await state.serialReader.read(); if (done) break; buffer += value; const lines = buffer.split(/\r?\n/); buffer = lines.pop(); lines.forEach(ingest); }
        } catch (error) { logConsole(`Serial connection failed: ${error.message}`, "error"); stop(); }
    }
    async function stop() { state.running = false; clearInterval(state.timer); state.timer = null; if (state.serialReader) { await state.serialReader.cancel().catch(() => {}); state.serialReader = null; } if (state.serialWriter) { state.serialWriter.releaseLock(); state.serialWriter = null; } if (state.serialPort) { await state.serialPort.close().catch(() => {}); state.serialPort = null; } logConsole("Telemetry stream stopped", "warning"); }
    /**
     * Sends a documented newline-delimited JSON command to a connected CanSat.
     * In simulator mode the same command updates mission state locally.
     */
    async function sendCommand(command) {
        const record = {
            command,
            timestamp: new Date().toISOString(),
            missionTime: state.simTime,
            packet: state.packetCount,
            status: "PENDING"
        };
        state.commandHistory.unshift(record);
        const updates = { MANUAL_SEPARATION: "separation", EMERGENCY_PARACHUTE: "parachute", REDUNDANT_ACTIVATION: "redundant" };
        if (!updates[command]) throw new Error(`Unknown command: ${command}`);
        try {
            if (state.serialWriter) {
                const payload = JSON.stringify({
                    type: "command",
                    command,
                    timestamp: record.timestamp,
                    missionTime: record.missionTime,
                    packet: record.packet
                }) + "\n";
                await state.serialWriter.write(new TextEncoder().encode(payload));
                record.status = "SENT";
            } else {
                record.status = "SIMULATED";
            }
            state[updates[command]] = true;
            return record;
        } catch (error) { record.status = "FAILED"; record.error = error.message; throw error; }
    }
    function reset() { stop(); Object.assign(state, { startedAt: null, packetCount: 0, lastPacketNumber: null, lost: 0, rate: 0, arrivalTimes: [], packets: [], simTime: 0, phase: "PRE-LAUNCH", separation: false, parachute: false, redundant: false, commandHistory: [], lastPacketAt: null }); }
    return { state, onPacket, start, stop, reset, ingest, sendCommand, clamp };
})();
