import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getProfile, updateProfile } from "../services/profileService";

function Profile() {

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        careerGoal: "",
        education: {
            degree: "",
            college: "",
            branch: "",
            graduationYear: "",
            cgpa: ""
        },
        skills: [],
        interests: []
    });

    const [skillsInput, setSkillsInput] = useState("");
    const [interestsInput, setInterestsInput] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

const loadProfile = async () => {
    const data = await getProfile();

    setProfile({
        ...data,
        education: data.education || {
            degree: "",
            college: "",
            branch: "",
            graduationYear: "",
            cgpa: ""
        },
        skills: data.skills || [],
        interests: data.interests || []
    });

    setSkillsInput((data.skills || []).join(", "));
    setInterestsInput((data.interests || []).join(", "));
};

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name in profile.education) {
            setProfile({
                ...profile,
                education: {
                    ...profile.education,
                    [name]: value
                }
            });
        } else {
            setProfile({
                ...profile,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const updatedProfile = {
            ...profile,
            skills: skillsInput.split(",").map(s => s.trim()).filter(Boolean),
            interests: interestsInput.split(",").map(s => s.trim()).filter(Boolean)
        };

        await updateProfile(updatedProfile);

        alert("Profile Updated Successfully");
    };

    return (

        <DashboardLayout>

            <h1 className="text-3xl font-bold mb-6">
                Student Profile
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow p-8 space-y-4"
            >

                <input
                    className="border p-3 w-full rounded"
                    placeholder="Name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                />

                <input
                    className="border p-3 w-full rounded"
                    placeholder="Email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                />

                <input
                    className="border p-3 w-full rounded"
                    placeholder="Degree"
                    name="degree"
                    value={profile.education.degree}
                    onChange={handleChange}
                />

                <input
                    className="border p-3 w-full rounded"
                    placeholder="College"
                    name="college"
                    value={profile.education.college}
                    onChange={handleChange}
                />

                <input
                    className="border p-3 w-full rounded"
                    placeholder="Branch"
                    name="branch"
                    value={profile.education.branch}
                    onChange={handleChange}
                />

                <input
                    className="border p-3 w-full rounded"
                    placeholder="Graduation Year"
                    name="graduationYear"
                    value={profile.education.graduationYear}
                    onChange={handleChange}
                />

                <input
                    className="border p-3 w-full rounded"
                    placeholder="CGPA"
                    name="cgpa"
                    value={profile.education.cgpa}
                    onChange={handleChange}
                />

                <textarea
                    className="border p-3 w-full rounded"
                    placeholder="Skills (comma separated)"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                />

                <textarea
                    className="border p-3 w-full rounded"
                    placeholder="Interests (comma separated)"
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                />

                <input
                    className="border p-3 w-full rounded"
                    placeholder="Career Goal"
                    name="careerGoal"
                    value={profile.careerGoal}
                    onChange={handleChange}
                />

                <button
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg"
                >
                    Save Profile
                </button>

            </form>

        </DashboardLayout>

    );

}

export default Profile;