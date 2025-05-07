const API_URL = "https://localhost:7253/api/Channels";

export async function getAllChannels(page = 1, pageSize = 10, search = "") {
    try {
        const response = await fetch(
            `${API_URL}?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`,
            {
                method: "GET",
                credentials: "include",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch channels");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching channels:", error);
        return null;
    }
}

export async function getChannelById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch channel");
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting channel by ID:", error);
        return null;
    }
}

export async function createChannel(channel) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(channel),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create channel: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating channel:", error);
        throw error;
    }
}

export async function updateChannel(id, channel) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(channel),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update channel: ${errorText}`);
        }

        return await response.text(); // poate fi empty (204 No Content)
    } catch (error) {
        console.error("Error updating channel:", error);
        throw error;
    }
}

export async function deleteChannel(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to delete channel");
        }

        return await response.text();
    } catch (error) {
        console.error("Error deleting channel:", error);
        throw error;
    }
}
