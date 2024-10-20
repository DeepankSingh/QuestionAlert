# QuestionAlert
This repository contains information about QuestionAlert extension made for Chegg experts. 

```markdown
# Chegg Question Alert Chrome Extension

This Chrome extension helps Chegg subject matter experts by notifying them when a specific keyword appears on the Chegg Q&A live authoring page. It highlights the keyword in red and plays a notification sound, ensuring experts don't miss questions.

## Features

- **Keyword Detection**: Enter a keyword in the extension popup. When the keyword appears on the page, it is highlighted in red.
- **Audio Notification**: Plays a sound when the keyword is detected.
- **Visual Notification**: Displays a Chrome notification alerting you that the keyword was found.
- **Toggle ON/OFF**: Use the popup switch to turn the extension ON or OFF.
- **Customizable Keyword**: You can change the keyword to be tracked through the popup interface.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/chegg-question-alert-extension.git
   ```

2. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** in the top right corner.
   - Click **Load unpacked** and select the `src` folder from the cloned repository.
   - The extension will now appear in your Chrome extensions list.

3. **Usage**:
   - Click the extension icon to open the popup.
   - Use the input field to enter the keyword to track.
   - Toggle the switch to turn the extension ON or OFF.

## File Structure

```bash
EXTENSION
 └── src/
     ├── background.js          # Handles background operations like notifications
     ├── content.js             # Searches for the keyword on the Chegg page and plays the sound
     ├── icon.png               # Extension icon
     ├── manifest.json          # Configuration file for the extension
     ├── notification-sound.mp3 # Sound file for the notification
     ├── popup.css              # Styles for the popup interface
     ├── popup.html             # HTML for the popup interface
     └── popup.js               # Script for handling popup logic
```

## How It Works

1. **Keyword Tracking**: 
   - Enter the keyword you want to monitor in the popup. The extension will scan the page for the keyword and change its color to red when found.

2. **Notifications**:
   - The extension plays a sound (`notification-sound.mp3`) and displays a Chrome notification alert when the keyword is detected on the page.

3. **Toggle**:
   - Use the ON/OFF switch in the popup to enable or disable the extension without uninstalling it.

## Development

To contribute or modify the extension:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chegg-question-alert-extension.git
   ```

2. Make your changes to the code inside the `src` directory.

3. Test the changes by reloading the unpacked extension in `chrome://extensions/`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Chrome's [Extension API documentation](https://developer.chrome.com/docs/extensions/mv3/getstarted/) for guidance.
- [Chegg](https://www.chegg.com/) for providing the platform where the extension is utilized.

```

### Next Steps:
1. Save this text as a `README.md` file in your project directory.
2. Add and commit it to your Git repository:
   ```bash
   git add README.md
   git commit -m "Added README file for the extension"
   git push origin master
   ```

