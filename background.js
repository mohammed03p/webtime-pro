let activeTabId = null;
let startTime = Date.now();
let currentUrl = null;
let currentDay = getTodayDate(); // ✅ track the day

// Update current URL
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

// Track active tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (!activeInfo || !activeInfo.tabId) return;
  activeTabId = activeInfo.tabId;
  startTime = Date.now();
  updateCurrentUrl();
});

// Track URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    try {
      const url = new URL(changeInfo.url).hostname;
      updateSiteCategories(url);
    } catch (e) {}
  }
});

// Track website visits
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId !== 0) return;
  try {
    const url = new URL(details.url).hostname;
    updateSiteCategories(url);
  } catch (e) {}
}, { url: [{ schemes: ["http", "https"] }] });

// Save site category if missing
function updateSiteCategories(url) {
  chrome.storage.local.get("siteCategories", (data) => {
    let siteCategories = data.siteCategories || {};
    if (!(url in siteCategories)) {
      siteCategories[url] = "unclassified";
      chrome.storage.local.set({ siteCategories });
    }
  });
}

// Get today's date string
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

// Track time spent
setInterval(() => {
  if (!activeTabId || !currentUrl) return;

  const nowDay = getTodayDate();
  if (nowDay !== currentDay) {
    console.log(`🕛 Day changed from ${currentDay} to ${nowDay}`);
    startTime = Date.now(); // Reset cleanly
    currentDay = nowDay;
  }

  const timeSpent = (Date.now() - startTime) / 1000;
  logTime(currentUrl, timeSpent);

  startTime = Date.now();
}, 5000);

// Log time grouped by date
function logTime(url, timeSpent) {
  const today = getTodayDate();
  chrome.storage.local.get({ timeLogs: {} }, (data) => {
    const timeLogs = data.timeLogs;
    if (!timeLogs[today]) {
      timeLogs[today] = {};
    }
    timeLogs[today][url] = (timeLogs[today][url] || 0) + timeSpent;
    chrome.storage.local.set({ timeLogs });
  });
}

// Update dynamic blocking rules
function updateBlockingRules() {
  chrome.storage.local.get(["blockedSites"], (data) => {
    let blockedSites = Array.isArray(data.blockedSites) ? data.blockedSites : [];

    chrome.declarativeNetRequest.getDynamicRules((rules) => {
      const existingIds = rules.map(r => r.id);

      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingIds,
        addRules: []
      }, () => {
        const randomStartId = Math.floor(Math.random() * 10000) + 1000;
        const newRules = blockedSites.map((site, index) => ({
          id: randomStartId + index,
          priority: 1,
          action: {
            type: "redirect",
            redirect: { extensionPath: "/blocked.html" }
          },
          condition: {
            urlFilter: site + "/*",
            resourceTypes: ["main_frame"]
          }
        }));

        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [],
          addRules: newRules
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error updating blocking rules:", chrome.runtime.lastError.message);
          } else {
            console.log("Blocking rules updated successfully.");
          }
        });
      });
    });
  });
}

// Listen for blockedSites changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) {
    console.log("Blocked sites changed.");
    updateBlockingRules();
  }
});

// Handle incoming messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateBlockingRules") {
    updateBlockingRules();
  }
});

// Goal deadline reminders
setInterval(checkGoalDeadlines, 5 * 60 * 1000);

function checkGoalDeadlines() {
  chrome.storage.local.get("goals", (data) => {
    const goals = Array.isArray(data.goals) ? data.goals : [];
    const now = Date.now();
    goals.forEach((goal) => {
      if (!goal.deadline || goal.completed) return;
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

// Send notification
function sendGoalNotification(goalText, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/bell.png",
    title: "Goal Reminder",
    message: `${goalText} - ${message}`
  });
}

// Initial blocking rules setup
updateBlockingRules();
