let activeTabId = null;
let startTime = Date.now();
let currentUrl = null;

// Track tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (!activeInfo || !activeInfo.tabId) return;
  activeTabId = activeInfo.tabId;
  startTime = Date.now();
  updateCurrentUrl();
});

// Listen for URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    let url;
    try {
      url = new URL(changeInfo.url).hostname;
    } catch (e) {
      return; 
    }

    chrome.storage.local.get("siteCategories", (data) => {
      let siteCategories = data.siteCategories || {};
      if (!(url in siteCategories)) {
        siteCategories[url] = "unclassified"; // Default to unclassified
      }
      chrome.storage.local.set({ siteCategories });
    });
  }
});

// Track website visits
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    if (details.frameId !== 0) return; // Ignore subframes

    let url;
    try {
      url = new URL(details.url).hostname;
    } catch (e) {
      return;
    }

    chrome.storage.local.get("siteCategories", (data) => {
      let siteCategories = data.siteCategories || {};
      if (!(url in siteCategories)) {
        siteCategories[url] = "unclassified";
        chrome.storage.local.set({ siteCategories });
      }
    });
  },
  { url: [{ schemes: ["http", "https"] }] }
);

// Helper function to get the current URL
function updateCurrentUrl() {
  if (!activeTabId) return;
  chrome.tabs.get(activeTabId, (tab) => {
    if (chrome.runtime.lastError || !tab || !tab.url) return;
    try {
      currentUrl = new URL(tab.url).hostname;
    } catch (e) {
      currentUrl = null;
    }
  });
}

// Periodically log time spent
setInterval(() => {
  if (!activeTabId || !currentUrl) return;
  const timeSpent = (Date.now() - startTime) / 1000;
  logTime(currentUrl, timeSpent);
  startTime = Date.now(); // Reset start time
}, 5000);

// Log time to storage
function logTime(url, timeSpent) {
  chrome.storage.local.get({ timeLogs: {} }, (data) => {
    const timeLogs = data.timeLogs;
    timeLogs[url] = (timeLogs[url] || 0) + timeSpent;
    chrome.storage.local.set({ timeLogs });
  });
}

// Update blocked sites dynamically
function updateBlockedSites() {
  chrome.storage.local.get("blockedSites", (data) => {
      let blockedSites = data.blockedSites;
      if (!Array.isArray(blockedSites)) {
          blockedSites = [];
          chrome.storage.local.set({ blockedSites });
      }

      chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
          let existingIds = existingRules.map(rule => rule.id);
          let newRuleIds = blockedSites.map((_, index) => 1000 + index);

          let newRules = blockedSites.map((site, index) => ({
              "id": newRuleIds[index], 
              "priority": 1,
              "action": { "type": "block" },
              "condition": { "urlFilter": site + "/*", "resourceTypes": ["main_frame"] }
          }));

          chrome.declarativeNetRequest.updateDynamicRules({
              removeRuleIds: existingIds,
              addRules: newRules
          }, () => {
              if (chrome.runtime.lastError) {
                  console.error("Error updating blocked sites:", chrome.runtime.lastError.message);
              } else {
                  console.log("Updated blocked sites:", blockedSites);
              }
          });
      });
  });
}








// Listen for storage changes to update blocked sites
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) {
      console.log("Blocked sites updated:", changes.blockedSites.newValue);
      updateBlockedSites();
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateBlockedSites") {
    console.log("Received message to update blocked sites");
    updateBlockedSites();
  }
});

// Check goals every 5 minutes
setInterval(checkGoalDeadlines, 5 * 60 * 1000);

// Check goal deadlines and notify
function checkGoalDeadlines() {
  chrome.storage.local.get("goals", (data) => {
    const goals = Array.isArray(data.goals) ? data.goals : [];
    const now = Date.now();

    goals.forEach((goal, index) => {
      if (!goal.deadline || goal.completed) return; // skip completed

      const deadlineTime = new Date(goal.deadline).getTime();
      const timeDiff = deadlineTime - now;

      const hoursLeft = timeDiff / (1000 * 60 * 60);

      if (!goal.notified) goal.notified = { "24h": false, "12h": false, "1h": false };

      if (hoursLeft <= 24 && !goal.notified["24h"]) {
        sendGoalNotification(goal.text, "24 hours left!");
        goal.notified["24h"] = true;
      }
      if (hoursLeft <= 12 && !goal.notified["12h"]) {
        sendGoalNotification(goal.text, "12 hours left!");
        goal.notified["12h"] = true;
      }
      if (hoursLeft <= 1 && !goal.notified["1h"]) {
        sendGoalNotification(goal.text, "1 hour left!");
        goal.notified["1h"] = true;
      }
    });

    chrome.storage.local.set({ goals });
  });
}

// Helper function to send notification
function sendGoalNotification(goalText, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/bell.png", // you can replace or add your own small icon
    title: "Goal Reminder!",
    message: "Your goal is due soon!"
  });
}

// Run on startup
updateBlockedSites();
