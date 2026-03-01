import React, { useEffect, useState } from "react";
import { CalendarDays, Users } from "lucide-react";
import Navbar from "../Components/Navbar";
import PlayGameButton from "../Components/PlayGameButton";
import UseDiscountCheckbox from "../Components/UseDiscountCheckbox";
import Connect_Us from "./Connect_Us";
import api from "../services/api";
import { getUserIdFromToken } from "../utils/Auth";

const BookTable = () => {
  const [tables, setTables] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("Ground Floor");
  const [selectedTable, setSelectedTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [timeSlot, setTimeSlot] = useState("");
  const [people, setPeople] = useState(1);

  const floorMap = {
    0: "Ground Floor",
    1: "1st Floor",
    2: "2nd Floor",
    3: "Rooftop"
  };

  const floors = Object.values(floorMap);

  // fetch tables
  useEffect(() => {
    api.get("/RestaurantTables")
      .then(res => setTables(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleTableClick = (table) => {
  setSelectedTable(table);
};

  // allowed time check
  const addOneHour = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m);
  date.setHours(date.getHours() + 1);
  return date;
};

const isValidTime = (time) => {
  const hour = Number(time.split(":")[0]);
  return (hour >= 11 && hour < 15) || (hour >= 19 && hour < 23);
};

  const handleBooking = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    const userId = getUserIdFromToken();
    if (!userId) return alert("Session expired. Login again.");

    if (!timeSlot) return alert("Select booking time");

    if (!isValidTime(timeSlot)) {
      alert("Bookings allowed only:\n• 11 AM – 3 PM\n• 7 PM – 11 PM");
      return;
    }

    try {
      const res = await api.get(`/tablebooking/${selectedTable.id}`);

      const bookings = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      const newStart = new Date();
const [h, m] = timeSlot.split(":").map(Number);
newStart.setHours(h, m, 0, 0);

const newEnd = new Date(newStart);
newEnd.setHours(newEnd.getHours() + 1);

// add buffer window
const bufferBefore = new Date(newStart);
bufferBefore.setHours(bufferBefore.getHours() - 1);

const bufferAfter = new Date(newEnd);
bufferAfter.setHours(bufferAfter.getHours() + 1);

const conflict = bookings.some(b => {
  const [bh, bm] = b.timeSlot.split(":").map(Number);
  const bookedStart = new Date();
  bookedStart.setHours(bh, bm, 0, 0);

  const bookedEnd = new Date(bookedStart);
  bookedEnd.setHours(bookedEnd.getHours() + 1);

  return bufferBefore < bookedEnd && bufferAfter > bookedStart;
});

      if (conflict) {
        alert("❌ This table is already booked at that time");
        return;
      }

      await api.post("/tablebooking", {
        id: 0,
        tableId: selectedTable.id,
        userId: userId,
        bookingDate: new Date().toISOString(),
        timeSlot: timeSlot,
        status: true
      });

      const tablesNeeded = Math.ceil(people / 4);

      alert(
        `✅ Booking Confirmed!\n\n` +
        `👥 People: ${people}\n` +
        `🪑 Tables required: ${tablesNeeded}\n` +
        (tablesNeeded > 1
          ? "👉 Multiple tables will be arranged together."
          : "") +
        (discount ? `\n💸 ${discount}% discount applied` : "")
      );

      setShowForm(false);
      setSelectedTable(null);
      setTimeSlot("");
      setPeople(1);
      setDiscount(0);

    } catch (err) {
      if (err.response?.status === 401) {
    alert("Session expired. Please login again.");
    localStorage.clear();
    window.location.href = "/login";
    return;
  }
      console.error(err);
      alert("Booking failed");
    }
  };

  return (
    <>
      <Navbar />

      {/* HERO */}
      <div className="relative h-[480px] bg-gradient-to-r from-purple-900 via-indigo-800 to-indigo-600 flex flex-col items-center justify-center text-white text-center px-6">
        <h1 className="text-5xl font-extrabold text-orange-400 mb-3">
          Book Your Table
        </h1>

        <p className="max-w-3xl text-lg mb-6">
          Reserve your perfect dining spot. Each table seats 4 guests.
          For larger groups, we will combine tables for you.
        </p>

        <PlayGameButton onDiscountEarned={(val)=>setDiscount(val)} />
      </div>

      {/* FLOOR SELECT */}
      <div className="px-6 py-12 bg-gray-50 text-black flex flex-col lg:flex-row gap-10">

  {/* LEFT SIDE — FLOOR IMAGES */}
  <div className="lg:w-1/2 flex flex-col gap-6 items-center">
    <img src="/GroundFloor.png" className="rounded-xl shadow w-72" />
    <img src="/FirstFloor.png" className="rounded-xl shadow w-72" />
    <img src="/SecondFloor.png" className="rounded-xl shadow w-72" />
    <img src="/RoofTop.png" className="rounded-xl shadow w-72" />
  </div>

  {/* RIGHT SIDE — TABLE SELECTION */}
  <div className="lg:w-1/2">

    {/* FLOOR BUTTONS */}
    <div className="flex justify-center gap-3 mb-8 flex-wrap">
      {floors.map(f => (
        <button
          key={f}
          onClick={() => setSelectedFloor(f)}
          className={`px-5 py-2 rounded-full font-semibold ${
            selectedFloor === f
              ? "bg-orange-500 text-white"
              : "bg-gray-200"
          }`}
        >
          {f}
        </button>
      ))}
    </div>

    {/* TABLE GRID */}
    <div className="grid grid-cols-3 gap-4">
      {tables
        .filter(t => floorMap[t.floor] === selectedFloor)
        .map(table => (
          <div
  key={table.id}
  onClick={() => setSelectedTable(table)}
  className={`cursor-pointer border rounded-xl h-24 flex items-center justify-center font-bold text-lg shadow transition
  ${
    selectedTable?.id === table.id
      ? "bg-orange-500 text-white scale-105 border-orange-600"
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
      className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition"
    >
      Book Table {selectedTable.tableNo}
    </button>
  </div>
)}
  </div>
</div>

      {/* BOOKING MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <form
            onSubmit={handleBooking}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-black"
          >
            <h3 className="text-xl font-bold text-orange-500 mb-4">
              Table {selectedTable.tableNo}
            </h3>

            <label className="block mb-3">
              <p className="flex items-center gap-2">
                <Users size={18}/> Number of People
              </p>
              <input
                type="number"
                min="1"
                value={people}
                onChange={e => setPeople(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
            </label>

            <label className="block mb-3">
              <p className="flex items-center gap-2">
                <CalendarDays size={18}/> Time
              </p>
              <input
                type="time"
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
            </label>

            <UseDiscountCheckbox onDiscountApply={(v)=>setDiscount(v)} />
            
            <p className="text-sm text-red-600 mt-2">
⚠️ Each booking slot is 1 hour.
<br/>
⚠️ If you do not arrive within 15 minutes, the reservation may be cancelled and given to another guest.
</p>

            <p className="text-sm text-gray-600 mt-2">
              Each table seats 4 guests.  
              Larger groups will be accommodated with combined tables.
            </p>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={()=>setShowForm(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-orange-500 text-white px-5 py-2 rounded"
              >
                Confirm Booking
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