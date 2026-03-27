/**
 * GameOverScene
 * Displays final score and leaderboard preview
 */

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score;
        this.track = data.track;
    }

    create() {
        console.log('GameOverScene created');
        
        this.cameras.main.setBackgroundColor('#001a2e');

        // Apply theme
        ThemeManager.setTheme('cyborgrid');

        // Title
        this.add.text(
            this.game.config.width / 2,
            100,
            'GAME OVER',
            {
                font: 'bold 80px Space Grotesk',
                fill: '#ff0000',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        // Track name
        this.add.text(
            this.game.config.width / 2,
            200,
            this.track.name,
            {
                font: 'bold 40px Space Grotesk',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        // Score display
        this.add.text(
            this.game.config.width / 2,
            350,
            'FINAL SCORE',
            {
                font: 'bold 40px Space Grotesk',
                fill: '#00ffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        this.add.text(
            this.game.config.width / 2,
            450,
            this.finalScore.toString(),
            {
                font: 'bold 120px Space Grotesk',
                fill: '#00ff88',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        // Stats
        const stats = ScoreManager.getStats();
        this.add.text(
            this.game.config.width / 2,
            600,
            `Combo: ${stats.combo} | Accuracy: ${stats.accuracy}%`,
            {
                font: 'bold 24px Space Grotesk',
                fill: '#b0b0b0',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        // Buttons
        this.createButtons();
    }

    /**
     * Create action buttons
     */
    createButtons() {
        const buttonY = this.game.config.height - 150;
        const buttonWidth = 200;
        const buttonHeight = 70;

        // Try Again button
        const tryAgainBtn = this.add.zone(
            this.game.config.width / 2 - 250,
            buttonY,
            buttonWidth,
            buttonHeight
        );
        tryAgainBtn.setInteractive({ useHandCursor: true });

        const tryAgainText = this.add.text(
            this.game.config.width / 2 - 250,
            buttonY,
            'TRY AGAIN',
            {
                font: 'bold 20px Space Grotesk',
                fill: '#00ffff'
            }
        ).setOrigin(0.5, 0.5);

        tryAgainBtn.on('pointerdown', () => {
            ScoreManager.reset();
            this.scene.start('GameScene', { track: this.track });
        });

        // Menu button
        const menuBtn = this.add.zone(
            this.game.config.width / 2 + 250,
            buttonY,
            buttonWidth,
            buttonHeight
        );
        menuBtn.setInteractive({ useHandCursor: true });

        const menuText = this.add.text(
            this.game.config.width / 2 + 250,
            buttonY,
            'MENU',
            {
                font: 'bold 20px Space Grotesk',
                fill: '#00ffff'
            }
        ).setOrigin(0.5, 0.5);

        menuBtn.on('pointerdown', () => {
            ScoreManager.reset();
            this.scene.start('MenuScene');
        });
    }

    update() {
        // Handle continuous updates
    }
}

console.log('GameOverScene loaded');
