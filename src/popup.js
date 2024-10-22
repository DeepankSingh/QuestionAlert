"use strict"

console.log("Hello world from popup!");

function setBadgeText(enabled){
    const text = enabled ? "ON" : "OFF";
    void chrome.action.setBadgeText({text: text});
}

// Handle ON/OFF switch

const checkbox = document.getElementById("enabled");
chrome.storage.sync.get("enabled", (data) => {
    checkbox.checked = !!data.enabled;
    void setBadgeText(data.enabled);
});

