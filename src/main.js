/**
 * VibeRider - Main Phaser Initialization
 * Sets up game config and launches scenes
 */

const phaserConfig = {
    type: Phaser.AUTO,
    width: VIBE_CONFIG.game.width,
    height: VIBE_CONFIG.game.height,
    parent: 'phaser-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        expandParent: true,
        fullscreenTarget: 'phaser-container'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: VIBE_CONFIG.game.gravity },
            debug: VIBE_CONFIG.dev.debug,
            debugShowBody: false,
            debugShowStaticBody: false
        }
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true
    },
    scene: [
        MenuScene,
        SongSelectScene,
        GameScene,
        GameOverScene,
        LeaderboardScene
    ]
};

// Global game state
const gameState = {
    user: null,
    currentTrack: null,
    currentScore: 0,
    currentTheme: null,
    spotifyPlayer: null,
    spotifyDeviceId: null,
    accessToken: null,
    isLoggedIn: false
};

// Create game instance
let game = new Phaser.Game(phaserConfig);

// ============================================================
// Spotify Web Playback SDK
// The SDK calls window.onSpotifyWebPlaybackSDKReady when ready
// ============================================================
window.onSpotifyWebPlaybackSDKReady = () => {
    console.log('Spotify Web Playback SDK ready');

    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
        console.log('No token yet — SDK will be re-initialised after login');
        return;
    }

    initSpotifyPlayer(token);
};

function initSpotifyPlayer(token) {
    const player = new Spotify.Player({
        name: 'VibeRider',
        getOAuthToken: cb => cb(token),
        volume: 0.8
    });

    // Store reference globally
    gameState.spotifyPlayer = player;

    player.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player ready, device ID:', device_id);
        gameState.spotifyDeviceId = device_id;
    });

    player.addListener('not_ready', ({ device_id }) => {
        console.warn('Spotify Player device went offline:', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error('SDK init error:', message);
    });

    player.addListener('authentication_error', ({ message }) => {
        console.error('SDK auth error:', message);
        AuthManager.clearTokens();
    });

    player.addListener('account_error', ({ message }) => {
        console.error('SDK account error (Spotify Premium required):', message);
    });

    player.connect().then(success => {
        if (success) {
            console.log('Spotify Player connected successfully');
        }
    });
}

// Initialize on page load – callback handling is done in callback.html
document.addEventListener('DOMContentLoaded', () => {
    console.log('VibeRider initialized');

    // If the SDK loaded before a token was available, init now
    const token = localStorage.getItem('spotify_access_token');
    if (token && !gameState.spotifyPlayer && typeof Spotify !== 'undefined') {
        initSpotifyPlayer(token);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    game.scale.refresh();
});

// Prevent accidental refresh
window.addEventListener('beforeunload', (e) => {
    if (gameState.isLoggedIn && game.scene.isActive('GameScene')) {
        e.preventDefault();
        e.returnValue = '';
    }
});

console.log('Main.js loaded');
