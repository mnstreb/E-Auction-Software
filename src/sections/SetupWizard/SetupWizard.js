// src/sections/SetupWizard/SetupWizard.js

window.SetupWizard = (function() {
    let projectSettings;
    let estimateItems;
    let stateSalesTax; // Passed from main script
    let onCompletionCallback; // Callback to main script when wizard is done
    let renderMessageBoxCallback; // Callback to main script for message box
    let closeMessageBoxCallback; // Callback to main script for closing message box

    // UI Element references (private to this module)
    let setupWizardContainer; // The main wizard div
    let wizardSteps = [];
    let stepItems = []; // Renamed from stepCircles to stepItems (containers for circles and text)
    let progressBar; // Element for the progress bar fill

    let logoUploadInput;
    let logoUploadArea;
    let wizardLogoPreview;
    let defaultLogoIcon;
    let uploadText;
    let clearLogoBtn; // NEW: Reference for the clear logo button

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
    // Removed: let additionalConsiderationsUnitSpan; // This reference is no longer needed
    let toggleAdditionalConsiderationsBtn; // NEW: Reference for the toggle button


    // State for wizard navigation
    let currentStep = 1;
    let isAdvancedDetailsActive = false; // For Step 1 advanced details
    let isAdvancedModeActive = false; // For Step 2 advanced labor rates

    // Define step labels and statuses
    const stepDetails = [
        { label: 'Project Info', statusPending: 'Pending', statusInProgress: 'In Progress', statusCompleted: 'Completed' },
        { label: 'Labor Rates', statusPending: 'Pending', statusInProgress: 'In Progress', statusCompleted: 'Completed' },
        { label: 'Project Settings', statusPending: 'Pending', statusInProgress: 'In Progress', statusCompleted: 'Completed' }
    ];


    /**
     * Initializes the SetupWizard module.
     * @param {object} config - Configuration object.
     * @param {object} config.projectSettings - The global project settings object (mutable).
     * @param {Array<object>} config.estimateItems - The global estimate items array (mutable).
     * @param {object} config.stateSalesTax - The map of state sales tax rates.
     * @param {function} config.onCompletion - Callback function to execute when the wizard is completed.
     * @param {function} config.renderMessageBox - Reference to the global renderMessageBox function.
     * @param {function} config.closeMessageBox - Reference to the global closeMessageBox function.
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
        // Referencing the step item containers now
        stepItems = [ 
            document.getElementById('step1Container'),
            document.getElementById('step2Container'),
            document.getElementById('step3Container')
        ];
        progressBar = document.getElementById('progressBar'); // Progress bar element

        logoUploadInput = document.getElementById('logoUploadInput');
        logoUploadArea = document.getElementById('logoUploadArea');
        wizardLogoPreview = document.getElementById('wizardLogoPreview');
        defaultLogoIcon = document.getElementById('defaultLogoIcon');
        uploadText = document.getElementById('uploadText');
        clearLogoBtn = document.getElementById('clearLogoBtn'); // NEW: Get reference to the clear button

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
        // Removed: additionalConsiderationsUnitSpan = document.getElementById('additionalConsiderationsUnit'); // This line is no longer needed
        toggleAdditionalConsiderationsBtn = document.getElementById('toggleAdditionalConsiderationsBtn'); // NEW: Get reference


        // Attach event listeners specific to the wizard
        logoUploadInput.addEventListener('change', handleLogoInputChange);
        logoUploadArea.addEventListener('dragover', (event) => { event.preventDefault(); logoUploadArea.classList.add('drag-over'); });
        logoUploadArea.addEventListener('dragleave', () => { logoUploadArea.classList.remove('drag-over'); });
        logoUploadArea.addEventListener('drop', handleLogoDrop);
        logoUploadArea.addEventListener('click', (event) => {
            // Only trigger file input if the click is not on the clear button
            if (event.target !== clearLogoBtn) {
                logoUploadInput.click();
            }
        });
        
        // NEW: Event listener for the clear logo button
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
        
        // Ensure toggle button exists before adding listener
        if (toggleAdditionalConsiderationsBtn) {
            toggleAdditionalConsiderationsBtn.addEventListener('click', toggleAdditionalConsiderationsType);
        }


        // Initial setup for the wizard
        loadSavedLogo();
        populateTradesDropdown();
        updateSelectedTradesDisplay();
        // The main script will call showStep(1) after init
    }


    // --- Wizard Navigation Logic ---
    function showStep(stepNumber) {
        wizardSteps.forEach((stepDiv, index) => {
            if (index + 1 === stepNumber) {
                stepDiv.classList.remove('hidden');
            } else {
                stepDiv.classList.add('hidden');
            }
        });
        
        // Update step items, circles, labels, and progress bar
        stepItems.forEach((stepItem, index) => {
            const stepNum = index + 1;
            const stepCircle = stepItem.querySelector('.step-circle');
            const stepLabel = stepItem.querySelector('.step-label');
            const stepStatus = stepItem.querySelector('.step-status');

            stepItem.classList.remove('active', 'completed'); // Reset classes
            stepCircle.classList.remove('active', 'completed');
            
            // Set text labels and numbers
            stepLabel.textContent = stepDetails[index].label;
            stepCircle.textContent = stepNum;

            if (stepNum < stepNumber) {
                // Completed step
                stepItem.classList.add('completed');
                stepCircle.classList.add('completed');
                stepStatus.textContent = stepDetails[index].statusCompleted;
            } else if (stepNum === stepNumber) {
                // Current step
                stepItem.classList.add('active');
                stepCircle.classList.add('active');
                stepStatus.textContent = stepDetails[index].statusInProgress;
            } else {
                // Pending step
                stepStatus.textContent = stepDetails[index].statusPending;
            }
        });

        // Calculate progress bar width based on active step
        // For 3 steps, 0% for step 1, 50% for step 2, 100% for step 3
        const totalSteps = wizardSteps.length;
        let progressWidth = 0;
        if (totalSteps > 1) {
             progressWidth = ((stepNumber - 1) / (totalSteps - 1)) * 100;
        }
        progressBar.style.width = `${progressWidth}%`;

        currentStep = stepNumber;

        // Re-populate data each time a step is shown to reflect latest projectSettings
        if (stepNumber === 1) {
            populateWizardInputs();
            loadSavedLogo(); // Ensure logo preview is correct
        }
        if (stepNumber === 2) {
            populateWizardStep2LaborRates();
        }
        if (stepNumber === 3) {
            populateWizardStep3Settings();
            // Ensure the button text is updated when step 3 is shown
            updateAdditionalConsiderationsButtonText(); 
        }
    }

    function nextStep(stepNumber) {
        if (stepNumber === 1) {
            const projectName = projectNameInput.value.trim();
            const clientName = clientNameInput.value.trim();
            const projectType = projectTypeSelect.value.trim();
            const projectState = projectStateSelect.value.trim();

            if (!projectName) { renderMessageBoxCallback("Please enter a Project Name."); return; }
            if (!clientName) { renderMessageBoxCallback("Please enter a Client Name/Company."); return; }
            if (!projectType) { renderMessageBoxCallback("Please select a Project Type."); return; }
            if (!projectState) { renderMessageBoxCallback("Please select a State/Location."); return; }
            if (projectSettings.activeTrades.length === 0) { renderMessageBoxCallback("Please select at least one Trade Involved."); return; }

            // Save values to projectSettings, ensuring correct types
            projectSettings.projectName = projectName;
            projectSettings.clientName = clientName;
            projectSettings.projectAddress = document.getElementById('projectAddress').value;
            projectSettings.projectCity = document.getElementById('projectCity').value;
            projectSettings.projectZip = document.getElementById('projectZip').value;
            projectSettings.startDate = document.getElementById('startDate').value;
            projectSettings.endDate = document.getElementById('endDate').value;
            projectSettings.projectID = document.getElementById('projectID').value;
            projectSettings.projectDescription = document.getElementById('projectDescription').value;
            projectSettings.projectType = projectType;
            projectSettings.projectState = projectState;
            // Sales tax is updated on state change already, so no need to explicitly save here.
            
        } else if (stepNumber === 2) {
            for (const trade of projectSettings.activeTrades) {
                if (projectSettings.allTradeLaborRates[trade]) { // Only validate if the trade actually exists in the rates data
                    for (const role in projectSettings.allTradeLaborRates[trade]) {
                        const rate = parseFloat(projectSettings.allTradeLaborRates[trade][role]); // Ensure it's a number here too
                        if (isNaN(rate) || rate < 0) {
                            renderMessageBoxCallback(`Labor rate for "${role}" in "${trade}" is not valid (${rate}). Please ensure all rates are non-negative numbers.`);
                            return;
                        }
                    }
                }
            }
        }
        showStep(stepNumber + 1);
    }

    function prevStep(stepNumber) {
        showStep(stepNumber - 1);
    }

    function startEstimating() {
        // Re-run final validation before completing
        const projectName = projectNameInput.value.trim();
        const clientName = clientNameInput.value.trim();
        const projectType = projectTypeSelect.value.trim();
        const projectState = projectStateSelect.value.trim();

        if (!projectName) { renderMessageBoxCallback("Please enter a Project Name."); return; }
        if (!clientName) { renderMessageBoxCallback("Please enter a Client Name/Company."); return; }
        if (!projectType) { renderMessageBoxCallback("Please select a Project Type."); return; }
        if (!projectState) { renderMessageBoxCallback("Please select a State/Location."); return; }
        if (projectSettings.activeTrades.length === 0) {
            renderMessageBoxCallback("Please select at least one trade involved in the project before starting the estimate.");
            return;
        }

        for (const trade of projectSettings.activeTrades) {
            if (!projectSettings.allTradeLaborRates[trade]) {
                renderMessageBoxCallback(`Labor rates for trade "${trade}" are not defined. Please define them or deselect this trade.`);
                return;
            }
            for (const role in projectSettings.allTradeLaborRates[trade]) {
                const rate = parseFloat(projectSettings.allTradeLaborRates[trade][role]); // Ensure it's a number here too
                if (isNaN(rate) || rate < 0) {
                    renderMessageBoxCallback(`Labor rate for "${role}" in "${trade}" is not valid (${rate}). Please ensure all rates are non-negative numbers.`);
                    return;
                }
            }
        }

        // Save final settings to projectSettings, ensuring ALL numerical values are parsed
        projectSettings.projectName = projectNameInput.value;
        projectSettings.clientName = clientNameInput.value;
        projectSettings.projectAddress = document.getElementById('projectAddress').value;
        projectSettings.projectCity = document.getElementById('projectCity').value;
        projectSettings.projectZip = document.getElementById('projectZip').value;
        projectSettings.startDate = document.getElementById('startDate').value;
        projectSettings.endDate = document.getElementById('endDate').value;
        projectSettings.projectID = document.getElementById('projectID').value;
        projectSettings.projectDescription = document.getElementById('projectDescription').value;
        projectSettings.projectType = projectTypeSelect.value;
        projectSettings.projectState = projectStateSelect.value;
        
        // --- IMPORTANT: Ensure parseFloat for ALL numeric settings here ---
        projectSettings.profitMargin = parseFloat(profitMarginInput.value) || 0;
        projectSettings.salesTax = parseFloat(salesTaxInput.value) || 0;
        projectSettings.miscellaneous = parseFloat(miscellaneousInput.value) || 0;
        projectSettings.overhead = parseFloat(overheadInput.value) || 0;
        projectSettings.materialMarkup = parseFloat(materialMarkupInput.value) || 0;
        projectSettings.additionalConsiderationsValue = parseFloat(additionalConsiderationsValueInput.value) || 0;
        // --- END IMPORTANT ---


        // Callback to main script indicating completion
        onCompletionCallback(projectSettings);
    }


    // --- Data Management Functions (Specific to Wizard) ---

    function handleLogoInputChange() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            if (!file.type.startsWith('image/')) {
                renderMessageBoxCallback('Please drop an image file (e.g., JPG, PNG, GIF).');
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
                renderMessageBoxCallback('Please drop an image file (e.g., JPG, PNG, GIF).');
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

    function loadSavedLogo() {
        if (projectSettings.contractorLogo) {
            wizardLogoPreview.src = projectSettings.contractorLogo;
            wizardLogoPreview.classList.remove('hidden');
            defaultLogoIcon.classList.add('hidden');
            uploadText.classList.add('hidden');
            clearLogoBtn.classList.remove('hidden'); // Show clear button if logo is present
        } else {
            wizardLogoPreview.src = ''; // Clear the image source
            wizardLogoPreview.classList.add('hidden');
            defaultLogoIcon.classList.remove('hidden');
            uploadText.classList.remove('hidden');
            clearLogoBtn.classList.add('hidden'); // Hide clear button if no logo
        }
    }

    // NEW: Function to clear the logo
    function clearLogo(event) {
        event.stopPropagation(); // Prevent click from bubbling to logoUploadArea and opening file input
        renderMessageBoxCallback('Are you sure you want to clear the logo?', () => {
            projectSettings.contractorLogo = ''; // Clear the logo data
            loadSavedLogo(); // Update the UI to show default state
            // Also update the logo in the AppHeader if it's currently displayed
            if (window.AppHeader && typeof window.AppHeader.updateLogo === 'function') {
                window.AppHeader.updateLogo('');
            }
            closeMessageBoxCallback();
        }, true); // Pass true for isConfirm
    }


    function populateWizardInputs() {
        projectNameInput.value = projectSettings.projectName;
        clientNameInput.value = projectSettings.clientName;
        projectTypeSelect.value = projectSettings.projectType;
        projectStateSelect.value = projectSettings.projectState;

        document.getElementById('projectAddress').value = projectSettings.projectAddress;
        document.getElementById('projectCity').value = projectSettings.projectCity;
        document.getElementById('projectZip').value = projectSettings.projectZip;
        document.getElementById('startDate').value = projectSettings.startDate;
        document.getElementById('endDate').value = projectSettings.endDate;
        document.getElementById('projectID').value = projectSettings.projectID;
        document.getElementById('projectDescription').value = projectSettings.projectDescription;

        if (isAdvancedDetailsActive) {
            advancedDetailsSection.classList.remove('hidden');
            showAdvancedDetailsLink.textContent = 'Hide Advanced Details';
        } else {
            advancedDetailsSection.classList.add('hidden');
            showAdvancedDetailsLink.textContent = 'Show Advanced Details';
        }
        // No need to call populateWizardStep3Settings here, as showStep() handles it.
    }

    function populateWizardStep3Settings() {
        profitMarginInput.value = projectSettings.profitMargin;
        salesTaxInput.value = projectSettings.salesTax;
        miscellaneousInput.value = projectSettings.miscellaneous;
        overheadInput.value = projectSettings.overhead;
        materialMarkupInput.value = projectSettings.materialMarkup; 
        additionalConsiderationsValueInput.value = projectSettings.additionalConsiderationsValue;
        // Removed: additionalConsiderationsUnitSpan.textContent = projectSettings.additionalConsiderationsType; // This line is no longer needed
        updateAdditionalConsiderationsButtonText(); // Ensure button text is correct on load of step 3
    }

    function updateSalesTaxForState(stateCode) {
        const taxRate = stateSalesTax[stateCode] || 0;
        salesTaxInput.value = taxRate;
        projectSettings.salesTax = taxRate; // Update global settings directly
    }

    function toggleAdditionalConsiderationsType() {
        if (projectSettings.additionalConsiderationsType === '%') {
            projectSettings.additionalConsiderationsType = '$';
        } else {
            projectSettings.additionalConsiderationsType = '%';
        }
        // Removed: additionalConsiderationsUnitSpan.textContent = projectSettings.additionalConsiderationsType; // This line is no longer needed
        updateAdditionalConsiderationsButtonText(); // Update the button text
    }

    // NEW: Function to update the text on the toggle button
    function updateAdditionalConsiderationsButtonText() {
        if (toggleAdditionalConsiderationsBtn) {
            toggleAdditionalConsiderationsBtn.textContent = projectSettings.additionalConsiderationsType;
        }
    }


    function populateTradesDropdown() {
        tradesDropdown.innerHTML = '';
        const allTrades = Object.keys(projectSettings.allTradeLaborRates);

        const searchTerm = tradeSearchInput.value.toLowerCase();
        const filteredTrades = allTrades.filter(trade => 
            trade.toLowerCase().includes(searchTerm)
        );

        if (filteredTrades.length === 0 && searchTerm) {
            tradesDropdown.innerHTML = `<p class="text-gray-600 text-center py-4">No trades found matching "${searchTerm}"</p>`;
        } else if (filteredTrades.length === 0 && !searchTerm) {
            tradesDropdown.innerHTML = `<p class="text-gray-600 text-center py-4">No trades available.</p>`;
        } else {
            filteredTrades.forEach(trade => {
                const checkboxId = `trade-${trade.replace(/\s/g, '-')}`;
                const isChecked = projectSettings.activeTrades.includes(trade);

                const label = document.createElement('label');
                label.className = 'flex items-center';
                label.innerHTML = `
                    <input type="checkbox" id="${checkboxId}" value="${trade}" onchange="window.SetupWizard.handleTradeSelection(this)">
                    <span>${trade}</span>
                `;
                tradesDropdown.appendChild(label);
            });
        }
    }

    function updateSelectedTradesDisplay() {
        selectedTradesDisplay.innerHTML = '';
        if (projectSettings.activeTrades.length === 0) {
            selectedTradesDisplay.textContent = 'Click to select trades...';
            return;
        }
        projectSettings.activeTrades.forEach(trade => {
            const span = document.createElement('span');
            span.className = 'selected-trade-tag';
            span.innerHTML = `${trade} <span class="remove-tag" data-trade="${trade}">&times;</span>`;
            selectedTradesDisplay.appendChild(span);
        });
    }

    function handleTradeSelection(checkbox) {
        const trade = checkbox.value;
        if (checkbox.checked) {
            if (!projectSettings.activeTrades.includes(trade)) {
                projectSettings.activeTrades.push(trade);
            }
        } else {
            projectSettings.activeTrades = projectSettings.activeTrades.filter(t => t !== trade);
            // Also remove line items associated with this trade
            estimateItems = estimateItems.filter(item => item.trade !== trade);
        }
        updateSelectedTradesDisplay();
        populateWizardStep2LaborRates(); // Re-render labor rates based on new active trades
    }

    function toggleTradeDropdown() {
        tradesDropdown.classList.toggle('hidden');
        if (!tradesDropdown.classList.contains('hidden')) {
            tradeSearchInput.value = '';
            populateTradesDropdown();
        }
    }
    
    function hideTradeDropdown() {
        setTimeout(() => {
            if (!tradesDropdown.contains(document.activeElement) && !selectedTradesDisplay.contains(document.activeElement)) {
                 tradesDropdown.classList.add('hidden');
            }
        }, 100);
    }

    function showTradeDropdown() {
        tradesDropdown.classList.remove('hidden');
    }

    function populateWizardStep2LaborRates() {
        dynamicLaborRateInputs.innerHTML = '';

        if (projectSettings.activeTrades.length === 0) {
            dynamicLaborRateInputs.innerHTML = `<p class="text-gray-600">Please select trades in Step 1 to configure their labor rates here.</p>`;
            return;
        }

        projectSettings.activeTrades.forEach(trade => {
            const tradeGroupDiv = document.createElement('div');
            tradeGroupDiv.className = 'trade-labor-rates-group';
            tradeGroupDiv.innerHTML = `<h3>${trade} Labor Rates</h3>`;

            const rolesWithRates = Object.entries(projectSettings.allTradeLaborRates[trade] || {});

            rolesWithRates.sort(([, rateA], [, rateB]) => {
                if (rateA !== rateB) {
                    return rateB - rateA;
                }
                const roleNameA = arguments[0][0];
                const roleNameB = arguments[1][0];
                return roleNameA.localeCompare(roleNameB);
            });

            let skillLevelsHtml = '';
            rolesWithRates.forEach(([role, rate]) => {
                const rateInputId = `rate-${trade.replace(/\s/g, '')}-${role.replace(/\s/g, '')}`;
                const skillNameElementId = `skillname-${trade.replace(/\s/g, '')}-${role.replace(/\s/g, '')}`;

                skillLevelsHtml += `
                    <div class="skill-level-row">
                        ${isAdvancedModeActive ? `
                            <input type="text" id="${skillNameElementId}" class="skill-name-input editable" value="${role}"
                                onchange="window.SetupWizard.updateSkillTitle('${trade}', '${role}', this.value)">
                        ` : `
                            <span id="${skillNameElementId}" class="skill-name-display">${role}</span>
                        `}
                        <div class="rate-input-group">
                            <label for="${rateInputId}" class="rate-label">Rate ($/hr):</label>
                            <input type="number" id="${rateInputId}" class="input-field rate-input" value="${parseFloat(rate) || 0}"
                                onchange="window.SetupWizard.updateLaborRate('${trade}', '${role}', this.value)">
                            ${isAdvancedModeActive ? `
                                <button class="remove-skill-btn" onclick="window.SetupWizard.confirmRemoveSkillLevel('${trade}', '${role}')">
                                    &minus;
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            tradeGroupDiv.innerHTML += skillLevelsHtml;
            dynamicLaborRateInputs.appendChild(tradeGroupDiv);
        });
    }

    function updateLaborRate(trade, role, value) {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue) && parsedValue >= 0) {
            projectSettings.allTradeLaborRates[trade][role] = parsedValue;
            // No need to re-render populateWizardStep2LaborRates() here, as it causes focus issues.
            // The value is correctly updated in projectSettings, and main app will recalculate on wizard completion.
        } else {
            console.error(`Invalid input for ${trade} ${role} rate: ${value}`);
            const inputId = `rate-${trade.replace(/\s/g, '')}-${role.replace(/\s/g, '')}`;
            // Revert to old value if input is invalid
            document.getElementById(inputId).value = parseFloat(projectSettings.allTradeLaborRates[trade][role]) || 0; 
        }
    }

    function updateSkillTitle(trade, oldRole, newRole) {
        const trimmedNewRole = newRole.trim();
        if (trimmedNewRole === oldRole) {
            return;
        }
        if (!trimmedNewRole) {
            renderMessageBoxCallback("Skill level title cannot be empty. Reverting to original name.");
            document.getElementById(`skillname-${trade.replace(/\s/g, '')}-${oldRole.replace(/\s/g, '')}`).value = oldRole;
            return;
        }
        const existingRoles = Object.keys(projectSettings.allTradeLaborRates[trade]).map(r => r.toLowerCase());
        if (existingRoles.includes(trimmedNewRole.toLowerCase()) && trimmedNewRole.toLowerCase() !== oldRole.toLowerCase()) {
            renderMessageBoxCallback(`Skill level "${trimmedNewRole}" already exists for ${trade}. Please choose a different name.`);
            document.getElementById(`skillname-${trade.replace(/\s/g, '')}-${oldRole.replace(/\s/g, '')}`).value = oldRole;
            return;
        }

        if (projectSettings.allTradeLaborRates[trade] && projectSettings.allTradeLaborRates[trade][oldRole] !== undefined) {
            const rate = projectSettings.allTradeLaborRates[trade][oldRole];
            delete projectSettings.allTradeLaborRates[trade][oldRole];
            projectSettings.allTradeLaborRates[trade][trimmedNewRole] = rate;
            
            // Update any estimate items that use this role
            estimateItems.forEach(item => {
                if (item.trade === trade && item.rateRole === oldRole) {
                    item.rateRole = trimmedNewRole;
                }
            });
            populateWizardStep2LaborRates(); // Re-render to show updated roles/rates
        } else {
            console.warn(`Could not find skill "${oldRole}" in trade "${trade}" for update.`);
        }
    }

    function toggleAdvancedRates(event) {
        event.preventDefault();
        isAdvancedModeActive = !isAdvancedModeActive;
        if (isAdvancedModeActive) {
            advancedLink.textContent = 'Hide Advanced Options';
            advancedSkillLevelControls.classList.remove('hidden');
        } else {
            advancedLink.textContent = 'Show Advanced Options';
            advancedSkillLevelControls.classList.add('hidden');
        }
        populateWizardStep2LaborRates(); // Re-render to show/hide advanced controls for rates
    }

    function toggleAdvancedDetails(event) {
        event.preventDefault();
        isAdvancedDetailsActive = !isAdvancedDetailsActive;
        if (isAdvancedDetailsActive) {
            showAdvancedDetailsLink.textContent = 'Hide Advanced Details';
            advancedDetailsSection.classList.remove('hidden'); // Show the section
        } else {
            showAdvancedDetailsLink.textContent = 'Show Advanced Details'; // Corrected variable name
            advancedDetailsSection.classList.add('hidden'); // Hide the section
        }
    }

    function addSkillLevelFromAdvanced() {
        if (projectSettings.activeTrades.length === 0) {
            renderMessageBoxCallback("Please select at least one trade in Step 1 before adding new skill levels.");
            return;
        }
        
        const newTitle = newSkillTitleInput.value.trim();
        const newRate = parseFloat(newSkillRateInput.value);

        if (!newTitle) {
            renderMessageBoxCallback("Please enter a title for the new skill level.");
            return;
        }
        if (isNaN(newRate) || newRate < 0) {
            renderMessageBoxCallback("Please enter a valid non-negative number for the new skill rate.");
            return;
        }

        let newSkillAdded = false;
        let alreadyExistsForSome = false;
        projectSettings.activeTrades.forEach(trade => {
            if (!projectSettings.allTradeLaborRates[trade]) {
                projectSettings.allTradeLaborRates[trade] = {};
            }
            const existingRolesForTrade = Object.keys(projectSettings.allTradeLaborRates[trade]).map(r => r.toLowerCase());
            if (!existingRolesForTrade.includes(newTitle.toLowerCase())) {
                projectSettings.allTradeLaborRates[trade][newTitle] = newRate;
                newSkillAdded = true;
            } else {
                alreadyExistsForSome = true;
            }
        });

        if (newSkillAdded) {
            newSkillTitleInput.value = '';
            newSkillRateInput.value = '0';
            populateWizardStep2LaborRates();
        } else if (alreadyExistsForSome) {
            renderMessageBoxCallback(`Skill level "${newTitle}" already exists for some or all selected trades. It was not added where it already existed.`);
        } else {
            renderMessageBoxCallback(`Skill level "${newTitle}" already exists for all selected trades or no trades are selected.`);
        }
    }


    function confirmRemoveSkillLevel(trade, role) {
        renderMessageBoxCallback(`Are you sure you want to remove the skill level "${role}" from ${trade}? This will remove it from all line items using it.`,
            () => {
                removeSkillLevel(trade, role);
                closeMessageBoxCallback();
            },
            true // Is a confirm message
        );
    }

    function removeSkillLevel(trade, role) {
        const defaultRoles = ["Project Manager", "Superintendent", "General Foreman", "Foreman", "Journeyman", "Apprentice"];
        if (defaultRoles.includes(role)) {
            renderMessageBoxCallback(`"${role}" is a default skill level and cannot be removed.`);
            return;
        }

        if (projectSettings.allTradeLaborRates[trade] && projectSettings.allTradeLaborRates[trade][role] !== undefined) {
            delete projectSettings.allTradeLaborRates[trade][role];
            
            // Update any estimate items that use this role, assign a fallback
            estimateItems.forEach(item => {
                if (item.trade === trade && item.rateRole === role) {
                    const availableRoles = Object.keys(projectSettings.allTradeLaborRates[item.trade] || {});
                    item.rateRole = availableRoles.length > 0 ? availableRoles[0] : "Journeyman"; // Fallback to Journeyman if no other roles
                }
            });
            populateWizardStep2LaborRates(); // Re-render the rates section
        }
    }


    // Expose public methods for index.html to call
    return {
        init: init,
        showStep: showStep, // Allows index.html to control wizard steps
        populateTradesDropdown: populateTradesDropdown, // Needed for initial load
        updateSelectedTradesDisplay: updateSelectedTradesDisplay, // Needed for initial load
        updateSalesTaxForState: updateSalesTaxForState, // Needed for initial load
        loadSavedLogo: loadSavedLogo, // Needed for initial load
        handleTradeSelection: handleTradeSelection, // Needed for onchange event in HTML
        updateLaborRate: updateLaborRate, // Needed for onchange event in HTML
        updateSkillTitle: updateSkillTitle, // Needed for onchange event in HTML
        confirmRemoveSkillLevel: confirmRemoveSkillLevel // Needed for onclick event in HTML
    };
})();
