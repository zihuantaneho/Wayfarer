import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logOut } from "../api";

const htmlElement = document.documentElement;

export const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" 
  );

  const toggleDarkMode = () => {
    setDarkMode(!htmlElement.classList.contains("dark"));
    localStorage.setItem("darkMode", !htmlElement.classList.contains("dark"));
    if (htmlElement.classList.contains("dark")) {
      htmlElement.classList.remove("dark");
    } else {
      htmlElement.classList.add("dark");
    }
  };

  const navigate = useNavigate();

  const onBack = () => {
    navigate("/home");
  };

  const onLogOut = () => {
    logOut();
    navigate("/home");
    // Implement logout functionality here
  };

  return (
    <div className="bg-gray-100 h-screen flex items-center justify-center dark:bg-gray-800">
      <div className="w-[32rem] bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex-1 mb-4 dark:text-white">
            Settings
          </h1>
          <div className="self-baseline">
            <button
              onClick={onBack}
              className="self-baseline bg-gray-200 dark:bg-gray-700 hover:bg-blue-600 dark:md:hover:bg-gray-400 text-black dark:text-white font-semibold py-2 px-4 rounded w-full"
            >
              Go Back
            </button>
          </div>
        </div>
        <div className="flex items-center mb-4">
          <span className="mr-2 dark:text-white">Dark Mode:</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div>
          <button
            onClick={onLogOut}
            className="bg-transparent hover:bg-red-500 text-red-500 hover:text-white border border-red-500 hover:border-transparent font-semibold py-2 px-4 rounded w-full dark:text-red-500 dark:hover:bg-red-800 dark:border-red-500 dark:hover:text-white"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
