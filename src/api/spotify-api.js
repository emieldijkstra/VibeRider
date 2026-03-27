/**
 * Spotify API Wrapper
 * Handles all Spotify Web API calls
 */

const SpotifyAPI = {
    apiEndpoint: VIBE_CONFIG.spotify.apiEndpoint,
    cacheTimeout: VIBE_CONFIG.cache.ttl,

    /**
     * Make authenticated request to Spotify API
     */
    request: async function(endpoint, options = {}) {
        try {
            const token = await AuthManager.getAccessToken();
            if (!token) {
                throw new Error('No access token available');
            }

            const url = `${this.apiEndpoint}${endpoint}`;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            };

            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: headers,
                body: options.body ? JSON.stringify(options.body) : null
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired
                    AuthManager.clearTokens();
                    throw new Error('Unauthorized - token expired');
                }
                throw new Error(`API request failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Spotify API error:', error);
            throw error;
        }
    },

    /**
     * Get user's top tracks
     */
    getTopTracks: async function(limit = 50) {
        try {
            const cacheKey = `spotify_top_tracks_${limit}`;
            const cached = sessionStorage.getItem(cacheKey);

            if (cached) {
                console.log('Using cached top tracks');
                return JSON.parse(cached);
            }

            console.log('Fetching top tracks from Spotify...');
            const params = new URLSearchParams({ limit, time_range: 'medium_term' });
            const data = await this.request(`/me/top/tracks?${params}`);

            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error fetching top tracks:', error);
            throw error;
        }
    },

    /**
     * Get user's recently played tracks (fallback when top tracks is empty)
     */
    getRecentlyPlayed: async function(limit = 50) {
        try {
            const cacheKey = `spotify_recent_tracks_${limit}`;
            const cached = sessionStorage.getItem(cacheKey);

            if (cached) {
                console.log('Using cached recent tracks');
                return JSON.parse(cached);
            }

            console.log('Fetching recently played tracks...');
            const params = new URLSearchParams({ limit });
            const data = await this.request(`/me/player/recently-played?${params}`);

            // recently-played wraps tracks inside items[].track
            const tracks = (data.items || []).map(i => i.track);
            const result = { items: tracks };

            sessionStorage.setItem(cacheKey, JSON.stringify(result));
            return result;
        } catch (error) {
            console.error('Error fetching recently played:', error);
            throw error;
        }
    },

    /**
     * Get available devices for playback
     */
    getDevices: async function() {
        try {
            return await this.request('/me/player/devices');
        } catch (error) {
            console.error('Error fetching devices:', error);
            throw error;
        }
    },

    /**
     * Start or resume playback on a device
     */
    play: async function(deviceId, trackUri) {
        try {
            await this.request(`/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                body: { uris: [trackUri] }
            });
        } catch (error) {
            console.error('Error starting playback:', error);
            throw error;
        }
    },

    /**
     * Search for tracks
     */
    searchTracks: async function(query, limit = 20) {
        try {
            console.log('Searching tracks:', query);
            const params = new URLSearchParams({
                q: query,
                type: 'track',
                limit: limit
            });

            const data = await this.request(`/search?${params.toString()}`);
            return data.tracks.items;
        } catch (error) {
            console.error('Error searching tracks:', error);
            throw error;
        }
    },

    /**
     * Get audio features for a track
     */
    getAudioFeatures: async function(trackId) {
        try {
            const cacheKey = `spotify_audio_features_${trackId}`;
            const cached = sessionStorage.getItem(cacheKey);
            
            if (cached) {
                return JSON.parse(cached);
            }

            console.log('Fetching audio features for track:', trackId);
            const data = await this.request(`/audio-features/${trackId}`);

            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error fetching audio features:', error);
            throw error;
        }
    },

    /**
     * Get audio analysis for a track (beats, segments, etc.)
     */
    getAudioAnalysis: async function(trackId) {
        try {
            const cacheKey = `spotify_audio_analysis_${trackId}`;
            const cached = sessionStorage.getItem(cacheKey);
            
            if (cached) {
                return JSON.parse(cached);
            }

            console.log('Fetching audio analysis for track:', trackId);
            const data = await this.request(`/audio-analysis/${trackId}`);

            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error fetching audio analysis:', error);
            throw error;
        }
    },

    /**
     * Get track details
     */
    getTrack: async function(trackId) {
        try {
            console.log('Fetching track details:', trackId);
            return await this.request(`/tracks/${trackId}`);
        } catch (error) {
            console.error('Error fetching track:', error);
            throw error;
        }
    }
};

console.log('SpotifyAPI loaded');
