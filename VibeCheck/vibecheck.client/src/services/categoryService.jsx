const API_URL = "https://localhost:7253/api/Categories";

export async function fetchCategories() {
    const response = await fetch(API_URL, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch categories");
    return await response.json();
}

export async function getAllCategories(page = 1, pageSize = 9, searchTerm) {
    try {
        const response = await fetch(`${API_URL}?search=${searchTerm}&page=${page}&pageSize=${pageSize}`, {
            credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch categories");

        return await response.json();
    } catch (error) {
        console.error("Eroare la fetch categorii:", error);
        return null;
    }
}

export async function fetchAllCategories() {
    const response = await fetch(`${API_URL}/all`, {
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch all categories");
    return await response.json();
}

export async function getCategoryById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Failed to fetch category");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching category by ID:", error);
        return null;
    }
}


export async function createCategory(category) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(category)
    });
    if (!response.ok) throw new Error("Failed to create category");
    return await response.json();
}

export async function updateCategory(id, category) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(category)
    });
    if (!response.ok) throw new Error("Failed to update category");
    return await response.json();
}

export async function deleteCategory(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include"
    });
    if (!response.ok) throw new Error("Failed to delete category");
    return await response.text();
}