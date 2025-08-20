class CheggMonitorBackground {
    constructor() {
        this.isActive = false;
        this.settings = {};
        this.stats = {
            lastRefresh: null,
            keywordCount: 0,
            refreshCount: 0
        };
        this.foundKeywords = new Set(); // Track found keywords to prevent duplicates

        this.init();
    }

    init() {
        // Listen for messages from popup and content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        // Handle extension startup
        chrome.runtime.onStartup.addListener(() => {
            this.loadSettings();
        });

        // Handle extension install
        chrome.runtime.onInstalled.addListener(() => {
            this.loadSettings();
        });

        // Load settings on initialization
        this.loadSettings();
    }

    async loadSettings() {
        const result = await chrome.storage.sync.get([
            'isActive',
            'keyword',
            'interval',
            'stats'
        ]);

        this.isActive = result.isActive || false;
        this.settings = {
            keyword: result.keyword || '',
            interval: result.interval || 5
        };
        this.stats = result.stats || this.stats;

        this.updateBadge();
    }

    async handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'toggleMonitoring':
                await this.toggleMonitoring(message.isActive, message.settings);
                break;

            case 'showNotification':
                this.showNotification(message.title, message.message, message.keyword);
                break;

            case 'keywordFound':
                await this.handleKeywordFound(message.keyword, message.text);
                break;

            case 'updateStats':
                await this.updateStats(message.stats);
                break;

            case 'clearStats':
                await this.clearStats();
                break;

            case 'getSettings':
                sendResponse({
                    isActive: this.isActive,
                    settings: this.settings,
                    stats: this.stats
                });
                break;
        }
    }

    async toggleMonitoring(isActive, settings) {
        this.isActive = isActive;
        this.settings = settings;

        await chrome.storage.sync.set({
            isActive: this.isActive,
            ...settings
        });

        this.updateBadge();

        if (!isActive) {
            // Clear found keywords when monitoring is turned off
            this.foundKeywords.clear();
        }

        // Notify all Chegg tabs
        const tabs = await chrome.tabs.query({ url: "https://expert.chegg.com/*" });
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                type: 'toggleMonitoring',
                isActive: this.isActive,
                settings: this.settings
            }).catch(() => {
                // Tab might not have content script injected
            });
        });
    }

    updateBadge() {
        const text = this.isActive ? 'ON' : 'OFF';
        const color = this.isActive ? '#10b981' : '#ef4444';

        chrome.action.setBadgeText({ text });
        chrome.action.setBadgeBackgroundColor({ color });
    }

    showNotification(title, message, keyword = '') {
        const options = {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title,
            message: message,
            priority: 2
        };

        chrome.notifications.create(`chegg-monitor-${Date.now()}`, options);

        // Auto-clear notification after 5 seconds
        setTimeout(() => {
            chrome.notifications.getAll((notifications) => {
                Object.keys(notifications).forEach(id => {
                    if (id.startsWith('chegg-monitor-')) {
                        chrome.notifications.clear(id);
                    }
                });
            });
        }, 5000);
    }

    async handleKeywordFound(keyword, text) {
        // Create a unique identifier for this keyword instance
        const keywordId = `${keyword}-${text.substring(0, 50)}`;
        
        // Check if we've already alerted for this specific instance
        if (this.foundKeywords.has(keywordId)) {
            return; // Don't show duplicate alerts
        }

        this.foundKeywords.add(keywordId);

        // Update stats
        this.stats.keywordCount++;
        await this.updateStats(this.stats);

        // Show notification
        this.showNotification(
            'Keyword Found!',
            `"${keyword}" found on Chegg Expert page`,
            keyword
        );
    }

    async updateStats(newStats) {
        this.stats = { ...this.stats, ...newStats };
        
        await chrome.storage.sync.set({ stats: this.stats });

        // Notify popup if it's open
        chrome.runtime.sendMessage({
            type: 'statsUpdate',
            data: this.stats
        }).catch(() => {
            // Popup might not be open
        });
    }

    async clearStats() {
        this.stats = {
            lastRefresh: null,
            keywordCount: 0,
            refreshCount: 0
        };
        this.foundKeywords.clear();

        await chrome.storage.sync.set({ stats: this.stats });

        // Notify popup
        chrome.runtime.sendMessage({
            type: 'statsUpdate',
            data: this.stats
        }).catch(() => {
            // Popup might not be open
        });
    }
}

// Initialize background service
new CheggMonitorBackground();