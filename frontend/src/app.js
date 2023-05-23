import React, {useEffect} from "react";
import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom";
import { ComparePage, SignInPage, HomePage, SignUpPage, SettingsPage } from "./pages";

const App = () => {
  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "true") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<Navigate to="/home" />} />
        <Route path="/home" exact element={<HomePage />} />
        <Route path="/compare" exact element={<ComparePage />} />
        <Route path="/sign-up" exact element={<SignUpPage />} />
        <Route path="/sign-in" exact element={<SignInPage />} />
        <Route path="/settings" exact element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
