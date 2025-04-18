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
        <input v-model="newSite" placeholder="Enter site URL">
        <button @click="addSite">Add</button>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const sites = ref([]);
const siteCategories = ref({});
const blockedSites = ref([]);
const newSite = ref("");

// Load sites from storage
const loadSites = () => {
    chrome.storage.local.get(["siteCategories", "blockedSites"], (data) => {
        siteCategories.value = data.siteCategories || {};
        blockedSites.value = data.blockedSites || [];
        sites.value = Object.keys(siteCategories.value);
    });
};

// Set category and update blocked sites
const setCategory = (site, category) => {
    siteCategories.value[site] = category;

    if (category === "unproductive" && !blockedSites.value.includes(site)) {
        blockedSites.value.push(site);
    } else if (category === "productive") {
        blockedSites.value = blockedSites.value.filter(s => s !== site);
    }

    chrome.storage.local.set({ siteCategories: siteCategories.value, blockedSites: blockedSites.value }, loadSites);
};

// Remove site
const removeSite = (site) => {
    delete siteCategories.value[site];
    blockedSites.value = blockedSites.value.filter(s => s !== site);

    chrome.storage.local.set({ siteCategories: siteCategories.value, blockedSites: blockedSites.value }, loadSites);
};

// Manually add a site
const addSite = () => {
    let url = newSite.value.trim();
    if (!url) return;

    try {
        url = new URL(url).hostname;
    } catch (e) {
        alert("Invalid URL format. Please enter a valid URL.");
        return;
    }

    siteCategories.value[url] = "unclassified";

    chrome.storage.local.set({ siteCategories: siteCategories.value }, () => {
        newSite.value = "";
        loadSites();
    });
};

// React to storage changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.siteCategories || changes.blockedSites) {
        loadSites();
    }
});

onMounted(loadSites);
</script>
