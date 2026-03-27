/**
 * Authentication Manager
 * Handles token storage, validation, and refresh
 */

const AuthManager = {
    tokenKey: 'spotify_access_token',
    expiryKey: 'spotify_token_expiry',
    refreshKey: 'spotify_refresh_token',

    /**
     * Set access token and expiry
     */
    setAccessToken: function(accessToken, expiresIn, refreshToken = null) {
        try {
            const expiryTime = Date.now() + (expiresIn * 1000);
            
            localStorage.setItem(this.tokenKey, accessToken);
            localStorage.setItem(this.expiryKey, expiryTime);
            
            if (refreshToken) {
                localStorage.setItem(this.refreshKey, refreshToken);
            }
            
            console.log('Token stored successfully');
        } catch (error) {
            console.error('Error storing token:', error);
        }
    },

    /**
     * Get access token (with auto-refresh if expired)
     */
    getAccessToken: async function() {
        try {
            const token = localStorage.getItem(this.tokenKey);
            const expiry = localStorage.getItem(this.expiryKey);
            
            if (!token) {
                console.log('No token found');
                return null;
            }
            
            // Check if token exists and is valid
            if (expiry) {
                const currentTime = Date.now();
                const timeUntilExpiry = expiry - currentTime;
                
                // If expiry within 5 minutes (300000ms), try to refresh
                if (timeUntilExpiry < 300000) {
                    console.log('Token expiring soon, attempting refresh...');
                    const refreshToken = localStorage.getItem(this.refreshKey);
                    if (refreshToken) {
                        try {
                            // Note: Spotify PKCE flow doesn't support refresh tokens via this method
                            // User will need to login again when token expires
                            console.warn('Token refresh not supported in PKCE flow. User must login again.');
                            this.clearTokens();
                            return null;
                        } catch (error) {
                            console.warn('Token refresh failed:', error);
                        }
                    }
                }
                
                // Token still valid
                if (currentTime < expiry) {
                    return token;
                }
            } else if (token) {
                // No expiry set, assume token is valid
                return token;
            }
            
            console.log('Token expired');
            this.clearTokens();
            return null;
        } catch (error) {
            console.error('Error retrieving token:', error);
            return null;
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: async function() {
        const token = await this.getAccessToken();
        return token !== null;
    },

    /**
     * Validate token by checking with Spotify API
     */
    validateToken: async function(token) {
        try {
            const response = await fetch(`${VIBE_CONFIG.spotify.apiEndpoint}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    },

    /**
     * Clear all stored tokens
     */
    clearTokens: function() {
        try {
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.expiryKey);
            localStorage.removeItem(this.refreshKey);
            console.log('Tokens cleared');
        } catch (error) {
            console.error('Error clearing tokens:', error);
        }
    },

    /**
     * Get user profile from token
     */
    getUserProfile: async function(token) {
        try {
            if (!token) {
                token = await this.getAccessToken();
            }
            
            if (!token) {
                console.error('No token available for profile fetch');
                return null;
            }
            
            const response = await fetch(`${VIBE_CONFIG.spotify.apiEndpoint}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch user profile: ${response.status}`);
            }
            
            const profile = await response.json();
            console.log('User profile fetched:', profile.display_name);
            
            return profile;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }
};

console.log('AuthManager loaded');
