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
}
li {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
input[type="datetime-local"] {
  margin-left: 10px;
}
button {
  margin-left: 10px;
}
</style>
