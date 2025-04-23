<script setup>
import { ref, watch, onMounted } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const goals = ref([]);
const newGoal = ref("");
const completedGoals = ref(0);
let chartInstance = null;

// Load stored goals on mount
onMounted(() => {
  chrome.storage.local.get("goals", (data) => {
    goals.value = Array.isArray(data.goals) ? data.goals : [];
    updateCompletedCount();
    createChart();
  });
});

// Add goal
const addGoal = () => {
  if (!newGoal.value.trim()) return;
  goals.value.push({ text: newGoal.value.trim(), completed: false });
  newGoal.value = "";
  saveGoals();
};

// Toggle checkbox (don’t use v-model to avoid conflicts)
const toggleGoal = (index) => {
  goals.value[index].completed = !goals.value[index].completed;
  saveGoals();
};

// Remove goal
const removeGoal = (index) => {
  goals.value.splice(index, 1);
  saveGoals();
};

// Save to Chrome storage
const saveGoals = () => {
  const clonedGoals = JSON.parse(JSON.stringify(goals.value)); // avoid Vue proxy issues
  chrome.storage.local.set({ goals: clonedGoals }, () => {
    updateCompletedCount();
    updateChart();
  });
};
// Count completed goals
const updateCompletedCount = () => {
  completedGoals.value = goals.value.filter(g => g.completed).length;
};

// Chart logic
const createChart = () => {
  setTimeout(() => {
    const ctx = document.getElementById("goalChart");
    if (!ctx) return;

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Completed", "Remaining"],
        datasets: [{
          data: [completedGoals.value, goals.value.length - completedGoals.value],
          backgroundColor: ["#4CAF50", "#FF0000"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }, 50); // slight delay to ensure DOM is stable
};
const updateChart = () => {
  if (!chartInstance) return;
  chartInstance.data.datasets[0].data = [completedGoals.value, goals.value.length - completedGoals.value];
  chartInstance.update();
};

// Watch for goal changes
watch(goals, () => {
  updateCompletedCount();
  updateChart();
}, { deep: true });
</script>

<template>
  <div>
    <h3>Goals</h3>
    <input v-model="newGoal" placeholder="Enter a goal" />
    <button @click="addGoal">Add Goal</button>

    <ul>
      <li v-for="(goal, index) in goals" :key="index">
        <input type="checkbox" :checked="goal.completed" @change="toggleGoal(index)" />
        <span :style="{ textDecoration: goal.completed ? 'line-through' : 'none' }">{{ goal.text }}</span>
        <button @click="removeGoal(index)" style="color: red; margin-left: 10px;">X</button>
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
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
canvas {
  max-width: 100%;
  height: auto;
}
</style>
