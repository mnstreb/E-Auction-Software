// src/sections/SummaryOverview/SummaryOverview.js

window.SummaryOverview = (function() {
    let projectSettings;
    let estimateItems;
    let formatCurrency;
    let formatHours;
    let isDarkTheme; // New parameter for theme

    let laborMaterialPieChart; // Variable to hold the Chart.js instance

    // UI elements to update
    let summaryTotalProposalElem;
    let summaryOverallLaborHoursElem;
    let summaryProjectCostElem;
    let summaryMiscCostElem;
    let summaryMaterialMarkupElem;
    let summaryMaterialMarkupAmountElem;
    let summaryEstimateSubtotalElem;
    let summaryProfitMarginElem;
    let summaryProfitMarginAmountElem;
    let summarySalesTaxElem;
    let summarySalesTaxAmountElem;
    let summaryMiscPercentElem;
    let summaryOverheadElem;
    let summaryOverheadAmountElem;
    let summaryAdditionalConsiderationsElem;

    let laborPMTotalElem;
    let laborSuperintendentTotalElem;
    let laborGeneralForemanTotalElem;
    let laborForemanTotalElem;
    let laborJourneymanTotalElem;
    let laborApprenticeTotalElem;
    let breakdownLaborHoursTotalElem;

    let breakdownLaborTotalElem;
    let breakdownMaterialTotalElem;
    let breakdownEquipmentTotalElem;
    let breakdownSubcontractorTotalElem;
    let breakdownMiscCostLineItemsElem; // Corrected variable name for clarity
    let breakdownProjectTotalElem;

    let laborMaterialPieChartCanvas;


    /**
     * Initializes the SummaryOverview component by getting element references.
     * This needs to be called after the HTML for this component is loaded into the DOM.
     * @param {object} config - Configuration object containing initial data and helper functions.
     */
    function init(config) {
        projectSettings = config.projectSettings;
        estimateItems = config.estimateItems;
        formatCurrency = config.formatCurrency;
        formatHours = config.formatHours;
        isDarkTheme = config.isDarkTheme;

        // Get all element references
        summaryTotalProposalElem = document.getElementById('summaryTotalProposal');
        summaryOverallLaborHoursElem = document.getElementById('summaryOverallLaborHours');
        summaryProjectCostElem = document.getElementById('summaryProjectCost');
        summaryMiscCostElem = document.getElementById('summaryMiscCost');
        summaryMaterialMarkupElem = document.getElementById('summaryMaterialMarkup');
        summaryMaterialMarkupAmountElem = document.getElementById('summaryMaterialMarkupAmount');
        summaryEstimateSubtotalElem = document.getElementById('summaryEstimateSubtotal');
        summaryProfitMarginElem = document.getElementById('summaryProfitMargin');
        summaryProfitMarginAmountElem = document.getElementById('summaryProfitMarginAmount');
        summarySalesTaxElem = document.getElementById('summarySalesTax');
        summarySalesTaxAmountElem = document.getElementById('summarySalesTaxAmount');
        summaryMiscPercentElem = document.getElementById('summaryMiscPercent');
        summaryOverheadElem = document.getElementById('summaryOverhead');
        summaryOverheadAmountElem = document.getElementById('summaryOverheadAmount');
        summaryAdditionalConsiderationsElem = document.getElementById('summaryAdditionalConsiderations');

        laborPMTotalElem = document.getElementById('laborPMTotal');
        laborSuperintendentTotalElem = document.getElementById('laborSuperintendentTotal');
        laborGeneralForemanTotalElem = document.getElementById('laborGeneralForemanTotal');
        laborForemanTotalElem = document.getElementById('laborForemanTotal');
        laborJourneymanTotalElem = document.getElementById('laborJourneymanTotal');
        laborApprenticeTotalElem = document.getElementById('laborApprenticeTotal');
        breakdownLaborHoursTotalElem = document.getElementById('breakdownLaborHoursTotal');

        breakdownLaborTotalElem = document.getElementById('breakdownLaborTotal');
        breakdownMaterialTotalElem = document.getElementById('breakdownMaterialTotal');
        breakdownEquipmentTotalElem = document.getElementById('breakdownEquipmentTotal');
        breakdownSubcontractorTotalElem = document.getElementById('breakdownSubcontractorTotal');
        // BUG FIX: The ID in the HTML is 'breakdownMiscCostLineItemsElem', this now correctly references it.
        breakdownMiscCostLineItemsElem = document.getElementById('breakdownMiscCostLineItemsElem');
        breakdownProjectTotalElem = document.getElementById('breakdownProjectTotal');

        laborMaterialPieChartCanvas = document.getElementById('laborMaterialPieChart');

        // Initial update of summaries
        updateSummaries(projectSettings, estimateItems, isDarkTheme);
    }

    /**
     * Updates all summary and breakdown values based on current project settings and estimate items.
     * This function is called by the main script's calculateTotals.
     */
    function updateSummaries(currentProjectSettings, currentEstimateItems, currentIsDarkTheme) {
        projectSettings = currentProjectSettings; // Update local reference
        estimateItems = currentEstimateItems; // Update local reference
        isDarkTheme = currentIsDarkTheme; // Update local reference

        // Direct Costs Sums from line items
        let totalLaborCost = 0;
        let totalMaterialCostRaw = 0;
        let totalEquipmentCost = 0;
        let totalSubcontractorCost = 0;
        let totalMiscLineItemCosts = 0;

        let laborHoursBreakdown = {}; // Hours per role

        const allPossibleRoles = new Set();
        Object.keys(projectSettings.allTradeLaborRates).forEach(trade => {
            if (projectSettings.allTradeLaborRates[trade]) {
                Object.keys(projectSettings.allTradeLaborRates[trade]).forEach(role => allPossibleRoles.add(role));
            }
        });
        allPossibleRoles.forEach(role => {
            laborHoursBreakdown[role] = 0;
        });

        estimateItems.forEach(item => {
            const laborRate = projectSettings.allTradeLaborRates[item.trade]?.[item.rateRole] || 0;
            const effectiveLaborRate = laborRate * (item.otDtMultiplier || 1.0);
            const laborTotal = item.hours * effectiveLaborRate;
            const materialsTotal = item.materialQuantity * item.materialUnitCost;
            
            totalLaborCost += laborTotal;
            totalMaterialCostRaw += materialsTotal;
            totalEquipmentCost += item.equipmentRentalCost;
            totalSubcontractorCost += item.subcontractorCostLineItem;
            totalMiscLineItemCosts += item.miscLineItem;
            
            if (laborHoursBreakdown[item.rateRole] !== undefined) {
                laborHoursBreakdown[item.rateRole] += item.hours;
            }
        });

        const totalProjectCostDirect = totalLaborCost + totalMaterialCostRaw + totalEquipmentCost + totalSubcontractorCost + totalMiscLineItemCosts;
        const materialMarkupAmount = totalMaterialCostRaw * (projectSettings.materialMarkup / 100);
        const baseCostForOverheadMiscProfit = totalProjectCostDirect + materialMarkupAmount;
        const totalOverheadCost = baseCostForOverheadMiscProfit * (projectSettings.overhead / 100);
        const totalMiscCostAmount = baseCostForOverheadMiscProfit * (projectSettings.miscellaneous / 100);
        const subtotalBeforeProfitTax = baseCostForOverheadMiscProfit + totalMiscCostAmount + totalOverheadCost;
        const totalProfitMarginAmount = subtotalBeforeProfitTax * (projectSettings.profitMargin / 100);
        const estimateSubtotalAmount = subtotalBeforeProfitTax + totalProfitMarginAmount;
        const salesTaxApplicableBase = totalMaterialCostRaw + materialMarkupAmount;
        const salesTaxAmount = salesTaxApplicableBase * (projectSettings.salesTax / 100);
        
        let additionalConsiderationAmount = 0;
        if (projectSettings.additionalConsiderationsType === '%') {
            additionalConsiderationAmount = estimateSubtotalAmount * (projectSettings.additionalConsiderationsValue / 100);
        } else {
            additionalConsiderationAmount = parseFloat(projectSettings.additionalConsiderationsValue) || 0;
        }

        const grandTotal = estimateSubtotalAmount + salesTaxAmount + additionalConsiderationAmount;
        const overallLaborHoursSum = Object.values(laborHoursBreakdown).reduce((sum, hours) => sum + hours, 0);
        const totalOtherCostsForPieChart = totalEquipmentCost + totalSubcontractorCost + totalMiscLineItemCosts;


        // --- Update UI Elements ---
        if (summaryTotalProposalElem) summaryTotalProposalElem.textContent = formatCurrency(grandTotal);
        if (summaryOverallLaborHoursElem) summaryOverallLaborHoursElem.textContent = formatHours(overallLaborHoursSum);
        
        // Project Costs Summary
        if (summaryProjectCostElem) summaryProjectCostElem.textContent = formatCurrency(totalProjectCostDirect);
        if (summaryMiscCostElem) summaryMiscCostElem.textContent = formatCurrency(totalMiscCostAmount);
        
        // --- CORRECTED BLOCK: All percentage values are now correctly formatted with a '%' symbol ---
        if (summaryOverheadElem) summaryOverheadElem.textContent = `${parseFloat(projectSettings.overhead).toFixed(2)}%`;
        if (summaryMaterialMarkupElem) summaryMaterialMarkupElem.textContent = `${parseFloat(projectSettings.materialMarkup).toFixed(2)}%`;
        if (summaryProfitMarginElem) summaryProfitMarginElem.textContent = `${parseFloat(projectSettings.profitMargin).toFixed(2)}%`;
        if (summarySalesTaxElem) summarySalesTaxElem.textContent = `${parseFloat(projectSettings.salesTax).toFixed(2)}%`;
        if (summaryMiscPercentElem) summaryMiscPercentElem.textContent = `${parseFloat(projectSettings.miscellaneous).toFixed(2)}%`;
        // --- END CORRECTED BLOCK ---

        if (summaryMaterialMarkupAmountElem) summaryMaterialMarkupAmountElem.textContent = formatCurrency(materialMarkupAmount);
        if (summaryEstimateSubtotalElem) summaryEstimateSubtotalElem.textContent = formatCurrency(estimateSubtotalAmount);
        
        // --- CORRECTED: Logic for Additional Considerations to display the correct unit ---
        if (summaryAdditionalConsiderationsElem) {
             if (projectSettings.additionalConsiderationsType === '%') {
                summaryAdditionalConsiderationsElem.textContent = `${parseFloat(projectSettings.additionalConsiderationsValue).toFixed(2)}%`;
            } else {
                summaryAdditionalConsiderationsElem.textContent = formatCurrency(additionalConsiderationAmount);
            }
        }
        // --- END CORRECTED ---

        // Labor Breakdown (Hours)
        if (laborPMTotalElem) laborPMTotalElem.textContent = formatHours(laborHoursBreakdown["Project Manager"] || 0);
        if (laborSuperintendentTotalElem) laborSuperintendentTotalElem.textContent = formatHours(laborHoursBreakdown["Superintendent"] || 0);
        if (laborGeneralForemanTotalElem) laborGeneralForemanTotalElem.textContent = formatHours(laborHoursBreakdown["General Foreman"] || 0);
        if (laborForemanTotalElem) laborForemanTotalElem.textContent = formatHours(laborHoursBreakdown["Foreman"] || 0);
        if (laborJourneymanTotalElem) laborJourneymanTotalElem.textContent = formatHours(laborHoursBreakdown["Journeyman"] || 0);
        if (laborApprenticeTotalElem) laborApprenticeTotalElem.textContent = formatHours(laborHoursBreakdown["Apprentice"] || 0);
        if (breakdownLaborHoursTotalElem) breakdownLaborHoursTotalElem.textContent = formatHours(overallLaborHoursSum);

        // Detailed Cost Breakdown
        if (breakdownLaborTotalElem) breakdownLaborTotalElem.textContent = formatCurrency(totalLaborCost);
        if (breakdownMaterialTotalElem) breakdownMaterialTotalElem.textContent = formatCurrency(totalMaterialCostRaw);
        if (breakdownEquipmentTotalElem) breakdownEquipmentTotalElem.textContent = formatCurrency(totalEquipmentCost);
        if (breakdownSubcontractorTotalElem) breakdownSubcontractorTotalElem.textContent = formatCurrency(totalSubcontractorCost);
        if (breakdownMiscCostLineItemsElem) breakdownMiscCostLineItemsElem.textContent = formatCurrency(totalMiscLineItemCosts);
        if (breakdownProjectTotalElem) breakdownProjectTotalElem.textContent = formatCurrency(totalProjectCostDirect);

        // Update the Pie Chart
        updatePieChart(totalLaborCost, totalMaterialCostRaw, totalOtherCostsForPieChart, isDarkTheme);
    }

    /**
     * Updates or creates the pie chart with new data.
     */
    function updatePieChart(laborCost, materialCost, otherCost, isDarkTheme) {
        const data = [laborCost, materialCost, otherCost];
        const labels = ['Labor', 'Materials', 'Other Costs'];

        const backgroundColors = isDarkTheme ?
            ['#4299e1', '#63b3ed', '#90cdf4'] :
            ['#2563eb', '#3b82f6', '#60a5fa']; 
        const borderColors = isDarkTheme ? ['#2a4365', '#2c5282', '#4a5568'] : ['#ffffff', '#ffffff', '#ffffff'];

        if (laborMaterialPieChart) {
            laborMaterialPieChart.data.datasets[0].data = data;
            laborMaterialPieChart.data.datasets[0].backgroundColor = backgroundColors;
            laborMaterialPieChart.data.datasets[0].borderColor = borderColors;
            laborMaterialPieChart.data.labels = labels;

            const textColor = isDarkTheme ? '#e2e8f0' : '#4b5563';
            laborMaterialPieChart.options.plugins.legend.labels.color = textColor;
            laborMaterialPieChart.options.plugins.tooltip.titleColor = textColor;
            laborMaterialPieChart.options.plugins.tooltip.bodyColor = textColor;

            laborMaterialPieChart.update();
        } else {
            if (!laborMaterialPieChartCanvas) {
                console.error("Pie chart canvas element not found!");
                return;
            }
            const ctx = laborMaterialPieChartCanvas.getContext('2d');
            laborMaterialPieChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: isDarkTheme ? '#e2e8f0' : '#4b5563',
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
                            },
                            titleColor: isDarkTheme ? '#e2e8f0' : '#4b5563',
                            bodyColor: isDarkTheme ? '#e2e8f0' : '#4b5563',
                            backgroundColor: isDarkTheme ? '#2d3748' : 'rgba(0,0,0,0.8)',
                            borderColor: isDarkTheme ? '#4a5568' : '#e5e7eb',
                            borderWidth: 1,
                            cornerRadius: 8,
                            padding: 12
                        }
                    }
                }
            });
        }
    }

    // Expose public methods
    return {
        init: init,
        updateSummaries: updateSummaries
    };
})();
