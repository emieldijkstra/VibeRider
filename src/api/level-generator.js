/**
 * Level Generator for procedural level generation
 * Generates ladder of pipe pairs with varying gap positions
 * 
 * Each obstacle pair has:
 * - time: when to spawn (ms)
 * - gapY: vertical center position of the safe gap (0-1080)
 */

const LevelGenerator = {

    /**
     * Main entry point. Generates a sequence of pipe pairs with safe gaps.
     */
    generateLevel: async function(trackId, audioAnalysis, audioFeatures) {
        try {
            const durationMs = audioFeatures?.duration_ms
                            || (audioAnalysis?.track?.duration * 1000)
                            || 180000;
            const tempo      = audioFeatures?.tempo || 120;
            const energy     = audioFeatures?.energy || 0.65;
            
            return this.generateFromBPM(trackId, durationMs, tempo, energy);
        } catch (err) {
            console.error('Level generation failed:', err);
            return this.generateFromBPM(trackId, 180000, 120, 0.65);
        }
    },

    /**
     * BPM-based procedural generation for pipe sequences
     * Generates challenging but fair gap positions
     */
    generateFromBPM: function(trackId, durationMs, tempo, energy) {
        const obstacles = [];
        const beatIntervalMs = (60 / tempo) * 1000;
        const totalBeats = Math.floor(durationMs / beatIntervalMs);
        
        // Difficulty curve based on track progress
        const difficultyAt = (beatIndex) => {
            const progress = beatIndex / totalBeats;
            if (progress < 0.05) return 0.2;          // Easy intro
            if (progress < 0.20) return 0.4 + progress * 1.0;
            if (progress < 0.75) return 0.6 + energy * 0.2;
            return 0.8 + energy * 0.2;                // Hard ending
        };

        // Spawn rate: higher energy = more frequent pipes
        let spawnEvery = energy > 0.7 ? 3 : energy > 0.4 ? 4 : 5;

        for (let b = 4; b < totalBeats - 4; b++) {
            if (b % spawnEvery !== 0) continue;

            const t = b * beatIntervalMs;
            const difficulty = difficultyAt(b);

            // Generate safe gap position with some variety
            const gapY = this.generateGapPosition(difficulty, energy);

            obstacles.push({
                id: `pipe_${b}`,
                time: t,
                gapY: gapY,
                difficulty: difficulty
            });

            // Occasionally increase spawn rate for "drops"
            if (b % 32 === 0 && energy > 0.55 && spawnEvery > 2) {
                spawnEvery--;
            } else if (b % 48 === 0 && spawnEvery < 5) {
                spawnEvery++;
            }
        }

        console.log(`🎵 Generated ${obstacles.length} pipe pairs over ${Math.round(durationMs/1000)}s @ ${tempo} BPM`);

        return {
            trackId,
            source: 'bpm-pipes',
            duration: durationMs / 1000,
            tempo,
            energy,
            obstacles,
            difficulty: this.calcDifficulty(obstacles)
        };
    },

    /**
     * Generate a random but fair gap Y position
     * Higher difficulty = gap moves to more challenging positions (edges)
     */
    generateGapPosition: function(difficulty, energy) {
        const gapSize = VIBE_CONFIG.game.obstacleGapSize;
        const minMargin = 100;  // Keep away from top/bottom edges
        const maxY = 1080 - minMargin - (gapSize / 2);
        const minY = minMargin + (gapSize / 2);
        
        // Easy = gap near middle, Hard = gap at edges
        if (difficulty < 0.3) {
            // Easy: gap around center with small variation
            return 540 + (Math.random() - 0.5) * 150;
        } else if (difficulty < 0.6) {
            // Medium: wider variation
            return minY + Math.random() * (maxY - minY);
        } else {
            // Hard: intentionally tricky positions
            const rand = Math.random();
            if (rand < 0.3) return minY + Math.random() * (maxY - minY) * 0.3;  // Top zone
            if (rand < 0.6) return 540 + (Math.random() - 0.5) * 200;            // Center
            return minY + (maxY - minY) * 0.7 + Math.random() * (maxY - minY) * 0.3; // Bottom
        }
    },

    /**
     * Calculate overall difficulty from obstacle sequence
     */
    calcDifficulty: function(obstacles) {
        if (!obstacles.length) return 0.5;
        const avgDiff = obstacles.reduce((sum, o) => sum + o.difficulty, 0) / obstacles.length;
        return Math.min(avgDiff, 1);
    }
};

console.log('🚀 LevelGenerator (Pipes) loaded');
