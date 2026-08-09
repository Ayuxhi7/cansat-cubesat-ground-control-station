/**
 * logger.js
 * Handles GCS terminal console logging, telemetry events, and diagnostic alerts.
 * Implements a maximum 100-entry log array with HH:MM:ss timestamps (newest first).
 */

console.log("GCS Module Loaded: logger.js");

// Centralized log storage (limited to 100 entries)
const consoleLogHistory = [];
const MAX_LOG_ENTRIES = 100;

/**
 * Appends a timestamped log to the GCS terminal console view.
 * @param {string} message - The diagnostic text message
 * @param {string} type - Log priority level: 'info' | 'success' | 'warning' | 'error' | 'boot'
 */
function logConsole(message, type = "info") {
    const consoleBody = document.getElementById("console-logs-body");
    if (!consoleBody) return;

    // Get current local system time (HH:MM:ss)
    const now = new Date();
    const timestamp = now.toTimeString().split(" ")[0];

    // Create log record object
    const logRecord = { timestamp, message, type };
    
    // Add to the front of the array (newest first)
    consoleLogHistory.unshift(logRecord);

    // Limit array to 100 entries
    if (consoleLogHistory.length > MAX_LOG_ENTRIES) {
        consoleLogHistory.pop();
    }

    // Render the log records
    renderConsoleLogs();
}

/**
 * Renders the stored log records inside the GCS terminal log window.
 */
function renderConsoleLogs() {
    const consoleBody = document.getElementById("console-logs-body");
    if (!consoleBody) return;

    // Clear current DOM rows
    consoleBody.innerHTML = "";

    // Generate new elements
    consoleLogHistory.forEach(log => {
        const item = document.createElement("div");
        item.className = `console-log-item log-${log.type}`;
        
        item.innerHTML = `
            <span class="log-timestamp">[${log.timestamp}]</span>
            <span class="log-text">${log.message}</span>
        `;
        
        consoleBody.appendChild(item);
    });
}

/**
 * Appends a critical system alert overlay to the faults panel.
 * @param {string} message - Alert description text
 * @param {string} level - Alert level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CRITICAL'
 */
function addAlert(message, level = "INFO") {
    const alertsLog = document.getElementById("alerts-log");
    if (!alertsLog) return;

    // Remove "nominal" placeholder if active
    const nominalAlert = alertsLog.querySelector(".alert-info");
    if (nominalAlert && nominalAlert.textContent.includes("ALL SYSTEM CIRCUITS NOMINAL")) {
        nominalAlert.remove();
    }

    const now = new Date();
    const timestamp = now.toTimeString().split(" ")[0];

    // Create alert element
    const alertItem = document.createElement("div");
    alertItem.className = `alert-item alert-${level.toLowerCase()} animate-alert-slide`;
    
    // Map icons depending on level
    let icon = "⚙️";
    if (level === "SUCCESS") icon = "✅";
    if (level === "WARNING") icon = "⚠️";
    if (level === "ERROR") icon = "❌";
    if (level === "CRITICAL") icon = "🚨";

    // Set structure including close/dismiss button
    alertItem.innerHTML = `
        <span class="alert-icon-text">${icon} [${timestamp}] ${message}</span>
        <button class="alert-dismiss-btn" aria-label="Dismiss alert">&times;</button>
    `;

    // Bind dismiss click action
    const dismissBtn = alertItem.querySelector(".alert-dismiss-btn");
    dismissBtn.addEventListener("click", () => {
        alertItem.style.opacity = "0";
        alertItem.style.transform = "translateX(50px)";
        setTimeout(() => {
            alertItem.remove();
            
            // If empty, restore nominal status
            if (alertsLog.children.length === 0) {
                const nominal = document.createElement("div");
                nominal.className = "alert-item alert-info";
                nominal.textContent = "ALL SYSTEM CIRCUITS NOMINAL";
                alertsLog.appendChild(nominal);
            }
        }, 300);
    });

    // Add alert to top of the stack
    alertsLog.insertBefore(alertItem, alertsLog.firstChild);

    // Auto-scroll alerts log to the top
    alertsLog.scrollTop = 0;
}
