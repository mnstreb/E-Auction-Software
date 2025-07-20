// src/components/AppHeader/AppHeader.js

window.AppHeader = (function() {
    let mainAppLogoElem;
    let mainAppDefaultIcon;
    let projectTypeDisplayElem; // This will now hold the smaller text (Client | Project Type | Project State)
    let projectNameDisplayElem; // This will now hold the larger text (Project Name)
    // Removed themeToggleBtnElem as it's replaced by a slider in dropdown
    let reconfigureBtnElem;
    let saveProjectBtnElem;
    let exportDropdownBtnElem; // Reference for the main Export button
    let exportDropdownMenuElem; // Reference for the Export dropdown menu
    let userProfileBtnElem; // Reference for the User Profile button
    let userProfileDropdownMenuElem; // NEW: Reference for the User Profile dropdown menu
    let profileDropdownThemeToggleElem; // NEW: Reference for the theme toggle checkbox in profile dropdown
    let savedProjectsMenuItemElem; // NEW: Reference for the Saved Projects menu item
    
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
    let onUserProfileClickCallback; // Callback for showing saved projects

    /**
     * Initializes the AppHeader component by getting element references and
     * setting up event listeners.
     * @param {object} config - Configuration object.
     * @param {string} config.mainAppLogoId - ID for the main application logo image.
     * @param {string} config.reconfigureBtnId - ID for the reconfigure button.
     * @param {string} config.saveProjectBtnId - ID for the save project button.
     * @param {string} config.exportDropdownBtnId - ID for the main Export button.
     * @param {string} config.exportDropdownMenuId - ID for the Export dropdown menu container.
     * @param {string} config.userProfileBtnId - ID for the user profile button.
     * @param {string} config.userProfileDropdownMenuId - NEW: ID for the user profile dropdown menu.
     * @param {string} config.profileDropdownThemeToggleId - NEW: ID for the theme toggle checkbox in profile dropdown.
     * @param {string} config.savedProjectsMenuItemId - NEW: ID for the Saved Projects menu item in profile dropdown.
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
     * @param {function} config.onUserProfileClick - Callback for showing saved projects component.
     */
    function init(config) {
        mainAppLogoElem = document.getElementById(config.mainAppLogoId);
        mainAppDefaultIcon = document.getElementById('mainAppDefaultIcon'); // Static ID
        projectTypeDisplayElem = document.getElementById('projectTypeDisplay'); // This will now hold the smaller text
        projectNameDisplayElem = document.getElementById('projectNameDisplay'); // This will now hold the larger text
        // themeToggleBtnElem = document.getElementById(config.themeToggleBtnId); // Removed
        reconfigureBtnElem = document.getElementById(config.reconfigureBtnId);
        saveProjectBtnElem = document.getElementById(config.saveProjectBtnId);
        exportDropdownBtnElem = document.getElementById(config.exportDropdownBtnId);
        exportDropdownMenuElem = document.getElementById(config.exportDropdownMenuId);
        userProfileBtnElem = document.getElementById(config.userProfileBtnId);
        userProfileDropdownMenuElem = document.getElementById(config.userProfileDropdownMenuId); // NEW
        profileDropdownThemeToggleElem = document.getElementById(config.profileDropdownThemeToggleId); // NEW
        savedProjectsMenuItemElem = document.getElementById(config.savedProjectsMenuItemId); // NEW
        
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
        onUserProfileClickCallback = config.onUserProfileClick;

        // Set up event listeners
        if (reconfigureBtnElem) {
            reconfigureBtnElem.addEventListener('click', onReconfigureCallback);
        }
        if (saveProjectBtnElem) {
            saveProjectBtnElem.addEventListener('click', onSaveProjectCallback);
        }
        
        // ✨ RESTORED: This is the event listener that opens the dropdown menu.
        if (exportDropdownBtnElem) {
            exportDropdownBtnElem.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent document click listener from immediately closing
                toggleDropdown(exportDropdownMenuElem);
                hideDropdown(userProfileDropdownMenuElem); // Hide other dropdowns if open
            });
        }

        // Export Dropdown menu item listeners
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
                toggleDropdown(userProfileDropdownMenuElem); // Toggle this dropdown
                hideDropdown(exportDropdownMenuElem); // Hide other dropdowns if open
            });
        }

        // NEW: Theme Toggle Slider listener inside the profile dropdown
        if (profileDropdownThemeToggleElem) {
            profileDropdownThemeToggleElem.addEventListener('change', onThemeToggleCallback);
        }

        // NEW: Saved Projects menu item listener
        if (savedProjectsMenuItemElem) {
            savedProjectsMenuItemElem.addEventListener('click', (event) => {
                onUserProfileClickCallback(); // Call the callback to show saved projects component
                hideDropdown(userProfileDropdownMenuElem); // Hide the profile dropdown after click
            });
        }


        // Event listener to close ALL dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            // Check if click is outside export dropdown and its button
            const isClickOutsideExport = !(exportDropdownBtnElem && exportDropdownBtnElem.contains(event.target)) && 
                                         !(exportDropdownMenuElem && exportDropdownMenuElem.contains(event.target));
            
            // NEW: Check if click is outside user profile dropdown and its button
            const isClickOutsideUserProfile = !(userProfileBtnElem && userProfileBtnElem.contains(event.target)) &&
                                              !(userProfileDropdownMenuElem && userProfileDropdownMenuElem.contains(event.target));

            if (isClickOutsideExport) {
                hideDropdown(exportDropdownMenuElem);
            }
            if (isClickOutsideUserProfile) { // NEW
                hideDropdown(userProfileDropdownMenuElem);
            }
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
     * @param {string} clientName - The client/customer name.
     * @param {string} projectState - The state/location of the project.
     */
    function updateProjectInfo(projectType, projectName, clientName, projectState) {
        if (projectNameDisplayElem) { // This is the larger text (Project Name)
            projectNameDisplayElem.textContent = projectName;
        }
        if (projectTypeDisplayElem) { // This is the smaller text (Client | Project Type | Project State)
            let subtitleParts = [];
            if (clientName) subtitleParts.push(clientName);
            // Only add projectType if it's not "Quick Quote" for the subtitle, as Quick Quote is a main type
            if (projectType && projectType !== "Quick Quote") subtitleParts.push(projectType);
            if (projectState) subtitleParts.push(projectState);
            
            projectTypeDisplayElem.textContent = subtitleParts.join(' | ');
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
     * Updates the state of the theme toggle slider in the profile dropdown.
     * This function is called by the main script's toggleTheme().
     * @param {boolean} isDark - True if dark theme is active, false otherwise.
     */
    function updateThemeToggleSlider(isDark) {
        if (profileDropdownThemeToggleElem) {
            // If isDark is true, the checkbox should be unchecked (to visually represent dark mode on slider)
            // If isDark is false (light theme active), the checkbox should be checked (to visually represent light mode on slider)
            profileDropdownThemeToggleElem.checked = !isDark;
        }
    }

    // Expose public methods
    return {
        init: init,
        updateProjectInfo: updateProjectInfo,
        updateLogo: updateLogo,
        updateThemeToggleSlider: updateThemeToggleSlider // NEW exposed function
    };
})();
