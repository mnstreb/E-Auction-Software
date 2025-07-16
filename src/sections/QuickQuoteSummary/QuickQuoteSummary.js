// src/sections/QuickQuoteSummary/QuickQuoteSummary.js

// Change to ES Module export
export default (function() {

    let projectSettings;
    let formatCurrency;
    let formatHours;
    let isDarkTheme;
    let quickQuoteItems = []; // Local array for quick quote items

    // UI Elements
    let totalProposalElem; 
    let qqProjectSubtotalElem; // NEW: Reference for the Project Subtotal element
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
        qqProjectSubtotalElem = document.getElementById('qqProjectSubtotal'); // NEW: Get reference
        overheadInput = document.getElementById('qqOverhead');
        materialMarkupInput = document.getElementById('qqMaterialMarkup');
        profitMarginInput = document.getElementById('qqProfitMargin');
        additionalAdderInput = document.getElementById('qqAdditionalAdder');
        addItemBtn = document.getElementById('qqAddItemDropdownBtn');
        addItemMenu = document.getElementById('qqAddItemDropdownMenu');
        tableBody = document.getElementById('qqEstimateTableBody'); // Get reference to the table body

        console.log("QuickQuoteSummary.js: addItemBtn found?", addItemBtn); 
        console.log("QuickQuoteSummary.js: addItemMenu found?", addItemMenu); 
        console.log("QuickQuoteSummary.js: tableBody found?", tableBody);
        console.log("QuickQuoteSummary.js: qqProjectSubtotalElem found?", qqProjectSubtotalElem);


        // Attach Event Listeners for financial settings
        [overheadInput, materialMarkupInput, profitMarginInput, additionalAdderInput].forEach(input => {
            if(input) input.addEventListener('change', calculateTotals);
        });

        // Attach Event Listener for the main "Add Item" button
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

        // Attach Event Listener for the dropdown menu items (using delegation)
        if(addItemMenu) {
            console.log("QuickQuoteSummary.js: Attaching click listener to addItemMenu for dropdown items.");
            addItemMenu.addEventListener('click', (e) => {
                e.stopPropagation(); // Add stopPropagation here to prevent immediate re-opening
                // Find the closest dropdown-item ancestor to ensure the click is on an actual item
                const dropdownItem = e.target.closest('.dropdown-item');
                if (dropdownItem) {
                    console.log("QuickQuoteSummary.js: Dropdown item clicked:", dropdownItem.dataset.itemType);
                    const type = dropdownItem.dataset.itemType;
                    addItem(type);
                    addItemMenu.classList.remove('show'); // Close menu after selection
                }
            });
        } else {
            console.error("QuickQuoteSummary.js: addItemMenu not found after init. Check HTML ID.");
        }

        // Global click listener to close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (addItemMenu && addItemBtn && addItemMenu.classList.contains('show') &&
                !addItemBtn.contains(e.target) && !addItemMenu.contains(e.target)) {
                console.log("QuickQuoteSummary.js: Closing dropdown due to outside click.");
                addItemMenu.classList.remove('show');
            }
        });

        // *** IMPORTANT: Event delegation for table inputs and buttons ***
        // This replaces all inline onchange/onclick attributes in the rendered HTML
        if (tableBody) {
            console.log("QuickQuoteSummary.js: Attaching event delegation listeners to tableBody.");
            
            // Listener for 'change' events on inputs within the table
            tableBody.addEventListener('change', (e) => {
                const target = e.target;
                const row = target.closest('tr');
                if (!row) return; // Ensure we are inside a row
                const itemId = parseInt(row.dataset.id);

                if (target.matches('input[data-field="description"]')) {
                    updateItem(itemId, 'description', target.value);
                } else if (target.matches('input[data-field="totalAmount"]')) {
                    updateItem(itemId, 'totalAmount', target.value);
                }
            });

            // Listener for 'click' events on buttons within the table
            tableBody.addEventListener('click', (e) => {
                const target = e.target;
                const row = target.closest('tr');
                if (!row) return; // Ensure we are inside a row
                const itemId = parseInt(row.dataset.id);

                if (target.matches('button[data-action="delete"]')) { // Delete button
                    deleteItem(itemId);
                }
            });
        } else {
            console.error("QuickQuoteSummary.js: tableBody not found after init. Check HTML ID.");
        }
        
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
        if (!tableBody) { // Safety check if tableBody wasn't found during init
            console.error("QuickQuoteSummary.js: tableBody is null, cannot render.");
            return;
        }
        tableBody.innerHTML = ''; // Clear existing content

        if (quickQuoteItems.length === 0) {
            const noItemsRow = document.createElement('tr');
            noItemsRow.innerHTML = `<td colspan="4" class="text-center text-gray-500 italic py-4">No quick quote items added yet. Click "Add Item" to begin!</td>`;
            tableBody.appendChild(noItemsRow);
        }

        quickQuoteItems.forEach(item => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', item.id);
            
            // Removed inline onchange/onclick attributes.
            // Data attributes (data-field, data-action) are used for event delegation.
            row.innerHTML = `
                <td><input type="text" class="input-field" value="${item.description}" data-field="description"></td>
                <td><span class="font-semibold text-gray-700">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span></td>
                <td><input type="text" class="input-field" value="${formatCurrency(item.totalAmount)}" data-field="totalAmount"></td>
                <td><button class="btn btn-red btn-sm" data-action="delete">&times;</button></td>
            `;
            tableBody.appendChild(row);
        });
        calculateTotals();
    }

    function calculateTotals() {
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
        
        // NEW: Update the Project Subtotal element
        if (qqProjectSubtotalElem) {
            qqProjectSubtotalElem.textContent = formatCurrency(totalDirectCost);
        }

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

        // Update global projectSettings for AppHeader and saving purposes
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
    
    // Expose necessary functions to be called from outside (e.g., index.html)
    return {
        init: init,
        updateItem: updateItem, 
        deleteItem: deleteItem, 
        calculateTotals: calculateTotals,
        getQuickQuoteItems: () => quickQuoteItems,
        getQuickQuoteSettings: () => ({
            overhead: parseFloat(overheadInput.value) || 0,
            materialMarkup: parseFloat(materialMarkupInput.value) || 0,
            profitMargin: parseFloat(profitMarginInput.value) || 0,
            miscellaneous: parseFloat(additionalAdderInput.value) || 0,
        }),
    };

})();
