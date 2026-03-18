import { useNavigate } from "react-router-dom";

function CitizenLayout({ children }) {

const navigate = useNavigate();
const user = JSON.parse(localStorage.getItem("user")) || {};

const logout = () => {
localStorage.clear();
window.location.href="/login";
};

return(

<div>

{/* NAVBAR */}

<div style={{
position:"fixed",
top:0,
left:0,
right:0,
height:"60px",
display:"flex",
justifyContent:"space-between",
alignItems:"center",
background:"#1e293b",
color:"white",
padding:"0 30px",
zIndex:1000
}}>

<h2>Citizen Dashboard</h2>

<div>
🔔 Welcome {user.name || "User"}
</div>

</div>


{/* SIDEBAR */}

<div style={{
position:"fixed",
top:"60px",
left:0,
width:"220px",
height:"calc(100vh - 60px)",
background:"#1e293b",
display:"flex",
flexDirection:"column",
padding:"25px 20px",
gap:"15px"
}}>

<button style={{width:"100%"}} onClick={()=>navigate("/citizen/dashboard")}>
Home
</button>

<button style={{width:"100%"}} onClick={()=>navigate("/citizen/create-complaint")}>
Create Complaint
</button>

<button style={{width:"100%"}} onClick={()=>navigate("/citizen/my-complaints")}>
My Complaints
</button>

<button style={{width:"100%"}} onClick={()=>navigate("/citizen/profile")}>
Profile
</button>

<div style={{marginTop:"auto"}}>

<button
onClick={logout}
style={{
width:"100%",
background:"#ef4444",
color:"white"
}}
>
Logout
</button>

</div>

</div>


{/* PAGE CONTENT */}

<div style={{
marginTop:"60px",
marginLeft:"220px",
padding:"40px",
minHeight:"100vh",
background:"#f3f4f6"
}}>

{children}

</div>

</div>

);

}

export default CitizenLayout;