import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import { Pencil, Trash2 } from "lucide-react";
import Navbar from "../../Components/Navbar";
import toast from "react-hot-toast";

const AdminMenu = () => {

  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);

  const [editId, setEditId] = useState(null);
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [availableFilter, setAvailableFilter] = useState("");

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    itemName: "",
    price: "",
    type: "",
    isAvailable: false,
    image: null,
    preview: null //for image preview

  });

  // ================= LOAD =================
  const loadMenu = async () => {
    const res = await api.get("/menu");
    setMenu(res.data);
    setFilteredMenu(res.data);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // ================= FILTER =================
  useEffect(() => {
    let data = [...menu];

    if (search) {
      data = data.filter(m =>
        m.itemName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (typeFilter) {
      data = data.filter(m => m.type === typeFilter);
    }

    if (availableFilter !== "") {
      data = data.filter(m => m.isAvailable === (availableFilter === "true"));
    }

    setFilteredMenu(data);
    setCurrentPage(1);

  }, [search, typeFilter, availableFilter, menu]);

  // ================= PAGINATION =================
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentData = filteredMenu.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMenu.length / pageSize);

  // ================= FORM =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    setForm({
      ...form,
      image: file,
      preview: URL.createObjectURL(file) // 🔥 preview
    });
  };


  const resetForm = () => {
    setEditId(null);

    setForm({
      itemName: "",
      price: "",
      type: "",
      isAvailable: false,
      image: null,
      preview: null
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ================= SAVE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(); 
    data.append("itemName", form.itemName);
    data.append("price", form.price);
    data.append("type", form.type);
    data.append("isAvailable", form.isAvailable);

    if (form.image) {
      data.append("image", form.image);
    }

    const t = toast.loading("Saving...");

    try {
      if (editId) {
        data.append("id", editId);
        await api.put(`/menu/${editId}`, data); // ✅ FIXED
        toast.success("Updated successfully", { id: t });
      } else {
        await api.post("/menu", data);
        toast.success("Added successfully", { id: t });
      }

      resetForm();
      loadMenu();

    } catch (err) {
      toast.error(err.response?.data || "Error saving", { id: t });
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const t = toast.loading("Deleting...");

    try {
      await api.delete(`/menu/${id}`);
      toast.success("Deleted", { id: t });
      loadMenu();
    } catch (err) {
      toast.error(err.response?.data || "Cannot delete", { id: t });
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditId(item.id);

    setForm({
      itemName: item.itemName,
      price: item.price,
      type: item.type,
      isAvailable: item.isAvailable,
      image: null,
      preview: `https://localhost:7257${item.imagePath}`
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />

      <div className="pt-24 px-10 min-h-screen bg-gray-100 text-black">

        <h1 className="text-4xl font-bold text-orange-500 mb-10 text-center">
          Menu Management
        </h1>

        {/* ================= FORM ================= */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

            <input
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              placeholder="Item Name"
              required
              className="border p-3 rounded"
            />

            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              required
              className="border p-3 rounded"
            />

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border p-3 rounded"
              required
            >
              <option value="">Select Type</option>
              <option>Popular Breakfast</option>
              <option>Special Lunch</option>
              <option>Lovely Dinner</option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isAvailable"
                checked={form.isAvailable}
                onChange={handleChange}
              />
              Available
            </label>

            {/* 🔥 MODERN FILE UPLOAD */}
            <div className="col-span-2">

              {form.preview && (
                <img
                  src={form.preview}
                  className="w-32 h-32 object-cover mb-3 rounded"
                />
              )}

              <label className="flex flex-col items-center justify-center border-2 border-dashed p-6 rounded cursor-pointer hover:bg-gray-50">
                <span>
                  {form.image ? form.image.name : "Click to upload image"}
                </span>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImage}
                  className="hidden"
                />
              </label>

              {!form.image && editId && (
                <p className="text-sm text-gray-500 mt-2">
                  Leave empty to keep existing image
                </p>
              )}

            </div>

            <button className="bg-orange-500 text-white py-3 rounded col-span-2">
              {editId ? "Update" : "Save"}
            </button>

          </form>

        </div>

        {/* ================= FILTER ================= */}
        <div className="flex justify-between mb-6">

          <div className="flex gap-4">

            <select onChange={e => setTypeFilter(e.target.value)}
              className="border p-2 rounded">
              <option value="">All Types</option>
              <option>Popular Breakfast</option>
              <option>Special Lunch</option>
              <option>Lovely Dinner</option>
            </select>

            <select onChange={e => setAvailableFilter(e.target.value)}
              className="border p-2 rounded">
              <option value="">All</option>
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>

          </div>

          <input
            placeholder="Search Items..."
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
                <th>Name</th>
                <th>Price</th>
                <th>Type</th>
                <th>Available</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map(item => (
                <tr
                  key={item.id}
                  className="bg-white shadow rounded-lg text-center"
                >

                  <td className="p-3">
                    <img
                      src={`https://localhost:7257${item.imagePath}`}
                      className="w-14 h-14 rounded mx-auto"
                    />
                  </td>

                  <td>{item.itemName}</td>
                  <td>₹{item.price}</td>
                  <td>{item.type}</td>
                  <td>{item.isAvailable ? "Yes" : "No"}</td>

                  <td className="py-4">
                    <div className="flex justify-center gap-4">
                      <Pencil
                        className="text-blue-500 cursor-pointer"
                        onClick={() => handleEdit(item)}
                      />
                      <Trash2
                        className="text-red-500 cursor-pointer"
                        onClick={() => handleDelete(item.id)}
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

export default AdminMenu;