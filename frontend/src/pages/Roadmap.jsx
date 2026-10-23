import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle,
    Clock,
    Target,
    RefreshCw,
    Loader2,
    Trophy,
    Briefcase,
    AlertCircle
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function Roadmap() {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(null);
    const [missingSkills, setMissingSkills] = useState([]);

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
    // Load Skill Gap
    // ==========================================

    const loadSkillGap = async () => {
        try {
            const token = getToken();

            if (!token) {
                throw new Error("Please login again.");
            }

            const response = await fetch(
                `${API_URL}/skill-gap`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            console.log("Skill Gap API Response:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load skill gap"
                );
            }

            const skills =
                data.skillGap?.missingSkills || [];

            setMissingSkills(skills);

            return skills;

        } catch (error) {
            console.error(
                "Skill Gap Error:",
                error
            );

            throw error;
        }
    };

    // ==========================================
    // Load saved roadmap
    // ==========================================

    const loadRoadmap = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError("Please login again.");
                return;
            }

            const response = await fetch(
                `${API_URL}/roadmap`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            console.log(
                "Roadmap API Response:",
                data
            );

            if (response.status === 404) {
                setRoadmap(null);
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load roadmap"
                );
            }

            setRoadmap(data.roadmap);

        } catch (error) {
            console.error(
                "Load Roadmap Error:",
                error
            );

            setError(
                error.message ||
                "Unable to load roadmap."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Load progress
    // ==========================================

    const loadProgress = async () => {
        try {
            const token = getToken();

            if (!token) return;

            const response = await fetch(
                `${API_URL}/roadmap/progress`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setProgress(data.progress);
            }

        } catch (error) {
            console.error(
                "Progress Error:",
                error
            );
        }
    };

    // ==========================================
    // Generate roadmap
    // ==========================================

    const generateNewRoadmap = async () => {
        try {
            setGenerating(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError("Please login again.");
                return;
            }

            // Get latest missing skills
            const skills = await loadSkillGap();

            console.log(
                "Missing Skills for Roadmap:",
                skills
            );

            if (!Array.isArray(skills) || skills.length === 0) {
                throw new Error(
                    "No missing skills found. Please complete your profile and upload a resume first."
                );
            }

            const response = await fetch(
                `${API_URL}/roadmap`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        missingSkills: skills
                    })
                }
            );

            const data =
                await response.json();

            console.log(
                "Generated Roadmap:",
                data
            );

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to generate roadmap"
                );
            }

            setRoadmap(data.roadmap);

            await loadProgress();

        } catch (error) {
            console.error(
                "Generate Roadmap Error:",
                error
            );

            setError(
                error.message ||
                "Unable to generate roadmap."
            );

        } finally {
            setGenerating(false);
        }
    };

    // ==========================================
    // Update step completion
    // ==========================================

    const toggleStep = async (
        stepId,
        completed
    ) => {
        try {
            const token = getToken();

            if (!token) {
                setError("Please login again.");
                return;
            }

            if (!stepId) {
                setError("Invalid roadmap step.");
                return;
            }

            const response = await fetch(
                `${API_URL}/roadmap/progress`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        stepId,
                        completed
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update progress"
                );
            }

            setRoadmap(data.roadmap);

            await loadProgress();

        } catch (error) {
            console.error(
                "Update Progress Error:",
                error
            );

            setError(
                error.message ||
                "Unable to update progress."
            );
        }
    };

    // ==========================================
    // Initial load
    // ==========================================

    useEffect(() => {
        const initialize = async () => {
            await loadRoadmap();
            await loadProgress();
        };

        initialize();
    }, []);

    // ==========================================
    // Loading screen
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2
                        className="mx-auto mb-4 animate-spin text-blue-600"
                        size={45}
                    />

                    <h2 className="text-xl font-semibold text-slate-800">
                        Loading your roadmap...
                    </h2>

                    <p className="mt-2 text-slate-500">
                        SkillVerse is preparing your learning journey.
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // No roadmap
    // ==========================================

    if (!roadmap) {
        return (
            <div className="min-h-screen bg-slate-50">

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
                            <BookOpen size={24} />

                            <span className="font-bold">
                                SkillVerse AI
                            </span>
                        </div>

                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-6 py-20">

                    <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">

                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <Target size={32} />
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900">
                            Create Your Learning Roadmap
                        </h1>

                        <p className="mx-auto mt-4 max-w-xl text-slate-500">
                            SkillVerse AI will analyze your resume,
                            profile skills and career goal to create
                            a personalized learning roadmap.
                        </p>

                        {error && (
                            <div className="mx-auto mt-6 flex max-w-lg items-center gap-3 rounded-lg bg-red-50 p-4 text-left text-red-700">
                                <AlertCircle size={20} />

                                <span>
                                    {error}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={generateNewRoadmap}
                            disabled={generating}
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {generating ? (
                                <>
                                    <Loader2
                                        size={20}
                                        className="animate-spin"
                                    />

                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Target size={20} />

                                    Generate My Roadmap
                                </>
                            )}
                        </button>

                    </div>

                </main>
            </div>
        );
    }

    // ==========================================
    // Roadmap page
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
                        <BookOpen size={24} />

                        <span className="font-bold">
                            SkillVerse AI
                        </span>
                    </div>

                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">

                {/* Title */}

                <div className="mb-8">

                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
                        <Target size={16} />
                        AI Career Roadmap
                    </div>

                    <h1 className="text-4xl font-bold text-slate-900">
                        Your Learning Roadmap
                    </h1>

                    <p className="mt-3 max-w-2xl text-slate-600">
                        A personalized learning journey generated
                        according to your career goal and skill gaps.
                    </p>

                </div>

                {/* Career Goal */}

                <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-7 text-white shadow-lg">

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                            <Target size={26} />
                        </div>

                        <div>

                            <p className="text-sm text-blue-100">
                                Target Career
                            </p>

                            <h2 className="text-2xl font-bold capitalize">
                                {roadmap.careerGoal ||
                                    "Career Goal"}
                            </h2>

                        </div>

                    </div>

                </div>

                {/* Progress */}

                {progress && (
                    <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">

                        <div className="mb-4 flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                    <Trophy size={21} />
                                </div>

                                <div>

                                    <h2 className="font-semibold text-slate-900">
                                        Learning Progress
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        {progress.completedSteps} of{" "}
                                        {progress.totalSteps} steps completed
                                    </p>

                                </div>

                            </div>

                            <span className="text-2xl font-bold text-blue-600">
                                {progress.progressPercentage}%
                            </span>

                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                            <div
                                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                style={{
                                    width: `${progress.progressPercentage}%`
                                }}
                            />

                        </div>

                    </div>
                )}

                {/* Error */}

                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Roadmap */}

                <div className="space-y-6">

                    {roadmap.roadmap?.map(
                        (item, index) => (

                            <div
                                key={item._id || index}
                                className={`rounded-2xl border bg-white p-6 shadow-sm transition ${
                                    item.completed
                                        ? "border-green-200 bg-green-50/30"
                                        : "border-slate-200"
                                }`}
                            >

                                {/* Step Header */}

                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                                    <div className="flex items-start gap-4">

                                        <div
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${
                                                item.completed
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-blue-50 text-blue-600"
                                            }`}
                                        >
                                            {item.completed ? (
                                                <CheckCircle size={25} />
                                            ) : (
                                                item.step ||
                                                index + 1
                                            )}
                                        </div>

                                        <div>

                                            <p className="text-sm font-medium text-blue-600">
                                                Step{" "}
                                                {item.step ||
                                                    index + 1}
                                            </p>

                                            <h2 className="mt-1 text-xl font-bold text-slate-900">
                                                {item.skill}
                                            </h2>

                                        </div>

                                    </div>

                                    <div className="flex flex-wrap gap-2">

                                        {item.level && (
                                            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                                                {item.level}
                                            </span>
                                        )}

                                        {item.duration && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                <Clock size={13} />
                                                {item.duration}
                                            </span>
                                        )}

                                    </div>

                                </div>

                                {/* Topics */}

                                {Array.isArray(item.topics) &&
                                    item.topics.length > 0 && (

                                        <div className="mt-6">

                                            <h3 className="mb-3 font-semibold text-slate-800">
                                                Topics to Learn
                                            </h3>

                                            <div className="flex flex-wrap gap-2">

                                                {item.topics.map(
                                                    (
                                                        topic,
                                                        topicIndex
                                                    ) => (

                                                        <span
                                                            key={
                                                                topicIndex
                                                            }
                                                            className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700"
                                                        >
                                                            {typeof topic ===
                                                            "string"
                                                                ? topic
                                                                : topic?.name ||
                                                                  topic?.topic ||
                                                                  "Topic"}
                                                        </span>

                                                    )
                                                )}

                                            </div>

                                        </div>
                                    )}

                                {/* Project */}

                                {item.project && (
                                    <div className="mt-6 rounded-xl bg-blue-50 p-5">

                                        <div className="flex items-start gap-3">

                                            <Briefcase
                                                size={21}
                                                className="mt-0.5 shrink-0 text-blue-600"
                                            />

                                            <div>

                                                <h3 className="font-semibold text-blue-900">
                                                    Practical Project
                                                </h3>

                                                <p className="mt-1 text-sm text-blue-800">
                                                    {item.project}
                                                </p>

                                            </div>

                                        </div>

                                    </div>
                                )}

                                {/* Outcome */}

                                {item.outcome && (
                                    <div className="mt-5">

                                        <h3 className="font-semibold text-slate-800">
                                            Expected Outcome
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {item.outcome}
                                        </p>

                                    </div>
                                )}

                                {/* Completion */}

                                <div className="mt-6 flex items-center justify-between border-t pt-5">

                                    <label className="flex cursor-pointer items-center gap-3">

                                        <input
                                            type="checkbox"
                                            checked={Boolean(
                                                item.completed
                                            )}
                                            onChange={(e) =>
                                                toggleStep(
                                                    item._id,
                                                    e.target.checked
                                                )
                                            }
                                            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />

                                        <span className="text-sm font-medium text-slate-700">
                                            {item.completed
                                                ? "Completed"
                                                : "Mark as completed"}
                                        </span>

                                    </label>

                                    {item.completed && (
                                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600">

                                            <CheckCircle
                                                size={17}
                                            />

                                            Done

                                        </span>
                                    )}

                                </div>

                            </div>
                        )
                    )}

                </div>

                {/* Regenerate */}

                <div className="mt-8 flex justify-center">

                    <button
                        onClick={generateNewRoadmap}
                        disabled={generating}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >

                        {generating ? (
                            <Loader2
                                size={18}
                                className="animate-spin"
                            />
                        ) : (
                            <RefreshCw size={18} />
                        )}

                        Regenerate Roadmap

                    </button>

                </div>

            </main>

        </div>
    );
}

export default Roadmap;