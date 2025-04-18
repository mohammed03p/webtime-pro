document.addEventListener("DOMContentLoaded", () => {
    const blockList = document.getElementById("block-list");
    const blockSiteBtn = document.getElementById("block-site");
    const blockUrlInput = document.getElementById("block-url");

    // Load blocked sites from storage
    function loadBlockedSites() {
        chrome.storage.local.get("blockedSites", data => {
            let blockedSites = data.blockedSites || [];
            updateBlockList(blockedSites);
        });
    }

    // Block a site
    blockSiteBtn.addEventListener("click", () => {
        let url = blockUrlInput.value.trim();
        if (!url) return;

        try {
            url = new URL(url).hostname;
        } catch (e) {
            alert("Invalid URL format. Please enter a valid URL.");
            return;
        }

        chrome.storage.local.get("blockedSites", data => {
            let blockedSites = data.blockedSites || [];
            if (!blockedSites.includes(url)) {
                blockedSites.push(url);
                chrome.storage.local.set({ blockedSites }, () => {
                    updateBlockList(blockedSites);
                    blockUrlInput.value = ""; // Clear input field
                });
            } else {
                alert("Site is already blocked.");
            }
        });
    });

    // Update the UI with blocked sites
    function updateBlockList(blockedSites) {
        blockList.innerHTML = ""; // Clear list
    
        chrome.storage.local.get("siteCategories", data => {
            let siteCategories = data.siteCategories || {};
    
            let sitesToShow = [...new Set([...Object.keys(siteCategories).filter(site => siteCategories[site] === "unproductive"), ...blockedSites])];
    
            sitesToShow.forEach(site => {
                const li = document.createElement("li");
                li.textContent = site;
    
                const toggleBtn = document.createElement("button");
                toggleBtn.textContent = blockedSites.includes(site) ? "Unblock" : "Block";
    
                toggleBtn.addEventListener("click", () => {
                    toggleBlockSite(site);
                });
    
                li.appendChild(toggleBtn);
                blockList.appendChild(li);
            });
        });
    }
    
    function toggleBlockSite(site) {
        chrome.storage.local.get("blockedSites", data => {
            let blockedSites = data.blockedSites || [];
    
            if (blockedSites.includes(site)) {
                blockedSites = blockedSites.filter(s => s !== site); // Remove site
            } else {
                blockedSites.push(site); // Add site
            }
    
            chrome.storage.local.set({ blockedSites }, () => {
                updateBlockList(blockedSites);
                chrome.runtime.sendMessage({ action: "updateBlockedSites" }); // Tell background.js to update rules
            });
        });
    }
    

    // Unblock a site
    function unblockSite(site) {
        chrome.storage.local.get("blockedSites", data => {
            let blockedSites = data.blockedSites || [];
            blockedSites = blockedSites.filter(s => s !== site);
            chrome.storage.local.set({ blockedSites }, () => updateBlockList(blockedSites));
        });
    }
    
    chrome.storage.local.get("blockedSites", data => {
        console.log("Blocked sites data:", data); // Check what it retrieves
    });
    
    loadBlockedSites(); // Load sites on popup open
});
