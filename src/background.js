"use strict";

function setBadgeText(enabled) {
    const text = enabled ? "ON" : "OFF";
    void chrome.action.setBadgeText({ text: text });
}

function startUp() {
    chrome.storage.sync.get("enabled", (data) => {
        setBadgeText(!!data.enabled);
    });
}

// Ensure the background script always runs.
chrome.runtime.onStartup.addListener(startUp);
chrome.runtime.onInstalled.addListener(startUp);

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'QUESTION_FOUND_NOTIFICATION') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',  // Replace with the path to your notification icon
            title: 'Question is found on CHEGG',
            message: request.message,
            priority: 1
        });
    }
});
