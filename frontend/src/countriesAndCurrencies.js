import { getData } from "country-list";
import cc from "currency-codes";

export const currencies = ["EUR", "USD", "UAH", ...cc.codes()];
export const countries = getData().filter((country) => !["Åland Islands", "Saint Barthélemy","Antarctica"].includes(country.name));

countries.find((country) => country.name === "Bolivia, Plurinational State of").name = "Bolivia";
countries.find((country) => country.name === "Bonaire, Sint Eustatius and Saba").name = "Bonaire";
countries.find((country) => country.name === "Brunei Darussalam").name = "Brunei";
countries.find((country) => country.name === "United Kingdom of Great Britain and Northern Ireland").name = "United Kingdom";
countries.find((country) => country.name === "Czechia").name = "Czech Republic";
