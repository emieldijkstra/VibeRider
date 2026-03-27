/**
 * LeaderboardScene
 * Displays full leaderboard for selected track
 */

class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
        this.leaderboard = [];
    }

    init(data) {
        this.track = data.track;
    }

    create() {
        console.log('LeaderboardScene created');
        
        this.cameras.main.setBackgroundColor('#001a2e');

        // Apply theme
        ThemeManager.setTheme('cyborgrid');

        // Title
        this.add.text(
            this.game.config.width / 2,
            50,
            'LEADERBOARD',
            {
                font: 'bold 60px Space Grotesk',
                fill: '#00ffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        // Track name
        this.add.text(
            this.game.config.width / 2,
            120,
            this.track.name,
            {
                font: '32px Space Grotesk',
                fill: '#b0b0b0',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        // Load leaderboard
        this.loadLeaderboard();

        // Back button
        this.createBackButton();
    }

    /**
     * Load leaderboard from Firebase
     */
    async loadLeaderboard() {
        try {
            // TODO: Implement Firebase queries in Phase 6
            console.log('Loading leaderboard for track:', this.track.id);
            
            this.displayLeaderboard();
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.showError('Failed to load leaderboard');
        }
    }

    /**
     * Display leaderboard entries
     */
    displayLeaderboard() {
        const startY = 200;
        const entryHeight = 60;

        this.leaderboard.slice(0, 10).forEach((entry, index) => {
            const y = startY + (index * entryHeight);
            
            // Rank
            this.add.text(50, y, `#${index + 1}`, {
                font: 'bold 24px Space Grotesk',
                fill: '#00ffff'
            }).setOrigin(0, 0.5);

            // Name
            this.add.text(150, y, entry.name || 'Unknown', {
                font: 'bold 24px Space Grotesk',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);

            // Score
            this.add.text(this.game.config.width - 100, y, entry.score || '0', {
                font: 'bold 24px Space Grotesk',
                fill: '#00ff88'
            }).setOrigin(1, 0.5);
        });

        if (this.leaderboard.length === 0) {
            this.add.text(
                this.game.config.width / 2,
                this.game.config.height / 2,
                'No scores yet. Be the first!',
                {
                    font: 'bold 32px Space Grotesk',
                    fill: '#b0b0b0',
                    align: 'center'
                }
            ).setOrigin(0.5, 0.5);
        }
    }

    /**
     * Create back button
     */
    createBackButton() {
        const button = this.add.zone(80, 80, 100, 50);
        button.setInteractive({ useHandCursor: true });
        
        this.add.text(80, 80, '← BACK', {
            font: 'bold 20px Space Grotesk',
            fill: '#00ffff'
        }).setOrigin(0.5, 0.5);

        button.on('pointerdown', () => {
            this.scene.start('SongSelectScene');
        });
    }

    /**
     * Show error message
     */
    showError(message) {
        this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2,
            message,
            {
                font: 'bold 40px Space Grotesk',
                fill: '#ff0000',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);
    }

    update() {
        // Handle continuous updates
    }
}

console.log('LeaderboardScene loaded');
