import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { token } from "../api";
import axios from "axios";

export const HomePage = () => {
  const navigate = useNavigate();
  const [topCountries, setTopCountries] = useState([]);

  useEffect(() => {
    fetchTopCountries();
  }, []);

  const fetchTopCountries = async () => {
    try {
      const response = await axios.get("http://backend:8000/top-5-countries");
      setTopCountries(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const onSettings = () => {
    navigate("/settings");
  };

  const onSignUp = () => {
    navigate("/sign-up");
  };

  const onSignIn = () => {
    navigate("/sign-in");
  };

  const onCompare = () => {
    navigate("/compare");
  };

  const renderTopCountriesTable = () => {
    if (topCountries.length === 0) {
      return <p>Nobody has queried anything yet</p>;
    }

    return (
      <table className="table-auto border-collapse border border-gray-400 mt-4 dark:border-gray-700 dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border border-gray-400 px-4 py-2 text-black dark:text-white">#</th>
            <th className="border border-gray-400 px-4 py-2 text-black dark:text-white">Country 1</th>
            <th className="border border-gray-400 px-4 py-2 text-black dark:text-white">Country 2</th>
            <th className="border border-gray-400 px-4 py-2 text-black dark:text-white">Total Queries</th>
          </tr>
        </thead>
        <tbody>
          {topCountries.map((country, index) => (
            <tr
              key={index}
              className={
                index % 2 === 0
                  ? "bg-gray-100 dark:bg-gray-900"
                  : "dark:bg-gray-800"
              }
            >
              <td className="border border-gray-400 px-4 py-2 text-black dark:text-white">
                {index + 1}
              </td>
              <td className="border border-gray-400 px-4 py-2 text-black dark:text-white">
                {country.country1}
              </td>
              <td className="border border-gray-400 px-4 py-2 text-black dark:text-white">
                {country.country2}
              </td>
              <td className="border border-gray-400 px-4 py-2 text-black dark:text-white">
                {country.num_queries}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 h-screen flex items-center justify-center">
      <div className="max-w-lg bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <h1 className="text-4xl text-center mb-6 dark:text-white">
          Welcome to Wayfarer!
        </h1>
        {token ? (
          <div className="space-y-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded w-full"
              onClick={onCompare}
            >
              Compare
            </button>
            <button
              className="bg-gray-200 dark:bg-gray-700 hover:bg-blue-600 dark:md:hover:bg-gray-400 text-black dark:text-white font-semibold py-2 px-4 rounded w-full"
              onClick={onSettings}
            >
              Settings
            </button>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              onClick={onSignUp}
            >
              Sign Up
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
              onClick={onSignIn}
            >
              Log In
            </button>
          </div>
        )}
        <div className="space-y-2 mt-8">
          <p className="text-sm font-bold dark:text-white">
            Most requested country pairs:
          </p>
          {renderTopCountriesTable()}
        </div>
      </div>
    </div>
  );
};
