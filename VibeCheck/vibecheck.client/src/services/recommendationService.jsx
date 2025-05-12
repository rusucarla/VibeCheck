// src/services/recommendationService.jsx
const BASE_URL = "https://localhost:7253/api";

export async function getChannelRecommendations(channelId) {
    try {
        const response = await fetch(`${BASE_URL}/channels/${channelId}/recommendations`, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Failed to fetch recommendations");
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting channel recommendations:", error);
        return [];
    }
}

export async function addRecommendation(recommendation) {
    try {
        const response = await fetch(`${BASE_URL}/recommendations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(recommendation)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to add recommendation: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error adding recommendation:", error);
        throw error;
    }
}

export async function deleteRecommendation(id) {
    try {
        const response = await fetch(`${BASE_URL}/recommendations/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Failed to delete recommendation");
        }

        return true;
    } catch (error) {
        console.error("Error deleting recommendation:", error);
        throw error;
    }
}