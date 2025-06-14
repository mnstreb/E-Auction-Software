// js/report.js

// --- Report Generation ---
function generateReport() {
    let totalProjectSubtotal = 0;
    let totalLaborCost = 0;
    let totalMaterialCost = 0;
    let totalLineItemOtherCostsSum = 0;

    let laborBreakdownReport = {};
    let laborHoursBreakdownReport = {};
    let totalLaborHoursReport = 0;

    const allPossibleRolesReport = new Set();
    Object.keys(projectSettings.allTradeLaborRates).forEach(trade => {
        if (projectSettings.allTradeLaborRates[trade]) {
            Object.keys(projectSettings.allTradeLaborRates[trade]).forEach(role => allPossibleRolesReport.add(role));
        }
    });
    allPossibleRolesReport.forEach(role => {
        laborBreakdownReport[role] = 0;
        laborHoursBreakdownReport[role] = 0;
    });


    estimateItems.forEach((item) => {
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
        totalLaborHoursReport += item.hours;

        if (laborBreakdownReport[item.rateRole] !== undefined) {
            laborBreakdownReport[item.rateRole] += laborTotal;
            laborHoursBreakdownReport[item.rateRole] += item.hours;
        }
    });

    const totalEquipmentRentalCostSum = estimateItems.reduce((acc, item) => acc + item.equipmentRentalCost, 0);
    const totalSubcontractorLineItemCostSum = estimateItems.reduce((acc, item) => acc + item.subcontractorCostLineItem, 0);
    const totalMiscLineItemCostSum = estimateItems.reduce((acc, item) => acc + item.miscLineItem, 0);

    const breakdownTotalOtherCosts = totalEquipmentRentalCostSum + totalSubcontractorLineItemCostSum + totalMiscLineItemCostSum;


    const totalOverheadCost = totalProjectSubtotal * (projectSettings.overhead / 100);

    const totalMiscCostAmount = totalProjectSubtotal * (projectSettings.miscellaneous / 100);
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


    let reportContent = `CONSTRUCTION ESTIMATE REPORT\n`;
    reportContent += `============================\n\n`;
    
    reportContent += `Project: ${projectSettings.projectName}\n`;
    reportContent += `Client: ${projectSettings.clientName || 'N/A'}\n`;
    reportContent += `Address: ${projectSettings.projectAddress || 'N/A'}\n`;
    reportContent += `City: ${projectSettings.projectCity || 'N/A'}\n`;
    reportContent += `Zip Code: ${projectSettings.projectZip || 'N/A'}\n`;
    reportContent += `State/Location: ${projectSettings.projectState}\n`;
    reportContent += `Start Date: ${projectSettings.startDate || 'N/A'}\n`;
    reportContent += `End Date: ${projectSettings.endDate || 'N/A'}\n`;
    reportContent += `Project ID: ${projectSettings.projectID || 'N/A'}\n`;
    reportContent += `Project Type: ${projectSettings.projectType}\n`;
    reportContent += `Description: ${projectSettings.projectDescription || 'No description provided.'}\n`;
    reportContent += `Date: ${new Date().toLocaleDateString()}\n\n`;

    reportContent += `OVERALL SUMMARY:\n`;
    reportContent += `-------------------------------------------------\n`;
    reportContent += `Total Proposal: ${formatCurrency(grandTotal)}\n`;
    reportContent += `Total Labor Hours: ${totalLaborHoursReport.toFixed(2)}\n\n`;


    reportContent += `EXECUTIVE SUMMARY DETAILS:\n`;
    reportContent += `-------------------------------------------------\n`;
    reportContent += `Total Project Cost (Line Items Base): ${formatCurrency(totalProjectSubtotal)}\n`;
    reportContent += `Total Miscellaneous Cost (${projectSettings.miscellaneous.toFixed(2)}%): ${formatCurrency(totalMiscCostAmount)}\n`;
    reportContent += `Total Overhead Cost (${projectSettings.overhead.toFixed(2)}%): ${formatCurrency(totalOverheadCost)}\n`;
    reportContent += `Total Markup (${projectSettings.profitMargin.toFixed(2)}%): ${formatCurrency(totalMarkupAmount)}\n`;
    reportContent += `Estimate Subtotal (before sales tax): ${formatCurrency(estimateSubtotalAmount)}\n`;
    reportContent += `Sales Tax (${projectSettings.salesTax.toFixed(2)}%): ${formatCurrency(salesTaxAmount)}\n`;
    reportContent += `Additional Considerations (${projectSettings.additionalConsiderationsValue.toFixed(2)}${projectSettings.additionalConsiderationsType}): ${formatCurrency(additionalConsiderationAmount)}\n\n`;


    reportContent += `LABOR BREAKDOWN (HOURS):\n`;
    reportContent += `-------------------------------------------------\n`;
    const defaultRolesReport = ["Project Manager", "Superintendent", "General Foreman", "Foreman", "Journeyman", "Apprentice"];
    defaultRolesReport.forEach(role => {
        reportContent += `${role}: ${formatHours(laborHoursBreakdownReport[role] || 0)}\n`;
    });
    Object.keys(laborHoursBreakdownReport).sort().forEach(role => {
        if (!defaultRolesReport.includes(role)) {
            reportContent += `${role}: ${formatHours(laborHoursBreakdownReport[role])}\n`;
        }
    });
    reportContent += `\n`;

    reportContent += `PROJECT COST BREAKDOWN:\n`;
    reportContent += `-------------------------------------------------\n`;
    reportContent += `Labor Total: ${formatCurrency(totalLaborCost)}\n`;
    reportContent += `Material Total: ${formatCurrency(totalMaterialCost)}\n`;
    reportContent += `Equipment/Rental Total: ${formatCurrency(totalEquipmentRentalCostSum)}\n`;
    reportContent += `Sub-contractor Total: ${formatCurrency(totalSubcontractorLineItemCostSum)}\n`;
    reportContent += `Misc. Total (Line Items): ${formatCurrency(totalMiscLineItemCostSum)}\n`;
    reportContent += `Total Other Costs (Aggregated): ${formatCurrency(breakdownTotalOtherCosts)}\n\n`;


    reportContent += `ESTIMATE LINE ITEMS:\n`;
    reportContent += `====================\n`;

    estimateItems.forEach((item, index) => {
        const laborRate = projectSettings.allTradeLaborRates[item.trade]?.[item.rateRole] || 0;
        const effectiveLaborRate = laborRate * (item.otDtMultiplier || 1.0);
        const laborTotal = item.hours * effectiveLaborRate;
        const materialsTotal = item.materialQuantity * item.materialUnitCost;
        const otherCategoryTotal = item.equipmentRentalCost + item.subcontractorCostLineItem + item.miscLineItem;

        const lineTotal = laborTotal + materialsTotal + otherCategoryTotal;

        reportContent += `\nItem ${index + 1}: ${item.taskName || 'N/A'}\n`;
        reportContent += `  Description: ${item.description || 'No description'}\n`;
        reportContent += `  --- LABOR ---\n`;
        reportContent += `    OT/DT Multiplier: ${item.otDtMultiplier.toFixed(1)}\n`;
        reportContent += `    Skill: ${item.rateRole} (${formatCurrency(laborRate)}/hr)\n`;
        reportContent += `    # Hours: ${item.hours.toFixed(2)}\n`;
        reportContent += `    Labor Total: ${formatCurrency(laborTotal)}\n`;
        reportContent += `  --- MATERIALS ---\n`;
        reportContent += `    Quantity / Unit: ${item.materialQuantity}\n`;
        reportContent += `    $ / Unit: ${formatCurrency(item.materialUnitCost)}\n`;
        reportContent += `    Materials Total: ${formatCurrency(materialsTotal)}\n`;
        reportContent += `  --- OTHER ---\n`;
        reportContent += `    Equipment / Rental: ${formatCurrency(item.equipmentRentalCost)}\n`;
        reportContent += `    Subcontractor: ${formatCurrency(item.subcontractorCostLineItem)}\n`;
        reportContent += `    Misc. Cost: ${formatCurrency(item.miscLineItem)}\n`;
        reportContent += `    Other Total: ${formatCurrency(otherCategoryTotal)}\n`;
        reportContent += `  Line Item Total: ${formatCurrency(lineTotal)}\n`;
    });

    reportContent += `\nEnd of Report\n`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectSettings.projectName.replace(/\s/g, '_')}_Estimate_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Expose functions to the global window.app object
window.app = window.app || {};
Object.assign(window.app, {
    generateReport
});
