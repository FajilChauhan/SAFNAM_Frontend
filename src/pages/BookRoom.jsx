import React, { useEffect, useState } from "react";
import { BedDouble, CalendarDays } from "lucide-react";
import { getUserIdFromToken } from "../utils/Auth";
import Navbar from "../Components/Navbar";
import PlayGameButton from "../Components/PlayGameButton";
import UseDiscountCheckbox from "../Components/UseDiscountCheckbox";
import Connect_Us from "./Connect_Us";
import api from "../services/api";
import toast from "react-hot-toast";

const BookRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    checkin: "",
    checkout: "",
  });

  // fetch rooms
  useEffect(() => {
    api.get("/room")
      .then(res => setRooms(res.data))
      .catch(() => toast.error("Failed to load rooms"));
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openBooking = (room) => {
    setSelectedRoom(room);
  };

const handleBooking = async (e) => {
  e.preventDefault();

  const userId = getUserIdFromToken();

  if (!userId) {
    toast.error("Please login first");
    return;
  }

  if (!formData.checkin || !formData.checkout) {
    toast.error("Please select dates");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkinDate = new Date(formData.checkin);
  const checkoutDate = new Date(formData.checkout);

  if (checkinDate < today) {
    toast.error("Check-in date cannot be before today");
    return;
  }

  if (checkoutDate <= checkinDate) {
    toast.error("Check-out must be after check-in");
    return;
  }

  let loadingToast;

  try {
    setLoading(true);

    // ✅ STEP 1: CHECK AVAILABILITY
    loadingToast = toast.loading("Checking availability...");

    const res = await api.get(`/roombooking/room/${selectedRoom.id}`);

    const conflict = res.data.some(b => {
      const bookedIn = new Date(b.checkIn || b.checkin);
      const bookedOut = new Date(b.checkOut || b.checkout);
      return checkinDate < bookedOut && checkoutDate > bookedIn;
    });

    if (conflict) {
      toast.dismiss(loadingToast);
      toast.error("❌ Room not available for selected dates");
      return;
    }

    // ✅ IMPORTANT FIX: DISMISS FIRST TOAST
    toast.dismiss(loadingToast);

    // ✅ STEP 2: BOOK ROOM
    const bookingToast = toast.loading("Booking your room...");

    await api.post("/roombooking", {
      roomId: selectedRoom.id,
      userId: userId,
      checkIn: formData.checkin,
      checkOut: formData.checkout,
      status: "Booked"
    });

    toast.dismiss(bookingToast);
    toast.success(`🎉 Booking Confirmed! ${discount ? `(${discount}% OFF Applied)` : ""}`);

    setSelectedRoom(null);
    setFormData({ checkin: "", checkout: "" });
    setDiscount(0);

  } catch (err) {
    console.error(err);

    if (loadingToast) toast.dismiss(loadingToast);

    toast.error(err.response?.data || "Booking failed. Try again.");

    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }

  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="relative h-[520px] bg-gradient-to-r from-purple-900 via-indigo-800 to-indigo-600 flex flex-col items-center justify-center text-white text-center px-5">
        
        <div className="flex items-center gap-4 mb-4">
          <BedDouble className="w-12 h-12 text-orange-400" />
          <h1 className="text-[50px] font-extrabold text-orange-400">
            Book Your Room
          </h1>
        </div>

        <p className="max-w-3xl text-lg sm:text-xl mb-6">
          Experience comfort and luxury at SAFNAM Hotel.
        </p>

        <PlayGameButton onDiscountEarned={(val)=>setDiscount(val)} />
      </div>

      {/* ROOMS */}
      <div className="px-10 py-16 bg-gray-50 text-black">
        <h2 className="text-3xl font-bold text-center text-orange-500 mb-10">
          Choose Your Room
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map(room => (
            <div key={room.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              
              <img
                src={
                  room.imagePath
                    ? `https://localhost:7257${room.imagePath}`
                    : "/default-room.jpg"
                }
                alt="room"
                className="w-full h-48 object-cover"
              />

              <div className="p-5">
                <h3 className="text-xl font-bold">
                  Room {room.roomNo} - {room.type}
                </h3>

                <p className="mt-2 text-orange-500 font-semibold">
                  ₹{room.pricePerDay} / night
                </p>

                <button
                  onClick={() => openBooking(room)}
                  className="mt-5 w-full py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-black">
            
            <h3 className="text-xl font-bold text-orange-500 mb-4">
              Booking Room {selectedRoom.roomNo}
            </h3>

            <form onSubmit={handleBooking} className="flex flex-col gap-4">

              <label>
                <p className="flex items-center gap-2">
                  <CalendarDays size={18}/> Check-in
                </p>
                <input
                  type="date"
                  name="checkin"
                  value={formData.checkin}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </label>

              <label>
                <p className="flex items-center gap-2">
                  <CalendarDays size={18}/> Check-out
                </p>
                <input
                  type="date"
                  name="checkout"
                  value={formData.checkout}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                  required
                />
              </label>

              <UseDiscountCheckbox onDiscountApply={(val)=>setDiscount(val)} />

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-500 text-white px-5 py-2 rounded"
                >
                  {loading ? "Processing..." : `Confirm Booking ${discount>0 ? `(−${discount}%)` : ""}`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <Connect_Us />
    </>
  );
};

export default BookRoom;