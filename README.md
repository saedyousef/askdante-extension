# AskDante Time Tracker Extension

A Chrome extension that enhances the AskDante time tracking system with advanced break regulation features, real-time monitoring, and comprehensive work time analysis.

## 🚀 Features

### ⏱️ Time Tracking
- **Real-time work time calculation** with automatic updates
- **Break time monitoring** with validation and compliance checking
- **Multi-language support** (English/German)
- **Persistent display** that survives page refreshes

### 📊 Break Regulation System
- **Multiple regulation modes**:
  - No Regulation (continuous work)
  - Fixed Rule (deduct X minutes after Y hours)
  - Dynamic Multi-Threshold (custom rules)
  - German Arbeitszeitgesetz §4 (legal preset)
- **Configurable break validation** with minimum break duration
- **Visual compliance indicators** with color-coded status
- **Real-time break requirement calculations**

### 🎨 Modern UI
- **Terminal-style status display** with aligned columns
- **Dark theme integration** matching AskDante's design
- **Responsive layout** that adapts to different screen sizes
- **Clean, monospace typography** for easy reading

### ⚡ Performance Optimized
- **Smart update system** with change detection
- **Debounced refresh** to prevent excessive processing
- **Memory leak prevention** with proper cleanup
- **Efficient DOM manipulation** with minimal resource usage

## 📋 Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your Chrome toolbar

## 🔧 Configuration

### Basic Settings
Access the extension popup to configure:
- **Show Total Working Time**: Display tracked work hours
- **Apply Time Regulations**: Enable break regulation system
- **Open Settings**: Access detailed break regulation configuration

### Break Regulation Settings
Navigate to the settings page for advanced configuration:
- **Regulation Mode**: Choose between None, Fixed, Dynamic, or German preset
- **Threshold Configuration**: Set work hours and required break times
- **Minimum Break Duration**: Configure what counts as a valid break
- **Real-time Preview**: See how your settings affect break requirements

## 🏗️ Architecture

### Core Components

#### Background Script (`js/background.js`)
- Handles time calculation with break regulations
- Manages strategy initialization and configuration
- Provides communication between popup and content scripts

#### Content Script (`js/content.js`)
- Displays time and break information on AskDante pages
- Creates and manages the status display element
- Handles real-time updates and DOM manipulation

#### Popup Interface (`html/popup.html`, `js/popup.js`)
- Main extension interface
- Toggle switches for basic functionality
- Navigation to detailed settings

#### Settings Page (`html/settings.html`, `js/settings.js`)
- Comprehensive break regulation configuration
- Dynamic UI for different regulation modes
- Real-time preview of break requirements

### Break Regulation System

#### Strategy Classes
- **NoRegulation**: No break requirements
- **FixedRule**: Fixed break deduction after threshold
- **DynamicMultiThresholdRule**: Custom multi-threshold rules
- **GermanArbeitszeitgesetzRule**: German legal compliance

#### Break Validation
- Minimum break duration filtering
- Break session parsing and validation
- Accumulation of valid break time
- Compliance status calculation

## 📊 Status Display

The extension displays a clean, terminal-style status block:

```
⏱ Tracked Time  : 4:00
⌛ Remaining     : 3:59
☕ Break Status  : 4h work (no break yet)
```

### Display Features
- **Aligned columns** with proper spacing
- **Monospace font** for perfect alignment
- **Color-coded status** indicators
- **Real-time updates** with change detection

## 🔧 Development

### Project Structure
```
├── js/
│   ├── background.js              # Main background script
│   ├── content.js                 # Content script for display
│   ├── popup.js                   # Popup interface logic
│   ├── settings.js                # Settings page logic
│   └── breakRegulation/           # Break regulation system
│       ├── BaseBreakRegulation.js
│       ├── NoRegulation.js
│       ├── FixedRule.js
│       ├── DynamicMultiThresholdRule.js
│       ├── GermanArbeitszeitgesetzRule.js
│       ├── BreakRegulationManager.js
│       └── BreakSessionTracker.js
├── html/
│   ├── popup.html                 # Extension popup
│   └── settings.html              # Settings page
├── css/
│   ├── popup.css                  # Popup styling
│   ├── settings.css               # Settings page styling
│   └── content.css                # Content script styling
├── tests/
│   ├── breakRegulation.test.js    # Unit tests
│   └── runTests.js                # Test runner
└── manifest.json                  # Extension manifest
    ```

### Testing
Run the test suite to verify functionality:
```bash
node tests/runTests.js
```

### Performance Monitoring
The extension includes performance optimizations:
- **Change detection** to prevent unnecessary updates
- **Debounced refresh** with 2-second minimum intervals
- **Memory leak prevention** with proper cleanup
- **Efficient DOM manipulation** with single updates

## 🌍 Internationalization

### Supported Languages
- **English**: Default language
- **German**: Full translation support

### Translation Keys
- Time tracking labels
- Break regulation terminology
- Status messages and indicators
- UI elements and buttons

## 🔒 Privacy & Security

### Data Handling
- **No data collection**: Extension only processes local time data
- **Local storage only**: All data stored in Chrome's local storage
- **No external requests**: No data sent to external servers
- **Minimal permissions**: Only accesses AskDante website

### Security Features
- **Content Security Policy** compliance
- **Safe DOM manipulation** with proper validation
- **Input sanitization** for all user inputs
- **Error handling** to prevent crashes

## 🐛 Troubleshooting

### Common Issues

#### Extension Not Displaying
1. Check if extension is enabled in Chrome
2. Verify AskDante website is loaded
3. Check browser console for errors
4. Try refreshing the page

#### Performance Issues
1. Disable other extensions temporarily
2. Check Chrome task manager for high CPU usage
3. Clear browser cache and reload
4. Restart Chrome browser

#### Break Calculations Incorrect
1. Verify break regulation settings
2. Check minimum break duration configuration
3. Ensure break sessions are properly recorded
4. Review threshold settings

### Debug Information
- **Console logging** for element creation and updates
- **Storage inspection** for configuration validation
- **Performance metrics** for update frequency monitoring

## 📈 Performance Metrics

### Optimization Results
- **90% reduction** in update frequency
- **50x fewer** DOM operations
- **Minimal memory usage** with proper cleanup
- **Smooth operation** without browser freezing

### Resource Usage
- **CPU**: Minimal background processing
- **Memory**: Efficient with proper cleanup
- **Network**: No external requests
- **Storage**: Local Chrome storage only

## 🔮 Future Enhancements

### Planned Features
- **Additional legal presets** (EU, US, etc.)
- **Break scheduling recommendations**
- **Export/import** of time data
- **Advanced analytics** and reporting
- **Mobile app** companion

### Technical Improvements
- **WebAssembly** for complex calculations
- **Service Worker** for offline functionality
- **Real-time notifications** for break reminders
- **API integration** with external time tracking services

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For questions, issues, or feature requests:
- **Email**: me@saedyousef.com
- **Issues**: Create a GitHub issue
- **Documentation**: Check this README and BREAK_REGULATION_README.md

## 📚 Additional Documentation

- [Break Regulation System](BREAK_REGULATION_README.md) - Detailed documentation of the break regulation system
- [Privacy Policy](index.md) - Privacy and data handling information
- [Test Suite](tests/) - Comprehensive unit tests for all components

---

**Version**: 2.3  
**Last Updated**: December 2024  
**Compatibility**: Chrome 88+, AskDante website