import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import { Pencil, Trash2 } from "lucide-react";
import Navbar from "../../Components/Navbar";

const AdminMenu = () => {

  const [menu, setMenu] = useState([]);
  const [editId, setEditId] = useState(null);

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    itemName: "",
    price: "",
    type: "",
    isAvailable: false,
    image: null
  });

  // LOAD MENU
  const loadMenu = async () => {
    const res = await api.get("/menu");
    setMenu(res.data);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // IMAGE
  const handleImage = (e) => {
    setForm({
      ...form,
      image: e.target.files[0]
    });
  };

  // RESET FORM
  const resetForm = () => {
    setEditId(null);

    setForm({
      itemName: "",
      price: "",
      type: "",
      isAvailable: false,
      image: null
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // SAVE
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

    try {

      if (editId) {
        await api.put(`/menu/${editId}`, data);
        alert("Menu item updated successfully");
      } else {
        await api.post("/menu", data);
        alert("Menu item added successfully");
      }

      resetForm();
      loadMenu();

    } catch (err) {
      console.error(err);
      alert("Error saving menu item");
    }
  };

  // EDIT
  const handleEdit = (item) => {

    setEditId(item.id);

    setForm({
      itemName: item.itemName,
      price: item.price,
      type: item.type,
      isAvailable: item.isAvailable,
      image: null
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // DELETE
  const handleDelete = async (id) => {

    if (!window.confirm("Delete this menu item?")) return;

    await api.delete(`/menu/${id}`);
    alert("Menu item deleted");

    loadMenu();
  };

  return (
    <>
      <Navbar />

      <div className="pt-24 px-10 min-h-screen bg-gray-200 text-black">
        <div className="border-b-2 border-black w-full"></div>
        <h1 className="mt-10 text-4xl font-bold text-orange-500 mb-10 text-center">
          Menu Management
        </h1>

        {/* FORM */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">

          <h2 className="text-2xl font-semibold mb-6">
            {editId ? "Edit Menu Item" : "Add Menu Item"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-2 gap-6">

              <input
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                placeholder="Item Name"
                required
                className="border rounded-lg p-3 w-full"
              />

              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                required
                className="border rounded-lg p-3 w-full"
              />

              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                placeholder="Type (Breakfast/Lunch)"
                required
                className="border rounded-lg p-3 w-full"
              />

              <label className="flex items-center gap-3 mt-3 text-lg">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                />
                Available
              </label>

            </div>

            {/* FILE INPUT FIXED UI */}
            <div className="mt-6">

              <label className="block mb-2 font-medium">
                Upload Image
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImage}
                className="w-full border rounded-lg p-3 bg-gray-50"
              />

            </div>

            <div className="flex gap-4 mt-8">

              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg"
              >
                {editId ? "Update" : "Save"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-400 text-white px-8 py-3 rounded-lg"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-lg p-8">

          <h2 className="text-2xl font-semibold mb-6">
            Menu Items
          </h2>

          <table className="w-full text-left">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Price</th>
                <th className="p-4">Type</th>
                <th className="p-4">Available</th>
                <th className="p-4 text-center">Actions</th>

              </tr>

            </thead>

            <tbody>

              {menu.map((item) => (

                <tr key={item.id} className="border-b hover:bg-gray-50">

                  <td className="p-4">
                    <img
                      src={`https://localhost:7257${item.imagePath}`}
                      className="w-16 h-16 rounded-lg object-cover"
                      alt=""
                    />
                  </td>

                  <td className="p-4 font-medium">
                    {item.itemName}
                  </td>

                  <td className="p-4">
                    ₹{item.price}
                  </td>

                  <td className="p-4">
                    {item.type}
                  </td>

                  <td className="p-4">
                    {item.isAvailable ? "Yes" : "No"}
                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-6">

                      <Pencil
                        size={20}
                        className="cursor-pointer text-blue-500"
                        onClick={() => handleEdit(item)}
                      />

                      <Trash2
                        size={20}
                        className="cursor-pointer text-red-500"
                        onClick={() => handleDelete(item.id)}
                      />

                    </div>

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

export default AdminMenu;