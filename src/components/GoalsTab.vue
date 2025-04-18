<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const goals = ref([]);
const newGoal = ref("");
const completedGoals = ref(0);
let chartInstance = null;

// Load goals from storage when the component mounts
onMounted(() => {
    chrome.storage.local.get("goals", (data) => {
        if (data.goals) {
            goals.value = data.goals;
            updateCompletedCount();
            nextTick(() => drawChart());
        }
    });
});

// Add a new goal
const addGoal = () => {
    if (newGoal.value.trim() === "") return;

    goals.value.push({ text: newGoal.value, completed: false });
    newGoal.value = "";

    saveGoals();
};

// Toggle goal completion
const toggleGoal = (index) => {
    goals.value[index].completed = !goals.value[index].completed;
    saveGoals();
};

// Save goals to Chrome storage
const saveGoals = () => {
    chrome.storage.local.set({ goals: goals.value }, () => {
        updateCompletedCount();
        updateChart();
    });
};

// Update completed goal count
const updateCompletedCount = () => {
    completedGoals.value = goals.value.filter(goal => goal.completed).length;
};

// Draw or update the chart
const drawChart = () => {
    const ctx = document.getElementById("goalChart");
    if (!ctx) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

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
            maintainAspectRatio: false
        }
    });
};

// Update chart without recreating it
const updateChart = () => {
    if (!chartInstance) {
        nextTick(() => drawChart());
        return;
    }

    chartInstance.data.datasets[0].data = [completedGoals.value, goals.value.length - completedGoals.value];
    chartInstance.update();
};

// Watch for changes and update the chart
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
                <input type="checkbox" v-model="goal.completed" @change="toggleGoal(index)" />
                <span :style="{ textDecoration: goal.completed ? 'line-through' : 'none' }">
                    {{ goal.text }}
                </span>
            </li>
        </ul>

        <h4>Progress</h4>
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
</style>
