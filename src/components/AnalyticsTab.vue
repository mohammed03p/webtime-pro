<script setup>
import { ref, onMounted } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const productiveTime = ref(0);
const unproductiveTime = ref(0);
let chartInstance = null;

onMounted(() => {
  loadAnalytics();
});

const loadAnalytics = () => {
  chrome.storage.local.get(["timeLogs", "siteCategories"], (data) => {
    const timeLogs = data.timeLogs || {};
    const siteCategories = data.siteCategories || {};

    productiveTime.value = 0;
    unproductiveTime.value = 0;

    for (const site in timeLogs) {
      const timeSpent = timeLogs[site];
      const category = siteCategories[site] || "unclassified";

      if (category === "productive") {
        productiveTime.value += timeSpent;
      } else if (category === "unproductive") {
        unproductiveTime.value += timeSpent;
      }
    }

    drawChart();
  });
};

const drawChart = () => {
  const ctx = document.getElementById("analyticsChart");
  if (!ctx) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Productive", "Unproductive"],
      datasets: [{
        data: [productiveTime.value, unproductiveTime.value],
        backgroundColor: ["#4CAF50", "#FF0000"],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
</script>

<template>
  <div>
    <h3>Analytics</h3>

    <div>
      <p><strong>Productive Time:</strong> {{ formatTime(productiveTime) }}</p>
      <p><strong>Unproductive Time:</strong> {{ formatTime(unproductiveTime) }}</p>
    </div>

    <canvas id="analyticsChart" width="200" height="200"></canvas>
  </div>
</template>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
  margin-top: 20px;
}
</style>
