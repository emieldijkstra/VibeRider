/**
 * Level Generator
 * Converts Spotify audio analysis into game level map
 */

const LevelGenerator = {
    /**
     * Generate level from Spotify audio analysis
     */
    generateLevel: async function(trackId, audioAnalysis, audioFeatures) {
        try {
            console.log('Generating level for track:', trackId);

            const obstacles = [];
            const segments = audioAnalysis.segments || [];
            const beats = audioAnalysis.beats || [];
            
            const medianEnergy = this.calculateMedianEnergy(segments);

            // Process beats into obstacles
            beats.forEach((beat, index) => {
                const timeMs = beat.start * 1000;
                const confidence = beat.confidence || 0.5;
                
                // Get energy at this beat
                const segment = segments.find(s => s.start <= beat.start && s.start + s.duration > beat.start);
                const energy = segment ? segment.energy : 0.5;

                // Spawn wall on strong beats with high energy
                if (confidence > 0.7 && energy > medianEnergy * 1.2) {
                    obstacles.push({
                        id: `obstacle_${index}_wall`,
                        time: timeMs,
                        type: 'wall',
                        difficulty: Math.min(energy, 1.0),
                        width: 80 + (energy * 40),
                        height: 120 + (energy * 80)
                    });
                }
                // Spawn gap on weak beats with low energy
                else if (energy < medianEnergy * 0.8) {
                    obstacles.push({
                        id: `obstacle_${index}_gap`,
                        time: timeMs,
                        type: 'gap',
                        difficulty: Math.max(1 - energy, 0.1),
                        width: 150,
                        height: 100
                    });
                }
            });

            // Add speedup modifiers at energy peaks
            segments.forEach((segment, index) => {
                if (segment.energy > 0.8 && segment.confidence > 0.7) {
                    obstacles.push({
                        id: `modifier_${index}_speedup`,
                        time: segment.start * 1000,
                        type: 'speedup',
                        difficulty: segment.energy,
                        duration: segment.duration * 1000
                    });
                }
            });

            // Sort by time
            obstacles.sort((a, b) => a.time - b.time);

            const levelData = {
                trackId: trackId,
                duration: audioAnalysis.track?.duration || 180,
                tempo: audioFeatures.tempo,
                energy: audioFeatures.energy,
                genre: this.detectGenre(audioFeatures),
                obstacles: obstacles,
                difficulty: this.calculateDifficulty(obstacles)
            };

            console.log(`Level generation complete: ${obstacles.length} obstacles`);
            return levelData;
        } catch (error) {
            console.error('Error generating level:', error);
            throw error;
        }
    },

    /**
     * Calculate median energy from segments
     */
    calculateMedianEnergy: function(segments) {
        if (!segments || segments.length === 0) return 0.5;
        
        const energies = segments.map(s => s.energy).sort((a, b) => a - b);
        const mid = Math.floor(energies.length / 2);
        
        if (energies.length % 2 === 0) {
            return (energies[mid - 1] + energies[mid]) / 2;
        }
        return energies[mid];
    },

    /**
     * Detect genre from audio features
     */
    detectGenre: function(audioFeatures) {
        // Stub - will use genre data from Spotify in Phase 3
        const energy = audioFeatures.energy || 0.5;
        const danceability = audioFeatures.danceability || 0.5;
        
        if (energy > 0.7 && danceability > 0.7) {
            return 'electronic';
        } else if (danceability > 0.7) {
            return 'hip-hop';
        }
        return 'pop';
    },

    /**
     * Calculate overall difficulty rating
     */
    calculateDifficulty: function(obstacles) {
        if (obstacles.length === 0) return 0.5;
        
        const avgDifficulty = obstacles.reduce((sum, o) => sum + o.difficulty, 0) / obstacles.length;
        return Math.min(avgDifficulty, 1.0);
    },

    /**
     * Fallback level generation using Web Audio API
     */
    generateLevelFromAudio: async function(trackId, audioContext, duration) {
        console.log('Generating level from Web Audio API data...');
        
        // Stub for Phase 3 - real-time beat detection
        const obstacles = [];
        for (let i = 0; i < 30; i++) {
            obstacles.push({
                id: `obstacle_waveform_${i}`,
                time: (duration / 30) * i * 1000,
                type: Math.random() > 0.6 ? 'gap' : 'wall',
                difficulty: Math.random(),
                width: 80,
                height: 150
            });
        }
        
        return {
            trackId: trackId,
            duration: duration,
            obstacles: obstacles,
            difficulty: 0.5
        };
    }
};

console.log('LevelGenerator loaded');
