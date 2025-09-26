/**
 * Manager for break regulation strategies
 */
class BreakRegulationManager {
    constructor() {
        this.strategies = {
            'none': NoRegulation,
            'fixed': FixedRule,
            'dynamic': DynamicMultiThresholdRule,
            'german': GermanArbeitszeitgesetzRule
        };
        this.currentStrategy = null;
    }

    /**
     * Initialize with configuration from storage
     * @param {Object} config - Configuration object
     */
    async initialize(config = {}) {
        const strategyType = config.type || 'none';
        const strategyConfig = config.config || {};
        
        this.currentStrategy = new this.strategies[strategyType](strategyConfig);
    }

    /**
     * Set the current strategy
     * @param {string} type - Strategy type ('none', 'fixed', 'dynamic', 'german')
     * @param {Object} config - Strategy configuration
     */
    setStrategy(type, config = {}) {
        if (!this.strategies[type]) {
            throw new Error(`Unknown strategy type: ${type}`);
        }
        this.currentStrategy = new this.strategies[type](config);
    }

    /**
     * Get the current strategy
     * @returns {BaseBreakRegulation} - Current strategy instance
     */
    getCurrentStrategy() {
        return this.currentStrategy;
    }

    /**
     * Calculate break requirements using current strategy
     * @param {number} workMinutes - Total work time in minutes
     * @param {Array} breakSessions - Array of break sessions
     * @returns {Object} - Break requirement calculation result
     */
    calculateBreakRequirement(workMinutes, breakSessions) {
        if (!this.currentStrategy) {
            throw new Error('No strategy set. Call initialize() first.');
        }
        return this.currentStrategy.calculateBreakRequirement(workMinutes, breakSessions);
    }

    /**
     * Get available strategy types
     * @returns {Array} - Array of strategy type names
     */
    getAvailableStrategies() {
        return Object.keys(this.strategies);
    }

    /**
     * Get strategy configuration schema
     * @param {string} type - Strategy type
     * @returns {Object} - Configuration schema
     */
    getStrategySchema(type) {
        const schemas = {
            'none': {
                type: 'object',
                properties: {
                    minValidBreakMinutes: { type: 'number', default: 15 }
                }
            },
            'fixed': {
                type: 'object',
                properties: {
                    minValidBreakMinutes: { type: 'number', default: 15 },
                    afterHours: { type: 'number', default: 6 },
                    requiredBreakMinutes: { type: 'number', default: 30 }
                },
                required: ['afterHours', 'requiredBreakMinutes']
            },
            'dynamic': {
                type: 'object',
                properties: {
                    minValidBreakMinutes: { type: 'number', default: 15 },
                    thresholds: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                afterHours: { type: 'number' },
                                requiredBreakMinutes: { type: 'number' }
                            },
                            required: ['afterHours', 'requiredBreakMinutes']
                        }
                    }
                },
                required: ['thresholds']
            },
            'german': {
                type: 'object',
                properties: {
                    minValidBreakMinutes: { type: 'number', default: 15 }
                }
            }
        };
        return schemas[type] || null;
    }
}
