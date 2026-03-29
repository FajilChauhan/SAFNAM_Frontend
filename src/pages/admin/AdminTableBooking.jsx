import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../Components/Navbar";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const AdminTableBookings = () => {

  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [mode, setMode] = useState("active");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // ================= LOAD =================
  const loadBookings = async (type = "active") => {

    const t = toast.loading("Loading...");

    try {

      let res;

      if (type === "active") {
        res = await api.get("/tablebooking/active");
      } else {
        res = await api.get("/tablebooking");
      }

      setBookings(res.data);
      setFiltered(res.data);

      toast.success("Loaded", { id: t });

    } catch {
      toast.error("Failed", { id: t });
    }
  };

  useEffect(() => {
    loadBookings("active");
  }, []);

  // ================= NORMALIZE STATUS =================
  const normalizeStatus = (status) => {

    if (status === "1" || status === 1 || status === true || status === "Active")
      return "Active";

    if (status === "false" || status === false)
      return "Cancelled";

    return status;
  };

  // ================= FLOOR FORMAT =================
  const getFloor = (f) => {
    if (f === 0) return "Ground";
    if (f === 1) return "1st Floor";
    if (f === 2) return "2nd Floor";
    return `${f} Floor`;
  };

  // ================= FILTER =================
  useEffect(() => {

    let data = [...bookings];

    if (search) {
      data = data.filter(b =>
        b.userName.toLowerCase().includes(search.toLowerCase()) ||
        b.tableNo.toString().includes(search)
      );
    }

    if (statusFilter) {
      data = data.filter(b => normalizeStatus(b.status) === statusFilter);
    }

    if (floorFilter !== "") {
      data = data.filter(b => b.fLoor == floorFilter);
    }

    setFiltered(data);
    setCurrentPage(1);

  }, [search, statusFilter, floorFilter, bookings]);

  // ================= PAGINATION =================
  const indexOfLast = currentPage * pageSize;
  const currentData = filtered.slice(indexOfLast - pageSize, indexOfLast);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // ================= UPDATE =================
  const handleUpdate = async (id, status) => {

    const t = toast.loading("Updating...");

    try {

      const booking = bookings.find(b => b.id === id);

      await api.put(`/tablebooking/${id}`, {
        ...booking,
        status // string
      });

      setBookings(prev =>
        prev.map(b =>
          b.id === id ? { ...b, status } : b
        )
      );

      toast.success("Updated", { id: t });

    } catch {
      toast.error("Failed", { id: t });
    }
  };

  // ================= DELETE =================
  const handleDelete = (id) => {

    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Delete booking?</span>

        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>

          <button
            className="px-3 py-1 bg-red-500 text-white rounded"
            onClick={async () => {

              toast.dismiss(t.id);
              const loading = toast.loading("Deleting...");

              try {

                await api.delete(`/tablebooking/${id}`);
                setBookings(prev => prev.filter(b => b.id !== id));

                toast.success("Deleted", { id: loading });

              } catch {
                toast.error("Failed", { id: loading });
              }

            }}
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <>
      <Navbar />

      <div className="pt-24 px-10 min-h-screen bg-gray-100 text-black">

        <h1 className="text-4xl font-bold text-orange-500 mb-6 text-center">
          Table Booking Management
        </h1>

        {/* 🔥 BUTTONS */}
        <div className="flex justify-center gap-6 mb-6">

          <button
            onClick={() => {
              setMode("active");
              loadBookings("active");
            }}
            className={`px-6 py-2 rounded ${
              mode === "active" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            Active Bookings
          </button>

          <button
            onClick={() => {
              setMode("all");
              loadBookings("all");
            }}
            className={`px-6 py-2 rounded ${
              mode === "all" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            All Bookings
          </button>

        </div>

        {/* 🔥 FILTERS */}
        <div className="flex justify-between flex-wrap gap-4 mb-6">

          <div className="flex gap-3 flex-wrap">

            <select
              onChange={e => setStatusFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Status</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>

            <select
              onChange={e => setFloorFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Floor</option>
              <option value="0">Ground</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
            </select>

          </div>

          <input
            placeholder="Search user / table..."
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-72"
          />

        </div>

        {/* 🔥 TABLE */}
        <div className="bg-white p-6 rounded shadow">

          <table className="w-full border-separate border-spacing-y-3 text-center">

            <thead>
              <tr className="bg-gray-100 h-14">
                <th>ID</th>
                <th>Table</th>
                <th>Floor</th>
                <th>User</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>

              {currentData.map(b => (

                <tr key={b.id} className="bg-white shadow rounded h-16">

                  <td>{b.id}</td>
                  <td>{b.tableNo}</td>
                  <td>{getFloor(b.fLoor)}</td>
                  <td>{b.userName}</td>
                  <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                  <td>{b.timeSlot}</td>

                  <td>
                    <select
                      value={normalizeStatus(b.status)}
                      onChange={(e) =>
                        handleUpdate(b.id, e.target.value)
                      }
                      className="border p-2 rounded"
                    >
                      <option>Active</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </td>

                  <td>
                    <div className="flex justify-center">
                      <Trash2
                        className="text-red-500 cursor-pointer"
                        onClick={() => handleDelete(b.id)}
                      />
                    </div>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {/* 🔥 PAGINATION */}
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

export default AdminTableBookings;