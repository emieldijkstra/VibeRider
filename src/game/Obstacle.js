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
        
        // Pipe colors - more vibrant
        const pipeColor = 0x22B14C;      // Green pipes like Mario!
        const pipeAccent = 0xFF69B4;     // Pink accent
        
        // Top pipe
        const topHeight = gapY - (gapSize / 2);
        this.top = scene.add.rectangle(x, topHeight / 2, W, topHeight, pipeColor);
        this.top.setStrokeStyle(3, 0x2D5016, 1);
        
        // Top pipe cap (rounded top detail)
        this.topCap = scene.add.rectangle(x, gapY - (gapSize / 2) - 15, W + 10, 30, pipeAccent);
        this.topCap.setStrokeStyle(2, 0x8B3A62, 1);
        
        scene.physics.add.existing(this.top, false);
        this.top.body.setVelocityX(-this.speed);
        this.top.body.setImmovable(true);
        this.top.body.setAllowGravity(false);
        
        // Bottom pipe
        const bottomY = gapY + (gapSize / 2);
        const bottomHeight = 1080 - bottomY;
        this.bottom = scene.add.rectangle(x, bottomY + (bottomHeight / 2), W, bottomHeight, pipeColor);
        this.bottom.setStrokeStyle(3, 0x2D5016, 1);
        
        // Bottom pipe cap (rounded bottom detail)
        this.bottomCap = scene.add.rectangle(x, gapY + (gapSize / 2) + 15, W + 10, 30, pipeAccent);
        this.bottomCap.setStrokeStyle(2, 0x8B3A62, 1);
        
        scene.physics.add.existing(this.bottom, false);
        this.bottom.body.setVelocityX(-this.speed);
        this.bottom.body.setImmovable(true);
        this.bottom.body.setAllowGravity(false);
        
        // Gap highlight (golden/yellow safe zone - more visible!)
        this.gap = scene.add.rectangle(x, gapY, W, gapSize, 0xFFD700);
        this.gap.setAlpha(0.15);
        this.gap.setStrokeStyle(3, 0xFFD700, 0.3);
        
        this.gapY = gapY;
    }

    get x() { return this.top.x; }
    get y() { return this.gapY; }

    update() {
        if (this.top.x < -150 && !this.isDespawned) {
            this.isDespawned = true;
            this.top.destroy();
            this.topCap.destroy();
            this.bottom.destroy();
            this.bottomCap.destroy();
            this.gap.destroy();
        } else {
            // Keep caps and gap in sync
            this.topCap.setPosition(this.top.x, this.top.y - 15);
            this.bottomCap.setPosition(this.bottom.x, this.bottom.y + 15);
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

console.log('🔧 Flappy Bird Pipes loaded');
