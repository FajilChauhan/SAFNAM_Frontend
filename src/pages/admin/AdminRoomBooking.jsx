import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../Components/Navbar";
import { Trash2 } from "lucide-react";

const AdminRoomBookings = () => {

  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    const res = await api.get("/roombooking");
    setBookings(res.data);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleUpdate = async (id, status, paymentStatus) => {

    try {

      const booking = bookings.find(b => b.id === id);

      await api.put(`/roombooking/${id}`, {
        ...booking,
        status,
        paymentStatus
      });

      setBookings(prev =>
        prev.map(b =>
          b.id === id ? { ...b, status, paymentStatus } : b
        )
      );

    } catch (err) {

      console.error(err);
      alert("Update failed");

    }

  };

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this booking?")) return;

    await api.delete(`/roombooking/${id}`);

    alert("Booking deleted");

    loadBookings();
  };

  return (
    <>
      <Navbar />

      <div className="pt-24 px-10 min-h-screen bg-gray-200 text-black">
      <div className="border-b-2 border-black w-full"></div>

        <h1 className="mt-10 text-4xl font-bold text-orange-500 mb-10 text-center">
          Room Booking Management
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8">

          <table className="w-full text-left">

            <thead className="bg-gray-100">

              <tr>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Room No</th>
                <th className="p-4">User Name</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Delete</th>
              </tr>

            </thead>

            <tbody>

              {bookings.map(b => (

                <tr key={b.id} className="border-b">

                  <td className="p-4">{b.id}</td>

                  <td className="p-4">{b.roomNo}</td>

                  <td className="p-4">{b.userName}</td>

                  <td className="p-4">
                    {new Date(b.checkIn).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    {new Date(b.checkOut).toLocaleDateString()}
                  </td>

                  <td className="p-4">₹{b.totalAmount}</td>

                  {/* PAYMENT */}

                  <td className="p-4">

                    <select
                      value={b.paymentStatus}
                      onChange={(e) =>
                        handleUpdate(b.id, b.status, e.target.value)
                      }
                      className="border p-2 rounded"
                    >
                      <option>Pending</option>
                      <option>Paid</option>
                      <option>Refunded</option>
                    </select>

                  </td>

                  {/* STATUS */}

                  <td className="p-4">

                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleUpdate(b.id, e.target.value, b.paymentStatus)
                      }
                      className="border p-2 rounded"
                    >
                      <option value={1}>Booked</option>
                      <option value={2}>Checked In</option>
                      <option value={3}>Completed</option>
                      <option value={0}>Cancelled</option>
                    </select>

                  </td>

                  <td className="p-4">

                    <Trash2
                      className="cursor-pointer text-red-500"
                      onClick={() => handleDelete(b.id)}
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </>
  );
};

export default AdminRoomBookings;