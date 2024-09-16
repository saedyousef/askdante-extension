document.addEventListener('DOMContentLoaded', function () {
    const toggleRemaining = document.getElementById('toggleRemaining');
    const toggleTotalTime = document.getElementById('toggleTotalTime');
    const toggleTimeFormat = document.getElementById('toggleTimeFormat');
    const labelTotalTime = document.getElementById('labelTotalTime');
    const labelRemainingTime = document.getElementById('labelRemainingTime');
    const labelTimeFormat = document.getElementById('labelTimeFormat');

    // Retrieve the stored toggle states
    chrome.storage.sync.get(['showRemaining', 'showTotalTime', 'useClockFormat'], function(result) {
        toggleRemaining.checked = result.showRemaining || false;
        toggleTotalTime.checked = result.showTotalTime || false;
        toggleTimeFormat.checked = result.useClockFormat || false;
    });

    // Handle translations
    const userLang = navigator.language || navigator.userLanguage;
    const isGerman = userLang.startsWith('de');

    const translations = {
        en: {
            totalTimeLabel: 'Show Total Working Time',
            remainingTimeLabel: 'Show Remaining Time',
            timeFormatLabel: 'Use Clock Format (HH:MM:SS)',
        },
        de: {
            totalTimeLabel: 'Gesamte Arbeitszeit anzeigen',
            remainingTimeLabel: 'Verbleibende Zeit anzeigen',
            timeFormatLabel: 'Uhrzeitformat verwenden (HH:MM:SS)',
        }
    };

    const lang = isGerman ? 'de' : 'en';
    const text = translations[lang];

    labelTotalTime.textContent = text.totalTimeLabel;
    labelRemainingTime.textContent = text.remainingTimeLabel;
    labelTimeFormat.textContent = text.timeFormatLabel;

    toggleRemaining.addEventListener('change', function () {
        const showRemaining = toggleRemaining.checked;
        chrome.storage.sync.set({ showRemaining: showRemaining });
        updateContentScript('showRemaining', showRemaining);
    });

    toggleTotalTime.addEventListener('change', function () {
        const showTotalTime = toggleTotalTime.checked;
        chrome.storage.sync.set({ showTotalTime: showTotalTime });
        updateContentScript('showTotalTime', showTotalTime);
    });

    toggleTimeFormat.addEventListener('change', function () {
        const useClockFormat = toggleTimeFormat.checked;
        chrome.storage.sync.set({ useClockFormat: useClockFormat });
        updateContentScript('useClockFormat', useClockFormat);
    });

    function updateContentScript(key, value) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { [key]: value });
        });
    }
});
