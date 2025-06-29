// src/components/AppHeader/AppHeader.js

window.AppHeader = (function() {
    let mainAppLogoElem;
    let mainAppDefaultIcon;
    let projectTypeDisplayElem;
    let projectNameDisplayElem;
    let themeToggleBtnElem;
    let reconfigureBtnElem;
    let saveProjectBtnElem;
    let exportDropdownBtnElem; // NEW: Reference for the main Export button
    let exportDropdownMenuElem; // NEW: Reference for the Export dropdown menu
    let userProfileBtnElem; // NEW: Reference for the User Profile button
    
    // Removed direct references to old report/quote buttons; now they are dropdown items
    let exportPdfReportBtnElem;
    let exportCsvBtnElem;
    let exportPdfQuoteBtnElem;
    let emailClientBtnElem;

    let onThemeToggleCallback;
    let onReconfigureCallback;
    let onSaveProjectCallback;
    let onExportPdfReportCallback;
    let onExportCsvCallback;
    let onExportPdfQuoteCallback;
    let onEmailClientCallback;
    let onUserProfileClickCallback; // NEW: Callback for user profile button

    /**
     * Initializes the AppHeader component by getting element references and
     * setting up event listeners.
     * @param {object} config - Configuration object.
     * @param {string} config.mainAppLogoId - ID for the main application logo image.
     * @param {string} config.themeToggleBtnId - ID for the theme toggle button.
     * @param {string} config.reconfigureBtnId - ID for the reconfigure button.
     * @param {string} config.saveProjectBtnId - ID for the save project button.
     * @param {string} config.exportDropdownBtnId - NEW: ID for the main Export button.
     * @param {string} config.exportDropdownMenuId - NEW: ID for the Export dropdown menu container.
     * @param {string} config.userProfileBtnId - NEW: ID for the user profile button.
     * @param {string} config.exportPdfReportBtnId - ID for the Export as PDF (Detailed Report) button.
     * @param {string} config.exportCsvBtnId - ID for the Export as CSV/XLX button.
     * @param {string} config.exportPdfQuoteBtnId - ID for the Export as PDF (Client Quote) button.
     * @param {string} config.emailClientBtnId - ID for the Email Client Quote button.
     * @param {function} config.onThemeToggle - Callback function for theme toggle.
     * @param {function} config.onReconfigure - Callback function for reconfigure button.
     * @param {function} config.onSaveProject - Callback function for save project button.
     * @param {function} config.onExportPdfReport - Callback for Export as PDF (Detailed Report) action.
     * @param {function} config.onExportCsv - Callback for Export as CSV/XLX action.
     * @param {function} config.onExportPdfQuote - Callback for Export as PDF (Client Quote) action.
     * @param {function} config.onEmailClient - Callback for Email Client Quote action.
     * @param {function} config.onUserProfileClick - NEW: Callback for user profile button click.
     */
    function init(config) {
        mainAppLogoElem = document.getElementById(config.mainAppLogoId);
        mainAppDefaultIcon = document.getElementById('mainAppDefaultIcon'); // Static ID
        projectTypeDisplayElem = document.getElementById('projectTypeDisplay');
        projectNameDisplayElem = document.getElementById('projectNameDisplay');
        themeToggleBtnElem = document.getElementById(config.themeToggleBtnId);
        reconfigureBtnElem = document.getElementById(config.reconfigureBtnId);
        saveProjectBtnElem = document.getElementById(config.saveProjectBtnId);
        exportDropdownBtnElem = document.getElementById(config.exportDropdownBtnId); // NEW
        exportDropdownMenuElem = document.getElementById(config.exportDropdownMenuId); // NEW
        userProfileBtnElem = document.getElementById(config.userProfileBtnId); // NEW
        
        // Dropdown menu item references (now consolidated under 'Export')
        exportPdfReportBtnElem = document.getElementById(config.exportPdfReportBtnId);
        exportCsvBtnElem = document.getElementById(config.exportCsvBtnId);
        exportPdfQuoteBtnElem = document.getElementById(config.exportPdfQuoteBtnId);
        emailClientBtnElem = document.getElementById(config.emailClientBtnId);


        onThemeToggleCallback = config.onThemeToggle;
        onReconfigureCallback = config.onReconfigure;
        onSaveProjectCallback = config.onSaveProject;
        onExportPdfReportCallback = config.onExportPdfReport;
        onExportCsvCallback = config.onExportCsv;
        onExportPdfQuoteCallback = config.onExportPdfQuote;
        onEmailClientCallback = config.onEmailClient;
        onUserProfileClickCallback = config.onUserProfileClick; // NEW: Assign user profile callback

        // Set up event listeners
        if (themeToggleBtnElem) {
            themeToggleBtnElem.addEventListener('click', onThemeToggleCallback);
        }
        if (reconfigureBtnElem) {
            reconfigureBtnElem.addEventListener('click', onReconfigureCallback);
        }
        if (saveProjectBtnElem) {
            saveProjectBtnElem.addEventListener('click', onSaveProjectCallback);
        }
        
        // NEW: Export Dropdown button listener
        if (exportDropdownBtnElem) {
            exportDropdownBtnElem.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent document click listener from immediately closing
                toggleDropdown(exportDropdownMenuElem);
                // If you add other dropdowns later (e.g., user profile dropdown), hide them here:
                // hideDropdown(userProfileDropdownMenuElem);
            });
        }

        // NEW: Export Dropdown menu item listeners
        if (exportPdfReportBtnElem) {
            exportPdfReportBtnElem.addEventListener('click', (event) => {
                onExportPdfReportCallback();
                hideDropdown(exportDropdownMenuElem);
            });
        }
        if (exportCsvBtnElem) {
            exportCsvBtnElem.addEventListener('click', (event) => {
                onExportCsvCallback();
                hideDropdown(exportDropdownMenuElem);
            });
        }
        if (exportPdfQuoteBtnElem) {
            exportPdfQuoteBtnElem.addEventListener('click', (event) => {
                onExportPdfQuoteCallback();
                hideDropdown(exportDropdownMenuElem);
            });
        }
        if (emailClientBtnElem) {
            emailClientBtnElem.addEventListener('click', (event) => {
                onEmailClientCallback();
                hideDropdown(exportDropdownMenuElem);
            });
        }

        // NEW: User Profile Button listener
        if (userProfileBtnElem) {
            userProfileBtnElem.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent document click listener from immediately closing
                onUserProfileClickCallback(); // Call the callback for user profile click
                // If you add a user profile dropdown later, toggle it here:
                // toggleDropdown(userProfileDropdownMenuElem);
                hideDropdown(exportDropdownMenuElem); // Hide other dropdowns if open
            });
        }


        // Event listener to close ALL dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            // Check if click is outside export dropdown and its button
            const isClickOutsideExport = !(exportDropdownBtnElem && exportDropdownBtnElem.contains(event.target)) && 
                                         !(exportDropdownMenuElem && exportDropdownMenuElem.contains(event.target));
            
            // Check if click is outside user profile button (and its future dropdown)
            const isClickOutsideUserProfile = !(userProfileBtnElem && userProfileBtnElem.contains(event.target));
            // Add check for user profile dropdown if it gets one later:
            // && !(userProfileDropdownMenuElem && userProfileDropdownMenuElem.contains(event.target));

            if (isClickOutsideExport) {
                hideDropdown(exportDropdownMenuElem);
            }
            // If user profile gets a dropdown, add similar logic here:
            // if (isClickOutsideUserProfile) {
            //     hideDropdown(userProfileDropdownMenuElem);
            // }
        });
    }

    /**
     * Toggles the 'show' class on a given dropdown element.
     * @param {HTMLElement} dropdownElem - The dropdown menu element to toggle.
     */
    function toggleDropdown(dropdownElem) {
        if (dropdownElem) {
            dropdownElem.classList.toggle('show');
        }
    }

    /**
     * Hides a given dropdown element by removing the 'show' class.
     * @param {HTMLElement} dropdownElem - The dropdown menu element to hide.
     */
    function hideDropdown(dropdownElem) {
        if (dropdownElem) {
            dropdownElem.classList.remove('show');
        }
    }

    /**
     * Updates the project information displayed in the header.
     * @param {string} projectType - The type of project (e.g., Commercial).
     * @param {string} projectName - The name of the project.
     * @param {string} projectState - The state/location of the project.
     */
    function updateProjectInfo(projectType, projectName, projectState) {
        if (projectTypeDisplayElem) {
            projectTypeDisplayElem.textContent = projectType;
        }
        if (projectNameDisplayElem) {
            projectNameDisplayElem.textContent = `${projectName} - ${projectState}`;
        }
    }

    /**
     * Updates the logo displayed in the header.
     * @param {string} logoSrc - Data URL or path for the logo image.
     */
    function updateLogo(logoSrc) {
        if (mainAppLogoElem) {
            if (logoSrc) {
                mainAppLogoElem.src = logoSrc;
                mainAppLogoElem.classList.remove('hidden');
                mainAppDefaultIcon.classList.add('hidden');
            } else {
                mainAppLogoElem.src = '';
                mainAppLogoElem.classList.add('hidden');
                mainAppDefaultIcon.classList.remove('hidden');
            }
        }
    }

    /**
     * Updates the text/icon of the theme toggle button.
     * @param {string} icon - The icon/text to display (e.g., '☀️' or '🌙').
     */
    function updateThemeButton(icon) {
        if (themeToggleBtnElem) {
            themeToggleBtnElem.textContent = icon;
        }
    }

    // Expose public methods
    return {
        init: init,
        updateProjectInfo: updateProjectInfo,
        updateLogo: updateLogo,
        updateThemeButton: updateThemeButton
    };
})();
