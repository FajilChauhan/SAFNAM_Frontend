import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../Components/Navbar";
import { Trash2, Eye } from "lucide-react";

const AdminOrders = () => {

  const [orders, setOrders] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showItems, setShowItems] = useState(false);

  // Load Orders
  const loadOrders = async () => {
    const res = await api.get("/order");
    setOrders(res.data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // VIEW ITEMS
  const handleView = async (id) => {

    const res = await api.get(`/order/${id}`);

    setSelectedItems(res.data.items || []);
    setShowItems(true);
  };

  // DELETE
  const handleDelete = async (id) => {

    if (!window.confirm("Delete this order?")) return;

    await api.delete(`/order/${id}`);

    alert("Order deleted");

    loadOrders();
  };

  // UPDATE STATUS / PAYMENT
  const handleUpdate = async (id, status, paymentStatus) => {

try {

await api.put(`/order/${id}`, {
status,
paymentStatus
});

setOrders(prev =>
prev.map(o =>
o.id === id ? { ...o, status, paymentStatus } : o
)
);

} catch (err) {

console.error(err);
alert("Update failed");

}

};

  return (
    <>
      <Navbar />

      <div className="pt-24 px-10 min-h-screen bg-gray-200 text-black">
        <div className="border-b-2 border-black w-full"></div>
        <h1 className="mt-10 text-4xl font-bold text-orange-500 mb-10 text-center">
          Order Management
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8">

          <table className="w-full text-left">

            <thead className="bg-gray-100">

              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Address</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Items</th>
                <th className="p-4">Delete</th>
              </tr>

            </thead>

            <tbody>

              {orders.map(order => (

                <tr key={order.id} className="border-b">

                  <td className="p-4">{order.id}</td>

                  <td className="p-4">{order.userId}</td>

                  <td className="p-4">{order.address}</td>

                  <td className="p-4">₹{order.totalAmount}</td>

                  {/* PAYMENT DROPDOWN */}

                  <td className="p-4">

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

                  {/* STATUS DROPDOWN */}

                  <td className="p-4">

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

                  {/* VIEW ITEMS */}

                  <td className="p-4">

                    <Eye
                      className="cursor-pointer text-blue-500"
                      onClick={() => handleView(order.id)}
                    />

                  </td>

                  {/* DELETE */}

                  <td className="p-4">

                    <Trash2
                      className="cursor-pointer text-red-500"
                      onClick={() => handleDelete(order.id)}
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* ITEMS POPUP */}

      {showItems && (

<div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

<div className="bg-white p-6 rounded-xl w-96 shadow-xl text-gray-800">

<h2 className="text-xl font-bold mb-4 text-orange-500">
Order Items
</h2>

{selectedItems.length === 0 ? (
<p className="text-gray-500">No items found</p>
) : (
selectedItems.map((item, i) => (

<div
key={i}
className="flex justify-between border-b py-2"
>

<span className="font-medium">{item.itemName}</span>

<span className="text-gray-600">x{item.quantity}</span>

</div>

))
)}

<button
onClick={() => setShowItems(false)}
className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
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