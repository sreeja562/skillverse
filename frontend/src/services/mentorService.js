const API_URL = "http://localhost:5000/api";

export const chatWithMentor = async (message) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Please login first");
    }

    const response = await fetch(`${API_URL}/mentor/chat`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
            message,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to communicate with AI Mentor"
        );
    }

    return data;
};