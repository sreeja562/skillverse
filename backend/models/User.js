const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        education: {
    degree: {
        type: String,
        default: ""
    },
    branch: {
        type: String,
        default: ""
    },
    college: {
        type: String,
        default: ""
    },
    graduationYear: {
        type: Number,
        default: null
    },
    cgpa: {
        type: Number,
        default: null
    }
},

        skills: {
            type: [String],
            default: []
        },

        interests: {
            type: [String],
            default: []
        },

        careerGoal: {
            type: String,
            default: ""
        },

        experienceLevel: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner"
        },

      projects: [
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        technologies: {
            type: [String],
            default: []
        },
        github: {
            type: String,
            default: ""
        },
        liveDemo: {
            type: String,
            default: ""
        }
    }
],

certifications: [
    {
        name: {
            type: String,
            default: ""
        },
        issuer: {
            type: String,
            default: ""
        },
        year: {
            type: Number,
            default: null
        },
        certificateUrl: {
            type: String,
            default: ""
        }
    }
],
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);