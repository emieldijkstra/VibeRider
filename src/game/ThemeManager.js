/**
 * Theme Manager
 * Handles theme selection, color schemes, and visual styles
 */

const ThemeManager = {
    currentTheme: null,
    themes: VIBE_CONFIG.themes,

    /**
     * Detect genre from audio features (heuristic)
     */
    detectGenreFromFeatures: function(features) {
        const energy       = features.energy       || 0.5;
        const danceability = features.danceability || 0.5;
        const tempo        = features.tempo        || 120;
        const valence      = features.valence      || 0.5;
        const acousticness = features.acousticness || 0.5;
        const speechiness  = features.speechiness  || 0.05;

        if (acousticness > 0.7 && energy < 0.4)      return 'classical';
        if (energy < 0.35 && tempo < 100)             return 'lo-fi';
        if (speechiness > 0.25 && danceability > 0.6) return 'hip-hop';
        if (danceability > 0.7 && valence > 0.6 && tempo > 110) return 'latin';
        if (energy > 0.75 && tempo > 130)             return 'electronic';
        if (energy > 0.65 && acousticness < 0.2)      return 'rock';
        return 'pop';
    },

    /**
     * Select theme based on genre
     */
    selectThemeByGenre: function(genre) {
        console.log('Selecting theme for genre:', genre);
        
        for (const [key, theme] of Object.entries(this.themes)) {
            if (theme.genres.includes(genre.toLowerCase())) {
                this.setTheme(key);
                return theme;
            }
        }
        
        // Default to CyberGrid if no match
        this.setTheme('cyborgrid');
        return this.themes['cyborgrid'];
    },

    /**
     * Set active theme
     */
    setTheme: function(themeKey) {
        if (!this.themes[themeKey]) {
            console.warn('Theme not found:', themeKey);
            themeKey = 'cyborgrid';
        }

        this.currentTheme = this.themes[themeKey];
        console.log('Theme set to:', this.currentTheme.name);

        // Apply theme to document
        document.body.className = this.currentTheme.bgClass;
        
        // Update CSS variables
        this.applyThemeVariables();

        // Update global gameState if available
        if (typeof gameState !== 'undefined') {
            gameState.currentTheme = themeKey;
        }
    },

    /**
     * Apply theme colors as CSS variables
     */
    applyThemeVariables: function() {
        if (!this.currentTheme) return;

        const root = document.documentElement;
        const colors = this.currentTheme.colors;

        root.style.setProperty('--theme-primary', colors.primary);
        root.style.setProperty('--theme-secondary', colors.secondary);
        root.style.setProperty('--theme-accent', colors.accent);
        root.style.setProperty('--theme-bg', colors.background);
    },

    /**
     * Get current theme colors
     */
    getColors: function() {
        return this.currentTheme ? this.currentTheme.colors : this.themes['cyborgrid'].colors;
    },

    /**
     * Get particle color for current theme
     */
    getParticleColor: function() {
        return this.currentTheme ? this.currentTheme.particleColor : 0x00ffff;
    },

    /**
     * Get theme by key
     */
    getTheme: function(key) {
        return this.themes[key] || this.themes['cyborgrid'];
    },

    /**
     * Get all available themes
     */
    getAllThemes: function() {
        return Object.keys(this.themes);
    }
};

// Initialize with default theme (deferred until DOM is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.setTheme('cyborgrid');
    });
} else {
    ThemeManager.setTheme('cyborgrid');
}

console.log('ThemeManager loaded');
