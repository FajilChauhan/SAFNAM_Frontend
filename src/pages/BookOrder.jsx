import React, { useEffect, useState } from "react";
import api from "../services/api";
import { getUserIdFromToken } from "../utils/Auth";
import Navbar from "../Components/Navbar";
import Connect_Us from "./Connect_Us";
import PlayGameButton from "../Components/PlayGameButton";
import UseDiscountCheckbox from "../Components/UseDiscountCheckbox";
import toast from "react-hot-toast";

const BookOrder = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    quantities: {},
  });

  // ✅ load menu
  useEffect(() => {
    api.get("/menu")
      .then(res => setMenuItems(res.data))
      .catch(() => toast.error("Failed to load menu"));
  }, []);

  // select item
  const handleSelectItem = (id, available) => {
    if (!available) return;

    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // quantity change
  const handleQtyChange = (id, value) => {
    setFormData({
      ...formData,
      quantities: { ...formData.quantities, [id]: Number(value) }
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, address: e.target.value });
  };

  // ✅ SUBMIT ORDER
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    const userId = getUserIdFromToken();

    if (!userId) {
      toast.error("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    if (!formData.address) {
      toast.error("Please enter address");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Placing your order...");

      const items = selectedItems.map(id => ({
        id: 0,
        orderId: 0,
        menuId: id,
        quantity: formData.quantities[id] || 1
      }));

      let totalAmount = items.reduce((sum, item) => {
        const menuItem = menuItems.find(m => m.id === item.menuId);
        return sum + (menuItem.price * item.quantity);
      }, 0);

      // discount
      if (discount > 0) {
        totalAmount -= (totalAmount * discount) / 100;
      }

      const orderPayload = {
        order: {
          id: 0,
          userId: userId,
          address: formData.address,
          totalAmount: totalAmount,
          paymentStatus: "Pending",
          status: "Pending"
        },
        items: items
      };

      await api.post("/order", orderPayload);

      toast.dismiss(loadingToast);
      toast.success("🎉 Order placed successfully!");

      // reset
      setShowForm(false);
      setSelectedItems([]);
      setFormData({ address: "", quantities: {} });
      setDiscount(0);

    } catch (error) {
      console.error(error);
      toast.dismiss();

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      toast.error(error.response?.data || "Order failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="relative bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-900 text-center py-20 px-6 text-white">
        <h1 className="text-[45px] sm:text-[60px] font-extrabold text-orange-400 mb-4">
          Book Your Favorite Meals 🍱
        </h1>

        <p className="text-lg mb-6">
          Choose your favorite dishes and enjoy delicious food at your doorstep.
        </p>

        <PlayGameButton onDiscountEarned={(value) => setDiscount(value)} />
      </div>

      {/* MENU */}
      <div className="min-h-screen bg-gray-50 py-12 px-6 text-black">
        <h2 className="text-center text-3xl font-bold text-orange-500 mb-10">
          Choose Your Dishes 🍽️
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {menuItems.map(item => {
            const isSelected = selectedItems.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item.id, item.isAvailable)}
                className={`rounded-2xl overflow-hidden shadow-lg transition hover:scale-105 ${
                  isSelected
                    ? "border-4 border-orange-500 bg-orange-100"
                    : "bg-white"
                } ${!item.isAvailable && "opacity-60 cursor-not-allowed"}`}
              >
                <img
                  src={`https://localhost:7257${item.imagePath}`}
                  alt={item.itemName}
                  className="w-full h-52 object-cover"
                />

                <div className="p-5">
                  <h3 className="text-xl font-bold text-black">{item.itemName}</h3>

                  <div className="flex justify-between mt-3">
                    <span className="text-orange-500 font-semibold">
                      ₹{item.price}
                    </span>
                    <span className={item.isAvailable ? "text-green-600" : "text-red-600"}>
                      {item.isAvailable ? "Available" : "Not Available"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ORDER BUTTON */}
        <div className="text-center mt-10">
          <button
            onClick={() => setShowForm(true)}
            disabled={selectedItems.length === 0}
            className="px-10 py-4 bg-orange-500 text-white rounded-full disabled:bg-gray-300"
          >
            Place Order ({selectedItems.length})
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
            <div className="bg-white p-6 rounded-2xl w-full max-w-lg text-black">
              <h2 className="text-2xl font-bold text-orange-500 mb-4 text-center">
                Confirm Order
              </h2>

              <form onSubmit={handleSubmit}>
                {selectedItems.map(id => {
                  const item = menuItems.find(i => i.id === id);
                  return (
                    <div key={id} className="flex justify-between mb-3">
                      <span className="font-semibold">{item.itemName}</span>
                      <input
                        type="number"
                        min="1"
                        defaultValue="1"
                        onChange={(e)=>handleQtyChange(id,e.target.value)}
                        className="w-16 border rounded text-center"
                      />
                    </div>
                  );
                })}

                <textarea
                  placeholder="Delivery Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded p-2 my-4"
                  required
                />

                <UseDiscountCheckbox onDiscountApply={setDiscount} />

                <div className="flex gap-3 mt-4">
                  <button
                    disabled={loading}
                    className="flex-1 bg-orange-500 text-white py-2 rounded"
                  >
                    {loading ? "Processing..." : "Confirm"}
                  </button>

                  <button
                    type="button"
                    onClick={()=>setShowForm(false)}
                    className="flex-1 bg-gray-300 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <Connect_Us />
    </>
  );
};

export default BookOrder;