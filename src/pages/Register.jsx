import React, { useState } from "react";
import api from "../services/api";
import Navbar from "../Components/Navbar";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    phone: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      alert("Registered successfully! Now login.");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-3"
            required
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
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
            Register
          </button>
        </form>
      </div>
    </>
  );
};

export default Register;