import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './home/HomePage'
import SignUp from './auth/SignUp'
import SignIn from './auth/SignIn'
import CategoryDetailPage from './category/CategoryDetailPage'
import ServiceDetailPage from './service/ServiceDetailPage'
import { useTheme } from './hooks/useTheme'

function App() {
  useTheme("system")

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServiceDetailPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/categories/:slug" element={<CategoryDetailPage />} />
        <Route path="/signin" element={<SignIn />  } />
        <Route path='/signup' element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
