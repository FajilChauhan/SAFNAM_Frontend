import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../Components/Navbar";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";

const AdminTables = () => {

  const [tables, setTables] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    tableNo: "",
    floor: 0
  });

  // ================= LOAD =================
  const loadTables = async () => {
    const res = await api.get("/RestaurantTables");
    setTables(res.data);
    setFiltered(res.data);
  };

  useEffect(() => {
    loadTables();
  }, []);

  // ================= FILTER =================
  useEffect(() => {
    let data = [...tables];

    if (search) {
      data = data.filter(t =>
        t.tableNo.toString().includes(search)
      );
    }

    if (floorFilter !== "") {
      data = data.filter(t => t.floor == floorFilter);
    }

    if (activeFilter !== "") {
      data = data.filter(t => t.isActive === (activeFilter === "true"));
    }

    setFiltered(data);
    setCurrentPage(1);

  }, [search, floorFilter, activeFilter, tables]);

  // ================= PAGINATION =================
  const indexOfLast = currentPage * pageSize;
  const currentData = filtered.slice(indexOfLast - pageSize, indexOfLast);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // ================= FORM =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ tableNo: "", floor: 0 });
    setEditingId(null);
  };

  // ================= SAVE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const t = toast.loading(editingId ? "Updating..." : "Creating...");

    try {
      if (editingId) {
        await api.put(`/RestaurantTables/${editingId}`, form);
        toast.success("Updated", { id: t });
      } else {
        await api.post("/RestaurantTables", form);
        toast.success("Created", { id: t });
      }

      resetForm();
      loadTables();

    } catch (err) {
      toast.error(err.response?.data || "Error", { id: t });
    }
  };

  // ================= EDIT =================
  const handleEdit = (t) => {
    setForm({
      tableNo: t.tableNo,
      floor: t.floor
    });
    setEditingId(t.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= TOGGLE =================
  const handleToggle = async (t) => {

    const newStatus = !t.isActive;

    // 🔥 instant UI
    setTables(prev =>
      prev.map(x =>
        x.id === t.id ? { ...x, isActive: newStatus } : x
      )
    );

    const toastId = toast.loading("Updating...");

    try {
      await api.put(`/RestaurantTables/${t.id}/status?isActive=${newStatus}`);

      toast.success(
        newStatus ? "Activated" : "Set to Inactive",
        { id: toastId }
      );

    } catch {
      toast.error("Failed", { id: toastId });

      // rollback
      setTables(prev =>
        prev.map(x =>
          x.id === t.id ? { ...x, isActive: !newStatus } : x
        )
      );
    }
  };

  return (
    <>
      <Navbar />

      <div className="pt-24 px-10 min-h-screen bg-gray-100 text-black">

        <h1 className="text-4xl font-bold text-orange-500 mb-10 text-center">
          Table Management
        </h1>

        {/* FORM */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">

          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">

            <input
              type="number"
              name="tableNo"
              placeholder="Table Number"
              value={form.tableNo}
              onChange={handleChange}
              className="border p-3 rounded"
              required
            />

            <select
              name="floor"
              value={form.floor}
              onChange={handleChange}
              className="border p-3 rounded"
            >
              <option value={0}>Ground</option>
              <option value={1}>1st Floor</option>
              <option value={2}>2nd Floor</option>
              <option value={3}>Rooftop</option>
            </select>

            <button className="bg-orange-500 text-white rounded">
              {editingId ? "Update" : "Create"}
            </button>

          </form>

        </div>

        {/* FILTER */}
        <div className="flex justify-between mb-6">

          <div className="flex gap-4">

            <select onChange={e => setFloorFilter(e.target.value)} className="border p-2 rounded">
              <option value="">All Floors</option>
              <option value={0}>Ground</option>
              <option value={1}>1st Floor</option>
              <option value={2}>2nd Floor</option>
              <option value={3}>Rooftop</option>
            </select>

            <select onChange={e => setActiveFilter(e.target.value)} className="border p-2 rounded">
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

          </div>

          <input
            placeholder="Search Table No..."
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-64"
          />

        </div>

        {/* TABLE */}
        <div className="bg-white p-6 rounded shadow">

          <table className="w-full border-separate border-spacing-y-3">

            <thead>
              <tr className="bg-gray-100 text-center h-14 font-semibold text-lg">
                <th>Table No</th>
                <th>Floor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map(t => (
                <tr key={t.id} className="bg-white shadow rounded text-center">
                  <td>{t.tableNo}</td>
                  <td>{t.floor}</td>

                  <td>
                    <span className={`px-2 py-1 text-white rounded ${
                      t.isActive ? "bg-green-500" : "bg-gray-400"
                    }`}>
                      {t.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex justify-center gap-4">

                      <Pencil
                        className="text-blue-500 cursor-pointer"
                        onClick={() => handleEdit(t)}
                      />

                      {/* TOGGLE */}
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={t.isActive}
                          onChange={() => handleToggle(t)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-orange-500 relative">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                        </div>
                      </label>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

          {/* PAGINATION */}
          <div className="flex justify-between mt-6">

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

export default AdminTables;