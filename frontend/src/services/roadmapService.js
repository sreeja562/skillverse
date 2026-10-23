import axios from "axios";

const API_URL = "http://localhost:5000/api/roadmap";

// ==========================================
// Get authentication token
// ==========================================

const getToken = () => {
    return localStorage.getItem("token");
};

// ==========================================
// Common headers
// ==========================================

const getHeaders = () => {
    const token = getToken();

    if (!token) {
        throw new Error("Please login first");
    }

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// ==========================================
// Generate and save roadmap
// ==========================================

export const createRoadmap = async (missingSkills) => {
    try {
        if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
            throw new Error("No missing skills provided");
        }

        console.log("Creating roadmap for:", missingSkills);

        const response = await axios.post(
            API_URL,
            {
                missingSkills,
            },
            {
                headers: getHeaders(),
            }
        );

        console.log("Roadmap created:", response.data);

        return response.data;
    } catch (error) {
        console.error(
            "Create Roadmap Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ==========================================
// Get saved roadmap
// ==========================================

export const getRoadmap = async () => {
    try {
        console.log("Fetching saved roadmap...");

        const response = await axios.get(API_URL, {
            headers: getHeaders(),
        });

        console.log("Saved Roadmap:", response.data);

        return response.data;
    } catch (error) {
        console.error(
            "Get Roadmap Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ==========================================
// Update roadmap step completion
// ==========================================

export const updateRoadmapProgress = async (
    stepId,
    completed
) => {
    try {
        if (!stepId) {
            throw new Error("Step ID is required");
        }

        const response = await axios.put(
            `${API_URL}/progress`,
            {
                stepId,
                completed,
            },
            {
                headers: getHeaders(),
            }
        );

        console.log(
            "Roadmap progress updated:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Update Roadmap Progress Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// ==========================================
// Get roadmap progress
// ==========================================

export const getRoadmapProgress = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/progress`,
            {
                headers: getHeaders(),
            }
        );

        console.log(
            "Roadmap Progress:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Get Roadmap Progress Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};