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
    let summaryAdditionalConsiderationsUnitElem; // Added for the unit display
    let summaryTotalProposalFinalElem;

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
    let breakdownMiscCostLineItemsElem;
    let breakdownProjectTotalElem;

    let laborMaterialPieChartCanvas;


    /**
     * Initializes the SummaryOverview component by getting element references.
     * This needs to be called after the HTML for this component is loaded into the DOM.
     * @param {object} config - Configuration object containing initial data and helper functions.
     * @param {object} config.projectSettings - The global project settings object.
     * @param {Array<object>} config.estimateItems - The global estimate items array.
     * @param {function} config.formatCurrency - The currency formatting helper function from main script.
     * @param {function} config.formatHours - The hours formatting helper function from main script.
     * @param {boolean} config.isDarkTheme - Initial theme state.
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
        summaryAdditionalConsiderationsUnitElem = document.getElementById('summaryAdditionalConsiderationsUnit');
        summaryTotalProposalFinalElem = document.getElementById('summaryTotalProposalFinal');

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
        breakdownMiscCostLineItemsElem = document.getElementById('breakdownMiscCostLineItemsElem');
        breakdownProjectTotalElem = document.getElementById('breakdownProjectTotal');

        laborMaterialPieChartCanvas = document.getElementById('laborMaterialPieChart');

        // Initial update of summaries
        updateSummaries(projectSettings, estimateItems, isDarkTheme);
    }

    /**
     * Updates all summary and breakdown values based on current project settings and estimate items.
     * This function is called by the main script's calculateTotals.
     * @param {object} currentProjectSettings - The updated project settings including calculated totals.
     * @param {Array<object>} currentEstimateItems - The current estimate items.
     * @param {boolean} currentIsDarkTheme - The current theme state.
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

        // Initialize all possible labor roles to 0 for consistent display
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

        // --- Core Calculation Logic (repeated from index.html for self-containment, but should match) ---
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
            additionalConsiderationAmount = projectSettings.additionalConsiderationsValue;
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
        
        // --- CHANGED BLOCK: All percentage values are now formatted with a '%' symbol ---
        if (summaryOverheadElem) summaryOverheadElem.textContent = `${projectSettings.overhead}%`;
        if (summaryMaterialMarkupElem) summaryMaterialMarkupElem.textContent = `${projectSettings.materialMarkup}%`;
        if (summaryProfitMarginElem) summaryProfitMarginElem.textContent = `${projectSettings.profitMargin}%`;
        if (summarySalesTaxElem) summarySalesTaxElem.textContent = `${projectSettings.salesTax}%`;
        if (summaryMiscPercentElem) summaryMiscPercentElem.textContent = `${projectSettings.miscellaneous}%`;
        // --- END CHANGED BLOCK ---

        if (summaryMaterialMarkupAmountElem) summaryMaterialMarkupAmountElem.textContent = formatCurrency(materialMarkupAmount);
        if (summaryOverheadAmountElem) summaryOverheadAmountElem.textContent = formatCurrency(totalOverheadCost);
        if (summaryEstimateSubtotalElem) summaryEstimateSubtotalElem.textContent = formatCurrency(estimateSubtotalAmount);
        if (summaryProfitMarginAmountElem) summaryProfitMarginAmountElem.textContent = formatCurrency(totalProfitMarginAmount);
        if (summarySalesTaxAmountElem) summarySalesTaxAmountElem.textContent = formatCurrency(salesTaxAmount);
        
        // --- CHANGED: Logic for Additional Considerations to display the correct unit ---
        if (summaryAdditionalConsiderationsElem) {
             if (projectSettings.additionalConsiderationsType === '%') {
                // If it's a percentage, show the input value with a '%'
                summaryAdditionalConsiderationsElem.textContent = `${projectSettings.additionalConsiderationsValue}%`;
            } else {
                // If it's a dollar amount, show the formatted currency value
                summaryAdditionalConsiderationsElem.textContent = formatCurrency(additionalConsiderationAmount);
            }
        }
        // --- END CHANGED ---

        if (summaryTotalProposalFinalElem) summaryTotalProposalFinalElem.textContent = formatCurrency(grandTotal);


        // Labor Breakdown (Hours) - Dynamically update based on allPossibleRoles
        if (laborPMTotalElem) laborPMTotalElem.textContent = formatHours(laborHoursBreakdown["Project Manager"] || 0) + ' hrs';
        if (laborSuperintendentTotalElem) laborSuperintendentTotalElem.textContent = formatHours(laborHoursBreakdown["Superintendent"] || 0) + ' hrs';
        if (laborGeneralForemanTotalElem) laborGeneralForemanTotalElem.textContent = formatHours(laborHoursBreakdown["General Foreman"] || 0) + ' hrs';
        if (laborForemanTotalElem) laborForemanTotalElem.textContent = formatHours(laborHoursBreakdown["Foreman"] || 0) + ' hrs';
        if (laborJourneymanTotalElem) laborJourneymanTotalElem.textContent = formatHours(laborHoursBreakdown["Journeyman"] || 0) + ' hrs';
        if (laborApprenticeTotalElem) laborApprenticeTotalElem.textContent = formatHours(laborHoursBreakdown["Apprentice"] || 0) + ' hrs';
        if (breakdownLaborHoursTotalElem) breakdownLaborHoursTotalElem.textContent = formatHours(overallLaborHoursSum) + ' hrs';

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
     * @param {number} laborCost - Total labor cost.
     * @param {number} materialCost - Total material cost.
     * @param {number} otherCost - Total other costs (equipment, subcontractor, misc line items).
     * @param {boolean} isDarkTheme - Current theme state for chart colors.
     */
    function updatePieChart(laborCost, materialCost, otherCost, isDarkTheme) {
        const data = [laborCost, materialCost, otherCost];
        const labels = ['Labor', 'Materials', 'Other Costs'];

        // Define colors based on theme
        const backgroundColors = isDarkTheme ?
            ['#4299e1', '#63b3ed', '#90cdf4'] : // Lighter blues for dark theme
            ['#2563eb', '#3b82f6', '#60a5fa']; // Deeper blues for light theme
        const borderColors = isDarkTheme ? ['#2a4365', '#2c5282', '#4a5568'] : ['#ffffff', '#ffffff', '#ffffff']; // White border in light, subtle dark border in dark

        if (laborMaterialPieChart) {
            // Update existing chart
            laborMaterialPieChart.data.datasets[0].data = data;
            laborMaterialPieChart.data.datasets[0].backgroundColor = backgroundColors;
            laborMaterialPieChart.data.datasets[0].borderColor = borderColors;
            laborMaterialPieChart.data.labels = labels;

            // Update text color for dark mode
            const textColor = isDarkTheme ? '#e2e8f0' : '#4b5563'; // Light text in dark, dark in light
            laborMaterialPieChart.options.plugins.legend.labels.color = textColor;
            laborMaterialPieChart.options.plugins.tooltip.titleColor = textColor;
            laborMaterialPieChart.options.plugins.tooltip.bodyColor = textColor;


            laborMaterialPieChart.update();
        } else {
            // Create new chart
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
                            position: 'right', // Place legend on the right
                            labels: {
                                color: isDarkTheme ? '#e2e8f0' : '#4b5563', // Dynamic color based on theme
                                font: {
                                    size: 14 // Adjust font size for better readability
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
                            titleColor: isDarkTheme ? '#e2e8f0' : '#4b5563', // Dynamic color
                            bodyColor: isDarkTheme ? '#e2e8f0' : '#4b5563', // Dynamic color
                            backgroundColor: isDarkTheme ? '#2d3748' : 'rgba(0,0,0,0.8)', // Dynamic color
                            borderColor: isDarkTheme ? '#4a5568' : '#e5e7eb', // Dynamic border color
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
        updateSummaries: updateSummaries // Expose the update function to the global scope
    };
})();
