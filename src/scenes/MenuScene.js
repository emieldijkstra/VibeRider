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
        console.log('🎮 MenuScene created');
        
        const W = this.game.config.width;
        const H = this.game.config.height;

        // ── Background (Geometry Dash dark theme) ────────────────
        this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a2e).setOrigin(0.5, 0.5);
        
        // ── Geometric pattern in background ──────────────────────
        const g = this.add.graphics();
        g.lineStyle(2, 0xffd700, 0.15);
        for (let x = 0; x < W; x += 120) {
            for (let y = 0; y < H; y += 120) {
                g.strokeRect(x, y, 100, 100);
            }
        }
        g.setDepth(0);
        
        // ── Title with glow ────────────────────────────────────────
        const title = this.add.text(W / 2, H / 3, 'VIBRIDER', {
            font: 'bold 140px Space Grotesk',
            fill: '#FFD700',
            align: 'center',
            stroke: '#FF69B4',
            strokeThickness: 3
        }).setOrigin(0.5, 0.5).setDepth(10);
        
        // ── Geometric title box ───────────────────────────────────
        this.add.rectangle(W / 2, H / 3 - 15, 650, 140, 0x22B14C)
            .setOrigin(0.5, 0.5)
            .setAlpha(0.2)
            .setStrokeStyle(4, 0xFFD700, 1)
            .setDepth(5);
        
        // ── Subtitle ──────────────────────────────────────────────
        const subtitle = this.add.text(W / 2, H / 3 + 100, '♪ Spotify Rhythm Runner ♪', {
            font: 'bold 36px Space Grotesk',
            fill: '#22B14C',
            align: 'center'
        }).setOrigin(0.5, 0.5).setDepth(10);

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
     * Create and display login button (Geometry Dash style)
     */
    createLoginButton() {
        console.log('🔐 Creating login button');
        
        const W = this.game.config.width;
        const H = this.game.config.height;
        const buttonX = W / 2;
        const buttonY = H / 2 + 120;
        const buttonWidth = 380;
        const buttonHeight = 90;
        
        // Button background box (geometric)
        const buttonBg = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x22B14C, 0.8)
            .setStrokeStyle(4, 0xFFD700, 1)
            .setDepth(15);
        
        // Button text
        const buttonText = this.add.text(buttonX, buttonY, '► LOGIN WITH SPOTIFY ◄', {
            font: 'bold 28px Space Grotesk',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5, 0.5).setDepth(16);

        // Make button interactive
        buttonBg.setInteractive({ useHandCursor: true });

        buttonBg.on('pointerover', () => {
            this.tweens.add({
                targets: [buttonBg],
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 150,
                ease: 'Quad.easeOut'
            });
            buttonBg.setStrokeStyle(4, 0xFF69B4, 1);
            buttonText.setFill('#FFD700');
        });

        buttonBg.on('pointerout', () => {
            this.tweens.add({
                targets: [buttonBg],
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Quad.easeOut'
            });
            buttonBg.setStrokeStyle(4, 0xFFD700, 1);
            buttonText.setFill('#FFFFFF');
        });

        buttonBg.on('pointerdown', () => {
            console.log('🎮 Login button clicked');
            buttonBg.setScale(0.95);
            SpotifyAuth.initiateLogin();
        });

        // Decorative side boxes
        const boxSize = 60;
        const boxGap = 120;
        this.add.rectangle(buttonX - buttonWidth / 2 - boxGap, buttonY, boxSize, boxSize, 0xFF69B4)
            .setStrokeStyle(3, 0xFFD700, 0.6)
            .setDepth(14);
        this.add.rectangle(buttonX + buttonWidth / 2 + boxGap, buttonY, boxSize, boxSize, 0xFF69B4)
            .setStrokeStyle(3, 0xFFD700, 0.6)
            .setDepth(14);
    }
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
