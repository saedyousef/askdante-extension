/**
 * No break regulation - work time is continuous
 */
class NoRegulation extends BaseBreakRegulation {
    constructor(config = {}) {
        super(config);
    }

    calculateBreakRequirement(workMinutes, breakSessions) {
        return {
            requiredMinutes: 0,
            takenMinutes: 0,
            remainingMinutes: 0,
            isCapped: false,
            cappedAt: null,
            message: 'No break regulation applied'
        };
    }
}
