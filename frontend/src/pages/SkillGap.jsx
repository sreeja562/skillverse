import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    ArrowLeft,
    Brain,
    CheckCircle,
    AlertCircle,
    BookOpen,
    RefreshCw,
    Target,
    TrendingUp,
} from "lucide-react";

import { getSkillGap } from "../services/skillGapService";

function SkillGap() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // Load Skill Gap
    // ==========================================
    const loadSkillGap = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getSkillGap();

            console.log("Skill Gap Page Data:", result);

            setData(result);
        } catch (err) {
            console.error("Skill Gap Page Error:", err);

            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load skill gap analysis."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Initial Load
    // ==========================================
    useEffect(() => {
        loadSkillGap();
    }, []);

    // ==========================================
    // Loading
    // ==========================================
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <h2 className="text-xl font-semibold text-slate-800">
                        Analyzing your skills...
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Please wait while SkillVerse analyzes your profile and
                        resume.
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // Error
    // ==========================================
    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-4xl">
                    <Link
                        to="/dashboard"
                        className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Link>

                    <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <AlertCircle
                            className="mx-auto mb-4 text-red-500"
                            size={48}
                        />

                        <h1 className="text-2xl font-bold text-slate-800">
                            Skill Gap Analysis
                        </h1>

                        <p className="mt-3 text-red-600">{error}</p>

                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                            {error.toLowerCase().includes("resume") && (
                                <Link
                                    to="/resume"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                                >
                                    <BookOpen size={18} />
                                    Upload Resume
                                </Link>
                            )}

                            <button
                                onClick={loadSkillGap}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // Normalize API Data
    // ==========================================

    const skillGaps = Array.isArray(data?.missingSkills)
        ? data.missingSkills
        : [];

    const currentSkills = Array.isArray(data?.matchingSkills)
        ? data.matchingSkills
        : [];

    const requiredSkills = Array.isArray(data?.prioritySkills)
        ? data.prioritySkills
        : [];

    const roadmap = Array.isArray(data?.roadmap) ? data.roadmap : [];

    const targetRole = data?.careerGoal || "Your Target Career";

    // ==========================================
    // Helper: Convert Anything to Text
    // ==========================================

    const getText = (value, fallback = "") => {
        if (value === null || value === undefined) {
            return fallback;
        }

        if (typeof value === "string" || typeof value === "number") {
            return String(value);
        }

        if (typeof value === "object") {
            return (
                value.name ||
                value.skill ||
                value.title ||
                value.step ||
                value.description ||
                fallback
            );
        }

        return fallback;
    };

    // ==========================================
    // Get Skill Name
    // ==========================================

    const getSkillName = (skill) => {
        return getText(skill, "Skill");
    };

    // ==========================================
    // Get Roadmap Step Text
    // ==========================================

    const getStepText = (step) => {
        if (typeof step === "string" || typeof step === "number") {
            return String(step);
        }

        if (step && typeof step === "object") {
            return (
                step.step ||
                step.title ||
                step.description ||
                step.topic ||
                "Learning step"
            );
        }

        return "Learning step";
    };

    // ==========================================
    // Get Step Duration
    // ==========================================

    const getStepDuration = (step) => {
        if (step && typeof step === "object") {
            return step.duration || "";
        }

        return "";
    };

    // ==========================================
    // Priority Style
    // ==========================================

    const getPriorityClass = (priority) => {
        const value = String(priority || "").toLowerCase();

        if (value === "high") {
            return "bg-red-50 text-red-600";
        }

        if (value === "medium") {
            return "bg-yellow-50 text-yellow-700";
        }

        return "bg-green-50 text-green-700";
    };

    // ==========================================
    // Page
    // ==========================================

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ======================================
                Header
            ====================================== */}

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
                        <Brain size={24} />

                        <span className="font-bold">
                            SkillVerse AI
                        </span>
                    </div>
                </div>
            </header>

            {/* ======================================
                Main
            ====================================== */}

            <main className="mx-auto max-w-6xl px-6 py-10">
                {/* ==================================
                    Title
                ================================== */}

                <div className="mb-8">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
                        <Target size={16} />
                        AI Skill Analysis
                    </div>

                    <h1 className="text-4xl font-bold text-slate-900">
                        Skill Gap Analysis
                    </h1>

                    <p className="mt-3 max-w-2xl text-slate-600">
                        Discover the skills you already have and identify what
                        you need to learn to reach your career goal.
                    </p>
                </div>

                {/* ==================================
                    Target Career
                ================================== */}

                <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3">
                        <Target size={28} />

                        <div>
                            <p className="text-sm text-blue-100">
                                Target Career
                            </p>

                            <h2 className="text-2xl font-bold">
                                {targetRole}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* ==================================
                    Summary Cards
                ================================== */}

                <div className="mb-8 grid gap-5 md:grid-cols-3">
                    {/* Current Skills */}

                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <CheckCircle size={24} />
                        </div>

                        <p className="text-sm text-slate-500">
                            Current Skills
                        </p>

                        <p className="mt-1 text-3xl font-bold text-slate-900">
                            {currentSkills.length}
                        </p>
                    </div>

                    {/* Skill Gaps */}

                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <AlertCircle size={24} />
                        </div>

                        <p className="text-sm text-slate-500">
                            Skill Gaps
                        </p>

                        <p className="mt-1 text-3xl font-bold text-slate-900">
                            {skillGaps.length}
                        </p>
                    </div>

                    {/* Priority Skills */}

                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <TrendingUp size={24} />
                        </div>

                        <p className="text-sm text-slate-500">
                            Priority Skills
                        </p>

                        <p className="mt-1 text-3xl font-bold text-slate-900">
                            {requiredSkills.length}
                        </p>
                    </div>
                </div>

                {/* ==================================
                    Current Skills
                ================================== */}

                <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-slate-900">
                            Your Current Skills
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Skills identified from your profile and resume.
                        </p>
                    </div>

                    {currentSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {currentSkills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
                                >
                                    {getSkillName(skill)}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500">
                            No current skills were returned by the analysis.
                        </p>
                    )}
                </section>

                {/* ==================================
                    Skill Gaps
                ================================== */}

                <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            Skills You Need to Learn
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            These skills can help close the gap toward your
                            target career.
                        </p>
                    </div>

                    {skillGaps.length > 0 ? (
                        <div className="space-y-4">
                            {skillGaps.map((gap, index) => {
                                const skill = getSkillName(gap);

                                const priority =
                                    typeof gap === "object" && gap !== null
                                        ? gap.priority || gap.level
                                        : null;

                                const description =
                                    typeof gap === "object" && gap !== null
                                        ? gap.description || gap.reason
                                        : "";

                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col gap-4 rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                                <AlertCircle size={22} />
                                            </div>

                                            <div>
                                                <h3 className="font-semibold text-slate-900">
                                                    {skill}
                                                </h3>

                                                {description && (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {priority && (
                                            <span
                                                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                                                    priority
                                                )}`}
                                            >
                                                {priority} Priority
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl bg-green-50 p-6 text-center">
                            <CheckCircle
                                className="mx-auto mb-3 text-green-600"
                                size={40}
                            />

                            <h3 className="font-semibold text-green-800">
                                Great job!
                            </h3>

                            <p className="mt-1 text-sm text-green-700">
                                No major skill gaps were identified.
                            </p>
                        </div>
                    )}
                </section>

                {/* ==================================
                    Recommended Roadmap
                ================================== */}

                <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            Recommended Learning Roadmap
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            AI-generated learning steps based on your skill
                            gaps.
                        </p>
                    </div>

                    {roadmap.length > 0 ? (
                        <div className="space-y-5">
                            {roadmap.map((item, index) => {
                                const steps = Array.isArray(item?.steps)
                                    ? item.steps
                                    : [];

                                return (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-200 p-5"
                                    >
                                        {/* Roadmap Header */}

                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                                                    {index + 1}
                                                </div>

                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    {getText(
                                                        item?.skill,
                                                        "Learning Skill"
                                                    )}
                                                </h3>
                                            </div>

                                            {item?.priority && (
                                                <span
                                                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                                                        item.priority
                                                    )}`}
                                                >
                                                    {item.priority} Priority
                                                </span>
                                            )}
                                        </div>

                                        {/* Reason */}

                                        {item?.reason && (
                                            <p className="mt-3 text-sm text-slate-600">
                                                {item.reason}
                                            </p>
                                        )}

                                        {/* Learning Steps */}

                                        {steps.length > 0 && (
                                            <div className="mt-5">
                                                <p className="mb-3 text-sm font-semibold text-slate-800">
                                                    Learning Steps
                                                </p>

                                                <ul className="space-y-3">
                                                    {steps.map(
                                                        (
                                                            step,
                                                            stepIndex
                                                        ) => {
                                                            const stepText =
                                                                getStepText(
                                                                    step
                                                                );

                                                            const duration =
                                                                getStepDuration(
                                                                    step
                                                                );

                                                            return (
                                                                <li
                                                                    key={
                                                                        stepIndex
                                                                    }
                                                                    className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600"
                                                                >
                                                                    <CheckCircle
                                                                        size={
                                                                            18
                                                                        }
                                                                        className="mt-0.5 shrink-0 text-green-600"
                                                                    />

                                                                    <div>
                                                                        <p className="font-medium text-slate-700">
                                                                            {
                                                                                stepText
                                                                            }
                                                                        </p>

                                                                        {duration && (
                                                                            <p className="mt-1 text-xs text-slate-400">
                                                                                Duration:{" "}
                                                                                {
                                                                                    duration
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </li>
                                                            );
                                                        }
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Duration */}

                                        {item?.duration && (
                                            <div className="mt-5 rounded-lg bg-blue-50 px-4 py-3">
                                                <p className="text-sm font-medium text-blue-700">
                                                    Estimated duration:{" "}
                                                    {item.duration}
                                                </p>
                                            </div>
                                        )}

                                        {/* Project */}

                                        {item?.project && (
                                            <div className="mt-4 rounded-lg bg-purple-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                                                    Recommended Project
                                                </p>

                                                <p className="mt-1 text-sm text-purple-800">
                                                    {item.project}
                                                </p>
                                            </div>
                                        )}

                                        {/* Outcome */}

                                        {item?.outcome && (
                                            <div className="mt-4 rounded-lg bg-green-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                                                    Expected Outcome
                                                </p>

                                                <p className="mt-1 text-sm text-green-800">
                                                    {item.outcome}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl bg-slate-50 p-6 text-center">
                            <BookOpen
                                className="mx-auto mb-3 text-slate-400"
                                size={40}
                            />

                            <p className="text-slate-500">
                                No roadmap generated yet.
                            </p>
                        </div>
                    )}
                </section>

                {/* ==================================
                    Actions
                ================================== */}

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/roadmap"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700"
                    >
                        <BookOpen size={20} />
                        View Learning Roadmap
                    </Link>

                    <button
                        onClick={loadSkillGap}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-4 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw size={20} />
                        Re-analyze
                    </button>
                </div>
            </main>
        </div>
    );
}

export default SkillGap;