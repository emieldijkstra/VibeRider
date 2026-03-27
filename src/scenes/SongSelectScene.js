/**
 * SongSelectScene
 * Displays user's top tracks and search functionality
 */

class SongSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SongSelectScene' });
        this.tracks = [];
        this.selectedTrackIndex = 0;
    }

    create() {
        console.log('SongSelectScene created');
        
        this.cameras.main.setBackgroundColor('#001a2e');
        
        // Apply theme
        ThemeManager.setTheme('cyborgrid');

        // Title
        this.add.text(
            this.game.config.width / 2,
            50,
            'SELECT A TRACK',
            {
                font: 'bold 60px Space Grotesk',
                fill: '#00ffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        // Load tracks
        this.loadTracks();

        // Back button
        this.createBackButton();
    }

    /**
     * Load user's top tracks from Spotify
     */
    async loadTracks() {
        try {
            console.log('Loading top tracks...');
            
            const response = await SpotifyAPI.getTopTracks(20);
            this.tracks = response.items || [];

            console.log(`Loaded ${this.tracks.length} tracks`);
            
            if (this.tracks.length > 0) {
                this.displayTracks();
            } else {
                this.showError('No tracks found');
            }
        } catch (error) {
            console.error('Error loading tracks:', error);
            this.showError('Failed to load tracks');
        }
    }

    /**
     * Display tracks on screen
     */
    displayTracks() {
        const startY = 150;
        const trackHeight = 80;

        this.tracks.slice(0, 5).forEach((track, index) => {
            const y = startY + (index * trackHeight);
            
            // Track background
            const bg = this.add.rectangle(
                this.game.config.width / 2,
                y,
                this.game.config.width - 100,
                trackHeight - 10,
                0x1a1a2e,
                1
            );
            bg.setStrokeStyle(2, index === this.selectedTrackIndex ? 0x00ff88 : 0x00ffff);
            bg.setInteractive({ useHandCursor: true });

            // Track info
            const trackName = track.name;
            const artist = track.artists?.[0]?.name || 'Unknown Artist';
            
            this.add.text(y + 10, y - 20, trackName, {
                font: 'bold 20px Space Grotesk',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);

            this.add.text(y + 10, y + 20, artist, {
                font: '14px Space Grotesk',
                fill: '#b0b0b0'
            }).setOrigin(0, 0.5);

            // Play button
            const playButton = this.add.zone(
                this.game.config.width - 80,
                y,
                60,
                50
            );
            playButton.setInteractive({ useHandCursor: true });
            
            this.add.text(this.game.config.width - 80, y, '▶', {
                font: 'bold 30px Space Grotesk',
                fill: '#00ff88',
                align: 'center'
            }).setOrigin(0.5, 0.5);

            // Click handlers
            bg.on('pointerdown', () => this.selectTrack(index));
            playButton.on('pointerdown', () => this.startGame(track));
        });
    }

    /**
     * Select track
     */
    selectTrack(index) {
        this.selectedTrackIndex = index;
        this.scene.restart();
    }

    /**
     * Start game with selected track
     */
    async startGame(track) {
        try {
            console.log('Starting game with track:', track.name);
            
            gameState.currentTrack = track;
            
            // Generate level from track
            // TODO: Implement in Phase 3
            
            this.scene.start('GameScene', { track: track });
        } catch (error) {
            console.error('Error starting game:', error);
            this.showError('Failed to start game');
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
            this.scene.start('MenuScene');
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

console.log('SongSelectScene loaded');
