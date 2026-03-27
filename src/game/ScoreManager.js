/**
 * Score Manager
 * Handles score calculation, multipliers, and persistence
 */

const ScoreManager = {
    currentScore: 0,
    combo: 0,
    maxCombo: 0,
    accuracy: 0,
    basePointsPerSecond: VIBE_CONFIG.game.basePointsPerSecond,

    /**
     * Initialize score for new game
     */
    reset: function() {
        this.currentScore = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.accuracy = 0;
        console.log('Score reset');
    },

    /**
     * Add points per frame
     */
    addFramePoints: function(deltaMs) {
        const deltaSeconds = deltaMs / 1000;
        const points = Math.floor(this.basePointsPerSecond * deltaSeconds * (1 + (this.combo / 100)));
        this.currentScore += points;
        return points;
    },

    /**
     * Add combo on successful obstacle avoidance
     */
    addCombo: function() {
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        return this.combo;
    },

    /**
     * Break combo on collision
     */
    breakCombo: function() {
        const wasCombo = this.combo;
        this.combo = 0;
        return wasCombo;
    },

    /**
     * Calculate accuracy percentage
     */
    calculateAccuracy: function(totalActions, successfulActions) {
        this.accuracy = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;
        return this.accuracy;
    },

    /**
     * Get current score
     */
    getScore: function() {
        return this.currentScore;
    },

    /**
     * Get game statistics
     */
    getStats: function() {
        return {
            score: this.currentScore,
            combo: this.combo,
            maxCombo: this.maxCombo,
            accuracy: this.accuracy.toFixed(1)
        };
    },

    /**
     * Save score to Firebase
     */
    saveScore: async function(trackId, playerName, difficulty = 'normal') {
        try {
            const scoreData = {
                trackId: trackId,
                playerName: playerName,
                score: this.currentScore,
                accuracy: this.accuracy,
                combo: this.maxCombo,
                difficulty: difficulty,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString()
            };

            // TODO: Implement Firebase save in Phase 6
            console.log('Score saved:', scoreData);
            
            // For now, save to localStorage
            const key = `score_${trackId}_${playerName}`;
            localStorage.setItem(key, JSON.stringify(scoreData));

            return scoreData;
        } catch (error) {
            console.error('Error saving score:', error);
            throw error;
        }
    },

    /**
     * Get personal best for a track
     */
    getPersonalBest: function(trackId) {
        // Stub - will implement with Firebase in Phase 6
        console.log('Fetching personal best for track:', trackId);
        return null;
    }
};

console.log('ScoreManager loaded');
