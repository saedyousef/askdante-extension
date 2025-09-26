/**
 * Base class for break regulation strategies
 */
class BaseBreakRegulation {
    constructor(config = {}) {
        this.minValidBreakMinutes = config.minValidBreakMinutes || 15;
    }

    /**
     * Calculate the required break time for a given work duration
     * @param {number} workMinutes - Total work time in minutes
     * @param {Array} breakSessions - Array of break sessions with start, end, duration, isValid
     * @returns {Object} - { requiredMinutes, takenMinutes, remainingMinutes, isCapped, cappedAt }
     */
    calculateBreakRequirement(workMinutes, breakSessions) {
        throw new Error('calculateBreakRequirement must be implemented by subclass');
    }

    /**
     * Validate if a break session meets the minimum requirements
     * @param {Object} breakSession - Break session object
     * @returns {boolean} - Whether the break is valid
     */
    isValidBreak(breakSession) {
        return breakSession.duration >= this.minValidBreakMinutes;
    }

    /**
     * Get the total valid break time from break sessions
     * @param {Array} breakSessions - Array of break sessions
     * @returns {number} - Total valid break time in minutes
     */
    getTotalValidBreakTime(breakSessions) {
        return breakSessions
            .filter(session => this.isValidBreak(session))
            .reduce((total, session) => total + session.duration, 0);
    }

    /**
     * Format time in minutes to human readable string
     * @param {number} minutes - Time in minutes
     * @returns {string} - Formatted time string
     */
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        return `${hours}h ${mins}m`;
    }
}
