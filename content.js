// content.js
// This script runs on YouTube pages and injects a loop button into the player.

let loopButtonInjected = false;

// The SVG icon for the loop button (based on Material Design 'loop' icon)
const loopIconSvg = `
  <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
    <path d="M 12 21 L 12 17 L 8 17 L 14 11 L 20 17 L 16 17 L 16 21 C 16 22.1 16.9 23 18 23 L 24 23 L 24 27 L 18 27 C 14.7 27 12 24.3 12 21 Z" fill="currentColor"></path>
    <path d="M 24 15 L 24 19 L 28 19 L 22 25 L 16 19 L 20 19 L 20 15 C 20 13.9 19.1 13 18 13 L 12 13 L 12 9 L 18 9 C 21.3 9 24 11.7 24 15 Z" fill="currentColor"></path>
  </svg>
`;

function injectLoopButton() {
    // If we've already injected it on this page (e.g., due to SPA navigation), don't do it again
    if (document.querySelector('.brave-yt-loop-btn')) {
        return;
    }

    // Find the right controls container (where Settings, Subtitles, etc. are)
    const rightControls = document.querySelector('.ytp-right-controls');
    const videoElement = document.querySelector('video.html5-main-video');

    if (rightControls && videoElement) {
        // Create the button elements
        const button = document.createElement('button');
        button.className = 'ytp-button brave-yt-loop-btn'; // Use YTP classes for native styling blending
        button.setAttribute('aria-label', 'Loop video (Brave feature)');
        button.setAttribute('title', 'Loop (Off)');
        
        // Add the icon
        button.innerHTML = loopIconSvg;

        // Determine initial state (YouTube sometimes saves this state natively)
        let isLooping = videoElement.loop || (videoElement.getAttribute('loop') !== null);
        updateButtonVisuals(button, isLooping);

        // Add the click listener
        button.addEventListener('click', () => {
             isLooping = !isLooping;
             
             // Toggle the HTML5 video loop attribute
             if (isLooping) {
                 videoElement.setAttribute('loop', '');
                 videoElement.loop = true;
             } else {
                 videoElement.removeAttribute('loop');
                 videoElement.loop = false;
             }
             
             updateButtonVisuals(button, isLooping);

             // Also try to simulate right-click context menu "Loop" to keep YouTube's internal state in sync if possible
             // This is a "nice to have" but the core functionality is the videoElement.loop attribute
             try {
                // Some UI updates for the user
                const tooltipContainer = document.querySelector('.ytp-tooltip');
                if(tooltipContainer) {
                   // Optional: implement native-like tooltip, or rely on 'title' attribute
                }
             } catch (e) {
                console.error("Error syncing loop state with YT UI", e);
             }
        });

        // Insert it as the first item in the right controls (next to Autoplay or Captions)
        rightControls.insertBefore(button, rightControls.firstChild);
        loopButtonInjected = true;
        console.log("Brave YouTube Looper: Button injected successfully.");
    }
}

function updateButtonVisuals(button, isLooping) {
    if (isLooping) {
        button.classList.add('brave-loop-active');
        button.setAttribute('title', 'Loop (On)');
        button.style.opacity = '1'; // Fully visible when active
    } else {
        button.classList.remove('brave-loop-active');
        button.setAttribute('title', 'Loop (Off)');
        button.style.opacity = '0.8'; // Slightly dimmed when inactive (standard YT behavior)
    }
}

// YouTube is a Single Page Application (SPA). The page doesn't fully reload when clicking a new video.
// We need an observer to watch for the video player being added or the URL changing.
const observer = new MutationObserver((mutations) => {
    // Check if the video element is present
    if (document.querySelector('video.html5-main-video') && document.querySelector('.ytp-right-controls')) {
        injectLoopButton();
    }
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Also try immediately in case the player is already there
window.addEventListener('load', injectLoopButton);
// Try again after a short delay for slower connections
setTimeout(injectLoopButton, 2000);
