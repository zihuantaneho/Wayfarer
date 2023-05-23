export let token = localStorage.getItem("token");//'';

export const signIn = async (username, password) => {
  try {
    const response = await fetch('http://localhost:8000/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log('Sign In Response:', data);
    
    if (response.ok) {
      token = data.token;
      localStorage.setItem('token', token);
      // Handle successful sign in here
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
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
}
