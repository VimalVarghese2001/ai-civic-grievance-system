import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaBuilding, FaMapMarkerAlt } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

function OfficerDashboard(){

const [complaints,setComplaints] = useState([]);
const [statusFilter,setStatusFilter] = useState("All");

const navigate = useNavigate();

/* OFFICER INFO FROM LOCAL STORAGE */

const name = localStorage.getItem("name");
const department = localStorage.getItem("department");
const district = localStorage.getItem("district");


/* FETCH COMPLAINTS */

const fetchComplaints = async () => {

try{

const token = localStorage.getItem("token");

const res = await API.get(
"/officer/complaints",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setComplaints(res.data.complaints);

}catch(error){
console.error(error);
}

};

const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/login");
};



/* INITIAL LOAD + AUTO REFRESH */

useEffect(()=>{

fetchComplaints();

const interval = setInterval(()=>{

fetchComplaints();

},10000); // refresh every 10 seconds

return ()=>clearInterval(interval);

},[]);



/* UPDATE STATUS */

const updateStatus = async (complaintId,status) => {

try{

const token = localStorage.getItem("token");

await API.put(
`/officer/update-status/${complaintId}`,
{status},
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

fetchComplaints();

}catch(error){
console.error(error);
}

};



/* FILTER COMPLAINTS */

const filteredComplaints =
statusFilter === "All"
? complaints
: complaints.filter(c=>c.status === statusFilter);



/* STATS */

const total = complaints.length;
const assigned = complaints.filter(c=>c.status==="Assigned").length;
const progress = complaints.filter(c=>c.status==="In Progress").length;
const resolved = complaints.filter(c=>c.status==="Resolved").length;



return(

<div className="container-fluid dashboard-bg">

{/* NAVBAR */}

<nav className="navbar navbar-dark bg-dark px-4 shadow-sm d-flex justify-content-between">

<span className="navbar-brand fw-bold">AI Grievance System</span>

<div className="d-flex align-items-center text-white">

{/* Notification Bell */}

<div className="position-relative me-4">

<FaBell size={20} />

<span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
{assigned}
</span>

</div>


{/* Officer Profile */}

<div className="d-flex align-items-center me-3">

<FaUserCircle size={34} className="me-2"/>

<div>

<div style={{fontWeight:"bold"}}>
{name}
</div>

<small>
<FaBuilding className="me-1"/>
{department} |
<FaMapMarkerAlt className="ms-1 me-1"/>
{district}
</small>

</div>

</div>


{/* Logout */}

<button onClick={handleLogout} className="btn btn-danger btn-sm">
<FiLogOut className="me-1"/>
Logout
</button>

</div>

</nav>



<div className="row">

{/* SIDEBAR */}

<div className="col-md-2 sidebar p-4">

<h5 className="text-white mb-4">Officer Panel</h5>

<ul className="nav flex-column">

<li className="nav-item mb-3">
<span
className={`sidebar-link ${statusFilter==="All" ? "active-menu":""}`}
onClick={()=>setStatusFilter("All")}
>
📊 Dashboard
</span>
</li>

<li className="nav-item mb-3">
<span
className={`sidebar-link ${statusFilter==="Assigned" ? "active-menu":""}`}
onClick={()=>setStatusFilter("Assigned")}
>
📋 Assigned
</span>
</li>

<li className="nav-item mb-3">
<span
className={`sidebar-link ${statusFilter==="In Progress" ? "active-menu":""}`}
onClick={()=>setStatusFilter("In Progress")}
>
⏳ In Progress
</span>
</li>

<li className="nav-item mb-3">
<span
className={`sidebar-link ${statusFilter==="Resolved" ? "active-menu":""}`}
onClick={()=>setStatusFilter("Resolved")}
>
✅ Resolved
</span>
</li>

</ul>

</div>



{/* MAIN CONTENT */}

<div className="col-md-10 p-4">

<h2 className="mb-4 fw-bold">Officer Dashboard</h2>



{/* STATS CARDS */}

<div className="row mb-4">

<div className="col-md-3 mb-3">

<div className="card dashboard-card shadow-sm text-center">

<div className="card-body">

<h6>Total Complaints</h6>
<h3>{total}</h3>

</div>

</div>

</div>



<div className="col-md-3 mb-3">

<div className="card dashboard-card bg-warning text-center">

<div className="card-body">

<h6>Assigned</h6>
<h3>{assigned}</h3>

</div>

</div>

</div>



<div className="col-md-3 mb-3">

<div className="card dashboard-card bg-info text-center">

<div className="card-body">

<h6>In Progress</h6>
<h3>{progress}</h3>

</div>

</div>

</div>



<div className="col-md-3 mb-3">

<div className="card dashboard-card bg-success text-center">

<div className="card-body">

<h6>Resolved</h6>
<h3>{resolved}</h3>

</div>

</div>

</div>

</div>



{/* COMPLAINT CARDS */}

<div className="row">

{filteredComplaints.map((c)=>{

const priorityColor =
c.final_priority >= 70 ? "danger" :
c.final_priority >= 40 ? "warning" :
"success";

const statusColor =
c.status === "Assigned" ? "warning" :
c.status === "In Progress" ? "info" :
"success";


return(

<div className="col-md-6 col-lg-4 mb-4" key={c._id}>

<div className="card dashboard-card shadow-sm h-100">

<div className="card-body">

<h6 className="card-title mb-3">
{c.complaint_text}
</h6>

<p>
<strong>District:</strong> {c.district}
</p>

<p>

<strong>Priority:</strong>

<span className={`badge bg-${priorityColor} ms-2`}>
{c.final_priority?.toFixed(2)}
</span>

</p>


<p>

<strong>Status:</strong>

<span className={`badge bg-${statusColor} ms-2`}>
{c.status}
</span>

</p>


<div className="mt-3 d-flex flex-wrap gap-2">

{c.status !== "Resolved" && (

<>

<button
className="btn btn-info btn-sm"
onClick={()=>updateStatus(c._id,"In Progress")}
>
Start Work
</button>

<button
className="btn btn-success btn-sm"
onClick={()=>updateStatus(c._id,"Resolved")}
>
Resolve
</button>

</>

)}

<button
className="btn btn-primary btn-sm"
onClick={()=>navigate(`/officer/complaint/${c.complaint_id}`)}
>
View Details
</button>

</div>

</div>

</div>

</div>

);

})}

</div>


</div>

</div>

</div>

);

}

export default OfficerDashboard;