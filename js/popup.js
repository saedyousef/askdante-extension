// popup.js - Simplified popup for AskDante Time Tracker
document.addEventListener('DOMContentLoaded', function () {
    const toggleTotalTime = document.getElementById('toggleTotalTime');
    const toggleTimeRules = document.getElementById('toggleTimeRules');
    const labelTotalTime = document.getElementById('labelTotalTime');
    const labelTimeRules = document.getElementById('labelTimeRules');
    const breakInfo = document.getElementById('breakInfo');
    const currentBreakMode = document.getElementById('currentBreakMode');
    const openSettingsBtn = document.getElementById('openSettingsBtn');

    // Load saved states
    chrome.storage.sync.get(['showTotalTime', 'applyTimeRules', 'breakRegulationConfig'], function(result) {
        toggleTotalTime.checked = result.showTotalTime || false;
        toggleTimeRules.checked = result.applyTimeRules || false;
        
        // Load break regulation config
        const breakConfig = result.breakRegulationConfig || { type: 'none', config: {} };
        updateBreakModeDisplay(breakConfig.type);
        
        // Show break info if time rules are enabled
        if (toggleTimeRules.checked) {
            breakInfo.style.display = 'block';
        }
    });

    // Handle translations
    const userLang = navigator.language || navigator.userLanguage;
    const isGerman = userLang.startsWith('de');

    const translations = {
        en: {
            totalTimeLabel: 'Show Total Working Time',
            timeRulesLabel: 'Apply Time Regulations',
            openSettings: 'Open Settings'
        },
        de: {
            totalTimeLabel: 'Gesamte Arbeitszeit anzeigen',
            timeRulesLabel: 'Zeitregeln anwenden',
            openSettings: 'Einstellungen öffnen'
        }
    };

    const lang = isGerman ? 'de' : 'en';
    const text = translations[lang];

    // Update labels with translations
    labelTotalTime.textContent = text.totalTimeLabel;
    labelTimeRules.textContent = text.timeRulesLabel;
    openSettingsBtn.textContent = text.openSettings;

    // Event Listeners
    toggleTotalTime.addEventListener('change', function () {
        chrome.storage.sync.set({ showTotalTime: toggleTotalTime.checked });
        updateContentScript('showTotalTime', toggleTotalTime.checked);
    });

    toggleTimeRules.addEventListener('change', function () {
        chrome.storage.sync.set({ applyTimeRules: toggleTimeRules.checked });
        updateContentScript('applyTimeRules', toggleTimeRules.checked);
        
        // Show/hide break info
        if (toggleTimeRules.checked) {
            breakInfo.style.display = 'block';
        } else {
            breakInfo.style.display = 'none';
        }
    });

    // Open settings page
    openSettingsBtn.addEventListener('click', function() {
        chrome.tabs.create({ url: chrome.runtime.getURL('html/settings.html') });
    });

    // Helper functions
    function updateContentScript(key, value) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { [key]: value });
            }
        });
    }

    function updateBreakModeDisplay(mode) {
        const modeNames = {
            'none': 'No Regulation',
            'fixed': 'Fixed Rule',
            'dynamic': 'Dynamic Multi-Threshold',
            'german': 'German Arbeitszeitgesetz'
        };
        
        if (currentBreakMode) {
            currentBreakMode.textContent = modeNames[mode] || 'Unknown';
        }
    }
});