const User = require("../models/User");

// Learning roadmap for different skills
const skillRoadmaps = {
    "Machine Learning": [
        "Python for Machine Learning",
        "NumPy and Pandas",
        "Statistics Basics",
        "Supervised Learning",
        "Unsupervised Learning",
        "Model Evaluation",
        "Build a Machine Learning Project"
    ],

    "Deep Learning": [
        "Neural Network Basics",
        "TensorFlow/PyTorch Basics",
        "Activation Functions",
        "CNN",
        "RNN",
        "Transfer Learning",
        "Build a Deep Learning Project"
    ],

    "LLM": [
        "Introduction to Large Language Models",
        "Tokens and Embeddings",
        "Transformer Architecture",
        "LLM APIs",
        "Vector Databases",
        "RAG",
        "Build an LLM Application"
    ],

    "Prompt Engineering": [
        "Prompt Basics",
        "Zero-shot Prompting",
        "Few-shot Prompting",
        "Role-based Prompts",
        "Structured Output",
        "Prompt Evaluation",
        "Build an AI Assistant"
    ],

    "Docker": [
        "Docker Basics",
        "Images and Containers",
        "Dockerfile",
        "Docker Compose",
        "Container Networking",
        "Volumes",
        "Dockerize a Full Stack Application"
    ],

    "Kubernetes": [
        "Kubernetes Basics",
        "Pods",
        "Deployments",
        "Services",
        "ConfigMaps and Secrets",
        "Scaling",
        "Deploy an Application on Kubernetes"
    ],

    "AWS": [
        "AWS Fundamentals",
        "IAM",
        "EC2",
        "S3",
        "RDS",
        "Lambda",
        "Deploy a Full Stack Application on AWS"
    ],

    "Git": [
        "Git Basics",
        "Repositories",
        "Branches",
        "Merge and Rebase",
        "Pull Requests",
        "GitHub",
        "Collaborative Git Project"
    ],

    "SQL": [
        "SQL Basics",
        "SELECT Queries",
        "Filtering and Sorting",
        "Joins",
        "Subqueries",
        "Indexes",
        "Build a Database Project"
    ],

    "REST API": [
        "HTTP Basics",
        "REST Architecture",
        "GET/POST/PUT/DELETE",
        "Status Codes",
        "Authentication",
        "API Testing",
        "Build a REST API"
    ]
};


const generateRoadmap = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const studentSkills = user.skills.map(skill =>
            skill.toLowerCase().trim()
        );

        // AI Platform Engineer requirements
        const requiredSkills = [
            "Python",
            "Machine Learning",
            "Deep Learning",
            "LLM",
            "Prompt Engineering",
            "Docker",
            "Kubernetes",
            "AWS",
            "Git",
            "SQL",
            "REST API"
        ];

        // Find missing skills
        const missingSkills = requiredSkills.filter(skill =>
            !studentSkills.includes(skill.toLowerCase())
        );

        // Create roadmap
        const roadmap = missingSkills.map((skill, index) => {

            return {
                step: index + 1,
                skill: skill,
                topics: skillRoadmaps[skill] || [
                    `Learn ${skill} fundamentals`,
                    `Practice ${skill}`,
                    `Build a ${skill} project`
                ]
            };

        });

        res.status(200).json({
            success: true,

            careerGoal: user.careerGoal,

            currentSkills: user.skills,

            missingSkills,

            roadmap
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to generate learning roadmap"
        });
    }
};


module.exports = {
    generateRoadmap
};