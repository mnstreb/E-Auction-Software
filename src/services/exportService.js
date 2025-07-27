// src/services/exportService.js

/**
 * Generates and exports a client-facing quote as a PDF.
 * @param {object} projectSettings - The current project settings.
 * @param {Array<object>} estimateItems - The list of estimate items for detailed quotes.
 * @param {string} currentAppMode - The current mode ('detailed' or 'quickQuote').
 * @param {function} formatCurrency - The currency formatting helper function.
 * @param {function} renderMessageBox - The function to display a message box.
 */
export function exportClientQuoteToPdf(projectSettings, estimateItems, currentAppMode, formatCurrency, renderMessageBox) {
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF.API.autoTable === 'undefined') {
        renderMessageBox('Error: PDF generation library not loaded correctly.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'letter' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let cursorY = 40;

    if (projectSettings.contractorLogo) {
        try { 
            doc.addImage(projectSettings.contractorLogo, 'PNG', margin, cursorY, 80, 0); 
        } catch (e) { 
            console.error("Error adding logo to PDF:", e); 
        }
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTE', pageWidth - margin, cursorY + 15, { align: 'right' });
    cursorY += 40;

    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 15;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM:', margin, cursorY);
    doc.text('TO:', pageWidth / 2, cursorY);

    doc.setFont('helvetica', 'normal');
    cursorY += 12;
    doc.text(projectSettings.ownerName || "Your Company Name", margin, cursorY);
    doc.text(projectSettings.clientName, pageWidth / 2, cursorY);
    cursorY += 12;
    doc.text(projectSettings.ownerAddress || "123 Main St", margin, cursorY);
    doc.text(projectSettings.projectAddress, pageWidth / 2, cursorY);
    cursorY += 12;
    doc.text(`${projectSettings.ownerCity || "Anytown, USA"} ${projectSettings.ownerZip || "12345"}`, margin, cursorY);
    doc.text(`${projectSettings.projectCity}, ${projectSettings.projectState} ${projectSettings.projectZip}`, pageWidth / 2, cursorY);
    cursorY += 25;

    doc.setFont('helvetica', 'bold');
    doc.text('QUOTE #', margin, cursorY);
    doc.text('DATE', pageWidth / 2, cursorY);
    doc.setFont('helvetica', 'normal');
    cursorY += 12;
    doc.text(projectSettings.projectID || 'N/A', margin, cursorY);
    doc.text(new Date().toLocaleDateString(), pageWidth / 2, cursorY);
    cursorY += 25;

    const quoteBody = (currentAppMode === 'detailed') ? estimateItems.map(item => {
        const laborTotal = item.hours * (projectSettings.allTradeLaborRates[item.trade]?.[item.rateRole] || 0) * (item.otDtMultiplier || 1.0);
        const materialsTotal = item.materialQuantity * item.materialUnitCost;
        const otherTotal = item.equipmentRentalCost + item.subcontractorCostLineItem + item.miscLineItem;
        const lineTotal = laborTotal + materialsTotal + otherTotal;
        return [item.taskName, item.description, formatCurrency(lineTotal)];
    }) : [
        ["Quick Quote Estimate", `A high-level estimate for ${projectSettings.projectName || 'your project'} in ${projectSettings.projectState || 'N/A'}.`, formatCurrency(projectSettings.grandTotal)]
    ];

    doc.autoTable({
        startY: cursorY,
        head: [['DESCRIPTION', 'DETAILS', 'AMOUNT']],
        body: quoteBody,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 2: { halign: 'right' } },
        didDrawPage: (data) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
    });
    
    cursorY = doc.autoTable.previous.finalY + 20;

    const subtotalValue = projectSettings.grandTotal + projectSettings.discountAmount - projectSettings.salesTaxAmount;
    const totalsBody = [
        ['Subtotal', formatCurrency(subtotalValue)],
        ['Sales Tax', formatCurrency(projectSettings.salesTaxAmount)],
        ['Discount', `-${formatCurrency(projectSettings.discountAmount)}`],
        ['Total', formatCurrency(projectSettings.grandTotal)]
    ];

    doc.autoTable({
        startY: cursorY,
        body: totalsBody,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: { 0: { halign: 'right', fontStyle: 'bold' }, 1: { halign: 'right' } },
        margin: { left: pageWidth / 2 }
    });

    const exportFileName = `${(projectSettings.projectName || 'quote').replace(/ /g, '_')}-client-quote.pdf`;
    doc.save(exportFileName);
    renderMessageBox('Client quote has been exported to PDF.');
}


/**
 * Generates and exports a detailed internal report as a PDF.
 * @param {object} projectSettings - The current project settings.
 * @param {Array<object>} estimateItems - The list of estimate items.
 * @param {function} formatCurrency - The currency formatting helper function.
 * @param {function} formatHours - The hours formatting helper function.
 * @param {function} renderMessageBox - The function to display a message box.
 */
export function exportDetailedReportToPdf(projectSettings, estimateItems, formatCurrency, formatHours, renderMessageBox) {
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF.API.autoTable === 'undefined') {
        renderMessageBox('Error: PDF generation library not loaded correctly.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });
    let cursorY = 20;

    if (projectSettings.contractorLogo) {
        try { 
            doc.addImage(projectSettings.contractorLogo, 'PNG', 15, cursorY, 60, 0); 
        } catch (e) { 
            console.error("Error adding logo to PDF:", e); 
        }
    }
    
    // MODIFIED: Adjusted vertical positioning for better layout
    cursorY += 15;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Project Estimate', 148, cursorY, { align: 'center' });
    
    cursorY += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Project: ${projectSettings.projectName}`, 148, cursorY, { align: 'center' });
    cursorY += 5;
    doc.text(`Client: ${projectSettings.clientName}`, 148, cursorY, { align: 'center' });
    
    // MODIFIED: Restructured summary data into a single table
    cursorY += 15;
    const summaryData = [
        [
            'Total Proposal:', formatCurrency(projectSettings.grandTotal),
            'Miscellaneous:', `${projectSettings.miscellaneous.toFixed(2)}% (${formatCurrency(projectSettings.totalMiscCostAmount)})`
        ],
        [
            'Total Labor Hours:', formatHours(projectSettings.overallLaborHoursSum),
            'Subtotal:', formatCurrency(projectSettings.estimateSubtotalAmount)
        ],
        [
            'Total Direct Cost:', formatCurrency(projectSettings.totalProjectCostDirect),
            'Profit Margin:', `${projectSettings.profitMargin.toFixed(2)}% (${formatCurrency(projectSettings.totalProfitMarginAmount)})`
        ],
        [
            'Material Markup:', `${projectSettings.materialMarkup.toFixed(2)}% (${formatCurrency(projectSettings.materialMarkupAmount)})`,
            'Sales Tax:', `${projectSettings.salesTax.toFixed(2)}% (${formatCurrency(projectSettings.salesTaxAmount)})`
        ],
        [
            'Overhead:', `${projectSettings.overhead.toFixed(2)}% (${formatCurrency(projectSettings.totalOverheadCost)})`,
            'Addt\'l Considerations:', formatCurrency(projectSettings.additionalConsiderationAmount)
        ]
    ];

    doc.autoTable({
        startY: cursorY,
        body: summaryData,
        theme: 'striped',
        styles: { fontSize: 9 },
        columnStyles: {
            0: { fontStyle: 'bold' },
            1: { halign: 'right' },
            2: { fontStyle: 'bold' },
            3: { halign: 'right' }
        }
    });
    
    const lineItemsHead = [
        [
            { content: 'Task', rowSpan: 2, styles: { valign: 'middle' } },
            { content: 'Description', rowSpan: 2, styles: { valign: 'middle' } },
            { content: 'Labor', colSpan: 5, styles: { halign: 'center' } },
            { content: 'Materials', colSpan: 3, styles: { halign: 'center' } },
            { content: 'Other Costs', colSpan: 4, styles: { halign: 'center' } },
            { content: 'Line Total', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
        ],
        ['OT/DT', 'Trade', 'Skill', '$/hr', 'Labor Total', 'Qty/Unit', '$/Unit', 'Mat. Total', 'Equip.', 'Sub', 'Misc.', 'Other Total']
    ];

    const lineItemsBody = estimateItems.map(item => {
        const laborRate = projectSettings.allTradeLaborRates[item.trade]?.[item.rateRole] || 0;
        const effectiveLaborRate = laborRate * (item.otDtMultiplier || 1.0);
        const laborTotal = item.hours * effectiveLaborRate;
        const materialsTotal = item.materialQuantity * item.materialUnitCost;
        const otherCategoryTotal = item.equipmentRentalCost + item.subcontractorCostLineItem + item.miscLineItem;
        const lineTotal = laborTotal + materialsTotal + otherCategoryTotal;

        return [
            item.taskName, item.description, item.otDtMultiplier.toFixed(1), item.trade,
            item.rateRole, formatCurrency(laborRate), formatCurrency(laborTotal),
            `${item.materialQuantity} / unit`, formatCurrency(item.materialUnitCost),
            formatCurrency(materialsTotal), formatCurrency(item.equipmentRentalCost),
            formatCurrency(item.subcontractorCostLineItem), formatCurrency(item.miscLineItem),
            formatCurrency(otherCategoryTotal), formatCurrency(lineTotal)
        ];
    });

    doc.autoTable({
        head: lineItemsHead, body: lineItemsBody, startY: doc.autoTable.previous.finalY + 10,
        theme: 'grid', 
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 7, cellPadding: 1.5 },
        columnStyles: { 5: { halign: 'right' }, 6: { halign: 'right' }, 8: { halign: 'right' }, 9: { halign: 'right' }, 10: { halign: 'right' }, 11: { halign: 'right' }, 12: { halign: 'right' }, 13: { halign: 'right' }, 14: { halign: 'right' } }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, 200, { align: 'center' });
    }

    const exportFileName = `${(projectSettings.projectName || 'estimate').replace(/ /g, '_')}-detailed-report.pdf`;
    doc.save(exportFileName);
    renderMessageBox('Detailed report has been exported to PDF.');
}


/**
 * Generates and exports the estimate data as a CSV file.
 * @param {object} projectSettings - The current project settings.
 * @param {Array<object>} estimateItems - The list of estimate items.
 * @param {function} renderMessageBox - The function to display a message box.
 */
export function exportEstimateToCsv(projectSettings, estimateItems, renderMessageBox) {
    if (estimateItems.length === 0) {
        renderMessageBox('There are no line items to export.');
        return;
    }

    const dataForExport = estimateItems.map(item => {
        const laborRate = projectSettings.allTradeLaborRates[item.trade]?.[item.rateRole] || 0;
        const effectiveLaborRate = laborRate * (item.otDtMultiplier || 1.0);
        const laborTotal = item.hours * effectiveLaborRate;
        const materialsTotal = item.materialQuantity * item.materialUnitCost;
        const otherCategoryTotal = item.equipmentRentalCost + item.subcontractorCostLineItem + item.miscLineItem;
        const lineTotal = laborTotal + materialsTotal + otherCategoryTotal;

        return {
            "Task Name": item.taskName, "Description": item.description, "Trade": item.trade,
            "Skill": item.rateRole, "OT/DT Multiplier": item.otDtMultiplier, "Hours": item.hours,
            "Labor Rate ($)": laborRate.toFixed(2), "Labor Total ($)": laborTotal.toFixed(2),
            "Material Quantity": item.materialQuantity, "Material Unit Cost ($)": item.materialUnitCost.toFixed(2),
            "Materials Total ($)": materialsTotal.toFixed(2), "Equipment/Rental ($)": item.equipmentRentalCost.toFixed(2),
            "Subcontractor ($)": item.subcontractorCostLineItem.toFixed(2), "Misc Line Item ($)": item.miscLineItem.toFixed(2),
            "Other Total ($)": otherCategoryTotal.toFixed(2), "Line Total ($)": lineTotal.toFixed(2)
        };
    });

    const csv = Papa.unparse(dataForExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const exportFileName = `${(projectSettings.projectName || 'estimate').replace(/ /g, '_')}-export.csv`;
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    renderMessageBox('Estimate has been exported to CSV.');
}
