/**
 * popup.js
 * 
 * This script initializes the popup UI for the Clipboard Extension.
 * It sets up event listeners for saving clipboard contents, manual entries,
 * clearing stored clips, and handling copy/delete actions on displayed items.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Retrieve UI elements by ID.
    const saveButton = document.getElementById('saveClipboard');
    const clearButton = document.getElementById('clearData');
    const manualEntry = document.getElementById('manualEntry');
    const saveManualButton = document.getElementById('saveManual');
    const clipboardList = document.getElementById('clipboardList');

    // Set grid styles for a responsive clip list display.
    clipboardList.style.display = 'grid';
    clipboardList.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    clipboardList.style.gap = '10px';

    /**
     * Temporarily changes the text content of a button for feedback.
     * @param {HTMLElement} button - The button to update.
     * @param {string} newText - Temporary text to show.
     * @param {number} duration - Duration in milliseconds for the temporary text.
     */
    function tempChangeText(button, newText, duration) {
        const originalText = button.textContent;
        button.textContent = newText;
        setTimeout(() => {
            button.textContent = originalText;
        }, duration);
    }

    /**
     * Loads saved clipboard clips from storage and displays them.
     */
    function loadClips() {
        chrome.storage.local.get({ clips: [] }, (result) => {
            clipboardList.innerHTML = '';
            result.clips.forEach((clip, index) => {
                const div = document.createElement('div');
                div.className = 'clip-item';

                const textSpan = document.createElement('span');
                textSpan.textContent = `${clip.text} (${new Date(clip.timestamp).toLocaleString()})`;
                textSpan.style.maxWidth = '70%';
                const btnContainer = document.createElement('div');
                btnContainer.className = 'btn-container';

                // Create and document Copy button.
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.textContent = '📄';
                copyBtn.setAttribute('data-text', clip.text);

                // Create and document Delete button.
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '🚮';
                deleteBtn.setAttribute('data-index', index);

                btnContainer.appendChild(copyBtn);
                btnContainer.appendChild(deleteBtn);
                div.appendChild(textSpan);
                div.appendChild(btnContainer);
                clipboardList.appendChild(div);
            });
        });
    }

    // Save current clipboard content when saveButton is clicked.
    saveButton.addEventListener('click', () => {
        navigator.clipboard.readText()
            .then(text => {
                if (text) {
                    chrome.runtime.sendMessage({ action: "saveClipboard", text: text }, response => {
                        if (response.status === "saved") {
                            loadClips();
                        }
                    });
                }
            })
            .catch(err => console.error('Failed to read clipboard:', err));
    });

    // Save manual text entry when saveManualButton is clicked.
    saveManualButton.addEventListener('click', () => {
        const text = manualEntry.value.trim();
        if (text) {
            chrome.runtime.sendMessage({ action: "saveClipboard", text: text }, response => {
                if (response.status === "saved") {
                    manualEntry.value = '';
                    loadClips();
                }
            });
        }
    });

    // Clear all saved clips.
    clearButton.addEventListener('click', () => {
        chrome.storage.local.set({ clips: [] }, () => {
            loadClips();
        });
    });

    // Handle Copy and Delete actions for each clip.
    clipboardList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const index = parseInt(event.target.getAttribute('data-index'), 10);
            chrome.storage.local.get({ clips: [] }, (result) => {
                const clips = result.clips;
                if (index >= 0 && index < clips.length) {
                    clips.splice(index, 1);
                    chrome.storage.local.set({ clips: clips }, () => {
                        loadClips();
                    });
                }
            });
        } else if (event.target.classList.contains('copy-btn')) {
            const textToCopy = event.target.getAttribute('data-text');
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    tempChangeText(event.target, 'Copied!', 1000);
                })
                .catch(err => console.error('Failed to copy text:', err));
        }
    });

    // Allow saving manual entry by pressing Enter.
    manualEntry.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            saveManualButton.click();
        }
    });

    // Load stored clips when popup opens.
    loadClips();
});