const API_URL = "https://localhost:7253/api/auth";
const API_URL_GENERAL = "https://localhost:7253/api";

export async function signup(userData) {
    console.log("Signup request received in authService:", userData);
    console.log("Email:", userData.email);
    console.log("Username:", userData.username);
    console.log("Password:", userData.password);
    console.log("PhoneNumber:", userData.phoneNumber);
    console.log("TwoFactorEnabled:", userData.twoFactorEnabled);

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
            credentials: "include"
        });

        console.log("Raw response:", response);
        const text = await response.text();
        console.log("Response body (raw text):", text);

        if (!response.ok) {
            throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
        }

        const data = JSON.parse(text);
        console.log("Parsed JSON response:", data);
        return data;
    } catch (error) {
        console.error("Signup error:", error);
        throw error;
    }
}

export async function confirmEmail(userId, token) {
    const encodedToken = encodeURIComponent(token);
    const url = `${API_URL}/confirm-email?userId=${userId}&token=${encodedToken}`;

    console.log("Sending request to backend:", url);

    const response = await fetch(url, { method: "GET", credentials: "include" });

    console.log("Raw response:", response);

    if (!response.ok) {
        throw new Error(`Eroare confirmare: ${response.status}`);
    }

    return await response.text();
}


export const login = async (loginInput, password) => {
    console.log("Login request:", { loginInput, password });

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ loginInput, password }),
            credentials: "include"
        });

        const text = await response.text();
        console.log("Login response text:", text);

        if (!response.ok) {
            console.error(`Login failed: ${response.status} ${response.statusText}`);
            throw new Error(`Login failed: ${response.status} ${response.statusText} — ${text}`);
        }

        const data = JSON.parse(text);
        console.log("Login response parsed:", data);

        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};


export const verify2FA = async (loginInput, token) => {
    const response = await fetch(`${API_URL}/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginInput, token }),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Invalid 2FA code");
    }

    return response.json();
};

export const logout = async () => {
    const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Logout failed");
    }

    return await response.json();
};


export async function getUserRole() {
    try {
        const response = await fetch(`${API_URL_GENERAL}/Users/role`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to get user role");
        }

        const data = await response.json();
        console.log("Rol utilizator:", data.roles);
        return data.roles; // este un array, ex: ["User"] sau ["Admin"]
    } catch (error) {
        console.error("Eroare la obtinerea rolului:", error);
        return [];
    }
}


export async function getUserInfo() {
    try {
        const response = await fetch(`${API_URL_GENERAL}/Users/info`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user information");
        }

        const data = await response.json();
        console.log("User information:", data);
        return data;
    } catch (error) {
        console.error("Error fetching user information:", error);
        throw error;
    }
}


export async function updateUserProfile(updatedData) {
    try {
        const response = await fetch(`${API_URL_GENERAL}/Users/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error(`Update failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Update successful:", data);
        return data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}
