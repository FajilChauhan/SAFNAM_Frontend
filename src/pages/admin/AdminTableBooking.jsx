import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../Components/Navbar";
import { Trash2 } from "lucide-react";

const AdminTableBookings = () => {

  const [bookings,setBookings] = useState([]);

  const loadBookings = async ()=>{
    const res = await api.get("/tablebooking");
    setBookings(res.data);
  };

  useEffect(()=>{
    loadBookings();
  },[]);

  const handleUpdate = async (id,status)=>{

    const booking = bookings.find(b=>b.id===id);

    await api.put(`/tablebooking/${id}`,{
      ...booking,
      status
    });

    loadBookings();
  };

  const handleDelete = async(id)=>{

    if(!window.confirm("Delete booking?")) return;

    await api.delete(`/tablebooking/${id}`);

    alert("Deleted");

    loadBookings();
  };

  return (
    <>
      <Navbar/>

      <div className="pt-24 px-10 min-h-screen bg-gray-200 text-black">
      <div className="border-b-2 border-black w-full"></div>

        <h1 className="mt-10 text-4xl font-bold text-orange-500 mb-10 text-center">
          Table Booking Management
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8">

          <table className="w-full text-left">

            <thead className="bg-gray-100">

              <tr>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Table ID</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Time Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4">Delete</th>
              </tr>

            </thead>

            <tbody>

              {bookings.map(b=>(
                <tr key={b.id} className="border-b">

                  <td className="p-4">{b.id}</td>

                  <td className="p-4">{b.tableId}</td>

                  <td className="p-4">{b.userId}</td>

                  <td className="p-4">
                    {new Date(b.bookingDate).toLocaleDateString()}
                  </td>

                  <td className="p-4">{b.timeSlot}</td>

                  <td className="p-4">

                    <select
                      value={b.status}
                      onChange={(e)=>handleUpdate(b.id,e.target.value)}
                      className="border p-2 rounded"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Cancelled</option>
                    </select>

                  </td>

                  <td className="p-4">

                    <Trash2
                      className="text-red-500 cursor-pointer"
                      onClick={()=>handleDelete(b.id)}
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

export default AdminTableBookings;