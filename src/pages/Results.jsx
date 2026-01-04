import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Home, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { useQuizStore } from "../stores/useQuizStore";
import { useTheme } from "../theme/Theme";
import { socket } from "../api/api";

const Results = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const { results, userScore, userAnswers, currentUser, resetQuiz } = useQuizStore();

    // Dummy data for room 1234
    const dummyData = {
        leaderboard: [
            { id: 1, name: "You", score: 4, accuracy: 80 },
            { id: 2, name: "Alex Johnson", score: 5, accuracy: 100 },
            { id: 3, name: "Sarah Williams", score: 3, accuracy: 60 },
            { id: 4, name: "Mike Chen", score: 2, accuracy: 40 },
            { id: 5, name: "Emma Davis", score: 4, accuracy: 80 },
            { id: 6, name: "John Smith", score: 1, accuracy: 20 },
        ].sort((a, b) => b.score - a.score), // Sort by score descending
        userAnswers: [
            {
                question: "What is React?",
                selectedAnswer: "Library",
                correctAnswer: "Library",
                isCorrect: true,
            },
            {
                question: "Which company developed JavaScript?",
                selectedAnswer: "Netscape",
                correctAnswer: "Netscape",
                isCorrect: true,
            },
            {
                question: "What does HTML stand for?",
                selectedAnswer: "High Text Machine Language",
                correctAnswer: "Hyper Text Markup Language",
                isCorrect: false,
            },
            {
                question: "Which of the following is not a programming language?",
                selectedAnswer: "HTML",
                correctAnswer: "HTML",
                isCorrect: true,
            },
            {
                question: "What is Node.js?",
                selectedAnswer: "A runtime environment",
                correctAnswer: "A runtime environment",
                isCorrect: true,
            },
        ],
        userScore: 4,
        totalQuestions: 5,
    };

    // Use dummy data if room code is 1234
    const isDummyRoom = roomCode === "1234";
    const displayLeaderboard = isDummyRoom ? dummyData.leaderboard : (results?.leaderboard || []);
    const displayUserAnswers = isDummyRoom ? dummyData.userAnswers : userAnswers;
    const displayUserScore = isDummyRoom ? dummyData.userScore : userScore;
    const displayTotalQuestions = isDummyRoom ? dummyData.totalQuestions : (results?.totalQuestions || userAnswers.length);

    // If no results, try to get from socket or show loading
    const [leaderboard, setLeaderboard] = useState(displayLeaderboard);
    const [isLoading, setIsLoading] = useState(!isDummyRoom && !results);

    useEffect(() => {
        // If dummy room, skip socket and loading
        if (isDummyRoom) {
            setIsLoading(false);
            return;
        }

        // Listen for quiz results from server
        socket.on("quiz_results", (data) => {
            setLeaderboard(data.leaderboard || []);
            setIsLoading(false);
        });

        // If we already have results, use them
        if (results?.leaderboard) {
            setLeaderboard(results.leaderboard);
            setIsLoading(false);
        }

        return () => {
            socket.off("quiz_results");
        };
    }, [results, isDummyRoom]);

    const handleGoHome = () => {
        resetQuiz();
        navigate("/");
    };

    const handlePlayAgain = () => {
        resetQuiz();
        navigate(`/lobby/${roomCode}`);
    };

    // Calculate statistics
    const totalQuestions = displayTotalQuestions || 0;
    const correctAnswers = displayUserAnswers.filter((a) => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Get user's rank (for dummy room, find "You" in leaderboard)
    const userRank = leaderboard.findIndex(
        (player) =>
            (isDummyRoom && player.name === "You") ||
            (!isDummyRoom && (player.name === currentUser.name || player.id === currentUser.id))
    ) + 1;

    // Get top 3 players
    const topThree = leaderboard.slice(0, 3);
    const medals = [Trophy, Medal, Award];

    if (isLoading) {
        return (
            <div className={`${theme.bg} min-h-screen flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className={theme.textMuted}>Loading results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${theme.bg} min-h-screen py-8 px-4`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className={`text-4xl md:text-5xl font-black mb-2 ${theme.text}`}>
                        Quiz Complete! 🎉
                    </h1>
                    <p className={`text-lg ${theme.textMuted}`}>Room: {roomCode}</p>
                </motion.div>

                {/* User Score Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`${theme.cardBg} rounded-2xl p-8 mb-8 shadow-xl`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className={`text-5xl font-black mb-2 ${theme.text}`}>
                                {displayUserScore}
                            </div>
                            <div className={`text-sm uppercase tracking-wider ${theme.textMuted}`}>
                                Total Score
                            </div>
                        </div>
                        <div className="text-center">
                            <div className={`text-5xl font-black mb-2 ${theme.text}`}>
                                {correctAnswers}/{totalQuestions}
                            </div>
                            <div className={`text-sm uppercase tracking-wider ${theme.textMuted}`}>
                                Correct Answers
                            </div>
                        </div>
                        <div className="text-center">
                            <div className={`text-5xl font-black mb-2 ${theme.text}`}>
                                {accuracy}%
                            </div>
                            <div className={`text-sm uppercase tracking-wider ${theme.textMuted}`}>
                                Accuracy
                            </div>
                        </div>
                    </div>
                    {userRank > 0 && (
                        <div className="mt-6 text-center">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme.container}`}>
                                <Trophy size={20} className="text-yellow-500" />
                                <span className={theme.text}>You ranked #{userRank} out of {leaderboard.length}</span>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Top 3 Podium */}
                {topThree.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <h2 className={`text-2xl font-bold mb-6 text-center ${theme.text}`}>
                            Top Performers
                        </h2>
                        <div className="flex items-end justify-center gap-4 max-w-2xl mx-auto">
                            {topThree.map((player, index) => {
                                const MedalIcon = medals[index];
                                const height = index === 0 ? "h-32" : index === 1 ? "h-24" : "h-20";
                                const colors = [
                                    "bg-gradient-to-t from-yellow-400 to-yellow-600",
                                    "bg-gradient-to-t from-gray-300 to-gray-500",
                                    "bg-gradient-to-t from-orange-400 to-orange-600",
                                ];

                                return (
                                    <motion.div
                                        key={player.id || index}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className="flex-1 flex flex-col items-center"
                                    >
                                        <div className={`${height} w-full ${colors[index]} rounded-t-xl flex items-center justify-center mb-2 shadow-lg`}>
                                            <MedalIcon
                                                size={index === 0 ? 48 : index === 1 ? 40 : 32}
                                                className="text-white"
                                            />
                                        </div>
                                        <div className={`${theme.cardBg} w-full p-4 rounded-b-xl text-center shadow-md`}>
                                            <div className={`font-bold text-lg ${theme.text}`}>{player.name}</div>
                                            <div className={`text-2xl font-black text-indigo-500 mt-1`}>
                                                {player.score}
                                            </div>
                                            {player.accuracy !== undefined && (
                                                <div className={`text-xs ${theme.textMuted} mt-1`}>
                                                    {player.accuracy}% accuracy
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Full Leaderboard */}
                {leaderboard.length > 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`${theme.cardBg} rounded-2xl p-6 mb-8 shadow-lg`}
                    >
                        <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>Full Leaderboard</h2>
                        <div className="space-y-2">
                            {leaderboard.slice(3).map((player, index) => (
                                <motion.div
                                    key={player.id || index + 3}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.05 }}
                                    className={`flex items-center justify-between p-4 rounded-xl ${theme.container} border border-slate-500/10`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${theme.text} ${theme.cardBg}`}>
                                            #{index + 4}
                                        </div>
                                        <div>
                                            <div className={`font-bold ${theme.text}`}>{player.name}</div>
                                            {player.accuracy !== undefined && (
                                                <div className={`text-xs ${theme.textMuted}`}>
                                                    {player.accuracy}% accuracy
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-black text-indigo-500`}>
                                        {player.score}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Answer Breakdown */}
                {displayUserAnswers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className={`${theme.cardBg} rounded-2xl p-6 mb-8 shadow-lg`}
                    >
                        <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>Your Answers</h2>
                        <div className="space-y-4">
                            {displayUserAnswers.map((answer, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + index * 0.05 }}
                                    className={`p-4 rounded-xl border ${answer.isCorrect
                                        ? "bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                        : "bg-red-50/50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {answer.isCorrect ? (
                                            <CheckCircle2 size={24} className="text-green-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle size={24} className="text-red-500 shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <div className={`font-semibold mb-2 ${theme.text}`}>
                                                Question {index + 1}: {answer.question}
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                <div>
                                                    <span className={theme.textMuted}>Your answer: </span>
                                                    <span className={answer.isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                                        {answer.selectedAnswer || "No answer"}
                                                    </span>
                                                </div>
                                                {!answer.isCorrect && (
                                                    <div>
                                                        <span className={theme.textMuted}>Correct answer: </span>
                                                        <span className="text-green-600 font-semibold">
                                                            {answer.correctAnswer}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={handleGoHome}
                        className={`px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2 ${theme.container} ${theme.text} border border-slate-500/20`}
                    >
                        <Home size={20} />
                        Go Home
                    </button>
                    {(currentUser.isHost || isDummyRoom) && (
                        <button
                            onClick={handlePlayAgain}
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={20} />
                            Play Again
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Results;

