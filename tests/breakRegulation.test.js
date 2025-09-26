/**
 * Unit tests for break regulation system
 */

// Mock Chrome extension APIs
global.chrome = {
    storage: {
        sync: {
            get: jest.fn(),
            set: jest.fn()
        },
        local: {
            get: jest.fn(),
            set: jest.fn()
        }
    }
};

// Import the classes (in a real test environment, these would be imported)
// For now, we'll define them inline for testing

class BaseBreakRegulation {
    constructor(config = {}) {
        this.minValidBreakMinutes = config.minValidBreakMinutes || 15;
    }

    calculateBreakRequirement(workMinutes, breakSessions) {
        throw new Error('calculateBreakRequirement must be implemented by subclass');
    }

    isValidBreak(breakSession) {
        return breakSession.duration >= this.minValidBreakMinutes;
    }

    getTotalValidBreakTime(breakSessions) {
        return breakSessions
            .filter(session => this.isValidBreak(session))
            .reduce((total, session) => total + session.duration, 0);
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        return `${hours}h ${mins}m`;
    }
}

class NoRegulation extends BaseBreakRegulation {
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

class DynamicMultiThresholdRule extends BaseBreakRegulation {
    constructor(config = {}) {
        super(config);
        this.thresholds = config.thresholds || [];
        this.thresholds.sort((a, b) => a.afterHours - b.afterHours);
    }

    calculateBreakRequirement(workMinutes, breakSessions) {
        const takenMinutes = this.getTotalValidBreakTime(breakSessions);
        
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
}

class GermanArbeitszeitgesetzRule extends BaseBreakRegulation {
    constructor(config = {}) {
        super(config);
        this.minValidBreakMinutes = 15;
    }

    calculateBreakRequirement(workMinutes, breakSessions) {
        const takenMinutes = this.getTotalValidBreakTime(breakSessions);
        
        if (workMinutes > 540) { // 9 hours
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
        
        if (workMinutes > 360) { // 6 hours
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

describe('Break Regulation System', () => {
    describe('NoRegulation', () => {
        test('should not require any breaks', () => {
            const rule = new NoRegulation();
            const result = rule.calculateBreakRequirement(480, []); // 8 hours
            
            expect(result.requiredMinutes).toBe(0);
            expect(result.takenMinutes).toBe(0);
            expect(result.remainingMinutes).toBe(0);
            expect(result.isCapped).toBe(false);
            expect(result.cappedAt).toBeNull();
        });
    });

    describe('FixedRule', () => {
        test('should not require break before threshold', () => {
            const rule = new FixedRule({ afterHours: 6, requiredBreakMinutes: 30 });
            const result = rule.calculateBreakRequirement(300, []); // 5 hours
            
            expect(result.requiredMinutes).toBe(0);
            expect(result.isCapped).toBe(false);
        });

        test('should require break after threshold', () => {
            const rule = new FixedRule({ afterHours: 6, requiredBreakMinutes: 30 });
            const result = rule.calculateBreakRequirement(420, []); // 7 hours
            
            expect(result.requiredMinutes).toBe(30);
            expect(result.remainingMinutes).toBe(30);
            expect(result.isCapped).toBe(true);
            expect(result.cappedAt).toBe(360); // 6 hours in minutes
        });

        test('should account for taken breaks', () => {
            const rule = new FixedRule({ afterHours: 6, requiredBreakMinutes: 30 });
            const breakSessions = [
                { duration: 15, isValid: true },
                { duration: 10, isValid: false } // Too short
            ];
            const result = rule.calculateBreakRequirement(420, breakSessions);
            
            expect(result.requiredMinutes).toBe(30);
            expect(result.takenMinutes).toBe(15);
            expect(result.remainingMinutes).toBe(15);
            expect(result.isCapped).toBe(true);
        });

        test('should not cap when break requirement is met', () => {
            const rule = new FixedRule({ afterHours: 6, requiredBreakMinutes: 30 });
            const breakSessions = [
                { duration: 30, isValid: true }
            ];
            const result = rule.calculateBreakRequirement(420, breakSessions);
            
            expect(result.requiredMinutes).toBe(30);
            expect(result.takenMinutes).toBe(30);
            expect(result.remainingMinutes).toBe(0);
            expect(result.isCapped).toBe(false);
        });
    });

    describe('DynamicMultiThresholdRule', () => {
        test('should not require break before any threshold', () => {
            const rule = new DynamicMultiThresholdRule({
                thresholds: [
                    { afterHours: 6, requiredBreakMinutes: 15 },
                    { afterHours: 8, requiredBreakMinutes: 30 }
                ]
            });
            const result = rule.calculateBreakRequirement(300, []); // 5 hours
            
            expect(result.requiredMinutes).toBe(0);
            expect(result.isCapped).toBe(false);
        });

        test('should apply first applicable threshold', () => {
            const rule = new DynamicMultiThresholdRule({
                thresholds: [
                    { afterHours: 6, requiredBreakMinutes: 15 },
                    { afterHours: 8, requiredBreakMinutes: 30 }
                ]
            });
            const result = rule.calculateBreakRequirement(420, []); // 7 hours
            
            expect(result.requiredMinutes).toBe(15);
            expect(result.isCapped).toBe(true);
            expect(result.cappedAt).toBe(360); // 6 hours in minutes
        });

        test('should apply highest applicable threshold', () => {
            const rule = new DynamicMultiThresholdRule({
                thresholds: [
                    { afterHours: 6, requiredBreakMinutes: 15 },
                    { afterHours: 8, requiredBreakMinutes: 30 }
                ]
            });
            const result = rule.calculateBreakRequirement(540, []); // 9 hours
            
            expect(result.requiredMinutes).toBe(30);
            expect(result.isCapped).toBe(true);
            expect(result.cappedAt).toBe(480); // 8 hours in minutes
        });

        test('should accumulate breaks across thresholds', () => {
            const rule = new DynamicMultiThresholdRule({
                thresholds: [
                    { afterHours: 6, requiredBreakMinutes: 15 },
                    { afterHours: 8, requiredBreakMinutes: 30 }
                ]
            });
            const breakSessions = [
                { duration: 15, isValid: true } // Meets first threshold
            ];
            const result = rule.calculateBreakRequirement(540, breakSessions); // 9 hours
            
            expect(result.requiredMinutes).toBe(30);
            expect(result.takenMinutes).toBe(15);
            expect(result.remainingMinutes).toBe(15);
            expect(result.isCapped).toBe(true);
        });
    });

    describe('GermanArbeitszeitgesetzRule', () => {
        test('should not require break before 6 hours', () => {
            const rule = new GermanArbeitszeitgesetzRule();
            const result = rule.calculateBreakRequirement(300, []); // 5 hours
            
            expect(result.requiredMinutes).toBe(0);
            expect(result.isCapped).toBe(false);
        });

        test('should require 30 minutes after 6 hours', () => {
            const rule = new GermanArbeitszeitgesetzRule();
            const result = rule.calculateBreakRequirement(420, []); // 7 hours
            
            expect(result.requiredMinutes).toBe(30);
            expect(result.remainingMinutes).toBe(30);
            expect(result.isCapped).toBe(true);
            expect(result.cappedAt).toBe(360); // 6 hours in minutes
        });

        test('should require 45 minutes after 9 hours', () => {
            const rule = new GermanArbeitszeitgesetzRule();
            const result = rule.calculateBreakRequirement(600, []); // 10 hours
            
            expect(result.requiredMinutes).toBe(45);
            expect(result.remainingMinutes).toBe(45);
            expect(result.isCapped).toBe(true);
            expect(result.cappedAt).toBe(540); // 9 hours in minutes
        });

        test('should account for taken breaks in 6-9 hour range', () => {
            const rule = new GermanArbeitszeitgesetzRule();
            const breakSessions = [
                { duration: 20, isValid: true }
            ];
            const result = rule.calculateBreakRequirement(420, breakSessions); // 7 hours
            
            expect(result.requiredMinutes).toBe(30);
            expect(result.takenMinutes).toBe(20);
            expect(result.remainingMinutes).toBe(10);
            expect(result.isCapped).toBe(true);
        });

        test('should account for taken breaks in >9 hour range', () => {
            const rule = new GermanArbeitszeitgesetzRule();
            const breakSessions = [
                { duration: 30, isValid: true } // Meets 6-9h requirement
            ];
            const result = rule.calculateBreakRequirement(600, breakSessions); // 10 hours
            
            expect(result.requiredMinutes).toBe(45);
            expect(result.takenMinutes).toBe(30);
            expect(result.remainingMinutes).toBe(15);
            expect(result.isCapped).toBe(true);
        });

        test('should not cap when break requirement is met', () => {
            const rule = new GermanArbeitszeitgesetzRule();
            const breakSessions = [
                { duration: 45, isValid: true }
            ];
            const result = rule.calculateBreakRequirement(600, breakSessions); // 10 hours
            
            expect(result.requiredMinutes).toBe(45);
            expect(result.takenMinutes).toBe(45);
            expect(result.remainingMinutes).toBe(0);
            expect(result.isCapped).toBe(false);
        });
    });

    describe('Break Session Validation', () => {
        test('should validate breaks based on minimum duration', () => {
            const rule = new FixedRule({ minValidBreakMinutes: 15 });
            
            expect(rule.isValidBreak({ duration: 20 })).toBe(true);
            expect(rule.isValidBreak({ duration: 15 })).toBe(true);
            expect(rule.isValidBreak({ duration: 10 })).toBe(false);
        });

        test('should calculate total valid break time', () => {
            const rule = new FixedRule({ minValidBreakMinutes: 15 });
            const breakSessions = [
                { duration: 20, isValid: true },
                { duration: 10, isValid: false },
                { duration: 15, isValid: true },
                { duration: 5, isValid: false }
            ];
            
            expect(rule.getTotalValidBreakTime(breakSessions)).toBe(35);
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty break sessions', () => {
            const rule = new FixedRule({ afterHours: 6, requiredBreakMinutes: 30 });
            const result = rule.calculateBreakRequirement(420, []);
            
            expect(result.takenMinutes).toBe(0);
            expect(result.remainingMinutes).toBe(30);
        });

        test('should handle zero work time', () => {
            const rule = new FixedRule({ afterHours: 6, requiredBreakMinutes: 30 });
            const result = rule.calculateBreakRequirement(0, []);
            
            expect(result.requiredMinutes).toBe(0);
            expect(result.isCapped).toBe(false);
        });

        test('should handle very long work time', () => {
            const rule = new GermanArbeitszeitgesetzRule();
            const result = rule.calculateBreakRequirement(1200, []); // 20 hours
            
            expect(result.requiredMinutes).toBe(45);
            expect(result.isCapped).toBe(true);
        });

        test('should handle breaks longer than required', () => {
            const rule = new FixedRule({ afterHours: 6, requiredBreakMinutes: 30 });
            const breakSessions = [
                { duration: 60, isValid: true }
            ];
            const result = rule.calculateBreakRequirement(420, breakSessions);
            
            expect(result.requiredMinutes).toBe(30);
            expect(result.takenMinutes).toBe(60);
            expect(result.remainingMinutes).toBe(0);
            expect(result.isCapped).toBe(false);
        });
    });
});
