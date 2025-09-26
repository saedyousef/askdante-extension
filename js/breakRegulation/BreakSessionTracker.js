/**
 * Tracks break sessions and validates them
 */
class BreakSessionTracker {
    constructor(minValidBreakMinutes = 15) {
        this.minValidBreakMinutes = minValidBreakMinutes;
        this.breakSessions = [];
    }

    /**
     * Parse time data and extract break sessions
     * @param {Array} timeData - Array of time records in format "HH:MM action"
     * @returns {Array} - Array of break session objects
     */
    parseBreakSessions(timeData) {
        this.breakSessions = [];
        
        for (let i = 0; i < timeData.length - 1; i++) {
            const [time, action] = timeData[i].split(' ');
            const [nextTime, nextAction] = timeData[i + 1].split(' ');
            
            // Check if this is a "go" action followed by a "come" action
            if (this.isGoAction(action) && this.isComeAction(nextAction)) {
                const breakSession = this.createBreakSession(time, nextTime);
                if (breakSession) {
                    this.breakSessions.push(breakSession);
                }
            }
        }
        
        return this.breakSessions;
    }

    /**
     * Create a break session object from start and end times
     * @param {string} startTime - Start time in "HH:MM" format
     * @param {string} endTime - End time in "HH:MM" format
     * @returns {Object|null} - Break session object or null if invalid
     */
    createBreakSession(startTime, endTime) {
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        
        if (!start || !end) {
            return null;
        }

        const duration = (end - start) / 60000; // Convert to minutes
        const isValid = duration >= this.minValidBreakMinutes;

        return {
            startTime: startTime,
            endTime: endTime,
            start: start,
            end: end,
            duration: duration,
            isValid: isValid,
            formattedDuration: this.formatDuration(duration)
        };
    }

    /**
     * Check if action is a "go" action
     * @param {string} action - Action string
     * @returns {boolean} - Whether it's a go action
     */
    isGoAction(action) {
        return ['go', 'gehen', 'gaan'].includes(action.toLowerCase());
    }

    /**
     * Check if action is a "come" action
     * @param {string} action - Action string
     * @returns {boolean} - Whether it's a come action
     */
    isComeAction(action) {
        return ['come', 'kommen', 'komen'].includes(action.toLowerCase());
    }

    /**
     * Parse time string to Date object
     * @param {string} timeStr - Time string in "HH:MM" format
     * @returns {Date|null} - Date object or null if invalid
     */
    parseTime(timeStr) {
        try {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date;
        } catch (error) {
            return null;
        }
    }

    /**
     * Format duration in minutes to human readable string
     * @param {number} minutes - Duration in minutes
     * @returns {string} - Formatted duration
     */
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }

    /**
     * Get all break sessions
     * @returns {Array} - Array of break sessions
     */
    getBreakSessions() {
        return this.breakSessions;
    }

    /**
     * Get valid break sessions only
     * @returns {Array} - Array of valid break sessions
     */
    getValidBreakSessions() {
        return this.breakSessions.filter(session => session.isValid);
    }

    /**
     * Get total valid break time in minutes
     * @returns {number} - Total valid break time
     */
    getTotalValidBreakTime() {
        return this.getValidBreakSessions()
            .reduce((total, session) => total + session.duration, 0);
    }

    /**
     * Get break summary
     * @returns {Object} - Break summary object
     */
    getBreakSummary() {
        const validSessions = this.getValidBreakSessions();
        const invalidSessions = this.breakSessions.filter(session => !session.isValid);
        
        return {
            totalSessions: this.breakSessions.length,
            validSessions: validSessions.length,
            invalidSessions: invalidSessions.length,
            totalValidTime: this.getTotalValidBreakTime(),
            validSessionsList: validSessions,
            invalidSessionsList: invalidSessions
        };
    }

    /**
     * Set minimum valid break minutes
     * @param {number} minutes - Minimum valid break minutes
     */
    setMinValidBreakMinutes(minutes) {
        this.minValidBreakMinutes = minutes;
        // Re-validate existing sessions
        this.breakSessions.forEach(session => {
            session.isValid = session.duration >= this.minValidBreakMinutes;
        });
    }
}
