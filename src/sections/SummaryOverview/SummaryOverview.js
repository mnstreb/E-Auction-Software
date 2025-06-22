// src/sections/SummaryOverview/SummaryOverview.js

window.SummaryOverview = (function() {
    let projectSettings = {};
    let estimateItems = [];
    let formatCurrency;
    let formatHours;
    let isDarkTheme = false; // Initial theme state

    // UI Element references (private to this module)
    let summaryTotalProposalElem;
    let summaryOverallLaborHoursElem;
    let summaryProjectCost;
    let summaryMiscCost;
    let summaryMaterialMarkup;
    let summaryMaterialMarkupAmount;
    let summaryEstimateSubtotal;
    let summaryProfitMargin;
    let summarySalesTax;
    let summaryMiscPercent;
    let summaryOverhead;
    let summaryAdditionalConsiderations;
    let laborPMTotal;
    let laborSuperintendentTotal;
    let laborGeneralForemanTotal;
    let laborForemanTotal;
    let laborJourneymanTotal;
    let laborApprenticeTotal; // Added Apprentice reference
    let breakdownLaborHoursTotal;
    let breakdownLaborTotal;
    let breakdownMaterialTotal;
    let breakdownEquipmentTotal;
    let breakdownSubcontractorTotal;
    let breakdownMiscCostLineItems;
    let breakdownProjectTotal;
    let laborMaterialPieChartCanvas;
    let laborMaterialPieChart; // Chart instance

    /**
     * Initializes the SummaryOverview module by getting UI element references and
     * setting up initial data and helper functions.
     * @param {object} config - Configuration object.
     * @param {object} config.projectSettings - Current project settings data.
     * @param {Array<object>} config.estimateItems - Current estimate line items data.
     * @param {function} config.formatCurrency - Global utility function for currency formatting.
     * @param {function} config.formatHours - Global utility function for hours formatting.
     * @param {boolean} config.isDarkTheme - Initial theme state.
     */
    function init(config) {
        projectSettings = config.projectSettings;
        estimateItems = config.estimateItems;
        formatCurrency = config.formatCurrency;
        formatHours = config.formatHours;
        isDarkTheme = config.isDarkTheme;

        // Get all UI element references once
        summaryTotalProposalElem = document.getElementById('summaryTotalProposal');
        summaryOverallLaborHoursElem = document.getElementById('summaryOverallLaborHours');
        summaryProjectCost = document.getElementById('summaryProjectCost');
        summaryMiscCost = document.getElementById('summaryMiscCost');
        summaryMaterialMarkup = document.getElementById('summaryMaterialMarkup');
        summaryMaterialMarkupAmount = document.getElementById('summaryMaterialMarkupAmount');
        summaryEstimateSubtotal = document.getElementById('summaryEstimateSubtotal');
        summaryProfitMargin = document.getElementById('summaryProfitMargin');
        summarySalesTax = document.getElementById('summarySalesTax');
        summaryMiscPercent = document.getElementById('summaryMiscPercent');
        summaryOverhead = document.getElementById('summaryOverhead');
        summaryAdditionalConsiderations = document.getElementById('summaryAdditionalConsiderations');
        laborPMTotal = document.getElementById('laborPMTotal');
        laborSuperintendentTotal = document.getElementById('laborSuperintendentTotal');
        laborGeneralForemanTotal = document.getElementById('laborGeneralForemanTotal');
        laborForemanTotal = document.getElementById('laborForemanTotal');
        laborJourneymanTotal = document.getElementById('laborJourneymanTotal');
        laborApprenticeTotal = document.getElementById('laborApprenticeTotal'); // Reference for Apprentice
        breakdownLaborHoursTotal = document.getElementById('breakdownLaborHoursTotal');
        breakdownLaborTotal = document.getElementById('breakdownLaborTotal');
        breakdownMaterialTotal = document.getElementById('breakdownMaterialTotal');
        breakdownEquipmentTotal = document.getElementById('breakdownEquipmentTotal');
        breakdownSubcontractorTotal = document.getElementById('breakdownSubcontractorTotal');
        breakdownMiscCostLineItems = document.getElementById('breakdownMiscCost');
        breakdownProjectTotal = document.getElementById('breakdownProjectTotal');
        laborMaterialPieChartCanvas = document.getElementById('laborMaterialPieChart');

        // Initial update of summaries
        updateSummaries(projectSettings, estimateItems, isDarkTheme);
    }

    /**
     * Updates all summary and breakdown values in the UI based on current data.
     * This function is designed to be called by the main application's calculateTotals.
     * @param {object} updatedProjectSettings - The updated project settings including calculated totals.
     * @param {Array<object>} updatedEstimateItems - The updated estimate line items.
     * @param {boolean} currentThemeState - The current theme state (true for dark, false for light).
     */
    function updateSummaries(updatedProjectSettings, updatedEstimateItems, currentThemeState) {
        projectSettings = updatedProjectSettings;
        estimateItems = updatedEstimateItems;
        isDarkTheme = currentThemeState;

        // Update main summary cards
        if (summaryTotalProposalElem) {
            summaryTotalProposalElem.textContent = formatCurrency(projectSettings.grandTotal || 0);
        }
        if (summaryOverallLaborHoursElem) {
            summaryOverallLaborHoursElem.textContent = formatHours(projectSettings.overallLaborHoursSum || 0);
        }

        // Update Executive Summary card
        if (summaryProjectCost) summaryProjectCost.textContent = formatCurrency(projectSettings.totalProjectCostDirect || 0);
        if (summaryMiscCost) summaryMiscCost.textContent = formatCurrency(projectSettings.totalMiscCostAmount || 0);
        if (summaryOverhead) summaryOverhead.textContent = formatCurrency(projectSettings.totalOverheadCost || 0);
        if (summaryMaterialMarkup) summaryMaterialMarkup.textContent = `${(projectSettings.materialMarkup || 0).toFixed(2)}%`;
        if (summaryMaterialMarkupAmount) summaryMaterialMarkupAmount.textContent = formatCurrency(projectSettings.materialMarkupAmount || 0);
        if (summaryEstimateSubtotal) summaryEstimateSubtotal.textContent = formatCurrency(projectSettings.estimateSubtotalAmount || 0);
        if (summaryProfitMargin) summaryProfitMargin.textContent = `${(projectSettings.profitMargin || 0).toFixed(2)}%`;
        if (summarySalesTax) summarySalesTax.textContent = `${(projectSettings.salesTax || 0).toFixed(2)}%`;
        if (summaryMiscPercent) summaryMiscPercent.textContent = `${(projectSettings.miscellaneous || 0).toFixed(2)}%`;
        if (summaryAdditionalConsiderations) summaryAdditionalConsiderations.textContent = formatCurrency(projectSettings.additionalConsiderationAmount || 0);

        // Update Labor Breakdown (Hours)
        if (laborPMTotal) laborPMTotal.textContent = formatHours(projectSettings.laborHoursBreakdown["Project Manager"] || 0);
        if (laborSuperintendentTotal) laborSuperintendentTotal.textContent = formatHours(projectSettings.laborHoursBreakdown["Superintendent"] || 0);
        if (laborGeneralForemanTotal) laborGeneralForemanTotal.textContent = formatHours(projectSettings.laborHoursBreakdown["General Foreman"] || 0);
        if (laborForemanTotal) laborForemanTotal.textContent = formatHours(projectSettings.laborHoursBreakdown["Foreman"] || 0);
        if (laborJourneymanTotal) laborJourneymanTotal.textContent = formatHours(projectSettings.laborHoursBreakdown["Journeyman"] || 0);
        if (laborApprenticeTotal) laborApprenticeTotal.textContent = formatHours(projectSettings.laborHoursBreakdown["Apprentice"] || 0);
        if (breakdownLaborHoursTotal) breakdownLaborHoursTotal.textContent = formatHours(projectSettings.overallLaborHoursSum || 0);

        // Update Project Cost Breakdown
        if (breakdownLaborTotal) breakdownLaborTotal.textContent = formatCurrency(projectSettings.totalLaborCost || 0);
        if (breakdownMaterialTotal) breakdownMaterialTotal.textContent = formatCurrency(projectSettings.totalMaterialCostRaw || 0);
        if (breakdownEquipmentTotal) breakdownEquipmentTotal.textContent = formatCurrency(projectSettings.totalEquipmentCost || 0);
        if (breakdownSubcontractorTotal) breakdownSubcontractorTotal.textContent = formatCurrency(projectSettings.totalSubcontractorCost || 0);
        if (breakdownMiscCostLineItems) breakdownMiscCostLineItems.textContent = formatCurrency(projectSettings.totalMiscLineItemCosts || 0);
        // Corrected breakdownProjectTotal calculation to reflect the full sum intended for this section
        if (breakdownProjectTotal) breakdownProjectTotal.textContent = formatCurrency(
            (projectSettings.totalLaborCost || 0) +
            (projectSettings.totalMaterialCostRaw || 0) +
            (projectSettings.totalEquipmentCost || 0) +
            (projectSettings.totalSubcontractorCost || 0) +
            (projectSettings.totalMiscLineItemCosts || 0)
        );

        // Render the Pie Chart
        renderPieChart();
    }

    /**
     * Renders or updates the pie chart based on current project cost breakdown.
     * Uses internal data from projectSettings.
     */
    function renderPieChart() {
        if (!laborMaterialPieChartCanvas) {
            console.error('SummaryOverview: Pie chart canvas element not found.');
            return;
        }

        const ctx = laborMaterialPieChartCanvas.getContext('2d');
        const dataLabels = ['Labor', 'Materials', 'Equipment', 'Subcontractor', 'Misc.'];
        const dataValues = [
            projectSettings.totalLaborCost || 0,
            projectSettings.totalMaterialCostRaw || 0,
            projectSettings.totalEquipmentCost || 0,
            projectSettings.totalSubcontractorCost || 0,
            projectSettings.totalMiscLineItemCosts || 0
        ];

        // Filter out categories with 0 values to avoid slices for them
        const filteredData = dataLabels.map((label, index) => ({ label, value: dataValues[index] }))
                                    .filter(item => item.value > 0);
        
        const labels = filteredData.map(item => item.label);
        const values = filteredData.map(item => item.value);

        const backgroundColors = [
            '#3b82f6', // Blue for Labor (Tailwind blue-500)
            '#10b981', // Green for Materials (Tailwind emerald-500)
            '#f59e0b', // Amber for Equipment (Tailwind amber-500)
            '#ef4444', // Red for Subcontractor (Tailwind red-500)
            '#8b5cf6'  // Purple for Misc (Tailwind violet-500)
        ];

        const hoverBackgroundColors = [
            '#2563eb', // Darker Blue
            '#059669', // Darker Green
            '#d97706', // Darker Amber
            '#dc2626', // Darker Red
            '#7c3aed'  // Darker Purple
        ];

        // Get text color based on theme
        const textColor = isDarkTheme ? '#e2e8f0' : '#1f2937';

        if (laborMaterialPieChart) {
            laborMaterialPieChart.destroy(); // Destroy existing chart before re-rendering
        }

        laborMaterialPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: backgroundColors,
                    hoverBackgroundColor: hoverBackgroundColors,
                    borderWidth: 1,
                    borderColor: isDarkTheme ? '#2d3748' : '#ffffff', // Card background color
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: textColor, // Set legend text color
                            font: {
                                size: 12
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
                    }
                }
            }
        });
    }

    // Public API
    return {
        init: init,
        updateSummaries: updateSummaries
    };
})();
