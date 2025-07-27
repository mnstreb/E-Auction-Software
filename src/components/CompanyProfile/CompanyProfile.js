// src/components/CompanyProfile/CompanyProfile.js

window.CompanyProfile = (function() {
    let modal;
    let ownerNameInput, ownerAddressInput, ownerCityInput, ownerZipInput, ownerEmailInput;
    let onSaveCallback;

    function init(config) {
        modal = document.getElementById('companyProfileModal');
        ownerNameInput = document.getElementById('ownerName');
        ownerAddressInput = document.getElementById('ownerAddress');
        ownerCityInput = document.getElementById('ownerCity');
        ownerZipInput = document.getElementById('ownerZip');
        ownerEmailInput = document.getElementById('ownerEmail');
        
        onSaveCallback = config.onSave;

        document.getElementById('saveCompanyProfileBtn').addEventListener('click', saveData);
        document.getElementById('cancelCompanyProfileBtn').addEventListener('click', hide);
    }

    function show(companyData) {
        if (companyData) {
            ownerNameInput.value = companyData.ownerName || '';
            ownerAddressInput.value = companyData.ownerAddress || '';
            ownerCityInput.value = companyData.ownerCity || '';
            ownerZipInput.value = companyData.ownerZip || '';
            ownerEmailInput.value = companyData.ownerEmail || '';
        }
        modal.classList.add('show');
    }

    function hide() {
        modal.classList.remove('show');
    }

    function saveData() {
        const companyData = {
            ownerName: ownerNameInput.value.trim(),
            ownerAddress: ownerAddressInput.value.trim(),
            ownerCity: ownerCityInput.value.trim(),
            ownerZip: ownerZipInput.value.trim(),
            ownerEmail: ownerEmailInput.value.trim()
        };
        onSaveCallback(companyData);
        hide();
    }

    return { init, show, hide };
})();
