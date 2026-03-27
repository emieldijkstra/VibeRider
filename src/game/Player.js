/**
 * Player – Flying character (Flappy Bird style)
 * Click/Spacebar to flap upward, gravity pulls down
 */

class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.flapForce = VIBE_CONFIG.game.playerFlapForce;
        this.gravity = VIBE_CONFIG.game.playerGravity;
        this.maxVelocity = VIBE_CONFIG.game.playerMaxVelocity;
        this.size = VIBE_CONFIG.game.playerSize;
        
        this.velocityY = 0;
        this.isDead = false;

        // Yellow circle with eyes (Mario-ish character)
        this.circle = scene.add.circle(x, y, this.size, 0xffdd00);
        this.circle.setStroke(0x000000, 3);
        
        // Eyes for personality
        this.leftEye = scene.add.circle(x - 10, y - 8, 5, 0x000000);
        this.rightEye = scene.add.circle(x + 10, y - 8, 5, 0x000000);
        
        // Physics body
        scene.physics.add.existing(this.circle);
        this.circle.body.setCollideWorldBounds(true);
        this.circle.body.setBounce(0.1);
        this.circle.body.setAllowGravity(false);

        // Input handlers: click or spacebar to flap
        const spacebar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spacebar.on('down', () => this.flap());
        scene.input.on('pointerdown', () => this.flap());

        console.log('🐦 Flying Player created');
    }

    get x() { return this.circle.x; }
    get y() { return this.circle.y; }

    flap() {
        if (!this.isDead) {
            this.velocityY = -this.flapForce;
        }
    }

    update(delta) {
        // Apply gravity
        this.velocityY = Math.min(
            this.velocityY + (this.gravity * delta / 1000),
            this.maxVelocity
        );
        
        // Update position
        this.circle.y += this.velocityY;
        
        // Sync eyes with circle
        this.leftEye.setPosition(this.circle.x - 10, this.circle.y - 8);
        this.rightEye.setPosition(this.circle.x + 10, this.circle.y - 8);
        
        // Tilt based on velocity (spin effect)
        const tilt = Phaser.Math.Clamp(this.velocityY / 300, -0.5, 0.5);
        this.circle.setRotation(tilt);
        
        // Death by screen bounds
        if (this.circle.y - this.size < 0 || this.circle.y + this.size > 1080) {
            this.die();
        }
    }

    die() {
        if (!this.isDead) {
            this.isDead = true;
            this.circle.setFillStyle(0xff0000);
            this.leftEye.setFillStyle(0xffffff);
            this.rightEye.setFillStyle(0xffffff);
        }
    }

    getCollisionBounds() {
        return {
            x: this.circle.x - this.size,
            y: this.circle.y - this.size,
            width: this.size * 2,
            height: this.size * 2
        };
    }

    destroy() {
        this.circle.destroy();
        this.leftEye.destroy();
        this.rightEye.destroy();
    }
}

console.log('🎮 Player (Flying) class loaded');
