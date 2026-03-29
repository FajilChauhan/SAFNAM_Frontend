import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../Components/Navbar";
import { Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";

const AdminOrders = () => {

  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [mode, setMode] = useState("pending"); // pending | all

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedItems, setSelectedItems] = useState([]);
  const [showItems, setShowItems] = useState(false);

  // ================= LOAD =================

  const loadOrders = async (type = "pending") => {

    const t = toast.loading("Loading orders...");

    try {

      let res;

      if (type === "pending") {
        res = await api.get("/order/pending");
      } else {
        res = await api.get("/order");
      }

      setOrders(res.data);
      setFiltered(res.data);

      toast.success("Loaded", { id: t });

    } catch {
      toast.error("Failed to load", { id: t });
    }
  };

  useEffect(() => {
    loadOrders("pending");
  }, []);

  // ================= FILTER =================

  useEffect(() => {

    let data = [...orders];

    if (search) {
      data = data.filter(o =>
        o.userName.toLowerCase().includes(search.toLowerCase()) ||
        o.address.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (paymentFilter) {
      data = data.filter(o => o.paymentStatus === paymentFilter);
    }

    if (statusFilter) {
      data = data.filter(o => o.status === statusFilter);
    }

    setFiltered(data);
    setCurrentPage(1);

  }, [search, paymentFilter, statusFilter, orders]);

  // ================= PAGINATION =================

  const indexOfLast = currentPage * pageSize;
  const currentData = filtered.slice(indexOfLast - pageSize, indexOfLast);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // ================= VIEW ITEMS =================

  const handleView = async (id) => {

    const t = toast.loading("Loading items...");

    try {

      const res = await api.get(`/order/${id}`);

      setSelectedItems(res.data.items || []);
      setShowItems(true);

      toast.dismiss(t);

    } catch {
      toast.error("Failed", { id: t });
    }
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {

    const confirm = window.confirm("Delete this order?");
    if (!confirm) return;

    const t = toast.loading("Deleting...");

    try {

      await api.delete(`/order/${id}`);

      setOrders(prev => prev.filter(o => o.id !== id));

      toast.success("Deleted", { id: t });

    } catch {
      toast.error("Failed", { id: t });
    }
  };

  // ================= UPDATE =================

  const handleUpdate = async (id, status, paymentStatus) => {

    const t = toast.loading("Updating...");

    try {

      await api.put(`/order/${id}`, { status, paymentStatus });

      setOrders(prev =>
        prev.map(o =>
          o.id === id ? { ...o, status, paymentStatus } : o
        )
      );

      toast.success("Updated", { id: t });

    } catch {
      toast.error("Failed", { id: t });
    }
  };

  return (
    <>
      <Navbar />

      <div className="pt-24 px-10 min-h-screen bg-gray-100 text-black">

        <h1 className="text-4xl font-bold text-orange-500 mb-8 text-center">
          Order Management
        </h1>

        {/* 🔥 TOP BUTTONS */}
        <div className="flex justify-center gap-6 mb-6 font-semibold">

          <button
            onClick={() => {
              setMode("pending");
              loadOrders("pending");
            }}
            className={`px-6 py-2 rounded ${
              mode === "pending"
                ? "bg-orange-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Pending + Payment
          </button>

          <button
            onClick={() => {
              setMode("all");
              loadOrders("all");
            }}
            className={`px-6 py-2 rounded ${
              mode === "all"
                ? "bg-orange-500 text-white"
                : "bg-gray-200"
            }`}
          >
            All Orders
          </button>

        </div>

        {/* 🔥 FILTERS */}
        <div className="flex justify-between mb-6">

          <div className="flex gap-4">

            <select
              onChange={e => setPaymentFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Payment</option>
              <option>Pending</option>
              <option>Paid</option>
              <option>Refunded</option>
            </select>

            <select
              onChange={e => setStatusFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Status</option>
              <option>Pending</option>
              <option>Preparing</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>

          </div>

          <input
            placeholder="Search username / address..."
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-72"
          />

        </div>

        {/* 🔥 GRID */}
        <div className="bg-white p-6 rounded shadow">

          <table className="w-full border-separate border-spacing-y-3 text-center">

            <thead>
              <tr className="bg-gray-100 h-14">
                <th className="w-[60px]">ID</th>
                <th className="w-[120px]">User</th>
                <th className="w-[220px]">Address</th>
                <th className="w-[100px]">Total</th>
                <th className="w-[140px]">Payment</th>
                <th className="w-[140px]">Status</th>
                <th className="w-[80px]">Items</th>
                <th className="w-[80px]">Delete</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map(order => (
                <tr key={order.id} className="bg-white shadow rounded h-16">

                  <td>{order.id}</td>
                  <td>{order.userName}</td>
                  <td className="truncate">{order.address}</td>
                  <td>₹{order.totalAmount}</td>

                  {/* PAYMENT */}
                  <td>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) =>
                        handleUpdate(order.id, order.status, e.target.value)
                      }
                      className="border p-2 rounded"
                    >
                      <option>Pending</option>
                      <option>Paid</option>
                      <option>Refunded</option>
                    </select>
                  </td>

                  {/* STATUS */}
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdate(order.id, e.target.value, order.paymentStatus)
                      }
                      className="border p-2 rounded"
                    >
                      <option>Pending</option>
                      <option>Preparing</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </td>

                  {/* ICONS CENTER FIX */}
                  <td>
                    <div className="flex justify-center items-center">
                      <Eye
                        className="text-blue-500 cursor-pointer"
                        onClick={() => handleView(order.id)}
                      />
                    </div>
                  </td>

                  <td>
                    <div className="flex justify-center items-center">
                      <Trash2
                        className="text-red-500 cursor-pointer"
                        onClick={() => handleDelete(order.id)}
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

      {/* 🔥 MODAL */}
      {showItems && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 text-black">

          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">

            <h2 className="text-xl font-bold mb-4 text-orange-500">
              Order Items
            </h2>

            {selectedItems.length === 0 ? (
              <p>No items found</p>
            ) : (
              selectedItems.map((item, i) => (
                <div key={i} className="flex justify-between border-b py-2 text-black">
                  <span>{item.itemName}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))
            )}

            <button
              onClick={() => setShowItems(false)}
              className="mt-4 w-full bg-orange-500 text-white py-2 rounded"
            >
              Close
            </button>

          </div>

        </div>
      )}
    </>
  );
};

export default AdminOrders;