// src/components/AppHeader/AppHeader.js

window.AppHeader = (function() {
    let mainAppLogoElem;
    let mainAppDefaultIcon;
    let projectTypeDisplayElem;
    let projectNameDisplayElem;
    let themeToggleBtnElem;
    let reconfigureBtnElem;
    
    // Dropdown specific elements
    let generateReportBtnElem;
    let reportDropdownMenuElem;
    let exportPdfBtnElem;
    let exportCsvBtnElem;
    let emailClientBtnElem;

    let onThemeToggleCallback;
    let onReconfigureCallback;
    // New callbacks for dropdown items
    let onExportPdfCallback;
    let onExportCsvCallback;
    let onEmailClientCallback;

    /**
     * Initializes the AppHeader component by getting element references and
     * setting up event listeners.
     * @param {object} config - Configuration object.
     * @param {string} config.mainAppLogoId - ID for the main application logo image.
     * @param {string} config.themeToggleBtnId - ID for the theme toggle button.
     * @param {string} config.reconfigureBtnId - ID for the reconfigure button.
     * @param {string} config.generateReportBtnId - ID for the main Generate Report button (which opens dropdown).
     * @param {string} config.reportDropdownMenuId - ID for the dropdown menu container.
     * @param {string} config.exportPdfBtnId - ID for the Export as PDF button inside dropdown.
     * @param {string} config.exportCsvBtnId - ID for the Export as CSV/XLX button inside dropdown.
     * @param {string} config.emailClientBtnId - ID for the Email Directly To Client button inside dropdown.
     * @param {function} config.onThemeToggle - Callback function for theme toggle.
     * @param {function} config.onReconfigure - Callback function for reconfigure button.
     * @param {function} config.onExportPdf - Callback for Export as PDF action.
     * @param {function} config.onExportCsv - Callback for Export as CSV/XLX action.
     * @param {function} config.onEmailClient - Callback for Email Directly To Client action.
     */
    function init(config) {
        mainAppLogoElem = document.getElementById(config.mainAppLogoId);
        mainAppDefaultIcon = document.getElementById('mainAppDefaultIcon'); // Static ID
        projectTypeDisplayElem = document.getElementById('projectTypeDisplay');
        projectNameDisplayElem = document.getElementById('projectNameDisplay');
        themeToggleBtnElem = document.getElementById(config.themeToggleBtnId);
        reconfigureBtnElem = document.getElementById(config.reconfigureBtnId);
        
        // Dropdown element references
        generateReportBtnElem = document.getElementById(config.generateReportBtnId);
        reportDropdownMenuElem = document.getElementById(config.reportDropdownMenuId);
        exportPdfBtnElem = document.getElementById(config.exportPdfBtnId);
        exportCsvBtnElem = document.getElementById(config.exportCsvBtnId);
        emailClientBtnElem = document.getElementById(config.emailClientBtnId);

        onThemeToggleCallback = config.onThemeToggle;
        onReconfigureCallback = config.onReconfigure;
        // Assign new callbacks for dropdown items
        onExportPdfCallback = config.onExportPdf;
        onExportCsvCallback = config.onExportCsv;
        onEmailClientCallback = config.onEmailClient;

        // Set up event listeners
        if (themeToggleBtnElem) {
            themeToggleBtnElem.addEventListener('click', onThemeToggleCallback);
        }
        if (reconfigureBtnElem) {
            reconfigureBtnElem.addEventListener('click', onReconfigureCallback);
        }
        
        // Dropdown button listener
        if (generateReportBtnElem) {
            generateReportBtnElem.addEventListener('click', toggleReportDropdown);
        }

        // Dropdown menu item listeners
        if (exportPdfBtnElem) {
            exportPdfBtnElem.addEventListener('click', (event) => {
                onExportPdfCallback();
                hideReportDropdown(); // Hide dropdown after click
            });
        }
        if (exportCsvBtnElem) {
            exportCsvBtnElem.addEventListener('click', (event) => {
                onExportCsvCallback();
                hideReportDropdown(); // Hide dropdown after click
            });
        }
        if (emailClientBtnElem) {
            emailClientBtnElem.addEventListener('click', (event) => {
                onEmailClientCallback();
                hideReportDropdown(); // Hide dropdown after click
            });
        }

        // Event listener to close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (reportDropdownMenuElem && !generateReportBtnElem.contains(event.target) && !reportDropdownMenuElem.contains(event.target)) {
                hideReportDropdown();
            }
        });
    }

    // Function to toggle dropdown visibility
    function toggleReportDropdown() {
        if (reportDropdownMenuElem) {
            reportDropdownMenuElem.classList.toggle('show');
        }
    }

    // Function to hide dropdown
    function hideReportDropdown() {
        if (reportDropdownMenuElem) {
            reportDropdownMenuElem.classList.remove('show');
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
