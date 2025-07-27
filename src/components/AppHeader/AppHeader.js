// src/components/AppHeader/AppHeader.js

window.AppHeader = (function() {
    let mainAppLogoElem;
    let mainAppDefaultIcon;
    let projectTypeDisplayElem;
    let projectNameDisplayElem;
    let reconfigureBtnElem;
    let saveProjectBtnElem;
    let exportDropdownBtnElem;
    let exportDropdownMenuElem;
    let userProfileBtnElem;
    let userProfileDropdownMenuElem;
    let profileDropdownThemeToggleElem;
    let savedProjectsMenuItemElem;
    // NEW: Add variable for the new menu item
    let companyProfileMenuItemElem; 
    
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
    let onUserProfileClickCallback;
    // NEW: Add callback for the new menu item
    let onCompanyProfileClickCallback; 

    /**
     * Initializes the AppHeader component.
     * @param {object} config - Configuration object.
     */
    function init(config) {
        mainAppLogoElem = document.getElementById(config.mainAppLogoId);
        mainAppDefaultIcon = document.getElementById('mainAppDefaultIcon');
        projectTypeDisplayElem = document.getElementById('projectTypeDisplay');
        projectNameDisplayElem = document.getElementById('projectNameDisplay');
        reconfigureBtnElem = document.getElementById(config.reconfigureBtnId);
        saveProjectBtnElem = document.getElementById(config.saveProjectBtnId);
        exportDropdownBtnElem = document.getElementById(config.exportDropdownBtnId);
        exportDropdownMenuElem = document.getElementById(config.exportDropdownMenuId);
        userProfileBtnElem = document.getElementById(config.userProfileBtnId);
        userProfileDropdownMenuElem = document.getElementById(config.userProfileDropdownMenuId);
        profileDropdownThemeToggleElem = document.getElementById(config.profileDropdownThemeToggleId);
        savedProjectsMenuItemElem = document.getElementById(config.savedProjectsMenuItemId);
        // NEW: Get the new menu item element by its ID
        companyProfileMenuItemElem = document.getElementById(config.companyProfileMenuItemId);
        
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
        // NEW: Assign the callback from the config object
        onCompanyProfileClickCallback = config.onCompanyProfileClick;

        // Set up event listeners
        if (reconfigureBtnElem) reconfigureBtnElem.addEventListener('click', onReconfigureCallback);
        if (saveProjectBtnElem) saveProjectBtnElem.addEventListener('click', onSaveProjectCallback);
        
        if (exportDropdownBtnElem) {
            exportDropdownBtnElem.addEventListener('click', (event) => {
                event.stopPropagation();
                toggleDropdown(exportDropdownMenuElem);
                hideDropdown(userProfileDropdownMenuElem);
            });
        }

        if (exportPdfReportBtnElem) exportPdfReportBtnElem.addEventListener('click', () => { onExportPdfReportCallback(); hideDropdown(exportDropdownMenuElem); });
        if (exportCsvBtnElem) exportCsvBtnElem.addEventListener('click', () => { onExportCsvCallback(); hideDropdown(exportDropdownMenuElem); });
        if (exportPdfQuoteBtnElem) exportPdfQuoteBtnElem.addEventListener('click', () => { onExportPdfQuoteCallback(); hideDropdown(exportDropdownMenuElem); });
        if (emailClientBtnElem) emailClientBtnElem.addEventListener('click', () => { onEmailClientCallback(); hideDropdown(exportDropdownMenuElem); });

        if (userProfileBtnElem) {
            userProfileBtnElem.addEventListener('click', (event) => {
                event.stopPropagation();
                toggleDropdown(userProfileDropdownMenuElem);
                hideDropdown(exportDropdownMenuElem);
            });
        }

        if (profileDropdownThemeToggleElem) profileDropdownThemeToggleElem.addEventListener('change', onThemeToggleCallback);

        // NEW: Add the event listener for the "My Company Information" button
        if (companyProfileMenuItemElem) {
            companyProfileMenuItemElem.addEventListener('click', () => {
                onCompanyProfileClickCallback();
                hideDropdown(userProfileDropdownMenuElem);
            });
        }

        if (savedProjectsMenuItemElem) {
            savedProjectsMenuItemElem.addEventListener('click', () => {
                onUserProfileClickCallback();
                hideDropdown(userProfileDropdownMenuElem);
            });
        }

        document.addEventListener('click', function(event) {
            const isClickOutsideExport = !(exportDropdownBtnElem && exportDropdownBtnElem.contains(event.target)) && 
                                         !(exportDropdownMenuElem && exportDropdownMenuElem.contains(event.target));
            const isClickOutsideUserProfile = !(userProfileBtnElem && userProfileBtnElem.contains(event.target)) &&
                                              !(userProfileDropdownMenuElem && userProfileDropdownMenuElem.contains(event.target));
            if (isClickOutsideExport) hideDropdown(exportDropdownMenuElem);
            if (isClickOutsideUserProfile) hideDropdown(userProfileDropdownMenuElem);
        });
    }

    function toggleDropdown(dropdownElem) {
        if (dropdownElem) dropdownElem.classList.toggle('show');
    }

    function hideDropdown(dropdownElem) {
        if (dropdownElem) dropdownElem.classList.remove('show');
    }

    function updateProjectInfo(projectType, projectName, clientName, projectState) {
        if (projectTypeDisplayElem) projectTypeDisplayElem.textContent = projectName;
        if (projectNameDisplayElem) {
            let subtitleParts = [];
            if (clientName) subtitleParts.push(clientName);
            if (projectType && projectType !== "Quick Quote") subtitleParts.push(projectType);
            if (projectState) subtitleParts.push(projectState);
            projectNameDisplayElem.textContent = subtitleParts.join(' | ');
        }
    }

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

    function updateThemeToggleSlider(isDark) {
        if (profileDropdownThemeToggleElem) {
            profileDropdownThemeToggleElem.checked = !isDark;
        }
    }

    return {
        init: init,
        updateProjectInfo: updateProjectInfo,
        updateLogo: updateLogo,
        updateThemeToggleSlider: updateThemeToggleSlider
    };
})();
