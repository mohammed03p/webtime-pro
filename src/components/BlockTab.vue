<template>
    <div>
      <h2>Blocked Sites</h2>
      <ul>
        <li v-for="site in allSites" :key="site">
          {{ site }}
          <button @click="toggleBlockSite(site)">
            {{ blockedSites.includes(site) ? "Unblock" : "Block" }}
          </button>
        </li>
      </ul>
  
      <h4>Manually Block a Site</h4>
      <input v-model="newBlockedSite" placeholder="Enter site URL" />
      <button @click="blockSiteManually">Block</button>
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
  