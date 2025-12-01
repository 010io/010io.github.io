class AppFeatures {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.soundEnabled = localStorage.getItem('sound') !== 'false';
        this.init();
    }

    init() {
        this.setupThemeSwitcher();
        this.setupSounds();
        this.setupPWA();
        this.setupKeyboardShortcuts();
        this.applyTheme(this.currentTheme);
    }

    setupThemeSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'theme-switcher';
        switcher.innerHTML = `
            <button class="theme-btn dark" data-theme="dark" title="Dark"></button>
            <button class="theme-btn light" data-theme="light" title="Light"></button>
            <button class="theme-btn contrast" data-theme="high-contrast" title="Contrast"></button>
            <button class="theme-btn" id="sound-toggle" title="Sound">🔊</button>
        `;
        document.body.appendChild(switcher);

        switcher.addEventListener('click', (e) => {
            if (e.target.dataset.theme) {
                this.applyTheme(e.target.dataset.theme);
            }
            if (e.target.id === 'sound-toggle') {
                this.toggleSound();
            }
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.playSound('click');
    }

    setupSounds() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, a, .clickable')) {
                this.playSound('click');
            }
        });
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = type === 'click' ? 800 : 600;
        osc.type = 'square';
        
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.1);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('sound', this.soundEnabled);
        const btn = document.getElementById('sound-toggle');
        btn.textContent = this.soundEnabled ? '🔊' : '🔇';
    }

    setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('SW registered'))
                .catch(err => console.log('SW error'));
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.querySelector('.ai-trigger')?.click();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                const themes = ['dark', 'light', 'high-contrast'];
                const idx = themes.indexOf(this.currentTheme);
                this.applyTheme(themes[(idx + 1) % themes.length]);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AppFeatures();
});