import React, { useEffect, useState, useRef } from "react";
import Navbar from "../../Components/Navbar";
import api from "../../services/api";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const AdminRooms = () => {

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const fileRef = useRef(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    roomNo: "",
    type: "",
    pricePerDay: "",
    image: null,
    preview: null
  });

  // ================= LOAD =================
  const loadRooms = async () => {
    const res = await api.get("/room");
    setRooms(res.data);
    setFilteredRooms(res.data);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // ================= FILTER =================
  useEffect(() => {
    let data = [...rooms];

    if (search) {
      data = data.filter(r =>
        r.roomNo.toString().includes(search)
      );
    }

    if (typeFilter) {
      data = data.filter(r => r.type === typeFilter);
    }

    if (priceFilter) {
      data = data.filter(r => r.pricePerDay <= priceFilter);
    }

    setFilteredRooms(data);
    setCurrentPage(1);

  }, [search, typeFilter, priceFilter, rooms]);

  // ================= PAGINATION =================
  const indexOfLast = currentPage * pageSize;
  const currentData = filteredRooms.slice(indexOfLast - pageSize, indexOfLast);
  const totalPages = Math.ceil(filteredRooms.length / pageSize);

  // ================= FORM =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    setForm({
      ...form,
      image: file,
      preview: URL.createObjectURL(file)
    });
  };

  const resetForm = () => {
    setEditingId(null);

    setForm({
      roomNo: "",
      type: "",
      pricePerDay: "",
      image: null,
      preview: null
    });

    if (fileRef.current) fileRef.current.value = "";
  };

  // ================= SAVE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("RoomNo", form.roomNo);
    data.append("Type", form.type);
    data.append("PricePerDay", form.pricePerDay);

    if (form.image) {
      data.append("image", form.image);
    }

    const t = toast.loading(editingId ? "Updating..." : "Saving...");

    try {

      if (editingId) {
        await api.put(`/room/${editingId}`, data);
        toast.success("Updated successfully", { id: t });
      } else {
        await api.post("/room", data);
        toast.success("Added successfully", { id: t });
      }

      resetForm();
      loadRooms();

    } catch (err) {
      toast.error(err.response?.data || "Error", { id: t });
    }
  };

  // ================= EDIT =================
  const handleEdit = (room) => {
    setEditingId(room.id);

    setForm({
      roomNo: room.roomNo,
      type: room.type,
      pricePerDay: room.pricePerDay,
      image: null,
      preview: `https://localhost:7257${room.imagePath}`
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const t = toast.loading("Deleting...");

    try {
      await api.delete(`/room/${id}`);
      toast.success("Deleted", { id: t });
      loadRooms();
    } catch (err) {
      toast.error(err.response?.data || "Cannot delete", { id: t });
    }
  };

  return (
    <>
      <Navbar />

      <div className="pt-24 px-10 min-h-screen bg-gray-100 text-black">

        <h1 className="text-4xl font-bold text-orange-500 mb-10 text-center">
          Room Management
        </h1>

        {/* ================= FORM ================= */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

            <input
              type="number"
              name="roomNo"
              placeholder="Room Number"
              value={form.roomNo}
              onChange={handleChange}
              className="border p-3 rounded"
              required
            />

            {/* 🔥 TYPE DROPDOWN */}
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border p-3 rounded"
              required
            >
              <option value="">Select Type</option>
              <option>Standard</option>
              <option>Suite</option>
              <option>Deluxe</option>
            </select>

            <input
              type="number"
              name="pricePerDay"
              placeholder="Price Per Day"
              value={form.pricePerDay}
              onChange={handleChange}
              className="border p-3 rounded"
              required
            />

            {/* IMAGE */}
            <div className="col-span-2">

              {form.preview && (
                <img
                  src={form.preview}
                  className="w-32 h-32 object-cover rounded mb-3"
                />
              )}

              <label className="flex flex-col items-center justify-center border-2 border-dashed p-6 rounded cursor-pointer hover:bg-gray-50">
                <span>
                  {form.image ? form.image.name : "Click to upload image"}
                </span>

                <input
                  type="file"
                  ref={fileRef}
                  onChange={handleImage}
                  className="hidden"
                />
              </label>

            </div>

            <button className="bg-orange-500 text-white py-3 rounded col-span-2">
              {editingId ? "Update Room" : "Save Room"}
            </button>

          </form>

        </div>

        {/* ================= FILTER ================= */}
        <div className="flex justify-between mb-6">

          <div className="flex gap-4">

            <select
              onChange={e => setTypeFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Types</option>
              <option>Standard</option>
              <option>Suite</option>
              <option>Deluxe</option>
            </select>

            <input
              type="number"
              placeholder="Max Price"
              onChange={e => setPriceFilter(e.target.value)}
              className="border p-2 rounded"
            />

          </div>

          <input
            placeholder="Search Room No..."
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-64"
          />

        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white p-6 rounded shadow">

          <table className="w-full border-separate border-spacing-y-3">

            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="p-3">Image</th>
                <th>Room No</th>
                <th>Type</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map(room => (
                <tr key={room.id} className="bg-white shadow rounded text-center">

                  <td className="p-3">
                    <img
                      src={`https://localhost:7257${room.imagePath}`}
                      className="w-14 h-14 rounded mx-auto"
                    />
                  </td>

                  <td>{room.roomNo}</td>
                  <td>{room.type}</td>
                  <td>₹{room.pricePerDay}</td>

                  <td className="py-4">
                    <div className="flex justify-center gap-4">
                      <Pencil
                        className="text-blue-500 cursor-pointer"
                        onClick={() => handleEdit(room)}
                      />
                      <Trash2
                        className="text-red-500 cursor-pointer"
                        onClick={() => handleDelete(room.id)}
                      />
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

          {/* ================= PAGINATION ================= */}
          <div className="flex justify-between items-center mt-6">

            <div>
              Page Size:
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="ml-2 border p-1 rounded"
              >
                <option>5</option>
                <option>10</option>
                <option>20</option>
              </select>
            </div>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default AdminRooms;