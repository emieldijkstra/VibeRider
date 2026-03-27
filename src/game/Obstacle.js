/**
 * Obstacle – Paired top/bottom pipes (Flappy Bird style)
 * Player must fly through the gap between them
 */

class Obstacle {
    constructor(scene, x, gapY, obstacleData) {
        this.scene = scene;
        this.isDespawned = false;
        this.speed = VIBE_CONFIG.game.obstacleSpeed;
        
        const W = VIBE_CONFIG.game.obstacleWidth;
        const gapSize = VIBE_CONFIG.game.obstacleGapSize;
        
        // Top pipe (orange/red)
        const topHeight = gapY - (gapSize / 2);
        this.top = scene.add.rectangle(x, topHeight / 2, W, topHeight, 0xff6b4a);
        this.top.setStroke(0xffffff, 2);
        scene.physics.add.existing(this.top, false);
        this.top.body.setVelocityX(-this.speed);
        this.top.body.setImmovable(true);
        this.top.body.setAllowGravity(false);
        
        // Bottom pipe (orange/red)
        const bottomY = gapY + (gapSize / 2);
        const bottomHeight = 1080 - bottomY;
        this.bottom = scene.add.rectangle(x, bottomY + (bottomHeight / 2), W, bottomHeight, 0xff6b4a);
        this.bottom.setStroke(0xffffff, 2);
        scene.physics.add.existing(this.bottom, false);
        this.bottom.body.setVelocityX(-this.speed);
        this.bottom.body.setImmovable(true);
        this.bottom.body.setAllowGravity(false);
        
        // Gap highlight (green safe zone - semi-transparent)
        this.gap = scene.add.rectangle(x, gapY, W, gapSize, 0x00cc44);
        this.gap.setAlpha(0.1);
        this.gap.setStroke(0x00cc44, 2);
        
        this.gapY = gapY;
    }

    get x() { return this.top.x; }
    get y() { return this.gapY; }

    update() {
        if (this.top.x < -100 && !this.isDespawned) {
            this.isDespawned = true;
            this.top.destroy();
            this.bottom.destroy();
            this.gap.destroy();
        } else {
            // Keep gap in sync with pipes
            this.gap.setPosition(this.top.x, this.gapY);
        }
    }

    checkCollisionWith(player) {
        const pb = player.getCollisionBounds();
        const pipeX = this.top.x;
        const pipeRadius = VIBE_CONFIG.game.obstacleWidth / 2;
        
        // Only check collision if player is horizontally aligned with pipe
        if (pb.x + pb.width < pipeX - pipeRadius || pb.x > pipeX + pipeRadius) {
            return false;
        }
        
        // Check collision with top pipe
        const topBottom = (this.gapY - VIBE_CONFIG.game.obstacleGapSize / 2);
        if (pb.y < topBottom) {
            return true;
        }
        
        // Check collision with bottom pipe
        const bottomTop = (this.gapY + VIBE_CONFIG.game.obstacleGapSize / 2);
        if (pb.y + pb.height > bottomTop) {
            return true;
        }
        
        return false; // Safe in gap!
    }
}

console.log('🔧 Obstacle (Pipes) class loaded');
