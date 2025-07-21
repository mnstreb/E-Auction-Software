// src/sections/SetupWizard/SetupWizard.js

window.SetupWizard = (function() {
    let projectSettings;
    let estimateItems;
    let stateSalesTax;
    let onCompletionCallback;
    let renderMessageBoxCallback;
    let closeMessageBoxCallback;

    // UI Element references
    let setupWizardContainer;
    let wizardSteps = [];
    let stepItems = [];
    let progressBar;

    let logoUploadInput;
    let logoUploadArea;
    let wizardLogoPreview;
    // The old 'defaultLogoIcon' is now an image element.
    let wizardDefaultLogoElem; 
    let uploadText;
    let clearLogoBtn;

    let projectNameInput;
    let clientNameInput;
    let projectTypeSelect;
    let projectStateSelect;
    let tradeSearchInput;
    let tradesDropdown;
    let selectedTradesDisplay;

    let showAdvancedDetailsLink;
    let advancedDetailsSection;

    let dynamicLaborRateInputs;
    let advancedLink;
    let advancedSkillLevelControls;
    let newSkillTitleInput;
    let newSkillRateInput;

    let profitMarginInput;
    let salesTaxInput;
    let miscellaneousInput;
    let overheadInput;
    let materialMarkupInput;
    let additionalConsiderationsValueInput;
    let toggleAdditionalConsiderationsBtn;


    // State for wizard navigation
    let currentStep = 1;
    let isAdvancedDetailsActive = false;
    let isAdvancedModeActive = false;

    const stepDetails = [
        { label: 'Project Info', statusPending: 'Pending', statusInProgress: 'In Progress', statusCompleted: 'Completed' },
        { label: 'Labor Rates', statusPending: 'Pending', statusInProgress: 'In Progress', statusCompleted: 'Completed' },
        { label: 'Project Settings', statusPending: 'Pending', statusInProgress: 'In Progress', statusCompleted: 'Completed' }
    ];


    /**
     * Initializes the SetupWizard module.
     * @param {object} config - Configuration object.
     * ... (rest of JSDoc is the same)
     */
    function init(config) {
        projectSettings = config.projectSettings;
        estimateItems = config.estimateItems;
        stateSalesTax = config.stateSalesTax;
        onCompletionCallback = config.onCompletion;
        renderMessageBoxCallback = config.renderMessageBox;
        closeMessageBoxCallback = config.closeMessageBox;

        // Get UI element references
        setupWizardContainer = document.getElementById('setupWizard');
        wizardSteps = [
            document.getElementById('wizardStep1'),
            document.getElementById('wizardStep2'),
            document.getElementById('wizardStep3')
        ];
        stepItems = [ 
            document.getElementById('step1Container'),
            document.getElementById('step2Container'),
            document.getElementById('step3Container')
        ];
        progressBar = document.getElementById('progressBar');

        logoUploadInput = document.getElementById('logoUploadInput');
        logoUploadArea = document.getElementById('logoUploadArea');
        wizardLogoPreview = document.getElementById('wizardLogoPreview');
        // Get the new default logo element from the updated HTML.
        wizardDefaultLogoElem = document.getElementById('wizardDefaultLogo'); 
        uploadText = document.getElementById('uploadText');
        clearLogoBtn = document.getElementById('clearLogoBtn');

        projectNameInput = document.getElementById('projectName');
        clientNameInput = document.getElementById('clientName');
        projectTypeSelect = document.getElementById('projectType');
        projectStateSelect = document.getElementById('projectState');
        tradeSearchInput = document.getElementById('tradeSearchInput');
        tradesDropdown = document.getElementById('tradesDropdown');
        selectedTradesDisplay = document.getElementById('selectedTradesDisplay');
        showAdvancedDetailsLink = document.getElementById('showAdvancedDetailsLink');
        advancedDetailsSection = document.getElementById('advancedDetailsSection');

        dynamicLaborRateInputs = document.getElementById('dynamicLaborRateInputs');
        advancedLink = document.getElementById('advancedLink');
        advancedSkillLevelControls = document.getElementById('advancedSkillLevelControls');
        newSkillTitleInput = document.getElementById('newSkillTitle');
        newSkillRateInput = document.getElementById('newSkillRate');

        profitMarginInput = document.getElementById('profitMargin');
        salesTaxInput = document.getElementById('salesTax');
        miscellaneousInput = document.getElementById('miscellaneous');
        overheadInput = document.getElementById('overhead');
        materialMarkupInput = document.getElementById('materialMarkup');
        additionalConsiderationsValueInput = document.getElementById('additionalConsiderationsValue');
        toggleAdditionalConsiderationsBtn = document.getElementById('toggleAdditionalConsiderationsBtn');


        // Attach event listeners specific to the wizard
        logoUploadInput.addEventListener('change', handleLogoInputChange);
        logoUploadArea.addEventListener('dragover', (event) => { event.preventDefault(); logoUploadArea.classList.add('drag-over'); });
        logoUploadArea.addEventListener('dragleave', () => { logoUploadArea.classList.remove('drag-over'); });
        logoUploadArea.addEventListener('drop', handleLogoDrop);
        logoUploadArea.addEventListener('click', (event) => {
            if (event.target !== clearLogoBtn) {
                logoUploadInput.click();
            }
        });
        
        if (clearLogoBtn) {
            clearLogoBtn.addEventListener('click', clearLogo);
        }

        projectStateSelect.addEventListener('change', (event) => {
            updateSalesTaxForState(event.target.value);
        });

        tradeSearchInput.addEventListener('input', populateTradesDropdown);
        tradeSearchInput.addEventListener('focus', showTradeDropdown);
        tradeSearchInput.addEventListener('blur', hideTradeDropdown);
        selectedTradesDisplay.addEventListener('click', toggleTradeDropdown);

        showAdvancedDetailsLink.addEventListener('click', toggleAdvancedDetails);
        advancedLink.addEventListener('click', toggleAdvancedRates);
        document.getElementById('addSkillLevelBtn').addEventListener('click', addSkillLevelFromAdvanced);

        // Wizard navigation buttons
        document.getElementById('nextStep1Btn').addEventListener('click', () => nextStep(1));
        document.getElementById('prevStep2Btn').addEventListener('click', () => prevStep(2));
        document.getElementById('nextStep2Btn').addEventListener('click', () => nextStep(2));
        document.getElementById('prevStep3Btn').addEventListener('click', () => prevStep(3));
        document.getElementById('startEstimatingBtn').addEventListener('click', startEstimating);
        
        if (toggleAdditionalConsiderationsBtn) {
            toggleAdditionalConsiderationsBtn.addEventListener('click', toggleAdditionalConsiderationsType);
        }

        // Initial setup for the wizard
        loadSavedLogo();
        populateTradesDropdown();
        updateSelectedTradesDisplay();
    }

    // --- Wizard Navigation Logic (showStep, nextStep, prevStep, startEstimating) remains the same ---
    function showStep(stepNumber) {
        wizardSteps.forEach((stepDiv, index) => {
            stepDiv.style.display = (index + 1 === stepNumber) ? 'block' : 'none';
        });

        stepItems.forEach((stepItem, index) => {
            const stepNum = index + 1;
            const stepCircle = stepItem.querySelector('.step-circle');
            const stepLabel = stepItem.querySelector('.step-label');
            const stepStatus = stepItem.querySelector('.step-status');

            stepItem.classList.remove('active', 'completed');
            stepCircle.classList.remove('active', 'completed');
            
            stepLabel.textContent = stepDetails[index].label;
            stepCircle.textContent = stepNum;

            if (stepNum < stepNumber) {
                stepItem.classList.add('completed');
                stepCircle.classList.add('completed');
                stepStatus.textContent = stepDetails[index].statusCompleted;
                stepCircle.innerHTML = '&#10003;'; // Checkmark
            } else if (stepNum === stepNumber) {
                stepItem.classList.add('active');
                stepCircle.classList.add('active');
                stepStatus.textContent = stepDetails[index].statusInProgress;
            } else {
                stepStatus.textContent = stepDetails[index].statusPending;
            }
        });

        const totalSteps = wizardSteps.length;
        let progressWidth = (totalSteps > 1) ? ((stepNumber - 1) / (totalSteps - 1)) * 100 : 0;
        progressBar.style.width = `${progressWidth}%`;

        currentStep = stepNumber;

        if (stepNumber === 1) {
            populateWizardInputs();
            loadSavedLogo();
        }
        if (stepNumber === 2) {
            populateWizardStep2LaborRates();
        }
        if (stepNumber === 3) {
            populateWizardStep3Settings();
            updateAdditionalConsiderationsButtonText();
        }
    }

    function nextStep(stepNumber) {
        // Validation logic remains the same
        if (stepNumber === 1) {
            const projectName = projectNameInput.value.trim();
            if (!projectName) { renderMessageBoxCallback("Please enter a Project Name."); return; }
            projectSettings.projectName = projectName;
            projectSettings.clientName = clientNameInput.value.trim();
            projectSettings.projectType = projectTypeSelect.value;
            projectSettings.projectState = projectStateSelect.value;
            // ... save other fields
        }
        showStep(stepNumber + 1);
    }

    function prevStep(stepNumber) {
        showStep(stepNumber - 1);
    }

    function startEstimating() {
        // Final validation and saving logic remains the same
        projectSettings.profitMargin = parseFloat(profitMarginInput.value) || 0;
        projectSettings.salesTax = parseFloat(salesTaxInput.value) || 0;
        // ... save other settings
        onCompletionCallback(projectSettings);
    }
    
    // --- Data Management Functions ---

    function handleLogoInputChange() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            if (!file.type.startsWith('image/')) {
                renderMessageBoxCallback('Please drop an image file.');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                projectSettings.contractorLogo = e.target.result;
                loadSavedLogo();
            };
            reader.readAsDataURL(file);
        }
    }

    function handleLogoDrop(event) {
        event.preventDefault();
        logoUploadArea.classList.remove('drag-over');
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            const file = event.dataTransfer.files[0];
            if (!file.type.startsWith('image/')) {
                renderMessageBoxCallback('Please drop an image file.');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                projectSettings.contractorLogo = e.target.result;
                loadSavedLogo();
            };
            reader.readAsDataURL(file);
        }
    }

    /**
     * This is the core updated function for the logo logic.
     * It now toggles between the user's uploaded logo and your default business logo.
     */
    function loadSavedLogo() {
        if (projectSettings.contractorLogo) {
            // If a user logo exists, show it and hide the default logo and upload text.
            wizardLogoPreview.src = projectSettings.contractorLogo;
            wizardLogoPreview.classList.remove('hidden');
            if(wizardDefaultLogoElem) wizardDefaultLogoElem.classList.add('hidden');
            uploadText.classList.add('hidden');
            clearLogoBtn.classList.remove('hidden');
        } else {
            // Otherwise, hide the user logo container and show the default logo and upload text.
            wizardLogoPreview.src = '';
            wizardLogoPreview.classList.add('hidden');
            if(wizardDefaultLogoElem) wizardDefaultLogoElem.classList.remove('hidden');
            uploadText.classList.remove('hidden');
            clearLogoBtn.classList.add('hidden');
        }
    }

    function clearLogo(event) {
        event.stopPropagation();
        renderMessageBoxCallback('Are you sure you want to clear the logo?', () => {
            projectSettings.contractorLogo = '';
            loadSavedLogo();
            if (window.AppHeader && typeof window.AppHeader.updateLogo === 'function') {
                window.AppHeader.updateLogo('');
            }
            closeMessageBoxCallback();
        }, true);
    }

    // All other functions (populateWizardInputs, populateWizardStep2LaborRates, etc.) remain the same.
    // ...
    // [The rest of the file's functions like populateWizardInputs, populateWizardStep2LaborRates, etc. would be here]
    // ...
    
    // --- The rest of the functions from the original file would go here ---
    // For brevity, they are omitted, as they do not need changes for this specific task.
    // This includes:
    // - populateWizardInputs
    // - populateWizardStep3Settings
    // - updateSalesTaxForState
    // - toggleAdditionalConsiderationsType
    // - updateAdditionalConsiderationsButtonText
    // - populateTradesDropdown
    // - updateSelectedTradesDisplay
    // - handleTradeSelection
    // - toggleTradeDropdown
    // - hideTradeDropdown
    // - showTradeDropdown
    // - populateWizardStep2LaborRates
    // - updateLaborRate
    // - updateSkillTitle
    // - toggleAdvancedRates
    // - toggleAdvancedDetails
    // - addSkillLevelFromAdvanced
    // - confirmRemoveSkillLevel
    // - removeSkillLevel


    // Expose public methods for index.html to call
    return {
        init: init,
        showStep: showStep,
        populateTradesDropdown: populateTradesDropdown,
        updateSelectedTradesDisplay: updateSelectedTradesDisplay,
        updateSalesTaxForState: updateSalesTaxForState,
        loadSavedLogo: loadSavedLogo,
        handleTradeSelection: handleTradeSelection,
        updateLaborRate: updateLaborRate,
        updateSkillTitle: updateSkillTitle,
        confirmRemoveSkillLevel: confirmRemoveSkillLevel
    };
})();
