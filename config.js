/**
 * VibeRider Configuration
 * Spotify OAuth, API endpoints, and theme definitions
 */

const VIBE_CONFIG = {
    // ========================================
    // Spotify OAuth Configuration
    // ========================================
    spotify: {
        clientId: 'e52f9fdf6d02479f8a4240228a5b1cf4',
        redirectUri: 'https://emieldijkstra.github.io/VibeRider/callback.html',
        scopes: [
            'streaming',
            'user-read-email',
            'user-read-private',
            'user-modify-playback-state',
            'user-read-playback-state'
        ],
        authEndpoint: 'https://accounts.spotify.com/authorize',
        tokenEndpoint: 'https://accounts.spotify.com/api/token',
        apiEndpoint: 'https://api.spotify.com/v1'
    },

    // ========================================
    // Theme Definitions (Genre → Visual Theme)
    // ========================================
    themes: {
        cyborgrid: {
            name: 'CyberGrid',
            genres: ['electronic', 'edm', 'techno', 'house'],
            colors: {
                primary: '#00ffff',
                secondary: '#ff00ff',
                accent: '#00ff88',
                background: '#001a2e'
            },
            particleColor: 0x00ffff,
            bgClass: 'theme-cyborgrid'
        },
        neonstreet: {
            name: 'NeonStreet',
            genres: ['hip-hop', 'trap', 'rap'],
            colors: {
                primary: '#ff9500',
                secondary: '#ffd700',
                accent: '#ff6b35',
                background: '#1a0f00'
            },
            particleColor: 0xff9500,
            bgClass: 'theme-neonstreet'
        },
        chromewave: {
            name: 'ChromeWave',
            genres: ['pop', 'synth-pop', 'dance-pop'],
            colors: {
                primary: '#ff1493',
                secondary: '#ffffff',
                accent: '#ffa0d2',
                background: '#2d1b3d'
            },
            particleColor: 0xff1493,
            bgClass: 'theme-chromewave'
        },
        voidcrash: {
            name: 'VoidCrash',
            genres: ['rock', 'metal', 'heavy metal', 'hard rock'],
            colors: {
                primary: '#ff0000',
                secondary: '#000000',
                accent: '#ff4444',
                background: '#0d0d0d'
            },
            particleColor: 0xff0000,
            bgClass: 'theme-voidcrash'
        },
        dreamfloat: {
            name: 'DreamFloat',
            genres: ['lo-fi', 'chill', 'ambient', 'downtempo'],
            colors: {
                primary: '#8b5cf6',
                secondary: '#3b82f6',
                accent: '#a78bfa',
                background: '#1e1b2f'
            },
            particleColor: 0x8b5cf6,
            bgClass: 'theme-dreamfloat'
        },
        solarrush: {
            name: 'SolarRush',
            genres: ['latin', 'salsa', 'reggaeton', 'tropical'],
            colors: {
                primary: '#ffff00',
                secondary: '#00ff00',
                accent: '#ffaa00',
                background: '#2d2000'
            },
            particleColor: 0xffff00,
            bgClass: 'theme-solarrush'
        },
        goldera: {
            name: 'GoldEra',
            genres: ['classical', 'orchestral', 'baroque', 'symphony'],
            colors: {
                primary: '#ffd700',
                secondary: '#ffffff',
                accent: '#ffed4e',
                background: '#3d2817'
            },
            particleColor: 0xffd700,
            bgClass: 'theme-goldera'
        }
    },

    // ========================================
    // Game Configuration
    // ========================================
    game: {
        // Canvas dimensions
        width: 1920,
        height: 1080,
        
        // Player physics
        playerSpeed: 300,
        jumpForce: 500,
        gravity: 1200,
        groundLevel: 850,
        
        // Obstacles
        obstacleSpeed: 400,
        obstacleWidth: 80,
        obstacleHeight: 150,
        
        // Sync engine
        syncPollInterval: 350, // ms between Spotify position polls
        syncDriftTolerance: 200, // ms acceptable drift before snap correction
        preSpawnBuffer: 2000, // ms ahead to pre-spawn obstacles
        
        // Scoring
        basePointsPerSecond: 100,
        hitMultiplier: 0,
        comboBonus: 1.5,
        
        // Difficulty
        difficultyScalar: {
            easy: 0.7,
            normal: 1.0,
            hard: 1.3
        }
    },

    // ========================================
    // Firebase Configuration (Phase 6)
    // ========================================
    firebase: {
        apiKey: 'YOUR_FIREBASE_API_KEY',
        projectId: 'vibrider-game',
        databaseURL: 'https://vibrider-game.firebaseio.com'
    },

    // ========================================
    // API Cache Configuration
    // ========================================
    cache: {
        ttl: {
            topTracks: 3600000, // 1 hour
            audioFeatures: 3600000, // 1 hour
            audioAnalysis: 86400000 // 24 hours
        },
        storage: 'sessionStorage' // or 'localStorage'
    },

    // ========================================
    // Development Settings
    // ========================================
    dev: {
        debug: true,
        logSync: false,
        mockSpotify: false, // Set true to test without Spotify
        mockTracks: [
            { id: 1, name: 'Track 1', artist: 'Artist 1', duration_ms: 180000 },
            { id: 2, name: 'Track 2', artist: 'Artist 2', duration_ms: 200000 }
        ]
    }
};

// Local dev: use 127.0.0.1 (Spotify treats this differently from 'localhost')
// If running via VS Code port forwarding or ngrok, the production URI is used automatically
if (window.location.hostname === '127.0.0.1') {
    VIBE_CONFIG.spotify.redirectUri = 'http://127.0.0.1:8000';
} else if (window.location.hostname === 'localhost') {
    // Some setups use localhost — map to 127.0.0.1 for consistency
    VIBE_CONFIG.spotify.redirectUri = 'http://127.0.0.1:8000';
}
