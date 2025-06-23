// src/components/AppHeader/AppHeader.js

window.AppHeader = (function() {
    let mainAppLogoElem;
    let mainAppDefaultIcon;
    let projectTypeDisplayElem;
    let projectNameDisplayElem;
    let themeToggleBtnElem;
    let reconfigureBtnElem;
    
    // Report Dropdown specific elements
    let generateReportBtnElem;
    let reportDropdownMenuElem;
    let exportPdfReportBtnElem;
    let exportCsvBtnElem;

    // Quote Dropdown specific elements
    let generateQuoteBtnElem; // NEW
    let quoteDropdownMenuElem; // NEW
    let exportPdfQuoteBtnElem; // NEW
    let emailClientBtnElem; // Moved

    let onThemeToggleCallback;
    let onReconfigureCallback;
    // Callbacks for Report Dropdown items
    let onExportPdfReportCallback; // NEW
    let onExportCsvCallback;
    // Callbacks for Quote Dropdown items
    let onExportPdfQuoteCallback; // NEW
    let onEmailClientCallback;

    /**
     * Initializes the AppHeader component by getting element references and
     * setting up event listeners.
     * @param {object} config - Configuration object.
     * @param {string} config.mainAppLogoId - ID for the main application logo image.
     * @param {string} config.themeToggleBtnId - ID for the theme toggle button.
     * @param {string} config.reconfigureBtnId - ID for the reconfigure button.
     * * @param {string} config.generateReportBtnId - ID for the main Generate Report button.
     * @param {string} config.reportDropdownMenuId - ID for the Report dropdown menu container.
     * @param {string} config.exportPdfReportBtnId - ID for the Export as PDF (Detailed) button.
     * @param {string} config.exportCsvBtnId - ID for the Export as CSV/XLX button.
     * * @param {string} config.generateQuoteBtnId - ID for the main Generate Professional Quote button.
     * @param {string} config.quoteDropdownMenuId - ID for the Quote dropdown menu container.
     * @param {string} config.exportPdfQuoteBtnId - ID for the Export as PDF (Client Quote) button.
     * @param {string} config.emailClientBtnId - ID for the Email Directly To Client button.
     * * @param {function} config.onThemeToggle - Callback function for theme toggle.
     * @param {function} config.onReconfigure - Callback function for reconfigure button.
     * @param {function} config.onExportPdfReport - Callback for Export as PDF (Detailed) action.
     * @param {function} config.onExportCsv - Callback for Export as CSV/XLX action.
     * @param {function} config.onExportPdfQuote - Callback for Export as PDF (Client Quote) action.
     * @param {function} config.onEmailClient - Callback for Email Directly To Client action.
     */
    function init(config) {
        mainAppLogoElem = document.getElementById(config.mainAppLogoId);
        mainAppDefaultIcon = document.getElementById('mainAppDefaultIcon'); // Static ID
        projectTypeDisplayElem = document.getElementById('projectTypeDisplay');
        projectNameDisplayElem = document.getElementById('projectNameDisplay');
        themeToggleBtnElem = document.getElementById(config.themeToggleBtnId);
        reconfigureBtnElem = document.getElementById(config.reconfigureBtnId);
        
        // Report Dropdown element references
        generateReportBtnElem = document.getElementById(config.generateReportBtnId);
        reportDropdownMenuElem = document.getElementById(config.reportDropdownMenuId);
        exportPdfReportBtnElem = document.getElementById(config.exportPdfReportBtnId);
        exportCsvBtnElem = document.getElementById(config.exportCsvBtnId);

        // Quote Dropdown element references (NEW)
        generateQuoteBtnElem = document.getElementById(config.generateQuoteBtnId);
        quoteDropdownMenuElem = document.getElementById(config.quoteDropdownMenuId);
        exportPdfQuoteBtnElem = document.getElementById(config.exportPdfQuoteBtnId);
        emailClientBtnElem = document.getElementById(config.emailClientBtnId); // Moved to quote dropdown


        onThemeToggleCallback = config.onThemeToggle;
        onReconfigureCallback = config.onReconfigure;
        // Assign new callbacks for Report dropdown items
        onExportPdfReportCallback = config.onExportPdfReport;
        onExportCsvCallback = config.onExportCsv;
        // Assign new callbacks for Quote dropdown items
        onExportPdfQuoteCallback = config.onExportPdfQuote;
        onEmailClientCallback = config.onEmailClient;

        // Set up event listeners
        if (themeToggleBtnElem) {
            themeToggleBtnElem.addEventListener('click', onThemeToggleCallback);
        }
        if (reconfigureBtnElem) {
            reconfigureBtnElem.addEventListener('click', onReconfigureCallback);
        }
        
        // Report Dropdown button listener
        if (generateReportBtnElem) {
            generateReportBtnElem.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent document click listener from immediately closing
                toggleDropdown(reportDropdownMenuElem);
                hideDropdown(quoteDropdownMenuElem); // Hide the other dropdown if open
            });
        }

        // Report Dropdown menu item listeners
        if (exportPdfReportBtnElem) {
            exportPdfReportBtnElem.addEventListener('click', (event) => {
                onExportPdfReportCallback();
                hideDropdown(reportDropdownMenuElem);
            });
        }
        if (exportCsvBtnElem) {
            exportCsvBtnElem.addEventListener('click', (event) => {
                onExportCsvCallback();
                hideDropdown(reportDropdownMenuElem);
            });
        }

        // Quote Dropdown button listener (NEW)
        if (generateQuoteBtnElem) {
            generateQuoteBtnElem.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent document click listener from immediately closing
                toggleDropdown(quoteDropdownMenuElem);
                hideDropdown(reportDropdownMenuElem); // Hide the other dropdown if open
            });
        }

        // Quote Dropdown menu item listeners (NEW)
        if (exportPdfQuoteBtnElem) {
            exportPdfQuoteBtnElem.addEventListener('click', (event) => {
                onExportPdfQuoteCallback();
                hideDropdown(quoteDropdownMenuElem);
            });
        }
        if (emailClientBtnElem) {
            emailClientBtnElem.addEventListener('click', (event) => {
                onEmailClientCallback();
                hideDropdown(quoteDropdownMenuElem);
            });
        }


        // Event listener to close ALL dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            // Check if click is outside both report dropdown and its button
            const isClickOutsideReport = !(generateReportBtnElem && generateReportBtnElem.contains(event.target)) && 
                                         !(reportDropdownMenuElem && reportDropdownMenuElem.contains(event.target));
            // Check if click is outside both quote dropdown and its button
            const isClickOutsideQuote = !(generateQuoteBtnElem && generateQuoteBtnElem.contains(event.target)) && 
                                        !(quoteDropdownMenuElem && quoteDropdownMenuElem.contains(event.target));

            if (isClickOutsideReport) {
                hideDropdown(reportDropdownMenuElem);
            }
            if (isClickOutsideQuote) {
                hideDropdown(quoteDropdownMenuElem);
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
