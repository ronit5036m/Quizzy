// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { useQuizStore } from "../stores/useQuizStore";
// import { useTheme } from "../theme/Theme";
// import { Users, Crown, Copy, Play, AlertCircle, Check } from "lucide-react";
// import { socket } from "../api/api";

// const Lobby = () => {
//   const { roomId } = useParams();
//   const navigate = useNavigate();
//   const theme = useTheme();

//   // Store State
//   const { currentUser, players, setPlayers, setLiveQuestion } = useQuizStore();

//   // Local UI State
//   const [copied, setCopied] = useState(false);
//   const [errorMsg, setErrorMsg] = useState(null);

//   useEffect(() => {
//     // 1. Connection & Join Logic
//     if (!socket.connected) socket.connect();

//     // If user has no name (e.g., direct link access), redirect to join/home
//     if (!currentUser.name) {
//       navigate("/");
//       return;
//     }

//     // Emit Join Event
//     socket.emit("join-room", { roomCode: roomId, name: currentUser.name });

//     // 2. Event Listeners
//     const handlePlayerList = (updatedPlayers) => {
//       setPlayers(updatedPlayers);
//     };

//     const handleNewQuestion = (data) => {
//       // Backend sends: { index, question, options, time }
//       setLiveQuestion(data);
//       navigate(`/game/${roomId}`);
//     };

//     const handleError = (msg) => setErrorMsg(msg);

//     // specific backend error objects
//     const handleBlock = (data) => setErrorMsg(data.message);

//     socket.on("player-list", handlePlayerList);
//     socket.on("new-question", handleNewQuestion); // This triggers the start
//     socket.on("error", handleError);
//     socket.on("join-blocked", handleBlock);
//     socket.on("quiz-ended-message", handleBlock);

//     // Cleanup
//     return () => {
//       socket.off("player-list", handlePlayerList);
//       socket.off("new-question", handleNewQuestion);
//       socket.off("error", handleError);
//       socket.off("join-blocked", handleBlock);
//       socket.off("quiz-ended-message", handleBlock);
//     };
//   }, [roomId, currentUser.name, navigate, setPlayers, setLiveQuestion]);

//   const handleStartGame = () => {
//     // Only host emits this
//     socket.emit("start-quiz", { roomCode: roomId });
//   };

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(roomId);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   if (errorMsg) {
//     return (
//       <div
//         className={`min-h-screen flex items-center justify-center ${theme.bg}`}
//       >
//         <div
//           className={`p-8 rounded-2xl border text-center max-w-md ${theme.cardBg} ${theme.text}`}
//         >
//           <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
//           <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
//           <p className="opacity-70 mb-6">{errorMsg}</p>
//           <button
//             onClick={() => navigate("/")}
//             className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold"
//           >
//             Back to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-[90vh] p-6 lg:p-12 ${theme.bg} ${theme.text}`}>
//       <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* LEFT COLUMN: Room Info & Actions */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className="lg:col-span-1 space-y-6"
//         >
//           {/* Room Code Card */}
//           <div
//             className={`p-6 rounded-2xl border ${theme.container} shadow-lg relative overflow-hidden`}
//           >
//             <div
//               className={`absolute top-0 right-0 p-32 ${theme.blobPurple} rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none`}
//             ></div>

//             <h3
//               className={`text-xs font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}
//             >
//               Room Code
//             </h3>

//             <div className="flex items-center justify-between gap-4">
//               <span className="text-5xl font-black tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
//                 {roomId}
//               </span>
//               <button
//                 onClick={copyToClipboard}
//                 className={`p-3 rounded-xl transition-all ${
//                   copied
//                     ? "bg-green-500/20 text-green-500"
//                     : "bg-slate-500/10 hover:bg-slate-500/20"
//                 }`}
//               >
//                 {copied ? <Check size={24} /> : <Copy size={24} />}
//               </button>
//             </div>
//             <p className="mt-4 text-sm opacity-60">
//               Share this code with your friends to join.
//             </p>
//           </div>

//           {/* Host Controls */}
//           <div className={`p-6 rounded-2xl border ${theme.cardBg}`}>
//             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
//               <Crown size={20} className="text-yellow-500" />
//               {currentUser.isHost ? "Host Controls" : "Waiting Area"}
//             </h3>

//             {currentUser.isHost ? (
//               <div className="space-y-4">
//                 <p className="text-sm opacity-70">
//                   You are the host. Once everyone is here, click start to begin
//                   the quiz immediately.
//                 </p>
//                 <button
//                   onClick={handleStartGame}
//                   className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
//                 >
//                   <Play size={20} fill="currentColor" /> Start Quiz
//                 </button>
//               </div>
//             ) : (
//               <div className="text-center py-6 bg-slate-500/5 rounded-xl border border-dashed border-slate-500/30">
//                 <div className="flex justify-center mb-3">
//                   <span className="relative flex h-3 w-3">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
//                     <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
//                   </span>
//                 </div>
//                 <p className="font-medium animate-pulse">
//                   Waiting for host to start...
//                 </p>
//               </div>
//             )}
//           </div>
//         </motion.div>

//         {/* RIGHT COLUMN: Player List */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col h-[600px] ${theme.container} shadow-xl`}
//         >
//           <div className="flex justify-between items-center mb-6 border-b border-slate-500/10 pb-4">
//             <h2 className="text-2xl font-bold flex items-center gap-3">
//               <Users className="text-indigo-500" />
//               Players
//               <span
//                 className={`px-3 py-1 rounded-full text-sm ${theme.inputBg}`}
//               >
//                 {players.length} joined
//               </span>
//             </h2>
//           </div>

//           <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
//             <AnimatePresence>
//               {players.map((player) => (
//                 <motion.div
//                   key={player.socketId || player.name}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${theme.cardBg}`}
//                 >
//                   <div
//                     className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md
//                     ${
//                       player.name === currentUser.name
//                         ? "bg-gradient-to-br from-indigo-500 to-purple-500"
//                         : "bg-gradient-to-br from-slate-400 to-slate-500"
//                     }`}
//                   >
//                     {player.name.charAt(0).toUpperCase()}
//                   </div>

//                   <div className="flex-1">
//                     <div className="flex items-center gap-2">
//                       <p className="font-bold text-lg">{player.name}</p>
//                       {player.name === currentUser.name && (
//                         <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded">
//                           You
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>

//             {players.length === 0 && (
//               <div className="h-full flex flex-col items-center justify-center opacity-40">
//                 <Users size={48} className="mb-2" />
//                 <p>Waiting for players to join...</p>
//               </div>
//             )}
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Lobby;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { useQuizStore } from "../stores/useQuizStore";
// import { useTheme } from "../theme/Theme";
// import { Users, Crown, Copy, Play, AlertCircle, Check } from "lucide-react";
// import { socket } from "../api/api";

// const Lobby = () => {
//   const { roomId } = useParams();
//   const navigate = useNavigate();
//   const theme = useTheme();

//   // Store State
//   const { currentUser, players, setPlayers, setLiveQuestion } = useQuizStore();

//   // Local UI State
//   const [copied, setCopied] = useState(false);
//   const [errorMsg, setErrorMsg] = useState(null);

//   useEffect(() => {
//     // 1. Ensure Connection
//     if (!socket.connected) {
//       socket.connect();
//     }

//     if (!currentUser.name) {
//       navigate("/");
//       return;
//     }

//     // 2. Define Handlers (Must be defined BEFORE emitting join)
//     const handlePlayerList = (updatedPlayers) => {
//       console.log("⚡ Player Update Received:", updatedPlayers); // Debug Log
//       setPlayers(updatedPlayers);
//     };

//     const handleNewQuestion = (data) => {
//       setLiveQuestion(data);
//       navigate(`/game/${roomId}`);
//     };

//     const handleError = (msg) => setErrorMsg(msg);
//     const handleBlock = (data) => setErrorMsg(data.message);

//     // 3. Register Listeners
//     socket.on("player-list", handlePlayerList);
//     socket.on("new-question", handleNewQuestion);
//     socket.on("error", handleError);
//     socket.on("join-blocked", handleBlock);
//     socket.on("quiz-ended-message", handleBlock);

//     // 4. EMIT JOIN (Only after listeners are ready)
//     // We wrap this in a timeout to ensure React has fully mounted the listeners
//     // though strictly moving it below socket.on is usually enough.
//     socket.emit("join-room", { roomCode: roomId, name: currentUser.name });

//     // Cleanup
//     return () => {
//       socket.off("player-list", handlePlayerList);
//       socket.off("new-question", handleNewQuestion);
//       socket.off("error", handleError);
//       socket.off("join-blocked", handleBlock);
//       socket.off("quiz-ended-message", handleBlock);
//     };
//   }, [roomId, currentUser.name, navigate, setPlayers, setLiveQuestion]);

//   const handleStartGame = () => {
//     socket.emit("start-quiz", { roomCode: roomId });
//   };

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(roomId);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   // Error State UI
//   if (errorMsg) {
//     return (
//       <div
//         className={`min-h-screen flex items-center justify-center ${theme.bg}`}
//       >
//         <div
//           className={`p-8 rounded-2xl border text-center max-w-md ${theme.cardBg} ${theme.text}`}
//         >
//           <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
//           <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
//           <p className="opacity-70 mb-6">{errorMsg}</p>
//           <button
//             onClick={() => navigate("/")}
//             className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold"
//           >
//             Back to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-[90vh] p-6 lg:p-12 ${theme.bg} ${theme.text}`}>
//       <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* LEFT COLUMN: Room Info & Actions */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className="lg:col-span-1 space-y-6"
//         >
//           {/* Room Code Card */}
//           <div
//             className={`p-6 rounded-2xl border ${theme.container} shadow-lg relative overflow-hidden`}
//           >
//             <div
//               className={`absolute top-0 right-0 p-32 ${theme.blobPurple} rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none`}
//             ></div>

//             <h3
//               className={`text-xs font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}
//             >
//               Room Code
//             </h3>

//             <div className="flex items-center justify-between gap-4">
//               <span className="text-5xl font-black tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
//                 {roomId}
//               </span>
//               <button
//                 onClick={copyToClipboard}
//                 className={`p-3 rounded-xl transition-all ${
//                   copied
//                     ? "bg-green-500/20 text-green-500"
//                     : "bg-slate-500/10 hover:bg-slate-500/20"
//                 }`}
//               >
//                 {copied ? <Check size={24} /> : <Copy size={24} />}
//               </button>
//             </div>
//             <p className="mt-4 text-sm opacity-60">
//               Share this code with your friends to join.
//             </p>
//           </div>

//           {/* Host Controls */}
//           <div className={`p-6 rounded-2xl border ${theme.cardBg}`}>
//             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
//               <Crown size={20} className="text-yellow-500" />
//               {currentUser.isHost ? "Host Controls" : "Waiting Area"}
//             </h3>

//             {currentUser.isHost ? (
//               <div className="space-y-4">
//                 <p className="text-sm opacity-70">
//                   You are the host. Once everyone is here, click start to begin
//                   the quiz immediately.
//                 </p>
//                 <button
//                   onClick={handleStartGame}
//                   className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
//                 >
//                   <Play size={20} fill="currentColor" /> Start Quiz
//                 </button>
//               </div>
//             ) : (
//               <div className="text-center py-6 bg-slate-500/5 rounded-xl border border-dashed border-slate-500/30">
//                 <div className="flex justify-center mb-3">
//                   <span className="relative flex h-3 w-3">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
//                     <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
//                   </span>
//                 </div>
//                 <p className="font-medium animate-pulse">
//                   Waiting for host to start...
//                 </p>
//               </div>
//             )}
//           </div>
//         </motion.div>

//         {/* RIGHT COLUMN: Player List */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col h-[600px] ${theme.container} shadow-xl`}
//         >
//           <div className="flex justify-between items-center mb-6 border-b border-slate-500/10 pb-4">
//             <h2 className="text-2xl font-bold flex items-center gap-3">
//               <Users className="text-indigo-500" />
//               Players
//               <span
//                 className={`px-3 py-1 rounded-full text-sm ${theme.inputBg}`}
//               >
//                 {players.length} joined
//               </span>
//             </h2>
//           </div>

//           <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
//             <AnimatePresence mode="popLayout">
//               {players.map((player) => (
//                 <motion.div
//                   key={player.socketId || player.name}
//                   initial={{ opacity: 0, x: 50 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${theme.cardBg}`}
//                 >
//                   <div
//                     className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md
//                     ${
//                       player.name === currentUser.name
//                         ? "bg-gradient-to-br from-indigo-500 to-purple-500"
//                         : "bg-gradient-to-br from-slate-400 to-slate-500"
//                     }`}
//                   >
//                     {player.name.charAt(0).toUpperCase()}
//                   </div>

//                   <div className="flex-1">
//                     <div className="flex items-center gap-2">
//                       <p className="font-bold text-lg">{player.name}</p>
//                       {player.name === currentUser.name && (
//                         <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded">
//                           You
//                         </span>
//                       )}
//                       {/* Identify Host in the list */}
//                       {/* Note: Your backend doesn't explicitly send an isHost flag in the player list,
//                              so we can't reliably show a crown on the host unless the backend sends it.
//                              For now, we rely on currentUser.isHost for the controls only. */}
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>

//             {players.length === 0 && (
//               <div className="h-full flex flex-col items-center justify-center opacity-40">
//                 <Users size={48} className="mb-2" />
//                 <p>Waiting for players to join...</p>
//               </div>
//             )}
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Lobby;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizStore } from "../stores/useQuizStore";
import { useTheme } from "../theme/Theme";
import {
  Users,
  Crown,
  Copy,
  Play,
  AlertCircle,
  Check,
  Wifi,
  WifiOff,
} from "lucide-react";
import { socket } from "../api/api";

const Lobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { currentUser, players, setPlayers, setLiveQuestion } = useQuizStore();

  // --- DEBUG STATES ---
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState(socket.id);
  const [connectionError, setConnectionError] = useState(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Connection Logic
    if (!socket.connected) {
      console.log("🔌 Initializing Socket Connection...");
      socket.connect();
    }

    if (!currentUser.name) {
      navigate("/");
      return;
    }

    // 2. DEBUG LISTENERS (Check Console)
    const onConnect = () => {
      console.log("✅ CONNECTED to Server via WebSocket");
      console.log("🆔 Socket ID:", socket.id);
      setIsConnected(true);
      setSocketId(socket.id);
      setConnectionError(null);
    };

    const onDisconnect = () => {
      console.log("❌ DISCONNECTED from Server");
      setIsConnected(false);
      setSocketId(null);
    };

    const onConnectError = (err) => {
      console.error("⚠️ CONNECTION ERROR:", err.message);
      setConnectionError(err.message);
      setIsConnected(false);
    };

    // 3. GAME LISTENERS
    const onPlayerList = (updatedPlayers) => {
      console.log("👥 Player List Updated:", updatedPlayers);
      setPlayers(updatedPlayers);
    };

    const onNewQuestion = (data) => {
      console.log("🚀 Game Started!", data);
      setLiveQuestion(data);
      navigate(`/lobby/${roomId}`);
    };

    const onJoinBlocked = (data) => {
      alert(`Blocked: ${data.message}`);
      navigate("/");
    };

    // 4. REGISTER ALL LISTENERS
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    socket.on("player-list", onPlayerList);
    socket.on("new-question", onNewQuestion);
    socket.on("join-blocked", onJoinBlocked);

    // 5. ATTEMPT JOIN (Emit only if connected, otherwise 'connect' listener will handle it)
    if (socket.connected) {
      socket.emit("join-room", { roomCode: roomId, name: currentUser.name });
    } else {
      // If we just connected, the 'connect' event listener needs to trigger the join
      socket.once("connect", () => {
        socket.emit("join-room", { roomCode: roomId, name: currentUser.name });
      });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("player-list");
      socket.off("new-question");
      socket.off("join-blocked");
    };
  }, [roomId, currentUser.name, navigate, setPlayers, setLiveQuestion]);

  const handleStartGame = () => {
    if (!isConnected) return alert("Not connected to server!");
    socket.emit("start-quiz", { roomCode: roomId });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen p-6 lg:p-12 ${theme.bg} ${theme.text}`}>
      {/* --- DEBUG STATUS BAR --- */}
      <div
        className={`fixed top-0 left-0 w-full p-2 text-xs font-mono font-bold flex justify-center items-center gap-4 z-50
        ${isConnected ? "bg-green-500 text-white" : "bg-red-500 text-white"}
      `}
      >
        <div className="flex items-center gap-2">
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          STATUS: {isConnected ? "CONNECTED" : "DISCONNECTED"}
        </div>
        {socketId && <div>ID: {socketId}</div>}
        {connectionError && <div>ERR: {connectionError}</div>}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-3xl border relative overflow-hidden text-center ${theme.container}`}
          >
            <h3
              className={`text-xs font-bold uppercase tracking-widest mb-4 ${theme.textMuted}`}
            >
              Room Code
            </h3>
            <div
              onClick={copyCode}
              className={`flex items-center justify-center gap-3 text-5xl font-black font-mono tracking-wider cursor-pointer hover:scale-105 transition-transform ${theme.text}`}
            >
              {roomId}
              {copied ? (
                <Check className="text-green-500" size={32} />
              ) : (
                <Copy className="opacity-20" size={32} />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-3xl border ${theme.cardBg}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Crown
                size={24}
                className={
                  currentUser.isHost ? "text-yellow-500" : "text-slate-500"
                }
              />
              <div>
                <h3 className="font-bold text-lg">
                  {currentUser.isHost ? "Host Controls" : "Waiting Area"}
                </h3>
              </div>
            </div>

            {currentUser.isHost ? (
              <button
                onClick={handleStartGame}
                disabled={!isConnected}
                className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all 
                  ${
                    isConnected
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02]"
                      : "bg-slate-500 cursor-not-allowed opacity-50"
                  }`}
              >
                <Play size={20} fill="currentColor" /> Start Game
              </button>
            ) : (
              <div
                className={`w-full py-4 rounded-xl border border-dashed flex items-center justify-center gap-2 ${theme.textMuted} ${theme.inputBg}`}
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
                Waiting for Host...
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Player List */}
        <div
          className={`lg:col-span-2 p-8 rounded-3xl border flex flex-col h-[600px] ${theme.container} shadow-2xl`}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Users className="text-indigo-500" size={32} />
              Live Players
            </h2>
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-bold border ${theme.successBg} ${theme.successRing}`}
            >
              {players.length} Online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {players.map((player) => (
                <motion.div
                  key={player.socketId || player.name}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${theme.cardBg}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md bg-gradient-to-br 
                      ${
                        player.name === currentUser.name
                          ? "from-indigo-500 to-purple-600"
                          : "from-slate-500 to-slate-600"
                      }`}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-bold text-lg ${theme.text}`}>
                        {player.name}{" "}
                        {player.name === currentUser.name && "(You)"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {players.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <Users size={40} className="mb-4" />
                <p>Waiting for players...</p>
                {!isConnected && (
                  <p className="text-red-500 font-bold mt-2">
                    Check Connection!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
