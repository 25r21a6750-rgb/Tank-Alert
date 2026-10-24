const state = {
  level: 65,
  capacity: 1000,
  min: 20,
  max: 90,
  tankName: "Main Water Tank",
  alerts: []
};

const $ = id => document.getElementById(id);

const pageNames = {
  dashboard: "Dashboard",
  water: "Water Level",
  threshold: "Threshold Finder",
  alerts: "Alerts & Notifications",
  settings: "System Settings"
};

// Show ONLY the selected page
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  $("page-title").textContent = pageNames[pageId] || "Dashboard";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.go));
});

// Determine water condition using configured thresholds
function getStatus() {
  if (state.level < state.min) return "low";
  if (state.level > state.max) return "high";
  return "normal";
}

function litres() {
  return Math.round(state.capacity * state.level / 100);
}

function formatNumber(number) {
  return number.toLocaleString("en-IN");
}

function statusText(status) {
  return status === "low" ? "Low Water" :
         status === "high" ? "High Water" : "Normal";
}

// Create demo notifications
function addAlert(title, message, type) {
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  state.alerts.unshift({ title, message, type, time });
  state.alerts = state.alerts.slice(0, 30);
}

function checkWaterStatus() {
  const status = getStatus();
  const last = state.lastStatus;

  if (last !== status) {
    if (status === "low") {
      addAlert(
        "Low water warning",
        `Water level is ${state.level}%, below the minimum threshold of ${state.min}%.`,
        "warning"
      );
    } else if (status === "high") {
      addAlert(
        "High water warning",
        `Water level is ${state.level}%, above the maximum threshold of ${state.max}%.`,
        "danger"
      );
    } else if (last) {
      addAlert(
        "Water level normal",
        `Water level returned to the safe range at ${state.level}%.`,
        "normal"
      );
    }
  }

  state.lastStatus = status;
}

// Display an alert safely
function createAlertElement(alert) {
  const row = document.createElement("div");
  row.className = "alert-row";

  const symbol = document.createElement("div");
  symbol.className = "alert-symbol " +
    (alert.type === "danger" ? "danger" :
     alert.type === "warning" ? "warning" : "");

  symbol.textContent = alert.type === "danger" ? "!" :
                       alert.type === "warning" ? "↓" : "✓";

  const copy = document.createElement("div");
  copy.className = "alert-copy";

  const title = document.createElement("b");
  title.textContent = alert.title;

  const message = document.createElement("p");
  message.textContent = alert.message;

  const time = document.createElement("span");
  time.className = "alert-time";
  time.textContent = alert.time;

  copy.append(title, message);
  row.append(symbol, copy, time);

  return row;
}

function renderAlerts() {
  const recent = $("recent-alerts");
  const all = $("all-alerts");

  recent.replaceChildren();
  all.replaceChildren();

  if (state.alerts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No alerts yet. Your system is ready.";
    recent.append(empty);
    all.append(empty.cloneNode(true));
    return;
  }

  state.alerts.slice(0, 3).forEach(alert => {
    recent.append(createAlertElement(alert));
  });

  state.alerts.forEach(alert => {
    all.append(createAlertElement(alert));
  });
}

// Update all pages with the latest readings
function render() {
  const level = state.level;
  const available = litres();
  const empty = state.capacity - available;
  const status = getStatus();

  // Dashboard
  $("stat-level").textContent = level + "%";
  $("stat-litres").textContent =
    `${formatNumber(available)} litres available`;
  $("stat-bar").style.width = level + "%";

  $("stat-capacity").textContent =
    formatNumber(state.capacity) + " L";

  $("stat-status").textContent = statusText(status);
  $("stat-status").className =
    status === "normal" ? "status-normal" :
    status === "low" ? "status-low" : "status-high";

  $("stat-status-desc").textContent =
    status === "low" ? "Below minimum threshold" :
    status === "high" ? "Above maximum threshold" :
    "Within configured limits";

  $("tank-water").style.height = level + "%";
  $("tank-percent").textContent = level + "%";
  $("dash-min").textContent = state.min + "%";
  $("dash-max").textContent = state.max + "%";

  // Water level page
  $("water-reading").textContent = level + "%";
  $("water-litres").textContent =
    `${formatNumber(available)} litres out of ${formatNumber(state.capacity)} litres`;
  $("water-bar").style.width = level + "%";
  $("water-chip").textContent = statusText(status);
  $("water-chip").className = "status-chip " +
    (status === "normal" ? "" : status);
  $("water-capacity").textContent = formatNumber(state.capacity) + " L";
  $("water-available").textContent = formatNumber(available) + " L";
  $("water-empty").textContent = formatNumber(empty) + " L";

  $("level-input").value = level;
  $("range-value").textContent = level + "%";

  // Threshold finder
  $("result-current").textContent = level + "%";
  $("result-chip").textContent = statusText(status);
  $("result-chip").className = "status-chip " +
    (status === "normal" ? "" : status);

  $("track-fill").style.width = level + "%";
  $("min-marker").style.left = state.min + "%";
  $("max-marker").style.left = state.max + "%";

  $("track-min-label").textContent = "Min " + state.min + "%";
  $("track-max-label").textContent = "Max " + state.max + "%";
  $("result-min").textContent = state.min + "%";
  $("result-max").textContent = state.max + "%";
  $("result-litres").textContent = formatNumber(available) + " L";

  const result = $("threshold-result");
  result.className = "result-message";

  if (status === "low") {
    result.classList.add("low");
    result.textContent =
      `LOW WATER: Current level is ${level}%. It is ${state.min - level}% below the minimum threshold. Refill may be needed.`;
  } else if (status === "high") {
    result.classList.add("high");
    result.textContent =
      `HIGH WATER: Current level is ${level}%. It is ${level - state.max}% above the maximum threshold. Check for overfilling.`;
  } else {
    result.textContent =
      `NORMAL: Water level is within the configured safe range of ${state.min}% to ${state.max}%.`;
  }

  renderAlerts();
}

// Simulate a new water reading
function updateLevel(value) {
  const next = Number(value);

  if (!Number.isFinite(next) || next < 0 || next > 100) return;

  state.level = next;
  checkWaterStatus();
  render();
}

$("level-input").addEventListener("input", event => {
  $("range-value").textContent = event.target.value + "%";
});

$("apply-level").addEventListener("click", () => {
  updateLevel($("level-input").value);
});

// Save and validate thresholds
$("save-threshold").addEventListener("click", () => {
  const min = Number($("min-input").value);
  const max = Number($("max-input").value);

  if (
    $("min-input").value.trim() === "" ||
    $("max-input").value.trim() === "" ||
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min < 0 || max > 100 || min >= max
  ) {
    $("threshold-message").textContent =
      "Invalid values. Use whole numbers from 0 to 100, with minimum below maximum.";
    return;
  }

  state.min = min;
  state.max = max;

  state.lastStatus = undefined;
  checkWaterStatus();

  $("threshold-message").textContent =
    `Thresholds applied successfully: minimum ${min}%, maximum ${max}%.`;

  render();
});

// Save tank capacity and name
$("save-settings").addEventListener("click", () => {
  const capacity = Number($("capacity-input").value);
  const name = $("name-input").value.trim();

  if (
    $("capacity-input").value.trim() === "" ||
    !Number.isSafeInteger(capacity) ||
    capacity < 1 || capacity > 10000000
  ) {
    $("settings-message").textContent =
      "Enter a whole-number capacity between 1 and 10,000,000 litres.";
    return;
  }

  if (!name) {
    $("settings-message").textContent =
      "Please enter a tank name.";
    return;
  }

  state.capacity = capacity;
  state.tankName = name;

  $("settings-message").textContent =
    `Settings saved for ${name}. Capacity: ${formatNumber(capacity)} litres.`;

  render();
});

$("clear-alerts").addEventListener("click", () => {
  state.alerts = [];
  renderAlerts();
});

// Initial dashboard
addAlert(
  "System started",
  "TankAlert demo monitoring is ready.",
  "normal"
);

checkWaterStatus();
render();
