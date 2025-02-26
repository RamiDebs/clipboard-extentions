# Clipboard Extension Documentation

## Overview
The Clipboard Extension enables users to save and manage text from the clipboard. Users can save current clipboard content, add manual entries, view saved clips, copy, and delete them.

## File Descriptions

### popup.html
- Provides the UI for the extension popup.
- Contains the header, action row for saving/clearing clips, an input for manual entries, and a container to display saved clips.

### popup.js
- Implements the popup functionality.
- Initializes the popup on `DOMContentLoaded`, sets up event listeners for buttons, and displays saved clips.
- Contains helper functions such as `tempChangeText` (for feedback) and `loadClips` (for retrieving stored clips).

### background.js
- Runs as a service worker.
- Listens for messages from popup.js to save clipboard data.
- Contains the helper function `saveClipboardData` to store text into Chrome storage while keeping a maximum of 50 entries.

### manifest.json
- Defines the extension’s configuration.
- Specifies the extension name, version, required permissions (storage, clipboard read/write), and the default popup in the action property.
- Registers background.js as the service worker.

## Usage
1. When the popup opens, `popup.js` loads and displays the stored clips.
2. Users can click "Save Current Clipboard" to automatically read and save clipboard text.
3. Users can add text manually and click "Save Manual Entry".
4. Each clip is displayed with options to copy (using the new icon) or delete.
5. The background service worker (background.js) handles saving each clip in persistent storage.

## Additional Notes
- This extension uses Manifest V3 and leverages Chrome's storage API.
- The layout is managed in a grid style for responsive display.
