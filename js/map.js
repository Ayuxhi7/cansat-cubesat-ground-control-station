/**
 * Leaflet/OpenStreetMap payload tracker. It displays the most recent GPS point,
 * keeps a bounded trajectory history, and presents live coordinates to the operator.
 */
const GCSMap = (() => {
    let map;
    let marker;
    let track;
    let info;
    const points = [];
    const initialPosition = [28.6139, 77.2090];

    function setInfo(text) {
        if (info) info.getContainer().textContent = text;
    }

    function init() {
        const container = document.getElementById("gps-map");
        if (!window.L) {
            container.innerHTML = '<div class="orientation-placeholder"><span>Map library unavailable. Connect to the internet, then reload the dashboard.</span></div>';
            logConsole("Leaflet failed to load; GPS tracking map is unavailable.", "error");
            return false;
        }
        if (map) return true;

        container.innerHTML = "";
        map = L.map(container, { zoomControl: true }).setView(initialPosition, 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors"
        }).addTo(map);
        track = L.polyline([], { color: "#00e5ff", weight: 3, opacity: 0.9 }).addTo(map);
        info = L.control({ position: "bottomleft" });
        info.onAdd = () => {
            const element = L.DomUtil.create("div", "map-telemetry-hud");
            element.textContent = "GPS: awaiting telemetry";
            return element;
        };
        info.addTo(map);
        setTimeout(() => map.invalidateSize(), 100);
        return true;
    }

    function update(packet) {
        if (!map || !packet.gps || !Number.isFinite(+packet.latitude) || !Number.isFinite(+packet.longitude)) return;
        const position = [+packet.latitude, +packet.longitude];
        if (!marker) {
            marker = L.marker(position, { title: "CanSat payload" }).addTo(map).bindPopup("CanSat payload");
            map.setView(position, 16);
        } else {
            marker.setLatLng(position);
            map.panTo(position, { animate: true, duration: 0.35 });
        }
        points.push(position);
        if (points.length > 300) points.shift();
        track.setLatLngs(points);
        setInfo(`GPS: ${position[0].toFixed(6)}, ${position[1].toFixed(6)} | TRACK: ${points.length} points`);
    }

    function reset() {
        points.length = 0;
        if (track) track.setLatLngs([]);
        if (marker && map) {
            map.removeLayer(marker);
            marker = null;
        }
        if (map) {
            map.setView(initialPosition, 14);
            setInfo("GPS: awaiting telemetry");
        }
    }

    return { init, update, reset };
})();
