const API_URL = "https://localhost:7253/api/auth";

export async function signup(userData) {
    console.log("Signup request received in authService:", userData);
    console.log("Email:", userData.email);
    console.log("Password:", userData.password);
    console.log("PhoneNumber:", userData.phoneNumber);
    console.log("TwoFactorEnabled:", userData.twoFactorEnabled);

    try {
        const response = await fetch("https://localhost:7253/api/auth/register", {
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
    const url = `https://localhost:7253/api/auth/confirm-email?userId=${userId}&token=${encodedToken}`;

    console.log("Sending request to backend:", url);

    const response = await fetch(url, { method: "GET", credentials: "include" });

    console.log("Raw response:", response);

    if (!response.ok) {
        throw new Error(`Eroare confirmare: ${response.status}`);
    }

    return await response.text();
}


export const login = async (email, password) => {
    console.log("Login request:", { email, password });

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include"
        });

        const text = await response.text();
        console.log("Login response text:", text);

        if (!response.ok) {
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


export const verify2FA = async (email, token) => {
    const response = await fetch(`${API_URL}/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
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
