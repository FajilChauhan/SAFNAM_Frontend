import React, { useEffect, useState } from "react";
import { CalendarDays, Users } from "lucide-react";
import Navbar from "../Components/Navbar";
import PlayGameButton from "../Components/PlayGameButton";
import UseDiscountCheckbox from "../Components/UseDiscountCheckbox";
import Connect_Us from "./Connect_Us";
import api from "../services/api";
import { getUserIdFromToken } from "../utils/Auth";
import toast from "react-hot-toast";

const BookTable = () => {
  const [tables, setTables] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("Ground Floor");
  const [selectedTable, setSelectedTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [timeSlot, setTimeSlot] = useState("");
  const [people, setPeople] = useState(1);
  const [loading, setLoading] = useState(false);

  const floorMap = {
    0: "Ground Floor",
    1: "1st Floor",
    2: "2nd Floor",
    3: "Rooftop"
  };

  const floors = Object.values(floorMap);

  // ✅ FETCH TABLES
  useEffect(() => {
    api.get("/RestaurantTables")
      .then(res => setTables(res.data))
      .catch(() => toast.error("Failed to load tables"));
  }, []);

  const isValidTime = (time) => {
    const hour = Number(time.split(":")[0]);
    return (hour >= 11 && hour < 15) || (hour >= 19 && hour < 23);
  };

  // ✅ BOOKING
  const handleBooking = async (e) => {
    e.preventDefault();

    const userId = getUserIdFromToken();

    if (!userId) {
      toast.error("Please login first");
      return;
    }

    if (!timeSlot) {
      toast.error("Select booking time");
      return;
    }

    if (!isValidTime(timeSlot)) {
      toast.error("Booking allowed: 11–3 & 7–11");
      return;
    }

    let checkToast;

    try {
      setLoading(true);

      // 🔥 CHECK CONFLICT
      checkToast = toast.loading("Checking availability...");

      const res = await api.get(`/tablebooking/table/${selectedTable.id}`);

      const bookings = res.data || [];

      const [h, m] = timeSlot.split(":").map(Number);
      const newStart = new Date();
      newStart.setHours(h, m, 0, 0);

      const newEnd = new Date(newStart);
      newEnd.setHours(newEnd.getHours() + 1);

      const conflict = bookings.some(b => {
        const [bh, bm] = b.timeSlot.split(":").map(Number);
        const bookedStart = new Date();
        bookedStart.setHours(bh, bm, 0, 0);

        const bookedEnd = new Date(bookedStart);
        bookedEnd.setHours(bookedEnd.getHours() + 1);

        return newStart < bookedEnd && newEnd > bookedStart;
      });

      if (conflict) {
        toast.dismiss(checkToast);
        toast.error("❌ Table already booked for this time");
        return;
      }

      toast.dismiss(checkToast);

      // 🔥 BOOK
      const bookingToast = toast.loading("Booking table...");

      await api.post("/tablebooking", {
        id: 0,
        tableId: selectedTable.id,
        userId: userId,
        bookingDate: new Date().toISOString(),
        timeSlot: timeSlot,
        status: "Active"
      });

      toast.dismiss(bookingToast);

      const tablesNeeded = Math.ceil(people / 4);

      toast.success(
        `🎉 Booking Confirmed\n👥 ${people} people\n🪑 ${tablesNeeded} table(s)` +
        (discount ? `\n💸 ${discount}% OFF` : "")
      );

      setShowForm(false);
      setSelectedTable(null);
      setTimeSlot("");
      setPeople(1);
      setDiscount(0);

    } catch (err) {
      console.error(err);

      if (checkToast) toast.dismiss(checkToast);

      if (err.response?.status === 401) {
        toast.error("Session expired");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      toast.error(err.response?.data || "Booking failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="h-[480px] bg-gradient-to-r from-purple-900 via-indigo-800 to-indigo-600 flex flex-col items-center justify-center text-white text-center px-6">
        <h1 className="text-5xl font-extrabold text-orange-400 mb-3">
          Book Your Table
        </h1>

        <p className="max-w-3xl text-lg mb-6">
          Reserve your perfect dining spot.
        </p>

        <PlayGameButton onDiscountEarned={setDiscount} />
      </div>

      {/* MAIN */}
      <div className="px-6 py-12 bg-gray-50 text-black flex flex-col lg:flex-row gap-10">

        {/* 🔥 FIXED IMAGE GRID */}
        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
          {[
            "/GroundFloor.png",
            "/FirstFloor.png",
            "/SecondFloor.png",
            "/RoofTop.png"
          ].map((img, i) => (
            <img
              key={i}
              src={img}
              alt="floor"
              className="w-full h-40 object-cover rounded-xl shadow hover:scale-105 transition"
            />
          ))}
        </div>

        {/* RIGHT */}
        <div className="lg:w-1/2">

          {/* FLOOR */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {floors.map(f => (
              <button
                key={f}
                onClick={() => setSelectedFloor(f)}
                className={`px-5 py-2 rounded-full ${
                  selectedFloor === f
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* TABLES */}
          <div className="grid grid-cols-3 gap-4">
            {tables
              .filter(t => floorMap[t.floor] === selectedFloor)
              .map(table => (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`cursor-pointer h-24 flex items-center justify-center font-bold rounded-xl shadow transition
                  ${
                    selectedTable?.id === table.id
                      ? "bg-orange-500 text-white scale-105"
                      : "bg-white hover:scale-105"
                  }`}
                >
                  Table {table.tableNo}
                </div>
              ))}
          </div>

          {selectedTable && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowForm(true)}
                className="bg-orange-500 text-white px-8 py-3 rounded-full"
              >
                Book Table {selectedTable.tableNo}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <form
            onSubmit={handleBooking}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-black"
          >
            <h3 className="text-xl font-bold text-orange-500 mb-4">
              Table {selectedTable.tableNo}
            </h3>

            <input
              type="number"
              min="1"
              value={people}
              onChange={e => setPeople(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            />

            <input
              type="time"
              value={timeSlot}
              onChange={e => setTimeSlot(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            />

            <UseDiscountCheckbox onDiscountApply={setDiscount} />

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 text-white px-5 py-2 rounded"
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      )}

      <Connect_Us />
    </>
  );
};

export default BookTable;