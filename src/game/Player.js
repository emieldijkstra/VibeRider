/**
 * Player Class
 * Handles player sprite, physics, and input
 */

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y);
        
        scene.physics.add.existing(this);
        scene.add.existing(this);

        // Movement
        this.speed = VIBE_CONFIG.game.playerSpeed;
        this.jumpForce = VIBE_CONFIG.game.jumpForce;
        this.isGrounded = false;
        this.jumpCooldown = 0;

        // Visual
        this.displayWidth = 60;
        this.displayHeight = 40;
        
        // Physics
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.2);
        this.setBounce(0.2);

        // Input handling
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.spacebar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.setupInputListeners(scene);

        console.log('Player created');
    }

    /**
     * Setup input event listeners
     */
    setupInputListeners(scene) {
        // Listen for spacebar press
        this.spacebar.on('down', () => {
            this.tryJump();
        });

        // Touch input for mobile
        scene.input.on('pointerdown', (pointer) => {
            if (pointer.y > scene.game.config.height / 2) {
                this.tryJump();
            }
        });
    }

    /**
     * Attempt to jump
     */
    tryJump() {
        if (this.isGrounded && this.jumpCooldown <= 0) {
            this.jump();
            this.jumpCooldown = 0.1; // Prevent multiple jumps per frame
        }
    }

    /**
     * Execute jump
     */
    jump() {
        this.setVelocityY(-this.jumpForce);
        this.isGrounded = false;
        console.log('Player jumped');
    }

    /**
     * Update player state
     */
    update(deltaMs) {
        // Update jump cooldown
        this.jumpCooldown = Math.max(0, this.jumpCooldown - deltaMs / 1000);

        // Check if grounded (simple raycast below player)
        const groundY = VIBE_CONFIG.game.groundLevel;
        if (this.y >= groundY) {
            this.setY(groundY);
            this.setVelocityY(0);
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
    }

    /**
     * Get player bounds for collision
     */
    getCollisionBounds() {
        return {
            x: this.x - this.displayWidth / 2,
            y: this.y - this.displayHeight / 2,
            width: this.displayWidth,
            height: this.displayHeight
        };
    }

    /**
     * Play hit animation
     */
    hitAnimation() {
        this.setTint(0xff0000);
        setTimeout(() => this.clearTint(), 100);
    }
}

console.log('Player class loaded');
