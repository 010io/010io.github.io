// Автоматичне оновлення портфоліо для 010io
class AutoUpdatePortfolio {
    constructor() {
        this.updateInterval = 5 * 60 * 1000; // 5 хвилин
        this.github = new GitHubIntegration('010io');
        this.social = new SocialIntegration();
        this.cache = new Map();
        this.isUpdating = false;
        
        this.initializeAutoUpdate();
    }

    // Ініціалізація автооновлення
    initializeAutoUpdate() {
        // Перше оновлення при завантаженні
        this.updateAll();
        
        // Періодичні оновлення
        setInterval(() => {
            this.updateAll();
        }, this.updateInterval);

        // Оновлення при поверненні на вкладку
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !this.isUpdating) {
                this.updateAll();
            }
        });

        // Оновлення при зміні мережевого статусу
        window.addEventListener('online', () => {
            this.showNotification('З\'єднання відновлено. Оновлюю дані...', 'success');
            this.updateAll();
        });

        window.addEventListener('offline', () => {
            this.showNotification('Відсутнє з\'єднання. Працюю в офлайн режимі.', 'warning');
        });
    }

    // Головний метод оновлення
    async updateAll() {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        this.showUpdateIndicator(true);

        try {
            await Promise.all([
                this.updateGitHubStats(),
                this.updateProjects(),
                this.updateSocialStats(),
                this.updateLastActivity()
            ]);
            
            this.showNotification('Портфоліо оновлено!', 'success');
        } catch (error) {
            console.error('Помилка оновлення:', error);
            this.showNotification('Помилка оновлення даних', 'error');
        } finally {
            this.isUpdating = false;
            this.showUpdateIndicator(false);
        }
    }

    // Оновлення статистики GitHub
    async updateGitHubStats() {
        try {
            const stats = await this.github.generateStats();
            
            // Оновлення елементів на сторінці
            this.updateElement('github-repos', stats.repositories);
            this.updateElement('github-stars', stats.stars);
            this.updateElement('last-commit', stats.lastCommit);
            
            // Оновлення прогрес-барів мов програмування
            this.updateLanguageProgress(stats.languages);
            
            // Збереження в кеш
            this.cache.set('github-stats', { data: stats, timestamp: Date.now() });
            
        } catch (error) {
            console.error('Помилка оновлення GitHub статистики:', error);
        }
    }

    // Оновлення проектів
    async updateProjects() {
        try {
            const projects = await this.github.getTopProjects(8);
            const container = document.getElementById('dynamic-projects');
            
            if (container && projects.length > 0) {
                container.innerHTML = '';
                
                projects.forEach((project, index) => {
                    const projectCard = this.createProjectCard(project, index);
                    container.appendChild(projectCard);
                });
            }
            
        } catch (error) {
            console.error('Помилка оновлення проектів:', error);
        }
    }

    // Створення картки проекту
    createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = 'project-card enhanced-project-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const statusClass = project.isRecent ? 'status-active' : 'status-development';
        const statusText = project.isRecent ? 'Активний' : 'Стабільний';
        
        card.innerHTML = `
            <div class="project-status ${statusClass}">${statusText}</div>
            <div class="project-header">
                <h3 class="project-title">${project.name}</h3>
                <div class="project-language">
                    ${project.language ? `<span class="language-badge">${project.language}</span>` : ''}
                </div>
            </div>
            <p class="project-description">${project.description}</p>
            <div class="project-stats">
                <div class="stat-item">
                    <span class="stat-icon">⭐</span>
                    <span class="stat-value">${project.stars}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">🔄</span>
                    <span class="stat-value">${project.forks}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">📅</span>
                    <span class="stat-value">${this.formatDate(project.updated)}</span>
                </div>
            </div>
            <div class="project-actions">
                <a href="${project.url}" target="_blank" class="project-link">
                    <span class="link-icon">🔗</span>
                    Переглянути на GitHub
                </a>
            </div>
        `;

        // Додавання hover ефектів
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });

        return card;
    }

    // Оновлення соціальної статистики
    async updateSocialStats() {
        try {
            const blueskyStats = await this.social.getBlueskyStats();
            this.updateElement('bluesky-posts', blueskyStats.posts);
            
            // Оновлення соціальних віджетів
            await this.social.initializeAll();
            
        } catch (error) {
            console.error('Помилка оновлення соціальної статистики:', error);
        }
    }

    // Оновлення останньої активності
    async updateLastActivity() {
        try {
            const activity = await this.github.getRecentActivity();
            const activityContainer = document.getElementById('recent-activity');
            
            if (activityContainer && activity.length > 0) {
                activityContainer.innerHTML = '';
                
                activity.slice(0, 5).forEach(repo => {
                    const activityItem = document.createElement('div');
                    activityItem.className = 'activity-item';
                    activityItem.innerHTML = `
                        <div class="activity-icon">📝</div>
                        <div class="activity-content">
                            <div class="activity-title">Оновлено: ${repo.name}</div>
                            <div class="activity-time">${this.formatTimeAgo(new Date(repo.updated_at))}</div>
                        </div>
                    `;
                    activityContainer.appendChild(activityItem);
                });
            }
            
        } catch (error) {
            console.error('Помилка оновлення активності:', error);
        }
    }

    // Оновлення прогресу мов програмування
    updateLanguageProgress(languages) {
        const container = document.getElementById('language-progress');
        if (!container || !languages) return;

        container.innerHTML = '';
        const total = Object.values(languages).reduce((sum, count) => sum + count, 0);

        Object.entries(languages).forEach(([language, count]) => {
            const percentage = Math.round((count / total) * 100);
            
            const progressItem = document.createElement('div');
            progressItem.className = 'progress-container';
            progressItem.innerHTML = `
                <div class="progress-label">
                    <span>${language}</span>
                    <span>${percentage}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%;" data-width="${percentage}%"></div>
                </div>
            `;
            
            container.appendChild(progressItem);
            
            // Анімація заповнення
            setTimeout(() => {
                const fill = progressItem.querySelector('.progress-fill');
                fill.style.width = fill.dataset.width;
            }, 100);
        });
    }

    // Оновлення елементу на сторінці
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // Анімація зміни значення
            element.style.opacity = '0.5';
            setTimeout(() => {
                element.textContent = value;
                element.style.opacity = '1';
            }, 150);
        }
    }

    // Показ індикатора оновлення
    showUpdateIndicator(show) {
        let indicator = document.getElementById('update-indicator');
        
        if (show && !indicator) {
            indicator = document.createElement('div');
            indicator.id = 'update-indicator';
            indicator.className = 'update-indicator';
            indicator.innerHTML = `
                <div class="update-spinner"></div>
                <span>Оновлення...</span>
            `;
            document.body.appendChild(indicator);
        } else if (!show && indicator) {
            indicator.remove();
        }
    }

    // Показ повідомлень
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
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
        }, 3000);
    }

    // Іконки для повідомлень
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // Форматування дати
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Вчора';
        if (diffDays < 7) return `${diffDays}д тому`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)}тиж тому`;
        return date.toLocaleDateString('uk-UA');
    }

    // Форматування часу "тому"
    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}хв тому`;
        if (hours < 24) return `${hours}год тому`;
        return `${days}д тому`;
    }

    // Ручне оновлення
    async manualUpdate() {
        if (this.isUpdating) {
            this.showNotification('Оновлення вже виконується...', 'warning');
            return;
        }
        
        this.showNotification('Запуск ручного оновлення...', 'info');
        await this.updateAll();
    }

    // Отримання статистики оновлень
    getUpdateStats() {
        return {
            lastUpdate: this.cache.get('github-stats')?.timestamp || null,
            cacheSize: this.cache.size,
            isOnline: navigator.onLine,
            updateInterval: this.updateInterval / 1000 / 60 // в хвилинах
        };
    }

    // Очищення кешу
    clearCache() {
        this.cache.clear();
        this.showNotification('Кеш очищено', 'success');
    }

    // Налаштування інтервалу оновлення
    setUpdateInterval(minutes) {
        this.updateInterval = minutes * 60 * 1000;
        this.showNotification(`Інтервал оновлення змінено на ${minutes} хвилин`, 'success');
    }
}

// Стилі для індикатора оновлення
const updateStyles = `
    .update-indicator {
        position: fixed;
        top: 20px;
        left: 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--primary-color);
        border-radius: 8px;
        padding: 10px 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        color: var(--text-primary);
        font-size: 0.9em;
    }

    .update-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid var(--border-color);
        border-top: 2px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 15px;
        z-index: 1001;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification-success {
        border-color: var(--success-color);
    }

    .notification-error {
        border-color: var(--warning-color);
    }

    .notification-warning {
        border-color: #f39c12;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .notification-message {
        color: var(--text-primary);
        font-size: 0.9em;
    }

    .enhanced-project-card {
        animation: slideInUp 0.6s ease-out both;
    }

    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .activity-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: var(--bg-secondary);
        border-radius: 6px;
        margin-bottom: 8px;
        transition: all 0.3s ease;
    }

    .activity-item:hover {
        background: rgba(88, 166, 255, 0.1);
    }

    .activity-icon {
        font-size: 1.2em;
    }

    .activity-title {
        font-weight: 500;
        color: var(--text-primary);
    }

    .activity-time {
        font-size: 0.8em;
        color: var(--text-secondary);
    }
`;

// Додавання стилів до документу
const styleSheet = document.createElement('style');
styleSheet.textContent = updateStyles;
document.head.appendChild(styleSheet);

// Експорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoUpdatePortfolio;
} else {
    window.AutoUpdatePortfolio = AutoUpdatePortfolio;
}