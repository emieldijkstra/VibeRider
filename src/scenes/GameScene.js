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
        console.log('GameScene created:', this.track.name);

        const W = this.scale.width;
        const H = this.scale.height;

        // ── Background ───────────────────────────────────────────
        this.cameras.main.setBackgroundColor(
            ThemeManager.currentTheme?.colors?.background || '#001a2e'
        );
        this.createBackground(W, H);

        // ── Ground ───────────────────────────────────────────────
        const groundY = VIBE_CONFIG.game.groundLevel;
        this.ground = this.physics.add.staticGroup();
        const groundTile = this.add.rectangle(W / 2, groundY + 10, W * 4, 20,
            Phaser.Display.Color.HexStringToColor(
                ThemeManager.currentTheme?.colors?.primary || '#00ffff'
            ).color, 0.6
        );
        this.physics.add.existing(groundTile, true);
        this.ground.add(groundTile);

        // ── Player ───────────────────────────────────────────────
        this.player = new Player(this, 160, groundY - 30);
        // Collider between the player's physics body and ground
        this.physics.add.collider(this.player.body, this.ground);

        // ── Sync Engine ──────────────────────────────────────────
        this.syncEngine = new SyncEngine(this);

        // ── HUD ──────────────────────────────────────────────────
        this.scoreText = this.add.text(20, 16, 'Score: 0', {
            font: 'bold 28px Space Grotesk', fill: '#00ffff'
        }).setDepth(20).setScrollFactor(0);

        this.comboText = this.add.text(20, 52, 'Combo: ×1', {
            font: '20px Space Grotesk', fill: '#00ff88'
        }).setDepth(20).setScrollFactor(0);

        this.trackText = this.add.text(W / 2, 16,
            `${this.track.name}  —  ${this.track.artists?.[0]?.name || ''}`, {
            font: '18px Space Grotesk', fill: '#b0b0b0', align: 'center'
        }).setOrigin(0.5, 0).setDepth(20).setScrollFactor(0);

        this.syncText = this.add.text(W - 20, 16, '', {
            font: '14px Space Grotesk', fill: '#556677'
        }).setOrigin(1, 0).setDepth(20).setScrollFactor(0);

        // ── Pause button ─────────────────────────────────────────
        const pauseBtn = this.add.text(W - 20, 52, '❚❚ ESC', {
            font: '18px Space Grotesk', fill: '#888888'
        }).setOrigin(1, 0).setDepth(20).setScrollFactor(0)
          .setInteractive({ useHandCursor: true });
        pauseBtn.on('pointerdown', () => this.endGame(false));

        // ── ESC key ──────────────────────────────────────────────
        this.input.keyboard.once('keydown-ESC', () => this.endGame(false));

        // ── Countdown then start ──────────────────────────────────
        this.countText = this.add.text(W / 2, H / 2, '3', {
            font: 'bold 180px Space Grotesk', fill: '#00ffff', alpha: 0.9
        }).setOrigin(0.5, 0.5).setDepth(30).setScrollFactor(0);

        this.countdown  = 3;
        this.countTimer = 1000;
    }

    // ────────────────────────────────────────────────────────────
    // Background grid
    // ────────────────────────────────────────────────────────────
    createBackground(W, H) {
        const g = this.add.graphics();
        const col = ThemeManager.currentTheme?.colors?.primary || '#00ffff';
        const hex = Phaser.Display.Color.HexStringToColor(col).color;
        g.lineStyle(1, hex, 0.08);

        for (let x = 0; x < W; x += 80)  { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.strokePath(); }
        for (let y = 0; y < H; y += 80)  { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.strokePath(); }

        this.bgGraphics = g;
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

        const W = this.scale.width;
        const groundY = VIBE_CONFIG.game.groundLevel;

        const ob = new Obstacle(this, W + 80, groundY - (obstacleData.height || 150) / 2, obstacleData);
        this.physics.add.collider(ob, this.ground);
        this.obstacles.push(ob);
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

            // Simple AABB collision
            if (ob.type !== 'speedup' && ob.checkCollisionWith(this.player)) {
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
