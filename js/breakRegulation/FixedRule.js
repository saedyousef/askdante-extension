/**
 * Fixed break rule - always deduct X minutes after Y hours
 */
class FixedRule extends BaseBreakRegulation {
    constructor(config = {}) {
        super(config);
        this.afterHours = config.afterHours || 6;
        this.requiredBreakMinutes = config.requiredBreakMinutes || 30;
    }

    calculateBreakRequirement(workMinutes, breakSessions) {
        const afterMinutes = this.afterHours * 60;
        const takenMinutes = this.getTotalValidBreakTime(breakSessions);
        
        if (workMinutes <= afterMinutes) {
            return {
                requiredMinutes: 0,
                takenMinutes: takenMinutes,
                remainingMinutes: 0,
                isCapped: false,
                cappedAt: null,
                message: `Work time: ${this.formatTime(workMinutes)} (no break required yet)`
            };
        }

        const remainingMinutes = Math.max(0, this.requiredBreakMinutes - takenMinutes);
        const isCapped = remainingMinutes > 0;
        const cappedAt = isCapped ? afterMinutes : null;

        return {
            requiredMinutes: this.requiredBreakMinutes,
            takenMinutes: takenMinutes,
            remainingMinutes: remainingMinutes,
            isCapped: isCapped,
            cappedAt: cappedAt,
            message: `Threshold: ${this.afterHours}h → Required: ${this.requiredBreakMinutes}m. Taken: ${takenMinutes}m. Remaining: ${remainingMinutes}m.`
        };
    }
}
