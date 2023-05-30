import React, { useState } from "react";
import {compare} from "../api";
import { getData } from "country-list";
import { useNavigate } from "react-router-dom";
import { BarChart } from "../components";

const countries = getData();

export const ComparePage = () => {
  const [country1, setCountry1] = useState("");
  const [country2, setCountry2] = useState("");
  const [comparisonData, setComparisonData] = useState(null);
  const [currency, setCurrency] = useState("EUR");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const onGoHome = () => {
    navigate("/home");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("")
    setComparisonData(null)

    try {
      const response = await compare(country1, country2, currency);

      if (response.data.error) {
        setComparisonData(null);
        setError(response.data.error);
      } else {
        setComparisonData(response.data);
        setError("");
      }

    } catch (error) {
      setComparisonData(null);
      setError(error.response.data.error);
      // Обработка ошибки, если запрос не удался
    }
  };

  const renderComparisonTable = () => {
    if (error) {
      return (
        <p className="text-red-500 mt-2 dark:text-red-500">
          {error}
        </p>
      );
    }


    if (!comparisonData) return null;

    if (!comparisonData) {
      return null;
    }

    return (
      <table className="table-auto border border-gray-400 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm font-medium dark:text-white">
              #
            </th>
            <th className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm font-medium dark:text-white">
              Parameter
            </th>
            <th className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm font-medium dark:text-white">
              {comparisonData.country1.country}
            </th>
            <th className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm font-medium dark:text-white">
              {comparisonData.country2.country}
            </th>
            <th className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm font-medium dark:text-white">
              Absolute Difference
            </th>
            <th className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm font-medium dark:text-white">
              Relative Difference
            </th>
          </tr>
        </thead>
        <tbody>
          {comparisonData.country1.costs.map((cost, index) => (
            <tr
              key={index}
              className={
                index % 2 === 0
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "dark:bg-gray-900"
              }
            >
              <td className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm dark:text-white">
                {index + 1}
              </td>
              <td className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm dark:text-white">
                {cost.item}
              </td>
              <td className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm dark:text-white">
                {cost.cost} {currency}
              </td>
              <td className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm dark:text-white">
                {comparisonData.country2.costs[index].cost} {currency}
              </td>
              <td className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm dark:text-white">
                {comparisonData.absolute_difference.costs[index].cost} {currency}
              </td>
              <td className="border border-gray-400 dark:border-gray-600 px-4 py-2 text-sm dark:text-white">
                {(
                  comparisonData.relative_difference.costs[index].cost * 100
                ).toFixed(0)}
                %
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="min-h-screen p-4 dark:bg-gray-800">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">
        Compare Countries
      </h1>
      <p className="mb-4 dark:text-white">
        Using this tool you compare the population of the two countries
        supported by our dataset.
      </p>
      <form
        id="country-form"
        className="flex flex-col gap-2 mb-4"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="country1" className="sm:w-1/3 dark:text-white">
            Country 1:
          </label>
          <select
            id="country1"
            value={country1}
            onChange={(e) => setCountry1(e.target.value)}
            className="dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select Country 1</option>
            {countries.map((country) => {
              if (country.name !== country2) {
                return (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                );
              }
              return null;
            })}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="country2" className="sm:w-1/3 dark:text-white">
            Country 2:
          </label>
          <select
            id="country2"
            value={country2}
            onChange={(e) => setCountry2(e.target.value)}
            className="dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select Country 2</option>
            {countries.map((country) => {
              if (country.name !== country1) {
                return (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                );
              }
              return null;
            })}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="currency" className="sm:w-1/3 dark:text-white">
          Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="dark:bg-gray-700 dark:text-white"
          >
            {["EUR", "USD", "UAH"].map((currency) => {
                return (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                );
            })}
          </select>
        </div>

        <div className="flex flex-row space-x-5">
          <button
            type="submit"
            className="bg-gray-300 hover:bg-blue-700 dark:bg-gray-700 dark:md:hover:bg-gray-400 self-baseline text-black dark:text-white font-bold py-2 px-4 rounded"
            onClick={onGoHome}
          >
            Go Home
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 self-baseline text-white font-bold py-2 px-4 rounded"
          >
            Compare
          </button>
        </div>
      </form>
      <div className="flex-row flex space-x-4">
      {comparisonData && (
      <div className="space-y-4">
      <BarChart
        shouldMapValues={false}
        value1={comparisonData.country1.costs[53].cost}
        value2={comparisonData.country2.costs[53].cost}
        label1={country1}
        label2={country2}
        title="Avg. Salary"
      />
      <BarChart
        shouldMapValues={true}
        value1={comparisonData.country1.costs[2].cost}
        value2={comparisonData.country2.costs[2].cost}
        label1={country1}
        label2={country2}
        title="McMeal Index"
      />
      <BarChart
        shouldMapValues={false}
        value1={comparisonData.country1.costs[35].cost}
        value2={comparisonData.country2.costs[35].cost}
        label1={country1}
        label2={country2}
        title="Utilities"
      />
      <BarChart
        shouldMapValues={false}
        value1={comparisonData.country1.costs[40].cost}
        value2={comparisonData.country2.costs[40].cost}
        label1={country1}
        label2={country2}
        title="Cinema"
      />

      <BarChart
        shouldMapValues={false}
        value1={comparisonData.country1.costs[47].cost}
        value2={comparisonData.country2.costs[47].cost}
        label1={country1}
        label2={country2}
        title="1 Bedroom Apt."
      />

      <BarChart
        shouldMapValues={false}
        value1={comparisonData.country1.costs[49].cost}
        value2={comparisonData.country2.costs[49].cost}
        label1={country1}
        label2={country2}
        title="3 Bedroom Apt."
      />

      <BarChart
        shouldMapValues={false}
        value1={comparisonData.country1.costs[37].cost}
        value2={comparisonData.country2.costs[37].cost}
        label1={country1}
        label2={country2}
        title="Internet"
      />
      </div>
      )}
      <div id="country-table">{renderComparisonTable()}</div>
    </div>
    </div>
  );
};
