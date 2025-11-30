import * as webllm from "https://esm.run/@mlc-ai/web-llm";

const selectedModel = "Llama-3-8B-Instruct-q4f32_1-MLC";
let engine = null;

async function initChat() {
    const chatInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');
    const progressBar = document.getElementById('download-progress');

    const initProgressCallback = (report) => {
        progressBar.style.width = `${report.progress * 100}%`;
        progressBar.innerText = report.text;
    };

    try {
        addMessage("system", "Завантаження ядра ШІ... Це займе час лише перший раз.");
        
        engine = await webllm.CreateMLCEngine(
            selectedModel,
            { initProgressCallback: initProgressCallback }
        );

        addMessage("system", "Ядро 010io-AI активне. Готовий до роботи.");
        chatInput.disabled = false;
        sendBtn.disabled = false;
        progressBar.style.display = 'none';

        await engine.chat.completions.create({
            messages: [{ role: "system", content: "Ти — цифровий асистент 010io. Ти експерт з Mesh-мереж, Termux та філософії Yana BiTransparent. Відповідай коротко і по суті." }]
        });

    } catch (err) {
        addMessage("system", "Помилка WebGPU: " + err.message);
    }

    sendBtn.onclick = async () => {
        const text = chatInput.value;
        if (!text) return;

        addMessage("user", text);
        chatInput.value = '';

        const reply = await engine.chat.completions.create({
            messages: [{ role: "user", content: text }]
        });
        
        addMessage("ai", reply.choices[0].message.content);
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
    if (!engine) initChat();
});

document.getElementById('close-ai').addEventListener('click', () => {
    document.getElementById('ai-interface').classList.add('hidden');
});