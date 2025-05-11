// src/services/spotifyService.js
const API_BASE = "https://localhost:7253/api/Spotify";

export async function searchSpotifyTracks(query) {
    const response = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error("Spotify search failed");
    return await response.json();
}
