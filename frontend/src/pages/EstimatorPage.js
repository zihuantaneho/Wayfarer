import React, { useState, useEffect } from "react";
import { countries, currencies } from "../countriesAndCurrencies";
import { useNavigate } from "react-router-dom";
import { getNewIncome } from "../api";

export const Estimator = () => {
  const [currentIncome, setCurrentIncome] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [currentCountry, setCurrentCountry] = useState("");
  const [targetCountry, setTargetCountry] = useState("");

  const [newIncome, setNewIncome] = useState(undefined);

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setNewIncome(undefined);
    setLoading(false);
  }, [currency, currentCountry, targetCountry, currentIncome]);

  const handleIncomeChange = (e) => {
    try {
      const income = parseInt(e.target.value);

      setCurrentIncome(income);
    } catch (error) {
      setCurrentIncome(currentIncome);
    }
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handleCurrentCountryChange = (e) => {
    setCurrentCountry(e.target.value);
  };

  const handleTargetCountryChange = (e) => {
    setTargetCountry(e.target.value);
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    if (currentIncome && currency && currentCountry && targetCountry) {
      setLoading(true);
      const v = await getNewIncome(
        currentIncome,
        currency,
        targetCountry,
        currentCountry
      );
      setLoading(false);

      setNewIncome(v);
    }
  };

  const navigate = useNavigate();

  const onBack = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-200 dark:bg-gray-800 space-y-4 p-8 rounded shadow-lg max-w-md">
        <div className="flex justify-between items-center">
          <h1 className="text-black dark:text-white text-3xl font-semibold">
            Income Estimator
          </h1>
          <div className="self-baseline">
            <button
              onClick={onBack}
              className="self-baseline bg-gray-3  00 dark:bg-gray-600 hover:bg-yellow-600 dark:md:hover:bg-gray-400 text-black dark:text-white font-semibold py-2 px-4 rounded w-full"
            >
              Go Back
            </button>
          </div>
        </div>

        <p className="mb-4 text-black dark:text-white">
          Please provide the following information:
        </p>

        <label className="block mb-4 text-black dark:text-white">
          Current Income:
          <input
            type="number"
            value={currentIncome}
            onChange={handleIncomeChange}
            className="block w-full rounded border-gray-700 bg-gray-100 dark:bg-gray-900 border p-2 mt-1"
          />
        </label>

        <label className="block mb-4 text-black dark:text-white">
          Currency:
          <select
            value={currency}
            onChange={handleCurrencyChange}
            className="block w-full rounded border-gray-700 bg-gray-100 dark:bg-gray-900 border p-2 mt-1"
          >
            {currencies.map((currency) => {
              return (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block mb-4 text-black dark:text-white">
          Current Country:
          <select
            value={currentCountry}
            onChange={handleCurrentCountryChange}
            className="block w-full rounded border-gray-700 bg-gray-100 dark:bg-gray-900 border p-2 mt-1"
          >
            <option value="">Select a country</option>
            {countries.map((country) => {
              if (country.name !== targetCountry) {
                return (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                );
              }
              return null;
            })}
          </select>
        </label>

        <label className="block mb-4 text-black dark:text-white">
          Target Country:
          <select
            value={targetCountry}
            onChange={handleTargetCountryChange}
            className="block w-full rounded border-gray-700 bg-gray-100 dark:bg-gray-900 border p-2 mt-1"
          >
            <option value="">Select a country</option>
            {countries.map((country) => {
              if (country.name !== currentCountry) {
                return (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                );
              }
              return null;
            })}
          </select>
        </label>

        <button
          onClick={handleSubmit}
          className="bg-yellow-400 hover:bg-yellow-600 text-white py-2 px-4 rounded"
        >
          {isLoading ? "Loading..." : "Calculate"}
        </button>

        {newIncome && (
          <div className="text-black dark:text-white">
            Your previous income of {currentIncome} {currency} in{" "}
            {currentCountry} should be adjusted to {newIncome} {currency} in{" "}
            {targetCountry}. To see detail price breakdown,{" "}
            <a
              className="underline"
              href={`/compare?country1=${currentCountry}&country2=${targetCountry}&currency=${currency}`}
            >
              visit the compare page for {currentCountry} and {targetCountry}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
