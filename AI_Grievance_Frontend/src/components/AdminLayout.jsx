import { useNavigate } from "react-router-dom";

function AdminLayout({ children }) {

const navigate = useNavigate();

const logout = () => {
localStorage.clear();
window.location.href = "/login";
};

return (

<div style={{display:"flex",height:"100vh"}}>

{/* Sidebar */}

<div style={{
width:"230px",
background:"#1e293b",
color:"white",
padding:"20px"
}}>

<h2>Admin Panel</h2>

<div style={{marginTop:"30px",display:"flex",flexDirection:"column",gap:"15px"}}>

<button onClick={()=>navigate("/admin/dashboard")}>Dashboard</button>

<button onClick={()=>navigate("/admin/map")}>Complaint Map</button>

<button onClick={()=>navigate("/admin/complaints")}>Complaints</button>

<button onClick={()=>navigate("/admin/officers")}>Officers</button>

<button onClick={logout} style={{marginTop:"20px",background:"#ef4444",color:"white"}}>Logout</button>

</div>

</div>

{/* Main Content */}

<div style={{
flex:1,
overflowY:"auto",
padding:"30px",
background:"#f1f5f9"
}}>

{children}

</div>

</div>

);

}

export default AdminLayout;