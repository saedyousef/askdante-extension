function adjustCardStyle() {
    const targetTile = document.querySelector('.virtual-terminal-info-tile');
    const infoTileValue = document.querySelector('.virtual-terminal .virtual-terminal-info-tile .info-tile-value');
    const totalWorkingTimeCard = document.querySelector('.total-working-time');

    if (targetTile && totalWorkingTimeCard && infoTileValue) {
        const targetStyles = window.getComputedStyle(targetTile);
        const infoTileStyles = window.getComputedStyle(infoTileValue);

        // Get the target tile dimensions and position
        const targetRect = targetTile.getBoundingClientRect();

        // Position the card below the target tile
        totalWorkingTimeCard.style.width = `${targetTile.offsetWidth}px`;
        totalWorkingTimeCard.style.top = `${window.scrollY + targetRect.bottom + 10}px`; // 10px margin
        totalWorkingTimeCard.style.left = `${window.scrollX + targetRect.left}px`;

        // Set styles dynamically
        totalWorkingTimeCard.style.backgroundColor = targetStyles.backgroundColor || '#fff';
        totalWorkingTimeCard.style.borderColor = targetStyles.borderColor || '#ddd';
        totalWorkingTimeCard.style.color = infoTileStyles.color || '#000';

        // Apply text color to all spans inside the card
        totalWorkingTimeCard.querySelectorAll('span').forEach(span => {
            span.style.color = infoTileStyles.color || '#000';
        });
    }
}

function ensureElementsLoaded(retryCount = 0, maxRetries = 20) {
    const targetTile = document.querySelector('.virtual-terminal-info-tile');
    const totalWorkingTimeCard = document.querySelector('.total-working-time');

    if (targetTile && totalWorkingTimeCard) {
        // Initial adjustment after load and add window event listeners
        adjustCardStyle();
        window.addEventListener('resize', adjustCardStyle);  // Adjust on resize
        window.addEventListener('scroll', adjustCardStyle);  // Adjust on scroll

        // Ensure delayed adjustment after 1 second to handle late rendering
        setTimeout(adjustCardStyle, 1000);
    } else if (retryCount < maxRetries) {
        // Retry if elements are not yet ready
        setTimeout(() => ensureElementsLoaded(retryCount + 1, maxRetries), 200);
    }
}

// Ensure styles on page load
window.addEventListener('load', () => ensureElementsLoaded());

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'reapplyStyles') {
        adjustCardStyle(); // Reapply styles after state change
    }
});
