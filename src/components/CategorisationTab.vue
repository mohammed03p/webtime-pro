<template>
    <div>
      <h3>Site Categorisation</h3>
      <ul>
        <li v-for="site in sites" :key="site">
          {{ site }} - {{ siteCategories[site] || 'Unclassified' }}
          <button @click="setCategory(site, 'productive')">Productive</button>
          <button @click="setCategory(site, 'unproductive')">Unproductive</button>
          <button @click="removeSite(site)">Remove</button>
        </li>
      </ul>
      <h4>Manually Add a Site</h4>
      <input v-model="newSite" placeholder="Enter site URL" />
      <button @click="addSite">Add</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  
  const sites = ref([]);
  const siteCategories = ref({});
  const newSite = ref("");
  
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
  
    try {
      url = new URL(url).hostname;
    } catch (e) {
      alert("Invalid URL format.");
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
  