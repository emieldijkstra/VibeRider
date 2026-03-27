/**
 * GameScene
 * Main gameplay scene
 */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.obstacles = [];
        this.syncEngine = null;
        this.levelData = null;
        this.gameOver = false;
    }

    init(data) {
        this.track = data.track;
    }

    async create() {
        console.log('GameScene created');
        
        this.cameras.main.setBackgroundColor('#001a2e');

        try {
            // Generate level from track
            // TODO: Implement in Phase 3
            
            // Create player
            this.player = new Player(
                this,
                100,
                VIBE_CONFIG.game.groundLevel
            );

            // Initialize sync engine
            this.syncEngine = new SyncEngine(this);
            this.syncEngine.start();

            // Start playback
            this.startPlayback();

            // Score display
            this.createScoreDisplay();
        } catch (error) {
            console.error('Error creating GameScene:', error);
            this.endGame();
        }
    }

    /**
     * Start Spotify playback
     */
    async startPlayback() {
        try {
            // TODO: Implement Web Playback SDK integration
            console.log('Starting playback:', this.track.name);
        } catch (error) {
            console.error('Error starting playback:', error);
        }
    }

    /**
     * Create score display UI
     */
    createScoreDisplay() {
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            font: 'bold 32px Space Grotesk',
            fill: '#00ffff'
        });

        this.comboText = this.add.text(20, 60, 'Combo: 0', {
            font: 'bold 24px Space Grotesk',
            fill: '#00ff88'
        });
    }

    /**
     * Spawn an obstacle
     */
    spawnObstacle(obstacleData) {
        const obstacle = new Obstacle(
            this,
            this.game.config.width,
            VIBE_CONFIG.game.groundLevel,
            obstacleData
        );
        this.obstacles.push(obstacle);
    }

    /**
     * End game
     */
    endGame() {
        console.log('Game over. Final score:', ScoreManager.currentScore);
        this.gameOver = true;
        if (this.syncEngine) {
            this.syncEngine.stop();
        }
        
        this.scene.start('GameOverScene', {
            score: ScoreManager.currentScore,
            track: this.track
        });
    }

    update(time, deltaMs) {
        if (this.gameOver) return;

        // Update sync engine
        if (this.syncEngine) {
            this.syncEngine.update(deltaMs);
        }

        // Update player
        if (this.player) {
            this.player.update(deltaMs);
        }

        // Update obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.update();
            
            // Check collision with player
            if (!obstacle.isDespawned && obstacle.checkCollisionWith(this.player)) {
                console.log('Collision detected');
                this.endGame();
            }
        });

        // Remove despawned obstacles
        this.obstacles = this.obstacles.filter(o => !o.isDespawned);

        // Update score
        const points = ScoreManager.addFramePoints(deltaMs);
        this.scoreText.setText('Score: ' + ScoreManager.currentScore);
        this.comboText.setText('Combo: ' + ScoreManager.combo);
    }
}

console.log('GameScene loaded');
