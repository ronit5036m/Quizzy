import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, X, CheckCircle2 } from "lucide-react";
import { useTheme } from "../theme/Theme";
import { useQuizStore } from "../stores/useQuizStore";
import api from "../api/api";
import { socket } from "../api/api";
import toast from "react-hot-toast";

const JoinRoom = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const theme = useTheme();
    const { setUser, setRoomInfo } = useQuizStore();

    // Get room code from URL params if available
    const roomCodeFromUrl = searchParams.get("code") || "";

    const [username, setUsername] = useState("");
    const [roomCode, setRoomCode] = useState(roomCodeFromUrl);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [roomInfo, setRoomInfoState] = useState(null);

    // Fetch room info when room code is entered
    useEffect(() => {
        if (roomCode && roomCode.length >= 6) {
            fetchRoomInfo(roomCode);
        }
    }, [roomCode]);

    const fetchRoomInfo = async (code) => {
        try {
            // API call to get room info
            const { data } = await api.get(`/room/info/${code}`);
            setRoomInfoState(data);
        } catch (error) {
            // If room doesn't exist, that's okay - user can still try to join
            console.log("Room info not available");
        }
    };

    const handleJoin = async () => {
        if (!username.trim()) {
            toast.error("Please enter your username");
            return;
        }

        if (!roomCode.trim()) {
            toast.error("Please enter a room code");
            return;
        }

        if (!agreedToTerms) {
            toast.error("Please agree to the terms and conditions");
            return;
        }

        setIsJoining(true);

        try {
            // Connect socket if not connected
            if (!socket.connected) {
                socket.connect();
            }

            // Join room via API
            const { data } = await api.post("/room/join", {
                roomCode: roomCode.trim().toUpperCase(),
                username: username.trim(),
            });

            // Set user info in store
            setUser({
                name: username.trim(),
                isHost: false,
                id: data.userId || Date.now().toString(),
            });

            // Set room info
            setRoomInfo(roomCode.trim().toUpperCase(), data.roomName || `Room ${roomCode}`);

            // Emit socket join event
            socket.emit("join_room", {
                roomId: roomCode.trim().toUpperCase(),
                user: { name: username.trim(), isHost: false },
            });

            toast.success("Successfully joined the room!");

            // Navigate to lobby
            setTimeout(() => {
                navigate(`/lobby/${roomCode.trim().toUpperCase()}`);
            }, 500);
        } catch (error) {
            // If API fails, allow joining for testing (you can remove this in production)
            if (error?.response?.status === 404 || !error?.response) {
                // For testing: allow joining without backend
                setUser({
                    name: username.trim(),
                    isHost: false,
                    id: Date.now().toString(),
                });

                setRoomInfo(roomCode.trim().toUpperCase(), `Room ${roomCode}`);

                if (!socket.connected) {
                    socket.connect();
                }

                socket.emit("join_room", {
                    roomId: roomCode.trim().toUpperCase(),
                    user: { name: username.trim(), isHost: false },
                });

                toast.success("Joined room (test mode)");
                setTimeout(() => {
                    navigate(`/lobby/${roomCode.trim().toUpperCase()}`);
                }, 500);
            } else {
                toast.error(
                    error?.response?.data?.message || "Failed to join room. Please check the room code."
                );
                setIsJoining(false);
            }
        }
    };

    const handleCancel = () => {
        navigate("/");
    };

    const quizRules = [
        "Don't be cheat",
        "The quiz have 4 questions options",
        "Every questions have limited time 10 sec",
        "The competition will be fare for every one.",
        "Winners will decided by according to the host",
    ];

    return (
        <div className={`${theme.bg} min-h-screen py-8 px-4 flex items-center justify-center`}>
            <div className="w-full max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${theme.cardBg} rounded-2xl p-8 shadow-xl`}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className={`text-4xl font-black mb-2 ${theme.text}`}>
                            Welcome to the quiz
                        </h1>
                        <p className={theme.textMuted}>Enter your details to join a room</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Username Input */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${theme.textMuted}`}>
                                Username
                            </label>
                            <div className="relative">
                                <User
                                    size={20}
                                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.inputIcon}`}
                                />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username ...."
                                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${theme.inputBg} ${theme.text}`}
                                    disabled={isJoining}
                                />
                            </div>
                        </div>

                        {/* Room Code Input */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                                Room ID
                            </label>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                                placeholder="Enter room code (e.g., ABC123)"
                                className={`w-full px-4 py-4 rounded-xl outline-none transition-all ${theme.inputBg} ${theme.text} font-mono text-lg tracking-wider`}
                                disabled={isJoining}
                                maxLength={10}
                            />
                        </div>

                        {/* Host Info (if available) */}
                        {roomInfo?.hostName && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`${theme.container} rounded-xl p-4 flex items-center gap-4`}
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    {roomInfo.hostName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className={`text-sm ${theme.textMuted}`}>Host</div>
                                    <div className={`font-bold ${theme.text}`}>{roomInfo.hostName}</div>
                                </div>
                            </motion.div>
                        )}

                        {/* Terms & Conditions */}
                        <div className={`${theme.container} rounded-xl p-6 border`}>
                            <h3 className={`font-bold mb-4 ${theme.text}`}>Quiz Rules & Terms</h3>
                            <ol className="space-y-2 mb-4">
                                {quizRules.map((rule, index) => (
                                    <li key={index} className={`flex items-start gap-2 ${theme.text}`}>
                                        <span className="font-bold text-indigo-500">{index + 1}.</span>
                                        <span>{rule}</span>
                                    </li>
                                ))}
                            </ol>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    disabled={isJoining}
                                />
                                <span className={theme.text}>I agree all T&C</span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                onClick={handleJoin}
                                disabled={isJoining || !username.trim() || !roomCode.trim() || !agreedToTerms}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg"
                            >
                                {isJoining ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Joining...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} />
                                        Join Room
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleCancel}
                                disabled={isJoining}
                                className={`w-full py-4 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 ${theme.container} ${theme.text} border border-slate-500/20`}
                            >
                                <X size={20} />
                                Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default JoinRoom;

