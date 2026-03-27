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
        console.log('SongSelectScene created');

        const W = this.scale.width;
        const H = this.scale.height;

        this.cameras.main.setBackgroundColor('#001a2e');
        ThemeManager.setTheme('cyborgrid');

        // ── Header ──────────────────────────────────────────────
        this.add.text(W / 2, 50, 'SELECT A TRACK', {
            font: 'bold 52px Space Grotesk',
            fill: '#00ffff'
        }).setOrigin(0.5, 0.5);

        // User greeting
        if (gameState.user) {
            this.add.text(W - 20, 20, `👤 ${gameState.user.display_name}`, {
                font: '18px Space Grotesk',
                fill: '#b0b0b0'
            }).setOrigin(1, 0);
        }

        // Logout button
        const logoutBtn = this.add.text(W - 20, 50, 'Logout', {
            font: '16px Space Grotesk',
            fill: '#ff4444'
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        logoutBtn.on('pointerdown', () => SpotifyAuth.logout());
        logoutBtn.on('pointerover', () => logoutBtn.setStyle({ fill: '#ff8888' }));
        logoutBtn.on('pointerout',  () => logoutBtn.setStyle({ fill: '#ff4444' }));

        // ── Search bar (DOM overlay) ─────────────────────────────
        this.createSearchBar(W);

        // ── Loading indicator ───────────────────────────────────
        this.loadingText = this.add.text(W / 2, H / 2, 'Loading tracks…', {
            font: '28px Space Grotesk',
            fill: '#b0b0b0'
        }).setOrigin(0.5, 0.5);

        // ── Pagination arrows ───────────────────────────────────
        this.prevBtn = this.add.text(60, H - 60, '◀ Prev', {
            font: 'bold 24px Space Grotesk',
            fill: '#00ffff'
        }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true }).setVisible(false);

        this.nextBtn = this.add.text(W - 60, H - 60, 'Next ▶', {
            font: 'bold 24px Space Grotesk',
            fill: '#00ffff'
        }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true }).setVisible(false);

        this.pageLabel = this.add.text(W / 2, H - 60, '', {
            font: '20px Space Grotesk',
            fill: '#b0b0b0'
        }).setOrigin(0.5, 0.5);

        this.prevBtn.on('pointerdown', () => { this.pageOffset -= this.tracksPerPage; this.renderPage(); });
        this.nextBtn.on('pointerdown', () => { this.pageOffset += this.tracksPerPage; this.renderPage(); });

        [this.prevBtn, this.nextBtn].forEach(btn => {
            btn.on('pointerover', () => btn.setStyle({ fill: '#00ff88' }));
            btn.on('pointerout',  () => btn.setStyle({ fill: '#00ffff' }));
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
        this.nextBtn.setVisible(this.pageOffset + this.tracksPerPage < this.filteredTracks.length);
        this.pageLabel.setText(`${curPage} / ${totalPages}`);
    }

    addTrackRow(track, y, W, pad) {
        const rowH = 70;
        const name   = track.name;
        const artist = track.artists?.[0]?.name || 'Unknown Artist';
        const ms     = track.duration_ms || 0;
        const dur    = `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

        // Row background
        const bg = this.add.rectangle(W / 2, y + rowH / 2, W - pad * 2, rowH - 6, 0x0a1a30, 1)
            .setStrokeStyle(2, 0x00aacc)
            .setInteractive({ useHandCursor: true });

        // Highlight on hover
        bg.on('pointerover', () => bg.setStrokeStyle(2, 0x00ffcc));
        bg.on('pointerout',  () => bg.setStrokeStyle(2, 0x00aacc));

        // Track name
        const nameText = this.add.text(pad + 20, y + rowH / 2 - 10, name, {
            font: 'bold 20px Space Grotesk',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);

        // Artist
        const artistText = this.add.text(pad + 20, y + rowH / 2 + 16, artist, {
            font: '15px Space Grotesk',
            fill: '#88aacc'
        }).setOrigin(0, 0.5);

        // Duration
        const durText = this.add.text(W - pad - 120, y + rowH / 2, dur, {
            font: '16px Space Grotesk',
            fill: '#b0b0b0'
        }).setOrigin(0.5, 0.5);

        // Play button
        const playBg = this.add.rectangle(W - pad - 50, y + rowH / 2, 80, 40, 0x005533, 1)
            .setStrokeStyle(2, 0x00ff88)
            .setInteractive({ useHandCursor: true });

        const playText = this.add.text(W - pad - 50, y + rowH / 2, '▶ PLAY', {
            font: 'bold 15px Space Grotesk',
            fill: '#00ff88'
        }).setOrigin(0.5, 0.5);

        playBg.on('pointerover', () => { playBg.setFillStyle(0x00aa55); playText.setStyle({ fill: '#ffffff' }); });
        playBg.on('pointerout',  () => { playBg.setFillStyle(0x005533); playText.setStyle({ fill: '#00ff88' }); });
        playBg.on('pointerdown', () => this.startGame(track));
        playText.setInteractive({ useHandCursor: true });
        playText.on('pointerdown', () => this.startGame(track));

        [bg, nameText, artistText, durText, playBg, playText].forEach(o => this.trackRows.push(o));
    }

    // ──────────────────────────────────────────────────────────
    // Game start
    // ──────────────────────────────────────────────────────────
    async startGame(track) {
        console.log('Selected track:', track.name);

        if (this.searchInput && this.searchInput.parentNode) {
            document.body.removeChild(this.searchInput);
        }

        // Show loading overlay
        const W = this.scale.width;
        const H = this.scale.height;
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7);
        this.add.text(W / 2, H / 2, `Loading "${track.name}"…`, {
            font: 'bold 30px Space Grotesk',
            fill: '#00ffff'
        }).setOrigin(0.5, 0.5);

        try {
            // Fetch audio features + analysis in parallel
            const [features, analysis] = await Promise.all([
                SpotifyAPI.getAudioFeatures(track.id),
                SpotifyAPI.getAudioAnalysis(track.id)
            ]);

            // Detect & apply theme
            const genre = ThemeManager.detectGenreFromFeatures(features);
            ThemeManager.selectThemeByGenre(genre);

            // Generate level
            const levelData = await LevelGenerator.generateLevel(track.id, analysis, features);

            gameState.currentTrack = track;
            ScoreManager.reset();

            this.scene.start('GameScene', { track, levelData, features, analysis });
        } catch (error) {
            console.error('Error initializing game:', error);
            overlay.destroy();
            this.showError('Could not load track data. Please try another track.');
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
