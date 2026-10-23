import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Square,
  Volume2,
  Loader2,
  Bot,
  UserRound,
  Brain,
  ShieldCheck,
  ArrowRight,
  Award,
  RotateCcw,
} from "lucide-react";

import aiInterviewer from "../assets/ai-interviewer.png";

const API_URL = "http://localhost:5000/api";

function AIInterviewRoom() {
  // =====================================================
  // REFS
  // =====================================================

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const shouldKeepListeningRef = useRef(false);

  // =====================================================
  // INTERVIEW STATE
  // =====================================================

  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);

  const [loading, setLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [interviewId, setInterviewId] = useState("");

  const [interviewType, setInterviewType] =
    useState("Technical");

  // =====================================================
  // ANSWER
  // =====================================================

  const [answer, setAnswer] = useState("");
  const [liveTranscript, setLiveTranscript] =
    useState("");

  const [isListening, setIsListening] =
    useState(false);

  // =====================================================
  // AI SPEAKING
  // =====================================================

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [mouthOpen, setMouthOpen] =
    useState(false);

  // =====================================================
  // TIMER
  // =====================================================

  const [seconds, setSeconds] = useState(0);

  // =====================================================
  // MONITORING
  // =====================================================

  const [faceStatus, setFaceStatus] =
    useState("Waiting for camera");

  const [attentionStatus, setAttentionStatus] =
    useState("Waiting for camera");

  const [monitoringMessage, setMonitoringMessage] =
    useState("Enable camera to start monitoring.");

  // =====================================================
  // EVALUATION
  // =====================================================

  const [evaluation, setEvaluation] =
    useState(null);

  // =====================================================
  // FINAL RESULT
  // =====================================================

  const [finalResult, setFinalResult] =
    useState(null);

  // =====================================================
  // ERROR
  // =====================================================

  const [error, setError] = useState("");

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // API HELPER
  // =====================================================

  const apiRequest = async (
    endpoint,
    options = {}
  ) => {
    const token = getToken();

    if (!token) {
      throw new Error("Please login first.");
    }

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "Server returned an invalid response."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Something went wrong."
      );
    }

    return data;
  };

  // =====================================================
  // AI SPEECH
  // =====================================================

  const speakQuestion = (text) => {
    if (!text) return;

    if (!window.speechSynthesis) {
      setError(
        "Speech synthesis is not supported in this browser."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-IN";

    const voices =
      window.speechSynthesis.getVoices();

    const preferredVoice =
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith("en-in")
      ) ||
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith("en")
      );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);

      setMonitoringMessage(
        "SkillVerse AI is asking the interview question..."
      );
    };

    utterance.onend = () => {
      setIsSpeaking(false);

      setMonitoringMessage(
        "AI finished speaking. You can start answering."
      );
    };

    utterance.onerror = (event) => {
      console.error(
        "Speech synthesis error:",
        event
      );

      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // =====================================================
  // AI MOUTH ANIMATION
  // =====================================================

  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(false);
      return;
    }

    const interval = setInterval(() => {
      setMouthOpen((previous) => !previous);
    }, 130);

    return () => {
      clearInterval(interval);
    };
  }, [isSpeaking]);

  // =====================================================
  // CAMERA
  // =====================================================

  const startCamera = async () => {
    try {
      setError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Camera access is not supported by this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            facingMode: "user",
          },
          audio: true,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

      setCameraOn(true);
      setMicOn(true);

      setFaceStatus(
        "Face monitoring active"
      );

      setAttentionStatus(
        "Camera monitoring active"
      );

      setMonitoringMessage(
        "Keep your face centered and look toward the camera."
      );
    } catch (err) {
      console.error(
        "Camera error:",
        err
      );

      setError(
        "Camera and microphone permission is required. Please allow both in Chrome."
      );
    }
  };

  // =====================================================
  // STOP CAMERA
  // =====================================================

  const stopCamera = () => {
    stopListening();

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setMicOn(false);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);

    setFaceStatus("Camera disabled");
    setAttentionStatus("Camera disabled");

    setMonitoringMessage(
      "Camera monitoring is disabled."
    );
  };

  // =====================================================
  // SPEECH RECOGNITION SUPPORT
  // =====================================================

  const getSpeechRecognition = () => {
    return (
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      null
    );
  };

  // =====================================================
  // START SPEECH RECOGNITION
  // =====================================================

  const startListening = () => {
    const SpeechRecognition =
      getSpeechRecognition();

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );

      return;
    }

    // Stop old recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}

      recognitionRef.current = null;
    }

    setError("");

    shouldKeepListeningRef.current = true;

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log(
        "🎤 Speech recognition started"
      );

      setIsListening(true);

      setMonitoringMessage(
        "Listening to your answer..."
      );
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript;
        }
      }

      // IMPORTANT:
      // Add only FINAL speech to answer.
      if (finalText.trim()) {
        setAnswer((previous) => {
          const separator =
            previous.trim().length > 0
              ? " "
              : "";

          return (
            previous.trim() +
            separator +
            finalText.trim()
          );
        });
      }

      // Show live speech while speaking
      setLiveTranscript(interimText);

      console.log(
        "FINAL:",
        finalText
      );

      console.log(
        "INTERIM:",
        interimText
      );
    };

    recognition.onerror = (event) => {
      console.error(
        "🎤 Speech recognition error:",
        event.error
      );

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        shouldKeepListeningRef.current =
          false;

        setIsListening(false);

        setError(
          "Microphone permission was denied. Click the 🔒 icon near localhost:5173 and allow Microphone."
        );

        return;
      }

      if (event.error === "no-speech") {
        console.log(
          "No speech detected. Continuing..."
        );

        return;
      }

      if (event.error === "audio-capture") {
        setError(
          "Microphone could not be accessed. Please check your microphone."
        );

        shouldKeepListeningRef.current =
          false;

        setIsListening(false);
      }
    };

    recognition.onend = () => {
      console.log(
        "🎤 Speech recognition ended"
      );

      /*
       * Chrome may automatically stop recognition
       * after silence.
       *
       * Restart it while the user is answering.
       */

      if (
        shouldKeepListeningRef.current
      ) {
        console.log(
          "🔄 Restarting speech recognition..."
        );

        setTimeout(() => {
          if (
            shouldKeepListeningRef.current
          ) {
            try {
              recognition.start();
            } catch (error) {
              console.log(
                "Recognition restart:",
                error.message
              );
            }
          }
        }, 300);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Recognition start error:",
        error
      );

      setError(
        "Could not start voice recognition. Please try again."
      );

      setIsListening(false);
    }
  };

  // =====================================================
  // STOP LISTENING
  // =====================================================

  const stopListening = () => {
    shouldKeepListeningRef.current =
      false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}

      recognitionRef.current = null;
    }

    setIsListening(false);
    setLiveTranscript("");
  };

  // =====================================================
  // TIMER
  // =====================================================

  const startTimer = () => {
    clearInterval(timerRef.current);

    setSeconds(0);

    timerRef.current = setInterval(() => {
      setSeconds(
        (previous) => previous + 1
      );
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
  };

  const formatTime = (value) => {
    const minutes = Math.floor(
      value / 60
    );

    const secs = value % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  // =====================================================
  // START INTERVIEW
  // =====================================================

  const startInterview = async () => {
    try {
      if (!cameraOn) {
        setError(
          "Please enable your camera first."
        );

        return;
      }

      setLoading(true);
      setError("");

      setEvaluation(null);
      setFinalResult(null);

      const data = await apiRequest(
        "/mentor/start",
        {
          method: "POST",

          body: JSON.stringify({
            interviewType,
          }),
        }
      );

      console.log(
        "Interview started:",
        data
      );

      setInterviewId(
        data.interviewId || ""
      );

      setQuestion(
        data.question || ""
      );

      setQuestionNumber(
        data.questionNumber || 1
      );

      setInterviewStarted(true);
      setInterviewFinished(false);

      setAnswer("");
      setLiveTranscript("");

      startTimer();

      if (data.question) {
        setTimeout(() => {
          speakQuestion(
            data.question
          );
        }, 400);
      }
    } catch (err) {
      console.error(
        "Start interview error:",
        err
      );

      setError(
        err.message ||
          "Unable to start interview."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ATTACH CAMERA STREAM
  // =====================================================

  useEffect(() => {
    if (
      interviewStarted &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject =
        streamRef.current;

      videoRef.current
        .play()
        .catch((err) => {
          console.error(
            "Video play error:",
            err
          );
        });
    }
  }, [interviewStarted]);

  // =====================================================
  // START ANSWERING
  // =====================================================

  const startAnswering = () => {
    if (!interviewStarted) {
      return;
    }

    if (isSpeaking) {
      setError(
        "Please wait until the AI finishes speaking."
      );

      return;
    }

    if (!cameraOn) {
      setError(
        "Please enable the camera and microphone."
      );

      return;
    }

    setError("");

    setAnswer("");
    setLiveTranscript("");

    startTimer();

    startListening();
  };

  // =====================================================
  // SUBMIT ANSWER
  // =====================================================

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError(
        "Please speak your answer first."
      );

      return;
    }

    if (!interviewId) {
      setError(
        "Interview session not found."
      );

      return;
    }

    try {
      stopListening();

      stopTimer();

      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/mentor/answer",
        {
          method: "POST",

          body: JSON.stringify({
            interviewId,
            answer: answer.trim(),
          }),
        }
      );

      console.log(
        "Answer evaluation:",
        data
      );

      setEvaluation(
        data.evaluation || null
      );

      setMonitoringMessage(
        "Your answer has been evaluated by SkillVerse AI."
      );
    } catch (err) {
      console.error(
        "Answer submission error:",
        err
      );

      setError(
        err.message ||
          "Unable to evaluate your answer."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // NEXT QUESTION
  // =====================================================

  const getNextQuestion = async () => {
    if (!interviewId) {
      setError(
        "Interview session not found."
      );

      return;
    }

    /*
     * Backend allows maximum 5 questions.
     * Complete directly after question 5.
     */

    if (questionNumber >= 5) {
      await completeInterview();
      return;
    }

    try {
      setLoading(true);
      setError("");

      setEvaluation(null);
      setAnswer("");
      setLiveTranscript("");

      const data = await apiRequest(
        "/mentor/next",
        {
          method: "POST",

          body: JSON.stringify({
            interviewId,
          }),
        }
      );

      console.log(
        "Next question:",
        data
      );

      if (data.question) {
        setQuestion(
          data.question
        );

        setQuestionNumber(
          data.questionNumber ||
            questionNumber + 1
        );

        setMonitoringMessage(
          "Next question is ready. Listen carefully."
        );

        startTimer();

        setTimeout(() => {
          speakQuestion(
            data.question
          );
        }, 300);
      } else {
        await completeInterview();
      }
    } catch (err) {
      console.error(
        "Next question error:",
        err
      );

      setError(
        err.message ||
          "Unable to load next question."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COMPLETE INTERVIEW
  // =====================================================

  const completeInterview = async () => {
    if (!interviewId) {
      setError(
        "Interview session not found."
      );

      return;
    }

    try {
      stopListening();

      stopTimer();

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      setIsSpeaking(false);

      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/mentor/complete",
        {
          method: "POST",

          body: JSON.stringify({
            interviewId,
          }),
        }
      );

      console.log(
        "Interview completed:",
        data
      );

      setFinalResult(data);

      setInterviewStarted(false);
      setInterviewFinished(true);

      setMonitoringMessage(
        "Interview completed successfully."
      );
    } catch (err) {
      console.error(
        "Complete interview error:",
        err
      );

      setError(
        err.message ||
          "Unable to complete interview."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // END INTERVIEW
  // =====================================================

  const endInterview = async () => {
    if (!interviewId) {
      setInterviewStarted(false);

      stopTimer();
      stopListening();

      return;
    }

    const confirmEnd =
      window.confirm(
        "Are you sure you want to end the interview?"
      );

    if (!confirmEnd) {
      return;
    }

    await completeInterview();
  };

  // =====================================================
  // RESTART
  // =====================================================

  const restartInterview = () => {
    setInterviewStarted(false);
    setInterviewFinished(false);

    setInterviewId("");

    setQuestion("");
    setQuestionNumber(1);

    setAnswer("");
    setLiveTranscript("");

    setEvaluation(null);
    setFinalResult(null);

    setSeconds(0);

    setError("");

    setMonitoringMessage(
      "Enable camera to start a new interview."
    );
  };

  // =====================================================
  // CAMERA MONITORING
  // =====================================================

  useEffect(() => {
    if (!cameraOn) {
      return;
    }

    const monitor = setInterval(() => {
      if (
        videoRef.current &&
        videoRef.current.readyState >= 2
      ) {
        setFaceStatus(
          "Face camera active"
        );

        setAttentionStatus(
          "Look toward camera"
        );
      }
    }, 2000);

    return () => {
      clearInterval(monitor);
    };
  }, [cameraOn]);

  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {
    return () => {
      stopTimer();

      shouldKeepListeningRef.current =
        false;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // =====================================================
  // STATUS CARD
  // =====================================================

  const StatusCard = ({
    icon,
    title,
    status,
    type = "good",
  }) => {
    let StatusIcon = CheckCircle;

    if (type === "warning") {
      StatusIcon = AlertTriangle;
    }

    if (type === "error") {
      StatusIcon = XCircle;
    }

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-lg">
            {icon}
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-500">
              {title}
            </p>

            <p className="font-semibold mt-1">
              {status}
            </p>
          </div>

          <StatusIcon
            size={20}
            className={
              type === "error"
                ? "text-red-600"
                : type === "warning"
                ? "text-yellow-600"
                : "text-green-600"
            }
          />
        </div>
      </div>
    );
  };

  // =====================================================
  // EVALUATION CARD
  // =====================================================

  const EvaluationCard = () => {
    if (!evaluation) {
      return null;
    }

    return (
      <div className="bg-white border rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">
              AI Evaluation
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Feedback for Question{" "}
              {questionNumber}
            </p>
          </div>

          <div className="bg-black text-white rounded-xl px-5 py-3 text-center">
            <p className="text-xs text-gray-300">
              Score
            </p>

            <p className="text-2xl font-bold">
              {evaluation.overallScore ??
                0}
              /10
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            [
              "Technical",
              evaluation.technicalAccuracy,
            ],
            [
              "Relevance",
              evaluation.relevance,
            ],
            [
              "Clarity",
              evaluation.clarity,
            ],
            [
              "Communication",
              evaluation.communication,
            ],
            [
              "Completeness",
              evaluation.completeness,
            ],
          ].map(([label, score]) => (
            <div
              key={label}
              className="bg-gray-50 border rounded-xl p-4 text-center"
            >
              <p className="text-xs text-gray-500">
                {label}
              </p>

              <p className="text-xl font-bold mt-1">
                {score ?? 0}/10
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <div>
            <h3 className="font-bold text-green-700">
              Strengths
            </h3>

            <ul className="mt-2 space-y-2">
              {Array.isArray(
                evaluation.strengths
              ) &&
              evaluation.strengths.length >
                0 ? (
                evaluation.strengths.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 flex gap-2"
                    >
                      <CheckCircle
                        size={16}
                        className="text-green-600 mt-0.5 flex-shrink-0"
                      />

                      {item}
                    </li>
                  )
                )
              ) : (
                <li className="text-sm text-gray-500">
                  No strengths provided.
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-red-700">
              Areas for Improvement
            </h3>

            <ul className="mt-2 space-y-2">
              {Array.isArray(
                evaluation.improvements
              ) &&
              evaluation.improvements.length >
                0 ? (
                evaluation.improvements.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 flex gap-2"
                    >
                      <AlertTriangle
                        size={16}
                        className="text-red-500 mt-0.5 flex-shrink-0"
                      />

                      {item}
                    </li>
                  )
                )
              ) : (
                <li className="text-sm text-gray-500">
                  No improvements provided.
                </li>
              )}
            </ul>
          </div>
        </div>

        {evaluation.betterApproach && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-5">
            <h3 className="font-bold text-blue-900">
              Better Answer Approach
            </h3>

            <p className="text-sm text-blue-800 mt-2 leading-relaxed">
              {evaluation.betterApproach}
            </p>
          </div>
        )}

        {evaluation.feedback && (
          <div className="bg-gray-50 border rounded-xl p-5 mt-5">
            <h3 className="font-bold">
              AI Feedback
            </h3>

            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
              {evaluation.feedback}
            </p>
          </div>
        )}
      </div>
    );
  };

  // =====================================================
  // FINAL RESULT
  // =====================================================

  const FinalResultCard = () => {
    if (!finalResult) {
      return null;
    }

    return (
      <div className="bg-white border rounded-2xl p-8 mt-6 text-center">
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full">
            <Award
              size={42}
              className="text-green-600"
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-4">
          Interview Completed!
        </h2>

        <p className="text-gray-500 mt-1">
          Great job completing your AI mock
          interview.
        </p>

        <div className="flex justify-center mt-6">
          <div className="bg-black text-white rounded-2xl px-10 py-6">
            <p className="text-sm text-gray-300">
              Overall Score
            </p>

            <p className="text-5xl font-bold mt-2">
              {finalResult.totalScore ??
                0}

              <span className="text-xl">
                /10
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6">
          <div className="bg-gray-50 border rounded-xl p-4">
            <p className="text-gray-500 text-sm">
              Questions
            </p>

            <p className="text-xl font-bold mt-1">
              {finalResult.totalQuestions}
            </p>
          </div>

          <div className="bg-gray-50 border rounded-xl p-4">
            <p className="text-gray-500 text-sm">
              Interview Type
            </p>

            <p className="text-xl font-bold mt-1">
              {interviewType}
            </p>
          </div>
        </div>

        <button
          onClick={restartInterview}
          className="mt-7 flex items-center gap-2 mx-auto bg-black text-white px-6 py-3 rounded-lg font-semibold"
        >
          <RotateCcw size={18} />

          Start New Interview
        </button>
      </div>
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              AI Face-to-Face Interview
            </h1>

            <p className="text-gray-500 mt-1">
              Practice a realistic placement
              interview with SkillVerse AI.
            </p>
          </div>

          {!cameraOn ? (
            <button
              onClick={startCamera}
              className="flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-semibold"
            >
              <Camera size={18} />

              Enable Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-3 rounded-lg font-semibold"
            >
              <CameraOff size={18} />

              Turn Off Camera
            </button>
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
            {error}
          </div>
        )}

        {/* FINAL RESULT */}

        {interviewFinished && (
          <FinalResultCard />
        )}

        {/* SETUP */}

        {!interviewStarted &&
          !interviewFinished && (
            <div className="bg-white border rounded-xl p-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="font-semibold">
                    Interview Type
                  </label>

                  <select
                    value={interviewType}
                    onChange={(e) =>
                      setInterviewType(
                        e.target.value
                      )
                    }
                    className="mt-2 w-full border rounded-lg p-3"
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

                <button
                  onClick={startInterview}
                  disabled={
                    loading || !cameraOn
                  }
                  className="flex items-center justify-center gap-2 bg-black text-white px-7 py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Play size={18} />
                  )}

                  {loading
                    ? "Starting..."
                    : "Start Interview"}
                </button>
              </div>
            </div>
          )}

        {/* LIVE INTERVIEW */}

        {interviewStarted && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* AI INTERVIEWER */}

              <div className="bg-gray-950 rounded-2xl overflow-hidden shadow-xl">

                {/* AI HEADER */}

                <div className="px-5 py-4 flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full bg-white flex items-center justify-center ${
                        isSpeaking
                          ? "ring-4 ring-green-400 animate-pulse"
                          : ""
                      }`}
                    >
                      <Bot size={24} />
                    </div>

                    <div>
                      <p className="text-white font-semibold">
                        SkillVerse AI
                      </p>

                      <p className="text-gray-400 text-sm">
                        {isSpeaking
                          ? "Speaking..."
                          : "AI Interviewer"}
                      </p>
                    </div>
                  </div>

                  {isSpeaking && (
                    <Volume2
                      className="text-green-400 animate-pulse"
                      size={22}
                    />
                  )}
                </div>

                {/* AI VIDEO */}

                <div className="relative aspect-video bg-black overflow-hidden">

                  <img
                    src={aiInterviewer}
                    alt="SkillVerse AI Interviewer"
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-200 ${
                      isSpeaking
                        ? "scale-[1.01]"
                        : "scale-100"
                    }`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                  {/* NAME */}

                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <Bot size={17} />

                      <span className="font-semibold">
                        SkillVerse AI
                      </span>
                    </div>
                  </div>

                  {/* SPEAKING */}

                  <div className="absolute top-4 right-4 z-10">
                    {isSpeaking ? (
                      <div className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold">
                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />

                        Speaking

                        <Volume2
                          size={17}
                          className="animate-pulse"
                        />
                      </div>
                    ) : (
                      <div className="bg-black/70 text-white px-4 py-2 rounded-lg">
                        AI Interviewer
                      </div>
                    )}
                  </div>

                  {/* MOUTH ANIMATION */}

                  {isSpeaking && (
                    <div
                      className="absolute z-20 pointer-events-none"
                      style={{
                        left: "50%",
                        top: "57%",
                        transform:
                          "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        className={`transition-all duration-100 ${
                          mouthOpen
                            ? "scale-y-125"
                            : "scale-y-50"
                        }`}
                      >
                        <div className="w-7 h-2 bg-black rounded-full opacity-80" />
                      </div>
                    </div>
                  )}

                  {/* AUDIO WAVES */}

                  {isSpeaking && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8 z-10">
                      <span className="w-1 bg-green-400 rounded-full animate-pulse h-3" />
                      <span className="w-1 bg-green-400 rounded-full animate-pulse h-6" />
                      <span className="w-1 bg-green-400 rounded-full animate-pulse h-8" />
                      <span className="w-1 bg-green-400 rounded-full animate-pulse h-5" />
                      <span className="w-1 bg-green-400 rounded-full animate-pulse h-7" />
                      <span className="w-1 bg-green-400 rounded-full animate-pulse h-4" />
                    </div>
                  )}

                  {/* BOTTOM NAME */}

                  <div className="absolute bottom-4 left-4 z-10">
                    <p className="text-white font-semibold text-lg">
                      SkillVerse AI
                    </p>

                    <p className="text-gray-300 text-sm">
                      {isSpeaking
                        ? "Speaking..."
                        : "Listening to you"}
                    </p>
                  </div>
                </div>

                {/* QUESTION */}

                <div className="p-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">
                      Question{" "}
                      {questionNumber}
                    </span>

                    <span className="text-gray-400 text-sm">
                      {interviewType}
                    </span>
                  </div>

                  <p className="text-white text-xl font-semibold mt-3 leading-relaxed">
                    {question}
                  </p>
                </div>
              </div>

              {/* USER CAMERA */}

              <div className="bg-black rounded-2xl overflow-hidden shadow-xl relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full aspect-video object-cover"
                />

                {!cameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900">
                    <CameraOff size={55} />

                    <p className="mt-4 font-semibold">
                      Camera is off
                    </p>
                  </div>
                )}

                <div className="absolute top-4 left-4">
                  <span className="bg-black/70 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <UserRound size={15} />
                    You
                  </span>
                </div>

                {cameraOn && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />

                      LIVE MONITORING
                    </span>
                  </div>
                )}

                {cameraOn && (
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    <span className="bg-black/70 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                      {isListening ? (
                        <Mic size={14} />
                      ) : (
                        <MicOff size={14} />
                      )}

                      {isListening
                        ? "Listening..."
                        : "Mic Ready"}
                    </span>

                    <span className="bg-black/70 text-white px-3 py-2 rounded-lg text-xs">
                      {formatTime(seconds)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ANSWER */}

            <div className="bg-white border rounded-2xl p-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Your Answer
                  </h2>

                  <p className="text-sm text-gray-500">
                    Speak naturally. Your answer
                    will appear here.
                  </p>
                </div>

                {isListening && (
                  <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />

                    Recording
                  </div>
                )}
              </div>

              {/* ANSWER TEXT */}

              <div className="mt-4 min-h-[150px] bg-gray-50 border rounded-xl p-5">
                {answer ? (
                  <p className="text-gray-800 leading-relaxed">
                    {answer}
                  </p>
                ) : liveTranscript ? (
                  <p className="text-gray-500 italic">
                    {liveTranscript}
                  </p>
                ) : (
                  <p className="text-gray-400">
                    Your spoken answer will appear here...
                  </p>
                )}
              </div>

              {/* LIVE TRANSCRIPT */}

              {isListening &&
                liveTranscript && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-blue-600 mb-1">
                      LIVE TRANSCRIPT
                    </p>

                    <p className="text-blue-900">
                      {liveTranscript}
                    </p>
                  </div>
                )}

              {/* BUTTONS */}

              <div className="flex flex-wrap gap-3 mt-5">
                {!isListening ? (
                  <button
                    onClick={startAnswering}
                    disabled={
                      isSpeaking ||
                      loading
                    }
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                  >
                    <Mic size={18} />

                    Start Answer
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    <MicOff size={18} />

                    Stop Recording
                  </button>
                )}

                <button
                  onClick={submitAnswer}
                  disabled={
                    !answer.trim() ||
                    loading
                  }
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle size={18} />
                  )}

                  Submit Answer
                </button>

                <button
                  onClick={endInterview}
                  disabled={loading}
                  className="flex items-center gap-2 text-red-600 border border-red-200 px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  <Square size={16} />

                  End Interview
                </button>
              </div>
            </div>

            {/* EVALUATION */}

            <EvaluationCard />

            {/* NEXT QUESTION */}

            {evaluation && (
              <div className="flex justify-center mt-5">
                <button
                  onClick={getNextQuestion}
                  disabled={loading}
                  className="flex items-center gap-2 bg-black text-white px-7 py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <ArrowRight size={18} />
                  )}

                  {questionNumber >= 5
                    ? "Finish Interview"
                    : "Next Question"}
                </button>
              </div>
            )}
          </>
        )}

        {/* MONITORING */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <StatusCard
            icon={<Camera size={20} />}
            title="Camera"
            status={
              cameraOn
                ? "Active"
                : "Off"
            }
          />

          <StatusCard
            icon={<Eye size={20} />}
            title="Attention"
            status={
              attentionStatus
            }
            type={
              cameraOn
                ? "good"
                : "warning"
            }
          />

          <StatusCard
            icon={
              <ShieldCheck size={20} />
            }
            title="Monitoring"
            status={
              cameraOn
                ? "Active"
                : "Waiting"
            }
            type={
              cameraOn
                ? "good"
                : "warning"
            }
          />
        </div>

        {/* MONITORING MESSAGE */}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
          <div className="flex gap-3">
            <Brain
              className="text-blue-600 mt-1"
              size={22}
            />

            <div>
              <p className="font-semibold text-blue-900">
                Interview Monitoring
              </p>

              <p className="text-sm text-blue-700 mt-1">
                {monitoringMessage}
              </p>
            </div>
          </div>
        </div>

        {/* GUIDELINES */}

        {!interviewStarted &&
          !interviewFinished && (
            <div className="bg-white rounded-xl border p-6 mt-6">
              <h2 className="font-bold text-lg">
                Interview Guidelines
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <Camera size={20} />

                  <p className="font-semibold mt-2">
                    Face the Camera
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Keep your face visible and
                    positioned naturally.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <Eye size={20} />

                  <p className="font-semibold mt-2">
                    Maintain Attention
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Look toward the camera while
                    answering.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <Mic size={20} />

                  <p className="font-semibold mt-2">
                    Speak Clearly
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Answer naturally and explain
                    your thinking.
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}

export default AIInterviewRoom;