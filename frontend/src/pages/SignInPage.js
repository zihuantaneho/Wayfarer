import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../api';

export const SignInPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSignIn = async () => {
    try {
      await signIn(username, password);

      navigate('/home');
      // Handle successful sign in here
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen dark:bg-gray-800">
      <h2 className="text-2xl mb-4 dark:text-white">Sign In</h2>
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
      <button
        onClick={onSignIn}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Sign In
      </button>
      {error && <p className="text-red-500 mt-2 dark:text-red-500">{error}</p>}
    </div>
  );
};
