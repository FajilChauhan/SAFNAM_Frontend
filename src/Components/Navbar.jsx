import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Navbar = () => {
  const navRef = useRef();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const timeoutRef = useRef(null);
  const [role, setRole] = useState("");
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
const name = localStorage.getItem("username");
const userRole = localStorage.getItem("role");

if (token) {
  setIsLoggedIn(true);
  setUsername(name);
  setRole(userRole);
}
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 80) {
        navRef.current.classList.add("navdark");
      } else {
        navRef.current.classList.remove("navdark");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 300);
  };

  const handleAdminEnter = () => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  setShowAdminDropdown(true);
};

const handleAdminLeave = () => {
  timeoutRef.current = setTimeout(() => {
    setShowAdminDropdown(false);
  }, 300);
};
  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav
      ref={navRef}
      className="nav w-full px-6 md:px-10 py-4 flex justify-between items-center fixed top-0 left-0 z-50 transition-all duration-300 bg-transparent"
    >
      {/* Logo */}
      <div
        className="text-3xl md:text-4xl font-bold text-orange-400 cursor-pointer"
        onClick={() => navigate("/")}
      >
        SAFNAM
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-6 items-center text-white font-semibold text-lg">
        <li onClick={() => navigate("/")} className="cursor-pointer hover:text-orange-400">
          Home
        </li>

        <li onClick={() => navigate("/photos")} className="cursor-pointer hover:text-orange-400">
          Photos
        </li>

        {/* Booking Dropdown */}
        <li
          className="relative cursor-pointer hover:text-orange-400"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Booking ▾
          {showDropdown && (
            <ul className="absolute top-8 left-0 bg-white text-black rounded shadow-lg py-2 w-44">
              <li onClick={() => navigate("/booktable")} className="px-4 py-2 hover:bg-orange-100">
                Book Table
              </li>
              <li onClick={() => navigate("/bookroom")} className="px-4 py-2 hover:bg-orange-100">
                Book Room
              </li>
              <li onClick={() => navigate("/bookorder")} className="px-4 py-2 hover:bg-orange-100">
                Book Order
              </li>
            </ul>
          )}
        </li>
        
        {role === "Admin" && (
  <li
    className="relative cursor-pointer hover:text-orange-400"
    onMouseEnter={handleAdminEnter}
    onMouseLeave={handleAdminLeave}
  >
    Admin ▾

    {showAdminDropdown && (
      <ul className="absolute top-8 left-0 bg-white text-black rounded shadow-lg py-2 w-48">

        <li
          onClick={() => navigate("/admin/menu")}
          className="px-4 py-2 hover:bg-orange-100"
        >
          Menu
        </li>

        <li
          onClick={() => navigate("/admin/rooms")}
          className="px-4 py-2 hover:bg-orange-100"
        >
          Rooms
        </li>

        <li
          onClick={() => navigate("/admin/roombooking")}
          className="px-4 py-2 hover:bg-orange-100"
        >
          Room Booking
        </li>

        <li
          onClick={() => navigate("/admin/order")}
          className="px-4 py-2 hover:bg-orange-100"
        >
          Orders
        </li>

        <li
          onClick={() => navigate("/admin/table")}
          className="px-4 py-2 hover:bg-orange-100"
        >
          Tables
        </li>

        <li
          onClick={() => navigate("/admin/booktable")}
          className="px-4 py-2 hover:bg-orange-100"
        >
          Table Booking
        </li>

      </ul>
    )}
  </li>
)}
        {/* AUTH SECTION */}
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/login")}
              className="bg-orange-400 px-5 py-2 rounded font-bold hover:bg-orange-500"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="bg-white text-black px-5 py-2 rounded font-bold"
            >
              Register
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-orange-300">Hi, {username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded font-bold"
            >
              Logout
            </button>
          </div>
        )}
      </ul>

      <div className="md:hidden text-3xl text-white cursor-pointer">☰</div>
    </nav>
  );
};

export default Navbar;