/**
 * Spotify PKCE OAuth Implementation
 * Handles authorization flow using Proof Key for Code Exchange (PKCE)
 */

const SpotifyAuth = {
    // ========================================
    // PKCE Helper Functions
    // ========================================
    
    /**
     * Generate random string for PKCE code verifier
     */
    generateCodeVerifier: function() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        let result = '';
        for (let i = 0; i < 128; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    },

    /**
     * Generate code challenge from code verifier using SHA-256
     */
    generateCodeChallenge: async function(codeVerifier) {
        const bytes = new TextEncoder().encode(codeVerifier);
        const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
        
        // Convert to base64url
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashString = hashArray.map(b => String.fromCharCode(b)).join('');
        const hashBase64 = btoa(hashString);
        
        // Remove padding and convert to base64url
        return hashBase64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    },

    /**
     * Generate random state for CSRF protection
     */
    generateState: function() {
        return Math.random().toString(36).substring(2, 15);
    },

    // ========================================
    // OAuth Flow
    // ========================================

    /**
     * Initiate Spotify login flow
     */
    initiateLogin: async function() {
        try {
            console.log('Initiating Spotify login...');
            
            // Generate PKCE parameters
            const codeVerifier = this.generateCodeVerifier();
            const codeChallenge = await this.generateCodeChallenge(codeVerifier);
            const state = this.generateState();
            
            // Store verifier and state in sessionStorage (survives redirect)
            sessionStorage.setItem('spotify_code_verifier', codeVerifier);
            sessionStorage.setItem('spotify_auth_state', state);
            
            // Build authorization URL
            const params = new URLSearchParams({
                client_id: VIBE_CONFIG.spotify.clientId,
                response_type: 'code',
                redirect_uri: VIBE_CONFIG.spotify.redirectUri,
                scope: VIBE_CONFIG.spotify.scopes.join(' '),
                code_challenge_method: 'S256',
                code_challenge: codeChallenge,
                state: state,
                show_dialog: 'true' // Force user to grant permissions
            });
            
            const authUrl = `${VIBE_CONFIG.spotify.authEndpoint}?${params.toString()}`;
            console.log('Redirecting to Spotify auth:', authUrl);
            
            // Redirect to Spotify
            window.location.href = authUrl;
        } catch (error) {
            console.error('Error initiating login:', error);
            alert('Failed to initiate login. Please try again.');
        }
    },

    /**
     * Handle callback from Spotify authorization
     */
    handleCallback: async function() {
        try {
            console.log('Handling Spotify callback...');
            
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const state = params.get('state');
            const error = params.get('error');
            
            if (error) {
                console.error('Spotify auth error:', error);
                alert(`Authorization failed: ${error}`);
                window.location.href = '/VibeRider/';
                return;
            }
            
            if (!code) {
                console.error('No authorization code in callback');
                alert('No authorization code received');
                window.location.href = '/VibeRider/';
                return;
            }
            
            // Verify state for CSRF protection
            const storedState = sessionStorage.getItem('spotify_auth_state');
            if (state !== storedState) {
                console.error('State mismatch - possible CSRF attack');
                alert('Security check failed');
                window.location.href = '/VibeRider/';
                return;
            }
            
            // Exchange code for tokens
            await this.exchangeCodeForToken(code);
            
            // Clean up
            sessionStorage.removeItem('spotify_auth_state');
            
            // Redirect to main page
            window.location.href = '/VibeRider/';
        } catch (error) {
            console.error('Error handling callback:', error);
            alert('Failed to complete login. Please try again.');
            window.location.href = '/VibeRider/';
        }
    },

    /**
     * Exchange authorization code for access token
     */
    exchangeCodeForToken: async function(code) {
        try {
            const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
            
            if (!codeVerifier) {
                throw new Error('Code verifier not found in session');
            }
            
            console.log('Exchanging code for token...');
            
            const response = await fetch(VIBE_CONFIG.spotify.tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: VIBE_CONFIG.spotify.clientId,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: VIBE_CONFIG.spotify.redirectUri,
                    code_verifier: codeVerifier
                })
            });
            
            if (!response.ok) {
                throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Store tokens using AuthManager
            AuthManager.setAccessToken(
                data.access_token,
                data.expires_in || 3600,
                data.refresh_token
            );
            
            console.log('Token exchange successful');
            gameState.accessToken = data.access_token;
            gameState.isLoggedIn = true;
            
            // Clean up verifier
            sessionStorage.removeItem('spotify_code_verifier');
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            throw error;
        }
    },

    /**
     * Logout user (clear tokens)
     */
    logout: function() {
        console.log('Logging out...');
        AuthManager.clearTokens();
        gameState.isLoggedIn = false;
        gameState.accessToken = null;
        gameState.user = null;
        window.location.href = '/VibeRider/';
    }
};

console.log('SpotifyAuth loaded');
