import axios from "axios";

export let token = localStorage.getItem("token"); //'';

export const signIn = async (username, password) => {
  try {
    const response = await fetch("http://localhost:8000/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log("Sign In Response:", data);

    if (response.ok) {
      token = data.token;
      localStorage.setItem("token", token);
      // Handle successful sign in here
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const signUp = async (username, password) => {
  const response = await fetch("http://localhost:8000/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    token = data.token;
    localStorage.setItem("token", token);
  } else {
    throw new Error(data.error);
  }
};

export const getToken = () => {
  return token || localStorage.getItem("token") || "";
};

export const logOut = () => {
  token = "";
  localStorage.removeItem("token");
};

export const compare = async (country1, country2, currency) => {
  const url = `http://localhost:8000/compare/${currency}/${country1}/${country2}`;

  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      //'Authorization': `Bearer ${token}`
    },
  });
};

export const getCallsRemaining = () => {
  const url = "http://localhost:8000/calls-remaining";
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, { headers })
    .then((response) => response.json())
    .then((data) => {
      const callsRemaining = data.calls_remaining;
      return callsRemaining;
    })
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
};

export const getCheckoutUrl = (qty) => {
  const url = `http://localhost:8000/checkout/${qty}`;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, { headers, method: "POST" })
    .then((r) => r.json())
    .then(({ url }) => window.open(url));
};

export const deleteUser = () => {
  const url = `http://localhost:8000/delete_user`;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, { headers, method: "POST" })
    .then((r) => r.json())
    .then(() => {
      logOut();
    });
};
