import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './features/auth/Login'
import CreateAccount from './features/auth/CreateAccount'
import ForgotPassword from './features/auth/ForgotPassword'
import Customers from './features/customers/Customers'
import Dashboard from './features/dashboard/Dashboard'
import Drivers from './features/drivers/Drivers'
import FareConfiguration from './features/fares/FareConfiguration'
import Orders from './features/orders/Orders'
import ServiceAreas from './features/areas/ServiceAreas'
import VehicleClasses from './features/vehicles/VehicleClasses'
import Managers from './features/managers/Managers'
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
        <Route path="/customers" element={<Customers />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/vehicle-classes" element={<VehicleClasses />} />
        <Route path="/fare-configuration" element={<FareConfiguration />} />
        <Route path="/service-areas" element={<ServiceAreas />} />
        <Route path="/managers" element={<Managers />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
