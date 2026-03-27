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
    accessToken: null,
    isLoggedIn: false
};

// Create game instance
let game = new Phaser.Game(phaserConfig);

// Initialize on page load – callback handling is done in callback.html
document.addEventListener('DOMContentLoaded', () => {
    console.log('VibeRider initialized');
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
