// src/sections/SummaryOverview/SummaryOverview.js

window.SummaryOverview = (function() {
    let projectSettings;
    let estimateItems;
    let formatCurrency;
    let formatHours;
    let isDarkTheme;

    let laborMaterialPieChart;

    // UI elements to update
    let summaryTotalProposalElem, summaryOverallLaborHoursElem, summaryProjectCostElem, 
        summaryMiscCostElem, summaryMaterialMarkupElem, summaryMaterialMarkupAmountElem,
        summaryEstimateSubtotalElem, summaryProfitMarginElem, summarySalesTaxElem, 
        summaryMiscPercentElem, summaryOverheadElem, summaryAdditionalConsiderationsElem;

    let laborPMTotalElem, laborSuperintendentTotalElem, laborGeneralForemanTotalElem,
        laborForemanTotalElem, laborJourneymanTotalElem, laborApprenticeTotalElem,
        breakdownLaborHoursTotalElem;

    let breakdownLaborTotalElem, breakdownMaterialTotalElem, breakdownEquipmentTotalElem,
        breakdownSubcontractorTotalElem, breakdownMiscCostLineItemsElem,
        breakdownProjectTotalElem;

    let laborMaterialPieChartCanvas;

    function init(config) {
        projectSettings = config.projectSettings;
        estimateItems = config.estimateItems;
        formatCurrency = config.formatCurrency;
        formatHours = config.formatHours;
        isDarkTheme = config.isDarkTheme;

        // Get all element references from the new layout
        summaryTotalProposalElem = document.getElementById('summaryTotalProposal');
        summaryOverallLaborHoursElem = document.getElementById('summaryOverallLaborHours');
        summaryProjectCostElem = document.getElementById('summaryProjectCost');
        summaryMiscCostElem = document.getElementById('summaryMiscCost');
        summaryMaterialMarkupElem = document.getElementById('summaryMaterialMarkup');
        summaryMaterialMarkupAmountElem = document.getElementById('summaryMaterialMarkupAmount');
        summaryEstimateSubtotalElem = document.getElementById('summaryEstimateSubtotal');
        summaryProfitMarginElem = document.getElementById('summaryProfitMargin');
        summarySalesTaxElem = document.getElementById('summarySalesTax');
        summaryMiscPercentElem = document.getElementById('summaryMiscPercent');
        summaryOverheadElem = document.getElementById('summaryOverhead');
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
        breakdownMiscCostLineItemsElem = document.getElementById('breakdownMiscCostLineItemsElem');
        breakdownProjectTotalElem = document.getElementById('breakdownProjectTotal');

        laborMaterialPieChartCanvas = document.getElementById('laborMaterialPieChart');

        updateSummaries(projectSettings, estimateItems, isDarkTheme);
    }

    function updateSummaries(currentProjectSettings, currentEstimateItems, currentIsDarkTheme) {
        projectSettings = currentProjectSettings;
        estimateItems = currentEstimateItems;
        isDarkTheme = currentIsDarkTheme;

        let totalLaborCost = 0, totalMaterialCostRaw = 0, totalEquipmentCost = 0,
            totalSubcontractorCost = 0, totalMiscLineItemCosts = 0;
        let laborHoursBreakdown = {};

        const allPossibleRoles = new Set();
        Object.keys(projectSettings.allTradeLaborRates).forEach(trade => {
            if (projectSettings.allTradeLaborRates[trade]) {
                Object.keys(projectSettings.allTradeLaborRates[trade]).forEach(role => allPossibleRoles.add(role));
            }
        });
        allPossibleRoles.forEach(role => { laborHoursBreakdown[role] = 0; });

        estimateItems.forEach(item => {
            const laborRate = projectSettings.allTradeLaborRates[item.trade]?.[item.rateRole] || 0;
            const effectiveLaborRate = laborRate * (item.otDtMultiplier || 1.0);
            totalLaborCost += item.hours * effectiveLaborRate;
            totalMaterialCostRaw += item.materialQuantity * item.materialUnitCost;
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
        
        // Executive Summary
        if (summaryProjectCostElem) summaryProjectCostElem.textContent = formatCurrency(totalProjectCostDirect);
        if (summaryMiscCostElem) summaryMiscCostElem.textContent = formatCurrency(totalMiscCostAmount);
        if (summaryOverheadElem) summaryOverheadElem.textContent = `${parseFloat(projectSettings.overhead).toFixed(2)}%`;
        if (summaryMaterialMarkupElem) summaryMaterialMarkupElem.textContent = `${parseFloat(projectSettings.materialMarkup).toFixed(2)}%`;
        if (summaryMaterialMarkupAmountElem) summaryMaterialMarkupAmountElem.textContent = formatCurrency(materialMarkupAmount);
        if (summaryEstimateSubtotalElem) summaryEstimateSubtotalElem.textContent = formatCurrency(estimateSubtotalAmount);
        if (summaryProfitMarginElem) summaryProfitMarginElem.textContent = `${parseFloat(projectSettings.profitMargin).toFixed(2)}%`;
        if (summarySalesTaxElem) summarySalesTaxElem.textContent = `${parseFloat(projectSettings.salesTax).toFixed(2)}%`;
        if (summaryMiscPercentElem) summaryMiscPercentElem.textContent = `${parseFloat(projectSettings.miscellaneous).toFixed(2)}%`;
        
        if (summaryAdditionalConsiderationsElem) {
             if (projectSettings.additionalConsiderationsType === '%') {
                summaryAdditionalConsiderationsElem.textContent = `${parseFloat(projectSettings.additionalConsiderationsValue).toFixed(2)}%`;
            } else {
                summaryAdditionalConsiderationsElem.textContent = formatCurrency(additionalConsiderationAmount);
            }
        }

        // Labor Breakdown
        if (laborPMTotalElem) laborPMTotalElem.textContent = formatHours(laborHoursBreakdown["Project Manager"] || 0);
        if (laborSuperintendentTotalElem) laborSuperintendentTotalElem.textContent = formatHours(laborHoursBreakdown["Superintendent"] || 0);
        if (laborGeneralForemanTotalElem) laborGeneralForemanTotalElem.textContent = formatHours(laborHoursBreakdown["General Foreman"] || 0);
        if (laborForemanTotalElem) laborForemanTotalElem.textContent = formatHours(laborHoursBreakdown["Foreman"] || 0);
        if (laborJourneymanTotalElem) laborJourneymanTotalElem.textContent = formatHours(laborHoursBreakdown["Journeyman"] || 0);
        if (laborApprenticeTotalElem) laborApprenticeTotalElem.textContent = formatHours(laborHoursBreakdown["Apprentice"] || 0);
        if (breakdownLaborHoursTotalElem) breakdownLaborHoursTotalElem.textContent = formatHours(overallLaborHoursSum);

        // Cost Breakdown
        if (breakdownLaborTotalElem) breakdownLaborTotalElem.textContent = formatCurrency(totalLaborCost);
        if (breakdownMaterialTotalElem) breakdownMaterialTotalElem.textContent = formatCurrency(totalMaterialCostRaw);
        if (breakdownEquipmentTotalElem) breakdownEquipmentTotalElem.textContent = formatCurrency(totalEquipmentCost);
        if (breakdownSubcontractorTotalElem) breakdownSubcontractorTotalElem.textContent = formatCurrency(totalSubcontractorCost);
        if (breakdownMiscCostLineItemsElem) breakdownMiscCostLineItemsElem.textContent = formatCurrency(totalMiscLineItemCosts);
        if (breakdownProjectTotalElem) breakdownProjectTotalElem.textContent = formatCurrency(totalProjectCostDirect);

        updatePieChart(totalLaborCost, totalMaterialCostRaw, totalOtherCostsForPieChart, isDarkTheme);
    }

    function updatePieChart(laborCost, materialCost, otherCost, isDarkTheme) {
        const data = [laborCost, materialCost, otherCost];
        const labels = ['Labor', 'Materials', 'Other Costs'];
        const backgroundColors = isDarkTheme ? ['#4299e1', '#63b3ed', '#90cdf4'] : ['#2563eb', '#3b82f6', '#60a5fa']; 
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
            if (!laborMaterialPieChartCanvas) return;
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
                            labels: { color: isDarkTheme ? '#e2e8f0' : '#4b5563', font: { size: 14 } }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) { label += ': '; }
                                    if (context.parsed !== null) { label += formatCurrency(context.parsed); }
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

    return {
        init: init,
        updateSummaries: updateSummaries
    };
})();
