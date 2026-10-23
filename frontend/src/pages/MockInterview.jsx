import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

const API_URL = "http://localhost:5000/api";

function MockInterview() {
  const [started, setStarted] = useState(false);
  const [interviewId, setInterviewId] = useState("");
  const [interviewType, setInterviewType] = useState("Technical");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // START INTERVIEW
  // =====================================================

  const startInterview = async () => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Please login again.");
    }

    const response = await fetch(
      "http://localhost:5000/api/mentor/start",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interviewType,
        }),
      }
    );

    const responseText = await response.text();

    console.log("STATUS:", response.status);
    console.log("RESPONSE:", responseText);

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Backend returned non-JSON response: ${responseText.substring(0, 200)}`
      );
    }

    if (!response.ok) {
      throw new Error(data.message || "Unable to start interview");
    }

    setInterviewId(data.interviewId);
    setQuestion(data.question);
    setQuestionNumber(data.questionNumber || 1);
    setStarted(true);
  } catch (error) {
    console.error("Start interview error:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

  // =====================================================
  // SUBMIT ANSWER
  // =====================================================

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please enter your answer.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(`${API_URL}/mentor/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interviewId,
          answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to evaluate answer"
        );
      }

      setEvaluation(data.evaluation);
    } catch (error) {
      console.error("Submit answer error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // NEXT QUESTION
  // =====================================================

  const nextQuestion = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(`${API_URL}/mentor/next`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interviewId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.completed) {
          await completeInterview();
          return;
        }

        throw new Error(
          data.message || "Unable to get next question"
        );
      }

      setQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setAnswer("");
      setEvaluation(null);
    } catch (error) {
      console.error("Next question error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COMPLETE INTERVIEW
  // =====================================================

  const completeInterview = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        `${API_URL}/mentor/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            interviewId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to complete interview"
        );
      }

      setFinalScore(data.totalScore);
      setCompleted(true);
    } catch (error) {
      console.error("Complete interview error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // START SCREEN
  // =====================================================

  if (!started) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-10">
            <h1 className="text-4xl font-bold">
              AI Mock Interview
            </h1>

            <p className="text-gray-600 mt-3">
              Practice real interview questions with your
              SkillVerse AI interviewer.
            </p>

            {/* INTERVIEW TYPE */}

            <div className="mt-8">
              <label className="block font-semibold mb-2">
                Choose Interview Type
              </label>

              <select
                value={interviewType}
                onChange={(e) =>
                  setInterviewType(e.target.value)
                }
                className="w-full border rounded-lg p-3"
              >
                <option value="Technical">
                  Technical
                </option>

                <option value="HR">
                  HR
                </option>

                <option value="Behavioral">
                  Behavioral
                </option>

                <option value="Project">
                  Project
                </option>

                <option value="Coding">
                  Coding
                </option>

                <option value="Mixed">
                  Mixed
                </option>
              </select>
            </div>

            {/* HOW IT WORKS */}

            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h2 className="font-bold text-lg">
                How it works
              </h2>

              <ul className="mt-4 space-y-3 text-gray-600">
                <li>
                  ✓ AI asks personalized questions
                </li>

                <li>
                  ✓ Answer using your own knowledge
                </li>

                <li>
                  ✓ AI evaluates every answer
                </li>

                <li>
                  ✓ Get feedback and improvement tips
                </li>

                <li>
                  ✓ Receive your final interview score
                </li>
              </ul>
            </div>

            {/* ERROR */}

            {error && (
              <p className="text-red-500 mt-5">
                {error}
              </p>
            )}

            {/* START BUTTON */}

            <button
              onClick={startInterview}
              disabled={loading}
              className="mt-8 w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Starting..."
                : "Start Mock Interview"}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // FINAL RESULT
  // =====================================================

  if (completed) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <h1 className="text-4xl font-bold">
              Interview Completed 🎉
            </h1>

            <p className="text-gray-600 mt-3">
              Great job completing your mock interview.
            </p>

            <div className="mt-10">
              <p className="text-gray-500">
                Your Score
              </p>

              <h2 className="text-6xl font-bold mt-2">
                {finalScore}/10
              </h2>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-10 bg-black text-white px-8 py-3 rounded-lg"
            >
              Start Another Interview
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // INTERVIEW SCREEN
  // =====================================================

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              AI Mock Interview
            </h1>

            <p className="text-gray-500 mt-1">
              {interviewType} Interview
            </p>
          </div>

          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            Question {questionNumber} / 5
          </div>
        </div>

        {/* QUESTION CARD */}

        <div className="bg-white rounded-2xl shadow p-8">
          <p className="text-sm text-gray-500">
            Interviewer
          </p>

          <h2 className="text-2xl font-semibold mt-3">
            {question}
          </h2>

          {/* ANSWER */}

          <textarea
            value={answer}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
            placeholder="Type your answer here..."
            className="w-full border rounded-xl p-4 mt-8 min-h-[180px] resize-none focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* ERROR */}

          {error && (
            <p className="text-red-500 mt-4">
              {error}
            </p>
          )}

          {/* SUBMIT */}

          {!evaluation ? (
            <button
              onClick={submitAnswer}
              disabled={loading}
              className="mt-5 w-full bg-black text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading
                ? "Evaluating..."
                : "Submit Answer"}
            </button>
          ) : (
            <div className="mt-8">

              {/* SCORE */}

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">
                    AI Evaluation
                  </h3>

                  <span className="text-3xl font-bold">
                    {evaluation.overallScore}/10
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <Score
                    title="Technical"
                    value={
                      evaluation.technicalAccuracy
                    }
                  />

                  <Score
                    title="Relevance"
                    value={
                      evaluation.relevance
                    }
                  />

                  <Score
                    title="Clarity"
                    value={
                      evaluation.clarity
                    }
                  />

                  <Score
                    title="Communication"
                    value={
                      evaluation.communication
                    }
                  />

                  <Score
                    title="Completeness"
                    value={
                      evaluation.completeness
                    }
                  />
                </div>
              </div>

              {/* STRENGTHS */}

              <div className="mt-6">
                <h3 className="font-bold text-lg">
                  Strengths
                </h3>

                <ul className="mt-2 space-y-1">
                  {evaluation.strengths?.map(
                    (item, index) => (
                      <li key={index}>
                        ✓ {item}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* IMPROVEMENTS */}

              <div className="mt-6">
                <h3 className="font-bold text-lg">
                  Areas to Improve
                </h3>

                <ul className="mt-2 space-y-1">
                  {evaluation.improvements?.map(
                    (item, index) => (
                      <li key={index}>
                        • {item}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* BETTER APPROACH */}

              {evaluation.betterApproach && (
                <div className="mt-6 bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-bold">
                    Better Approach
                  </h3>

                  <p className="mt-2 text-gray-700">
                    {evaluation.betterApproach}
                  </p>
                </div>
              )}

              {/* FEEDBACK */}

              <div className="mt-6 bg-gray-50 p-5 rounded-xl">
                <h3 className="font-bold">
                  AI Feedback
                </h3>

                <p className="mt-2 text-gray-700">
                  {evaluation.feedback}
                </p>
              </div>

              {/* NEXT / FINISH */}

              {questionNumber < 5 ? (
                <button
                  onClick={nextQuestion}
                  disabled={loading}
                  className="mt-7 w-full bg-black text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading
                    ? "Generating..."
                    : "Next Question →"}
                </button>
              ) : (
                <button
                  onClick={completeInterview}
                  disabled={loading}
                  className="mt-7 w-full bg-black text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading
                    ? "Finishing..."
                    : "Finish Interview"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// =========================================================
// SCORE COMPONENT
// =========================================================

function Score({ title, value }) {
  return (
    <div className="bg-white rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500">
        {title}
      </p>

      <p className="text-xl font-bold mt-1">
        {value}/10
      </p>
    </div>
  );
}

export default MockInterview;