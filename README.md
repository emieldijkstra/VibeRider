# VibeRider - Spotify Rhythm Game

A Geometry Dash-style rhythm game with live Spotify integration that synchronizes gameplay with real-time music playback.

## ✨ Features

- **Spotify Integration**: Authenticate securely via OAuth PKCE, play from user's library
- **Procedural Level Generation**: Levels dynamically generated from Spotify audio analysis (beats, energy, segments)
- **Real-time Sync Engine**: Synchronizes gameplay with Spotify playback position with ±150ms drift tolerance
- **Dynamic Themes**: Visual themes adapt based on music genre (7 unique themes)
- **Leaderboards**: Global score tracking per track with Firebase Firestore
- **Mobile-Ready**: Touch-friendly controls, responsive design, haptic feedback

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/emieldijkstra/VibeRider.git
cd VibeRider

# Start local web server (choose one)
python -m http.server 8000
# or
npx http-server

# Open browser
http://localhost:8000/callback
```

### Spotify App Setup

1. Create a Spotify Developer App: https://developer.spotify.com/dashboard
2. Set Redirect URI to `http://localhost:8000/callback` (dev) or `https://emieldijkstra.github.io/VibeRider/callback` (prod)
3. Update `config.js` with your `clientId`

## 📋 Development Roadmap

| Phase | Status | Tasks |
|-------|--------|-------|
| 1 | ✅ Complete | Auth & Menu Setup |
| 2 | 🔄 In Progress | Spotify Integration |
| 3 | ⏳ Planned | Level Generation & Theming |
| 4 | ⏳ Planned | Game Core & Sync Engine |
| 5 | ⏳ Planned | Polish & Mobile |
| 6 | ⏳ Planned | Firebase Leaderboards |
| 7 | ⏳ Planned | Production Deployment |

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Phaser.js 3.55+** | Game engine |
| **Spotify Web API** | Audio analysis & playback |
| **Web Audio API** | Real-time beat detection (fallback) |
| **Firebase Firestore** | Leaderboard persistence (Phase 6) |
| **GitHub Pages** | Static hosting |
| **OAuth PKCE** | Secure authentication |

## 📁 Project Structure

```
VibeRider/
├── index.html                 # Entry point
├── style.css                  # Global styles + 7 themes
├── config.js                  # Spotify credentials & config
├── src/
│   ├── main.js               # Phaser initialization
│   ├── auth/
│   │   ├── spotify-auth.js   # PKCE OAuth flow
│   │   └── auth-manager.js   # Token storage & refresh
│   ├── api/
│   │   ├── spotify-api.js    # API wrapper (cached)
│   │   └── level-generator.js# Beats → obstacles algorithm
│   ├── game/
│   │   ├── SyncEngine.js     # Spotify ↔ Game sync
│   │   ├── Player.js         # Player physics & input
│   │   ├── Obstacle.js       # Obstacle collision
│   │   ├── ThemeManager.js   # Genre → theme mapping
│   │   └── ScoreManager.js   # Scoring & persistence
│   └── scenes/
│       ├── MenuScene.js      # Login
│       ├── SongSelectScene.js# Track selection
│       ├── GameScene.js      # Main gameplay
│       ├── GameOverScene.js  # Score display
│       └── LeaderboardScene.js# Global leaderboard
├── assets/
│   ├── fonts/                # Space Grotesk (CDN)
│   └── sfx/                  # Sound effects
└── .gitignore
```

## 🎮 Gameplay

### Controls
- **Desktop**: SPACEBAR to jump
- **Mobile**: Tap bottom half of screen to jump

### Sync Strategy
- Polls Spotify position every 250-500ms
- Drift tolerance: ±150-200ms before snap correction
- Pre-spawns obstacles 1.5-2s ahead to mask latency

### Scoring
- Base: 100 points/second
- Combo multiplier: +1.5% per consecutive obstacle dodged
- Accuracy bonus: tied to hit timing

## 🎨 Themes (Genre-Based)

| Genre | Theme | Colors |
|-------|-------|--------|
| EDM / Electronic | CyberGrid | Cyan + Magenta |
| Hip-Hop / Trap | NeonStreet | Orange + Gold |
| Pop | ChromeWave | Pink + White |
| Rock / Metal | VoidCrash | Red + Black |
| Lo-fi / Chill | DreamFloat | Purple + Blue |
| Latin / Salsa | SolarRush | Yellow + Green |
| Classical | GoldEra | Gold + White |

## 🔒 Security

- **PKCE OAuth**: No client secret exposed (S256 challenge method)
- **Token Storage**: localStorage with expiry validation
- **CSRF Protection**: State parameter in authorization flow
- **Firestore Rules**: Signed authentication required (Phase 6)

## 📊 Performance Targets

- **Load Time**: < 3 seconds (mobile)
- **Framerate**: 60 FPS
- **Sync Latency**: < 200ms drift tolerance
- **API Calls**: Cached 1 hour (sessionStorage)
- **Firestore Quota**: Batch writes, cursor-based pagination

## 🧪 Testing Checklist

- [ ] Spotify login works (incognito window)
- [ ] Top 50 tracks load correctly
- [ ] Audio features API returns valid data
- [ ] Game synchs with playback (test on different devices)
- [ ] Mobile touch input responsive
- [ ] No console errors in production
- [ ] Leaderboard saves/loads (Phase 6)
- [ ] Theme switches on genre change

## 📝 Known Limitations

| Limitation | Workaround |
|-----------|-----------|
| Spotify API rate limit (180 req/min) | Cache responses 1 hour |
| Network latency | SyncEngine drift tolerance ±150ms |
| Web Audio CORS restriction | Use Spotify Web Playback SDK only |
| Firestore free tier quota | Batch writes, limit top-10 queries |

## 🚀 Deployment

### GitHub Pages

```bash
# Deploy to production
git add .
git commit -m "Phase X: [description]"
git push -u origin main

# Verify at: https://emieldijkstra.github.io/VibeRider/
```

### Pre-Deploy Checklist

- [ ] Update Spotify callback URL to production
- [ ] No console errors or warnings
- [ ] Test full flow (login → play → leaderboard)
- [ ] Test on mobile device (5G & WiFi)
- [ ] Firebase credentials updated (Phase 6)

## 📚 Resources

- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [Spotify Audio Analysis](https://developer.spotify.com/documentation/web-api/reference/get-audio-analysis)
- [Phaser 3 Docs](https://newdocs.phaser.io/)
- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [PKCE OAuth Flow](https://tools.ietf.org/html/rfc7636)

## 📄 License

MIT License - Feel free to fork and customize

## 👤 Author

**Emiel Dijkstra**  
- GitHub: [@emieldijkstra](https://github.com/emieldijkstra)
- VibeRider Live: https://emieldijkstra.github.io/VibeRider/
