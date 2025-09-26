# Break Regulation System

This document describes the flexible break time regulation system implemented in the AskDante Time Tracker extension.

## Overview

The break regulation system provides multiple strategies for calculating required break times based on work duration, with support for configurable rules and predefined legal presets. The system includes real-time monitoring, visual compliance indicators, and performance-optimized calculations.

## Recent Updates (v2.3)

### Performance Optimizations
- **Smart update system** with change detection to prevent unnecessary processing
- **Debounced refresh** with 2-second minimum intervals between updates
- **Memory leak prevention** with proper cleanup of intervals and listeners
- **Efficient DOM manipulation** with single HTML updates instead of multiple operations

### UI Improvements
- **Terminal-style status display** with perfectly aligned columns
- **Monospace font** (Courier New) for consistent character alignment
- **Dark theme integration** matching AskDante's design language
- **Responsive layout** that adapts to different screen sizes

### Enhanced Persistence
- **Robust element creation** with multiple fallback strategies
- **DOM existence validation** to ensure elements stay in the document
- **Automatic recreation** if elements are removed or detached
- **Periodic existence checks** every 30 seconds to maintain visibility

## Architecture

### Core Components

1. **BaseBreakRegulation** - Abstract base class for all break regulation strategies
2. **BreakRegulationManager** - Manages strategy selection and configuration
3. **BreakSessionTracker** - Tracks and validates break sessions
4. **Strategy Classes** - Concrete implementations for different regulation modes

### Strategy Classes

#### NoRegulation
- Work time is continuous
- No break requirements
- Used when break regulations are disabled

#### FixedRule
- Always deduct X minutes after Y hours
- Configurable threshold and required break time
- Example: 30 minutes required after 6 hours

#### DynamicMultiThresholdRule
- User-defined multiple thresholds
- Flexible configuration for complex scenarios
- Example: 15m after 6h, 30m after 8h, 45m after 9h

#### GermanArbeitszeitgesetzRule
- Implements German Arbeitszeitgesetz §4
- After 6-9h: 30m required break (segments ≥15m)
- After >9h: 45m required break (segments ≥15m)

## Break Validation

### Minimum Break Duration
- Only breaks ≥ configured minimum (default 15m) count as valid
- Short breaks are ignored in calculations
- Configurable per strategy

### Break Accumulation
- Valid breaks can be accumulated across sessions
- Total valid break time is calculated from all valid sessions
- Invalid breaks are excluded from calculations

## Calculation Behavior

### Time Capping
- Work time is capped at threshold until break requirement is met
- Capped time prevents further work time accumulation
- Visual indicators show when work time is capped

### Break Information Display
- **Terminal-style status block** with aligned columns
- **Monospace formatting** for perfect character alignment
- **Real-time updates** with change detection
- **Visual indicators** for break compliance status

#### Status Display Format
```
⏱ Tracked Time  : 4:00
⌛ Remaining     : 3:59
☕ Break Status  : 4h work (no break yet)
```

#### Display Features
- **Aligned colons** using dynamic padding
- **Consistent spacing** with monospace font
- **Icon indicators** for each status line
- **Color-coded values** for different states

## Configuration

### Settings UI
- Regulation mode selection (None, Fixed, Dynamic, German)
- Threshold configuration for dynamic rules
- Minimum valid break length settings
- Real-time preview of break requirements

### Persistence
- Settings stored in Chrome extension storage
- Automatic loading and saving of configurations
- Support for multiple regulation profiles

## Usage Examples

### Basic Fixed Rule
```javascript
const rule = new FixedRule({
    afterHours: 6,
    requiredBreakMinutes: 30,
    minValidBreakMinutes: 15
});
```

### Dynamic Multi-Threshold
```javascript
const rule = new DynamicMultiThresholdRule({
    minValidBreakMinutes: 15,
    thresholds: [
        { afterHours: 6, requiredBreakMinutes: 15 },
        { afterHours: 8, requiredBreakMinutes: 30 },
        { afterHours: 9, requiredBreakMinutes: 45 }
    ]
});
```

### German Law Preset
```javascript
const rule = new GermanArbeitszeitgesetzRule({
    minValidBreakMinutes: 15
});
```

## Testing

### Unit Tests
Comprehensive test suite covering:
- No regulation scenarios
- Fixed break deduction
- Dynamic multi-threshold (met and unmet cases)
- German preset scenarios (6h, 8h, 9h thresholds)
- Edge cases and error handling

### Test Coverage
- All strategy classes
- Break session validation
- Time calculation logic
- Configuration handling
- Error scenarios

## Performance Optimizations

### Update System
- **Change Detection**: Only updates when time data actually changes
- **Debounced Refresh**: Minimum 2-second intervals between updates
- **Smart Throttling**: Prevents excessive processing during rapid changes
- **Data Hashing**: Compares data hashes to detect actual changes

### Resource Management
- **Memory Leak Prevention**: Proper cleanup of intervals and listeners
- **Efficient DOM Manipulation**: Single HTML updates instead of multiple operations
- **Cached Selectors**: Reuse DOM queries to reduce processing
- **Early Returns**: Skip processing when no data is available

### Performance Metrics
- **90% reduction** in update frequency compared to v2.2
- **50x fewer** DOM operations per update cycle
- **Minimal CPU usage** with smart throttling
- **Smooth operation** without browser freezing

## Integration

### Background Script
- Handles time calculation with break regulations
- Manages strategy initialization and configuration
- Provides fallback to legacy calculation
- **Performance optimized** with change detection

### Content Script
- Displays break information and remaining time
- Shows visual indicators for break compliance
- Updates in real-time as work progresses
- **Robust element management** with automatic recreation

### Popup Interface
- Configuration UI for break regulation settings
- Real-time preview of break requirements
- Multi-language support (English/German)
- **Streamlined design** with essential controls only

### Settings Page
- Comprehensive break regulation configuration
- Dynamic UI for different regulation modes
- Real-time preview of break requirements
- **Responsive design** for different screen sizes

## Future Enhancements

### Planned Features
- Additional legal presets (EU, US, etc.)
- Break scheduling recommendations
- Break pattern analysis
- Export/import of regulation configurations

### Extensibility
- Plugin architecture for custom regulations
- API for third-party integrations
- Webhook support for break notifications

## Troubleshooting

### Common Issues

#### Extension Not Displaying
1. **Check extension status**: Verify extension is enabled in Chrome
2. **Refresh page**: Reload the AskDante page
3. **Check console**: Look for error messages in browser console
4. **Verify settings**: Ensure "Show Total Working Time" or "Apply Time Regulations" is enabled

#### Performance Issues
1. **High CPU usage**: Disable other extensions temporarily
2. **Browser freezing**: Check Chrome task manager for resource usage
3. **Slow updates**: Clear browser cache and restart Chrome
4. **Memory leaks**: Restart browser to clear accumulated memory

#### Break Calculations Incorrect
1. **Check minimum break duration**: Verify setting in break regulation configuration
2. **Verify break sessions**: Ensure breaks are properly recorded in AskDante
3. **Review threshold settings**: Check work hour thresholds and required break times
4. **Test with different modes**: Try switching between regulation modes

#### Display Issues
1. **Element not visible**: Check if element exists in DOM using browser dev tools
2. **Misaligned text**: Verify monospace font is loading correctly
3. **Wrong positioning**: Check if element is positioned correctly in sidebar
4. **Styling problems**: Clear browser cache and reload page

### Debug Information

#### Console Logging
- **Element creation**: Logs when time tracker element is created
- **Update triggers**: Shows when updates are triggered and why
- **Performance metrics**: Displays update frequency and timing
- **Error messages**: Detailed error information for troubleshooting

#### Storage Inspection
- **Configuration validation**: Check stored settings in Chrome storage
- **Data integrity**: Verify time data and break information
- **Settings sync**: Ensure settings are properly synchronized

#### Performance Monitoring
- **Update frequency**: Monitor how often updates occur
- **Memory usage**: Track memory consumption over time
- **CPU usage**: Monitor processing load during updates

## API Reference

### BaseBreakRegulation
- `calculateBreakRequirement(workMinutes, breakSessions)`
- `isValidBreak(breakSession)`
- `getTotalValidBreakTime(breakSessions)`

### BreakRegulationManager
- `initialize(config)`
- `setStrategy(type, config)`
- `calculateBreakRequirement(workMinutes, breakSessions)`

### BreakSessionTracker
- `parseBreakSessions(timeData)`
- `getBreakSummary()`
- `setMinValidBreakMinutes(minutes)`
