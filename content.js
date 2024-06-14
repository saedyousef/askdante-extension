window.onload = function() {
    setTimeout(function() {
        let timeElements = document.querySelectorAll('tbody tr');
        let timeData = [];

        timeElements.forEach(element => {
            let time = element.querySelector('td:nth-child(1)').textContent.trim();
            let action = element.querySelector('td:nth-child(2)').textContent.trim();

            if (time && action) {
                if (action.toLowerCase().includes('come') || action.toLowerCase().includes('go') ||
                    action.toLowerCase().includes('kommen') || action.toLowerCase().includes('gehen') ||
                    action.toLowerCase().includes('komen') || action.toLowerCase().includes('gaan')) {
                    timeData.push(`${time} ${action}`);
                }
            }
        });

        chrome.runtime.sendMessage({ timeData: timeData }, (response) => {
            let totalTimeElement = document.getElementById('total-working-time');

            if (!totalTimeElement) {
                totalTimeElement = document.createElement('div');
                totalTimeElement.id = 'total-working-time';
                totalTimeElement.style.position = 'fixed';
                totalTimeElement.style.bottom = '10px';
                totalTimeElement.style.right = '10px';
                totalTimeElement.style.backgroundColor = '#f0f0f0';
                totalTimeElement.style.padding = '10px';
                totalTimeElement.style.border = '1px solid #ccc';
                totalTimeElement.style.borderRadius = '5px';
                totalTimeElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                totalTimeElement.style.fontSize = '12px';
                totalTimeElement.style.fontFamily = 'Arial, sans-serif';
                totalTimeElement.style.color = '#333';
                totalTimeElement.style.zIndex = '1000';
                document.body.appendChild(totalTimeElement);
            }

            chrome.storage.sync.get(['showRemaining', 'showTotalTime'], function(result) {
                const showRemaining = result.showRemaining || false;
                const showTotalTime = result.showTotalTime || false;
                updateDisplay(totalTimeElement, showTotalTime, showRemaining, response.totalTime);
            });

            chrome.storage.local.set({ totalTime: response.totalTime });
        });

        chrome.storage.local.get('totalTime', (result) => {
            let totalTime = result.totalTime || { totalFormatted: '0 hours and 0 minutes', remainingFormatted: '8 hours and 0 minutes' };
            let totalTimeElement = document.getElementById('total-working-time');

            if (!totalTimeElement) {
                totalTimeElement = document.createElement('div');
                totalTimeElement.id = 'total-working-time';
                totalTimeElement.style.position = 'fixed';
                totalTimeElement.style.bottom = '10px';
                totalTimeElement.style.right = '10px';
                totalTimeElement.style.backgroundColor = '#f0f0f0';
                totalTimeElement.style.padding = '10px';
                totalTimeElement.style.border = '1px solid #ccc';
                totalTimeElement.style.borderRadius = '5px';
                totalTimeElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                totalTimeElement.style.fontSize = '12px';
                totalTimeElement.style.fontFamily = 'Arial, sans-serif';
                totalTimeElement.style.color = '#333';
                totalTimeElement.style.zIndex = '1000';
                document.body.appendChild(totalTimeElement);
            }

            chrome.storage.sync.get(['showRemaining', 'showTotalTime'], function(result) {
                const showRemaining = result.showRemaining || false;
                const showTotalTime = result.showTotalTime || false;
                updateDisplay(totalTimeElement, showTotalTime, showRemaining, totalTime);
            });
        });
    }, 200);
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let totalTimeElement = document.getElementById('total-working-time');
    if (totalTimeElement) {
        chrome.storage.local.get('totalTime', (result) => {
            let totalTime = result.totalTime || { totalFormatted: '0 hours and 0 minutes', remainingFormatted: '8 hours and 0 minutes' };
            if (request.showRemaining !== undefined || request.showTotalTime !== undefined) {
                chrome.storage.sync.get(['showRemaining', 'showTotalTime'], function(result) {
                    const showRemaining = request.showRemaining !== undefined ? request.showRemaining : result.showRemaining;
                    const showTotalTime = request.showTotalTime !== undefined ? request.showTotalTime : result.showTotalTime;
                    updateDisplay(totalTimeElement, showTotalTime, showRemaining, totalTime);
                });
            }
        });
    }
});

function updateDisplay(element, showTotalTime, showRemaining, totalTime) {
    if (showTotalTime) {
        element.innerHTML = `<strong>Total Working Time:</strong> ${totalTime.totalFormatted}`;
        if (showRemaining) {
            element.innerHTML += `<br/><strong>Remaining Time:</strong> ${totalTime.remainingFormatted}.`;
        }
    } else {
        if (showRemaining) {
            element.innerHTML = `<strong> Remaining Time:</strong> ${totalTime.remainingFormatted}`;
        } else {
            element.innerHTML = '';
        }
    }
}
