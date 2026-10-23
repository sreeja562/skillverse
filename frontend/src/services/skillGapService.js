import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getSkillGap = async () => {
    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);
    console.log("Calling Skill Gap API...");

    const response = await axios.get(
        `${API_URL}/skill-gap`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    console.log("Skill Gap API Response:", response.data);

    return response.data.skillGap;
};