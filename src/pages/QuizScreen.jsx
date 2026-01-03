import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
// Use mock for testing
import socket from "../socket.mock";
import { useTheme } from "../theme/Theme"; // Adjust path if Theme.jsx is elsewhere

const QuizScreen = () => {
  const { roomCode } = useParams();
  const theme = useTheme();

  // QUESTION / ANSWERS
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // TIMING (accurate)
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(10);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  // LOCK after selection (user cannot change once picked)
  const [isLocked, setIsLocked] = useState(false);

  // ===== SOCKET EVENTS =====
  useEffect(() => {
    // Receive a new question from the backend (or mock)
    socket.on("newQuestion", (data) => {
      const t = data.time || 10;

      // Reset question data between questions
      setQuestion(data.question || "");
      setOptions(data.options || []);
      setTotalTime(t);
      setTimeLeft(t);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setIsSubmitted(false);
      setIsLocked(false);

      // Start timer for the question
      startTimeRef.current = Date.now();

      // Clear any previous timer
      if (timerRef.current) clearInterval(timerRef.current);

      // Timer ticks every 200ms for smooth progress bar
      timerRef.current = setInterval(() => {
        const elapsedMs = Date.now() - startTimeRef.current;
        const elapsedSec = Math.floor(elapsedMs / 1000);
        const remaining = Math.max(t - elapsedSec, 0);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }, 200);
    });

    socket.on("answerResult", (data) => {
      // Display the result sent by backend (or mock)
      setCorrectAnswer(data.correctAnswer);
    });

    return () => {
      // Clean up socket events and timers upon component unmount
      socket.off("newQuestion");
      socket.off("answerResult");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ===== SUBMIT ANSWER (auto when time ends) =====
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted) {
      setIsSubmitted(true);

      // Emit answer submission to the backend (or mock)
      socket.emit("submitAnswer", {
        roomCode,
        answer: selectedAnswer || null, // Send null if no selection
      });
    }
  }, [timeLeft, isSubmitted, selectedAnswer, roomCode]);

  // ===== TRANSITION LOGIC AFTER RESULT =====
  useEffect(() => {
    if (correctAnswer && isSubmitted) {
      const timer = setTimeout(() => {
        socket.emit("readyForNextQuestion");
      }, 2000); // Give user 2 seconds to see the result

      return () => clearTimeout(timer); // Cleanup if component unmounts
    }
  }, [correctAnswer, isSubmitted]);

  // When user selects an option
  const handleSelect = (opt) => {
    if (isLocked || timeLeft === 0) return; // Prevent changes if locked or timer ends

    setSelectedAnswer(opt);
    setIsLocked(true); // Lock selection once chosen
  };

  // Calculate progress bar percentage
  const percent =
    totalTime > 0
      ? Math.max(Math.min((timeLeft / totalTime) * 100, 100), 0)
      : 0;

  // Option styling logic using Tailwind CSS
  const optionBaseClasses =
    "w-full text-left px-4 py-3 rounded-lg mb-3 border transition-shadow flex items-center justify-between";
  const optionSelectedClass = "ring-2 ring-offset-1";
  const optionDisabledOpacity = "opacity-70 cursor-not-allowed";

  return (
    <div
      className={`${theme.bg} min-h-screen flex items-center justify-center py-8 px-4`}
    >
      <div
        className={`${theme.cardBg} w-full max-w-2xl rounded-2xl p-6`}
        style={{ boxShadow: "0 12px 30px rgba(2,6,23,0.12)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={`text-sm ${theme.textMuted}`}>Room</div>
            <div className={`text-lg font-semibold ${theme.text}`}>
              {roomCode}
            </div>
          </div>

          <div style={{ minWidth: 140, textAlign: "right" }}>
            <div className={`text-sm ${theme.textMuted}`}>Time left</div>
            <div className={`text-xl font-bold ${theme.text}`}>{timeLeft}s</div>
          </div>
        </div>

        {/* Question Display */}
        <h2 className={`mt-5 text-2xl font-semibold ${theme.text}`}>
          {question || "Waiting for the next question..."}
        </h2>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-2 rounded-full bg-slate-200/60 overflow-hidden">
            <div
              style={{
                width: `${percent}%`,
                height: "100%",
                transition: "width 0.2s linear",
                background: "linear-gradient(90deg,#06b6d4,#7c3aed)",
              }}
            />
          </div>
        </div>

        {/* Options */}
        <div className="mt-6">
          {options && options.length > 0 ? (
            options.map((opt, idx) => {
              // Styling for each option
              const isThisSelected = selectedAnswer === opt;
              const isCorrect = correctAnswer === opt;
              const disabled =
                isSubmitted || (isLocked && !isThisSelected) || timeLeft === 0;

              const bg =
                isSubmitted && isCorrect
                  ? "bg-green-50 border-green-200"
                  : isSubmitted && isThisSelected && !isCorrect
                    ? "bg-red-50 border-red-200"
                    : isThisSelected
                      ? "bg-sky-50 border-sky-200"
                      : "bg-transparent border-slate-200";

              const extra = isThisSelected ? optionSelectedClass : "";
              const disabledClass = disabled
                ? optionDisabledOpacity
                : "hover:shadow-lg";

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  disabled={disabled}
                  className={`${optionBaseClasses} ${extra} ${disabledClass} ${bg}`}
                  style={{
                    borderColor: "rgba(148,163,184,0.3)",
                  }}
                >
                  <div className={`${theme.text}`}>{opt}</div>
                  <div
                    style={{ marginLeft: 12, fontSize: 14 }}
                    className={theme.textMuted}
                  >
                    {isSubmitted && isCorrect
                      ? "✔"
                      : isThisSelected
                        ? "●"
                        : ""}
                  </div>
                </button>
              );
            })
          ) : (
            <div className={theme.textMuted} style={{ marginTop: 8 }}>
              Waiting for question...
            </div>
          )}
        </div>

        {/* Correct/Wrong Result */}
        <div className="mt-4">
          {isSubmitted && correctAnswer && (
            <div className="text-center">
              <div
                className={`text-lg font-semibold ${
                  selectedAnswer === correctAnswer
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {selectedAnswer === correctAnswer ? "✅ Correct!" : "❌ Wrong"}
              </div>
              <div className={`text-sm mt-2 ${theme.textMuted}`}>
                Correct answer: {correctAnswer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;
