/**
 * German Arbeitszeitgesetz §4 break regulation
 * After 6–9h → 30m required break (segments ≥15m)
 * After >9h → 45m required break (segments ≥15m)
 */
class GermanArbeitszeitgesetzRule extends BaseBreakRegulation {
    constructor(config = {}) {
        super(config);
        // German law requires minimum 15 minutes for valid breaks
        this.minValidBreakMinutes = 15;
    }

    calculateBreakRequirement(workMinutes, breakSessions) {
        const takenMinutes = this.getTotalValidBreakTime(breakSessions);
        
        // After 9 hours: 45 minutes required
        if (workMinutes > 540) { // 9 hours = 540 minutes
            const remainingMinutes = Math.max(0, 45 - takenMinutes);
            const isCapped = remainingMinutes > 0;
            const cappedAt = isCapped ? 540 : null;

            return {
                requiredMinutes: 45,
                takenMinutes: takenMinutes,
                remainingMinutes: remainingMinutes,
                isCapped: isCapped,
                cappedAt: cappedAt,
                message: `German Law (>9h): Required 45m. Taken: ${takenMinutes}m. Remaining: ${remainingMinutes}m.`
            };
        }
        
        // After 6 hours: 30 minutes required
        if (workMinutes > 360) { // 6 hours = 360 minutes
            const remainingMinutes = Math.max(0, 30 - takenMinutes);
            const isCapped = remainingMinutes > 0;
            const cappedAt = isCapped ? 360 : null;

            return {
                requiredMinutes: 30,
                takenMinutes: takenMinutes,
                remainingMinutes: remainingMinutes,
                isCapped: isCapped,
                cappedAt: cappedAt,
                message: `German Law (6-9h): Required 30m. Taken: ${takenMinutes}m. Remaining: ${remainingMinutes}m.`
            };
        }

        // No break required yet
        return {
            requiredMinutes: 0,
            takenMinutes: takenMinutes,
            remainingMinutes: 0,
            isCapped: false,
            cappedAt: null,
            message: `Work time: ${this.formatTime(workMinutes)} (no break required yet)`
        };
    }
}
