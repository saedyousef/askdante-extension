document.addEventListener('DOMContentLoaded', function () {
    const toggleRemaining = document.getElementById('toggleRemaining');
    const toggleTotalTime = document.getElementById('toggleTotalTime');

    // Retrieve the stored toggle states
    chrome.storage.sync.get(['showRemaining', 'showTotalTime'], function(result) {
        toggleRemaining.checked = result.showRemaining || false;
        toggleTotalTime.checked = result.showTotalTime || false;
    });

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

    function updateContentScript(key, value) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { [key]: value });
        });
    }
});
