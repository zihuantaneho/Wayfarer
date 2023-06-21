import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../api";

export const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signUp(username, password);
      navigate("/home");
      // Handle successful sign up here
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen dark:bg-gray-800">
      <h2 className="text-2xl mb-4 dark:text-white">Sign Up</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-2 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
      />
      <input
        type="password"
        placeholder="Repeat Password"
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
        className="mb-2 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
      />
      <button
        onClick={handleSignUp}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded dark:bg-yellow-600 dark:hover:bg-yellow-700"
      >
        Sign Up
      </button>
      {error && <p className="text-red-500 mt-2 dark:tex-red-500">{error}</p>}
      <div className="mt-4">
        <span className="dark:text-white" >Already have an account? </span>
        <Link to="/sign-in" className="text-yellow-500 underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignUpPage;
