// src/components/AppHeader/AppHeader.js

// This IIFE (Immediately Invoked Function Expression) creates a scope for the header module
// and exposes an 'AppHeader' object to the global window scope for external interaction.
(function() {
    /**
     * Initializes the App Header component's event listeners.
     * This function should be called from the main application script once the header HTML is loaded.
     *
     * @param {object} params - Parameters object containing IDs of elements and callback functions.
     * @param {string} params.mainAppLogoId - ID of the main application logo image element.
     * @param {string} params.themeToggleBtnId - ID of the theme toggle button.
     * @param {string} params.reconfigureBtnId - ID of the reconfigure button.
     * @param {function} params.onThemeToggle - Callback function to execute when theme toggle button is clicked.
     * @param {function} params.onReconfigure - Callback function to execute when reconfigure button is clicked.
     */
    function init(params) {
        const mainAppLogo = document.getElementById(params.mainAppLogoId);
        const themeToggleBtn = document.getElementById(params.themeToggleBtnId);
        const reconfigureBtn = document.getElementById(params.reconfigureBtnId);

        // Attach event listeners if elements are found
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', params.onThemeToggle);
        } else {
            console.error('Theme toggle button not found for AppHeader initialization.');
        }

        if (reconfigureBtn) {
            reconfigureBtn.addEventListener('click', params.onReconfigure);
        } else {
            console.error('Reconfigure button not found for AppHeader initialization.');
        }

        // Define a function on the exposed AppHeader object to update the logo
        // This allows the main app (e.g., the wizard) to tell the header to change its logo.
        AppHeader.updateLogo = function(base64Image) {
            if (mainAppLogo) {
                mainAppLogo.src = base64Image;
            }
        };

        // Define a function on the exposed AppHeader object to update the theme button icon
        AppHeader.updateThemeButton = function(icon) {
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = icon;
            }
        };
    }

    // Expose the init function globally via 'window.AppHeader'
    // This makes it accessible from your main script.
    window.AppHeader = {
        init: init,
        // updateLogo and updateThemeButton will be added to this object during init() call
    };
})();
