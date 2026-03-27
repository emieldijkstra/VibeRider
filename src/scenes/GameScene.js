/**
 * GameScene – Main gameplay scene
 */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player        = null;
        this.obstacles     = [];
        this.spawnedIds    = new Set();
        this.syncEngine    = null;
        this.levelData     = null;
        this.gameOver      = false;
        this.started       = false;
        this.ground        = null;
        this.bgGraphics    = null;
        this.scoreText     = null;
        this.comboText     = null;
        this.syncText      = null;
        this.trackText     = null;
        this.countText     = null;
        this.countTimer    = 0;
        this.countdown     = 3;
    }

    init(data) {
        this.track     = data.track;
        this.levelData = data.levelData;
        this.features  = data.features;
    }

    create() {
        console.log('🎮 GameScene created:', this.track.name);

        const W = this.scale.width;
        const H = this.scale.height;

        // ── Background ───────────────────────────────────────────
        // Create a repeating background that extends far to the right
        this.createBackground(W, H, 5000); // 5000px wide for scrolling

        // ── Player (left side of screen, Geometry Dash style) ──────
        this.player = new Player(this, 150, H / 2);

        // ── Camera follows player horizontally ────────────────────
        this.cameras.main.setBounds(0, 0, 20000, H);
        this.cameras.main.startFollow(this.player.body, true, 0.3, 0, -200, 0);

        // ── Sync Engine ──────────────────────────────────────────
        this.syncEngine = new SyncEngine(this);

        // ── HUD (fixed to camera, stays on screen) ──────────────────
        const hudBg = this.add.rectangle(0, 0, W, 100, 0x000000, 0.4).setOrigin(0, 0).setDepth(10).setScrollFactor(0);

        // ── HUD Title ────────────────────────────────────────────
        this.trackText = this.add.text(W / 2, 12,
            `♪ ${this.track.name} ♪`, {
            font: 'bold 24px Space Grotesk', fill: '#FFD700', align: 'center'
        }).setOrigin(0.5, 0).setDepth(20).setScrollFactor(0);

        // ── Score ────────────────────────────────────────────────
        this.scoreText = this.add.text(30, 50, 'Score: 0', {
            font: 'bold 32px Space Grotesk', fill: '#FFD700'
        }).setDepth(20).setScrollFactor(0);

        // ── Combo ────────────────────────────────────────────────
        this.comboText = this.add.text(W - 30, 50, 'Combo: ×1', {
            font: 'bold 24px Space Grotesk', fill: '#00FF00'
        }).setOrigin(1, 0).setDepth(20).setScrollFactor(0);

        this.syncText = this.add.text(W / 2, 50, '', {
            font: '14px Space Grotesk', fill: '#888888'
        }).setOrigin(0.5, 0).setDepth(20).setScrollFactor(0);

        // ── Pause button ─────────────────────────────────────────
        const pauseBtn = this.add.text(W - 30, 80, '■ ESC', {
            font: '16px Space Grotesk', fill: '#FF4444'
        }).setOrigin(1, 0).setDepth(20).setScrollFactor(0)
          .setInteractive({ useHandCursor: true });
        pauseBtn.on('pointerdown', () => this.endGame(false));

        // ── ESC key ──────────────────────────────────────────────
        this.input.keyboard.once('keydown-ESC', () => this.endGame(false));

        // ── Countdown (huge and centered) ──────────────────────────
        this.countText = this.add.text(W / 2, H / 2, '3', {
            font: 'bold 200px Space Grotesk', fill: '#FFD700', alpha: 1
        }).setOrigin(0.5, 0.5).setDepth(30).setScrollFactor(0);

        this.countdown  = 3;
        this.countTimer = 1000;
    }

    // ────────────────────────────────────────────────────────────
    // Create Geometry Dash style scrolling background
    // ────────────────────────────────────────────────────────────
    createBackground(W, H, scrollWidth) {
        // Sky gradient
        const skyGradient = this.make.graphics({ x: 0, y: 0, add: false });
        skyGradient.fillStyle(0x87CEEB, 1);
        skyGradient.fillRect(0, 0, scrollWidth, H * 0.7);
        skyGradient.fillStyle(0xE0F6FF, 1);
        skyGradient.fillRect(0, H * 0.7, scrollWidth, H * 0.3);
        skyGradient.generateTexture('skyTexture', scrollWidth, H);
        skyGradient.destroy();
        
        this.add.image(scrollWidth / 2, H / 2, 'skyTexture').setOrigin(0.5, 0.5);

        // Repeating ground pattern (Geometry Dash style)
        const groundColor = 0x1a1a2e;
        const lineColor = 0xffd700;
        const groundY = H - 60;
        
        // Multiple ground blocks
        const blockWidth = 100;
        const blockGap = 5;
        for (let x = 0; x < scrollWidth; x += blockWidth + blockGap) {
            this.add.rectangle(x + blockWidth / 2, groundY, blockWidth, 60, groundColor)
                .setOrigin(0, 0.5)
                .setStrokeStyle(2, lineColor, 0.6);
        }

        // Grass line
        this.add.rectangle(scrollWidth / 2, H - 60, scrollWidth, 8, 0x22B14C)
            .setOrigin(0.5, 0);
    }

    // ────────────────────────────────────────────────────────────
    // Countdown + start playback
    // ────────────────────────────────────────────────────────────
    async startPlayback() {
        try {
            if (gameState.spotifyPlayer && gameState.spotifyDeviceId) {
                await SpotifyAPI.play(gameState.spotifyDeviceId, this.track.uri);
                console.log('Playback started via SDK');
            } else {
                console.warn('No Spotify Player device — running without playback sync');
            }
        } catch (err) {
            console.warn('Playback start failed:', err.message);
        }

        this.syncEngine.start();
        this.started   = true;
        this.countText.destroy();
        ScoreManager.reset();
        this.cameras.main.flash(300, 0, 255, 255, false);
    }

    // ────────────────────────────────────────────────────────────
    // Obstacle spawning
    // ────────────────────────────────────────────────────────────
    spawnObstacle(obstacleData) {
        if (this.spawnedIds.has(obstacleData.id)) return;
        this.spawnedIds.add(obstacleData.id);

        // Spawn obstacles ahead of player to the right
        // Player starts at x=150, obstacles spawn progressively further right
        const spawnX = this.player.body.x + 1500 + obstacleData.id * 300;
        const gapY = obstacleData.gapY;

        const piping = new Obstacle(this, spawnX, gapY, obstacleData);
        this.obstacles.push(piping);
    }

    // ────────────────────────────────────────────────────────────
    // End game
    // ────────────────────────────────────────────────────────────
    endGame(died = true) {
        if (this.gameOver) return;
        this.gameOver = true;
        console.log('Game over. Score:', ScoreManager.currentScore);

        this.syncEngine.stop();

        // Stop playback
        if (gameState.spotifyPlayer) {
            gameState.spotifyPlayer.pause().catch(() => {});
        }

        if (died) {
            this.cameras.main.flash(400, 255, 0, 0, false);
            this.cameras.main.shake(300, 0.015);
        }

        this.time.delayedCall(died ? 600 : 200, () => {
            this.scene.start('GameOverScene', {
                score: ScoreManager.currentScore,
                track: this.track,
                died
            });
        });
    }

    // ────────────────────────────────────────────────────────────
    // Main loop
    // ────────────────────────────────────────────────────────────
    update(time, delta) {
        // ── Countdown ────────────────────────────────────────────
        if (!this.started) {
            this.countTimer -= delta;
            if (this.countTimer <= 0) {
                this.countdown--;
                this.countTimer = 1000;
                if (this.countdown <= 0) {
                    this.startPlayback();
                } else {
                    this.countText.setText(String(this.countdown));
                    this.cameras.main.flash(150, 0, 255, 255, false);
                }
            }
            return;
        }

        if (this.gameOver) return;

        // ── Sync engine ──────────────────────────────────────────
        this.syncEngine.update(delta);
        const syncedMs = this.syncEngine.getSyncedTime();

        // ── Player ───────────────────────────────────────────────
        this.player.update(delta);

        // ── Spawn upcoming obstacles ─────────────────────────────
        if (this.levelData) {
            const preSpawn = VIBE_CONFIG.game.preSpawnBuffer;
            const upcoming = this.levelData.obstacles.filter(o =>
                o.time >= syncedMs && o.time <= syncedMs + preSpawn
            );
            upcoming.forEach(o => this.spawnObstacle(o));
        }

        // ── Update & check obstacles ─────────────────────────────
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const ob = this.obstacles[i];
            if (ob.isDespawned) { this.obstacles.splice(i, 1); continue; }

            ob.update();

            // Collision with pipes (flies through gap safely)
            if (ob.checkCollisionWith(this.player)) {
                this.endGame(true);
                return;
            }
        }

        // ── Check end of track ───────────────────────────────────
        const trackDurationMs = (this.track.duration_ms || 0);
        if (trackDurationMs > 0 && syncedMs >= trackDurationMs) {
            this.endGame(false);
            return;
        }

        // ── Score ─────────────────────────────────────────────────
        ScoreManager.addFramePoints(delta);
        this.scoreText.setText(`Score: ${ScoreManager.currentScore.toLocaleString()}`);
        this.comboText.setText(`Combo: ×${(1 + Math.floor(ScoreManager.combo / 10))}`);

        // ── Sync debug ───────────────────────────────────────────
        if (VIBE_CONFIG.dev.logSync) {
            const info = this.syncEngine.getDriftInfo();
            this.syncText.setText(`sync ${Math.round(syncedMs / 1000)}s  drift ${Math.round(info.drift)}ms`);
        }
    }
}

console.log('GameScene loaded');
