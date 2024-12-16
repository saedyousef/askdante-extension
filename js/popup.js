// popup.js is the JavaScript file that is executed when the popup is opened.
document.addEventListener('DOMContentLoaded', function () {
    const toggleTotalTime = document.getElementById('toggleTotalTime');
    const toggleTimeRules = document.getElementById('toggleTimeRules');
    const labelTotalTime = document.getElementById('labelTotalTime');
    const labelTimeRules = document.getElementById('labelTimeRules');

    // Load saved states
    chrome.storage.sync.get(['showTotalTime', 'applyTimeRules'], function(result) {
        toggleTotalTime.checked = result.showTotalTime || false;
        toggleTimeRules.checked = result.applyTimeRules || false;
    });

    // Handle translations
    const userLang = navigator.language || navigator.userLanguage;
    const isGerman = userLang.startsWith('de');

    const translations = {
        en: {
            totalTimeLabel: 'Show Total Working Time',
            timeRulesLabel: 'Apply Time Regulations'
        },
        de: {
            totalTimeLabel: 'Gesamte Arbeitszeit anzeigen',
            timeRulesLabel: 'Zeitregeln anwenden'
        }
    };

    const lang = isGerman ? 'de' : 'en';
    const text = translations[lang];

    // Update labels with translations
    labelTotalTime.textContent = text.totalTimeLabel;
    labelTimeRules.textContent = text.timeRulesLabel;

    // Event Listeners for Checkboxes
    toggleTotalTime.addEventListener('change', function () {
        chrome.storage.sync.set({ showTotalTime: toggleTotalTime.checked });
        updateContentScript('showTotalTime', toggleTotalTime.checked);
    });

    toggleTimeRules.addEventListener('change', function () {
        chrome.storage.sync.set({ applyTimeRules: toggleTimeRules.checked });
        updateContentScript('applyTimeRules', toggleTimeRules.checked);
    });

    // Send data to content.js
    function updateContentScript(key, value) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { [key]: value });
            }
        });
    }
});
