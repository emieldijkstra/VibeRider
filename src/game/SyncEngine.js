/**
 * Sync Engine
 * Synchronizes game time with Spotify playback position
 * Handles drift correction and latency mitigation
 */

class SyncEngine {
    constructor(scene) {
        this.scene = scene;
        this.gameTimeMs = 0;
        this.spotifyTimeMs = 0;
        this.driftMs = 0;
        this.offsetMs = 0;
        this.lastPollTime = 0;
        this.pollInterval = VIBE_CONFIG.game.syncPollInterval;
        this.driftTolerance = VIBE_CONFIG.game.syncDriftTolerance;
        this.isRunning = false;
        
        console.log('SyncEngine initialized');
    }

    /**
     * Start sync engine polling
     */
    start() {
        console.log('SyncEngine started');
        this.isRunning = true;
        this.gameTimeMs = 0;
        this.lastPollTime = Date.now();
    }

    /**
     * Stop sync engine
     */
    stop() {
        console.log('SyncEngine stopped');
        this.isRunning = false;
    }

    /**
     * Update sync engine (called every frame)
     */
    update(deltaMs) {
        if (!this.isRunning) return;

        // Update game time
        this.gameTimeMs += deltaMs;
        
        // Poll Spotify position periodically
        const currentTime = Date.now();
        if (currentTime - this.lastPollTime >= this.pollInterval) {
            this.pollSpotifyPosition();
            this.lastPollTime = currentTime;
        }

        // Apply drift correction
        this.correctDrift();
    }

    /**
     * Poll Spotify player current position
     */
    async pollSpotifyPosition() {
        try {
            if (gameState.spotifyPlayer) {
                const state = await gameState.spotifyPlayer.getCurrentState();
                
                if (state && state.position !== undefined) {
                    this.spotifyTimeMs = state.position;
                    this.calculateDrift();
                    
                    if (VIBE_CONFIG.dev.logSync) {
                        console.log(`Sync: Game=${this.gameTimeMs}ms, Spotify=${this.spotifyTimeMs}ms, Drift=${this.driftMs}ms`);
                    }
                }
            }
        } catch (error) {
            console.warn('Error polling Spotify position:', error);
        }
    }

    /**
     * Calculate drift between game time and Spotify time
     */
    calculateDrift() {
        // Drift = Spotify time - (game time + offset)
        this.driftMs = this.spotifyTimeMs - (this.gameTimeMs + this.offsetMs);
    }

    /**
     * Apply drift correction
     */
    correctDrift() {
        if (Math.abs(this.driftMs) > this.driftTolerance) {
            // Large drift: snap correction
            console.log(`Large drift detected (${this.driftMs}ms), snapping correction`);
            this.offsetMs = this.driftMs;
        } else if (Math.abs(this.driftMs) > 50) {
            // Medium drift: gradual correction
            this.offsetMs += this.driftMs * 0.05;
        }
    }

    /**
     * Get synchronized game time (in milliseconds)
     */
    getSyncedTime() {
        return this.gameTimeMs + this.offsetMs;
    }

    /**
     * Get drift information for debugging
     */
    getDriftInfo() {
        return {
            gameTime: this.gameTimeMs,
            spotifyTime: this.spotifyTimeMs,
            offset: this.offsetMs,
            drift: this.driftMs
        };
    }
}

console.log('SyncEngine loaded');
