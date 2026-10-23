import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    ArrowLeft,
    Plus,
    Pencil,
    Trash2,
    ExternalLink,
    Loader2,
    FolderKanban,
    X
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        technologies: "",
        github: "",
        liveDemo: ""
    });

    // ==========================================
    // Get authentication token
    // ==========================================

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("authToken")
        );
    };

    // ==========================================
    // Load projects
    // ==========================================

    const loadProjects = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError("Please login again.");
                return;
            }

            const response = await fetch(`${API_URL}/projects`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            console.log("Projects API Response:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load projects"
                );
            }

            setProjects(data.projects || []);
        } catch (error) {
            console.error("Load Projects Error:", error);

            setError(
                error.message || "Unable to load projects."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Handle input
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ==========================================
    // Reset form
    // ==========================================

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            technologies: "",
            github: "",
            liveDemo: ""
        });

        setEditingId(null);
        setShowForm(false);
        setError("");
    };

    // ==========================================
    // Create / Update project
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError("Please login again.");
                return;
            }

            if (!formData.title.trim()) {
                setError("Project title is required.");
                return;
            }

            const technologies = formData.technologies
                .split(",")
                .map((technology) => technology.trim())
                .filter(Boolean);

            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                technologies,
                github: formData.github.trim(),
                liveDemo: formData.liveDemo.trim()
            };

            const url = editingId
                ? `${API_URL}/projects/${editingId}`
                : `${API_URL}/projects`;

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            console.log("Save Project Response:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save project"
                );
            }

            if (editingId) {
                setProjects((previous) =>
                    previous.map((project) =>
                        project._id === editingId
                            ? data.project
                            : project
                    )
                );
            } else {
                setProjects((previous) => [
                    data.project,
                    ...previous
                ]);
            }

            resetForm();
        } catch (error) {
            console.error("Save Project Error:", error);

            setError(
                error.message || "Unable to save project."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // Edit project
    // ==========================================

    const handleEdit = (project) => {
        setFormData({
            title: project.title || "",
            description: project.description || "",

            technologies: Array.isArray(project.technologies)
                ? project.technologies.join(", ")
                : "",

            github: project.github || "",
            liveDemo: project.liveDemo || ""
        });

        setEditingId(project._id);
        setShowForm(true);
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // ==========================================
    // Delete project
    // ==========================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this project?"
        );

        if (!confirmed) return;

        try {
            setError("");

            const token = getToken();

            if (!token) {
                setError("Please login again.");
                return;
            }

            const response = await fetch(
                `${API_URL}/projects/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete project"
                );
            }

            setProjects((previous) =>
                previous.filter(
                    (project) => project._id !== id
                )
            );
        } catch (error) {
            console.error(
                "Delete Project Error:",
                error
            );

            setError(
                error.message ||
                "Unable to delete project."
            );
        }
    };

    // ==========================================
    // Initial load
    // ==========================================

    useEffect(() => {
        loadProjects();
    }, []);

    // ==========================================
    // Loading screen
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2
                        size={45}
                        className="mx-auto mb-4 animate-spin text-blue-600"
                    />

                    <h2 className="text-xl font-semibold text-slate-800">
                        Loading projects...
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Please wait while we load your projects.
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // Main UI
    // ==========================================

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Header */}

            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600"
                    >
                        <ArrowLeft size={20} />
                        Dashboard
                    </Link>

                    <div className="flex items-center gap-2 text-blue-600">
                        <FolderKanban size={24} />

                        <span className="font-bold">
                            SkillVerse AI
                        </span>
                    </div>

                </div>
            </header>

            {/* Main */}

            <main className="mx-auto max-w-6xl px-6 py-10">

                {/* Title */}

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
                            <FolderKanban size={16} />
                            Portfolio Projects
                        </div>

                        <h1 className="text-4xl font-bold text-slate-900">
                            My Projects
                        </h1>

                        <p className="mt-3 text-slate-600">
                            Showcase your projects, technologies and achievements.
                        </p>

                    </div>

                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Add Project
                    </button>

                </div>

                {/* Error */}

                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Add / Edit Form */}

                {showForm && (
                    <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">

                        <div className="mb-6 flex items-center justify-between">

                            <h2 className="text-2xl font-bold text-slate-900">
                                {editingId
                                    ? "Edit Project"
                                    : "Add New Project"}
                            </h2>

                            <button
                                onClick={resetForm}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X size={22} />
                            </button>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* Title */}

                            <div>
                                <label className="mb-2 block font-medium text-slate-700">
                                    Project Title *
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Student Attendance System"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Description */}

                            <div>
                                <label className="mb-2 block font-medium text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Describe your project..."
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Technologies */}

                            <div>
                                <label className="mb-2 block font-medium text-slate-700">
                                    Technologies
                                </label>

                                <input
                                    type="text"
                                    name="technologies"
                                    value={formData.technologies}
                                    onChange={handleChange}
                                    placeholder="React, Node.js, MongoDB"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                                />

                                <p className="mt-1 text-sm text-slate-500">
                                    Separate technologies using commas.
                                </p>
                            </div>

                            {/* GitHub */}

                            <div>
                                <label className="mb-2 block font-medium text-slate-700">
                                    GitHub URL
                                </label>

                                <input
                                    type="url"
                                    name="github"
                                    value={formData.github}
                                    onChange={handleChange}
                                    placeholder="https://github.com/username/project"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Live Demo */}

                            <div>
                                <label className="mb-2 block font-medium text-slate-700">
                                    Live Demo URL
                                </label>

                                <input
                                    type="url"
                                    name="liveDemo"
                                    value={formData.liveDemo}
                                    onChange={handleChange}
                                    placeholder="https://your-project.com"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Buttons */}

                            <div className="flex gap-3 pt-2">

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {saving && (
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                    )}

                                    {editingId
                                        ? "Update Project"
                                        : "Save Project"}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>
                )}

                {/* No Projects */}

                {projects.length === 0 && !showForm && (
                    <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">

                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <FolderKanban size={32} />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900">
                            No projects yet
                        </h2>

                        <p className="mx-auto mt-3 max-w-lg text-slate-500">
                            Add your first project to showcase your skills and experience.
                        </p>

                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                            <Plus size={20} />
                            Add Your First Project
                        </button>

                    </div>
                )}

                {/* Project Cards */}

                {projects.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2">

                        {projects.map((project) => (

                            <div
                                key={project._id}
                                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                            >

                                {/* Card Header */}

                                <div className="flex items-start justify-between gap-4">

                                    <div>

                                        <h2 className="text-xl font-bold text-slate-900">
                                            {project.title}
                                        </h2>

                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {project.description ||
                                                "No description added."}
                                        </p>

                                    </div>

                                    <FolderKanban
                                        size={25}
                                        className="shrink-0 text-blue-600"
                                    />

                                </div>

                                {/* Technologies */}

                                {project.technologies?.length > 0 && (
                                    <div className="mt-5 flex flex-wrap gap-2">

                                        {project.technologies.map(
                                            (technology, index) => (
                                                <span
                                                    key={index}
                                                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                                                >
                                                    {technology}
                                                </span>
                                            )
                                        )}

                                    </div>
                                )}

                                {/* Links */}

                                <div className="mt-6 flex flex-wrap gap-3">

                                    {project.github && (
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            <span className="font-bold text-sm">
                                                GH
                                            </span>

                                            GitHub
                                        </a>
                                    )}

                                    {project.liveDemo && (
                                        <a
                                            href={project.liveDemo}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            <ExternalLink size={17} />
                                            Live Demo
                                        </a>
                                    )}

                                </div>

                                {/* Actions */}

                                <div className="mt-6 flex justify-end gap-2 border-t pt-4">

                                    <button
                                        onClick={() =>
                                            handleEdit(project)
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(project._id)
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </main>

        </div>
    );
}

export default Projects;