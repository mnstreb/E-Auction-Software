// src/sections/QuickQuoteSummary/QuickQuoteSummary.js

window.QuickQuoteSummary = (function() {

    let projectSettings;
    let formatCurrency;
    let formatHours;
    let isDarkTheme;
    let quickQuoteItems = []; // Local array for quick quote items

    // UI Elements
    let totalProposalElem, totalHoursElem;
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
        totalHoursElem = document.getElementById('qqTotalHours');
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

        document.addEventListener('click', () => {
            if (addItemMenu && addItemMenu.classList.contains('show')) {
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
            type: type, // 'labor', 'material', or 'other'
            description: `New ${type} item`,
            qty: (type === 'labor') ? 8 : 1, // Default hours for labor, qty for others
            unitCost: (type === 'labor') ? 75 : 100, // Avg labor rate, default cost for others
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
            } else {
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
            
            let qtyLabel = 'Qty';
            let qtyValue = item.qty;
            let qtyField = 'qty';

            if(item.type === 'labor') {
                qtyLabel = 'Hours';
                qtyValue = item.qty; // For labor, qty represents hours
                qtyField = 'qty';
            }

            row.innerHTML = `
                <td><input type="text" class="input-field" value="${item.description}" onchange="window.QuickQuoteSummary.updateItem(${item.id}, 'description', this.value)"></td>
                <td><input type="number" class="input-field" value="${qtyValue}" onchange="window.QuickQuoteSummary.updateItem(${item.id}, '${qtyField}', this.value)" aria-label="${qtyLabel}"></td>
                <td><input type="number" class="input-field" value="${item.unitCost}" onchange="window.QuickQuoteSummary.updateItem(${item.id}, 'unitCost', this.value)"></td>
                <td class="font-semibold text-right" id="total-${item.id}"></td>
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
        let directOtherCost = 0;
        let totalHours = 0;
        
        quickQuoteItems.forEach(item => {
            let itemTotal = 0;
            if (item.type === 'labor') {
                itemTotal = item.qty * item.unitCost; // hours * rate
                directLaborCost += itemTotal;
                totalHours += item.qty;
            } else if (item.type === 'material') {
                itemTotal = item.qty * item.unitCost;
                directMaterialCost += itemTotal;
            } else { // 'other'
                itemTotal = item.qty * item.unitCost;
                directOtherCost += itemTotal;
            }
            const totalElem = document.getElementById(`total-${item.id}`);
            if(totalElem) {
                totalElem.textContent = formatCurrency(itemTotal);
            }
        });

        const materialMarkupAmount = directMaterialCost * (projectSettings.materialMarkup / 100);
        const totalDirectCost = directLaborCost + directMaterialCost + directOtherCost;
        
        const baseForMarkups = totalDirectCost + materialMarkupAmount;
        
        const overheadAmount = baseForMarkups * (projectSettings.overhead / 100);
        const additionalAdderAmount = baseForMarkups * (projectSettings.miscellaneous / 100);
        
        const subtotal = baseForMarkups + overheadAmount + additionalAdderAmount;
        const profitAmount = subtotal * (projectSettings.profitMargin / 100);
        
        const grandTotal = subtotal + profitAmount;

        // Update the main summary UI
        totalProposalElem.textContent = formatCurrency(grandTotal);
        totalHoursElem.textContent = formatHours(totalHours);
    }
    
    // Expose necessary functions to be called from HTML
    window.QuickQuoteSummary.updateItem = updateItem;
    window.QuickQuoteSummary.deleteItem = deleteItem;

    return {
        init: init
    };

})();

