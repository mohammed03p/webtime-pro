<template>
  <div class="block-tab">
    <h2 class="main-heading">Block Sites</h2>
    <p class="description">
      The sites listed below are the ones you labeled as unproductive in the categorisation page. 
      These sites are here as a recommendation for you to block and unblock at your will. 
      You can also manually add any site you want to block from visiting.
    </p>

    <div class="sites-list">
      <div v-for="site in allSites" :key="site" class="site-item">
        <span class="site-url">{{ site }}</span>
        <button 
          @click="toggleBlockSite(site)" 
          :class="['toggle-button', blockedSites.includes(site) ? 'unblock-btn' : 'block-btn']"
        >
          {{ blockedSites.includes(site) ? "Unblock" : "Block" }}
        </button>
      </div>
    </div>
  
    <div class="manual-block-section">
      <h3 class="section-heading">Manually Block a Site</h3>
      <div class="input-group">
        <input 
          v-model="newBlockedSite" 
          placeholder="Enter site URL (e.g., facebook.com)" 
          class="site-input"
        />
      </div>
      <button @click="blockSiteManually" class="block-btn toggle-button block-manual-button">Block</button>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from "vue";

const blockedSites = ref([]);
const unproductiveSites = ref([]);
const allSites = ref([]);
const newBlockedSite = ref("");

// Load all sites
const loadSites = () => {
  chrome.storage.local.get(["blockedSites", "siteCategories"], (data) => {
    blockedSites.value = Array.isArray(data.blockedSites) ? data.blockedSites : [];
    const siteCategories = data.siteCategories || {};

    unproductiveSites.value = Object.keys(siteCategories).filter(
      (site) => siteCategories[site] === "unproductive"
    );

    // Display all unique sites
    allSites.value = [...new Set([...blockedSites.value, ...unproductiveSites.value])];
  });
};

// Toggle block/unblock
const toggleBlockSite = (site) => {
  chrome.storage.local.get("blockedSites", (data) => {
    let blocked = Array.isArray(data.blockedSites) ? data.blockedSites : [];

    if (blocked.includes(site)) {
      blocked = blocked.filter((s) => s !== site);
    } else {
      blocked.push(site);
    }

    chrome.storage.local.set({ blockedSites: blocked }, () => {
      loadSites();
      updateBlockingRules();
    });
  });
};

// Manually add a block
const blockSiteManually = () => {
  let url = newBlockedSite.value.trim();
  if (!url) return;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  try {
    url = new URL(url).hostname;
  } catch (e) {
    alert("Invalid URL format.");
    return;
  }

  chrome.storage.local.get("blockedSites", (data) => {
    let blocked = Array.isArray(data.blockedSites) ? data.blockedSites : [];

    if (!blocked.includes(url)) {
      blocked.push(url);
      chrome.storage.local.set({ blockedSites: blocked }, () => {
        newBlockedSite.value = "";
        loadSites();
        updateBlockingRules();
      });
    } else {
      alert("This site is already blocked.");
    }
  });
};

// Trigger background script
const updateBlockingRules = () => {
  chrome.runtime.sendMessage({ action: "updateBlockingRules" });
};

// Listen for changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites || changes.siteCategories) {
    loadSites();
  }
});

onMounted(loadSites);
</script>

<style>
.block-tab {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.main-heading {
  color: #333;
  font-size: 24px;
  margin-bottom: 12px;
}

.description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
  font-size: 14px;
}

.sites-list {
  margin-bottom: 30px;
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
}

.site-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
}

.site-item:last-child {
  border-bottom: none;
}

.site-item:nth-child(odd) {
  background-color: #f9f9f9;
}

.site-url {
  font-weight: 500;
}

.toggle-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.block-btn {
  background-color: #e53935;
  color: white;
}

.block-btn:hover {
  background-color: #c62828;
}

.unblock-btn {
  background-color: #4caf50;
  color: white;
}

.unblock-btn:hover {
  background-color: #388e3c;
}

.manual-block-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 6px;
}

.section-heading {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.input-group {
  display: flex;
  margin-bottom: 10px;
  width: 100%;
}

.site-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}

.site-input:focus {
  outline: none;
  border-color: #2196f3;
}

.block-manual-button {
  margin-top: 5px;
  height: 36px;
  width: 100px;
}
</style>