class CheggMonitorPopup {
    constructor() {
        this.elements = {
            keyword: document.getElementById('keyword'),
            interval: document.getElementById('interval'),
            monitorToggle: document.getElementById('monitorToggle'),
            statusBadge: document.getElementById('statusBadge'),
            statsSection: document.getElementById('statsSection'),
            lastRefresh: document.getElementById('lastRefresh'),
            keywordCount: document.getElementById('keywordCount'),
            refreshCount: document.getElementById('refreshCount'),
            testAlert: document.getElementById('testAlert'),
            clearStats: document.getElementById('clearStats')
        };

        this.init();
    }

    async init() {
        await this.loadSettings();
        this.bindEvents();
        this.updateUI();
        
        // Listen for updates from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'statsUpdate') {
                this.updateStats(message.data);
            }
        });
    }

    async loadSettings() {
        const result = await chrome.storage.sync.get([
            'keyword',
            'interval',
            'isActive',
            'stats'
        ]);

        this.elements.keyword.value = result.keyword || '';
        this.elements.interval.value = result.interval || 5;
        this.elements.monitorToggle.checked = result.isActive || false;
        
        if (result.stats) {
            this.updateStats(result.stats);
        }
    }

    bindEvents() {
        // Input changes
        this.elements.keyword.addEventListener('input', (e) => {
            this.saveSettings();
            this.updateTestButton();
        });

        this.elements.interval.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value >= 1 && value <= 300) {
                this.saveSettings();
            }
        });

        // Toggle monitoring
        this.elements.monitorToggle.addEventListener('change', async (e) => {
            const isActive = e.target.checked;
            await this.toggleMonitoring(isActive);
        });

        // Test alert button
        this.elements.testAlert.addEventListener('click', () => {
            this.testAlert();
        });

        // Clear stats button
        this.elements.clearStats.addEventListener('click', () => {
            this.clearStats();
        });
    }

    async saveSettings() {
        const settings = {
            keyword: this.elements.keyword.value.trim(),
            interval: parseInt(this.elements.interval.value) || 5,
            isActive: this.elements.monitorToggle.checked
        };

        await chrome.storage.sync.set(settings);
        
        // Notify content script of changes
        if (settings.isActive) {
            this.sendMessageToContentScript({
                type: 'updateSettings',
                settings: settings
            });
        }
    }

    async toggleMonitoring(isActive) {
        await this.saveSettings();
        
        if (isActive && !this.elements.keyword.value.trim()) {
            this.elements.monitorToggle.checked = false;
            alert('Please enter a keyword to monitor before enabling.');
            return;
        }

        // Send message to background script
        chrome.runtime.sendMessage({
            type: 'toggleMonitoring',
            isActive: isActive,
            settings: {
                keyword: this.elements.keyword.value.trim(),
                interval: parseInt(this.elements.interval.value) || 5
            }
        });

        this.updateUI();
        
        if (isActive) {
            this.elements.statsSection.style.display = 'block';
        }
    }

    updateUI() {
        const isActive = this.elements.monitorToggle.checked;
        const hasKeyword = this.elements.keyword.value.trim().length > 0;
        
        // Update status badge
        this.elements.statusBadge.textContent = isActive ? 'ON' : 'OFF';
        this.elements.statusBadge.className = `status-badge ${isActive ? 'active' : ''}`;
        
        // Update test button
        this.elements.testAlert.disabled = !hasKeyword;
        
        // Show/hide stats
        this.elements.statsSection.style.display = isActive ? 'block' : 'none';
    }

    updateTestButton() {
        const hasKeyword = this.elements.keyword.value.trim().length > 0;
        this.elements.testAlert.disabled = !hasKeyword;
    }

    updateStats(stats) {
        this.elements.lastRefresh.textContent = stats.lastRefresh || 'Never';
        this.elements.keywordCount.textContent = stats.keywordCount || 0;
        this.elements.refreshCount.textContent = stats.refreshCount || 0;
    }

    testAlert() {
        const keyword = this.elements.keyword.value.trim();
        if (!keyword) return;

        // Send test alert to content script
        this.sendMessageToContentScript({
            type: 'testAlert',
            keyword: keyword
        });

        // Also show notification
        chrome.runtime.sendMessage({
            type: 'showNotification',
            title: 'Test Alert',
            message: `Testing alert for keyword: "${keyword}"`
        });
    }

    clearStats() {
        chrome.runtime.sendMessage({ type: 'clearStats' });
        this.updateStats({
            lastRefresh: 'Never',
            keywordCount: 0,
            refreshCount: 0
        });
    }

    sendMessageToContentScript(message) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {
                    // Content script might not be injected yet
                });
            }
        });
    }
}

// Initialize popup when DOM is loaded  
document.addEventListener('DOMContentLoaded', () => {
    new CheggMonitorPopup();
});