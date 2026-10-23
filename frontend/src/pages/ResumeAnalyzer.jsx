import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

import api from "../services/api";

function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        setError("");
        setMessage("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError("Please upload a PDF, DOC, or DOCX file.");
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a resume first.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const formData = new FormData();

            formData.append("resume", file);

            const response = await api.post(
                "/resume/upload",
                formData
            );

            setMessage(
                response.data?.message ||
                "Resume uploaded successfully!"
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Resume upload failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Header */}
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl items-center px-6 py-5">

                    <Link
                        to="/skill-gap"
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600"
                    >
                        <ArrowLeft size={20} />
                        Back to Skill Gap
                    </Link>

                </div>
            </header>

            {/* Main */}
            <main className="mx-auto max-w-3xl px-6 py-12">

                <div className="mb-8 text-center">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        <FileText size={32} />
                    </div>

                    <h1 className="text-4xl font-bold text-slate-900">
                        Upload Your Resume
                    </h1>

                    <p className="mt-3 text-slate-600">
                        Upload your resume so SkillVerse can analyze your
                        skills and identify your skill gaps.
                    </p>

                </div>

                <div className="rounded-2xl border bg-white p-8 shadow-sm">

                    <form onSubmit={handleUpload}>

                        {/* Upload area */}
                        <label
                            htmlFor="resume"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 transition hover:border-blue-500 hover:bg-blue-50"
                        >

                            <Upload
                                size={40}
                                className="mb-4 text-blue-600"
                            />

                            <h2 className="text-lg font-semibold text-slate-800">
                                {file
                                    ? file.name
                                    : "Choose your resume"}
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                PDF, DOC or DOCX
                            </p>

                            <span className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white">
                                Browse Files
                            </span>

                            <input
                                id="resume"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                        </label>

                        {/* Selected file */}
                        {file && (
                            <div className="mt-5 flex items-center gap-3 rounded-xl bg-green-50 p-4">

                                <CheckCircle
                                    size={22}
                                    className="text-green-600"
                                />

                                <div>
                                    <p className="font-medium text-green-800">
                                        Resume selected
                                    </p>

                                    <p className="text-sm text-green-700">
                                        {file.name}
                                    </p>
                                </div>

                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mt-5 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">

                                <AlertCircle size={20} />

                                <p>{error}</p>

                            </div>
                        )}

                        {/* Success */}
                        {message && (
                            <div className="mt-5 flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700">

                                <CheckCircle size={20} />

                                <p>{message}</p>

                            </div>
                        )}

                        {/* Upload button */}
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >

                            <Upload size={20} />

                            {loading
                                ? "Uploading..."
                                : "Upload Resume"}

                        </button>

                    </form>

                </div>

                {/* Information */}
                <div className="mt-6 rounded-xl bg-blue-50 p-5">

                    <h3 className="font-semibold text-blue-900">
                        What happens after upload?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-blue-800">
                        SkillVerse will use your resume to analyze your
                        skills. You can then return to the Skill Gap page
                        to see which skills you need to improve for your
                        target career.
                    </p>

                </div>

            </main>
        </div>
    );
}

export default ResumeAnalyzer;