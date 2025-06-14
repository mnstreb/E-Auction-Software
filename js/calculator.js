// js/calculator.js

// --- Estimate Item Management ---
function addItem() {
    const defaultTrade = projectSettings.activeTrades.length > 0 ? projectSettings.activeTrades[0] : "General";
    const defaultRole = projectSettings.allTradeLaborRates[defaultTrade] && Object.keys(projectSettings.allTradeLaborRates[defaultTrade]).length > 0 ? Object.keys(projectSettings.allTradeLaborRates[defaultTrade])[0] : "Journeyman";

    const newItem = {
        id: Date.now(),
        taskName: 'New Task',
        description: 'Description for new task',
        trade: defaultTrade,
        rateRole: defaultRole,
        hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0,
        materialUnitCost: 0,
        equipmentRentalCost: 0,
        subcontractorCostLineItem: 0,
        miscLineItem: 0
    };
    estimateItems.push(newItem);
    renderItems();
}

function deleteItem(id) {
    estimateItems = estimateItems.filter(item => item.id !== id);
    renderItems();
}

function updateItem(id, field, value) {
    const item = estimateItems.find(item => item.id === id);
    if (item) {
        if (['hours', 'materialQuantity', 'materialUnitCost', 'equipmentRentalCost', 'subcontractorCostLineItem', 'miscLineItem', 'otDtMultiplier'].includes(field)) {
            item[field] = parseFloat(value) || 0;
        } else {
            item[field] = value;
        }
        renderItems();
    }
}

function renderItems() {
    uiElements.estimateTableBody.innerHTML = '';
    let totalLaborHoursVal = 0;

    estimateItems.forEach(item => {
        // Ensure trade and role are valid, fallback if needed
        if (!projectSettings.activeTrades.includes(item.trade)) {
            item.trade = projectSettings.activeTrades.length > 0 ? projectSettings.activeTrades[0] : "General";
        }
        if (!projectSettings.allTradeLaborRates[item.trade] || !projectSettings.allTradeLaborRates[item.trade][item.rateRole]) {
             const availableRoles = Object.keys(projectSettings.allTradeLaborRates[item.trade] || {});
             item.rateRole = availableRoles.length > 0 ? availableRoles[0] : "Journeyman";
        }

        const laborRate = projectSettings.allTradeLaborRates[item.trade]?.[item.rateRole] || 0;
        const effectiveLaborRate = laborRate * (item.otDtMultiplier || 1.0);
        const laborTotal = item.hours * effectiveLaborRate;
        const materialsTotal = item.materialQuantity * item.materialUnitCost;
        const otherCategoryTotal = item.equipmentRentalCost + item.subcontractorCostLineItem + item.miscLineItem;
        
        const lineTotal = laborTotal + materialsTotal + otherCategoryTotal;

        totalLaborHoursVal += item.hours;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Task Name"><textarea rows="2" onchange="window.app.updateItem(${item.id}, 'taskName', this.value)" class="input-field">${item.taskName}</textarea></td>
            <td data-label="Description"><textarea rows="2" onchange="window.app.updateItem(${item.id}, 'description', this.value)" class="input-field">${item.description}</textarea></td>
            
            <td data-label="OT/DT Multiplier">
                <select onchange="window.app.updateItem(${item.id}, 'otDtMultiplier', this.value)" class="input-field">
                    <option value="1.0" ${item.otDtMultiplier === 1.0 ? 'selected' : ''}>1.0</option>
                    <option value="1.5" ${item.otDtMultiplier === 1.5 ? 'selected' : ''}>1.5</option>
                    <option value="2.0" ${item.otDtMultiplier === 2.0 ? 'selected' : ''}>2.0</option>
                </select>
            </td>
            <td data-label="Skill">
                <select onchange="window.app.updateItem(${item.id}, 'rateRole', this.value)" class="input-field">
                    ${(projectSettings.allTradeLaborRates[item.trade] ? Object.keys(projectSettings.allTradeLaborRates[item.trade]) : []).map(role => {
                        return `<option value="${role}" ${item.rateRole === role ? 'selected' : ''}>
                                    ${role}
                                </option>`;
                    }).join('')}
                    ${!projectSettings.allTradeLaborRates[item.trade] || Object.keys(projectSettings.allTradeLaborRates[item.trade]).length === 0 ? '<option value="" selected>No Skills</option>' : ''}
                </select>
            </td>
            <td data-label="$/hr">${formatCurrency(laborRate)}</td>
            <td data-label="# hrs"><input type="number" value="${item.hours}" onchange="window.app.updateItem(${item.id}, 'hours', this.value)" class="input-field"></td>
            <td data-label="Labor Total">${formatCurrency(laborTotal)}</td>
            
            <td data-label="Material Qty"><input type="number" value="${item.materialQuantity}" onchange="window.app.updateItem(${item.id}, 'materialQuantity', this.value)" class="input-field"></td>
            <td data-label="Material $/Unit"><input type="number" value="${item.materialUnitCost}" onchange="window.app.updateItem(${item.id}, 'materialUnitCost', this.value)" class="input-field"></td>
            <td data-label="Materials Total">${formatCurrency(materialsTotal)}</td>
            
            <td data-label="Equipment/Rental"><input type="number" value="${item.equipmentRentalCost}" onchange="window.app.updateItem(${item.id}, 'equipmentRentalCost', this.value)" class="input-field"></td>
            <td data-label="Subcontractor"><input type="number" value="${item.subcontractorCostLineItem}" onchange="window.app.updateItem(${item.id}, 'subcontractorCostLineItem', this.value)" class="input-field"></td>
            <td data-label="Misc. Cost"><input type="number" value="${item.miscLineItem}" onchange="window.app.updateItem(${item.id}, 'miscLineItem', this.value)" class="input-field"></td>
            <td data-label="Other Total">${formatCurrency(otherCategoryTotal)}</td>
            
            <td data-label="Line Total" class="font-bold text-gray-900">${formatCurrency(lineTotal)}</td>
            <td><button class="btn btn-red btn-sm" onclick="window.app.deleteItem(${item.id})">🗑️</button></td>
        `;
        uiElements.estimateTableBody.appendChild(row);
    });
    uiElements.summaryOverallLaborHoursElem.textContent = totalLaborHoursVal.toFixed(2);
    calculateTotals();
}

// --- Calculations ---

function calculateTotals() {
    let totalProjectSubtotal = 0;
    let totalLaborCost = 0;
    let totalMaterialCost = 0;
    let totalLineItemOtherCostsSum = 0;

    let laborBreakdown = {};
    let laborHoursBreakdown = {};

    const allPossibleRoles = new Set();
    Object.keys(projectSettings.allTradeLaborRates).forEach(trade => {
        if (projectSettings.allTradeLaborRates[trade]) {
            Object.keys(projectSettings.allTradeLaborRates[trade]).forEach(role => allPossibleRoles.add(role));
        }
    });
    allPossibleRoles.forEach(role => {
        laborBreakdown[role] = 0;
        laborHoursBreakdown[role] = 0;
    });


    estimateItems.forEach(item => {
        const laborRate = projectSettings.allTradeLaborRates[item.trade]?.[item.rateRole] || 0;
        const effectiveLaborRate = laborRate * (item.otDtMultiplier || 1.0);
        const laborTotal = item.hours * effectiveLaborRate;
        const materialsTotal = item.materialQuantity * item.materialUnitCost;
        const otherCategoryTotal = item.equipmentRentalCost + item.subcontractorCostLineItem + item.miscLineItem;
        
        const lineTotalEstimate = laborTotal + materialsTotal + otherCategoryTotal;

        totalProjectSubtotal += lineTotalEstimate;
        totalLaborCost += laborTotal;
        totalMaterialCost += materialsTotal;
        totalLineItemOtherCostsSum += otherCategoryTotal;

        if (laborBreakdown[item.rateRole] !== undefined) {
            laborBreakdown[item.rateRole] += laborTotal;
            laborHoursBreakdown[item.rateRole] += item.hours;
        }
    });
    
    const totalOverheadCost = totalProjectSubtotal * (projectSettings.overhead / 100);

    const totalMiscCostAmount = totalProjectSubtotal * (projectSettings.miscellaneous / 100); // This is project-level misc now
    const subtotalBeforeProfitTax = totalProjectSubtotal + totalMiscCostAmount + totalOverheadCost;

    const totalMarkupAmount = subtotalBeforeProfitTax * (projectSettings.profitMargin / 100);
    const estimateSubtotalAmount = subtotalBeforeProfitTax + totalMarkupAmount;

    const salesTaxAmount = estimateSubtotalAmount * (projectSettings.salesTax / 100);
    
    let additionalConsiderationAmount = 0;
    if (projectSettings.additionalConsiderationsType === '%') {
        additionalConsiderationAmount = estimateSubtotalAmount * (projectSettings.additionalConsiderationsValue / 100);
    } else {
        additionalConsiderationAmount = projectSettings.additionalConsiderationsValue;
    }

    const grandTotal = estimateSubtotalAmount + salesTaxAmount + additionalConsiderationAmount;


    // Update Top-level Summary UI
    uiElements.summaryTotalProposalElem.textContent = formatCurrency(grandTotal);
    uiElements.summaryOverallLaborHoursElem.textContent = estimateItems.reduce((acc, item) => acc + item.hours, 0).toFixed(2);


    // Update Executive Summary UI (now in top row)
    uiElements.summaryProjectCost.textContent = formatCurrency(totalProjectSubtotal);
    uiElements.summaryMiscCost.textContent = formatCurrency(totalMiscCostAmount); // This is project-level misc now
    uiElements.summaryOverhead.textContent = formatCurrency(totalOverheadCost);
    uiElements.summaryMarkup.textContent = formatCurrency(totalMarkupAmount);
    uiElements.summaryEstimateSubtotal.textContent = formatCurrency(estimateSubtotalAmount);
    uiElements.summaryProfitMargin.textContent = `${projectSettings.profitMargin.toFixed(2)}%`;
    uiElements.summarySalesTax.textContent = `${projectSettings.salesTax.toFixed(2)}%`;
    uiElements.summaryMiscPercent.textContent = `${projectSettings.miscellaneous.toFixed(2)}%`;
    uiElements.summaryAdditionalConsiderations.textContent = formatCurrency(additionalConsiderationAmount);

    // Update Labor Breakdown (middle card, now in second row)
    const defaultRoles = ["Project Manager", "Superintendent", "General Foreman", "Foreman", "Journeyman", "Apprentice"];
    const laborBreakdownContainer = document.querySelector('.executive-summary-grid-3col .summary-block:nth-child(1)'); // Adjusted selector
    let currentHtml = `<h4>Labor Breakdown (Hours)</h4>`;
                                
    defaultRoles.forEach(role => {
        currentHtml += `<div class="summary-item"><span>${role}:</span> <strong id="labor${role.replace(/\s/g, '')}Total">${formatHours(laborHoursBreakdown[role] || 0)}</strong></div>`;
    });
    Object.keys(laborHoursBreakdown).sort().forEach(role => {
        if (!defaultRoles.includes(role)) {
            currentHtml += `<div class="summary-item"><span>${role}:</span> <strong>${formatHours(laborHoursBreakdown[role] || 0)}</strong></div>`;
        }
    });
    laborBreakdownContainer.innerHTML = currentHtml;


    // Update Project Cost Breakdown (right card, still in second row)
    uiElements.breakdownLaborTotal.textContent = formatCurrency(totalLaborCost);
    uiElements.breakdownMaterialTotal.textContent = formatCurrency(totalMaterialCost);
    
    const totalEquipmentRentalCost = estimateItems.reduce((acc, item) => acc + item.equipmentRentalCost, 0);
    const totalSubcontractorLineItemCost = estimateItems.reduce((acc, item) => acc + item.subcontractorCostLineItem, 0);
    const totalMiscLineItemCost = estimateItems.reduce((acc, item) => acc + item.miscLineItem, 0);
    
    // Setting global/non-line-item specific breakdown totals to 0 if they don't apply to new structure
    uiElements.breakdownTravelTotal.textContent = formatCurrency(0); 
    uiElements.breakdownFixedTotal.textContent = formatCurrency(0); 
    uiElements.breakdownEquipmentTotal.textContent = formatCurrency(totalEquipmentRentalCost);
    uiElements.breakdownSubcontractorTotal.textContent = formatCurrency(totalSubcontractorLineItemCost);
    
    uiElements.breakdownOtherTotal.textContent = formatCurrency(totalEquipmentRentalCost + totalSubcontractorLineItemCost + totalMiscLineItemCost);


    // Render Pie Chart (now in second row)
    renderPieChart(totalLaborCost, totalMaterialCost);
}

// --- Pie Chart Rendering ---
function renderPieChart(laborTotal, materialTotal) {
    if (uiElements.laborMaterialPieChart) {
        uiElements.laborMaterialPieChart.destroy();
    }

    const ctx = uiElements.laborMaterialPieChartCanvas.getContext('2d');
    uiElements.laborMaterialPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Labor Cost', 'Material Cost'],
            datasets: [{
                data: [laborTotal, materialTotal],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 255, 255, 1)',
                    'rgba(255, 255, 255, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += formatCurrency(context.parsed);
                            }
                            return label;
                        }
                    }
                },
                title: {
                    display: false,
                    text: 'Labor vs. Material Cost Distribution',
                    font: {
                        size: 16
                    },
                    color: '#1f2937'
                }
            }
        }
    });
}

// Expose functions to the global window.app object
window.app = window.app || {};
Object.assign(window.app, {
    addItem,
    deleteItem,
    updateItem,
    renderItems,
    calculateTotals
});
