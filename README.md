# Chegg Expert Monitor - Chrome Extension

A powerful Chrome extension that automatically monitors Chegg Expert Q&A pages for specific keywords, providing real-time alerts with sound notifications, visual highlights, and Chrome notifications.

## 🌟 Features

### Core Monitoring
- **Auto-refresh**: Automatically refreshes Chegg Expert pages at user-defined intervals (1-300 seconds)
- **Keyword Detection**: Scans page content for specified keywords after each refresh
- **Real-time Updates**: Instantly applies settings changes without requiring page reload

### Alert System
- **🔊 Sound Alerts**: Plays alert sound when keywords are found (with fallback beep)
- **🔔 Chrome Notifications**: Shows system notifications with keyword details
- **✨ Visual Highlighting**: Highlights found keywords directly on the page with animated effects
- **📊 Smart Duplicate Prevention**: Avoids repeated alerts for the same keyword instances

### User Interface
- **🎨 Modern Design**: Beautiful, responsive popup interface with gradient backgrounds
- **📈 Live Statistics**: Track refresh count, keywords found, and last refresh time
- **🔘 Easy Toggle**: Simple on/off switch for monitoring control
- **🎯 Status Badge**: Toolbar badge shows monitoring status (ON/OFF)

### Advanced Features
- **🔍 Dynamic Content Detection**: Monitors dynamically loaded content via MutationObserver
- **⚡ Instant Settings**: Settings changes apply immediately to active monitoring
- **🧪 Test Mode**: Test alert functionality before starting monitoring
- **📊 Statistics Tracking**: Comprehensive stats with clear functionality

## 📦 Installation

### From Source (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone [repository-url]
   cd chegg-expert-monitor
   ```

2. **Enable Developer Mode in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the extension directory
   - The extension icon should appear in your toolbar

4. **Add Alert Sound (Optional)**
   - Add an `alert.mp3` file to the extension directory for custom alert sounds
   - The extension will fallback to a generated beep sound if no file is provided

## 🚀 Usage

### Initial Setup
1. **Open Chegg Expert Q&A Page**
   - Navigate to any Chegg Expert page (https://expert.chegg.com/*)
   - Keep this tab open while monitoring

2. **Configure Extension**
   - Click the extension icon in your toolbar
   - Enter your target keyword (e.g., "Math", "Physics", "Exit")
   - Set refresh interval in seconds (5 seconds recommended)

3. **Start Monitoring**
   - Toggle the monitoring switch to "ON"
   - The extension will start auto-refreshing and scanning immediately

### Monitoring Process
1. **Automatic Refresh**: Page refreshes every X seconds (as configured)
2. **Content Scanning**: After each refresh, scans for your keyword
3. **Alert Triggers**: When keyword is found:
   - 🔊 Plays alert sound
   - 🔔 Shows Chrome notification
   - ✨ Highlights keyword on page
   - 📊 Updates statistics

### Managing Monitoring
- **Pause/Resume**: Use the toggle switch in popup
- **Update Settings**: Change keyword or interval anytime - applies instantly
- **Test Alerts**: Use "Test Alert" button to verify functionality
- **Clear Stats**: Reset all statistics with "Clear Stats" button

## ⚙️ Configuration Options

### Keyword Settings
- **Keyword**: Target word or phrase to monitor (case-insensitive)
- **Character Limit**: 50 characters maximum
- **Examples**: "Math", "Physics", "Exit", "Available"

### Timing Settings
- **Refresh Interval**: 1-300 seconds
- **Recommended**: 5-10 seconds for active monitoring
- **Performance**: Longer intervals reduce server load

### Alert Preferences
- **Sound Alerts**: Automatic (with fallback)
- **Notifications**: Enabled by default
- **Highlighting**: Always active when keywords found

## 🔧 Technical Details

### Architecture
- **Manifest V3**: Latest Chrome extension standard
- **Service Worker**: Background script for notifications and state management
- **Content Script**: Page monitoring and manipulation
- **Popup Interface**: Settings and statistics display

### Permissions Required
- `activeTab`: Access to current Chegg Expert tabs
- `notifications`: Chrome system notifications
- `storage`: Save user settings and statistics
- `alarms`: Background timing operations

### Browser Compatibility
- **Chrome**: Version 88+ (Manifest V3 support)
- **Edge**: Chromium-based versions
- **Other Browsers**: Not currently supported

### Performance Considerations
- **Memory Usage**: Minimal background footprint
- **CPU Impact**: Low - only active during scans
- **Network**: Uses standard page refresh (no additional requests)

## 🛠️ Development

### Project Structure
```
├── manifest.json          # Extension configuration
├── popup.html             # Popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── background.js          # Service worker
├── content.js             # Page monitoring script
├── alert.mp3              # Alert sound (optional)
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # Documentation
```

### Key Classes
- **CheggMonitorPopup**: Handles UI interactions and settings
- **CheggMonitorBackground**: Manages notifications and extension state
- **CheggMonitorContent**: Performs page monitoring and keyword detection

### Adding Custom Sounds
1. Add MP3 file as `alert.mp3` in root directory
2. Update `web_accessible_resources` in manifest.json if needed
3. Extension automatically uses custom sound when available

## 🚨 Troubleshooting

### Common Issues

**Extension Not Working**
- Ensure you're on a Chegg Expert page (expert.chegg.com)
- Check that monitoring is toggled ON
- Verify keyword is entered correctly

**No Sound Alerts**
- Check browser sound settings
- Add custom `alert.mp3` file to extension directory
- Browser may require user interaction before playing audio

**Notifications Not Showing**
- Check Chrome notification permissions
- Ensure notifications are enabled in system settings
- Try restarting the browser

**Page Not Refreshing**
- Verify refresh interval is set (1-300 seconds)
- Check browser console for errors
- Ensure page isn't prevented from refreshing by other extensions

### Debug Mode
1. Open Chrome DevTools on Chegg page
2. Check Console tab for extension messages
3. Look for `[Chegg Monitor]` prefixed logs

## 📋 Limitations

- **Domain Restriction**: Only works on expert.chegg.com pages
- **Single Keyword**: Monitors one keyword at a time
- **Browser Dependency**: Requires Chromium-based browser
- **Active Tab**: Page must remain open for monitoring to work

## 🔒 Privacy & Security

- **Data Storage**: All settings stored locally in browser
- **No External Requests**: Extension doesn't make external API calls
- **Minimal Permissions**: Only requests necessary permissions
- **No Data Collection**: Extension doesn't collect or transmit user data

## 🆕 Version History

### v1.0.0
- Initial release
- Core monitoring functionality
- Modern popup interface
- Sound and notification alerts
- Statistics tracking
- Real-time settings updates

## 📄 License

This project is available for educational and personal use. Please ensure compliance with Chegg's Terms of Service when using this extension.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Clone the repository
2. Load as unpacked extension in Chrome
3. Make changes and test thoroughly
4. Submit pull request with detailed description

## 📞 Support

For issues, questions, or feature requests:
1. Check this README for common solutions
2. Open an issue on GitHub
3. Provide detailed information about your setup and the problem

---

**Note**: This extension is designed to work with Chegg Expert pages and should be used in accordance with Chegg's Terms of Service and any applicable usage policies.