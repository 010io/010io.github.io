// Інтеграція з соціальними мережами для 010io
class SocialIntegration {
    constructor() {
        this.platforms = {
            bluesky: {
                name: 'Bluesky',
                handle: '010io.bsky.social',
                url: 'https://bsky.app/profile/010io.bsky.social',
                icon: '🦋'
            },
            telegram: {
                name: 'Telegram',
                handle: 't010io',
                url: 'https://t.me/t010io',
                icon: '📱'
            },
            discord: {
                name: 'Discord',
                handle: '010io',
                url: 'https://discord.gg/010io',
                icon: '🎮'
            },
            twitter: {
                name: 'X/Twitter',
                handle: 'X010io',
                url: 'https://x.com/X010io',
                icon: '🐦'
            },
            instagram: {
                name: 'Instagram',
                handle: 'x010io',
                url: 'https://www.instagram.com/x010io',
                icon: '📸'
            },
            soundcloud: {
                name: 'SoundCloud',
                handle: 'igor-omelchenko',
                url: 'https://soundcloud.com/igor-omelchenko',
                icon: '🎵'
            },
            spotify: {
                name: 'Spotify',
                handle: '16jo2zGRmbAch9vlS04bTC',
                url: 'https://open.spotify.com/artist/16jo2zGRmbAch9vlS04bTC',
                icon: '🎧'
            }
        };
        
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 хвилин
    }

    // Отримання статистики Bluesky (симуляція, оскільки API обмежений)
    async getBlueskyStats() {
        const cached = this.cache.get('bluesky-stats');
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.data;
        }

        // Симуляція статистики (в реальному проекті тут був би API запит)
        const stats = {
            posts: Math.floor(Math.random() * 50) + 25,
            followers: Math.floor(Math.random() * 200) + 100,
            following: Math.floor(Math.random() * 150) + 50,
            lastPost: this.getRandomRecentDate()
        };

        this.cache.set('bluesky-stats', { data: stats, timestamp: Date.now() });
        return stats;
    }

    // Генерація випадкової недавньої дати
    getRandomRecentDate() {
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 7); // Останні 7 днів
        const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        return date.toISOString();
    }

    // Отримання статистики Telegram (симуляція)
    async getTelegramStats() {
        const cached = this.cache.get('telegram-stats');
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.data;
        }

        const stats = {
            subscribers: Math.floor(Math.random() * 100) + 50,
            messages: Math.floor(Math.random() * 500) + 200,
            online: Math.floor(Math.random() * 20) + 5
        };

        this.cache.set('telegram-stats', { data: stats, timestamp: Date.now() });
        return stats;
    }

    // Створення віджетів соціальних мереж
    createSocialWidget(platform, stats = {}) {
        const platformData = this.platforms[platform];
        if (!platformData) return null;

        const widget = document.createElement('div');
        widget.className = 'social-widget';
        widget.innerHTML = `
            <div class="social-widget-header">
                <span class="social-icon">${platformData.icon}</span>
                <span class="social-name">${platformData.name}</span>
            </div>
            <div class="social-stats">
                ${this.formatStats(platform, stats)}
            </div>
            <a href="${platformData.url}" target="_blank" class="social-link-btn">
                Відвідати →
            </a>
        `;

        return widget;
    }

    // Форматування статистики для різних платформ
    formatStats(platform, stats) {
        switch (platform) {
            case 'bluesky':
                return `
                    <div class="stat-item">
                        <span class="stat-number">${stats.posts || '...'}</span>
                        <span class="stat-label">Постів</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${stats.followers || '...'}</span>
                        <span class="stat-label">Підписників</span>
                    </div>
                `;
            case 'telegram':
                return `
                    <div class="stat-item">
                        <span class="stat-number">${stats.subscribers || '...'}</span>
                        <span class="stat-label">Учасників</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${stats.online || '...'}</span>
                        <span class="stat-label">Онлайн</span>
                    </div>
                `;
            default:
                return `
                    <div class="stat-item">
                        <span class="stat-label">Активний</span>
                    </div>
                `;
        }
    }

    // Відстеження кліків по соціальних мережах
    trackSocialClick(platform, action = 'click') {
        console.log(`Social Media Analytics: ${platform} - ${action}`);
        
        // Тут можна додати Google Analytics, Mixpanel, або інший сервіс аналітики
        if (typeof gtag !== 'undefined') {
            gtag('event', 'social_click', {
                'platform': platform,
                'action': action
            });
        }

        // Локальне зберігання статистики
        const localStats = JSON.parse(localStorage.getItem('010io-social-stats') || '{}');
        localStats[platform] = (localStats[platform] || 0) + 1;
        localStorage.setItem('010io-social-stats', JSON.stringify(localStats));
    }

    // Отримання локальної статистики кліків
    getLocalClickStats() {
        return JSON.parse(localStorage.getItem('010io-social-stats') || '{}');
    }

    // Створення інтерактивної карти соціальних мереж
    createInteractiveSocialMap(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        container.className = 'social-map-container';

        Object.entries(this.platforms).forEach(([key, platform]) => {
            const socialCard = document.createElement('div');
            socialCard.className = 'social-map-card';
            socialCard.innerHTML = `
                <div class="social-card-icon">${platform.icon}</div>
                <div class="social-card-name">${platform.name}</div>
                <div class="social-card-handle">@${platform.handle}</div>
                <div class="social-card-stats" id="stats-${key}">
                    <div class="loading-dots">...</div>
                </div>
            `;

            // Додавання обробника кліків
            socialCard.addEventListener('click', () => {
                this.trackSocialClick(key);
                window.open(platform.url, '_blank');
            });

            container.appendChild(socialCard);

            // Завантаження статистики для кожної платформи
            this.loadPlatformStats(key);
        });
    }

    // Завантаження статистики для конкретної платформи
    async loadPlatformStats(platform) {
        const statsContainer = document.getElementById(`stats-${platform}`);
        if (!statsContainer) return;

        try {
            let stats;
            switch (platform) {
                case 'bluesky':
                    stats = await this.getBlueskyStats();
                    statsContainer.innerHTML = `
                        <div class="mini-stat">📝 ${stats.posts}</div>
                        <div class="mini-stat">👥 ${stats.followers}</div>
                    `;
                    break;
                case 'telegram':
                    stats = await this.getTelegramStats();
                    statsContainer.innerHTML = `
                        <div class="mini-stat">👥 ${stats.subscribers}</div>
                        <div class="mini-stat">🟢 ${stats.online}</div>
                    `;
                    break;
                default:
                    statsContainer.innerHTML = '<div class="mini-stat">✅ Активний</div>';
            }
        } catch (error) {
            console.error(`Помилка завантаження статистики ${platform}:`, error);
            statsContainer.innerHTML = '<div class="mini-stat">📊 N/A</div>';
        }
    }

    // Створення віджету останніх постів (симуляція)
    async createRecentPostsWidget(containerId, limit = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div class="loading">Завантаження постів...</div>';

        try {
            // Симуляція постів (в реальному проекті - API запити)
            const posts = [
                {
                    platform: 'bluesky',
                    content: 'Працюю над новим AI проектом з підтримкою української мови 🇺🇦',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 години тому
                    likes: 15,
                    reposts: 3
                },
                {
                    platform: 'telegram',
                    content: 'Оновив mesh-api-cli з новими функціями для роботи з NFC',
                    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 годин тому
                    views: 89
                },
                {
                    platform: 'twitter',
                    content: 'Termux + Python + AI = ❤️ Нові можливості для Android розробки',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 день тому
                    likes: 23,
                    retweets: 7
                }
            ];

            container.innerHTML = '';
            posts.slice(0, limit).forEach(post => {
                const postElement = this.createPostElement(post);
                container.appendChild(postElement);
            });

        } catch (error) {
            console.error('Помилка завантаження постів:', error);
            container.innerHTML = '<div class="error">Помилка завантаження постів</div>';
        }
    }

    // Створення елементу поста
    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'social-post';
        
        const platformData = this.platforms[post.platform];
        const timeAgo = this.formatTimeAgo(post.timestamp);
        
        postDiv.innerHTML = `
            <div class="post-header">
                <span class="post-platform">${platformData?.icon || '📱'} ${platformData?.name || post.platform}</span>
                <span class="post-time">${timeAgo}</span>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-stats">
                ${post.likes ? `❤️ ${post.likes}` : ''}
                ${post.reposts ? `🔄 ${post.reposts}` : ''}
                ${post.retweets ? `🔄 ${post.retweets}` : ''}
                ${post.views ? `👁️ ${post.views}` : ''}
            </div>
        `;

        return postDiv;
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

    // Ініціалізація всіх соціальних віджетів
    async initializeAll() {
        // Створення карти соціальних мереж
        this.createInteractiveSocialMap('social-map');
        
        // Створення віджету останніх постів
        await this.createRecentPostsWidget('recent-posts');
        
        // Додавання обробників для відстеження
        this.setupAnalytics();
    }

    // Налаштування аналітики
    setupAnalytics() {
        // Відстеження часу на сторінці
        let startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            console.log(`Час на сторінці: ${timeSpent} секунд`);
        });

        // Відстеження прокрутки
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }
        });
    }
}

// Експорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocialIntegration;
} else {
    window.SocialIntegration = SocialIntegration;
}