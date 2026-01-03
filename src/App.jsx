import { useEffect, useState } from "react";
import useAuthStore from "./stores/useAuthStore";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ProtectedRoute } from "./Routes/Route";
import { PublicRoute } from "./Routes/Route";
import { ThemeProvider } from "./providers/ThemeProvider";
import Landingpage from "./pages/Landingpage";

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Landingpage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
