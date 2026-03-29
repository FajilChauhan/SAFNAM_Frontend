import React, { useState } from "react";
import api from "../services/api";
import Navbar from "../Components/Navbar";
import toast from "react-hot-toast";

const Login = () => {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const t = toast.loading("Logging in...");

      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("userId", res.data.userId);

      toast.dismiss(t);
      toast.success("🔥 Welcome back!");

      window.location.href = "/";

    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-900 to-indigo-800 px-4">

        <form
          onSubmit={handleLogin}
          className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md text-white"
        >
          <h2 className="text-3xl font-bold text-center text-orange-400 mb-6">
            Welcome Back 👋
          </h2>

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded bg-white/20 border border-white/30 focus:ring-2 focus:ring-orange-400 outline-none placeholder-gray-200"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-3 rounded bg-white/20 border border-white/30 focus:ring-2 focus:ring-orange-400 outline-none placeholder-gray-200"
            required
          />

          <button
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center mt-4 text-sm">
            Don’t have an account?{" "}
            <span
              onClick={() => (window.location.href = "/register")}
              className="text-orange-400 cursor-pointer"
            >
              Register
            </span>
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;