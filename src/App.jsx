import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./providers/ThemeProvider";
import Landingpage from "./pages/Landingpage";
import QuizScreen from "./pages/QuizScreen"; // 👈 ADD THIS

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Landingpage />} />

          {/* 👇 FRONTEND DEV 2 ROUTE */}
          <Route path="/quiz/:roomCode" element={<QuizScreen />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
