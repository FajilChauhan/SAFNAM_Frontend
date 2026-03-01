import React, { useEffect, useState } from "react";
import api from "../services/api";

const Menu = () => {
  const [form, setForm] = useState({
    breakfast: true,
    Lunch: false,
    Dinner: false
  });

  const [menu, setMenu] = useState([]);

  // ✅ fetch menu
  useEffect(() => {
    api.get("/menu")
      .then(res => setMenu(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (prop) => {
    setForm({
      breakfast: false,
      Lunch: false,
      Dinner: false,
      [prop]: true
    });
  };

  // ✅ filter by type
  const breakfast = menu.filter(m => m.type === "Popular Breakfast");
  const lunch = menu.filter(m => m.type === "Special Lunch");
  const dinner = menu.filter(m => m.type === "Lovely Dinner");

  const renderMenu = (items) => (
    <div className="px-[20px] sm:px-[40px] w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px] mt-[30px]">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-xl p-[15px] hover:scale-[1.02] transition"
        >
          <div className="flex items-center">
            <img
              className="w-[90px] h-[90px] rounded-[10px] border-2 border-orange-400 object-cover mr-[15px]"
              src={`https://localhost:7257${item.imagePath}`}
              alt={item.itemName}
            />
            <div>
              <span className="text-black font-semibold text-[18px] sm:text-[20px] block">
                {item.itemName}
              </span>
              <p className="text-gray-500 text-[14px] sm:text-[16px] mt-[4px]">
                {item.type}
              </p>
            </div>
          </div>
          <span className="text-orange-500 text-[20px] sm:text-[22px] font-bold ml-[10px]">
            ₹{item.price}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="Menu flex flex-col items-center mt-[60px] w-full">
      <h1 className="text-orange-500 font-extrabold text-center text-[30px] sm:text-[36px] underline">
        Our Menu
      </h1>

      {/* Tabs */}
      <div className="mt-[30px] flex flex-wrap justify-center gap-[40px] sm:gap-[60px] w-full">
        <span
          onClick={() => handleChange("breakfast")}
          className={`cursor-pointer text-[20px] sm:text-[22px] font-medium ${
            form.breakfast
              ? "text-orange-500 underline scale-105"
              : "text-gray-800 hover:text-orange-400"
          }`}
        >
          Popular <span className="block text-[26px] font-bold">Breakfast</span>
        </span>

        <span
          onClick={() => handleChange("Lunch")}
          className={`cursor-pointer text-[20px] sm:text-[22px] font-medium ${
            form.Lunch
              ? "text-orange-500 underline scale-105"
              : "text-gray-800 hover:text-orange-400"
          }`}
        >
          Special <span className="block text-[26px] font-bold">Lunch</span>
        </span>

        <span
          onClick={() => handleChange("Dinner")}
          className={`cursor-pointer text-[20px] sm:text-[22px] font-medium ${
            form.Dinner
              ? "text-orange-500 underline scale-105"
              : "text-gray-800 hover:text-orange-400"
          }`}
        >
          Lovely <span className="block text-[26px] font-bold">Dinner</span>
        </span>
      </div>

      <div className="w-full max-w-screen-xl">
        {form.breakfast && renderMenu(breakfast)}
        {form.Lunch && renderMenu(lunch)}
        {form.Dinner && renderMenu(dinner)}
      </div>
    </div>
  );
};

export default Menu;