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

    // If the last action is "come" and not paired with "go", calculate time till now
    if (currentStartTime) {
        let now = new Date();
        totalMinutes += (now - currentStartTime) / 60000; // Convert milliseconds to minutes
    }

    console.log('Total Minutes:', totalMinutes);
    console.log('Break Minutes:', breakMinutes);

    // Deduct necessary breaks according to German law
    if (totalMinutes > 360 && totalMinutes <= 540) {
        if (breakMinutes < 30) {
            totalMinutes -= (30 - breakMinutes);
        }
    } else if (totalMinutes > 540) {
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
