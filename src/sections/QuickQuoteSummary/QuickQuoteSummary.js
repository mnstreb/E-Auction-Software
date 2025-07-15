// src/sections/QuickQuoteSummary/QuickQuoteSummary.js

window.QuickQuoteSummary = (function() {

    let projectSettings;
    let formatCurrency;
    let formatHours;
    let isDarkTheme;
    let quickQuoteItems = []; // Local array for quick quote items

    // UI Elements
    let totalProposalElem; // Removed totalHoursElem as it's no longer directly calculated/displayed here
    let overheadInput, materialMarkupInput, profitMarginInput, additionalAdderInput;
    let addItemBtn, addItemMenu;
    let tableBody;

    function init(config) {
        projectSettings = config.projectSettings;
        formatCurrency = config.formatCurrency;
        formatHours = config.formatHours;
        isDarkTheme = config.isDarkTheme;

        // Get UI Element References
        totalProposalElem = document.getElementById('qqTotalProposal');
        // totalHoursElem = document.getElementById('qqTotalHours'); // Removed
        overheadInput = document.getElementById('qqOverhead');
        materialMarkupInput = document.getElementById('qqMaterialMarkup');
        profitMarginInput = document.getElementById('qqProfitMargin');
        additionalAdderInput = document.getElementById('qqAdditionalAdder');
        addItemBtn = document.getElementById('qqAddItemDropdownBtn');
        addItemMenu = document.getElementById('qqAddItemDropdownMenu');
        tableBody = document.getElementById('qqEstimateTableBody');

        // Attach Event Listeners
        [overheadInput, materialMarkupInput, profitMarginInput, additionalAdderInput].forEach(input => {
            if(input) input.addEventListener('change', calculateTotals);
        });

        if(addItemBtn) {
            addItemBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addItemMenu.classList.toggle('show');
            });
        }

        if(addItemMenu) {
            addItemMenu.addEventListener('click', (e) => {
                if (e.target.matches('.dropdown-item')) {
                    const type = e.target.dataset.itemType;
                    addItem(type);
                    addItemMenu.classList.remove('show');
                }
            });
        }

        document.addEventListener('click', (e) => {
            // Close dropdown if click is outside the button and menu
            if (addItemMenu && addItemMenu.classList.contains('show') &&
                !addItemBtn.contains(e.target) && !addItemMenu.contains(e.target)) {
                addItemMenu.classList.remove('show');
            }
        });
        
        // Initial render
        if (quickQuoteItems.length === 0) {
            addItem('labor'); // Start with one labor item
        } else {
            render();
        }
    }

    function addItem(type) {
        const newItem = {
            id: Date.now(),
            type: type, // 'labor', 'material', 'equipment', or 'other'
            description: `New ${type} item`,
            // Set a default totalAmount based on type
            totalAmount: (type === 'labor') ? 600 : (type === 'material') ? 250 : (type === 'equipment') ? 150 : 100,
        };
        quickQuoteItems.push(newItem);
        render();
    }

    function deleteItem(id) {
        quickQuoteItems = quickQuoteItems.filter(item => item.id !== id);
        render();
    }
    
    function updateItem(id, field, value) {
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
        tableBody.innerHTML = '';
        quickQuoteItems.forEach(item => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', item.id);
            
            row.innerHTML = `
                <td><input type="text" class="input-field" value="${item.description}" onchange="window.QuickQuoteSummary.updateItem(${item.id}, 'description', this.value)"></td>
                <td><span class="font-semibold text-gray-700">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span></td> <!-- Display Type -->
                <td><input type="number" class="input-field" value="${item.totalAmount}" onchange="window.QuickQuoteSummary.updateItem(${item.id}, 'totalAmount', this.value)"></td>
                <td><button class="btn btn-red btn-sm" onclick="window.QuickQuoteSummary.deleteItem(${item.id})">&times;</button></td>
            `;
            tableBody.appendChild(row);
        });
        calculateTotals();
    }

    function calculateTotals() {
        // Update projectSettings from the dashboard inputs
        projectSettings.overhead = parseFloat(overheadInput.value) || 0;
        projectSettings.materialMarkup = parseFloat(materialMarkupInput.value) || 0;
        projectSettings.profitMargin = parseFloat(profitMarginInput.value) || 0;
        projectSettings.miscellaneous = parseFloat(additionalAdderInput.value) || 0;

        let directLaborCost = 0;
        let directMaterialCost = 0;
        let directEquipmentCost = 0; // New for equipment
        let directOtherCost = 0;
        let totalHours = 0; // Still calculating for potential display in AppHeader/Saving

        quickQuoteItems.forEach(item => {
            if (item.type === 'labor') {
                directLaborCost += item.totalAmount;
                totalHours += item.totalAmount / (projectSettings.allTradeLaborRates?.General?.Journeyman || 75); // Estimate hours based on default rate
            } else if (item.type === 'material') {
                directMaterialCost += item.totalAmount;
            } else if (item.type === 'equipment') { // Handle equipment
                directEquipmentCost += item.totalAmount;
            } else { // 'other'
                directOtherCost += item.totalAmount;
            }
        });

        // Ensure totalHoursElem is updated (even if not directly visible)
        // if (totalHoursElem) totalHoursElem.textContent = formatHours(totalHours); // Removed from QQ summary, but still calculated for global projectSettings

        const materialMarkupAmount = directMaterialCost * (projectSettings.materialMarkup / 100);
        // Sum all direct costs including new equipment cost
        const totalDirectCost = directLaborCost + directMaterialCost + directEquipmentCost + directOtherCost;
        
        const baseForMarkups = totalDirectCost + materialMarkupAmount;
        
        const overheadAmount = baseForMarkups * (projectSettings.overhead / 100);
        const additionalAdderAmount = baseForMarkups * (projectSettings.miscellaneous / 100);
        
        const subtotal = baseForMarkups + overheadAmount + additionalAdderAmount;
        const profitAmount = subtotal * (projectSettings.profitMargin / 100);
        
        const grandTotal = subtotal + profitAmount;

        // Update the main summary UI
        totalProposalElem.textContent = formatCurrency(grandTotal);
        // Update total hours display in the AppHeader if it's visible
        const appHeaderTotalHoursElem = document.getElementById('summaryOverallLaborHours');
        if (appHeaderTotalHoursElem) {
            appHeaderTotalHoursElem.textContent = formatHours(totalHours);
        }


        // Update global projectSettings for AppHeader and saving purposes
        // This ensures the main index.html has the latest totals from QuickQuoteSummary
        window.projectSettings.grandTotal = grandTotal;
        window.projectSettings.totalLaborCost = directLaborCost;
        window.projectSettings.totalMaterialCostRaw = directMaterialCost;
        window.projectSettings.totalEquipmentCost = directEquipmentCost; // Pass equipment cost
        window.projectSettings.totalSubcontractorCost = 0; // Quick quote doesn't track this separately
        window.projectSettings.totalMiscLineItemCosts = directOtherCost; // Lump 'other' into misc
        window.projectSettings.overallLaborHoursSum = totalHours;
        window.projectSettings.materialMarkupAmount = materialMarkupAmount;
        window.projectSettings.totalOverheadCost = overheadAmount;
        window.projectSettings.totalMiscCostAmount = additionalAdderAmount; // Quick quote's 'additionalAdder' maps to misc for detailed calculations
        window.projectSettings.estimateSubtotalAmount = subtotal;
        window.projectSettings.totalProfitMarginAmount = profitAmount;
        // Sales tax and discount are not managed in QuickQuoteSummary, they come from projectSettings defaults.
        // additionalConsiderationsType and Value are also not managed here, so they'll be defaults from projectSettings.
    }
    
    // Expose necessary functions to be called from HTML
    window.QuickQuoteSummary.updateItem = updateItem;
    window.QuickQuoteSummary.deleteItem = deleteItem;
    window.QuickQuoteSummary.calculateTotals = calculateTotals; // Expose for index.html to trigger
    window.QuickQuoteSummary.getQuickQuoteItems = () => quickQuoteItems; // Expose quickQuoteItems for saving
    window.QuickQuoteSummary.getQuickQuoteSettings = () => ({ // Expose current settings from QQ inputs
        overhead: parseFloat(overheadInput.value) || 0,
        materialMarkup: parseFloat(materialMarkupInput.value) || 0,
        profitMargin: parseFloat(profitMarginInput.value) || 0,
        miscellaneous: parseFloat(additionalAdderInput.value) || 0,
    });

    return {
        init: init
    };

})();
