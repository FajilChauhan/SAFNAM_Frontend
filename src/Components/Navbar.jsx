import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navRef = useRef();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const timeoutRef = useRef(null);

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

  // scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 50) {
        navRef.current.classList.add("bg-[#1a0033]", "shadow-lg");
      } else {
        navRef.current.classList.remove("bg-[#1a0033]", "shadow-lg");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const show = (setter) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setter(true);
  };

  const hide = (setter) => {
    timeoutRef.current = setTimeout(() => setter(false), 200);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 px-8 py-4 flex justify-between items-center backdrop-blur-md bg-[#12002b]/80 transition-all duration-300"
    >
      {/* LOGO */}
      <div
        onClick={() => navigate("/")}
        className="text-4xl font-extrabold text-orange-400 cursor-pointer tracking-wide"
      >
        SAFNAM
      </div>

      {/* MENU */}
      <ul className="hidden md:flex items-center gap-8 text-white font-semibold text-lg">

        <li onClick={() => navigate("/")} className="hover:text-orange-400 cursor-pointer">
          Home
        </li>

        <li onClick={() => navigate("/photos")} className="hover:text-orange-400 cursor-pointer">
          Photos
        </li>

        {/* BOOKING */}
        <li
          className="relative cursor-pointer hover:text-orange-400"
          onMouseEnter={() => show(setShowDropdown)}
          onMouseLeave={() => hide(setShowDropdown)}
        >
          Booking ▾

          {showDropdown && (
            <div className="absolute top-10 left-0 bg-white text-black rounded-xl shadow-xl w-48 overflow-hidden animate-fadeIn">
              {[
                { name: "Book Table", path: "/booktable" },
                { name: "Book Room", path: "/bookroom" },
                { name: "Book Order", path: "/bookorder" }
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="px-5 py-3 hover:bg-orange-100 cursor-pointer transition"
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </li>

        {/* ADMIN */}
        {role === "Admin" && (
          <li
            className="relative cursor-pointer hover:text-orange-400"
            onMouseEnter={() => show(setShowAdminDropdown)}
            onMouseLeave={() => hide(setShowAdminDropdown)}
          >
            Admin ▾

            {showAdminDropdown && (
              <div className="absolute top-10 left-0 bg-white text-black rounded-xl shadow-xl w-52 overflow-hidden animate-fadeIn">
                {[
                  ["Menu", "/admin/menu"],
                  ["Rooms", "/admin/rooms"],
                  ["Room Booking", "/admin/roombooking"],
                  ["Orders", "/admin/order"],
                  ["Tables", "/admin/table"],
                  ["Table Booking", "/admin/booktable"]
                ].map(([name, path], i) => (
                  <div
                    key={i}
                    onClick={() => navigate(path)}
                    className="px-5 py-3 hover:bg-orange-100 cursor-pointer transition"
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </li>
        )}

        {/* AUTH */}
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/login")}
              className="bg-orange-500 px-5 py-2 rounded-full font-bold hover:bg-orange-600 transition"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="bg-white text-black px-5 py-2 rounded-full font-bold hover:bg-gray-200 transition"
            >
              Register
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-full">
            <span className="text-orange-300 font-semibold">
              Hi, {username}
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-1 rounded-full text-white hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
      </ul>

      {/* MOBILE ICON */}
      <div className="md:hidden text-3xl text-white cursor-pointer">☰</div>
    </nav>
  );
};

export default Navbar;