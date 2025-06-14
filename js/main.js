// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // Initial setup - show wizard
    window.app.showSetup();
    // Set initial sales tax based on default state
    document.getElementById('projectState').addEventListener('change', (event) => {
        window.app.updateSalesTaxForState(event.target.value);
    });

    // Event listener for trade search input
    uiElements.tradeSearchInput.addEventListener('input', window.app.populateTradesDropdown);

    // Event listener for clicks on selectedTradesDisplay to handle tag removal
    uiElements.selectedTradesDisplay.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-tag')) {
            const tradeToRemove = event.target.dataset.trade;
            const checkboxId = `trade-${tradeToRemove.replace(/\s/g, '-')}`;
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = false;
                window.app.handleTradeSelection(checkbox);
            }
        }
    });

    // Event listener for logo upload input
    uiElements.logoUploadInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            window.app.handleFile(this.files[0]);
        }
    });
});
