
document.addEventListener("DOMContentLoaded", () => {
    const siteList = document.getElementById("site-list");
    const addSiteBtn = document.getElementById("add-site");
    const manualUrlInput = document.getElementById("manual-url");

    // Tab Switching Logic
    const tabButtons = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Remove active class from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            // Add active class to clicked tab and show the correct content
            button.classList.add("active");
            const targetTab = button.getAttribute("data-tab");
            document.getElementById(targetTab).classList.add("active");
        });
    });

    // Load saved site categories
    function loadSites() {
        chrome.storage.local.get(["siteCategories", "blockedSites"], data => {
            let siteCategories = data.siteCategories || {};
            let blockedSites = data.blockedSites || [];
            updateSiteList(siteCategories, blockedSites);
        });
    }
    
    // Add manual site
    addSiteBtn.addEventListener("click", () => {
        let url = manualUrlInput.value.trim();
        if (!url) return;

        try {
            url = new URL(url).hostname;
        } catch (e) {
            alert("Invalid URL format. Please enter a valid URL.");
            return;
        }

        chrome.storage.local.get("siteCategories", data => {
            let siteCategories = data.siteCategories || {};
            siteCategories[url] = "unclassified";

            chrome.storage.local.set({ siteCategories }, () => {
                updateSiteList(siteCategories);
                manualUrlInput.value = "";
            });
        });
    });

    function updateSiteList(siteCategories, blockedSites) {
        siteList.innerHTML = "";
    
        Object.keys(siteCategories).forEach(site => {
            const li = document.createElement("li");
            li.textContent = site + " - " + siteCategories[site];
    
            const productiveBtn = document.createElement("button");
            productiveBtn.textContent = "Productive";
            productiveBtn.addEventListener("click", () => updateCategory(site, "productive"));
    
            const unproductiveBtn = document.createElement("button");
            unproductiveBtn.textContent = "Unproductive";
            unproductiveBtn.addEventListener("click", () => updateCategory(site, "unproductive"));
    
            li.appendChild(productiveBtn);
            li.appendChild(unproductiveBtn);
            siteList.appendChild(li);
        });
    
        // Update Block Site Tab
        updateBlockList(siteCategories, blockedSites);
    }
    
    function updateBlockList(siteCategories, blockedSites) {
        let blockList = document.getElementById("block-list");
        blockList.innerHTML = ""; // Clear list before updating
    
        Object.keys(siteCategories).forEach(site => {
            if (siteCategories[site] === "unproductive") {
                const li = document.createElement("li");
                li.textContent = site;
    
                const blockBtn = document.createElement("button");
                blockBtn.textContent = blockedSites.includes(site) ? "Unblock" : "Block";
    
                blockBtn.addEventListener("click", () => {
                    toggleBlockSite(site);
                });
    
                li.appendChild(blockBtn);
                blockList.appendChild(li);
            }
        });
    }
    

    function toggleBlockSite(site) {
        chrome.storage.local.get(["siteCategories", "blockedSites"], (data) => {
            let siteCategories = data.siteCategories || {};
            let blockedSites = data.blockedSites || [];
    
            if (blockedSites.includes(site)) {
                blockedSites = blockedSites.filter(s => s !== site);
            } else {
                blockedSites.push(site);
            }
    
            chrome.storage.local.set({ blockedSites }, () => {
                console.log("Blocked sites after update:", blockedSites);
                chrome.runtime.sendMessage({ action: "updateBlockedSites" });
                updateBlockList(siteCategories, blockedSites); // ✅ Update UI immediately
            });
        });
    }
    
    
    function updateCategory(site, category) {
        chrome.storage.local.get(["siteCategories", "blockedSites"], data => {
            let siteCategories = data.siteCategories || {};
            let blockedSites = data.blockedSites || [];
    
            siteCategories[site] = category;
    
            // Automatically add to blockedSites if marked "unproductive"
            if (category === "unproductive" && !blockedSites.includes(site)) {
                blockedSites.push(site);
            } else if (category === "productive") {
                blockedSites = blockedSites.filter(s => s !== site); // Remove from blocked
            }
    
            chrome.storage.local.set({ siteCategories, blockedSites }, () => {
                chrome.runtime.sendMessage({ action: "updateBlockedSites" });
                updateSiteList(siteCategories);
            });
        });
    }
    

    // Activate the first tab by default
    tabButtons[0].click();
    loadSites();
});