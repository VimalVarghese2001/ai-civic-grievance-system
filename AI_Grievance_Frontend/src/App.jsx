import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import CitizenDashboard from "./pages/citizen/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import OfficerDashboard from "./pages/officer/Dashboard";
import CreateComplaint from "./pages/citizen/CreateComplaint";
import ComplaintTimeline from "./pages/citizen/ComplaintTimeline";
import ComplaintMap from "./pages/admin/ComplaintMap";
import MyComplaints from "./pages/citizen/MyComplaints";
import AdminComplaints from "./pages/admin/AdminComplaints";
import ComplaintDetails from "./pages/admin/ComplaintDetails";
import ManageOfficers from "./pages/admin/ManageOfficers";
import Profile from "./pages/citizen/Profile";
import ManageDepartments from "./pages/admin/ManageDepartments";

function App() {

  return (

    <Router>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<Register />} />

        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/citizen/create-complaint" element={<CreateComplaint />} />
        <Route path="/complaint/:id" element={<ComplaintTimeline />} />
        <Route path="/admin/map" element={<ComplaintMap />} />
        <Route path="/citizen/my-complaints" element={<MyComplaints />} />
        <Route path="/admin/complaints" element={<AdminComplaints/>}/>
        <Route path="/admin/complaint/:id" element={<ComplaintDetails/>}/>
        <Route path="/admin/officers" element={<ManageOfficers/>}/>
        <Route path="/citizen/profile" element={<Profile/>}/>
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/admin/departments" element={<ManageDepartments />} />
        <Route path="/officer/complaint/:id" element={<ComplaintDetails />} />
        

      </Routes>

    </Router>

  );
}

export default App;