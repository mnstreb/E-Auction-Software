// js/messageBox.js

function renderMessageBox(message, onConfirmCallback = null, isConfirm = false) {
    const messageBoxOverlay = document.createElement('div');
    messageBoxOverlay.id = 'messageBoxOverlay';
    messageBoxOverlay.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1001] backdrop-filter backdrop-blur-sm';
    
    const messageBox = document.createElement('div');
    messageBox.className = 'bg-white rounded-xl p-8 shadow-2xl max-w-sm mx-auto text-center';
    
    let buttonsHtml = `<button class="btn btn-primary" onclick="closeMessageBox()">OK</button>`;
    if (isConfirm) {
        buttonsHtml = `
            <button class="btn btn-red mr-3" id="confirmYesBtn">Yes</button>
            <button class="btn btn-primary" onclick="closeMessageBox()">No</button>
        `;
    }

    messageBox.innerHTML = `
        <p class="text-lg font-semibold text-gray-800 mb-6">${message}</p>
        <div class="flex justify-center gap-3">
            ${buttonsHtml}
        </div>
    `;
    messageBoxOverlay.appendChild(messageBox);
    document.body.appendChild(messageBoxOverlay);

    if (isConfirm && onConfirmCallback) {
        document.getElementById('confirmYesBtn').addEventListener('click', onConfirmCallback);
    }
}

function closeMessageBox() {
    const messageBoxOverlay = document.getElementById('messageBoxOverlay');
    if (messageBoxOverlay) {
        messageBoxOverlay.remove();
    }
}
