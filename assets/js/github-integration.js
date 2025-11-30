class GitHubIntegration {
    constructor(username = '010io') {
        this.username = username;
        this.apiBase = 'https://api.github.com';
        this.cache = new Map();
    }

    async fetchWithCache(endpoint) {
        const cacheKey = `gh_${endpoint}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < 3600000) return data;
        }

        try {
            const response = await fetch(`${this.apiBase}${endpoint}`);
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            
            localStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
            return data;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getRepos() {
        return await this.fetchWithCache(`/users/${this.username}/repos?sort=pushed&per_page=100`);
    }

    async getGists() {
        return await this.fetchWithCache(`/users/${this.username}/gists?per_page=20`);
    }

    async renderAll() {
        const repos = await this.getRepos();
        const gists = await this.getGists();

        const mainProjects = repos.filter(r => !r.archived).slice(0, 6);
        this.renderGrid('dynamic-projects', mainProjects, 'repo');

        const pagesProjects = repos.filter(r => r.has_pages);
        this.renderGrid('pages-grid', pagesProjects, 'page');

        this.renderGists('gists-grid', gists);
    }

    renderGrid(elementId, items, type) {
        const container = document.getElementById(elementId);
        if(!container) return;
        
        container.innerHTML = items.map(item => `
            <div class="project-card ${type}-card">
                <h3>${item.name}</h3>
                <p>${item.description || 'No description provided.'}</p>
                <div class="meta">
                    <span>⭐ ${item.stargazers_count || 0}</span>
                    <span>${item.language || 'Code'}</span>
                </div>
                <div class="actions">
                    <a href="${item.html_url}" target="_blank" class="btn small">Source</a>
                    ${item.has_pages ? `<a href="https://${this.username}.github.io/${item.name}" target="_blank" class="btn small highlight">Live Site</a>` : ''}
                </div>
            </div>
        `).join('');
    }

    renderGists(elementId, gists) {
        const container = document.getElementById(elementId);
        if(!container) return;

        container.innerHTML = gists.map(gist => {
            const filename = Object.keys(gist.files)[0];
            return `
            <div class="gist-item">
                <span class="gist-icon">📜</span>
                <a href="${gist.html_url}" target="_blank" class="gist-name">${filename}</a>
                <span class="gist-desc">${gist.description || 'Script'}</span>
            </div>
            `;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GitHubIntegration().renderAll();
});