import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../Components/Navbar";
import { Pencil, Trash2 } from "lucide-react";

const AdminTables = () => {

  const [tables,setTables] = useState([]);
  const [editingId,setEditingId] = useState(null);

  const [form,setForm] = useState({
    tableNo:"",
    floor:0
  });

  const loadTables = async () => {
    const res = await api.get("/RestaurantTables");
    setTables(res.data);
  };

  useEffect(()=>{
    loadTables();
  },[]);

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();

    try{

      if(editingId){

        await api.put(`/RestaurantTables/${editingId}`,form);
        alert("Table updated");

      }else{

        await api.post("/RestaurantTables",form);
        alert("Table created");

      }

      setForm({tableNo:"",floor:0});
      setEditingId(null);
      loadTables();

    }catch(err){

      console.error(err);
      alert("Operation failed");

    }

  };

  const handleEdit = (t)=>{
    setForm({
      tableNo:t.tableNo,
      floor:t.floor
    });

    setEditingId(t.id);
  };

  const handleDelete = async (id)=>{

    if(!window.confirm("Delete this table?")) return;

    await api.delete(`/RestaurantTables/${id}`);

    alert("Deleted");

    loadTables();
  };

  return (
    <>
      <Navbar/>

      <div className="pt-24 px-10 min-h-screen bg-gray-200 text-black">
      <div className="border-b-2 border-black w-full"></div>

        <h1 className="mt-10 text-4xl font-bold text-orange-500 mb-10 text-center">
          Table Management
        </h1>

        {/* FORM */}

        <div className="bg-white p-6 rounded-xl shadow mb-10">

          <form onSubmit={handleSubmit} className="flex gap-4">

            <input
              type="number"
              name="tableNo"
              placeholder="Table Number"
              value={form.tableNo}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <select
              name="floor"
              value={form.floor}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value={0}>Ground</option>
              <option value={1}>1st Floor</option>
              <option value={2}>2nd Floor</option>
              <option value={3}>Rooftop</option>
            </select>

            <button className="bg-orange-500 text-white px-6 py-2 rounded">
              {editingId ? "Update" : "Create"}
            </button>

          </form>

        </div>

        {/* TABLE GRID */}

        <div className="bg-white rounded-xl shadow p-6">

          <table className="w-full text-left">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Table No</th>
                <th className="p-4">Floor</th>
                <th className="p-4">Edit</th>
                <th className="p-4">Delete</th>
              </tr>
            </thead>

            <tbody>

              {tables.map(t=>(
                <tr key={t.id} className="border-b">

                  <td className="p-4">{t.id}</td>

                  <td className="p-4">{t.tableNo}</td>

                  <td className="p-4">{t.floor}</td>

                  <td className="p-4">

                    <Pencil
                      className="text-blue-500 cursor-pointer"
                      onClick={()=>handleEdit(t)}
                    />

                  </td>

                  <td className="p-4">

                    <Trash2
                      className="text-red-500 cursor-pointer"
                      onClick={()=>handleDelete(t.id)}
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

export default AdminTables;