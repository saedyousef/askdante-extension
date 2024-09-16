chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'update') {
        chrome.notifications.create('updateNotification', {
            type: 'basic',
            iconUrl: 'icon_48x48.png',
            title: 'Extension Updated to Version 2.0',
            message: 'Release Notes:\n\n- Fixed an issue where the extension was running on non-virtual terminal pages.\n- Redesigned the time card.\n- Added a new option to display time in clock format.',
            priority: 2
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let totalTime = calculateTime(message.timeData);
    sendResponse({ totalTime: formatTime(totalTime) });
});

function calculateTime(timeData) {
    let totalMinutes = 0;
    let currentStartTime = null;
    let breakMinutes = 0;

    timeData.forEach((record, index) => {
        let [time, action] = record.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        let recordTime = new Date();
        recordTime.setHours(hours);
        recordTime.setMinutes(minutes);
        recordTime.setSeconds(0);
        recordTime.setMilliseconds(0);

        if (['come', 'kommen', 'komen'].includes(action.toLowerCase())) {
            currentStartTime = recordTime;
        } else if (['go', 'gehen', 'gaan'].includes(action.toLowerCase())) {
            if (currentStartTime) {
                totalMinutes += (recordTime - currentStartTime) / 60000; // Convert milliseconds to minutes
                currentStartTime = null;
            }
        }

        // Calculate break time
        if (index > 0) {
            let [prevTime, prevAction] = timeData[index - 1].split(' ');
            let [prevHours, prevMinutes] = prevTime.split(':').map(Number);
            let prevRecordTime = new Date();
            prevRecordTime.setHours(prevHours);
            prevRecordTime.setMinutes(prevMinutes);
            prevRecordTime.setSeconds(0);
            prevRecordTime.setMilliseconds(0);

            if (['go', 'gehen', 'gaan'].includes(prevAction.toLowerCase()) && ['come', 'kommen', 'komen'].includes(action.toLowerCase())) {
                breakMinutes += (recordTime - prevRecordTime) / 60000; // Convert milliseconds to minutes
            }
        }
    });


    if (currentStartTime) {
        let now = new Date();
        totalMinutes += (now - currentStartTime) / 60000;
    }

    if (totalMinutes > 360 && totalMinutes <= 540) { // More than 6 hours, less than or equal to 9 hours
        if (breakMinutes < 30) {
            totalMinutes -= (30 - breakMinutes);
        }
    } else if (totalMinutes > 540) { // More than 9 hours
        if (breakMinutes < 45) {
            totalMinutes -= (45 - breakMinutes);
        }
    }

    return totalMinutes;
}

function formatTime(totalMinutes) {
    let hours = Math.floor(totalMinutes / 60);
    let minutes = Math.floor(totalMinutes % 60);
    let totalFormatted = `${hours} hours and ${minutes} minutes`;
    let remainingMinutes = Math.max(480 - totalMinutes, 0);
    let remainingHours = Math.floor(remainingMinutes / 60);
    remainingMinutes = Math.floor(remainingMinutes % 60);
    let remainingFormatted = `${remainingHours} hours and ${remainingMinutes} minutes`;

    return { totalFormatted, remainingFormatted };
}
