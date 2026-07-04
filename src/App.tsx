import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './features/auth/Login'
import CreateAccount from './features/auth/CreateAccount'
import ForgotPassword from './features/auth/ForgotPassword'
import Dashboard from './features/dashboard/Dashboard'
import Orders from './features/orders/Orders'
import './styles/tailwind.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
