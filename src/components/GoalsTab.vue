<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const goals = ref([]);
const newGoal = ref("");
const completedGoals = ref(0);
let chartInstance = null;

// Load saved goals from Chrome storage on mount
onMounted(() => {
  chrome.storage.local.get("goals", (data) => {
    goals.value = Array.isArray(data.goals) ? data.goals : [];
    updateCompletedCount();
    nextTick(drawChart); // ensure DOM is ready before drawing
  });
});

// Add a new goal
const addGoal = () => {
  if (newGoal.value.trim() === "") return;
  goals.value.push({ text: newGoal.value.trim(), completed: false });
  newGoal.value = "";
  saveGoals();
};

// Toggle goal completion
const toggleGoal = (index) => {
  goals.value[index].completed = !goals.value[index].completed;
  saveGoals();
};

// Remove goal
const removeGoal = (index) => {
  goals.value.splice(index, 1);
  saveGoals();
};

// Save to Chrome and update chart
const saveGoals = () => {
  chrome.storage.local.set({ goals: goals.value }, () => {
    console.log("Goals saved:", goals.value); // debug logging
    updateCompletedCount();
    updateChart();
  });
};

// Count completed goals
const updateCompletedCount = () => {
  completedGoals.value = goals.value.filter((goal) => goal.completed).length;
};

// Draw chart
const drawChart = () => {
  const canvas = document.getElementById("goalChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Remaining"],
      datasets: [{
        data: [completedGoals.value, goals.value.length - completedGoals.value],
        backgroundColor: ["#4CAF50", "#FF0000"],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
};

// Update chart data
const updateChart = () => {
  if (!chartInstance) {
    drawChart();
    return;
  }

  chartInstance.data.datasets[0].data = [
    completedGoals.value,
    goals.value.length - completedGoals.value
  ];
  chartInstance.update();
};

// Watcher with a delay to reduce flicker
let chartUpdateTimeout;
watch(goals, () => {
  updateCompletedCount();
  clearTimeout(chartUpdateTimeout);
  chartUpdateTimeout = setTimeout(updateChart, 300); // avoids rapid redraws
}, { deep: true });
</script>


<template>
    <div>
        <h3>Goals</h3>
        <input v-model="newGoal" placeholder="Enter a goal" />
        <button @click="addGoal">Add Goal</button>

        <ul>
            <li v-for="(goal, index) in goals" :key="index">
                <input type="checkbox" v-model="goal.completed" @change="toggleGoal(index)" />
                <span :style="{ textDecoration: goal.completed ? 'line-through' : 'none' }">
                    {{ goal.text }}
                </span>
                <button @click="removeGoal(index)" style="margin-left: 10px; color: red;">X</button>
            </li>
        </ul>

        <h4>Progress: {{ completedGoals }} / {{ goals.length }} Goals Completed</h4>
        <canvas id="goalChart" width="200" height="200"></canvas>
    </div>
</template>

<style scoped>
ul {
    list-style: none;
    padding: 0;
}

li {
    margin: 5px 0;
    display: flex;
    align-items: center;
}

canvas {
    max-width: 100%;
    height: auto;
}

button {
    margin-left: 10px;
}
</style>
