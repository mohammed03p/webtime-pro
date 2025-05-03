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

// Get relative time string for deadlines
const getRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  
  const now = new Date().getTime();
  const diff = timestamp - now;
  
  // If past due
  if (diff < 0) {
    return "Overdue";
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else if (hours > 0) {
    return `${hours}h left`;
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  }
};

// Get deadline status for styling
const getDeadlineStatus = (timestamp) => {
  if (!timestamp) return "";
  
  const now = new Date().getTime();
  const diff = timestamp - now;
  
  if (diff < 0) {
    return "overdue";
  } else if (diff < 24 * 60 * 60 * 1000) {
    return "urgent";
  } else if (diff < 3 * 24 * 60 * 60 * 1000) {
    return "soon";
  } else {
    return "normal";
  }
};

// Watch for goal changes
watch(goals, updateCompletedCount, { deep: true });
</script>

<template>
  <div class="goals-container">
    <div class="header">
      <h3>Goals</h3>
      <div class="progress-pill">
        <div class="progress-text">{{ completedGoals }} / {{ goals.length }}</div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: goals.length ? (completedGoals / goals.length * 100) + '%' : '0%' }"
          ></div>
        </div>
      </div>
    </div>
    
    <div class="description-text">
      Set and track your goals with deadlines. You'll receive notifications as your deadlines approach to help you stay on track. Check off completed goals to track your progress.
    </div>
    
    <div class="add-goal-form">
      <div class="input-group">
        <input 
          v-model="newGoalText" 
          placeholder="Enter a goal" 
          class="text-input"
        />
        <input 
          v-model="newGoalDeadline" 
          type="datetime-local" 
          class="date-input"
        />
        <button @click="addGoal" class="add-button">Add Goal</button>
      </div>
    </div>

    <div v-if="goals.length === 0" class="empty-state">
      No goals yet. Add one above to get started!
    </div>

    <ul class="goals-list">
      <li 
        v-for="(goal, index) in goals" 
        :key="index"
        :class="[
          'goal-item', 
          { 'completed': goal.completed },
          goal.deadline && !goal.completed ? getDeadlineStatus(goal.deadline) : ''
        ]"
      >
        <div class="goal-content">
          <label class="checkbox-container">
            <input 
              type="checkbox" 
              :checked="goal.completed" 
              @change="toggleGoal(index)" 
            />
            <span class="checkmark"></span>
          </label>
          
          <div class="goal-details">
            <span class="goal-text">{{ goal.text }}</span>
            <span v-if="goal.deadline" class="deadline-text" :class="getDeadlineStatus(goal.deadline)">
              <span class="deadline-icon">⏱</span>
              {{ getRelativeTime(goal.deadline) }}
            </span>
          </div>
        </div>
        
        <button @click="removeGoal(index)" class="delete-button" title="Delete goal">
          <span class="delete-icon">×</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.goals-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.description-text {
  margin-bottom: 20px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.progress-pill {
  background-color: #f1f5f9;
  border-radius: 20px;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.progress-bar {
  width: 60px;
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.add-goal-form {
  display: flex;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.text-input, .date-input {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  width: 100%;
}

.text-input:focus, .date-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.add-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  height: 42px;
  width: 100%;
  margin-top: 4px;
}

.add-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.add-button:active {
  transform: translateY(1px);
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 24px;
  background-color: #f8fafc;
  border-radius: 6px;
  font-size: 14px;
}

.goals-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.goal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #cbd5e1;
  transition: all 0.2s;
}

.goal-item:hover {
  background-color: #f1f5f9;
}

.goal-item.completed {
  border-left-color: #10b981;
  background-color: #f0fdf4;
}

.goal-item.overdue {
  border-left-color: #ef4444;
}

.goal-item.urgent {
  border-left-color: #f59e0b;
}

.goal-item.soon {
  border-left-color: #3b82f6;
}

.goal-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.goal-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.goal-text {
  font-size: 14px;
  transition: color 0.2s;
}

.completed .goal-text {
  text-decoration: line-through;
  color: #94a3b8;
}

.deadline-text {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
}

.deadline-text.overdue {
  color: #ef4444;
  font-weight: 600;
}

.deadline-text.urgent {
  color: #f59e0b;
  font-weight: 600;
}

.deadline-icon {
  font-size: 11px;
}

.checkbox-container {
  display: block;
  position: relative;
  cursor: pointer;
  user-select: none;
  width: 20px;
  height: 20px;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #ffffff;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  transition: all 0.2s;
}

.checkbox-container:hover .checkmark {
  border-color: #94a3b8;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #10b981;
  border-color: #10b981;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.delete-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: #94a3b8;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.delete-button:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.delete-icon {
  line-height: 1;
}
</style>