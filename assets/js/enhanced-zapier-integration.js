// Покращена інтеграція з Zapier Chat для 010io
class EnhancedZapierIntegration {
    constructor(chatbotId = 'cm4mf6c1q0001131mpgknchkh') {
        this.chatbotId = chatbotId;
        this.isInitialized = false;
        this.chatHistory = [];
        this.userPreferences = this.loadUserPreferences();
        this.analytics = {
            sessionsStarted: 0,
            messagesExchanged: 0,
            averageSessionTime: 0,
            popularQuestions: new Map()
        };
        
        this.initializeEnhancedChat();
    }

    // Ініціалізація покращеного чату
    async initializeEnhancedChat() {
        try {
            // Очікування завантаження Zapier скрипту
            await this.waitForZapierLoad();
            
            // Налаштування покращеного інтерфейсу
            this.setupEnhancedInterface();
            
            // Ініціалізація аналітики
            this.initializeAnalytics();
            
            // Налаштування автоматичних повідомлень
            this.setupAutoMessages();
            
            this.isInitialized = true;
            console.log('010io Enhanced Chat ініціалізовано успішно');
            
        } catch (error) {
            console.error('Помилка ініціалізації чату:', error);
        }
    }

    // Очікування завантаження Zapier
    waitForZapierLoad() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkZapier = () => {
                attempts++;
                
                if (window.zapierChat) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Zapier Chat не завантажився'));
                } else {
                    setTimeout(checkZapier, 200);
                }
            };
            
            checkZapier();
        });
    }

    // Налаштування покращеного інтерфейсу
    setupEnhancedInterface() {
        // Створення кастомного інтерфейсу поверх Zapier
        this.createCustomChatInterface();
        
        // Додавання швидких команд
        this.addQuickCommands();
        
        // Налаштування тем оформлення
        this.setupThemes();
        
        // Додавання клавіатурних скорочень
        this.setupKeyboardShortcuts();
    }

    // Створення кастомного інтерфейсу
    createCustomChatInterface() {
        const chatContainer = document.createElement('div');
        chatContainer.id = 'enhanced-chat-container';
        chatContainer.className = 'enhanced-chat-container';
        chatContainer.innerHTML = `
            <div class="chat-header">
                <div class="chat-title">
                    <span class="chat-icon">🤖</span>
                    <span class="chat-name">010io-GPT</span>
                    <span class="chat-status" id="chat-status">Готовий до роботи</span>
                </div>
                <div class="chat-controls">
                    <button class="chat-btn" id="chat-minimize" title="Згорнути">−</button>
                    <button class="chat-btn" id="chat-close" title="Закрити">×</button>
                </div>
            </div>
            <div class="chat-quick-actions">
                <button class="quick-action" data-action="projects">🚀 Мої проекти</button>
                <button class="quick-action" data-action="skills">💻 Навички</button>
                <button class="quick-action" data-action="contact">📧 Контакти</button>
                <button class="quick-action" data-action="help">❓ Допомога</button>
            </div>
            <div class="chat-suggestions" id="chat-suggestions">
                <div class="suggestion-title">Популярні питання:</div>
                <div class="suggestions-list" id="suggestions-list"></div>
            </div>
        `;

        // Додавання обробників подій
        this.setupChatEventListeners(chatContainer);
        
        // Приховування за замовчуванням
        chatContainer.style.display = 'none';
        document.body.appendChild(chatContainer);
    }

    // Налаштування обробників подій
    setupChatEventListeners(container) {
        // Швидкі дії
        container.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Керування вікном чату
        container.querySelector('#chat-minimize').addEventListener('click', () => {
            this.minimizeChat();
        });

        container.querySelector('#chat-close').addEventListener('click', () => {
            this.closeChat();
        });
    }

    // Обробка швидких дій
    handleQuickAction(action) {
        const responses = {
            projects: "Ось мої основні проекти:\n\n🤖 AI Chatbot - розумний чат-бот\n🎵 Voice Translation - голосовий переклад\n🔧 Mesh API CLI - інструменти для mesh мереж\n📱 Universal Reader - режим читання\n\nПро який проект хочете дізнатися більше?",
            
            skills: "Мої основні навички:\n\n💻 Програмування: Python, JavaScript, PowerShell\n🤖 AI/ML: PyTorch, TensorFlow, LangChain\n📱 Мобільна розробка: Android, Termux\n🌐 Веб: HTML/CSS, Node.js, API\n🔧 DevOps: Git, CI/CD, Docker\n\nЯкі технології вас цікавлять?",
            
            contact: "Зв'язатися зі мною можна через:\n\n📧 Email: contact@010io.com\n🐦 Twitter: @X010io\n📱 Telegram: @t010io\n🦋 Bluesky: @010io.bsky.social\n🎮 Discord: 010io\n\nОберіть зручний спосіб зв'язку!",
            
            help: "Я можу допомогти з:\n\n❓ Відповіді про мої проекти\n💡 Технічні консультації\n🔧 Рекомендації щодо технологій\n📚 Навчальні матеріали\n🤝 Співпраця\n\nПро що хочете запитати?"
        };

        this.sendPredefinedMessage(responses[action]);
        this.trackQuickAction(action);
    }

    // Відправка заздалегідь визначеного повідомлення
    sendPredefinedMessage(message) {
        if (window.zapierChat && window.zapierChat.sendMessage) {
            window.zapierChat.sendMessage(message);
        } else {
            // Альтернативний спосіб - симуляція введення
            this.simulateUserInput(message);
        }
    }

    // Симуляція введення користувача
    simulateUserInput(message) {
        const chatInput = document.querySelector('input[placeholder*="повідомлення"], textarea[placeholder*="повідомлення"]');
        if (chatInput) {
            chatInput.value = message;
            chatInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Пошук кнопки відправки
            const sendButton = document.querySelector('button[type="submit"], button[aria-label*="send"], button[title*="send"]');
            if (sendButton) {
                sendButton.click();
            }
        }
    }

    // Додавання швидких команд
    addQuickCommands() {
        const commands = {
            '/projects': () => this.handleQuickAction('projects'),
            '/skills': () => this.handleQuickAction('skills'),
            '/contact': () => this.handleQuickAction('contact'),
            '/help': () => this.handleQuickAction('help'),
            '/stats': () => this.showChatStats(),
            '/clear': () => this.clearChatHistory()
        };

        // Відстеження введення команд
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                const value = e.target.value.trim();
                if (commands[value]) {
                    e.preventDefault();
                    commands[value]();
                    e.target.value = '';
                }
            }
        });
    }

    // Налаштування тем
    setupThemes() {
        const themes = {
            dark: {
                '--chat-bg': '#0d1117',
                '--chat-text': '#c9d1d9',
                '--chat-border': '#21262d',
                '--chat-accent': '#58a6ff'
            },
            light: {
                '--chat-bg': '#ffffff',
                '--chat-text': '#24292f',
                '--chat-border': '#d0d7de',
                '--chat-accent': '#0969da'
            },
            blue: {
                '--chat-bg': '#0f1419',
                '--chat-text': '#e6edf3',
                '--chat-border': '#1c2128',
                '--chat-accent': '#79b8ff'
            }
        };

        // Застосування теми
        const currentTheme = this.userPreferences.theme || 'dark';
        this.applyTheme(themes[currentTheme]);
    }

    // Застосування теми
    applyTheme(theme) {
        Object.entries(theme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
    }

    // Налаштування клавіатурних скорочень
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K - відкрити чат
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openEnhancedChat();
            }
            
            // Escape - закрити чат
            if (e.key === 'Escape' && this.isChatOpen()) {
                this.closeChat();
            }
            
            // Ctrl/Cmd + Shift + C - очистити історію
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                this.clearChatHistory();
            }
        });
    }

    // Ініціалізація аналітики
    initializeAnalytics() {
        // Завантаження збережених даних
        const savedAnalytics = localStorage.getItem('010io-chat-analytics');
        if (savedAnalytics) {
            Object.assign(this.analytics, JSON.parse(savedAnalytics));
        }

        // Відстеження сесій
        this.sessionStartTime = Date.now();
        this.analytics.sessionsStarted++;
        
        // Збереження аналітики при закритті
        window.addEventListener('beforeunload', () => {
            this.saveAnalytics();
        });
    }

    // Налаштування автоматичних повідомлень
    setupAutoMessages() {
        // Привітальне повідомлення для нових користувачів
        if (!this.userPreferences.hasVisited) {
            setTimeout(() => {
                this.showWelcomeMessage();
            }, 3000);
            
            this.userPreferences.hasVisited = true;
            this.saveUserPreferences();
        }

        // Підказки через певний час
        setTimeout(() => {
            this.showHelpTips();
        }, 30000); // 30 секунд
    }

    // Показ привітального повідомлення
    showWelcomeMessage() {
        this.showNotification(
            'Привіт! 👋 Я 010io-GPT. Запитайте мене про проекти Ігоря або скористайтесь швидкими командами!',
            'info',
            5000
        );
    }

    // Показ підказок
    showHelpTips() {
        const tips = [
            'Спробуйте команду /projects для перегляду проектів',
            'Натисніть Ctrl+K для швидкого відкриття чату',
            'Використовуйте швидкі кнопки для популярних питань'
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        this.showNotification(`💡 Підказка: ${randomTip}`, 'info', 4000);
    }

    // Відкриття покращеного чату
    openEnhancedChat() {
        if (!this.isInitialized) {
            this.showNotification('Чат ще ініціалізується...', 'warning');
            return;
        }

        // Показ кастомного інтерфейсу
        const container = document.getElementById('enhanced-chat-container');
        if (container) {
            container.style.display = 'block';
            container.classList.add('chat-opening');
        }

        // Відкриття оригінального Zapier чату
        if (window.zapierChat && window.zapierChat.open) {
            window.zapierChat.open();
        }

        // Оновлення статусу
        this.updateChatStatus('Активний');
        
        // Аналітика
        this.analytics.sessionsStarted++;
        this.trackChatOpen();
    }

    // Закриття чату
    closeChat() {
        const container = document.getElementById('enhanced-chat-container');
        if (container) {
            container.style.display = 'none';
            container.classList.remove('chat-opening');
        }

        if (window.zapierChat && window.zapierChat.close) {
            window.zapierChat.close();
        }

        this.updateChatStatus('Готовий до роботи');
        this.trackChatClose();
    }

    // Згортання чату
    minimizeChat() {
        const container = document.getElementById('enhanced-chat-container');
        if (container) {
            container.classList.toggle('minimized');
        }
    }

    // Перевірка стану чату
    isChatOpen() {
        const container = document.getElementById('enhanced-chat-container');
        return container && container.style.display !== 'none';
    }

    // Оновлення статусу чату
    updateChatStatus(status) {
        const statusElement = document.getElementById('chat-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    // Показ статистики чату
    showChatStats() {
        const stats = `
📊 Статистика чату:
• Сесій розпочато: ${this.analytics.sessionsStarted}
• Повідомлень обміняно: ${this.analytics.messagesExchanged}
• Середній час сесії: ${Math.round(this.analytics.averageSessionTime / 1000)}с
• Популярні питання: ${this.getTopQuestions()}
        `;
        
        this.showNotification(stats, 'info', 8000);
    }

    // Отримання топ питань
    getTopQuestions() {
        const sorted = Array.from(this.analytics.popularQuestions.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);
        
        return sorted.map(([question, count]) => `${question} (${count})`).join(', ') || 'Немає даних';
    }

    // Очищення історії чату
    clearChatHistory() {
        this.chatHistory = [];
        this.showNotification('Історію чату очищено', 'success');
    }

    // Відстеження дій
    trackQuickAction(action) {
        console.log(`Quick Action: ${action}`);
        this.analytics.popularQuestions.set(action, (this.analytics.popularQuestions.get(action) || 0) + 1);
    }

    trackChatOpen() {
        console.log('Chat opened');
        this.sessionStartTime = Date.now();
    }

    trackChatClose() {
        console.log('Chat closed');
        if (this.sessionStartTime) {
            const sessionTime = Date.now() - this.sessionStartTime;
            this.analytics.averageSessionTime = 
                (this.analytics.averageSessionTime + sessionTime) / 2;
        }
    }

    // Збереження налаштувань користувача
    saveUserPreferences() {
        localStorage.setItem('010io-user-preferences', JSON.stringify(this.userPreferences));
    }

    // Завантаження налаштувань користувача
    loadUserPreferences() {
        const saved = localStorage.getItem('010io-user-preferences');
        return saved ? JSON.parse(saved) : {
            theme: 'dark',
            hasVisited: false,
            language: 'uk'
        };
    }

    // Збереження аналітики
    saveAnalytics() {
        const analyticsData = {
            ...this.analytics,
            popularQuestions: Array.from(this.analytics.popularQuestions.entries())
        };
        localStorage.setItem('010io-chat-analytics', JSON.stringify(analyticsData));
    }

    // Показ повідомлень
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `chat-notification chat-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Іконки повідомлень
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '💬'
        };
        return icons[type] || icons.info;
    }

    // Публічні методи для зовнішнього використання
    getAnalytics() {
        return { ...this.analytics };
    }

    setTheme(themeName) {
        this.userPreferences.theme = themeName;
        this.saveUserPreferences();
        this.setupThemes();
    }

    exportChatData() {
        return {
            history: this.chatHistory,
            analytics: this.analytics,
            preferences: this.userPreferences
        };
    }
}

// CSS стилі для покращеного чату
const enhancedChatStyles = `
    .enhanced-chat-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        max-height: 500px;
        background: var(--chat-bg, var(--bg-secondary));
        border: 1px solid var(--chat-border, var(--border-color));
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .enhanced-chat-container.minimized {
        height: 60px;
        overflow: hidden;
    }

    .chat-header {
        background: var(--chat-accent, var(--primary-color));
        color: white;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .chat-title {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .chat-name {
        font-weight: 600;
    }

    .chat-status {
        font-size: 0.8em;
        opacity: 0.8;
    }

    .chat-controls {
        display: flex;
        gap: 5px;
    }

    .chat-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }

    .chat-btn:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .chat-quick-actions {
        padding: 15px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        background: var(--chat-bg, var(--bg-secondary));
    }

    .quick-action {
        background: var(--chat-border, var(--border-color));
        border: none;
        color: var(--chat-text, var(--text-primary));
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8em;
        transition: all 0.3s ease;
    }

    .quick-action:hover {
        background: var(--chat-accent, var(--primary-color));
        color: white;
    }

    .chat-suggestions {
        padding: 15px;
        background: var(--chat-bg, var(--bg-secondary));
        border-top: 1px solid var(--chat-border, var(--border-color));
    }

    .suggestion-title {
        font-size: 0.9em;
        color: var(--chat-text, var(--text-secondary));
        margin-bottom: 10px;
        font-weight: 500;
    }

    .chat-notification {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 15px;
        z-index: 10001;
        transform: translateY(100px);
        transition: transform 0.3s ease;
        max-width: 300px;
    }

    .chat-notification.show {
        transform: translateY(0);
    }

    .chat-notification-success {
        border-color: var(--success-color);
    }

    .chat-notification-error {
        border-color: var(--warning-color);
    }

    .chat-notification-warning {
        border-color: #f39c12;
    }

    .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }

    .notification-message {
        color: var(--text-primary);
        font-size: 0.9em;
        line-height: 1.4;
        white-space: pre-line;
    }

    @media (max-width: 768px) {
        .enhanced-chat-container {
            width: calc(100vw - 40px);
            right: 20px;
            left: 20px;
        }
        
        .chat-quick-actions {
            grid-template-columns: 1fr;
        }
    }
`;

// Додавання стилів
const chatStyleSheet = document.createElement('style');
chatStyleSheet.textContent = enhancedChatStyles;
document.head.appendChild(chatStyleSheet);

// Експорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedZapierIntegration;
} else {
    window.EnhancedZapierIntegration = EnhancedZapierIntegration;
}