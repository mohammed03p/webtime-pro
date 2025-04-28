<script setup>
import { ref, onMounted, nextTick } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const productiveTime = ref(0);
const unproductiveTime = ref(0);
let chartInstance = null;

// Load and calculate data
const loadTimeData = () => {
  chrome.storage.local.get(["siteCategories", "timeLogs"], (data) => {
    const siteCategories = data.siteCategories || {};
    const timeLogs = data.timeLogs || {};

    let productive = 0;
    let unproductive = 0;

    for (const site in timeLogs) {
      const category = siteCategories[site] || "unclassified";
      if (category === "productive") {
        productive += timeLogs[site];
      } else if (category === "unproductive") {
        unproductive += timeLogs[site];
      }
    }

    productiveTime.value = productive;
    unproductiveTime.value = unproductive;

    nextTick(() => drawChart()); // draw after DOM is updated
  });
};

// Create or update the chart
const drawChart = () => {
  const ctx = document.getElementById("timeChart");

  if (!ctx) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Productive Time", "Unproductive Time"],
      datasets: [{
        data: [productiveTime.value, unproductiveTime.value],
        backgroundColor: ["#4CAF50", "#FF0000"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
};

onMounted(() => {
  loadTimeData();
});
</script>

<template>
  <div>
    <h3>Analytics</h3>
    <p><strong>Productive Time:</strong> {{ (productiveTime / 3600).toFixed(2) }} hours</p>
    <p><strong>Unproductive Time:</strong> {{ (unproductiveTime / 3600).toFixed(2) }} hours</p>

    <div style="height: 250px;">
      <canvas id="timeChart"></canvas>
    </div>
  </div>
</template>

<style scoped>
#timeChart {
  max-width: 100%;
}
</style>
