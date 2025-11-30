class AppFeatures {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.soundEnabled = localStorage.getItem('sound') !== 'false';
        this.init();
    }

    init() {
        this.setupThemeSwitcher();
        this.setupSounds();
        this.setupQRCode();
        this.setupAccessibility();
        this.setupPWA();
        this.setupKeyboardShortcuts();
        this.applyTheme(this.currentTheme);
    }

    setupThemeSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'theme-switcher';
        switcher.innerHTML = `
            <button class="theme-btn dark" data-theme="dark" title="Dark Theme"></button>
            <button class="theme-btn light" data-theme="light" title="Light Theme"></button>
            <button class="theme-btn contrast" data-theme="high-contrast" title="High Contrast"></button>
            <button class="theme-btn" id="sound-toggle" title="Toggle Sound">🔊</button>
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
        this.sounds = {
            click: this.createBeep(800, 100),
            hover: this.createBeep(600, 50),
            success: this.createBeep(1000, 200),
            error: this.createBeep(300, 300)
        };

        document.addEventListener('click', (e) => {
            if (e.target.matches('button, a, .clickable')) {
                this.playSound('click');
            }
        });

        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('button, a, .project-card')) {
                this.playSound('hover');
            }
        });
    }

    createBeep(frequency, duration) {
        return () => {
            if (!this.soundEnabled) return;
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        };
    }

    playSound(type) {
        if (this.sounds[type]) {
            this.sounds[type]();
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('sound', this.soundEnabled);
        const btn = document.getElementById('sound-toggle');
        btn.textContent = this.soundEnabled ? '🔊' : '🔇';
        this.playSound(this.soundEnabled ? 'success' : 'click');
    }

    setupQRCode() {
        const qrSection = document.createElement('div');
        qrSection.className = 'qr-section';
        qrSection.innerHTML = `
            <div style="font-size: 0.8em; margin-bottom: 10px;">Scan to visit</div>
            <canvas id="qr-canvas" width="100" height="100"></canvas>
        `;
        document.body.appendChild(qrSection);

        this.generateQR(window.location.href);
    }

    generateQR(text) {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const size = 100;
        const modules = 21; // Simple QR size
        const moduleSize = size / modules;
        
        ctx.fillStyle = this.currentTheme === 'light' ? '#000' : '#fff';
        ctx.fillRect(0, 0, size, size);
        
        ctx.fillStyle = this.currentTheme === 'light' ? '#fff' : '#000';
        // Simple pattern (not real QR, just visual)
        for (let i = 0; i < modules; i++) {
            for (let j = 0; j < modules; j++) {
                if ((i + j) % 3 === 0) {
                    ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
                }
            }
        }
    }

    setupAccessibility() {
        // High contrast detection
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.applyTheme('high-contrast');
        }

        // Reduced motion detection
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01s');
        }

        // Font size controls
        const fontControls = document.createElement('div');
        fontControls.innerHTML = `
            <button onclick="this.changeFontSize(1)" title="Increase font size">A+</button>
            <button onclick="this.changeFontSize(-1)" title="Decrease font size">A-</button>
        `;
        fontControls.style.cssText = 'position:fixed;top:140px;right:20px;display:flex;gap:5px;z-index:1000;';
        document.body.appendChild(fontControls);

        window.changeFontSize = (delta) => {
            const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            document.documentElement.style.fontSize = (currentSize + delta * 2) + 'px';
        };
    }

    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('SW registered'))
                .catch(err => console.log('SW registration failed'));
        }

        // Install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            const installBtn = document.createElement('button');
            installBtn.textContent = '📱 Install App';
            installBtn.className = 'btn install-btn';
            installBtn.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:1000;';
            
            installBtn.addEventListener('click', () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => {
                    deferredPrompt = null;
                    installBtn.remove();
                });
            });
            
            document.body.appendChild(installBtn);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K - AI Chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.querySelector('.ai-trigger')?.click();
            }
            
            // Ctrl/Cmd + T - Theme toggle
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                const themes = ['dark', 'light', 'high-contrast'];
                const currentIndex = themes.indexOf(this.currentTheme);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                this.applyTheme(nextTheme);
            }
            
            // Ctrl/Cmd + S - Sound toggle
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.toggleSound();
            }
            
            // Arrow keys navigation
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                const focusable = Array.from(document.querySelectorAll('a, button, input, [tabindex]'));
                const current = document.activeElement;
                const currentIndex = focusable.indexOf(current);
                
                if (currentIndex !== -1) {
                    e.preventDefault();
                    const nextIndex = e.key === 'ArrowDown' 
                        ? (currentIndex + 1) % focusable.length
                        : (currentIndex - 1 + focusable.length) % focusable.length;
                    focusable[nextIndex]?.focus();
                }
            }
        });
    }

    // Performance optimization for weak devices
    optimizeForDevice() {
        const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                        navigator.deviceMemory <= 2 ||
                        /Android.*Chrome\/[0-5]/.test(navigator.userAgent);
        
        if (isLowEnd) {
            document.documentElement.classList.add('low-end-device');
            // Disable heavy animations
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
            // Reduce backdrop blur
            document.documentElement.style.setProperty('--blur-amount', '5px');
        }
    }

    // Vector math for smooth animations
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Smooth scroll with easing
    smoothScrollTo(element) {
        const targetY = element.offsetTop;
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        const duration = 800;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const ease = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            window.scrollTo(0, startY + distance * ease);
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AppFeatures();
});