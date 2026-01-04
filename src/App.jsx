import { useEffect, useState } from "react";
import useAuthStore from "./stores/useAuthStore";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./providers/ThemeProvider";
import LandingPage from "./pages/Landingpage";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import Lobby from "./pages/Lobby";
import MainLayout from "./components/Layout/MainLayout";

import QuizScreen from "./pages/QuizScreen";
import Results from "./pages/Results";
import { socket } from "./api/api";

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster />
        <MainLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/lobby/:roomId" element={<Lobby />} />
            <Route path="/quiz/:roomCode" element={<QuizScreen />} />
            <Route path="/results/:roomCode" element={<Results />} />
            {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
