// content.js is a content script that runs in the context of the web page.
window.onload = function () {
    const userLang = navigator.language || navigator.userLanguage;
    const isGerman = userLang.startsWith('de');

    const translations = {
        en: { totalWorkingTime: 'Total Working Time:', remainingTime: 'Remaining Time:' },
        de: { totalWorkingTime: 'Gesamte Arbeitszeit:', remainingTime: 'Verbleibende Zeit:' }
    };

    const lang = isGerman ? 'de' : 'en';
    const text = translations[lang];

    setTimeout(function () {
        refreshData(text);

        chrome.storage.onChanged.addListener(function () {
            refreshData(text);
        });
    }, 200);
};

// Create the time card with a refresh button
function createCardElement() {
    const totalTimeElement = document.createElement('div');
    totalTimeElement.id = 'total-working-time';
    totalTimeElement.className = 'total-working-time';
    return totalTimeElement;
}

// Refresh data and update display
function refreshData(text) {
    const timeElements = document.querySelectorAll('tbody tr');
    const timeData = [];

    timeElements.forEach(element => {
        const time = element.querySelector('td:nth-child(1)').textContent.trim();
        const action = element.querySelector('td:nth-child(2)').textContent.trim();
        if (time && action && ['come', 'go', 'kommen', 'gehen', 'komen', 'gaan'].includes(action.toLowerCase())) {
            timeData.push(`${time} ${action}`);
        }
    });

    chrome.runtime.sendMessage({ timeData }, (response) => {
        if (!response || !response.totalTime) {
            console.error("Error: Response not received or invalid format.");
            return;
        }

        let totalTimeElement = document.getElementById('total-working-time');
        if (!totalTimeElement) {
            totalTimeElement = createCardElement();
            document.body.appendChild(totalTimeElement);
        }

        chrome.storage.local.set({ totalTime: response.totalTime }, function () {
            updateDisplayFromStorage(totalTimeElement, text);
        });
    });
}

// Update display from storage
function updateDisplayFromStorage(element, text) {
    chrome.storage.sync.get(['showTotalTime', 'applyTimeRules'], function (result) {
        const showTotalTime = result.showTotalTime || false;
        const applyTimeRules = result.applyTimeRules || false;

        chrome.storage.local.get('totalTime', (result) => {
            const totalTime = result.totalTime || { totalFormatted: '0 hours and 0 minutes', remainingFormatted: '8 hours and 0 minutes' };
            updateDisplay(element, showTotalTime, applyTimeRules, totalTime, text);
        });
    });
}

function updateDisplay(element, showTotalTime, applyTimeRules, totalTime, text) {
    element.style.display = showTotalTime || applyTimeRules ? 'block' : 'none';
    element.innerHTML = '';

    // Total Working Time Section
    if (showTotalTime) {
        element.innerHTML += `
            <div style="width: 100%; margin-bottom: 10px; display: flex; justify-content: space-between;">
                <span style="font-size: 20px; color: #2c3e50;">
                    ${text.totalWorkingTime}
                </span>
                <span style="font-size: 30px; color: #333;">
                    ${formatTimeAsHM(totalTime.totalFormatted)}
                </span>
            </div>
        `;
    }

    // Remaining Time Section
    if (applyTimeRules) {
        element.innerHTML += `
            <div style="width: 100%; margin-top: 10px; display: flex; justify-content: space-between;">
                <span style="font-size: 20px; color: #2c3e50;">
                    ${text.remainingTime}
                </span>
                <span style="font-size: 30px; color: #333;">
                    ${formatTimeAsHM(totalTime.remainingFormatted)}
                </span>
            </div>
        `;
    }

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

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'refreshData') {
        const userLang = navigator.language || navigator.userLanguage;
        const isGerman = userLang.startsWith('de');
        const translations = {
            en: { totalWorkingTime: 'Total Working Time:', remainingTime: 'Remaining Time:' },
            de: { totalWorkingTime: 'Gesamte Arbeitszeit:', remainingTime: 'Verbleibende Zeit:' }
        };
        const lang = isGerman ? 'de' : 'en';
        const text = translations[lang];

        refreshData(text);
    }
});
