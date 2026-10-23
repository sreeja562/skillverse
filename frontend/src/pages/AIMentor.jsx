import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
    Bot,
    Send,
    Sparkles,
    User,
    Lightbulb,
    Target,
    Code,
    MessageSquare,
} from "lucide-react";
import { chatWithMentor } from "../services/mentorService";
function AIMentor() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi! I'm your SkillVerse AI Mentor 🤖. I can help you with your career, skills, projects, interview preparation, and learning roadmap. What would you like to work on today?",
        },
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const suggestions = [
        {
            icon: <Target size={18} />,
            text: "What should I learn next?",
        },
        {
            icon: <Code size={18} />,
            text: "Suggest a project for me",
        },
        {
            icon: <MessageSquare size={18} />,
            text: "Prepare me for an interview",
        },
        {
            icon: <Lightbulb size={18} />,
            text: "How can I improve my skills?",
        },
    ];

    const sendMessage = async (message = input) => {
    const text = message.trim();

    if (!text || loading) return;

    setMessages((prev) => [
        ...prev,
        {
            role: "user",
            content: text,
        },
    ]);

    setInput("");
    setLoading(true);

    try {
        const data = await chatWithMentor(text);

        setMessages((prev) => [
            ...prev,
            {
                role: "assistant",
                content:
                    data.response ||
                    "Sorry, I couldn't generate a response.",
            },
        ]);
    } catch (error) {
        console.error("AI Mentor Error:", error);

        setMessages((prev) => [
            ...prev,
            {
                role: "assistant",
                content:
                    error.message ||
                    "Something went wrong. Please try again.",
            },
        ]);
    } finally {
        setLoading(false);
    }
};

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-80px)]">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 text-white p-3 rounded-xl">
                            <Bot size={28} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                AI Mentor
                            </h1>

                            <p className="text-gray-500 mt-1">
                                Your personal AI career and learning mentor
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Chat Card */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">

                    {/* Chat Header */}
                    <div className="px-6 py-4 border-b flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <div className="relative">
                                <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Bot size={23} />
                                </div>

                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>

                            <div>
                                <h2 className="font-semibold text-gray-800">
                                    SkillVerse Mentor
                                </h2>

                                <p className="text-xs text-green-600">
                                    Online
                                </p>
                            </div>

                        </div>

                        <div className="flex items-center gap-2 text-indigo-600 text-sm">
                            <Sparkles size={16} />
                            AI Powered
                        </div>

                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">

                        {messages.map((message, index) => (

                            <div
                                key={index}
                                className={`flex ${
                                    message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >

                                <div
                                    className={`flex gap-3 max-w-[75%] ${
                                        message.role === "user"
                                            ? "flex-row-reverse"
                                            : ""
                                    }`}
                                >

                                    {/* Avatar */}
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                            message.role === "user"
                                                ? "bg-gray-200 text-gray-600"
                                                : "bg-indigo-100 text-indigo-600"
                                        }`}
                                    >
                                        {message.role === "user" ? (
                                            <User size={18} />
                                        ) : (
                                            <Bot size={18} />
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div
                                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                            message.role === "user"
                                                ? "bg-indigo-600 text-white rounded-tr-none"
                                                : "bg-gray-100 text-gray-700 rounded-tl-none"
                                        }`}
                                    >
                                        {message.content}
                                    </div>

                                </div>

                            </div>

                        ))}

                        {/* Loading */}
                        {loading && (
                            <div className="flex gap-3">

                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <Bot size={18} />
                                </div>

                                <div className="bg-gray-100 px-5 py-3 rounded-2xl rounded-tl-none">

                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                                    </div>

                                </div>

                            </div>
                        )}

                    </div>

                    {/* Suggestions */}
                    <div className="px-6 pb-3">

                        <p className="text-xs text-gray-400 mb-2">
                            Try asking
                        </p>

                        <div className="flex gap-2 overflow-x-auto pb-2">

                            {suggestions.map((suggestion, index) => (

                                <button
                                    key={index}
                                    onClick={() =>
                                        sendMessage(suggestion.text)
                                    }
                                    className="flex items-center gap-2 whitespace-nowrap px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                >
                                    {suggestion.icon}
                                    {suggestion.text}
                                </button>

                            ))}

                        </div>

                    </div>

                    {/* Input */}
                    <div className="p-5 border-t bg-gray-50">

                        <div className="flex items-end gap-3">

                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask your AI Mentor anything..."
                                rows={1}
                                className="flex-1 resize-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />

                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <Send size={20} />
                            </button>

                        </div>

                        <p className="text-xs text-gray-400 mt-2 text-center">
                            AI Mentor can make mistakes. Verify important information.
                        </p>

                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}

export default AIMentor;