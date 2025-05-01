<template>
  <div class="categorisation-tab">
    <h3 class="tab-title">Site Categorisation</h3>

    <div class="filter-controls">
      <div class="filter-label">Filter by:</div>
      <div class="filter-buttons">
        <button 
          @click="setFilter('all')" 
          :class="['filter-btn', { active: currentFilter === 'all' }]">
          All
        </button>
        <button 
          @click="setFilter('productive')" 
          :class="['filter-btn', { active: currentFilter === 'productive' }]">
          Productive
        </button>
        <button 
          @click="setFilter('unproductive')" 
          :class="['filter-btn', { active: currentFilter === 'unproductive' }]">
          Unproductive
        </button>
      </div>
    </div>

    <div class="site-list">
      <div 
        v-for="site in filteredSites" 
        :key="site" 
        class="site-card"
      >
        <div class="site-info">
          <span class="site-name">{{ site }}</span>
          <span v-if="siteCategories[site]" 
                :class="['category-badge', siteCategories[site]]">
            - {{ siteCategories[site].toUpperCase() }} 
            <span v-if="siteCategories[site] === 'productive'" class="icon">✅</span>
            <span v-else-if="siteCategories[site] === 'unproductive'" class="icon">❌</span>
          </span>
        </div>
        <div class="site-actions">
          <button 
            @click="setCategory(site, 'productive')" 
            :class="['btn', 'btn-productive', { active: siteCategories[site] === 'productive' }]">
            Productive
          </button>
          <button 
            @click="setCategory(site, 'unproductive')" 
            :class="['btn', 'btn-unproductive', { active: siteCategories[site] === 'unproductive' }]">
            Unproductive
          </button>
          <button @click="removeSite(site)" class="btn btn-remove">
            ×
          </button>
        </div>
      </div>
      
      <div v-if="filteredSites.length === 0" class="no-sites-message">
        No sites found with the selected filter.
      </div>
    </div>
    
    <div class="add-site-section">
      <h4 class="section-title">Add a New Site</h4>
      <div class="input-group">
        <input 
          v-model="newSite" 
          placeholder="Enter site URL (e.g., example.com)" 
          class="site-input"
        />
        <button @click="addSite" class="btn btn-add">Add Site</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const sites = ref([]);
const siteCategories = ref({});
const newSite = ref("");
const currentFilter = ref("all");

// Computed property for filtered sites
const filteredSites = computed(() => {
  if (currentFilter.value === "all") {
    return sites.value;
  } else {
    return sites.value.filter(site => 
      siteCategories.value[site] === currentFilter.value
    );
  }
});

// Set the current filter
const setFilter = (filter) => {
  currentFilter.value = filter;
};

// Load from storage
const loadSites = () => {
  chrome.storage.local.get("siteCategories", (data) => {
    siteCategories.value = data.siteCategories || {};
    sites.value = Object.keys(siteCategories.value);
  });
};

// Set site category
const setCategory = (site, category) => {
  siteCategories.value[site] = category;
  chrome.storage.local.set({ siteCategories: siteCategories.value }, loadSites);
};

// Remove site completely
const removeSite = (site) => {
  delete siteCategories.value[site];
  chrome.storage.local.set({ siteCategories: siteCategories.value }, loadSites);
};

// Add manually
const addSite = () => {
  let url = newSite.value.trim();
  if (!url) return;

  // Add http:// if no protocol is specified
  if (!/^https?:\/\//i.test(url)) {
    url = "http://" + url;
  }

  try {
    url = new URL(url).hostname;
  } catch (e) {
    alert("Invalid URL format. Please enter a valid website address.");
    return;
  }

  siteCategories.value[url] = "unclassified";
  chrome.storage.local.set({ siteCategories: siteCategories.value }, () => {
    newSite.value = "";
    loadSites();
  });
};

// React to changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.siteCategories) {
    loadSites();
  }
});

onMounted(loadSites);
</script>

<style scoped>
.categorisation-tab {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 16px;
  max-width: 100%;
  color: #333;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.tab-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2c3e50;
  padding-bottom: 8px;
  border-bottom: 2px solid #eaeaea;
}

.filter-controls {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-weight: 600;
  font-size: 14px;
  color: #555;
}

.filter-buttons {
  display: flex;
  gap: 6px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #f1f3f4;
}

.filter-btn.active {
  background-color: #4285F4;
  color: white;
  border-color: #4285F4;
}

.section-title {
  font-size: 16px;
  margin: 24px 0 12px 0;
  color: #2c3e50;
}

.site-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.site-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.site-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.site-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.site-name {
  font-weight: 600;
  font-size: 15px;
  word-break: break-word;
  margin-right: 4px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-left: 4px;
}

.category-badge.productive {
  background-color: #4CAF50;
  color: white;
}

.category-badge.unproductive {
  background-color: #F44336;
  color: white;
}

.category-badge.unclassified {
  background-color: #9e9e9e;
  color: white;
}

.icon {
  margin-left: 4px;
}

.site-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
}

.btn-productive {
  background-color: rgba(76, 175, 80, 0.15);
  color: #2e7d32;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.btn-productive:hover {
  background-color: rgba(76, 175, 80, 0.25);
}

.btn-productive.active {
  background-color: #4CAF50;
  color: white;
}

.btn-unproductive {
  background-color: rgba(244, 67, 54, 0.15);
  color: #c62828;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.btn-unproductive:hover {
  background-color: rgba(244, 67, 54, 0.25);
}

.btn-unproductive.active {
  background-color: #F44336;
  color: white;
}

.btn-remove {
  background-color: rgba(0, 0, 0, 0.05);
  color: #616161;
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 20px;
  line-height: 1;
}

.btn-remove:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #212121;
}

.no-sites-message {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  color: #757575;
  font-style: italic;
}

.add-site-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eaeaea;
}

.input-group {
  display: flex;
  gap: 8px;
}

.site-input {
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  flex-grow: 1;
  transition: all 0.2s;
}

.site-input:focus {
  outline: none;
  border-color: #4285F4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.btn-add {
  background-color: #4285F4;
  color: white;
  min-width: 90px;
}

.btn-add:hover {
  background-color: #2b6ed9;
}

@media (max-width: 480px) {
  .input-group {
    flex-direction: column;
  }
  
  .btn-add {
    width: 100%;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-buttons {
    width: 100%;
  }
  
  .filter-btn {
    flex: 1;
    text-align: center;
  }
}
</style>