// js/wizard.js

let currentStep = 1;
let isAdvancedModeActive = false; // State for advanced mode in Step 2
let isAdvancedDetailsActive = false; // State for advanced details in Step 1

function showStep(stepNumber) {
    uiElements.wizardSteps.forEach((stepDiv, index) => {
        if (index + 1 === stepNumber) {
            stepDiv.classList.remove('hidden');
        } else {
            stepDiv.classList.add('hidden');
        }
    });
    uiElements.stepIndicators.forEach((indicator, index) => {
        if (index + 1 === stepNumber) {
            indicator.classList.add('active');
            indicator.classList.remove('inactive');
        } else {
            indicator.classList.remove('active');
            indicator.classList.add('inactive');
        }
    });
    currentStep = stepNumber;

    if (stepNumber === 1) {
        isAdvancedDetailsActive = false;
        uiElements.showAdvancedDetailsLink.textContent = 'Show Advanced Details';
        uiElements.advancedDetailsSection.classList.add('hidden');
        populateWizardInputs();
        loadSavedLogo();
    }
    if (stepNumber === 2) {
        isAdvancedModeActive = false;
        uiElements.advancedLink.textContent = 'Show Advanced Options';
        uiElements.advancedSkillLevelControls.classList.add('hidden');
        populateWizardStep2LaborRates();
    }
    if (stepNumber === 3) {
        populateWizardStep3Settings();
    }
}

function nextStep(stepNumber) {
    if (stepNumber === 1) {
        const projectName = document.getElementById('projectName').value.trim();
        const clientName = document.getElementById('clientName').value.trim();
        const projectType = document.getElementById('projectType').value.trim();
        const projectState = document.getElementById('projectState').value.trim();

        if (!projectName) { renderMessageBox("Please enter a Project Name."); return; }
        if (!clientName) { renderMessageBox("Please enter a Client Name/Company."); return; }
        if (!projectType) { renderMessageBox("Please select a Project Type."); return; }
        if (!projectState) { renderMessageBox("Please select a State/Location."); return; }
        if (projectSettings.activeTrades.length === 0) { renderMessageBox("Please select at least one Trade Involved."); return; }

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
        updateSalesTaxForState(projectSettings.projectState);

    } else if (stepNumber === 2) {
        for (const trade of projectSettings.activeTrades) {
            for (const role in projectSettings.allTradeLaborRates[trade]) {
                const rate = projectSettings.allTradeLaborRates[trade][role];
                if (isNaN(rate) || rate < 0) {
                    renderMessageBox(`Labor rate for "${role}" in "${trade}" is not valid (${rate}). Please ensure all rates are non-negative numbers.`);
                    return;
                }
            }
        }
    }
    showStep(stepNumber + 1);
}

function prevStep(stepNumber) {
    showStep(stepNumber - 1);
}

function showSetup() {
    uiElements.setupWizard.classList.remove('hidden');
    uiElements.mainApp.classList.add('hidden');
    showStep(1);
    populateTradesDropdown();
    updateSelectedTradesDisplay();
}

function startEstimating() {
    const projectName = document.getElementById('projectName').value.trim();
    const clientName = document.getElementById('clientName').value.trim();
    const projectType = document.getElementById('projectType').value.trim();
    const projectState = document.getElementById('projectState').value.trim();

    if (!projectName) { renderMessageBox("Please enter a Project Name."); return; }
    if (!clientName) { renderMessageBox("Please enter a Client Name/Company."); return; }
    if (!projectType) { renderMessageBox("Please select a Project Type."); return; }
    if (!projectState) { renderMessageBox("Please select a State/Location."); return; }
    if (projectSettings.activeTrades.length === 0) {
        renderMessageBox("Please select at least one trade involved in the project before starting the estimate.");
        return;
    }

    for (const trade of projectSettings.activeTrades) {
        if (!projectSettings.allTradeLaborRates[trade]) {
            renderMessageBox(`Labor rates for trade "${trade}" are not defined. Please define them or deselect this trade.`);
            return;
        }
        for (const role in projectSettings.allTradeLaborRates[trade]) {
            const rate = projectSettings.allTradeLaborRates[trade][role];
            if (isNaN(rate) || rate < 0) {
                renderMessageBox(`Labor rate for "${role}" in "${trade}" is not valid (${rate}). Please ensure all rates are non-negative numbers.`);
                return;
            }
        }
    }

    projectSettings.projectName = document.getElementById('projectName').value;
    projectSettings.clientName = document.getElementById('clientName').value;
    projectSettings.projectAddress = document.getElementById('projectAddress').value;
    projectSettings.projectCity = document.getElementById('projectCity').value;
    projectSettings.projectZip = document.getElementById('projectZip').value;
    projectSettings.startDate = document.getElementById('startDate').value;
    projectSettings.endDate = document.getElementById('endDate').value;
    projectSettings.projectID = document.getElementById('projectID').value;
    projectSettings.projectDescription = document.getElementById('projectDescription').value;
    projectSettings.projectType = document.getElementById('projectType').value;
    projectSettings.projectState = document.getElementById('projectState').value;
    
    projectSettings.profitMargin = parseFloat(document.getElementById('profitMargin').value) || 0;
    projectSettings.salesTax = parseFloat(document.getElementById('salesTax').value) || 0;
    projectSettings.miscellaneous = parseFloat(document.getElementById('miscellaneous').value) || 0;
    projectSettings.overhead = parseFloat(document.getElementById('overhead').value) || 0;
    projectSettings.additionalConsiderationsValue = parseFloat(document.getElementById('additionalConsiderationsValue').value) || 0;

    uiElements.setupWizard.classList.add('hidden');
    uiElements.mainApp.classList.remove('hidden');

    uiElements.projectInfoElem.textContent = `${projectSettings.projectType} - ${projectSettings.projectName} - ${projectSettings.projectState}`;

    if (estimateItems.length === 0) {
        // If somehow no initial items were added, add a default one
        addItem();
    } else {
        renderItems();
    }
}

// --- Data Management Functions for Wizard ---

function populateWizardInputs() {
    document.getElementById('projectName').value = projectSettings.projectName;
    document.getElementById('clientName').value = projectSettings.clientName;
    document.getElementById('projectType').value = projectSettings.projectType;
    document.getElementById('projectState').value = projectSettings.projectState;

    document.getElementById('projectAddress').value = projectSettings.projectAddress;
    document.getElementById('projectCity').value = projectSettings.projectCity;
    document.getElementById('projectZip').value = projectSettings.projectZip;
    document.getElementById('startDate').value = projectSettings.startDate;
    document.getElementById('endDate').value = projectSettings.endDate;
    document.getElementById('projectID').value = projectSettings.projectID;
    document.getElementById('projectDescription').value = projectSettings.projectDescription; // Ensure textarea is populated

    if (isAdvancedDetailsActive) {
        uiElements.advancedDetailsSection.classList.remove('hidden');
        uiElements.showAdvancedDetailsLink.textContent = 'Hide Advanced Details';
    } else {
        uiElements.advancedDetailsSection.classList.add('hidden');
        uiElements.showAdvancedDetailsLink.textContent = 'Show Advanced Details';
    }
    populateWizardStep3Settings();
}

function populateWizardStep3Settings() {
    document.getElementById('profitMargin').value = projectSettings.profitMargin;
    document.getElementById('salesTax').value = projectSettings.salesTax;
    document.getElementById('miscellaneous').value = projectSettings.miscellaneous;
    document.getElementById('overhead').value = projectSettings.overhead;
    document.getElementById('additionalConsiderationsValue').value = projectSettings.additionalConsiderationsValue;
    document.getElementById('additionalConsiderationsUnit').textContent = projectSettings.additionalConsiderationsType;
}

function updateSalesTaxForState(stateCode) {
    const taxRate = stateSalesTax[stateCode] || 0;
    document.getElementById('salesTax').value = taxRate;
    projectSettings.salesTax = taxRate;
}

function toggleAdditionalConsiderationsType() {
    if (projectSettings.additionalConsiderationsType === '%') {
        projectSettings.additionalConsiderationsType = '$';
    } else {
        projectSettings.additionalConsiderationsType = '%';
    }
    document.getElementById('additionalConsiderationsUnit').textContent = projectSettings.additionalConsiderationsType;
}

function toggleAdvancedDetails(event) {
    event.preventDefault();
    isAdvancedDetailsActive = !isAdvancedDetailsActive;
    if (isAdvancedDetailsActive) {
        uiElements.showAdvancedDetailsLink.textContent = 'Hide Advanced Details';
        uiElements.advancedDetailsSection.classList.remove('hidden');
    } else {
        uiElements.showAdvancedDetailsLink.textContent = 'Show Advanced Details';
        uiElements.advancedDetailsSection.classList.add('hidden');
    }
}

// --- Logo Upload Logic ---
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        renderMessageBox('Please drop an image file (e.g., JPG, PNG, GIF).');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        projectSettings.contractorLogo = e.target.result;
        displayLogo(e.target.result);
    };
    reader.readAsDataURL(file);
}

function handleLogoDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        handleFile(event.dataTransfer.files[0]);
    }
}

function displayLogo(base64Image) {
    uiElements.wizardLogoPreview.src = base64Image;
    uiElements.wizardLogoPreview.classList.remove('hidden');
    uiElements.defaultLogoIcon.classList.add('hidden');
    uiElements.uploadText.classList.add('hidden');

    uiElements.mainAppLogo.src = base64Image;
}

function loadSavedLogo() {
    if (projectSettings.contractorLogo) {
        displayLogo(projectSettings.contractorLogo);
    } else {
        uiElements.wizardLogoPreview.classList.add('hidden');
        uiElements.defaultLogoIcon.classList.remove('hidden');
        uiElements.uploadText.classList.remove('hidden');
        uiElements.mainAppLogo.src = '';
    }
}


// --- Trade Selection Logic ---
function populateTradesDropdown() {
    uiElements.tradesDropdown.innerHTML = '';
    const allTrades = Object.keys(projectSettings.allTradeLaborRates);

    const searchTerm = uiElements.tradeSearchInput.value.toLowerCase();
    const filteredTrades = allTrades.filter(trade => 
        trade.toLowerCase().includes(searchTerm)
    );

    if (filteredTrades.length === 0 && searchTerm) {
        uiElements.tradesDropdown.innerHTML = `<p class="text-gray-600 text-center py-4">No trades found matching "${searchTerm}"</p>`;
    } else if (filteredTrades.length === 0 && !searchTerm) {
        uiElements.tradesDropdown.innerHTML = `<p class="text-gray-600 text-center py-4">No trades available.</p>`;
    } else {
        filteredTrades.forEach(trade => {
            const checkboxId = `trade-${trade.replace(/\s/g, '-')}`;
            const isChecked = projectSettings.activeTrades.includes(trade);

            const label = document.createElement('label');
            label.className = 'flex items-center';
            label.innerHTML = `
                <input type="checkbox" id="${checkboxId}" value="${trade}" ${isChecked ? 'checked' : ''} onchange="window.app.handleTradeSelection(this)">
                <span>${trade}</span>
            `;
            uiElements.tradesDropdown.appendChild(label);
        });
    }
}

function updateSelectedTradesDisplay() {
    uiElements.selectedTradesDisplay.innerHTML = '';
    if (projectSettings.activeTrades.length === 0) {
        uiElements.selectedTradesDisplay.textContent = 'Click to select trades...';
        return;
    }
    projectSettings.activeTrades.forEach(trade => {
        const span = document.createElement('span');
        span.className = 'selected-trade-tag';
        span.innerHTML = `${trade} <span class="remove-tag" data-trade="${trade}">&times;</span>`;
        uiElements.selectedTradesDisplay.appendChild(span);
    });
}

function handleTradeSelection(checkbox) {
    const trade = checkbox.value;
    if (checkbox.checked) {
        if (!projectSettings.activeTrades.includes(trade)) {
            projectSettings.activeTrades.push(trade);
            if (!projectSettings.allTradeLaborRates[trade]) {
                projectSettings.allTradeLaborRates[trade] = {
                    "Project Manager": 120, "Superintendent": 100, "General Foreman": 90,
                    "Foreman": 85, "Journeyman": 75, "Apprentice": 50
                };
            }
        }
    } else {
        projectSettings.activeTrades = projectSettings.activeTrades.filter(t => t !== trade);
        // Also remove line items associated with this trade
        estimateItems = estimateItems.filter(item => item.trade !== trade);
    }
    updateSelectedTradesDisplay();
    renderItems(); // Re-render the main table after trade selection changes
    populateWizardStep2LaborRates(); // Update labor rates in wizard step 2
}

function toggleTradeDropdown() {
    uiElements.tradesDropdown.classList.toggle('hidden');
    if (!uiElements.tradesDropdown.classList.contains('hidden')) {
        uiElements.tradeSearchInput.value = '';
        populateTradesDropdown();
    }
}

function hideTradeDropdown() {
    setTimeout(() => {
        if (!uiElements.tradesDropdown.matches(':hover')) {
            uiElements.tradesDropdown.classList.add('hidden');
        }
    }, 100);
}

function showTradeDropdown() {
    uiElements.tradesDropdown.classList.remove('hidden');
}

// Expose functions to the global window.app object if needed for onclick in HTML
window.app = window.app || {};
Object.assign(window.app, {
    showSetup,
    nextStep,
    prevStep,
    startEstimating,
    handleFile,
    handleLogoDrop,
    updateSalesTaxForState,
    toggleAdditionalConsiderationsType,
    toggleAdvancedDetails,
    populateTradesDropdown,
    updateSelectedTradesDisplay,
    handleTradeSelection,
    toggleTradeDropdown,
    hideTradeDropdown,
    showTradeDropdown
});
