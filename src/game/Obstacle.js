/**
 * Obstacle – drawn as a colored rectangle (no external texture needed)
 */

class Obstacle {
    constructor(scene, x, y, obstacleData) {
        this.scene       = scene;
        this.type        = obstacleData.type;
        this.isDespawned = false;
        this.speed       = VIBE_CONFIG.game.obstacleSpeed;

        this.W = obstacleData.width  || VIBE_CONFIG.game.obstacleWidth;
        this.H = obstacleData.height || VIBE_CONFIG.game.obstacleHeight;

        const color = this.type === 'wall'    ? 0xff0066
                    : this.type === 'gap'     ? 0x00cc44
                    : /* speedup */             0xffdd00;

        this.rect = scene.add.rectangle(x, y, this.W, this.H, color);
        this.rect.setStrokeStyle(3, 0xffffff, 0.4);
        scene.physics.add.existing(this.rect, false);
        this.rect.body.setVelocityX(-this.speed);
        this.rect.body.setAllowGravity(false);
        this.rect.body.setImmovable(true);
    }

    get x() { return this.rect.x; }
    get y() { return this.rect.y; }

    update() {
        if (this.rect.x < -this.W - 50 && !this.isDespawned) {
            this.isDespawned = true;
            this.rect.destroy();
        }
    }

    getCollisionBounds() {
        return { x: this.rect.x - this.W / 2, y: this.rect.y - this.H / 2,
                 width: this.W, height: this.H };
    }

    checkCollisionWith(player) {
        if (this.type !== 'wall') return false;

        const p = player.getCollisionBounds();
        const o = this.getCollisionBounds();
        return !(
            p.x + p.width  < o.x ||
            p.x            > o.x + o.width ||
            p.y + p.height < o.y ||
            p.y            > o.y + o.height
        );
    }
}

console.log('Obstacle class loaded');
