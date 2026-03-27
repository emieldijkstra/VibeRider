/**
 * Level Generator
 * Converts track data into a game level map.
 * Primary: Spotify audio-analysis API (if available).
 * Fallback: BPM-based procedural generation from track duration + estimated tempo.
 *
 * NOTE: Spotify deprecated /audio-features and /audio-analysis for new apps
 * after September 2024. The fallback path is therefore the primary path for
 * most users — it produces a fun, varied level without those APIs.
 */

const LevelGenerator = {

    /**
     * Main entry point. Accepts optional audioAnalysis (may be null).
     */
    generateLevel: async function(trackId, audioAnalysis, audioFeatures) {
        try {
            // If we have real beat data, use it
            if (audioAnalysis && audioAnalysis.beats && audioAnalysis.beats.length > 10) {
                console.log('Generating level from Spotify audio analysis');
                return this.generateFromAnalysis(trackId, audioAnalysis, audioFeatures);
            }

            // Otherwise use the BPM-based procedural fallback
            console.log('Generating level via BPM fallback (audio-analysis unavailable)');
            const durationMs = audioFeatures?.duration_ms
                            || (audioAnalysis?.track?.duration * 1000)
                            || 180000;
            const tempo      = audioFeatures?.tempo || 120;
            const energy     = audioFeatures?.energy || 0.65;
            return this.generateFromBPM(trackId, durationMs, tempo, energy);
        } catch (err) {
            console.error('Level generation failed, using safe fallback:', err);
            return this.generateFromBPM(trackId, 180000, 120, 0.65);
        }
    },

    // ----------------------------------------------------------------
    // Path A — Spotify audio-analysis data available
    // ----------------------------------------------------------------
    generateFromAnalysis: function(trackId, audioAnalysis, audioFeatures) {
        const obstacles = [];
        const segments  = audioAnalysis.segments || [];
        const beats     = audioAnalysis.beats    || [];
        const median    = this.calcMedianEnergy(segments);

        beats.forEach((beat, i) => {
            const t          = beat.start * 1000;
            const confidence = beat.confidence || 0.5;
            const seg        = segments.find(s => s.start <= beat.start &&
                                                   s.start + s.duration > beat.start);
            const energy     = seg ? seg.energy : 0.5;

            if (confidence > 0.7 && energy > median * 1.2) {
                obstacles.push({
                    id: `ob_${i}_wall`, time: t, type: 'wall',
                    difficulty: Math.min(energy, 1),
                    width: 70 + energy * 40, height: 110 + energy * 90
                });
            } else if (energy < median * 0.8) {
                obstacles.push({
                    id: `ob_${i}_gap`, time: t, type: 'gap',
                    difficulty: 0.3, width: 140, height: 90
                });
            }
        });

        obstacles.sort((a, b) => a.time - b.time);

        return {
            trackId, source: 'analysis',
            duration: audioAnalysis.track?.duration || 180,
            tempo: audioFeatures?.tempo || 120,
            energy: audioFeatures?.energy || 0.65,
            obstacles,
            difficulty: this.calcDifficulty(obstacles)
        };
    },

    // ----------------------------------------------------------------
    // Path B — BPM-based procedural generation (no analysis API needed)
    // ----------------------------------------------------------------
    generateFromBPM: function(trackId, durationMs, tempo, energy) {
        const obstacles  = [];
        const beatIntervalMs = (60 / tempo) * 1000;   // ms per beat
        const durationS  = durationMs / 1000;

        // Build a sequence of beats over the whole track
        const totalBeats = Math.floor((durationMs / beatIntervalMs));

        // Difficulty curve: ramp up over first 25%, steady, spike at 75%
        const difficultyAt = (beatIndex) => {
            const progress = beatIndex / totalBeats;
            if (progress < 0.05) return 0.1;          // intro grace period
            if (progress < 0.20) return 0.3 + progress * 1.5;
            if (progress < 0.75) return 0.5 + energy * 0.3;
            return 0.6 + energy * 0.4;                // intense ending
        };

        // We don't want an obstacle on every beat — pick every 2nd or 4th beat
        // based on energy, and add variety via a seeded pattern
        let spawnEvery = energy > 0.7 ? 2 : energy > 0.4 ? 3 : 4;

        for (let b = 4; b < totalBeats - 4; b++) {
            if (b % spawnEvery !== 0) continue;

            const t    = b * beatIntervalMs;
            const diff = difficultyAt(b);

            // Alternate wall / gap to keep it varied
            const useWall = (b % (spawnEvery * 2) === 0);

            obstacles.push(useWall
                ? { id: `ob_${b}_wall`, time: t, type: 'wall',
                    difficulty: diff,
                    width: 65 + diff * 40,
                    height: 100 + diff * 110 }
                : { id: `ob_${b}_gap`, time: t, type: 'gap',
                    difficulty: diff, width: 130, height: 80 }
            );

            // Occasionally tighten spawn rate mid-track for a "drop" feel
            if (b % 32 === 0 && energy > 0.55) {
                spawnEvery = Math.max(2, spawnEvery - 1);
            } else if (b % 48 === 0 && spawnEvery < 4) {
                spawnEvery++;
            }
        }

        console.log(`BPM level: ${obstacles.length} obstacles over ${Math.round(durationS)}s @ ${tempo} BPM`);

        return {
            trackId, source: 'bpm',
            duration: durationS,
            tempo, energy,
            obstacles,
            difficulty: this.calcDifficulty(obstacles)
        };
    },

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------
    calcMedianEnergy: function(segments) {
        if (!segments || !segments.length) return 0.5;
        const e = segments.map(s => s.energy).sort((a, b) => a - b);
        const m = Math.floor(e.length / 2);
        return e.length % 2 ? e[m] : (e[m - 1] + e[m]) / 2;
    },

    calcDifficulty: function(obstacles) {
        if (!obstacles.length) return 0.5;
        return Math.min(obstacles.reduce((s, o) => s + o.difficulty, 0) / obstacles.length, 1);
    }
};

console.log('LevelGenerator loaded');
