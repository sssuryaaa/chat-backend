import React, { useState } from "react";
import { useNavigate } from "react-router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleClick = async (e) => {
    if (email.trim() === "" || password.trim() === "") {
      alert("all fields required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(res.status);
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
        <label htmlFor="email">Email</label>
        <input
          className="border border-gray-400 rounded-sm w-full p-2 focus:outline-orange-200"
          type="email"
          id="email"
          name="email"
          placeholder="Email"
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
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        className="p-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors w-full font-bold"
        onClick={handleClick}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
