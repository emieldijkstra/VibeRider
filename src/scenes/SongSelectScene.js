/**
 * SongSelectScene
 * Displays user's top tracks with album art, search, and pagination
 */

class SongSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SongSelectScene' });
        this.tracks = [];
        this.filteredTracks = [];
        this.pageOffset = 0;
        this.tracksPerPage = 6;
        this.searchQuery = '';
        this.searchTimeout = null;
        this.loadingText = null;
        this.trackRows = [];
        this.searchInput = null;
    }

    create() {
        console.log('🎵 SongSelectScene created');

        const W = this.scale.width;
        const H = this.scale.height;

        // ── Background (Geometry Dash style) ──────────────────────
        this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a2e).setOrigin(0.5, 0.5);
        
        // ── Geometric grid pattern ─────────────────────────────────
        const g = this.add.graphics();
        g.lineStyle(1, 0xffd700, 0.1);
        for (let x = 0; x < W; x += 120) {
            for (let y = 0; y < H; y += 120) {
                g.strokeRect(x, y, 100, 100);
            }
        }

        // ── Header ──────────────────────────────────────────────
        const headerBg = this.add.rectangle(W / 2, 60, W, 100, 0x22B14C, 0.3)
            .setStrokeStyle(3, 0xFFD700, 1);
        
        this.add.text(W / 2, 45, '♪ SELECT YOUR TRACK ♪', {
            font: 'bold 48px Space Grotesk',
            fill: '#FFD700',
            stroke: '#22B14C',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5, 0.5).setDepth(10);

        // User greeting
        if (gameState.user) {
            this.add.text(W - 30, 15, `👤 ${gameState.user.display_name}`, {
                font: 'bold 18px Space Grotesk',
                fill: '#22B14C'
            }).setOrigin(1, 0).setDepth(10);
        }

        // Logout button
        const logoutBtn = this.add.rectangle(W - 100, 60, 150, 50, 0xFF69B4, 0.8)
            .setStrokeStyle(2, 0xFFD700, 1)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);
        
        const logoutText = this.add.text(W - 100, 60, '⊗ LOGOUT', {
            font: 'bold 18px Space Grotesk',
            fill: '#FFFFFF'
        }).setOrigin(0.5, 0.5).setDepth(11);
        
        logoutBtn.on('pointerover', () => { logoutBtn.setFillStyle(0xFF1493); logoutText.setFill('#FFD700'); });
        logoutBtn.on('pointerout', () => { logoutBtn.setFillStyle(0xFF69B4); logoutText.setFill('#FFFFFF'); });
        logoutBtn.on('pointerdown', () => SpotifyAuth.logout());

        // ── Search bar (DOM overlay) ─────────────────────────────
        this.createSearchBar(W);

        // ── Loading indicator ───────────────────────────────────
        this.loadingText = this.add.text(W / 2, H / 2, '⏳ Loading tracks…', {
            font: '32px Space Grotesk',
            fill: '#FFD700'
        }).setOrigin(0.5, 0.5).setDepth(20);

        // ── Pagination (Geometry Dash style) ────────────────────
        const btnH = H - 80;
        
        this.prevBtn = this.add.rectangle(100, btnH, 140, 60, 0x22B14C, 0.8)
            .setStrokeStyle(3, 0xFFD700, 1)
            .setInteractive({ useHandCursor: true })
            .setVisible(false)
            .setDepth(10);
        
        this.prevText = this.add.text(100, btnH, '◀ PREV', {
            font: 'bold 20px Space Grotesk',
            fill: '#FFFFFF'
        }).setOrigin(0.5, 0.5).setVisible(false).setDepth(11);

        this.nextBtn = this.add.rectangle(W - 100, btnH, 140, 60, 0x22B14C, 0.8)
            .setStrokeStyle(3, 0xFFD700, 1)
            .setInteractive({ useHandCursor: true })
            .setVisible(false)
            .setDepth(10);
        
        this.nextText = this.add.text(W - 100, btnH, 'NEXT ▶', {
            font: 'bold 20px Space Grotesk',
            fill: '#FFFFFF'
        }).setOrigin(0.5, 0.5).setVisible(false).setDepth(11);

        this.pageLabel = this.add.text(W / 2, btnH, '', {
            font: '20px Space Grotesk',
            fill: '#22B14C'
        }).setOrigin(0.5, 0.5);

        this.prevBtn.on('pointerdown', () => { this.pageOffset -= this.tracksPerPage; this.renderPage(); });
        this.nextBtn.on('pointerdown', () => { this.pageOffset += this.tracksPerPage; this.renderPage(); });

        [this.prevBtn, this.nextBtn].forEach(btn => {
            btn.on('pointerover', () => btn.setFillStyle(0xFF69B4));
            btn.on('pointerout', () => btn.setFillStyle(0x22B14C));
        });

        // ── Load tracks ─────────────────────────────────────────
        this.loadTracks();
    }

    // ──────────────────────────────────────────────────────────
    // DOM search bar
    // ──────────────────────────────────────────────────────────
    createSearchBar(W) {
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'search';
        this.searchInput.placeholder = '🔍  Search artist or track…';
        this.searchInput.style.cssText = `
            position: fixed;
            top: 90px;
            left: 50%;
            transform: translateX(-50%);
            width: 520px;
            max-width: 90vw;
            padding: 10px 18px;
            font: 500 18px 'Space Grotesk', sans-serif;
            background: rgba(0,26,46,0.85);
            border: 2px solid #00ffff;
            border-radius: 6px;
            color: #ffffff;
            outline: none;
            z-index: 100;
        `;
        document.body.appendChild(this.searchInput);

        this.searchInput.addEventListener('input', () => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => this.applySearch(), 350);
        });

        // Remove on scene shutdown
        this.events.on('shutdown', () => {
            if (this.searchInput && this.searchInput.parentNode) {
                document.body.removeChild(this.searchInput);
            }
        });
    }

    // ──────────────────────────────────────────────────────────
    // Data loading
    // ──────────────────────────────────────────────────────────
    async loadTracks() {
        try {
            let response = await SpotifyAPI.getTopTracks(50);
            this.tracks = response.items || [];

            // Fallback to recently played if top-tracks is empty
            if (this.tracks.length === 0) {
                console.log('Top tracks empty, falling back to recently played');
                response = await SpotifyAPI.getRecentlyPlayed(50);
                this.tracks = response.items || [];
            }

            console.log(`Loaded ${this.tracks.length} tracks`);
            this.filteredTracks = [...this.tracks];
            this.pageOffset = 0;
            this.loadingText.destroy();
            this.renderPage();
        } catch (error) {
            console.error('Error loading tracks:', error);
            this.loadingText.setText('Failed to load tracks.\nCheck your connection and try again.');
        }
    }

    applySearch() {
        const q = (this.searchInput.value || '').toLowerCase().trim();
        if (q === '') {
            this.filteredTracks = [...this.tracks];
        } else {
            this.filteredTracks = this.tracks.filter(t =>
                t.name.toLowerCase().includes(q) ||
                (t.artists || []).some(a => a.name.toLowerCase().includes(q))
            );
        }
        this.pageOffset = 0;
        this.renderPage();
    }

    // ──────────────────────────────────────────────────────────
    // Rendering
    // ──────────────────────────────────────────────────────────
    renderPage() {
        // Destroy previous rows
        this.trackRows.forEach(obj => obj.destroy());
        this.trackRows = [];

        const W = this.scale.width;
        const page = this.filteredTracks.slice(this.pageOffset, this.pageOffset + this.tracksPerPage);

        if (page.length === 0) {
            const t = this.add.text(W / 2, this.scale.height / 2, 'No tracks found.', {
                font: '28px Space Grotesk',
                fill: '#b0b0b0'
            }).setOrigin(0.5, 0.5);
            this.trackRows.push(t);
            this.prevBtn.setVisible(false);
            this.nextBtn.setVisible(false);
            this.pageLabel.setText('');
            return;
        }

        const startY = 170;
        const rowH   = 80;
        const pad    = 20;

        page.forEach((track, i) => {
            const y = startY + i * rowH;
            this.addTrackRow(track, y, W, pad);
        });

        // Pagination controls
        const totalPages = Math.ceil(this.filteredTracks.length / this.tracksPerPage);
        const curPage    = Math.floor(this.pageOffset / this.tracksPerPage) + 1;

        this.prevBtn.setVisible(this.pageOffset > 0);
        this.prevText.setVisible(this.pageOffset > 0);
        this.nextBtn.setVisible(this.pageOffset + this.tracksPerPage < this.filteredTracks.length);
        this.nextText.setVisible(this.pageOffset + this.tracksPerPage < this.filteredTracks.length);
        this.pageLabel.setText(`${curPage} / ${totalPages}`);
    }

    addTrackRow(track, y, W, pad) {
        const rowH = 70;
        const name   = track.name;
        const artist = track.artists?.[0]?.name || 'Unknown Artist';
        const ms     = track.duration_ms || 0;
        const dur    = `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

        // Row background (Geometry Dash style)
        const bg = this.add.rectangle(W / 2, y + rowH / 2, W - pad * 2, rowH - 6, 0x22B14C, 0.6)
            .setStrokeStyle(3, 0xFFD700, 1)
            .setInteractive({ useHandCursor: true });

        // Highlight on hover
        bg.on('pointerover', () => { 
            bg.setFillStyle(0xFF69B4, 0.8);
            bg.setStrokeStyle(3, 0xFFFFFF, 1);
        });
        bg.on('pointerout',  () => { 
            bg.setFillStyle(0x22B14C, 0.6);
            bg.setStrokeStyle(3, 0xFFD700, 1);
        });

        // Track name
        const nameText = this.add.text(pad + 30, y + rowH / 2 - 10, name, {
            font: 'bold 20px Space Grotesk',
            fill: '#FFFFFF'
        }).setOrigin(0, 0.5);

        // Artist
        const artistText = this.add.text(pad + 30, y + rowH / 2 + 16, artist, {
            font: '14px Space Grotesk',
            fill: '#FFD700'
        }).setOrigin(0, 0.5);

        // Duration
        const durText = this.add.text(W - pad - 150, y + rowH / 2, `⏱ ${dur}`, {
            font: 'bold 16px Space Grotesk',
            fill: '#FFFFFF'
        }).setOrigin(0.5, 0.5);

        // Play button (Geometric)
        const playBg = this.add.rectangle(W - pad - 60, y + rowH / 2, 100, 50, 0xFF69B4, 0.9)
            .setStrokeStyle(2, 0xFFD700, 1)
            .setInteractive({ useHandCursor: true });

        const playText = this.add.text(W - pad - 60, y + rowH / 2, '► PLAY ◄', {
            font: 'bold 16px Space Grotesk',
            fill: '#FFFFFF'
        }).setOrigin(0.5, 0.5);

        playBg.on('pointerover', () => { 
            playBg.setFillStyle(0xFF1493, 1);
            playText.setFill('#FFD700');
        });
        playBg.on('pointerout',  () => { 
            playBg.setFillStyle(0xFF69B4, 0.9);
            playText.setFill('#FFFFFF');
        });
        playBg.on('pointerdown', () => this.startGame(track));
        playText.setInteractive({ useHandCursor: true });
        playText.on('pointerdown', () => this.startGame(track));

        [bg, nameText, artistText, durText, playBg, playText].forEach(o => this.trackRows.push(o));
    }

    // ──────────────────────────────────────────────────────────
    // Game start
    // ──────────────────────────────────────────────────────────
    async startGame(track) {
        console.log('🎵 Selected track:', track.name);

        if (this.searchInput && this.searchInput.parentNode) {
            document.body.removeChild(this.searchInput);
        }

        // Show loading overlay (Geometry Dash style)
        const W = this.scale.width;
        const H = this.scale.height;
        const overlay  = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8).setDepth(50);
        const loadBg = this.add.rectangle(W / 2, H / 2, 500, 150, 0x22B14C, 0.9)
            .setStrokeStyle(4, 0xFFD700, 1)
            .setDepth(51);
        const loadText = this.add.text(W / 2, H / 2, `⏳ LOADING "${track.name}"…`, {
            font: 'bold 28px Space Grotesk', 
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5, 0.5).setDepth(52);

        try {
            // Spotify deprecated /audio-features and /audio-analysis for new apps.
            // We attempt them but never let failures block the game.
            let features = null;
            let analysis = null;

            try {
                features = await SpotifyAPI.getAudioFeatures(track.id);
            } catch (e) {
                console.warn('Audio features unavailable (API deprecated for new apps):', e.message);
            }

            try {
                analysis = await SpotifyAPI.getAudioAnalysis(track.id);
            } catch (e) {
                console.warn('Audio analysis unavailable (API deprecated for new apps):', e.message);
            }

            // Merge track duration so the BPM generator always has it
            const featuresWithDuration = {
                duration_ms: track.duration_ms || 180000,
                tempo: 120, energy: 0.65, danceability: 0.6,
                ...(features || {})
            };

            // Detect & apply theme
            const genre = ThemeManager.detectGenreFromFeatures(featuresWithDuration);
            ThemeManager.selectThemeByGenre(genre);

            // Generate level — always succeeds (BPM fallback if no analysis)
            const levelData = await LevelGenerator.generateLevel(
                track.id, analysis, featuresWithDuration
            );

            gameState.currentTrack = track;
            ScoreManager.reset();

            this.scene.start('GameScene', { track, levelData, features: featuresWithDuration, analysis });
        } catch (error) {
            console.error('Unexpected error initializing game:', error);
            overlay.destroy();
            loadText.destroy();
            this.showError(`Error: ${error.message}`);
        }
    }

    showError(msg) {
        const W = this.scale.width;
        const H = this.scale.height;
        this.add.text(W / 2, H - 100, msg, {
            font: '22px Space Grotesk',
            fill: '#ff4444',
            align: 'center',
            wordWrap: { width: W - 80 }
        }).setOrigin(0.5, 0.5);
    }

    update() {}
}

console.log('SongSelectScene loaded');
