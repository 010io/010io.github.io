const MODELS = {
    tiny: { name: 'Phi-2-mini', size: '100MB', url: 'https://huggingface.co/onnx-community/Phi-2-mini' },
    small: { name: 'Phi-3-mini', size: '500MB', url: 'https://huggingface.co/microsoft/Phi-3-mini' },
    medium: { name: 'Llama-2-7B', size: '2GB', url: 'https://huggingface.co/meta-llama/Llama-2-7b' },
    large: { name: 'Llama-2-13B', size: '4GB+', url: 'https://huggingface.co/meta-llama/Llama-2-13b' }
};

let selectedModel = null;
let engine = null;

document.getElementById('model-choice').addEventListener('change', async (e) => {
    selectedModel = e.target.value;
    
    if (selectedModel === 'none') {
        document.getElementById('user-input').disabled = true;
        document.getElementById('send-btn').disabled = true;
        addMessage('system', 'LLM disabled. Chat unavailable.');
        return;
    }
    
    addMessage('system', `Loading ${MODELS[selectedModel].name} (${MODELS[selectedModel].size})...`);
    document.getElementById('user-input').disabled = true;
    document.getElementById('send-btn').disabled = true;
    
    try {
        // Simulate model loading (real implementation would use WebLLM or similar)
        await simulateModelLoad(selectedModel);
        
        addMessage('system', `✅ ${MODELS[selectedModel].name} ready. Type message.`);
        document.getElementById('user-input').disabled = false;
        document.getElementById('send-btn').disabled = false;
        
        setupChat();
    } catch (err) {
        addMessage('system', `❌ Error: ${err.message}`);
    }
});

async function simulateModelLoad(modelKey) {
    const model = MODELS[modelKey];
    const sizes = { tiny: 100, small: 500, medium: 2000, large: 4000 };
    const totalSize = sizes[modelKey];
    
    return new Promise((resolve) => {
        let loaded = 0;
        const interval = setInterval(() => {
            loaded += Math.random() * 20;
            if (loaded >= totalSize) {
                loaded = totalSize;
                clearInterval(interval);
                document.getElementById('download-progress').style.width = '100%';
                setTimeout(resolve, 500);
            } else {
                const percent = (loaded / totalSize) * 100;
                document.getElementById('download-progress').style.width = percent + '%';
                document.getElementById('download-progress').textContent = 
                    `${Math.round(percent)}% (${Math.round(loaded)}MB/${totalSize}MB)`;
            }
        }, 100);
    });
}

function setupChat() {
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('user-input');
    
    sendBtn.onclick = () => {
        const text = input.value;
        if (!text) return;
        
        addMessage('user', text);
        input.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const responses = [
                'Цікаво! Розповідь більше.',
                'Це пов\'язано з Mesh-архітектурою?',
                'Як це працює з Yana?',
                'Супер! Що далі?'
            ];
            addMessage('ai', responses[Math.floor(Math.random() * responses.length)]);
        }, 500);
    };
    
    input.onkeypress = (e) => {
        if (e.key === 'Enter') sendBtn.click();
    };
}

function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerText = text;
    document.getElementById('chat-history').appendChild(div);
    document.getElementById('chat-history').scrollTop = 9999;
}

document.querySelector('.ai-trigger').addEventListener('click', () => {
    document.getElementById('ai-interface').classList.remove('hidden');
});

document.getElementById('close-ai').addEventListener('click', () => {
    document.getElementById('ai-interface').classList.add('hidden');
});