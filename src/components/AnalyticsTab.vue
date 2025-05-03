<script setup>
import { ref, onMounted, nextTick } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// Total
const productiveTime = ref(0);
const unproductiveTime = ref(0);

// Daily
const productiveToday = ref(0);
const unproductiveToday = ref(0);

// Weekly
const productiveWeekly = ref(0);
const unproductiveWeekly = ref(0);

// Chart instances
let totalChart = null;
let todayChart = null;
let weekChart = null;

// Helper to get date strings
const todayDate = new Date().toISOString().split("T")[0];
const last7Dates = [...Array(7)].map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  return d.toISOString().split("T")[0];
});

// Format time to hours and minutes
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes} mins`;
  } else if (minutes === 0) {
    return `${hours} hrs`;
  } else {
    return `${hours} hrs ${minutes} mins`;
  }
};

// Load time data
const loadTimeData = () => {
  chrome.storage.local.get(["siteCategories", "timeLogs"], (data) => {
    const siteCategories = data.siteCategories || {};
    const timeLogs = data.timeLogs || {};

    let totalProd = 0, totalUnprod = 0;
    let todayProd = 0, todayUnprod = 0;
    let weekProd = 0, weekUnprod = 0;

    // Total time (everything)
    for (const date in timeLogs) {
      const sites = timeLogs[date];
      for (const site in sites) {
        const category = siteCategories[site] || "unclassified";
        if (category === "productive") totalProd += sites[site];
        else if (category === "unproductive") totalUnprod += sites[site];
      }
    }

    // Today only
    const todayLogs = timeLogs[todayDate] || {};
    for (const site in todayLogs) {
      const category = siteCategories[site] || "unclassified";
      if (category === "productive") todayProd += todayLogs[site];
      else if (category === "unproductive") todayUnprod += todayLogs[site];
    }

    // Last 7 days
    last7Dates.forEach(date => {
      const dayLogs = timeLogs[date] || {};
      for (const site in dayLogs) {
        const category = siteCategories[site] || "unclassified";
        if (category === "productive") weekProd += dayLogs[site];
        else if (category === "unproductive") weekUnprod += dayLogs[site];
      }
    });

    productiveTime.value = totalProd;
    unproductiveTime.value = totalUnprod;
    productiveToday.value = todayProd;
    unproductiveToday.value = todayUnprod;
    productiveWeekly.value = weekProd;
    unproductiveWeekly.value = weekUnprod;

    nextTick(drawCharts);
  });
};

// Draw charts
const drawCharts = () => {
  drawSingleChart("totalChart", productiveTime.value, unproductiveTime.value, totalChart, (instance) => totalChart = instance);
  drawSingleChart("todayChart", productiveToday.value, unproductiveToday.value, todayChart, (instance) => todayChart = instance);
  drawSingleChart("weekChart", productiveWeekly.value, unproductiveWeekly.value, weekChart, (instance) => weekChart = instance);
};

const drawSingleChart = (id, productive, unproductive, chartRef, setChart) => {
  const ctx = document.getElementById(id);
  if (!ctx) return;

  if (chartRef) {
    chartRef.destroy();
  }

  const newChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Productive", "Unproductive"],
      datasets: [{
        data: [productive, unproductive],
        backgroundColor: ["#4CAF50", "#FF0000"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

  setChart(newChart);
};

onMounted(loadTimeData);
</script>

<template>
  <div class="analytics-tab">
    <h3 class="tab-title">Analytics</h3>
    
    <div class="tab-description">
      This tab shows graphs of your time spent on productive and unproductive websites.
      There are three visualisations available: daily usage, the last 7 days, and your total time tracked.
    </div>

    <div class="time-section">
      <h4>Today's Time</h4>
      <div class="time-stats">
        <p><strong>Productive:</strong> {{ formatTime(productiveToday) }}</p>
        <p><strong>Unproductive:</strong> {{ formatTime(unproductiveToday) }}</p>
      </div>
      <div class="chart-container">
        <canvas id="todayChart"></canvas>
      </div>
    </div>

    <div class="time-section">
      <h4>Last 7 Days</h4>
      <div class="time-stats">
        <p><strong>Productive:</strong> {{ formatTime(productiveWeekly) }}</p>
        <p><strong>Unproductive:</strong> {{ formatTime(unproductiveWeekly) }}</p>
      </div>
      <div class="chart-container">
        <canvas id="weekChart"></canvas>
      </div>
    </div>

    <div class="time-section">
      <h4>Total Time</h4>
      <div class="time-stats">
        <p><strong>Productive:</strong> {{ formatTime(productiveTime) }}</p>
        <p><strong>Unproductive:</strong> {{ formatTime(unproductiveTime) }}</p>
      </div>
      <div class="chart-container">
        <canvas id="totalChart"></canvas>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-tab {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 16px;
  max-width: 100%;
  color: #333;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.tab-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2c3e50;
  padding-bottom: 8px;
  border-bottom: 2px solid #eaeaea;
}

.tab-description {
  margin-bottom: 20px;
  line-height: 1.5;
  color: #555;
  background-color: #e6f2ff;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  border-left: 4px solid #4285F4;
}

.time-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.time-section h4 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 18px;
  margin-bottom: 12px;
}

.time-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 10px;
}

.time-stats p {
  margin: 0;
  font-size: 15px;
}

.chart-container {
  height: 250px;
  position: relative;
}

canvas {
  max-width: 100%;
}

@media (max-width: 480px) {
  .time-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>