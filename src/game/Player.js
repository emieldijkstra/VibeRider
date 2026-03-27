/**
 * Player – drawn as a neon rectangle (no external texture needed)
 */

class Player {
    constructor(scene, x, y) {
        this.scene         = scene;
        this.jumpForce     = VIBE_CONFIG.game.jumpForce;
        this.isGrounded    = false;
        this.jumpCooldown  = 0;
        this.W             = 52;
        this.H             = 28;

        // Physics body via a rectangle game object
        this.body = scene.add.rectangle(x, y, this.W, this.H, 0x00ffff);
        scene.physics.add.existing(this.body);
        this.body.body.setCollideWorldBounds(false);
        this.body.body.setMaxVelocityY(900);
        this.body.body.setGravityY(0); // global gravity from phaserConfig handles it

        // Cockpit accent
        this.cockpit = scene.add.rectangle(x + 10, y - 6, 18, 10, 0xffffff);
        // Glow line
        this.glow = scene.add.rectangle(x, y + 16, this.W - 8, 4, 0xff00ff);

        // Input
        const spacebar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spacebar.on('down', () => this.tryJump());
        scene.input.on('pointerdown', () => this.tryJump());

        console.log('Player created');
    }

    get x()  { return this.body.x; }
    get y()  { return this.body.y; }

    tryJump() {
        if (this.isGrounded && this.jumpCooldown <= 0) {
            this.body.body.setVelocityY(-this.jumpForce);
            this.isGrounded   = false;
            this.jumpCooldown = 150;
        }
    }

    update(delta) {
        this.jumpCooldown = Math.max(0, this.jumpCooldown - delta);
        this.isGrounded   = this.body.body.blocked.down;

        // Sync accent pieces
        this.cockpit.setPosition(this.body.x + 10, this.body.y - 6);
        this.glow.setPosition(this.body.x, this.body.y + 14);

        // Tilt slightly when airborne
        const tilt = this.isGrounded ? 0 : -0.15;
        this.body.setRotation(tilt);
        this.cockpit.setRotation(tilt);
        this.glow.setRotation(tilt);
    }

    getCollisionBounds() {
        return { x: this.body.x - this.W / 2, y: this.body.y - this.H / 2,
                 width: this.W, height: this.H };
    }

    hitAnimation() {
        this.body.setFillStyle(0xff0000);
        this.scene.time.delayedCall(150, () => this.body.setFillStyle(0x00ffff));
    }

    addColliderWith(group) {
        this.scene.physics.add.collider(this.body, group);
    }
}

console.log('Player class loaded');
