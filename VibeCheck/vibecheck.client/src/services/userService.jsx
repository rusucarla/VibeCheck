// vibecheck.client/src/services/userService.jsx
const API_URL = "https://localhost:7253/api/User";

export async function getUserById(userId) {
    try {
        const response = await fetch(`${API_URL}/byId/${userId}`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user information");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching user information:", error);
        return null;
    }
}

export async function getCurrentUserInfo() {
    try {
        const response = await fetch(`${API_URL}/info`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch current user info");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}