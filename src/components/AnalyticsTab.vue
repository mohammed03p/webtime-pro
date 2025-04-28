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
  <div>
    <h3>Analytics</h3>

    <h4>Total Time</h4>
    <p><strong>Productive:</strong> {{ (productiveTime / 3600).toFixed(2) }} hours</p>
    <p><strong>Unproductive:</strong> {{ (unproductiveTime / 3600).toFixed(2) }} hours</p>
    <div style="height: 250px;">
      <canvas id="totalChart"></canvas>
    </div>

    <h4>Today's Time</h4>
    <p><strong>Productive:</strong> {{ (productiveToday / 3600).toFixed(2) }} hours</p>
    <p><strong>Unproductive:</strong> {{ (unproductiveToday / 3600).toFixed(2) }} hours</p>
    <div style="height: 250px;">
      <canvas id="todayChart"></canvas>
    </div>

    <h4>Last 7 Days</h4>
    <p><strong>Productive:</strong> {{ (productiveWeekly / 3600).toFixed(2) }} hours</p>
    <p><strong>Unproductive:</strong> {{ (unproductiveWeekly / 3600).toFixed(2) }} hours</p>
    <div style="height: 250px;">
      <canvas id="weekChart"></canvas>
    </div>
  </div>
</template>

<style scoped>
canvas {
  max-width: 100%;
}
</style>
