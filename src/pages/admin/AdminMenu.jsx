import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Pencil, Trash2 } from "lucide-react";
import Navbar from "../../Components/Navbar";

const AdminMenu = () => {

  const [menu, setMenu] = useState([]);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    itemName: "",
    price: "",
    type: "",
    isAvailable: true,
    image: null
  });

  // LOAD MENU
  const loadMenu = async () => {
    try {
      const res = await api.get("/menu");
      setMenu(res.data);
    } catch (err) {
      console.error(err);
    }
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

  // IMAGE CHANGE
  const handleImage = (e) => {
    setForm({
      ...form,
      image: e.target.files[0]
    });
  };

  // SAVE MENU
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
      } else {
        await api.post("/menu", data);
      }

      resetForm();
      loadMenu();

    } catch (err) {
      console.error(err);
      alert("Error saving menu item");
    }
  };

  // EDIT MENU
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

  // DELETE MENU
  const handleDelete = async (id) => {

    if (!window.confirm("Delete this menu item?")) return;

    try {
      await api.delete(`/menu/${id}`);
      loadMenu();
    } catch (err) {
      console.error(err);
    }
  };

  // RESET FORM
  const resetForm = () => {

    setEditId(null);

    setForm({
      itemName: "",
      price: "",
      type: "",
      isAvailable: true,
      image: null
    });
  };

  return (
    <>
      <Navbar />

      <div className="pt-24 px-10 min-h-screen bg-gray-100 text-black">

        {/* PAGE TITLE */}
        <h1 className="text-3xl font-bold text-orange-500 mb-8">
          Menu Management
        </h1>

        {/* FORM CARD */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10">

          <h2 className="text-xl font-semibold mb-6">
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

              <label className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                />
                Available
              </label>

              <input
                type="file"
                onChange={handleImage}
                className="border rounded-lg p-3 col-span-2"
              />

            </div>

            <div className="flex gap-4 mt-6">

              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
              >
                {editId ? "Update" : "Save"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-xl shadow-lg p-6">

          <h2 className="text-xl font-semibold mb-6">
            Menu Items
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-200">

                <tr>
                  <th className="p-3">Image</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Available</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>

              </thead>

              <tbody>

                {menu.map((item) => (

                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-3">
                      <img
                        src={`https://localhost:7257${item.imagePath}`}
                        className="w-16 h-16 rounded-lg object-cover"
                        alt=""
                      />
                    </td>

                    <td className="p-3 font-medium">
                      {item.itemName}
                    </td>

                    <td className="p-3">
                      ₹{item.price}
                    </td>

                    <td className="p-3">
                      {item.type}
                    </td>

                    <td className="p-3">
                      {item.isAvailable ? (
                        <span className="text-green-600 font-semibold">
                          Yes
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold">
                          No
                        </span>
                      )}
                    </td>

                    <td className="p-3">

                      <div className="flex justify-center gap-4">

                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Pencil size={20} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={20} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </>
  );
};

export default AdminMenu;