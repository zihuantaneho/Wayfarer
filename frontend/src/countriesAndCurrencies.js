import { getData } from "country-list";
import cc from "currency-codes";

export const currencies = ["EUR", "USD", "UAH", ...cc.codes()];
export const countries = getData();

