// js/laborRates.js

// State for advanced mode in Step 2, already defined in wizard.js, so not redefining here
// let isAdvancedModeActive = false; 

function populateWizardStep2LaborRates() {
    uiElements.dynamicLaborRateInputs.innerHTML = '';

    if (projectSettings.activeTrades.length === 0) {
        uiElements.dynamicLaborRateInputs.innerHTML = `<p class="text-gray-600">Please select trades in Step 1 to configure their labor rates here.</p>`;
        return;
    }

    const defaultRoles = ["Project Manager", "Superintendent", "General Foreman", "Foreman", "Journeyman", "Apprentice"];

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
                    ${window.app.isAdvancedModeActive ? `
                        <input type="text" id="${skillNameElementId}" class="skill-name-input editable" value="${role}"
                            onchange="window.app.updateSkillTitle('${trade}', '${role}', this.value)">
                    ` : `
                        <span id="${skillNameElementId}" class="skill-name-display">${role}</span>
                    `}
                    <div class="rate-input-group">
                        <label for="${rateInputId}" class="rate-label">Rate ($/hr):</label>
                        <input type="number" id="${rateInputId}" class="input-field rate-input" value="${rate}"
                            onchange="window.app.updateLaborRate('${trade}', '${role}', this.value)">
                        ${window.app.isAdvancedModeActive ? `
                            <button class="remove-skill-btn" onclick="window.app.confirmRemoveSkillLevel('${trade}', '${role}')">
                                &minus;
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        tradeGroupDiv.innerHTML += skillLevelsHtml;
        uiElements.dynamicLaborRateInputs.appendChild(tradeGroupDiv);
    });
}

function updateLaborRate(trade, role, value) {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue >= 0) {
        projectSettings.allTradeLaborRates[trade][role] = parsedValue;
        populateWizardStep2LaborRates();
        renderItems(); // Re-render main table if rates change
    } else {
        console.error(`Invalid input for ${trade} ${role} rate: ${value}`);
        const inputId = `rate-${trade.replace(/\s/g, '')}-${role.replace(/\s/g, '')}`;
        document.getElementById(inputId).value = projectSettings.allTradeLaborRates[trade][role] || 0;
    }
}

function updateSkillTitle(trade, oldRole, newRole) {
    const trimmedNewRole = newRole.trim();
    if (trimmedNewRole === oldRole) {
        return;
    }
    if (!trimmedNewRole) {
        renderMessageBox("Skill level title cannot be empty. Reverting to original name.");
        document.getElementById(`skillname-${trade.replace(/\s/g, '')}-${oldRole.replace(/\s/g, '')}`).value = oldRole;
        return;
    }
    const existingRoles = Object.keys(projectSettings.allTradeLaborRates[trade]).map(r => r.toLowerCase());
    if (existingRoles.includes(trimmedNewRole.toLowerCase()) && trimmedNewRole.toLowerCase() !== oldRole.toLowerCase()) {
        renderMessageBox(`Skill level "${trimmedNewRole}" already exists for ${trade}. Please choose a different name.`);
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
        renderItems();
    }
}

function toggleAdvancedRates(event) {
    event.preventDefault();
    window.app.isAdvancedModeActive = !window.app.isAdvancedModeActive; // Access global state through window.app
    if (window.app.isAdvancedModeActive) {
        uiElements.advancedLink.textContent = 'Hide Advanced Options';
        uiElements.advancedSkillLevelControls.classList.remove('hidden');
    } else {
        uiElements.advancedLink.textContent = 'Show Advanced Options';
        uiElements.advancedSkillLevelControls.classList.add('hidden');
    }
    populateWizardStep2LaborRates();
}

function addSkillLevelFromAdvanced() {
    if (projectSettings.activeTrades.length === 0) {
        renderMessageBox("Please select at least one trade in Step 1 before adding new skill levels.");
        return;
    }
    
    const newSkillTitleInput = document.getElementById('newSkillTitle');
    const newSkillRateInput = document.getElementById('newSkillRate');

    const newTitle = newSkillTitleInput.value.trim();
    const newRate = parseFloat(newSkillRateInput.value);

    if (!newTitle) {
        renderMessageBox("Please enter a title for the new skill level.");
        return;
    }
    if (isNaN(newRate) || newRate < 0) {
        renderMessageBox("Please enter a valid non-negative number for the new skill rate.");
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
        renderMessageBox(`Skill level "${newTitle}" already exists for some or all selected trades. It was not added where it already existed.`);
    } else {
         renderMessageBox(`Skill level "${newTitle}" already exists for all selected trades or no trades are selected.`);
    }
}

function confirmRemoveSkillLevel(trade, role) {
    renderMessageBox(`Are you sure you want to remove the skill level "${role}" from ${trade}? This will remove it from all line items using it.`,
        () => {
            removeSkillLevel(trade, role);
            closeMessageBox();
        },
        true
    );
}

function removeSkillLevel(trade, role) {
    const defaultRoles = ["Project Manager", "Superintendent", "General Foreman", "Foreman", "Journeyman", "Apprentice"];
    if (defaultRoles.includes(role)) {
        renderMessageBox(`"${role}" is a default skill level and cannot be removed.`);
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
        renderItems();
    }
}

// Expose functions to the global window.app object
window.app = window.app || {};
Object.assign(window.app, {
    populateWizardStep2LaborRates,
    updateLaborRate,
    updateSkillTitle,
    toggleAdvancedRates,
    addSkillLevelFromAdvanced,
    confirmRemoveSkillLevel,
    removeSkillLevel,
    isAdvancedModeActive // Expose state for use in HTML via window.app.isAdvancedModeActive
});
