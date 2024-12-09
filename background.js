chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'update') {
        chrome.notifications.create('updateNotification', {
            type: 'basic',
            iconUrl: 'icon_48x48.png',
            title: 'Extension Updated: New Features Added!',
            message:
                'What\'s New:\n' +
                '- Time now displayed as h:m format (e.g., 5:37)\n' +
                '- Labels and values aligned for clarity\n' +
                '- Responsive card height for better display\n' +
                '- Seamless "Apply Time Rules" support\n' +
                'Enjoy the improved experience!',
            priority: 2
        });
    }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.timeData) {
        chrome.storage.sync.get(["applyTimeRules"], function (result) {
            const applyTimeRules = result.applyTimeRules || false;
            const totalMinutes = calculateTime(message.timeData, applyTimeRules);
            const formattedTime = formatTime(totalMinutes);

            if (formattedTime) {
                sendResponse({ totalTime: formattedTime });
            } else {
                sendResponse({ totalTime: { totalFormatted: '0 hours and 0 minutes', remainingFormatted: '8 hours and 0 minutes' } });
            }
        });
        return true; // Keeps the message port open for async response
    }
});

function calculateTime(timeData, applyTimeRules) {
    let totalMinutes = 0;
    let currentStartTime = null;
    let breakMinutes = 0;

    timeData.forEach((record, index) => {
        let [time, action] = record.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        let recordTime = new Date();
        recordTime.setHours(hours, minutes, 0, 0);

        if (['come', 'kommen', 'komen'].includes(action.toLowerCase())) {
            currentStartTime = recordTime;
        } else if (['go', 'gehen', 'gaan'].includes(action.toLowerCase()) && currentStartTime) {
            totalMinutes += (recordTime - currentStartTime) / 60000; // Convert ms to minutes
            currentStartTime = null;
        }

        // Break time calculation
        if (applyTimeRules && index > 0) {
            const [prevTime, prevAction] = timeData[index - 1].split(' ');
            const [prevHours, prevMinutes] = prevTime.split(':').map(Number);
            const prevRecordTime = new Date();
            prevRecordTime.setHours(prevHours, prevMinutes, 0, 0);

            if (['go', 'gehen', 'gaan'].includes(prevAction.toLowerCase()) &&
                ['come', 'kommen', 'komen'].includes(action.toLowerCase())) {
                breakMinutes += (recordTime - prevRecordTime) / 60000;
            }
        }
    });

    // If still working, add current time
    if (currentStartTime) {
        const now = new Date();
        totalMinutes += (now - currentStartTime) / 60000;
    }

    if (applyTimeRules) {
        if (totalMinutes > 360 && totalMinutes <= 540 && breakMinutes < 30) {
            totalMinutes -= (30 - breakMinutes); // 30 mins break required
        } else if (totalMinutes > 540 && breakMinutes < 45) {
            totalMinutes -= (45 - breakMinutes); // 45 mins break required
        }
    }

    return totalMinutes;
}

function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const totalFormatted = `${hours} hours and ${minutes} minutes`;

    const remainingMinutes = Math.max(480 - totalMinutes, 0); // 8 working hours
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingFormatted = `${remainingHours} hours and ${remainingMinutes % 60} minutes`;

    return { totalFormatted, remainingFormatted };
}
