export function createUIMessage () {
    const messageDiv = document.createElement('div');
    messageDiv.id = 'uiMessage';
    messageDiv.style.position = 'absolute';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.background = 'rgba(0, 0, 0, 0.5)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.display = 'none';
    document.body.appendChild(messageDiv);

    const dialogueDiv = document.createElement('div');
    dialogueDiv.id = 'dialogueOptions';
    dialogueDiv.style.position = 'absolute';
    dialogueDiv.style.bottom = '20px';
    dialogueDiv.style.left = '50%';
    dialogueDiv.style.transform = 'translateX(-50%)';
    dialogueDiv.style.background = 'rgba(0, 0, 0, 0.7)';
    dialogueDiv.style.color = 'white';
    dialogueDiv.style.padding = '15px';
    dialogueDiv.style.borderRadius = '10px';
    dialogueDiv.style.display = 'none';
    dialogueDiv.style.maxWidth = '80%';
    dialogueDiv.style.textAlign = 'center';
    document.body.appendChild(dialogueDiv);
}

export function showUIMessage(message, isGameOver = false) {
    const uiElement = document.getElementById('uiMessage');
    if (uiElement) {
        if (message) {
            uiElement.textContent = message;
            if (isGameOver) {
                uiElement.style.position = 'fixed';
                uiElement.style.top = '50%';
                uiElement.style.left = '0';
                uiElement.style.width = '100%';
                uiElement.style.transform = 'translateY(-50%)';
                uiElement.style.background = 'rgba(0, 0, 0, 0.7)';
                uiElement.style.color = 'red';
                uiElement.style.fontSize = '48px';
                uiElement.style.fontWeight = 'bold';
                uiElement.style.textAlign = 'center';
                uiElement.style.padding = '20px';
                uiElement.style.textTransform = 'uppercase';
            } else {
                uiElement.style.position = 'absolute';
                uiElement.style.top = '50%';
                uiElement.style.left = '50%';
                uiElement.style.width = 'auto';
                uiElement.style.transform = 'translate(-50%, -50%)';
                uiElement.style.background = 'rgba(0, 0, 0, 0.5)';
                uiElement.style.color = 'white';
                uiElement.style.fontSize = '16px';
                uiElement.style.fontWeight = 'normal';
                uiElement.style.textAlign = 'center';
                uiElement.style.padding = '10px';
                uiElement.style.textTransform = 'none';
            }
            uiElement.style.display = 'block';
        } else {
            uiElement.style.display = 'none';
        }
    }
}

export function showDialogueOptions(options) {
    const dialogueElement = document.getElementById('dialogueOptions');
    if (dialogueElement) {
        dialogueElement.innerHTML = '';
        if (options && options.length > 0) {
            const p = document.createElement('p');
            p.textContent = options;
            p.style.margin = '5px';
            p.style.padding = '10px';
            p.style.background = 'rgba(0, 0, 0, 0.7)';
            p.style.borderRadius = '5px';
            p.style.color = 'white';
            dialogueElement.appendChild(p);
        }
        dialogueElement.style.display = 'block';
    }
}

export function createPetalCounter() {
    const counterDiv = document.createElement('div');
    counterDiv.id = 'petalCounter';
    counterDiv.style.position = 'fixed';
    counterDiv.style.top = '20px';
    counterDiv.style.right = '20px';
    counterDiv.style.background = 'rgba(0, 0, 0, 0.7)';
    counterDiv.style.color = 'white';
    counterDiv.style.padding = '10px';
    counterDiv.style.borderRadius = '5px';
    counterDiv.style.font = 'bold 16px Arial, sans-serif';
    document.body.appendChild(counterDiv);
    updatePetalCountUI(0);
}

export function updatePetalCountUI(count) {
    const counterDiv = document.getElementById('petalCounter');
    if (counterDiv) {
        counterDiv.textContent = `Petals: ${count} / 3`;
    }
}

export function hideDialogueOptions() {
    const dialogueElement = document.getElementById('dialogueOptions');
    if (dialogueElement) {
        dialogueElement.style.display = 'none';
    }
}

export function hideUIMessage() {
    const uiElement = document.getElementById('uiMessage');
    if (uiElement) {
        uiElement.style.display = 'none';
    }
}

function selectDialogueOption(index) {
    // logica per gestire la selezione dell'opzione di dialogo
    console.log(`Selected dialogue option: ${index}`);
    // logica per far progredire il dialogo o eseguire azioni specifiche
}