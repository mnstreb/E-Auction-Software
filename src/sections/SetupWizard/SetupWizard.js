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
    let discountInput; // ✨ NEW: Discount input
    let additionalConsiderationsValueInput;
    let additionalConsiderationsUnit;
    let toggleAdditionalConsiderationsBtn;


    /**
     * Initializes the SetupWizard component by getting element references,
     * setting up event listeners, and populating initial data.
     * @param {object} config - The configuration object from the main script.
     */
    function init(config) {
        // Store references from the main script
        projectSettings = config.projectSettings;
        estimateItems = config.estimateItems;
        stateSalesTax = config.stateSalesTax;
        onCompletionCallback = config.onCompletion;
        renderMessageBoxCallback = config.renderMessageBox;
        closeMessageBoxCallback = config.closeMessageBox;

        // Get all main UI elements
        setupWizardContainer = document.getElementById('setupWizard');
        wizardSteps = [
            document.getElementById('wizard-step-1'),
            document.getElementById('wizard-step-2'),
            document.getElementById('wizard-step-3')
        ];
        stepItems = [
            document.getElementById('step1Container'),
            document.getElementById('step2Container'),
            document.getElementById('step3Container')
        ];
        progressBar = document.getElementById('progressBar');

        // Step 1 elements
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
        showAdvancedDetailsLink = document.getElementById('showAdvancedDetailsLink');
        advancedDetailsSection = document.getElementById('advancedDetailsSection');

        // Step 2 elements
        tradeSearchInput = document.getElementById('tradeSearch');
        tradesDropdown = document.getElementById('tradesDropdown');
        selectedTradesDisplay = document.getElementById('selectedTradesDisplay');
        dynamicLaborRateInputs = document.getElementById('dynamicLaborRateInputs');
        advancedLink = document.getElementById('advanced-link');
        advancedSkillLevelControls = document.getElementById('advanced-skill-level-controls');
        newSkillTitleInput = document.getElementById('newSkillTitle');
        newSkillRateInput = document.getElementById('newSkillRate');

        // Step 3 elements
        profitMarginInput = document.getElementById('profitMargin');
        overheadInput = document.getElementById('overhead');
        materialMarkupInput = document.getElementById('materialMarkup');
        discountInput = document.getElementById('discount'); // ✨ NEW
        salesTaxInput = document.getElementById('salesTax');
        miscellaneousInput = document.getElementById('miscellaneous');
        additionalConsiderationsValueInput = document.getElementById('additionalConsiderationsValue');
        additionalConsiderationsUnit = document.getElementById('additionalConsiderationsUnit');
        toggleAdditionalConsiderationsBtn = document.getElementById('toggleAdditionalConsiderationsBtn');

        // Setup all event listeners for the wizard
        setupEventListeners();
        
        // Populate form fields with existing projectSettings data
        populateFormWithSettings();
    }

    /**
     * Sets up all event listeners for the wizard's interactive elements.
     */
    function setupEventListeners() {
        // Logo upload listeners
        if (logoUploadArea) {
            logoUploadArea.addEventListener('click', () => logoUploadInput.click());
            logoUploadArea.addEventListener('dragover', handleDragOver);
            logoUploadArea.addEventListener('dragleave', handleDragLeave);
            logoUploadArea.addEventListener('drop', handleDrop);
            logoUploadInput.addEventListener('change', handleFileSelect);
            clearLogoBtn.addEventListener('click', clearLogo);
        }

        // Navigation button listeners
        document.getElementById('nextStep1Btn').addEventListener('click', () => showStep(2));
        document.getElementById('prevStep2Btn').addEventListener('click', () => showStep(1));
        document.getElementById('nextStep2Btn').addEventListener('click', () => showStep(3));
        document.getElementById('prevStep3Btn').addEventListener('click', () => showStep(2));
        document.getElementById('startEstimatingBtn').addEventListener('click', finishWizard);

        // State dropdown listener to update sales tax
        if (projectStateSelect) {
            projectStateSelect.addEventListener('change', (event) => {
                updateSalesTaxForState(event.target.value);
            });
        }

        // Advanced details toggle listener
        if (showAdvancedDetailsLink) {
            showAdvancedDetailsLink.addEventListener('click', (event) => {
                event.preventDefault();
                toggleAdvancedDetails();
            });
        }

        // Trade search/filter listener
        if (tradeSearchInput) {
            tradeSearchInput.addEventListener('keyup', filterTrades);
        }
        
        // Add new skill listener
        document.getElementById('addNewSkillBtn').addEventListener('click', addNewSkillLevel);

        // Toggle for additional considerations unit (% or $)
        if (toggleAdditionalConsiderationsBtn) {
            toggleAdditionalConsiderationsBtn.addEventListener('click', toggleConsiderationsUnit);
        }
    }

    /**
     * Populates the wizard form fields with data from the projectSettings object.
     */
    function populateFormWithSettings() {
        // Step 1
        projectNameInput.value = projectSettings.projectName;
        clientNameInput.value = projectSettings.clientName;
        projectTypeSelect.value = projectSettings.projectType;
        projectStateSelect.value = projectSettings.projectState;
        // Advanced fields in Step 1
        document.getElementById('projectStreetAddress').value = projectSettings.projectAddress || '';
        document.getElementById('projectCity').value = projectSettings.projectCity || '';
        document.getElementById('projectZip').value = projectSettings.projectZip || '';
        document.getElementById('ownerName').value = projectSettings.ownerName || '';
        document.getElementById('ownerAddress').value = projectSettings.ownerAddress || '';
        document.getElementById('ownerCity').value = projectSettings.ownerCity || '';
        document.getElementById('ownerZip').value = projectSettings.ownerZip || '';
        document.getElementById('ownerEmail').value = projectSettings.ownerEmail || '';
        document.getElementById('ownerPhone').value = projectSettings.ownerPhone || '';
        document.getElementById('projectID').value = projectSettings.projectID || '';
        document.getElementById('startDate').value = projectSettings.startDate || '';
        document.getElementById('endDate').value = projectSettings.endDate || '';
        document.getElementById('projectDescription').value = projectSettings.projectDescription || '';

        // Step 3
        profitMarginInput.value = projectSettings.profitMargin;
        overheadInput.value = projectSettings.overhead;
        materialMarkupInput.value = projectSettings.materialMarkup;
        discountInput.value = projectSettings.discount || 0; // ✨ NEW
        salesTaxInput.value = projectSettings.salesTax;
        miscellaneousInput.value = projectSettings.miscellaneous;
        additionalConsiderationsValueInput.value = projectSettings.additionalConsiderationsValue;
        additionalConsiderationsUnit.textContent = projectSettings.additionalConsiderationsType;
    }

    /**
     * ✨ BUG FIX: Corrected the logic to be more explicit.
     * Toggles the visibility of the advanced project details section.
     */
    function toggleAdvancedDetails() {
        if (advancedDetailsSection) {
            if (advancedDetailsSection.classList.contains('hidden')) {
                // If it's hidden, show it
                advancedDetailsSection.classList.remove('hidden');
                showAdvancedDetailsLink.textContent = 'Hide Advanced Details';
            } else {
                // If it's visible, hide it
                advancedDetailsSection.classList.add('hidden');
                showAdvancedDetailsLink.textContent = 'Show Advanced Details';
            }
        }
    }

    /**
     * Updates the sales tax input field based on the selected state.
     * @param {string} state - The two-letter state abbreviation.
     */
    function updateSalesTaxForState(state) {
        if (salesTaxInput && stateSalesTax[state] !== undefined) {
            salesTaxInput.value = stateSalesTax[state];
        }
    }

    /**
     * Gathers all data from the wizard, updates projectSettings, and calls the completion callback.
     */
    function finishWizard() {
        // Gather data from Step 1
        projectSettings.projectName = projectNameInput.value;
        projectSettings.clientName = clientNameInput.value;
        projectSettings.projectType = projectTypeSelect.value;
        projectSettings.projectState = projectStateSelect.value;
        // Advanced Step 1 fields
        projectSettings.projectAddress = document.getElementById('projectStreetAddress').value;
        projectSettings.projectCity = document.getElementById('projectCity').value;
        projectSettings.projectZip = document.getElementById('projectZip').value;
        projectSettings.ownerName = document.getElementById('ownerName').value;
        projectSettings.ownerAddress = document.getElementById('ownerAddress').value;
        projectSettings.ownerCity = document.getElementById('ownerCity').value;
        projectSettings.ownerZip = document.getElementById('ownerZip').value;
        projectSettings.ownerEmail = document.getElementById('ownerEmail').value;
        projectSettings.ownerPhone = document.getElementById('ownerPhone').value;
        projectSettings.projectID = document.getElementById('projectID').value;
        projectSettings.startDate = document.getElementById('startDate').value;
        projectSettings.endDate = document.getElementById('endDate').value;
        projectSettings.projectDescription = document.getElementById('projectDescription').value;

        // Step 2 data is already updated in projectSettings as changes are made
        
        // Gather data from Step 3
        projectSettings.profitMargin = parseFloat(profitMarginInput.value) || 0;
        projectSettings.overhead = parseFloat(overheadInput.value) || 0;
        projectSettings.materialMarkup = parseFloat(materialMarkupInput.value) || 0;
        projectSettings.discount = parseFloat(discountInput.value) || 0; // ✨ NEW
        projectSettings.salesTax = parseFloat(salesTaxInput.value) || 0;
        projectSettings.miscellaneous = parseFloat(miscellaneousInput.value) || 0;
        projectSettings.additionalConsiderationsValue = parseFloat(additionalConsiderationsValueInput.value) || 0;
        projectSettings.additionalConsiderationsType = additionalConsiderationsUnit.textContent;

        // Call the callback function passed from index.html
        if (typeof onCompletionCallback === 'function') {
            onCompletionCallback(projectSettings);
        }
    }

    // Other functions (showStep, updateProgressBar, logo handling, trade selection, etc.) remain here...
    // These functions do not need to be changed for the bug fix.
    
    function showStep(stepNumber) {
        wizardSteps.forEach((step, index) => {
            step.classList.add('hidden');
            stepItems[index].classList.remove('active');
        });

        if (wizardSteps[stepNumber - 1]) {
            wizardSteps[stepNumber - 1].classList.remove('hidden');
            stepItems[stepNumber - 1].classList.add('active');
        }
        updateProgressBar(stepNumber);
    }

    function updateProgressBar(currentStep) {
        const progressPercentage = ((currentStep - 1) / (wizardSteps.length - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    function handleDragOver(event) {
        event.preventDefault();
        logoUploadArea.classList.add('drag-over');
    }

    function handleDragLeave(event) {
        event.preventDefault();
        logoUploadArea.classList.remove('drag-over');
    }

    function handleDrop(event) {
        event.preventDefault();
        logoUploadArea.classList.remove('drag-over');
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    function handleFileSelect(event) {
        const files = event.target.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    function handleFile(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                projectSettings.contractorLogo = e.target.result;
                loadSavedLogo(); // Use the same function to display the new logo
            }
            reader.readAsDataURL(file);
        } else {
            renderMessageBoxCallback('Please upload a valid image file.');
        }
    }

    function loadSavedLogo() {
        if (projectSettings.contractorLogo) {
            wizardLogoPreview.src = projectSettings.contractorLogo;
            wizardLogoPreview.classList.remove('hidden');
            defaultLogoIcon.classList.add('hidden');
            uploadText.classList.add('hidden');
            clearLogoBtn.classList.remove('hidden');
        }
    }

    function clearLogo(event) {
        event.stopPropagation(); // Prevent triggering the file upload
        projectSettings.contractorLogo = '';
        wizardLogoPreview.src = '';
        wizardLogoPreview.classList.add('hidden');
        defaultLogoIcon.classList.remove('hidden');
        uploadText.classList.remove('hidden');
        clearLogoBtn.classList.add('hidden');
        logoUploadInput.value = ''; // Clear the file input
    }
    
    function populateTradesDropdown() {
        tradesDropdown.innerHTML = '';
        const allTrades = Object.keys(projectSettings.allTradeLaborRates);
        allTrades.forEach(trade => {
            const isSelected = projectSettings.activeTrades.includes(trade);
            const tradeItemHtml = `
                <label class="flex items-center p-2 rounded-md hover:bg-gray-200 cursor-pointer">
                    <input type="checkbox" class="mr-3" value="${trade}" ${isSelected ? 'checked' : ''} onchange="SetupWizard.handleTradeSelection(this)">
                    <span>${trade}</span>
                </label>
            `;
            tradesDropdown.innerHTML += tradeItemHtml;
        });
    }

    function filterTrades() {
        const filter = tradeSearchInput.value.toUpperCase();
        const labels = tradesDropdown.getElementsByTagName('label');
        for (let i = 0; i < labels.length; i++) {
            const span = labels[i].getElementsByTagName('span')[0];
            if (span.innerHTML.toUpperCase().indexOf(filter) > -1) {
                labels[i].style.display = "";
            } else {
                labels[i].style.display = "none";
            }
        }
    }

    function handleTradeSelection(checkbox) {
        const trade = checkbox.value;
        if (checkbox.checked) {
            if (!projectSettings.activeTrades.includes(trade)) {
                projectSettings.activeTrades.push(trade);
            }
        } else {
            projectSettings.activeTrades = projectSettings.activeTrades.filter(t => t !== trade);
        }
        updateSelectedTradesDisplay();
        populateWizardStep2LaborRates();
    }

    function updateSelectedTradesDisplay() {
        selectedTradesDisplay.innerHTML = '';
        if (projectSettings.activeTrades.length === 0) {
            selectedTradesDisplay.innerHTML = '<p class="text-gray-500 italic">No trades selected.</p>';
        } else {
            projectSettings.activeTrades.forEach(trade => {
                const tag = document.createElement('div');
                tag.className = 'selected-trade-tag';
                tag.innerHTML = `
                    <span>${trade}</span>
                    <button class="remove-tag" onclick="SetupWizard.handleTradeSelection({value: '${trade}', checked: false});">&times;</button>
                `;
                selectedTradesDisplay.appendChild(tag);
            });
        }
    }

    function populateWizardStep2LaborRates() {
        dynamicLaborRateInputs.innerHTML = ''; // Clear previous rates
        projectSettings.activeTrades.forEach(trade => {
            const tradeRates = projectSettings.allTradeLaborRates[trade];
            if (tradeRates) {
                let skillRowsHtml = '';
                for (const role in tradeRates) {
                    skillRowsHtml += `
                        <div class="skill-level-row">
                            <input type="text" value="${role}" class="input-field skill-name-display" onchange="SetupWizard.updateSkillTitle('${trade}', '${role}', this.value)">
                            <span class="rate-label">$/hr</span>
                            <input type="number" value="${tradeRates[role]}" class="input-field" onchange="SetupWizard.updateLaborRate('${trade}', '${role}', this.value)">
                            <button class="btn-red btn-sm" onclick="SetupWizard.confirmRemoveSkillLevel('${trade}', '${role}')">&times;</button>
                        </div>
                    `;
                }

                const tradeGroupHtml = `
                    <div class="trade-labor-rates-group">
                        <h3>${trade}</h3>
                        <div class="skills-container">
                            ${skillRowsHtml}
                        </div>
                    </div>
                `;
                dynamicLaborRateInputs.innerHTML += tradeGroupHtml;
            }
        });
    }

    function addNewSkillLevel() {
        const trade = document.getElementById('skillTradeSelect').value;
        const newRole = newSkillTitleInput.value.trim();
        const newRate = parseFloat(newSkillRateInput.value) || 0;

        if (trade && newRole && newRate > 0) {
            if (!projectSettings.allTradeLaborRates[trade]) {
                projectSettings.allTradeLaborRates[trade] = {};
            }
            projectSettings.allTradeLaborRates[trade][newRole] = newRate;
            
            // Clear inputs and re-render
            newSkillTitleInput.value = '';
            newSkillRateInput.value = '';
            populateWizardStep2LaborRates();
        } else {
            renderMessageBoxCallback('Please provide a valid skill title and rate.');
        }
    }

    function toggleConsiderationsUnit() {
        if (additionalConsiderationsUnit.textContent === '%') {
            additionalConsiderationsUnit.textContent = '$';
        } else {
            additionalConsiderationsUnit.textContent = '%';
        }
    }

    function updateLaborRate(trade, role, newRate) {
        if (projectSettings.allTradeLaborRates[trade] && projectSettings.allTradeLaborRates[trade][role] !== undefined) {
            projectSettings.allTradeLaborRates[trade][role] = parseFloat(newRate) || 0;
        }
    }
    
    function updateSkillTitle(trade, oldRole, newRole) {
        newRole = newRole.trim();
        if (!newRole || newRole === oldRole) return; // Do nothing if name is empty or unchanged

        if (projectSettings.allTradeLaborRates[trade] && projectSettings.allTradeLaborRates[trade][oldRole] !== undefined) {
            // Check if the new role name already exists
            if (projectSettings.allTradeLaborRates[trade][newRole]) {
                renderMessageBoxCallback(`Skill level "${newRole}" already exists for this trade.`);
                populateWizardStep2LaborRates(); // Re-render to reset the input field
                return;
            }

            // Create new entry, copy rate, then delete old one
            const rate = projectSettings.allTradeLaborRates[trade][oldRole];
            projectSettings.allTradeLaborRates[trade][newRole] = rate;
            delete projectSettings.allTradeLaborRates[trade][oldRole];

            // Update any estimate items that use the old role name
            estimateItems.forEach(item => {
                if (item.trade === trade && item.rateRole === oldRole) {
                    item.rateRole = newRole;
                }
            });
            
            populateWizardStep2LaborRates(); // Re-render the section to reflect the change
        }
    }
    
    function confirmRemoveSkillLevel(trade, role) {
        // Use the passed-in callback to show a confirmation dialog
        renderMessageBoxCallback(
            `Are you sure you want to remove the "${role}" skill level for the "${trade}" trade?`,
            () => {
                // This is the 'onConfirm' function that runs if the user clicks "Yes"
                removeSkillLevel(trade, role);
                closeMessageBoxCallback();
            },
            true // isConfirm = true
        );
    }

    function removeSkillLevel(trade, role) {
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
