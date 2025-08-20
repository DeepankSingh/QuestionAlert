class CheggMonitorContent {
    constructor() {
        this.isActive = false;
        this.settings = { keyword: '', interval: 5 };
        this.refreshInterval = null;
        this.highlightedElements = [];
        this.lastScanContent = '';
        this.observer = null;

        this.init();
    }

    init() {
        // Listen for messages from popup and background
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true;
        });

        // Get initial settings from background
        chrome.runtime.sendMessage({ type: 'getSettings' }, (response) => {
            if (response) {
                this.isActive = response.isActive;
                this.settings = response.settings;
                
                if (this.isActive && this.settings.keyword) {
                    this.startMonitoring();
                }
            }
        });

        // Set up mutation observer for dynamic content
        this.setupMutationObserver();
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'toggleMonitoring':
                this.toggleMonitoring(message.isActive, message.settings);
                break;

            case 'updateSettings':
                this.updateSettings(message.settings);
                break;

            case 'testAlert':
                this.testAlert(message.keyword);
                break;
        }
    }

    toggleMonitoring(isActive, settings) {
        this.isActive = isActive;
        this.settings = settings;

        if (isActive) {
            this.startMonitoring();
        } else {
            this.stopMonitoring();
        }
    }

    updateSettings(settings) {
        const oldInterval = this.settings.interval;
        this.settings = settings;

        // Restart monitoring with new settings if active
        if (this.isActive) {
            // If interval changed, restart the refresh timer
            if (oldInterval !== settings.interval) {
                this.stopRefreshTimer();
                this.startRefreshTimer();
            }
            
            // Re-scan with new keyword
            this.scanForKeyword();
        }
    }

    startMonitoring() {
        if (!this.settings.keyword.trim()) return;

        console.log(`[Chegg Monitor] Starting monitoring for keyword: "${this.settings.keyword}"`);
        
        this.startRefreshTimer();
        this.scanForKeyword(); // Initial scan
    }

    stopMonitoring() {
        console.log('[Chegg Monitor] Stopping monitoring');
        
        this.stopRefreshTimer();
        this.clearHighlights();
        this.lastScanContent = '';
    }

    startRefreshTimer() {
        this.stopRefreshTimer(); // Clear any existing timer
        
        this.refreshInterval = setInterval(() => {
            this.refreshPage();
        }, this.settings.interval * 1000);
    }

    stopRefreshTimer() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    refreshPage() {
        console.log('[Chegg Monitor] Refreshing page');
        
        // Update refresh stats
        chrome.runtime.sendMessage({
            type: 'updateStats',
            stats: {
                lastRefresh: new Date().toLocaleTimeString(),
                refreshCount: Date.now() // Using timestamp to increment
            }
        });

        window.location.reload();
    }

    scanForKeyword() {
        if (!this.settings.keyword.trim()) return;

        const keyword = this.settings.keyword.toLowerCase();
        const pageContent = document.body.innerText.toLowerCase();

        // Only process if content has changed since last scan
        if (pageContent === this.lastScanContent) return;
        this.lastScanContent = pageContent;

        // Clear previous highlights
        this.clearHighlights();

        // Find all text nodes containing the keyword
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip script and style elements
                    const parent = node.parentElement;
                    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    return node.textContent.toLowerCase().includes(keyword) 
                        ? NodeFilter.FILTER_ACCEPT 
                        : NodeFilter.FILTER_REJECT;
                }
            }
        );

        const foundNodes = [];
        let node;
        while (node = walker.nextNode()) {
            foundNodes.push(node);
        }

        if (foundNodes.length > 0) {
            console.log(`[Chegg Monitor] Found keyword "${this.settings.keyword}" in ${foundNodes.length} places`);
            
            // Highlight all instances
            foundNodes.forEach(textNode => {
                this.highlightKeywordInNode(textNode, this.settings.keyword);
            });

            // Play alert sound
            this.playAlertSound();

            // Notify background script
            chrome.runtime.sendMessage({
                type: 'keywordFound',
                keyword: this.settings.keyword,
                text: foundNodes[0].textContent
            });

            // Scroll to first occurrence
            if (this.highlightedElements.length > 0) {
                this.highlightedElements[0].scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        }
    }

    highlightKeywordInNode(textNode, keyword) {
        const parent = textNode.parentNode;
        const text = textNode.textContent;
        const regex = new RegExp(`(${keyword})`, 'gi');
        
        if (regex.test(text)) {
            // Create a container for the highlighted content
            const container = document.createElement('span');
            const parts = text.split(regex);
            
            parts.forEach((part, index) => {
                if (part.toLowerCase() === keyword.toLowerCase()) {
                    // This is the keyword, highlight it
                    const highlight = document.createElement('span');
                    highlight.style.cssText = `
                        background-color: #fbbf24 !important;
                        color: #92400e !important;
                        padding: 2px 4px !important;
                        border-radius: 3px !important;
                        font-weight: bold !important;
                        box-shadow: 0 0 10px rgba(251, 191, 36, 0.5) !important;
                        animation: pulse 1s ease-in-out !important;
                    `;
                    highlight.textContent = part;
                    highlight.classList.add('chegg-monitor-highlight');
                    container.appendChild(highlight);
                    this.highlightedElements.push(highlight);
                } else if (part) {
                    // Regular text
                    container.appendChild(document.createTextNode(part));
                }
            });
            
            parent.replaceChild(container, textNode);
        }
    }

    clearHighlights() {
        // Remove highlight styles and unwrap elements
        const highlights = document.querySelectorAll('.chegg-monitor-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize(); // Merge adjacent text nodes
        });
        
        this.highlightedElements = [];
    }

    playAlertSound() {
        try {
            // Create audio element with extension sound
            const audio = new Audio(chrome.runtime.getURL('alert.mp3'));
            audio.volume = 0.7;
            audio.play().catch(error => {
                console.log('[Chegg Monitor] Could not play alert sound:', error);
                
                // Fallback: try to use Web Audio API to generate a beep
                this.playBeepSound();
            });
        } catch (error) {
            console.log('[Chegg Monitor] Audio error:', error);
            this.playBeepSound();
        }
    }

    playBeepSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('[Chegg Monitor] Could not generate beep sound:', error);
        }
    }

    testAlert(keyword) {
        // Temporarily highlight any instances of the test keyword
        const tempKeyword = this.settings.keyword;
        this.settings.keyword = keyword;
        
        this.scanForKeyword();
        this.playAlertSound();
        
        // Restore original keyword after a moment
        setTimeout(() => {
            this.settings.keyword = tempKeyword;
        }, 100);
    }

    setupMutationObserver() {
        // Watch for dynamic content changes
        this.observer = new MutationObserver((mutations) => {
            if (!this.isActive || !this.settings.keyword) return;
            
            let shouldScan = false;
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any added nodes contain text
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.TEXT_NODE || 
                            (node.nodeType === Node.ELEMENT_NODE && node.textContent)) {
                            shouldScan = true;
                            break;
                        }
                    }
                }
            });
            
            if (shouldScan) {
                // Debounce scanning to avoid excessive calls
                clearTimeout(this.scanTimeout);
                this.scanTimeout = setTimeout(() => {
                    this.scanForKeyword();
                }, 500);
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
}

// Add CSS for highlight animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CheggMonitorContent();
    });
} else {
    new CheggMonitorContent();
}