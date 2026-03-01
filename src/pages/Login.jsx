import React, { useState } from "react";
import api from "../services/api";
import Navbar from "../Components/Navbar";

const Login = () => {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);

      // Save JWT
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("userId", res.data.userId);

      alert("Login successful");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-3"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-4"
            required
          />

          <button className="w-full bg-orange-500 text-white py-2 rounded">
            Login
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;