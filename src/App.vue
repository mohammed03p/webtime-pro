<template>
  <div>
    <div class="tabs">
      <div class="tab" :class="{ active: activeTab === 'categorisation' }" @click="activeTab = 'categorisation'">Categorisation</div>
      <div class="tab" :class="{ active: activeTab === 'block' }" @click="activeTab = 'block'">Block Site</div>
      <div class="tab" :class="{ active: activeTab === 'analytics' }" @click="activeTab = 'analytics'">Analytics</div>
      <div class="tab" :class="{ active: activeTab === 'goals' }" @click="activeTab = 'goals'">Goals</div>
    </div>

    <CategorisationTab v-if="activeTab === 'categorisation'" />
    <BlockTab v-if="activeTab === 'block'" />
    <AnalyticsTab v-if="activeTab === 'analytics'" />
    <GoalsTab v-if="activeTab === 'goals'" />
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
    return { activeTab };
  },
};
</script>

<style>
.tabs {
  display: flex;
  border-bottom: 1px solid #ccc;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  cursor: pointer;
}
.tab.active {
  font-weight: bold;
  border-bottom: 2px solid blue;
}
</style>
