/**
 * background.js
 * 
 * This service worker listens for messages from the popup and saves clipboard data.
 */

/**
 * Saves the provided text to storage.
 * @param {string} text - The text extracted from the clipboard.
 * @returns {Promise<void>} - Promise that resolves after saving.
 */
function saveClipboardData(text) {
  return new Promise((resolve) => {
    chrome.storage.local.get({ clips: [] }, (result) => {
      const clips = result.clips;
      clips.unshift({
        text: text,
        timestamp: new Date().toISOString()
      });
      // Keep only the last 50 entries.
      if (clips.length > 50) clips.pop();
      chrome.storage.local.set({ clips: clips }, () => {
        resolve();
      });
    });
  });
}

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveClipboard") {
    const clip = { text: request.text, timestamp: Date.now() };
    chrome.storage.local.get({ clips: [] }, (result) => {
      let clips = result.clips;
      clips.unshift(clip); // Add the new clip at the beginning.
      if (clips.length > 50) clips.pop(); // Limit to 50 items.
      chrome.storage.local.set({ clips: clips }, () => {
        sendResponse({ status: "saved" });
      });
    });
    return true;  // Keep the message channel open for async response.
  }
});