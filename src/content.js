"use strict";

const textColor = "red";  // Change this to the desired color
let textToChange = "";
let audio = null;

// Preload the notification sound
function preloadNotificationSound() {
    audio = new Audio(chrome.runtime.getURL('notification-sound.mp3'));
}

// Play the notification sound
function playNotificationSound() {
    if (audio) {
        audio.currentTime = 0; // Reset the audio to start from the beginning
        audio.play().catch((error) => {
            console.error("Failed to play notification sound:", error);
        });
    }
}

// Search this DOM node for the text and change its color if found.
function processNode(node) {
    if (node.childNodes.length > 0) {
        Array.from(node.childNodes).forEach(processNode);
    }
    if (node.nodeType === Node.TEXT_NODE && node.textContent !== null && node.textContent.trim().length > 0) {
        const parent = node.parentElement;
        if (parent !== null && parent.tagName === 'SCRIPT') {
            return; // Ignore script tags
        }
        if (node.textContent.includes(textToChange)) {
            changeTextColor(parent);

            // Play notification sound
            playNotificationSound();

            // Send a message to the background script to show a notification
            chrome.runtime.sendMessage({
                type: 'QUESTION_FOUND_NOTIFICATION',
                message: `!!Question Alert!!`
            });
        }
    }
}

function changeTextColor(elem) {
    elem.style.color = textColor;
    console.debug("Changed text color for id: " + elem.id + " class: " + elem.className + " tag: " + elem.tagName + " text: " + elem.textContent);
}

// Create a MutationObserver to watch for changes to the DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(processNode);
        } else {
            processNode(mutation.target);
        }
    });
});

// Enable the content script by default.
let enabled = true;
const keys = ["enabled", "item"];

chrome.storage.sync.get(keys, (data) => {
    if (data.enabled === false) {
        enabled = false;
    }
    if (data.item) {
        textToChange = data.item;
    }
    // Only start observing the DOM if the extension is enabled and there is text to change
    if (enabled && textToChange.trim().length > 0) {
        preloadNotificationSound();  // Preload the sound when starting the content script
        observer.observe(document, {
            attributes: false,
            characterData: true,
            childList: true,
            subtree: true,
        });
        processNode(document);
    }
});


