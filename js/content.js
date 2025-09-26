// content.js is a content script that runs in the context of the web page.
// Performance optimized version

// Global variables to avoid repeated calculations
let translations = null;
let text = null;
let isInitialized = false;
let refreshTimeout = null;
let storageListener = null;
let lastUpdateTime = 0;
let lastDataHash = null;
let updateInterval = null;

// Initialize only once
function initialize() {
    if (isInitialized) return;
    
    const userLang = navigator.language || navigator.userLanguage;
    const isGerman = userLang.startsWith('de');

    translations = {
        en: { 
            totalWorkingTime: 'Tracked Time', 
            remainingTime: 'Remaining',
            breakInfo: 'Break',
            requiredBreak: 'Required',
            takenBreak: 'Taken',
            remainingBreak: 'Remaining',
            workCapped: 'Work time capped at threshold',
            noBreakRequired: 'No break required yet'
        },
        de: { 
            totalWorkingTime: 'Erfasste Zeit', 
            remainingTime: 'Verbleibend',
            breakInfo: 'Pause',
            requiredBreak: 'Erforderlich',
            takenBreak: 'Genommen',
            remainingBreak: 'Verbleibend',
            workCapped: 'Arbeitszeit auf Schwellenwert begrenzt',
            noBreakRequired: 'Noch keine Pause erforderlich'
        }
    };

    text = translations[isGerman ? 'de' : 'en'];
    isInitialized = true;

    // Smart refresh function that only updates when needed
    function smartRefresh() {
        const now = Date.now();
        
        // Only update if enough time has passed (minimum 5 seconds between updates)
        if (now - lastUpdateTime < 5000) {
            return;
        }
        
        lastUpdateTime = now;
        refreshData(text);
    }

    // Debounced refresh function for storage changes
    function debouncedRefresh() {
        if (refreshTimeout) {
            clearTimeout(refreshTimeout);
        }
        refreshTimeout = setTimeout(() => {
            smartRefresh();
        }, 1000);
    }

    // Initial refresh
    smartRefresh();

    // Ensure element is created even if no data initially
    setTimeout(() => {
        let element = document.getElementById('total-working-time');
        if (!element || !document.contains(element)) {
            element = createCardElement();
            // Show with default data if no real data yet
            updateDisplayFromStorage(element, text);
        }
    }, 1000);

    // Set up periodic updates (every 30 seconds instead of constant updates)
    if (!updateInterval) {
        updateInterval = setInterval(() => {
            smartRefresh();
            // Also ensure element exists
            let element = document.getElementById('total-working-time');
            if (!element || !document.contains(element)) {
                element = createCardElement();
                updateDisplayFromStorage(element, text);
            }
        }, 30000);
    }

    // Add storage listener only once
    if (!storageListener) {
        storageListener = debouncedRefresh;
        chrome.storage.onChanged.addListener(storageListener);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Create the time card with robust DOM manipulation
function createCardElement() {
    // Check if element already exists and is in DOM
    let totalTimeElement = document.getElementById('total-working-time');
    if (totalTimeElement && document.contains(totalTimeElement)) {
        return totalTimeElement;
    }
    
    // Remove any orphaned element
    if (totalTimeElement) {
        totalTimeElement.remove();
    }
    
    totalTimeElement = document.createElement('div');
    totalTimeElement.id = 'total-working-time';
    totalTimeElement.className = 'total-working-time';
    
    // Try multiple strategies to find the right container
    let container = null;
    
    // Strategy 1: Look for existing cards/sidebar
    const sidebar = document.querySelector('.sidebar, [class*="sidebar"], [class*="right"], aside') || 
                   document.querySelector('main')?.querySelector('div:last-child');
    
    if (sidebar) {
        container = sidebar;
        totalTimeElement.style.position = 'relative';
        totalTimeElement.style.marginTop = '20px';
        totalTimeElement.style.width = '100%';
    } else {
        // Strategy 2: Look for any container with cards
        const cardContainers = document.querySelectorAll('[class*="card"], [class*="tile"], [class*="info"]');
        for (const cardContainer of cardContainers) {
            if (cardContainer.parentNode && cardContainer.textContent.includes('time')) {
                container = cardContainer.parentNode;
                totalTimeElement.style.position = 'relative';
                totalTimeElement.style.marginTop = '20px';
                totalTimeElement.style.width = '100%';
                break;
            }
        }
    }
    
    // Strategy 3: Fallback to body
    if (!container) {
        container = document.body;
        totalTimeElement.style.position = 'fixed';
        totalTimeElement.style.bottom = '20px';
        totalTimeElement.style.right = '20px';
        totalTimeElement.style.width = '300px';
        totalTimeElement.style.zIndex = '1000';
    }
    
    container.appendChild(totalTimeElement);
    console.log('Created time tracker element in:', container);
    
    return totalTimeElement;
}

// Optimized refresh data function with change detection
function refreshData(text) {
    // Cache DOM queries
    const timeElements = document.querySelectorAll('tbody tr');
    if (timeElements.length === 0) {
        return; // No data to process
    }
    
    const timeData = [];
    const validActions = new Set(['come', 'go', 'kommen', 'gehen', 'komen', 'gaan']);

    // Optimize DOM traversal
    for (let i = 0; i < timeElements.length; i++) {
        const element = timeElements[i];
        const cells = element.querySelectorAll('td');
        if (cells.length >= 2) {
            const time = cells[0].textContent.trim();
            const action = cells[1].textContent.trim();
            if (time && action && validActions.has(action.toLowerCase())) {
                timeData.push(`${time} ${action}`);
            }
        }
    }

    // Only send message if we have data
    if (timeData.length === 0) {
        return;
    }

    // Create a simple hash to detect changes
    const dataHash = timeData.join('|');
    if (dataHash === lastDataHash) {
        return; // No changes, skip update
    }
    lastDataHash = dataHash;

    chrome.runtime.sendMessage({ timeData }, (response) => {
        if (!response || !response.totalTime) {
            return; // Silent fail to reduce console noise
        }

        // Always ensure element exists
        let totalTimeElement = document.getElementById('total-working-time');
        if (!totalTimeElement || !document.contains(totalTimeElement)) {
            totalTimeElement = createCardElement();
        }

        chrome.storage.local.set({ 
            totalTime: response.totalTime,
            breakInfo: response.breakInfo || null
        }, function () {
            updateDisplayFromStorage(totalTimeElement, text);
        });
    });
}

// Update display from storage
function updateDisplayFromStorage(element, text) {
    // Ensure element exists
    if (!element || !document.contains(element)) {
        element = createCardElement();
    }
    
    chrome.storage.sync.get(['showTotalTime', 'applyTimeRules'], function (result) {
        const showTotalTime = result.showTotalTime || false;
        const applyTimeRules = result.applyTimeRules || false;

        chrome.storage.local.get(['totalTime', 'breakInfo'], (result) => {
            const totalTime = result.totalTime || { totalFormatted: '0 hours and 0 minutes', remainingFormatted: '8 hours and 0 minutes' };
            const breakInfo = result.breakInfo || null;
            updateDisplay(element, showTotalTime, applyTimeRules, totalTime, breakInfo, text);
        });
    });
}

// Optimized update display function with aligned status block
function updateDisplay(element, showTotalTime, applyTimeRules, totalTime, breakInfo, text) {
    const shouldShow = showTotalTime || applyTimeRules;
    element.style.display = shouldShow ? 'block' : 'none';
    
    if (!shouldShow) {
        return; // Early return to avoid unnecessary processing
    }

    // Build status block with proper alignment
    let statusLines = [];
    
    // Total Working Time
    if (showTotalTime) {
        statusLines.push({
            icon: '⏱',
            label: text.totalWorkingTime,
            value: formatTimeAsHM(totalTime.totalFormatted)
        });
    }

    // Remaining Time
    if (applyTimeRules) {
        statusLines.push({
            icon: '⌛',
            label: text.remainingTime,
            value: formatTimeAsHM(totalTime.remainingFormatted)
        });
    }

    // Break Status
    if (applyTimeRules && breakInfo && breakInfo.breakRequirement) {
        const breakReq = breakInfo.breakRequirement;
        const breakStatus = breakReq.isCapped ? text.workCapped : text.noBreakRequired;
        statusLines.push({
            icon: '☕',
            label: 'Break Status',
            value: breakReq.message || breakStatus
        });
    }

    // Find the longest label to align colons
    const maxLabelLength = Math.max(...statusLines.map(line => line.label.length));
    
    // Build aligned status block
    let statusBlock = '';
    statusLines.forEach(line => {
        const paddedLabel = line.label.padEnd(maxLabelLength);
        statusBlock += `${line.icon} ${paddedLabel} : ${line.value}\n`;
    });

    // Create the HTML with proper formatting
    const html = `
        <div style="
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
            color: #ffffff;
            background-color: #1a1a1a;
            padding: 12px 16px;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.1);
            white-space: pre-line;
            text-align: left;
            margin: 8px 0;
        ">
${statusBlock}
        </div>
    `;

    // Single DOM update
    element.innerHTML = html;
}

function formatTimeAsHM(timeString) {
    const parts = timeString.match(/(\d+) hours? and (\d+) minutes?/i);
    if (parts) {
        const hours = parts[1];
        let minutes = parts[2];
        if (minutes.length === 1) {
            minutes = '0' + minutes;
        }
        return `${hours}:${minutes}`;
    }
    return timeString;
}

function formatMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

// Optimized message listener
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'refreshData' && text) {
        refreshData(text);
    }
    if (message.action === 'ensureElement' && text) {
        let element = document.getElementById('total-working-time');
        if (!element || !document.contains(element)) {
            element = createCardElement();
            updateDisplayFromStorage(element, text);
        }
    }
});

// Cleanup function to prevent memory leaks
function cleanup() {
    if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        refreshTimeout = null;
    }
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    if (storageListener) {
        chrome.storage.onChanged.removeListener(storageListener);
        storageListener = null;
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
