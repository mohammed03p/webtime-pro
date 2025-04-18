document.getElementById("unblock-site").addEventListener("click", function () {
    chrome.storage.local.get("blockedSites", data => {
        let blockedSites = data.blockedSites || [];
        const urlParams = new URLSearchParams(window.location.search);
        let blockedSite = urlParams.get("site");

        if (blockedSite) {
            blockedSites = blockedSites.filter(site => site !== blockedSite);
            chrome.storage.local.set({ blockedSites }, () => {
                chrome.runtime.sendMessage({ action: "updateBlockedSites" }); // Refresh rules
                window.location.href = "https://" + blockedSite; // Redirect back
            });
        }
    });
});
