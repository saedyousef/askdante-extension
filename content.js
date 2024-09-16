window.onload = function () {
    const userLang = navigator.language || navigator.userLanguage;
    const isGerman = userLang.startsWith('de');

    const translations = {
        en: { totalWorkingTime: 'Total Working Time:', remainingTime: 'Remaining Time:', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' },
        de: { totalWorkingTime: 'Gesamte Arbeitszeit:', remainingTime: 'Verbleibende Zeit:', hours: 'Stunden', minutes: 'Minuten', seconds: 'Sekunden' }
    };

    const lang = isGerman ? 'de' : 'en';
    const text = translations[lang];

    setTimeout(function () {
        let timeElements = document.querySelectorAll('tbody tr');
        let timeData = [];

        timeElements.forEach(element => {
            let time = element.querySelector('td:nth-child(1)').textContent.trim();
            let action = element.querySelector('td:nth-child(2)').textContent.trim();

            if (time && action) {
                if (['come', 'go', 'kommen', 'gehen', 'komen', 'gaan'].some(keyword => action.toLowerCase().includes(keyword))) {
                    timeData.push(`${time} ${action}`);
                }
            }
        });

        chrome.runtime.sendMessage({ timeData: timeData }, (response) => {
            let totalTimeElement = document.getElementById('total-working-time');

            if (!totalTimeElement) {
                totalTimeElement = createCardElement();
                document.body.appendChild(totalTimeElement);
            }

            chrome.storage.local.set({ totalTime: response.totalTime }, function () {
                updateDisplayFromStorage(totalTimeElement, text);
                startClock(totalTimeElement, text);
            });
        });

        updateDisplayFromStorage(document.getElementById('total-working-time') || createCardElement(), text);
    }, 200);

    chrome.storage.onChanged.addListener(function (changes) {
        const totalTimeElement = document.getElementById('total-working-time');
        if (!totalTimeElement) return;

        updateDisplayFromStorage(totalTimeElement, text);
    });
};

function createCardElement() {
    const totalTimeElement = document.createElement('div');
    totalTimeElement.id = 'total-working-time';
    totalTimeElement.style.position = 'fixed';
    totalTimeElement.style.bottom = '10px';
    totalTimeElement.style.right = '10px';
    totalTimeElement.style.width = '240px';
    totalTimeElement.style.minHeight = '120px';
    totalTimeElement.style.backgroundColor = 'white';
    totalTimeElement.style.padding = '20px';
    totalTimeElement.style.border = '1px solid #ddd';
    totalTimeElement.style.borderRadius = '12px';
    totalTimeElement.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
    totalTimeElement.style.fontSize = '18px';
    totalTimeElement.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    totalTimeElement.style.color = 'black';
    totalTimeElement.style.zIndex = '1000';
    totalTimeElement.style.transition = 'all 0.3s ease-in-out';

    totalTimeElement.addEventListener('mouseenter', function () {
        totalTimeElement.style.transform = 'scale(1.05)';
    });
    totalTimeElement.addEventListener('mouseleave', function () {
        totalTimeElement.style.transform = 'scale(1)';
    });

    return totalTimeElement;
}

function updateDisplayFromStorage(element, text) {
    chrome.storage.sync.get(['showRemaining', 'showTotalTime', 'useClockFormat'], function (result) {
        const showRemaining = result.showRemaining || false;
        const showTotalTime = result.showTotalTime || false;
        const useClockFormat = result.useClockFormat || false;

        chrome.storage.local.get('totalTime', (result) => {
            let totalTime = result.totalTime || { totalFormatted: '0 hours and 0 minutes', remainingFormatted: '8 hours and 0 minutes' };
            updateDisplay(element, showTotalTime, showRemaining, totalTime, text, useClockFormat);
        });
    });
}

function updateDisplay(element, showTotalTime, showRemaining, totalTime, text, useClockFormat) {
    if (showTotalTime || showRemaining) {
        element.style.display = 'block'; // Show the card
        element.innerHTML = ''; // Clear previous content
        if (showTotalTime) {
            const totalFormatted = useClockFormat ? formatTimeAsClock(totalTime.totalFormatted, text) : totalTime.totalFormatted;
            element.innerHTML += `<strong style="font-weight: bold; display: block; margin-bottom: 5px;">${text.totalWorkingTime}</strong> <span id="totalTime" data-use-clock-format="${useClockFormat}">${totalFormatted}</span>`;
        }
        if (showRemaining) {
            const remainingFormatted = useClockFormat ? formatTimeAsClock(totalTime.remainingFormatted, text) : totalTime.remainingFormatted;
            element.innerHTML += `<strong style="font-weight: bold; display: block; margin-top: 5px;">${text.remainingTime}</strong> <span id="remainingTime" data-use-clock-format="${useClockFormat}">${remainingFormatted}</span>`;
        }
    } else {
        element.style.display = 'none'; // Hide the card if both options are off
    }
}

function formatTimeAsClock(timeString, text) {
    const parts = timeString.match(/(\d+) hours? and (\d+) minutes?/i);
    if (parts) {
        const hours = parts[1].padStart(2, '0');
        const minutes = parts[2].padStart(2, '0');
        let seconds = 0; // Initialize seconds as 0

        return `${hours}:${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return timeString;
}
function startClock(element, text) {
    let totalParts, remainingParts;

    chrome.storage.local.get('totalTime', (result) => {
        let totalTime = result.totalTime || { totalFormatted: '0 hours and 0 minutes', remainingFormatted: '8 hours and 0 minutes' };

        // Initialize time parts with browser's current time
        const currentSeconds = new Date().getSeconds();
        totalParts = formatTimeAsClock(totalTime.totalFormatted, text).split(':').map(Number);
        remainingParts = formatTimeAsClock(totalTime.remainingFormatted, text).split(':').map(Number);
        totalParts[2] = currentSeconds;
        remainingParts[2] = 60 - currentSeconds;

        setInterval(() => {
            chrome.storage.sync.get(['useClockFormat'], function (storage) {
                const useClockFormat = storage.useClockFormat || false;

                if (useClockFormat) {
                    // Increment total time
                    totalParts[2]++;
                    if (totalParts[2] >= 60) {
                        totalParts[2] = 0;
                        totalParts[1]++;
                    }
                    if (totalParts[1] >= 60) {
                        totalParts[1] = 0;
                        totalParts[0]++;
                    }

                    // Decrement remaining time
                    remainingParts[2]--;
                    if (remainingParts[2] < 0) {
                        remainingParts[2] = 59;
                        remainingParts[1]--;
                    }
                    if (remainingParts[1] < 0) {
                        remainingParts[1] = 59;
                        remainingParts[0]--;
                    }

                    document.getElementById('totalTime').textContent = `${totalParts[0].toString().padStart(2, '0')}:${totalParts[1].toString().padStart(2, '0')}:${totalParts[2].toString().padStart(2, '0')}`;
                    document.getElementById('remainingTime').textContent = `${remainingParts[0].toString().padStart(2, '0')}:${remainingParts[1].toString().padStart(2, '0')}:${remainingParts[2].toString().padStart(2, '0')}`;
                } else {
                    // Display in original format
                    document.getElementById('totalTime').textContent = totalTime.totalFormatted;
                    document.getElementById('remainingTime').textContent = totalTime.remainingFormatted;
                }
            });
        }, 1000); // Update every second
    });
}




