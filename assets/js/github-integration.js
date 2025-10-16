// GitHub API Integration для 010io
class GitHubIntegration {
    constructor(username = '010io') {
        this.username = username;
        this.apiBase = 'https://api.github.com';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 хвилин
    }

    // Кешування запитів
    async cachedFetch(url, cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.data;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error(`Помилка завантаження ${cacheKey}:`, error);
            return cached ? cached.data : null;
        }
    }

    // Отримання інформації про користувача
    async getUserInfo() {
        return await this.cachedFetch(
            `${this.apiBase}/users/${this.username}`,
            'user-info'
        );
    }

    // Отримання репозиторіїв
    async getRepositories() {
        return await this.cachedFetch(
            `${this.apiBase}/users/${this.username}/repos?per_page=100&sort=updated`,
            'repositories'
        );
    }

    // Отримання останніх комітів
    async getRecentCommits(repoName, count = 5) {
        return await this.cachedFetch(
            `${this.apiBase}/repos/${this.username}/${repoName}/commits?per_page=${count}`,
            `commits-${repoName}`
        );
    }

    // Отримання статистики мов програмування
    async getLanguageStats() {
        const repos = await this.getRepositories();
        if (!repos) return {};

        const languages = {};
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });

        return Object.entries(languages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .reduce((obj, [lang, count]) => ({ ...obj, [lang]: count }), {});
    }

    // Отримання активності за останній місяць
    async getRecentActivity() {
        const repos = await this.getRepositories();
        if (!repos) return [];

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        return repos
            .filter(repo => new Date(repo.updated_at) > oneMonthAgo)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 10);
    }

    // Генерація статистики для відображення
    async generateStats() {
        try {
            const [userInfo, repos, languageStats] = await Promise.all([
                this.getUserInfo(),
                this.getRepositories(),
                this.getLanguageStats()
            ]);

            if (!userInfo || !repos) {
                throw new Error('Не вдалося завантажити дані');
            }

            const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
            const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
            
            // Знаходимо останній коміт
            const recentRepos = repos.filter(repo => !repo.fork).slice(0, 5);
            let lastCommitDate = null;
            
            for (const repo of recentRepos) {
                try {
                    const commits = await this.getRecentCommits(repo.name, 1);
                    if (commits && commits.length > 0) {
                        const commitDate = new Date(commits[0].commit.author.date);
                        if (!lastCommitDate || commitDate > lastCommitDate) {
                            lastCommitDate = commitDate;
                        }
                    }
                } catch (e) {
                    console.warn(`Не вдалося отримати коміти для ${repo.name}`);
                }
            }

            const daysAgo = lastCommitDate ? 
                Math.floor((Date.now() - lastCommitDate) / (1000 * 60 * 60 * 24)) : null;

            return {
                repositories: userInfo.public_repos,
                stars: totalStars,
                forks: totalForks,
                followers: userInfo.followers,
                lastCommit: daysAgo !== null ? (daysAgo === 0 ? 'Сьогодні' : `${daysAgo}д`) : 'N/A',
                languages: languageStats,
                profileViews: userInfo.blog ? 'Active' : 'N/A'
            };
        } catch (error) {
            console.error('Помилка генерації статистики:', error);
            return {
                repositories: 'N/A',
                stars: 'N/A',
                forks: 'N/A',
                followers: 'N/A',
                lastCommit: 'N/A',
                languages: {},
                profileViews: 'N/A'
            };
        }
    }

    // Отримання топ проектів для відображення
    async getTopProjects(limit = 6) {
        try {
            const repos = await this.getRepositories();
            if (!repos) return [];

            return repos
                .filter(repo => !repo.fork && repo.description)
                .sort((a, b) => {
                    // Сортування за зірками та останнім оновленням
                    const scoreA = a.stargazers_count * 2 + (new Date(a.updated_at) > new Date(Date.now() - 30*24*60*60*1000) ? 10 : 0);
                    const scoreB = b.stargazers_count * 2 + (new Date(b.updated_at) > new Date(Date.now() - 30*24*60*60*1000) ? 10 : 0);
                    return scoreB - scoreA;
                })
                .slice(0, limit)
                .map(repo => ({
                    name: repo.name,
                    description: repo.description,
                    url: repo.html_url,
                    language: repo.language,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    updated: repo.updated_at,
                    isRecent: new Date(repo.updated_at) > new Date(Date.now() - 30*24*60*60*1000)
                }));
        } catch (error) {
            console.error('Помилка отримання проектів:', error);
            return [];
        }
    }
}

// Експорт для використання
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubIntegration;
} else {
    window.GitHubIntegration = GitHubIntegration;
}