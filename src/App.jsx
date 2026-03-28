import React from 'react';
import Home from './pages/Home';
import BookTable from './pages/BookTable';
import BookOrder from './pages/BookOrder';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import About from './pages/About';
import BookRoom from './pages/BookRoom';
import PhotoRestro from './pages/PhotoRestro';
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminRoomBooking from "./pages/admin/AdminRoomBooking";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminTables from "./pages/admin/AdminTables";
import AdminTableBooking from "./pages/admin/AdminTableBooking";


const App = () => {
  return (
    <div>
      <Toaster position="top-right" />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/booktable' element={<BookTable/>}/>
        <Route path='/bookorder' element={<BookOrder/>}/>
        <Route path='/bookroom' element={<BookRoom/>}/>
        <Route path='/photos' element={<PhotoRestro/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/admin/rooms" element={<AdminRooms />} />
        <Route path="/admin/roombooking" element={<AdminRoomBooking />} />
        <Route path="/admin/order" element={<AdminOrders />} />
        <Route path="/admin/table" element={<AdminTables />} />
        <Route path="/admin/booktable" element={<AdminTableBooking />} />
      </Routes>
    </div>
  )
}

export default App
