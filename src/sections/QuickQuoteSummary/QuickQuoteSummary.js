// src/sections/QuickQuoteSummary/QuickQuoteSummary.js

window.QuickQuoteSummary = (function() {

    let projectSettings;
    let formatCurrency;
    let formatHours;
    let isDarkTheme;
    let quickQuoteItems = []; // Local array for quick quote items

    // UI Elements
    let totalProposalElem; 
    let overheadInput, materialMarkupInput, profitMarginInput, additionalAdderInput;
    let addItemBtn, addItemMenu;
    let tableBody;

    function init(config) {
        console.log("QuickQuoteSummary.js: init started."); 
        projectSettings = config.projectSettings;
        formatCurrency = config.formatCurrency;
        formatHours = config.formatHours;
        isDarkTheme = config.isDarkTheme;

        // Get UI Element References
        totalProposalElem = document.getElementById('qqTotalProposal');
        overheadInput = document.getElementById('qqOverhead');
        materialMarkupInput = document.getElementById('qqMaterialMarkup');
        profitMarginInput = document.getElementById('qqProfitMargin');
        additionalAdderInput = document.getElementById('qqAdditionalAdder');
        addItemBtn = document.getElementById('qqAddItemDropdownBtn');
        addItemMenu = document.getElementById('qqAddItemDropdownMenu');
        tableBody = document.getElementById('qqEstimateTableBody');

        console.log("QuickQuoteSummary.js: addItemBtn found?", addItemBtn); 
        console.log("QuickQuoteSummary.js: addItemMenu found?", addItemMenu); 

        // Attach Event Listeners
        [overheadInput, materialMarkupInput, profitMarginInput, additionalAdderInput].forEach(input => {
            if(input) input.addEventListener('change', calculateTotals);
        });

        if(addItemBtn) {
            console.log("QuickQuoteSummary.js: Attaching click listener to addItemBtn."); 
            addItemBtn.addEventListener('click', (e) => {
                console.log("QuickQuoteSummary.js: Add Item button clicked!"); 
                e.stopPropagation(); // Prevent this click from immediately bubbling to document and closing
                addItemMenu.classList.toggle('show');
            });
        } else {
            console.error("QuickQuoteSummary.js: addItemBtn not found after init. Check HTML ID.");
        }

        if(addItemMenu) {
            console.log("QuickQuoteSummary.js: Attaching click listener to addItemMenu for dropdown items.");
            addItemMenu.addEventListener('click', (e) => {
                if (e.target.matches('.dropdown-item')) {
                    console.log("QuickQuoteSummary.js: Dropdown item clicked:", e.target.dataset.itemType);
                    const type = e.target.dataset.itemType;
                    addItem(type);
                    addItemMenu.classList.remove('show'); // Close menu after selection
                }
            });
        } else {
            console.error("QuickQuoteSummary.js: addItemMenu not found after init. Check HTML ID.");
        }

        document.addEventListener('click', (e) => {
            // Close dropdown if click is outside the button and menu
            // Ensure addItemBtn and addItemMenu exist before checking contains
            if (addItemMenu && addItemBtn && addItemMenu.classList.contains('show') &&
                !addItemBtn.contains(e.target) && !addItemMenu.contains(e.target)) {
                console.log("QuickQuoteSummary.js: Closing dropdown due to outside click.");
                addItemMenu.classList.remove('show');
            }
        });
        
        // Initial render of the table (even if empty)
        render(); 
    }

    function addItem(type) {
        console.log("QuickQuoteSummary.js: Adding item of type:", type);
        const newItem = {
            id: Date.now(),
            type: type, // 'labor', 'material', 'equipment', or 'other'
            description: `New ${type} item`,
            totalAmount: (type === 'labor') ? 600 : (type === 'material') ? 250 : (type === 'equipment') ? 150 : 100,
        };
        quickQuoteItems.push(newItem);
        render();
    }

    function deleteItem(id) {
        console.log("QuickQuoteSummary.js: Deleting item with ID:", id);
        quickQuoteItems = quickQuoteItems.filter(item => item.id !== id);
        render();
    }
    
    function updateItem(id, field, value) {
        console.log(`QuickQuoteSummary.js: Updating item ${id}, field ${field} to ${value}`);
        const item = quickQuoteItems.find(item => item.id === id);
        if (item) {
            if (field === 'description') {
                item[field] = value;
            } else if (field === 'totalAmount') {
                item[field] = parseFloat(value) || 0;
            }
        }
        calculateTotals();
    }

    function render() {
        console.log("QuickQuoteSummary.js: Rendering items. Current items:", quickQuoteItems.length);
        tableBody.innerHTML = '';
        if (quickQuoteItems.length === 0) {
            const noItemsRow = document.createElement('tr');
            noItemsRow.innerHTML = `<td colspan="4" class="text-center text-gray-500 italic py-4">No quick quote items added yet. Click "Add Item" to begin!</td>`;
            tableBody.appendChild(noItemsRow);
        }

        quickQuoteItems.forEach(item => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', item.id);
            
            row.innerHTML = `
                <td><input type="text" class="input-field" value="${item.description}" onchange="window.QuickQuoteSummary.updateItem(${item.id}, 'description', this.value)"></td>
                <td><span class="font-semibold text-gray-700">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span></td>
                <td><input type="number" class="input-field" value="${item.totalAmount}" onchange="window.QuickQuoteSummary.updateItem(${item.id}, 'totalAmount', this.value)"></td>
                <td><button class="btn btn-red btn-sm" onclick="window.QuickQuoteSummary.deleteItem(${item.id})">&times;</button></td>
            `;
            tableBody.appendChild(row);
        });
        calculateTotals();
    }

    function calculateTotals() {
        // ... (existing calculateTotals logic) ...
        console.log("QuickQuoteSummary.js: Calculating totals.");

        projectSettings.overhead = parseFloat(overheadInput.value) || 0;
        projectSettings.materialMarkup = parseFloat(materialMarkupInput.value) || 0;
        projectSettings.profitMargin = parseFloat(profitMarginInput.value) || 0;
        projectSettings.miscellaneous = parseFloat(additionalAdderInput.value) || 0;

        let directLaborCost = 0;
        let directMaterialCost = 0;
        let directEquipmentCost = 0;
        let directOtherCost = 0;
        let totalHours = 0;

        quickQuoteItems.forEach(item => {
            if (item.type === 'labor') {
                directLaborCost += item.totalAmount;
                totalHours += item.totalAmount / (projectSettings.allTradeLaborRates?.General?.Journeyman || 75);
            } else if (item.type === 'material') {
                directMaterialCost += item.totalAmount;
            } else if (item.type === 'equipment') {
                directEquipmentCost += item.totalAmount;
            } else {
                directOtherCost += item.totalAmount;
            }
        });

        const materialMarkupAmount = directMaterialCost * (projectSettings.materialMarkup / 100);
        const totalDirectCost = directLaborCost + directMaterialCost + directEquipmentCost + directOtherCost;
        const baseForMarkups = totalDirectCost + materialMarkupAmount;
        const overheadAmount = baseForMarkups * (projectSettings.overhead / 100);
        const additionalAdderAmount = baseForMarkups * (projectSettings.miscellaneous / 100);
        const subtotal = baseForMarkups + overheadAmount + additionalAdderAmount;
        const profitAmount = subtotal * (projectSettings.profitMargin / 100);
        const grandTotal = subtotal + profitAmount;

        totalProposalElem.textContent = formatCurrency(grandTotal);
        const appHeaderTotalHoursElem = document.getElementById('summaryOverallLaborHours');
        if (appHeaderTotalHoursElem) {
            appHeaderTotalHoursElem.textContent = formatHours(totalHours);
        }

        window.projectSettings.grandTotal = grandTotal;
        window.projectSettings.totalLaborCost = directLaborCost;
        window.projectSettings.totalMaterialCostRaw = directMaterialCost;
        window.projectSettings.totalEquipmentCost = directEquipmentCost;
        window.projectSettings.totalSubcontractorCost = 0;
        window.projectSettings.totalMiscLineItemCosts = directOtherCost;
        window.projectSettings.overallLaborHoursSum = totalHours;
        window.projectSettings.materialMarkupAmount = materialMarkupAmount;
        window.projectSettings.totalOverheadCost = overheadAmount;
        window.projectSettings.totalMiscCostAmount = additionalAdderAmount;
        window.projectSettings.estimateSubtotalAmount = subtotal;
        window.projectSettings.totalProfitMarginAmount = profitAmount;
    }
    
    window.QuickQuoteSummary.updateItem = updateItem;
    window.QuickQuoteSummary.deleteItem = deleteItem;
    window.QuickQuoteSummary.calculateTotals = calculateTotals;
    window.QuickQuoteSummary.getQuickQuoteItems = () => quickQuoteItems;
    window.QuickQuoteSummary.getQuickQuoteSettings = () => ({
        overhead: parseFloat(overheadInput.value) || 0,
        materialMarkup: parseFloat(materialMarkupInput.value) || 0,
        profitMargin: parseFloat(profitMarginInput.value) || 0,
        miscellaneous: parseFloat(additionalAdderInput.value) || 0,
    });

    return {
        init: init
    };

})();
