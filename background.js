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
        let recordTime = new Date().setHours(hours, minutes, 0, 0);

        if (['come', 'kommen', 'komen'].includes(action.toLowerCase())) {
            if (index > 0) {
                let previousRecord = timeData[index - 1];
                let [previousTime, previousAction] = previousRecord.split(' ');
                let [prevHours, prevMinutes] = previousTime.split(':').map(Number);
                let prevEndTime = new Date().setHours(prevHours, prevMinutes, 0, 0);

                if (['go', 'gehen', 'gaan'].includes(previousAction.toLowerCase())) {
                    breakMinutes += (recordTime - prevEndTime) / 60000;
                }
            }
            currentStartTime = recordTime;
        } else if (['go', 'gehen', 'gaan'].includes(action.toLowerCase())) {
            if (currentStartTime) {
                totalMinutes += (recordTime - currentStartTime) / 60000;
                currentStartTime = null;
            }
        }
    });

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
