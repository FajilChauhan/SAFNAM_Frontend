import React, { useState } from "react";
import api from "../services/api";
import Navbar from "../Components/Navbar";
import toast from "react-hot-toast";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    phone: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const t = toast.loading("Creating account...");

      await api.post("/auth/register", form);

      toast.dismiss(t);
      toast.success("🎉 Registered successfully!");

      window.location.href = "/login";

    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-900 to-indigo-800 px-4">

        <form
          onSubmit={handleRegister}
          className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md text-white"
        >
          <h2 className="text-3xl font-bold text-center text-orange-400 mb-6">
            Create Account 🚀
          </h2>

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-200"
            required
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-200"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-3 rounded bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-200"
            required
          />

          <button
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <p className="text-center mt-4 text-sm">
            Already have an account?{" "}
            <span
              onClick={() => (window.location.href = "/login")}
              className="text-orange-400 cursor-pointer"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </>
  );
};

export default Register;