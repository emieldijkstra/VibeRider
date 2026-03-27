/**
 * MenuScene - Main menu with Spotify login
 */

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Load assets if needed
    }

    create() {
        console.log('MenuScene created');
        
        this.cameras.main.setBackgroundColor('#001a2e');
        
        // Apply default theme
        document.body.className = 'theme-cyborgrid';

        // Add title with glow effect
        const title = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 4,
            'VIBRIDER',
            {
                font: 'bold 120px Space Grotesk',
                fill: '#00ffff',
                align: 'center',
                shadow: { offsetX: 2, offsetY: 2, color: '#ff00ff', blur: 15, fill: true }
            }
        );
        title.setOrigin(0.5, 0.5);
        title.setDepth(10);
        
        // Add subtitle
        const subtitle = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 4 + 100,
            'Spotify Rhythm Game',
            {
                font: '32px Space Grotesk',
                fill: '#b0b0b0',
                align: 'center'
            }
        );
        subtitle.setOrigin(0.5, 0.5);
        subtitle.setDepth(10);

        // Check authentication status
        this.checkAuthStatus();
    }

    /**
     * Check if user is already authenticated
     */
    async checkAuthStatus() {
        try {
            const isAuthenticated = await AuthManager.isAuthenticated();
            
            if (isAuthenticated) {
                console.log('User already authenticated');
                
                // Get user profile
                const profile = await AuthManager.getUserProfile();
                if (profile) {
                    gameState.user = profile;
                    gameState.isLoggedIn = true;
                    gameState.accessToken = await AuthManager.getAccessToken();
                    
                    // Transition to song select
                    console.log('Transitioning to SongSelectScene');
                    this.scene.start('SongSelectScene');
                }
            } else {
                // Show login button
                this.createLoginButton();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.createLoginButton();
        }
    }

    /**
     * Create and display login button
     */
    createLoginButton() {
        console.log('Creating login button');
        
        const buttonGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Create login button
        const buttonX = this.game.config.width / 2;
        const buttonY = this.game.config.height / 2 + 100;
        const buttonWidth = 300;
        const buttonHeight = 80;
        
        // Button background (transparent initially)
        const button = this.add.zone(buttonX, buttonY, buttonWidth, buttonHeight);
        button.setInteractive({ useHandCursor: true });
        
        // Button border
        const border = this.add.rectangle(
            buttonX,
            buttonY,
            buttonWidth,
            buttonHeight,
            0x00ffff,
            0
        );
        border.setStrokeStyle(3, 0x00ffff);
        border.setDepth(15);
        
        // Button text
        const buttonText = this.add.text(
            buttonX,
            buttonY,
            'LOGIN WITH SPOTIFY',
            {
                font: 'bold 24px Space Grotesk',
                fill: '#00ffff',
                align: 'center'
            }
        );
        buttonText.setOrigin(0.5, 0.5);
        buttonText.setDepth(16);

        // Interactive events
        button.on('pointerover', () => {
            border.setStrokeStyle(3, 0xff00ff);
            buttonText.setFill('#ff00ff');
            border.setScale(1.1);
            this.tweens.add({
                targets: [border, buttonText],
                duration: 200,
                ease: 'Quad.easeOut'
            });
        });

        button.on('pointerout', () => {
            border.setStrokeStyle(3, 0x00ffff);
            buttonText.setFill('#00ffff');
            border.setScale(1);
        });

        button.on('pointerdown', () => {
            console.log('Login button clicked');
            border.setScale(0.95);
            SpotifyAuth.initiateLogin();
        });

        // Add decorative elements
        this.createDecorations();
    }

    /**
     * Create decorative visual elements
     */
    createDecorations() {
        const width = this.game.config.width;
        const height = this.game.config.height;
        
        // Add animated grid lines
        const graphics = this.make.graphics({ x: 0, y: 0, add: true });
        graphics.lineStyle(1, 0x00ffff, 0.1);
        graphics.setDepth(0);
        
        // Vertical lines
        for (let i = 0; i < width; i += 100) {
            graphics.beginPath();
            graphics.moveTo(i, 0);
            graphics.lineTo(i, height);
            graphics.strokePath();
        }
        
        // Horizontal lines
        for (let i = 0; i < height; i += 100) {
            graphics.beginPath();
            graphics.moveTo(0, i);
            graphics.lineTo(width, i);
            graphics.strokePath();
        }
    }

    update() {
        // Handle any continuous updates
    }
}

console.log('MenuScene loaded');
