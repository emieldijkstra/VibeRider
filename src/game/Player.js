/**
 * Player – Flying character
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

        // Create a larger, more visible character
        // Main body - bigger yellow circle
        this.body = scene.add.circle(x, y, this.size, 0xffdd00);
        this.body.setStrokeStyle(4, 0x333333, 1);
        
        // Cheek circles (red/pink)
        this.leftCheek = scene.add.circle(x - 28, y + 5, 12, 0xff6b9d);
        this.rightCheek = scene.add.circle(x + 28, y + 5, 12, 0xff6b9d);
        
        // Eyes - big and expressive
        this.leftEye = scene.add.circle(x - 12, y - 15, 8, 0xffffff);
        this.rightEye = scene.add.circle(x + 12, y - 15, 8, 0xffffff);
        
        // Pupils
        this.leftPupil = scene.add.circle(x - 12, y - 15, 4, 0x000000);
        this.rightPupil = scene.add.circle(x + 12, y - 15, 4, 0x000000);
        
        // Beak/mouth (orange triangle-ish)
        const mouthColor = 0xFF9500;
        this.mouth = scene.add.polygon(x, y + 20, [
            0, -8,   // top
            -10, 8,  // bottom left
            10, 8    // bottom right
        ], mouthColor);
        
        // Physics body (no gravity, we handle it manually)
        scene.physics.add.existing(this.body);
        this.body.body.setCollideWorldBounds(true);
        this.body.body.setBounce(0);
        this.body.body.setAllowGravity(false);
        this.body.body.setVelocity(0, 0); // Start stationary
        this.body.body.setDrag(0);
        this.body.body.setDamping(false);
        this.body.body.setMass(1);

        // Store scene reference for input
        this.scene = scene;
        
        // INPUT HANDLERS - bind to scene, not to this
        const spacebar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spacebar.on('down', () => {
            console.log('🅣 SPACEBAR PRESSED');
            this.flap();
        });
        
        scene.input.on('pointerdown', () => {
            console.log('🅣 CLICK DETECTED');
            this.flap();
        });

        console.log('🐦 Player created at', x, y);
    }

    get x() { return this.body.x; }
    get y() { return this.body.y; }

    flap() {
        if (this.isDead) return;
        console.log('⬆️ FLAP! Setting velocity to', -this.flapForce);
        this.velocityY = -this.flapForce;
        // Particle effect on flap
        this.createFlapEffect();
    }

    createFlapEffect() {
        // Simple particle burst upward when flapping
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const particle = this.scene.add.circle(
                this.body.x + Math.cos(angle) * 20,
                this.body.y + Math.sin(angle) * 20,
                3,
                0xffff00
            );
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                y: particle.y - 40,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }

    update(delta) {
        // Apply gravity
        this.velocityY = Math.min(
            this.velocityY + (this.gravity * delta / 1000),
            this.maxVelocity
        );
        
        // Update position
        this.body.y += this.velocityY;
        
        // Sync all parts to body position
        const offset = 0;
        this.leftCheek.setPosition(this.body.x - 28, this.body.y + 5);
        this.rightCheek.setPosition(this.body.x + 28, this.body.y + 5);
        this.leftEye.setPosition(this.body.x - 12, this.body.y - 15);
        this.rightEye.setPosition(this.body.x + 12, this.body.y - 15);
        this.leftPupil.setPosition(this.body.x - 12, this.body.y - 15);
        this.rightPupil.setPosition(this.body.x + 12, this.body.y - 15);
        this.mouth.setPosition(this.body.x, this.body.y + 20);
        
        // Tilt based on velocity
        const tilt = Phaser.Math.Clamp(this.velocityY / 300, -0.4, 0.4);
        this.body.setRotation(tilt);
        
        // World bounds check
        if (this.body.y - this.size < 0 || this.body.y + this.size > 1080) {
            this.die();
        }
    }

    die() {
        if (!this.isDead) {
            this.isDead = true;
            this.body.setFillStyle(0xff0000);
            this.leftEye.setFillStyle(0xff0000);
            this.rightEye.setFillStyle(0xff0000);
            
            // X-eyes effect
            this.scene.tweens.add({
                targets: [this.leftPupil, this.rightPupil],
                alpha: 0,
                duration: 200
            });
        }
    }

    getCollisionBounds() {
        return {
            x: this.body.x - this.size,
            y: this.body.y - this.size,
            width: this.size * 2,
            height: this.size * 2
        };
    }

    destroy() {
        this.body.destroy();
        this.leftCheek.destroy();
        this.rightCheek.destroy();
        this.leftEye.destroy();
        this.rightEye.destroy();
        this.leftPupil.destroy();
        this.rightPupil.destroy();
        this.mouth.destroy();
    }
}

console.log('🎮 Player loaded');
