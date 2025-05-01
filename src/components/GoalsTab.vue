<script setup>
import { ref, watch, onMounted } from "vue";

const goals = ref([]);
const newGoalText = ref("");
const newGoalDeadline = ref("");
const completedGoals = ref(0);

// Load goals on mount
onMounted(() => {
  chrome.storage.local.get("goals", (data) => {
    goals.value = Array.isArray(data.goals) ? data.goals : [];
    updateCompletedCount();
  });
});

// Add a new goal
const addGoal = () => {
  if (!newGoalText.value.trim()) return;

  goals.value.push({
    text: newGoalText.value.trim(),
    completed: false,
    deadline: newGoalDeadline.value ? new Date(newGoalDeadline.value).getTime() : null,
    notified: { "24h": false, "12h": false, "1h": false }
  });

  newGoalText.value = "";
  newGoalDeadline.value = "";

  saveGoals();
};

// Toggle completion
const toggleGoal = (index) => {
  goals.value[index].completed = !goals.value[index].completed;
  saveGoals();
};

// Remove a goal
const removeGoal = (index) => {
  goals.value.splice(index, 1);
  saveGoals();
};

// Save goals to Chrome storage
const saveGoals = () => {
  const clonedGoals = JSON.parse(JSON.stringify(goals.value)); // avoid Vue proxy issues
  chrome.storage.local.set({ goals: clonedGoals }, () => {
    updateCompletedCount();
  });
};

// Update completed count
const updateCompletedCount = () => {
  completedGoals.value = goals.value.filter(goal => goal.completed).length;
};

// Watch for goal changes
watch(goals, updateCompletedCount, { deep: true });

</script>

<template>
  <div>
    <h3>Goals</h3>
    <input v-model="newGoalText" placeholder="Enter a goal" />
    <input v-model="newGoalDeadline" type="datetime-local" />
    <button @click="addGoal">Add Goal</button>

    <ul>
      <li v-for="(goal, index) in goals" :key="index">
        <input type="checkbox" :checked="goal.completed" @change="toggleGoal(index)" />
        <span :style="{ textDecoration: goal.completed ? 'line-through' : 'none' }">
          {{ goal.text }}
          <small v-if="goal.deadline"> (Due: {{ new Date(goal.deadline).toLocaleString() }})</small>
        </span>
        <button @click="removeGoal(index)" style="color: red; margin-left: 10px;">X</button>
      </li>
    </ul>

    <h4>Progress: {{ completedGoals }} / {{ goals.length }} Goals Completed</h4>
  </div>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background-color: #f5f5f5;
  border-radius: 6px;
  border-left: 3px solid #ccc;
}

button {
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  opacity: 0.85;
  transform: translateY(-2px);
}

button[class*="Block"] {
  background-color: #F44336;
  color: white;
}

button[class*="Unblock"] {
  background-color: #4CAF50;
  color: white;
}

h2, h4 {
  color: #333;
  margin-top: 0;
  margin-bottom: 16px;
}

input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 8px;
  width: calc(100% - 100px);
}

h4 {
  margin-top: 24px;
}
</style>
