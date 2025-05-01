<template>
  <div class="app-container">
    <div class="extension-header">
      <h1 class="extension-title">WebTimePro</h1>
    </div>
    
    <div class="tabs-wrapper">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-button" 
        :class="{ 'tab-active': activeTab === tab.id }" 
        @click="activeTab = tab.id"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-text">{{ tab.label }}</span>
      </div>
    </div>

    <div class="tab-content">
      <CategorisationTab v-if="activeTab === 'categorisation'" />
      <BlockTab v-if="activeTab === 'block'" />
      <AnalyticsTab v-if="activeTab === 'analytics'" />
      <GoalsTab v-if="activeTab === 'goals'" />
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import CategorisationTab from "./components/CategorisationTab.vue";
import BlockTab from "./components/BlockTab.vue";
import AnalyticsTab from "./components/AnalyticsTab.vue";
import GoalsTab from "./components/GoalsTab.vue";

export default {
  components: { CategorisationTab, BlockTab, AnalyticsTab, GoalsTab },
  setup() {
    const activeTab = ref("categorisation");
    
    const tabs = [
      {
        id: "categorisation",
        label: "Categories",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>'
      },
      {
        id: "block",
        label: "Block Site",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>'
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>'
      },
      {
        id: "goals",
        label: "Goals",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-6M16 16l-4-4-4 4M4 4h16c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path></svg>'
      }
    ];
    
    return { activeTab, tabs };
  },
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

.app-container {
  width: 300px;
  min-height: 400px;
  background-color: #ffffff;
}

/* Header */
.extension-header {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  text-align: center;
}

.extension-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

/* Tabs Navigation */
.tabs-wrapper {
  display: flex;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 5px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: background-color 0.2s;
  position: relative;
  flex-direction: column;
}

.tab-button:hover {
  background-color: #e9e9e9;
}

.tab-active {
  border-bottom-color: #4CAF50;
  background-color: #e9e9e9;
  font-weight: bold;
}

.tab-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
}

.tab-icon svg {
  stroke: #666;
}

.tab-active .tab-icon svg {
  stroke: #4CAF50;
}

.tab-text {
  font-size: 12px;
  text-align: center;
}

/* Content Area */
.tab-content {
  padding: 15px;
}
</style>