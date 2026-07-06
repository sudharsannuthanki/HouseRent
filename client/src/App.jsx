import { BrowserRouter, Routes, Route } from "react-router-dom";
import GyroBackground from "./components/GyroBackground";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./modules/common/Home";
import Login from "./modules/common/Login";
import Register from "./modules/common/Register";
import ForgotPassword from "./modules/common/ForgotPassword";

import PropertyDetails from "./modules/user/PropertyDetails";
import ChatRoom from "./modules/chat/ChatRoom";

import RenterHome from "./modules/user/renter/RenterHome";
import RenterAllProperties from "./modules/user/renter/AllProperties";

import OwnerHome from "./modules/user/owner/OwnerHome";
import AddProperty from "./modules/user/owner/AddProperty";
import OwnerAllProperties from "./modules/user/owner/AllProperties";
import OwnerAllBookings from "./modules/user/owner/AllBookings";
import EditProperty from "./modules/user/owner/EditProperty";

import AdminHome from "./modules/admin/AdminHome";
import AdminAllUsers from "./modules/admin/AllUsers";
import AdminAllProperty from "./modules/admin/AllProperty";
import AdminAllBookings from "./modules/admin/AllBookings";

function App() {
  return (
    <BrowserRouter>
      <GyroBackground />
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />

        {/* Chat - available to any logged-in participant of the booking (checked server-side) */}
        <Route path="/chat/:bookingId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />

        {/* Renter */}
        <Route path="/renter" element={<ProtectedRoute allowedRoles={["user"]}><RenterHome /></ProtectedRoute>} />
        <Route path="/renter/properties" element={<RenterAllProperties />} />

        {/* Owner */}
        <Route path="/owner" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerHome /></ProtectedRoute>} />
        <Route path="/owner/properties" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerAllProperties /></ProtectedRoute>} />
        <Route path="/owner/properties/new" element={<ProtectedRoute allowedRoles={["owner"]}><AddProperty /></ProtectedRoute>} />
        <Route path="/owner/properties/:id/edit" element={<ProtectedRoute allowedRoles={["owner"]}><EditProperty /></ProtectedRoute>} />
        <Route path="/owner/bookings" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerAllBookings /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminHome /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAllUsers /></ProtectedRoute>} />
        <Route path="/admin/properties" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAllProperty /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAllBookings /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
