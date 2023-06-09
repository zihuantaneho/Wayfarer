import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  logOut,
  deleteUser,
  getCheckoutUrl,
  getCallsRemaining,
  getApiPayments,
} from "../api";

const htmlElement = document.documentElement;

export const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [callsRemaining, setCallsRemaining] = useState(0);
  const [apiCallsToPurchase, setApiCallsToPurchase] = useState(0);

  const [paymentHistory, setPaymentHistory] = useState([]);

  const fetchPaymentHistory = () => {
    getApiPayments().then((history) => {
      setPaymentHistory(history.api_payments);
    });
  };

  const fetchCallsRemaining = () => {
    getCallsRemaining()
      .then((calls) => {
        setCallsRemaining(calls);
      })
      .catch((error) => {
        console.error("Error fetching calls remaining:", error);
      });
  };

  useEffect(() => {
    fetchPaymentHistory();
    fetchCallsRemaining();
  }, []);

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

  const onDeleteAccount = async () => {
    await deleteUser();
    onLogOut();
  };

  const onLogOut = () => {
    logOut();
    navigate("/home");
  };

  const handleApiCallsChange = (event) => {
    setApiCallsToPurchase(Number(event.target.value));
  };

  const redirectToCheckout = async () => {
    if (apiCallsToPurchase > 0) {
      await getCheckoutUrl(apiCallsToPurchase);
    }
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col space-y-4 items-center justify-center dark:bg-gray-800">
      <div className="w-[32rem] bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex-1 mb-4 dark:text-white">
            Settings
          </h1>
          <div className="self-baseline">
            <button
              onClick={onBack}
              className="self-baseline bg-gray-200 dark:bg-gray-700 hover:bg-yellow-600 dark:md:hover:bg-gray-400 text-black dark:text-white font-semibold py-2 px-4 rounded w-full"
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
        <div className="flex items-center mb-4">
          <span className="mr-2 dark:text-white">API Calls Remaining:</span>
          <span className="dark:text-white">{callsRemaining}</span>
        </div>
        <div className="flex items-center mb-4">
          <span className="mr-2 dark:text-white">API Calls to Purchase:</span>
          <input
            className="w-12 bg-gray-200 dark:bg-white text-black dark:text-black"
            type="number"
            value={apiCallsToPurchase}
            onChange={handleApiCallsChange}
            min="0"
          />
        </div>
        <div className="mb-12">
          <button
            onClick={redirectToCheckout}
            className="bg-transparent hover:bg-yellow-500 text-yellow-500 hover:text-white border border-yellow-500 hover:border-transparent font-semibold py-2 px-4 rounded w-full dark:text-yellow-500 dark:hover:bg-yellow-800 dark:border-yellow-500 dark:hover:text-white"
            disabled={apiCallsToPurchase <= 0}
          >
            Purchase and Checkout
          </button>
        </div>
        <div className="space-y-4">
          <button
            onClick={onLogOut}
            className="bg-transparent hover:bg-red-500 text-red-500 hover:text-white border border-red-500 hover:border-transparent font-semibold py-2 px-4 rounded w-full dark:text-red-500 dark:hover:bg-red-800 dark:border-red-500 dark:hover:text-white"
          >
            Log Out
          </button>

          <button
            onClick={onDeleteAccount}
            className="bg-transparent hover:bg-red-500 text-red-500 hover:text-white border border-red-500 hover:border-transparent font-semibold py-2 px-4 rounded w-full dark:text-red-500 dark:hover:bg-red-800 dark:border-red-500 dark:hover:text-white"
          >
            Delete account
          </button>
        </div>
      </div>

      <div className="w-[32rem] h-[30%] overflow-scroll bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex-1 mb-4 dark:text-white">
            Payment History
          </h1>
        </div>

        <table className="min-w-full divide-y divide-gray-200 border border-gray-400 dark:border-gray-600">
          <thead className="bg-gray-200 dark:bg-gray-700 border border-gray-400 dark:border-gray-600">
            <tr>
              <th className="w-[4rem] border border-gray-400 dark:border-gray-600 py-3 text-sm font-medium dark:text-white">
                Qty
              </th>
              <th className="border border-gray-400 dark:border-gray-600 py-3 text-sm font-medium dark:text-white">
                Amount Paid
              </th>
              <th className="border border-gray-400 dark:border-gray-600 py-3 text-sm font-medium dark:text-white">
                Date
              </th>
            </tr>
          </thead>
          {paymentHistory.length && (
            <tbody className="divide-y divide-gray-200">
              {paymentHistory.map((payment, index) => (
                <tr key={index}>
                  <td className="px-4 items-center border border-gray-400 dark:border-gray-600 py-4 text-sm dark:text-white">
                    {payment.qty}
                  </td>
                  <td className="px-4 border border-gray-400 dark:border-gray-600 py-4 text-sm dark:text-white">
                    {payment.amount_paid / 100}
                  </td>
                  <td className="px-4 border border-gray-400 dark:border-gray-600 py-4 text-sm dark:text-white">
                    {payment.date}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};
