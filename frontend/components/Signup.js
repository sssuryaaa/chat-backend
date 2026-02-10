import React, { useState } from "react";
import { useNavigate } from "react-router";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPasword] = useState("");
  const navigate = useNavigate();

  const hanldeClick = async (e) => {
    if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
      alert("all fields required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: name, email, password }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText + `: ${res.status}`);
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/chat");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-dvh flex-col w-75 m-auto gap-3 p-3">
      <div className="w-full">
        <label htmlFor="username">Username</label>
        <input
          className="border border-gray-400 rounded-sm w-full p-2 focus:outline-orange-200"
          type="text"
          id="username"
          name="username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="w-full">
        <label htmlFor="email">Email</label>
        <input
          className="border border-gray-400 rounded-sm w-full p-2 focus:outline-orange-200"
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="w-full">
        <label htmlFor="password">Password</label>
        <input
          className="border border-gray-400 rounded-sm w-full p-2 focus:outline-orange-200"
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPasword(e.target.value)}
        />
      </div>
      <button
        onClick={hanldeClick}
        className="p-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors w-full font-bold"
      >
        Sign Up
      </button>
    </div>
  );
};

export default Signup;
