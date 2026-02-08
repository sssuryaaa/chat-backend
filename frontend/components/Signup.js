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
    <div>
      <div>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPasword(e.target.value)}
        />
      </div>
      <button onClick={hanldeClick}>Sign Up</button>
    </div>
  );
};

export default Signup;
