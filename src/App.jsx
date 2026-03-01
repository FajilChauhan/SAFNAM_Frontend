import React from 'react';
import Home from './pages/Home';
import BookTable from './pages/BookTable';
import BookOrder from './pages/BookOrder';
import { Route, Routes } from 'react-router-dom';
import About from './pages/About';
import BookRoom from './pages/BookRoom';
import PhotoRestro from './pages/PhotoRestro';
import Login from "./pages/Login";
import Register from "./pages/Register";


const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/booktable' element={<BookTable/>}/>
        <Route path='/bookorder' element={<BookOrder/>}/>
        <Route path='/bookroom' element={<BookRoom/>}/>
        <Route path='/photos' element={<PhotoRestro/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}

export default App
