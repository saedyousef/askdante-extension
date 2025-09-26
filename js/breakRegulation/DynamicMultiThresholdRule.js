/**
 * Dynamic multi-threshold rule - user defines multiple thresholds
 */
class DynamicMultiThresholdRule extends BaseBreakRegulation {
    constructor(config = {}) {
        super(config);
        this.thresholds = config.thresholds || [];
        // Sort thresholds by afterHours to ensure proper processing
        this.thresholds.sort((a, b) => a.afterHours - b.afterHours);
    }

    calculateBreakRequirement(workMinutes, breakSessions) {
        const takenMinutes = this.getTotalValidBreakTime(breakSessions);
        
        // Find the highest threshold that applies
        let applicableThreshold = null;
        for (const threshold of this.thresholds) {
            if (workMinutes > threshold.afterHours * 60) {
                applicableThreshold = threshold;
            }
        }

        if (!applicableThreshold) {
            return {
                requiredMinutes: 0,
                takenMinutes: takenMinutes,
                remainingMinutes: 0,
                isCapped: false,
                cappedAt: null,
                message: `Work time: ${this.formatTime(workMinutes)} (no break required yet)`
            };
        }

        const remainingMinutes = Math.max(0, applicableThreshold.requiredBreakMinutes - takenMinutes);
        const isCapped = remainingMinutes > 0;
        const cappedAt = isCapped ? applicableThreshold.afterHours * 60 : null;

        return {
            requiredMinutes: applicableThreshold.requiredBreakMinutes,
            takenMinutes: takenMinutes,
            remainingMinutes: remainingMinutes,
            isCapped: isCapped,
            cappedAt: cappedAt,
            message: `Threshold: ${applicableThreshold.afterHours}h → Required: ${applicableThreshold.requiredBreakMinutes}m. Taken: ${takenMinutes}m. Remaining: ${remainingMinutes}m.`
        };
    }

    /**
     * Add a new threshold
     * @param {number} afterHours - Hours after which break is required
     * @param {number} requiredBreakMinutes - Required break time in minutes
     */
    addThreshold(afterHours, requiredBreakMinutes) {
        this.thresholds.push({ afterHours, requiredBreakMinutes });
        this.thresholds.sort((a, b) => a.afterHours - b.afterHours);
    }

    /**
     * Remove a threshold by afterHours
     * @param {number} afterHours - Hours to remove threshold for
     */
    removeThreshold(afterHours) {
        this.thresholds = this.thresholds.filter(t => t.afterHours !== afterHours);
    }

    /**
     * Get all thresholds
     * @returns {Array} - Array of threshold objects
     */
    getThresholds() {
        return [...this.thresholds];
    }
}
