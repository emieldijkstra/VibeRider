/**
 * Obstacle Class
 * Handles obstacle sprites, physics, and collision detection
 */

class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, obstacleData) {
        super(scene, x, y);
        
        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.data = obstacleData;
        this.type = obstacleData.type; // 'wall' or 'gap' or 'speedup'
        this.speed = VIBE_CONFIG.game.obstacleSpeed;
        this.isSpawned = false;
        this.isDespawned = false;

        // Set dimensions
        this.displayWidth = obstacleData.width || VIBE_CONFIG.game.obstacleWidth;
        this.displayHeight = obstacleData.height || VIBE_CONFIG.game.obstacleHeight;

        // Visual
        this.setColor(this.getColorByType());

        // Physics
        this.body.setVelocityX(-this.speed);
        this.body.setCollideWorldBounds(false);
        this.body.setAllowGravity(false);

        console.log(`Obstacle created: ${this.type}`);
    }

    /**
     * Get color based on obstacle type
     */
    getColorByType() {
        const theme = ThemeManager.currentTheme || ThemeManager.themes['cyborgrid'];
        switch (this.type) {
            case 'wall':
                return 0xff0066; // Magenta wall
            case 'gap':
                return 0x00aa00; // Green gap
            case 'speedup':
                return 0xffff00; // Yellow modifier
            default:
                return 0x00ffff; // Cyan default
        }
    }

    /**
     * Update obstacle state
     */
    update() {
        // Check if despawned
        if (this.x < -this.displayWidth && !this.isDespawned) {
            this.destroySelf();
        }
    }

    /**
     * Get obstacle bounds for collision
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
     * Check collision with player
     */
    checkCollisionWith(player) {
        const pBounds = player.getCollisionBounds();
        const oBounds = this.getCollisionBounds();

        return !(
            pBounds.x + pBounds.width < oBounds.x ||
            pBounds.x > oBounds.x + oBounds.width ||
            pBounds.y + pBounds.height < oBounds.y ||
            pBounds.y > oBounds.y + oBounds.height
        );
    }

    /**
     * Destroy obstacle
     */
    destroySelf() {
        this.isDespawned = true;
        this.destroy();
    }
}

console.log('Obstacle class loaded');
