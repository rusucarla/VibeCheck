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

export async function getUserChannels() {
    try {
        const response = await fetch(
            `${API_URL}/subscribed`,
            {
                method: "GET",
                credentials: "include",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch user channels");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching user channels:", error);
        return null;
    }
}

export async function requestToJoinChannel(channelId) {
    try {
        const response = await fetch(`${API_URL}/${channelId}/join-request`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to send join request");
        }

        return await response.json();
    } catch (error) {
        console.error("Error requesting to join channel:", error);
        throw error;
    }
}

export async function getPendingRequests() {
    try {
        const response = await fetch(`${API_URL}/admin/pending-requests`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch pending requests");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching pending join requests:", error);
        return { data: [] };
    }
}

export async function approveJoinRequest(requestId) {
    try {
        const response = await fetch(`${API_URL}/requests/${requestId}/approve`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to approve join request");
        }

        return await response.json();
    } catch (error) {
        console.error("Error approving join request:", error);
        throw error;
    }
}

export async function rejectJoinRequest(requestId) {
    try {
        const response = await fetch(`${API_URL}/requests/${requestId}/reject`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to reject join request");
        }

        return await response.json();
    } catch (error) {
        console.error("Error rejecting join request:", error);
        throw error;
    }
}

export async function getUserRole() {
    try {
        const response = await fetch("https://localhost:7253/api/User/role", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to get user role");
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting user role:", error);
        return { roles: [] };
    }
}

export async function checkChannelAdminAccess(channelId) {
    try {
        // Get subscribed channels
        const userChannels = await getUserChannels();
        const isChannelAdmin = userChannels?.data?.some(
            channel => channel.id === parseInt(channelId) && channel.userRole === "Admin"
        );
        return { isAdmin: isChannelAdmin};
    } catch (error) {
        console.error("Error checking admin access:", error);
        return { isAdmin: false };
    }
}

export async function leaveChannel(channelId) {
    try {
        const response = await fetch(`${API_URL}/${channelId}/leave`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to leave channel");
        }

        return await response.json();
    } catch (error) {
        console.error("Error leaving channel:", error);
        throw error;
    }
}

export async function getChannelMessages(channelId) {
    try {
        const response = await fetch(`${API_URL}/${channelId}/messages`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch channel messages");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching channel messages:", error);
        throw error;
    }
}

export async function sendMessage(channelId, messageData) {
    try {
        const response = await fetch(`${API_URL}/${channelId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(messageData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to send message: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}

export async function getCurrentUserInfo() {
    try {
        const response = await fetch("https://localhost:7253/api/User/info", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user info");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}

// Get all users in a channel
export async function getChannelUsers(channelId) {
    try {
        const response = await fetch(`${API_URL}/${channelId}/users`, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch channel users");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching channel users:", error);
        throw error;
    }
}

// Promote a user to admin in a channel
export async function promoteChannelUser(channelId, userId) {
    try {
        const response = await fetch(`${API_URL}/${channelId}/users/${userId}/promote`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to promote user");
        }

        return await response.json();
    } catch (error) {
        console.error("Error promoting channel user:", error);
        throw error;
    }
}

// Demote a user to member in a channel
export async function demoteChannelUser(channelId, userId) {
    try {
        const response = await fetch(`${API_URL}/${channelId}/users/${userId}/demote`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to demote user");
        }

        return await response.json();
    } catch (error) {
        console.error("Error demoting channel user:", error);
        throw error;
    }
}

// Remove a user from a channel
export async function removeChannelUser(channelId, userId) {
    try {
        const response = await fetch(`${API_URL}/${channelId}/users/${userId}/remove`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to remove user");
        }

        return await response.json();
    } catch (error) {
        console.error("Error removing channel user:", error);
        throw error;
    }
}
