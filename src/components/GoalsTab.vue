<template>
    <div class="goals-container">
      <h3>Goals</h3>
      
      <div class="input-row">
        <input 
          v-model="newGoalText" 
          placeholder="Enter a goal" 
          @keyup.enter="handleAddGoal"
          class="goal-input"
        />
        <button @click="handleAddGoal" class="add-button">Add Goal</button>
      </div>
      
      <div v-if="isLoading" class="loading">Loading goals...</div>
      
      <div v-else-if="goals.length === 0" class="no-goals">
        <p>No goals added yet. Add your first goal above!</p>
      </div>
      
      <ul v-else class="goals-list">
        <li v-for="(goal, index) in goals" :key="goal.id" class="goal-item">
          <div class="goal-content">
            <input 
              type="checkbox" 
              :checked="goal.completed"
              @click="handleToggleGoal(index)"
              class="goal-checkbox"
            />
            <span 
              :class="{'completed-text': goal.completed}"
              class="goal-text"
            >
              {{ goal.text }}
            </span>
          </div>
          <button @click="handleRemoveGoal(index)" class="remove-button">X</button>
        </li>
      </ul>
      
      <div v-if="goals.length > 0" class="stats-section">
        <h4>Progress: {{ completedCount }} / {{ goals.length }} Goals Completed</h4>
        
        <div class="chart-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{width: `${(completedCount / goals.length) * 100}%`}"
            ></div>
          </div>
          <div class="progress-labels">
            <span class="label-completed">Completed: {{ completedCount }}</span>
            <span class="label-remaining">Remaining: {{ goals.length - completedCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted, watch } from 'vue';
  
  export default defineComponent({
    name: 'GoalsTab',
    
    setup() {
      // State
      const goals = ref([]);
      const newGoalText = ref('');
      const completedCount = ref(0);
      const isLoading = ref(true);
      
      // Unique ID generator for goals
      const generateId = () => `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Load goals from storage
      const loadGoals = () => {
        isLoading.value = true;
        console.log('Loading goals from storage...');
        
        try {
          chrome.storage.local.get('goals', (result) => {
            console.log('Goals loaded from storage:', result.goals);
            
            if (chrome.runtime.lastError) {
              console.error('Error loading goals:', chrome.runtime.lastError);
              isLoading.value = false;
              return;
            }
            
            // Ensure we have valid data and add IDs if needed
            if (Array.isArray(result.goals)) {
              goals.value = result.goals.map(goal => ({
                id: goal.id || generateId(),
                text: goal.text,
                completed: !!goal.completed
              }));
            } else {
              goals.value = [];
            }
            
            updateCompletedCount();
            isLoading.value = false;
          });
        } catch (error) {
          console.error('Exception when loading goals:', error);
          isLoading.value = false;
        }
      };
      
      // Save goals to storage
      const saveGoals = () => {
        console.log('Saving goals to storage:', goals.value);
        
        try {
          chrome.storage.local.set({ goals: goals.value }, () => {
            if (chrome.runtime.lastError) {
              console.error('Error saving goals:', chrome.runtime.lastError);
              return;
            }
            console.log('Goals saved successfully');
            updateCompletedCount();
          });
        } catch (error) {
          console.error('Exception when saving goals:', error);
        }
      };
      
      // Add a new goal
      const handleAddGoal = () => {
        const text = newGoalText.value.trim();
        if (!text) return;
        
        console.log('Adding new goal:', text);
        
        // Create new array to ensure reactivity
        const newGoals = [
          ...goals.value,
          {
            id: generateId(),
            text,
            completed: false
          }
        ];
        
        goals.value = newGoals;
        newGoalText.value = '';
        saveGoals();
      };
      
      // Toggle goal completion
      const handleToggleGoal = (index) => {
        if (index < 0 || index >= goals.value.length) return;
        
        console.log('Toggling goal completion:', goals.value[index].text);
        
        // Create new array to ensure reactivity
        const newGoals = [...goals.value];
        newGoals[index] = {
          ...newGoals[index],
          completed: !newGoals[index].completed
        };
        
        goals.value = newGoals;
        saveGoals();
      };
      
      // Remove a goal
      const handleRemoveGoal = (index) => {
        if (index < 0 || index >= goals.value.length) return;
        
        console.log('Removing goal:', goals.value[index].text);
        
        // Create new array to ensure reactivity
        const newGoals = [...goals.value];
        newGoals.splice(index, 1);
        
        goals.value = newGoals;
        saveGoals();
      };
      
      // Update completed count
      const updateCompletedCount = () => {
        completedCount.value = goals.value.filter(goal => goal.completed).length;
      };
      
      // Listen for storage changes from other contexts
      const setupStorageListener = () => {
        chrome.storage.onChanged.addListener((changes) => {
          if (changes.goals) {
            console.log('Goals changed in storage, reloading');
            loadGoals();
          }
        });
      };
      
      // Setup on mount
      onMounted(() => {
        console.log('GoalsTab mounted');
        loadGoals();
        setupStorageListener();
      });
      
      return {
        goals,
        newGoalText,
        completedCount,
        isLoading,
        handleAddGoal,
        handleToggleGoal,
        handleRemoveGoal
      };
    }
  });
  </script>
  
  <style scoped>
  .goals-container {
    padding: 10px;
  }
  
  .input-row {
    display: flex;
    margin-bottom: 15px;
  }
  
  .goal-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-right: 8px;
  }
  
  .add-button {
    padding: 8px 16px;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .add-button:hover {
    background-color: #3367d6;
  }
  
  .goals-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .goal-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    margin-bottom: 8px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
  
  .goal-content {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .goal-checkbox {
    margin-right: 10px;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .goal-text {
    flex: 1;
  }
  
  .completed-text {
    text-decoration: line-through;
    color: #666;
  }
  
  .remove-button {
    background-color: #ff5252;
    color: white;
    border: none;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 10px;
  }
  
  .stats-section {
    margin-top: 20px;
  }
  
  .chart-container {
    margin: 20px 0;
  }
  
  .progress-bar {
    height: 25px;
    background-color: #eee;
    border-radius: 12px;
    margin: 10px 0;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background-color: #4CAF50;
    transition: width 0.3s ease;
  }
  
  .progress-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    font-size: 0.9em;
  }
  
  .label-completed {
    color: #4CAF50;
  }
  
  .label-remaining {
    color: #FF5252;
  }
  
  .loading {
    text-align: center;
    margin: 20px 0;
    color: #666;
  }
  
  .no-goals {
    text-align: center;
    margin: 20px 0;
    color: #666;
  }
  </style>