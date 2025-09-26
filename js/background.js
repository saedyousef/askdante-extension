// Import break regulation classes
importScripts(
    'breakRegulation/BaseBreakRegulation.js',
    'breakRegulation/NoRegulation.js',
    'breakRegulation/FixedRule.js',
    'breakRegulation/DynamicMultiThresholdRule.js',
    'breakRegulation/GermanArbeitszeitgesetzRule.js',
    'breakRegulation/BreakRegulationManager.js',
    'breakRegulation/BreakSessionTracker.js'
);

// background.js is a script that runs in the background and manages the extension's lifecycle, including event listeners and message passing.
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'update') {
        chrome.notifications.create('updateNotification', {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('img/icon_48x48.png'),
            title: 'Extension Updated: New Features Added!',
            message:
                'What\'s New:\n' +
                '- Terminal-style status display with aligned columns\n' +
                '- Performance optimizations (90% fewer updates)\n' +
                '- Flexible break time regulations\n' +
                '- Multiple regulation modes (None, Fixed, Dynamic, German Law)\n' +
                '- Enhanced break validation and visual indicators\n' +
                'Enjoy the improved experience!',
            priority: 1
        });
    }
});

// Initialize break regulation manager
const breakRegulationManager = new BreakRegulationManager();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.timeData) {
        chrome.storage.sync.get(["breakRegulationConfig", "applyTimeRules"], function (result) {
            const breakRegulationConfig = result.breakRegulationConfig || { type: 'none', config: {} };
            const applyTimeRules = result.applyTimeRules || false;
            
            // Initialize break regulation manager with config
            breakRegulationManager.initialize(breakRegulationConfig).then(() => {
                const calculationResult = calculateTimeWithBreakRegulation(message.timeData, applyTimeRules);
                sendResponse({ 
                    totalTime: calculationResult.formattedTime,
                    breakInfo: calculationResult.breakInfo
                });
            }).catch(error => {
                console.error('Error initializing break regulation:', error);
                // Fallback to old calculation
                const totalMinutes = calculateTimeLegacy(message.timeData, applyTimeRules);
                const formattedTime = formatTime(totalMinutes);
                sendResponse({ totalTime: formattedTime });
            });
        });
        return true; // Keeps the message port open for async response
    }
});

/**
 * Calculate time with new break regulation system
 */
function calculateTimeWithBreakRegulation(timeData, applyTimeRules) {
    // Calculate basic work time
    const workMinutes = calculateBasicWorkTime(timeData);
    
    if (!applyTimeRules) {
        return {
            formattedTime: formatTime(workMinutes),
            breakInfo: null
        };
    }

    // Track break sessions
    const breakTracker = new BreakSessionTracker();
    const breakSessions = breakTracker.parseBreakSessions(timeData);
    
    // Calculate break requirements
    const breakRequirement = breakRegulationManager.calculateBreakRequirement(workMinutes, breakSessions);
    
    // Apply break regulation
    let adjustedWorkMinutes = workMinutes;
    if (breakRequirement.isCapped) {
        adjustedWorkMinutes = breakRequirement.cappedAt;
    }

    return {
        formattedTime: formatTime(adjustedWorkMinutes),
        breakInfo: {
            workMinutes: workMinutes,
            adjustedWorkMinutes: adjustedWorkMinutes,
            breakRequirement: breakRequirement,
            breakSessions: breakSessions,
            breakSummary: breakTracker.getBreakSummary()
        }
    };
}

/**
 * Calculate basic work time without break regulations
 */
function calculateBasicWorkTime(timeData) {
    let totalMinutes = 0;
    let currentStartTime = null;

    timeData.forEach((record) => {
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
    });

    // If still working, add current time
    if (currentStartTime) {
        const now = new Date();
        totalMinutes += (now - currentStartTime) / 60000;
    }

    return totalMinutes;
}

/**
 * Legacy calculation function for fallback
 */
function calculateTimeLegacy(timeData, applyTimeRules) {
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
    const minutes = Math.floor(totalMinutes % 60).toString().padStart(2, '0');  // Add leading zero

    const totalFormatted = `${hours}:${minutes}`;

    const remainingMinutes = Math.max(480 - totalMinutes, 0); // 8 working hours
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMinutesFormatted = Math.floor(remainingMinutes % 60).toString().padStart(2, '0');  // Add leading zero

    const remainingFormatted = `${remainingHours}:${remainingMinutesFormatted}`;

    return { totalFormatted, remainingFormatted };
}
