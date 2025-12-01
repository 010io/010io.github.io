class SocialSync {
    constructor() {
        this.username = '010io';
        this.updateInterval = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    async init() {
        await this.syncGitHubActivity();
        setInterval(() => this.syncGitHubActivity(), this.updateInterval);
    }

    async syncGitHubActivity() {
        try {
            const repos = await fetch(`https://api.github.com/users/${this.username}/repos?sort=pushed&per_page=10`)
                .then(r => r.json());
            
            const events = await fetch(`https://api.github.com/users/${this.username}/events/public?per_page=10`)
                .then(r => r.json());
            
            this.renderActivityFeed(repos, events);
        } catch (e) {
            console.error('Social sync error:', e);
        }
    }

    renderActivityFeed(repos, events) {
        const feed = document.getElementById('social-feed');
        if (!feed) return;
        
        const activities = events.slice(0, 5).map(event => {
            const time = new Date(event.created_at);
            const timeAgo = this.getTimeAgo(time);
            
            let action = '';
            if (event.type === 'PushEvent') {
                action = `Pushed to ${event.repo.name}`;
            } else if (event.type === 'CreateEvent') {
                action = `Created ${event.payload.ref_type} in ${event.repo.name}`;
            } else if (event.type === 'PullRequestEvent') {
                action = `${event.payload.action} PR in ${event.repo.name}`;
            } else {
                action = `${event.type} in ${event.repo.name}`;
            }
            
            return `
                <div class="activity-item">
                    <span class="activity-time">${timeAgo}</span>
                    <span class="activity-action">${action}</span>
                </div>
            `;
        }).join('');
        
        feed.innerHTML = activities || '<div class="activity-item">No recent activity</div>';
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SocialSync();
});