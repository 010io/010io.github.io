class PixelMeshGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameActive = false;
        this.init();
    }

    init() {
        this.player = { x: this.canvas.width / 2, y: this.canvas.height - 40, width: 30, height: 30, speed: 5 };
        this.bullets = [];
        this.enemies = [];
        this.score = 0;
        this.keys = {};
        
        this.setupControls();
        this.spawnEnemies();
        this.gameActive = true;
        this.gameLoop();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    spawnEnemies() {
        if (!this.gameActive) return;
        
        for (let i = 0; i < 3; i++) {
            this.enemies.push({
                x: Math.random() * (this.canvas.width - 30),
                y: Math.random() * 100,
                width: 25,
                height: 25,
                speed: 2 + Math.random() * 2,
                pattern: Math.random() > 0.5 ? 'sine' : 'linear'
            });
        }
        
        setTimeout(() => this.spawnEnemies(), 3000);
    }

    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y,
            width: 5,
            height: 15,
            speed: 7
        });
    }

    update() {
        // Player movement
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }

        // Update bullets
        this.bullets = this.bullets.filter(b => {
            b.y -= b.speed;
            return b.y > 0;
        });

        // Update enemies
        this.enemies.forEach((e, i) => {
            if (e.pattern === 'sine') {
                e.x += Math.sin(Date.now() / 500) * 2;
            } else {
                e.x += e.speed;
                if (e.x > this.canvas.width || e.x < 0) e.speed *= -1;
            }
            e.y += e.speed / 2;

            // Collision with bullets
            this.bullets.forEach((b, j) => {
                if (this.collides(b, e)) {
                    this.bullets.splice(j, 1);
                    this.enemies.splice(i, 1);
                    this.score += 10;
                }
            });

            // Collision with player
            if (this.collides(this.player, e)) {
                this.gameActive = false;
                this.gameOver();
            }
        });
    }

    collides(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x &&
               a.y < b.y + b.height && a.y + a.height > b.y;
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid
        this.ctx.strokeStyle = '#00ff4122';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }

        // Player
        this.ctx.fillStyle = '#00ff41';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Bullets
        this.ctx.fillStyle = '#58a6ff';
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x, b.y, b.width, b.height);
        });

        // Enemies
        this.ctx.fillStyle = '#ff6b6b';
        this.enemies.forEach(e => {
            this.ctx.fillRect(e.x, e.y, e.width, e.height);
        });

        // Score
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = '20px monospace';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }

    gameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 40px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = '20px monospace';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.fillText('Refresh to play again', this.canvas.width / 2, this.canvas.height / 2 + 100);
    }

    gameLoop() {
        if (this.gameActive) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('game-canvas')) {
        new PixelMeshGame();
    }
});