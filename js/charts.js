/**
 * Real-time Chart.js controller for the five telemetry visualizations required
 * by the CanSat brief. Each chart holds the latest 60 packets only.
 */
const GCSCharts = (() => {
    const charts = {};
    const configs = [
        { id: "altitude", field: "altitude", label: "Altitude (m)", color: "#00e5ff" },
        { id: "temperature", field: "temperature", label: "Temperature (°C)", color: "#ff9100" },
        { id: "pressure", field: "pressure", label: "Pressure (Pa)", color: "#a78bfa" },
        { id: "descent-rate", field: "descentRate", label: "Descent rate (m/s)", color: "#ffea00" },
        { id: "battery", field: "battery", label: "Battery voltage (V)", color: "#00e676" }
    ];

    function missionTime(seconds) {
        return new Date((Number(seconds) || 0) * 1000).toISOString().slice(11, 19);
    }

    function init() {
        if (!window.Chart) {
            document.querySelectorAll(".chart-placeholder-overlay").forEach(overlay => {
                overlay.querySelector(".placeholder-main-text").textContent = "CHART LIBRARY UNAVAILABLE";
                overlay.querySelector(".placeholder-sub-text").textContent = "Connect to the internet, then reload the dashboard.";
            });
            logConsole("Chart.js failed to load; telemetry graphs are unavailable.", "error");
            return false;
        }

        configs.forEach(({ id, field, label, color }) => {
            const canvas = document.getElementById(`chart-${id}`);
            if (!canvas) return;
            charts[field] = new Chart(canvas, {
                type: "line",
                data: {
                    labels: [],
                    datasets: [{ label, data: [], borderColor: color, backgroundColor: `${color}22`, tension: 0.25, fill: true, pointRadius: 0, borderWidth: 2 }]
                },
                options: {
                    animation: false,
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { intersect: false, mode: "index" },
                    plugins: { legend: { labels: { color: "#e2e8f0" } } },
                    scales: {
                        x: { title: { display: true, text: "Mission elapsed time", color: "#7b8eaf" }, ticks: { color: "#7b8eaf", maxTicksLimit: 6 }, grid: { color: "#212d4d" } },
                        y: { ticks: { color: "#7b8eaf" }, grid: { color: "#212d4d" } }
                    }
                }
            });
        });
        return true;
    }

    function update(packet) {
        Object.entries(charts).forEach(([field, chart]) => {
            chart.data.labels.push(missionTime(packet.met));
            chart.data.datasets[0].data.push(packet[field]);
            if (chart.data.labels.length > 60) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            chart.update("none");
        });
        document.querySelectorAll(".chart-placeholder-overlay").forEach(overlay => {
            overlay.style.opacity = "0";
            overlay.style.visibility = "hidden";
        });
    }

    function reset() {
        Object.values(charts).forEach(chart => {
            chart.data.labels = [];
            chart.data.datasets[0].data = [];
            chart.update();
        });
        document.querySelectorAll(".chart-placeholder-overlay").forEach(overlay => {
            overlay.style.opacity = "";
            overlay.style.visibility = "";
        });
    }

    /** Exports the complete five-plot telemetry snapshot as one PNG artifact. */
    function exportImage() {
        const chartList = Object.values(charts);
        if (!chartList.length || !chartList[0].data.labels.length) {
            addAlert("No graph data available for export.", "WARNING");
            return;
        }
        const cellWidth = 960;
        const cellHeight = 540;
        const output = document.createElement("canvas");
        output.width = cellWidth * 2;
        output.height = cellHeight * 3;
        const context = output.getContext("2d");
        context.fillStyle = "#0a0d16";
        context.fillRect(0, 0, output.width, output.height);
        chartList.forEach((chart, index) => {
            const x = (index % 2) * cellWidth;
            const y = Math.floor(index / 2) * cellHeight;
            context.drawImage(chart.canvas, x, y, cellWidth, cellHeight);
        });
        const link = document.createElement("a");
        link.href = output.toDataURL("image/png");
        link.download = "cansat-telemetry-graphs.png";
        link.click();
        logConsole("Five-plot telemetry graph snapshot exported.", "success");
    }

    return { init, update, reset, exportImage };
})();
