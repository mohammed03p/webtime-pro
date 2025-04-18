<template>
    <div>
        <h2>Blocked Sites</h2>
        <ul>
            <li v-for="site in allBlockedSites" :key="site">
                {{ site }}
                <button @click="toggleBlockSite(site)">
                    {{ blockedSites.includes(site) ? "Unblock" : "Block" }}
                </button>
            </li>
        </ul>

        <h4>Manually Block a Site</h4>
        <input v-model="newBlockedSite" placeholder="Enter site URL">
        <button @click="blockSiteManually">Block</button>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const blockedSites = ref([]); // Manually blocked sites
const unproductiveSites = ref([]); // Sites from categorisation
const allBlockedSites = ref([]); // Merged list
const newBlockedSite = ref("");

// ✅ Load both blocked and unproductive sites
const loadBlockedSites = () => {
    chrome.storage.local.get(["blockedSites", "siteCategories"], (data) => {
        blockedSites.value = Array.isArray(data.blockedSites) ? data.blockedSites : [];
        let siteCategories = data.siteCategories || {};

        // Unproductive sites from categorisation
        unproductiveSites.value = Object.keys(siteCategories).filter(
            (site) => siteCategories[site] === "unproductive"
        );

        // ✅ Merge both but **only treat as blocked if in blockedSites**
        allBlockedSites.value = [...new Set([...blockedSites.value, ...unproductiveSites.value])];

        console.log("Blocked Sites:", blockedSites.value);
        console.log("Unproductive Sites:", unproductiveSites.value);
        console.log("All Blocked Sites:", allBlockedSites.value);
    });
};

// ✅ Toggle block/unblock correctly
const toggleBlockSite = (site) => {
    chrome.storage.local.get("blockedSites", (data) => {
        let blocked = Array.isArray(data.blockedSites) ? data.blockedSites : [];

        if (blocked.includes(site)) {
            blocked = blocked.filter((s) => s !== site);
        } else {
            blocked.push(site);
        }

        chrome.storage.local.set({ blockedSites: blocked }, () => {
            console.log(`Blocked sites updated: ${blocked}`);
            loadBlockedSites();
            updateBlockingRules();
        });
    });
};

// ✅ Manually block a site (Fixed URL Handling)
const blockSiteManually = () => {
    let url = newBlockedSite.value.trim();
    if (!url) return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
    }

    try {
        url = new URL(url).hostname; // Extract domain
    } catch (e) {
        alert("Invalid URL format. Please enter a valid URL.");
        return;
    }

    chrome.storage.local.get("blockedSites", (data) => {
        let blocked = Array.isArray(data.blockedSites) ? data.blockedSites : [];

        if (!blocked.includes(url)) {
            blocked.push(url);
            chrome.storage.local.set({ blockedSites: blocked }, () => {
                console.log(`Added blocked site: ${url}`);
                newBlockedSite.value = "";
                loadBlockedSites();
                updateBlockingRules();
            });
        }
    });
};

// ✅ Update blocking rules after changes
const updateBlockingRules = () => {
    chrome.runtime.sendMessage({ action: "updateBlockingRules" });
};

chrome.storage.onChanged.addListener((changes) => {
    if (changes.blockedSites) {
        loadBlockedSites();
    }
});

onMounted(loadBlockedSites);
</script>
