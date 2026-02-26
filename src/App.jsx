
import { BrowserRouter, Route, Routes, Navigate, Link } from 'react-router-dom'
import './App.css'
import HomePage from './home/HomePage'
import SignUp from './auth/SignUp'
import SignIn from './auth/SignIn'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />  } />
        <Route path='/signup' element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
