import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar";
import api from "../../services/api";
import { Pencil, Trash2 } from "lucide-react";

const AdminRooms = () => {

  const [rooms, setRooms] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    roomNo: "",
    type: "",
    pricePerDay: "",
    image: null
  });

  const loadRooms = async () => {
    const res = await api.get("/room");
    setRooms(res.data);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });

  };

  const handleFile = (e) => {

    setForm({
      ...form,
      image: e.target.files[0]
    });

  };

  const resetForm = () => {

    setForm({
      roomNo: "",
      type: "",
      pricePerDay: "",
      image: null
    });

    setEditingId(null);

    document.getElementById("fileInput").value = "";

  };

  // SAVE ROOM
  const handleSubmit = async (e) => {

    e.preventDefault();

    const data = new FormData();

    data.append("RoomNo", form.roomNo);
    data.append("Type", form.type);
    data.append("PricePerDay", form.pricePerDay);

    if (form.image)
      data.append("image", form.image);

    try {

      if (editingId) {

        await api.put(`/room/${editingId}`, data);

        alert("Room updated successfully");

      } else {

        await api.post("/room", data);

        alert("Room added successfully");

      }

      resetForm();

      loadRooms();

    } catch (err) {

      console.error(err);

      alert("Error saving room");

    }

  };

  // EDIT ROOM
  const handleEdit = (room) => {

    setEditingId(room.id);

    setForm({
      roomNo: room.roomNo,
      type: room.type,
      pricePerDay: room.pricePerDay,
      image: null
    });

  };

  // DELETE ROOM
  const handleDelete = async (id) => {

    if (!window.confirm("Delete this room?"))
      return;

    await api.delete(`/room/${id}`);

    alert("Room deleted");

    loadRooms();

  };

  return (
    <>
      <Navbar />

      <div className="pt-24 px-10 min-h-screen bg-gray-200 text-black">
        <div className="border-b-2 border-black w-full"></div>
        <h1 className="mt-10 text-4xl font-bold text-orange-500 mb-10 text-center">
          Room Management
        </h1>

        {/* FORM */}

        <div className="bg-white rounded-xl shadow-lg p-8 mb-10 text-black">

          <h2 className="text-2xl font-bold mb-6">

            {editingId ? "Edit Room" : "Add Room"}

          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 text-black">

            <input
              type="number"
              name="roomNo"
              placeholder="Room Number"
              value={form.roomNo}
              onChange={handleChange}
              className="border p-3 rounded"
              required
            />

            <input
              type="text"
              name="type"
              placeholder="Room Type (Deluxe / Suite)"
              value={form.type}
              onChange={handleChange}
              className="border p-3 rounded"
              required
            />

            <input
              type="number"
              name="pricePerDay"
              placeholder="Price Per Day"
              value={form.pricePerDay}
              onChange={handleChange}
              className="border p-3 rounded"
              required
            />

            <input
              id="fileInput"
              type="file"
              onChange={handleFile}
              className="border p-3 rounded"
            />

            <button
              type="submit"
              className="col-span-2 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600"
            >
              {editingId ? "Update Room" : "Add Room"}
            </button>

          </form>

        </div>

        {/* GRID */}

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">
            Rooms
          </h2>

          <table className="w-full text-left">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4">Image</th>
                <th className="p-4">Room No</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-center items-center">Actions</th>

              </tr>

            </thead>

            <tbody>

              {rooms.map(room => (

                <tr key={room.id} className="border-b">

                  <td className="p-4">

                    <img
                      src={`https://localhost:7257${room.imagePath}`}
                      className="w-20 h-20 object-cover rounded"
                    />

                  </td>

                  <td className="p-4">{room.roomNo}</td>

                  <td className="p-4">{room.type}</td>

                  <td className="p-4">₹{room.pricePerDay}</td>

                  <td className="px-4 py-12 flex justify-center gap-6">

                    <Pencil
                      size={20}
                      className="cursor-pointer text-blue-500"
                      onClick={() => handleEdit(room)}
                    />

                    <Trash2
                      size={20}
                      className="cursor-pointer text-red-500"
                      onClick={() => handleDelete(room.id)}
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

export default AdminRooms;