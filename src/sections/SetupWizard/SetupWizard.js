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
    let discountInput; 
    let additionalConsiderationsValueInput;
    let additionalConsiderationsUnitSpan;


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
        defaultLogoIcon = document.getElementById('defaultLogoIcon');
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
        additionalConsiderationsUnitSpan = document.getElementById('additionalConsiderationsUnit');


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
        document.getElementById('toggleAdditionalConsiderationsBtn').addEventListener('click', toggleAdditionalConsiderationsType);

        // Initial setup for the wizard
        loadSavedLogo();
        populateTradesDropdown();
        updateSelectedTradesDisplay();
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
            } else if (stepNum === stepNumber) {
                stepItem.classList.add('active');
                stepCircle.classList.add('active');
                stepStatus.textContent = stepDetails[index].statusInProgress;
            } else {
                stepStatus.textContent = stepDetails[index].statusPending;
            }
        });

        const totalSteps = wizardSteps.length;
        let progressWidth = 0;
        if (totalSteps > 1) {
             progressWidth = ((stepNumber - 1) / (totalSteps - 1)) * 100;
        }
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
            
        } else if (stepNumber === 2) {
            for (const trade of projectSettings.activeTrades) {
                if (projectSettings.allTradeLaborRates[trade]) {
                    for (const role in projectSettings.allTradeLaborRates[trade]) {
                        const rate = parseFloat(projectSettings.allTradeLaborRates[trade][role]);
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
                const rate = parseFloat(projectSettings.allTradeLaborRates[trade][role]);
                if (isNaN(rate) || rate < 0) {
                    renderMessageBoxCallback(`Labor rate for "${role}" in "${trade}" is not valid (${rate}). Please ensure all rates are non-negative numbers.`);
                    return;
                }
            }
        }

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
        
        projectSettings.profitMargin = parseFloat(profitMarginInput.value) || 0;
        projectSettings.salesTax = parseFloat(salesTaxInput.value) || 0;
        projectSettings.miscellaneous = parseFloat(miscellaneousInput.value) || 0;
        projectSettings.overhead = parseFloat(overheadInput.value) || 0;
        projectSettings.materialMarkup = parseFloat(materialMarkupInput.value) || 0;
        projectSettings.additionalConsiderationsValue = parseFloat(additionalConsiderationsValueInput.value) || 0;

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
            clearLogoBtn.classList.remove('hidden');
        } else {
            wizardLogoPreview.src = '';
            wizardLogoPreview.classList.add('hidden');
            defaultLogoIcon.classList.remove('hidden');
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
    }

    function populateWizardStep3Settings() {
        profitMarginInput.value = projectSettings.profitMargin;
        salesTaxInput.value = projectSettings.salesTax;
        miscellaneousInput.value = projectSettings.miscellaneous;
        overheadInput.value = projectSettings.overhead;
        materialMarkupInput.value = projectSettings.materialMarkup; 
        additionalConsiderationsValueInput.value = projectSettings.additionalConsiderationsValue;
        additionalConsiderationsUnitSpan.textContent = projectSettings.additionalConsiderationsType;
    }

    function updateSalesTaxForState(stateCode) {
        const taxRate = stateSalesTax[stateCode] || 0;
        salesTaxInput.value = taxRate;
        projectSettings.salesTax = taxRate;
    }

    function toggleAdditionalConsiderationsType() {
        if (projectSettings.additionalConsiderationsType === '%') {
            projectSettings.additionalConsiderationsType = '$';
        } else {
            projectSettings.additionalConsiderationsType = '%';
        }
        additionalConsiderationsUnitSpan.textContent = projectSettings.additionalConsiderationsType;
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
                label.className = 'flex items-center p-2 rounded-md hover:bg-gray-200 cursor-pointer';
                label.innerHTML = `
                    <input type="checkbox" id="${checkboxId}" value="${trade}" ${isChecked ? 'checked' : ''} onchange="window.SetupWizard.handleTradeSelection(this)">
                    <span>${trade}</span>
                `;
                tradesDropdown.appendChild(label);
            });
        }
    }

    function updateSelectedTradesDisplay() {
        selectedTradesDisplay.innerHTML = '';
        if (projectSettings.activeTrades.length === 0) {
            selectedTradesDisplay.innerHTML = '<p class="text-gray-500 italic">Click to select trades...</p>';
            return;
        }
        projectSettings.activeTrades.forEach(trade => {
            const span = document.createElement('span');
            span.className = 'selected-trade-tag';
            span.innerHTML = `${trade} <span class="remove-tag" data-trade="${trade}" onclick="event.stopPropagation(); window.SetupWizard.removeTrade('${trade}')">&times;</span>`;
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
            estimateItems = estimateItems.filter(item => item.trade !== trade);
        }
        updateSelectedTradesDisplay();
        populateWizardStep2LaborRates();
    }
    
    function removeTrade(trade) {
        handleTradeSelection({value: trade, checked: false});
        const checkbox = tradesDropdown.querySelector(`input[value="${trade}"]`);
        if(checkbox) checkbox.checked = false;
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
        } else {
            console.error(`Invalid input for ${trade} ${role} rate: ${value}`);
            const inputId = `rate-${trade.replace(/\s/g, '')}-${role.replace(/\s/g, '')}`;
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
            
            estimateItems.forEach(item => {
                if (item.trade === trade && item.rateRole === oldRole) {
                    item.rateRole = trimmedNewRole;
                }
            });
            populateWizardStep2LaborRates();
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
        populateWizardStep2LaborRates();
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
            
            estimateItems.forEach(item => {
                if (item.trade === trade && item.rateRole === role) {
                    const availableRoles = Object.keys(projectSettings.allTradeLaborRates[item.trade] || {});
                    item.rateRole = availableRoles.length > 0 ? availableRoles[0] : "Journeyman";
                }
            });
            populateWizardStep2LaborRates();
        }
    }


    // Expose public methods for index.html to call
    return {
        init: init,
        showStep: showStep,
        populateTradesDropdown: populateTradesDropdown,
        updateSelectedTradesDisplay: updateSelectedTradesDisplay,
        updateSalesTaxForState: updateSalesTaxForState,
        loadSavedLogo: loadSavedLogo,
        handleTradeSelection: handleTradeSelection,
        removeTrade: removeTrade,
        updateLaborRate: updateLaborRate,
        updateSkillTitle: updateSkillTitle,
        confirmRemoveSkillLevel: confirmRemoveSkillLevel
    };
})();
