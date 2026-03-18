import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

function Login() {

  const navigate = useNavigate();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async () => {

  // FRONTEND VALIDATION
  if(!email || !password){
    alert("Please enter email and password");
    return;
  }

  try {

    const response = await API.post("/auth/login",{
      email,
      password
    });

    const token = response.data.access_token;
    const role = response.data.role;

    if(!token){
      alert("Invalid credentials");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    if(response.data.user){
      localStorage.setItem("name", response.data.user.name);
      localStorage.setItem("department", response.data.user.department);
      localStorage.setItem("district", response.data.user.district);
      localStorage.setItem("user", JSON.stringify(response.data.user))
    }

    if(role === "citizen"){
      navigate("/citizen/dashboard");
    }
    else if(role === "admin"){
      navigate("/admin/dashboard");
    }
    else if(role === "officer"){
      navigate("/officer/dashboard");
    }

  } catch(error){

    alert("Invalid credentials");

  }

};

  return (

<div className="container-fluid vh-100">

<div className="row h-100">

{/* LEFT SIDE */}

<div 
className="col-md-7 d-flex flex-column justify-content-center align-items-center text-white"
style={{
background:"linear-gradient(135deg,#1e3c72,#2a5298)"
}}
>

<img
src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
alt="civic"
style={{width:"200px"}}
/>

<h1 className="mt-4 fw-bold">
AI Smart Civic Grievance System
</h1>

<p className="mt-3 text-center" style={{maxWidth:"420px"}}>

Report public issues, track complaints and help improve 
city services with our AI powered grievance platform.

</p>

<div className="mt-4">

<p>📍 Report Civic Issues</p>
<p>🤖 AI Complaint Categorization</p>
<p>📊 Track Complaint Status</p>

</div>

</div>


{/* RIGHT SIDE LOGIN */}

<div className="col-md-5 d-flex justify-content-center align-items-center bg-light">

<div className="card shadow p-4" style={{width:"360px",borderRadius:"12px"}}>

<h3 className="text-center mb-4">Login to your account</h3>


{/* EMAIL */}

<div className="input-group mb-3">

<span className="input-group-text">
<FaUser/>
</span>

<input
type="email"
className="form-control"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

</div>


{/* PASSWORD */}

<div className="input-group mb-3">

<span className="input-group-text">
<FaLock/>
</span>

<input
type="password"
className="form-control"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

</div>


<button 
className="btn btn-primary w-100"
onClick={handleLogin}
>
Login
</button>


<p style={{ marginTop: "15px", textAlign: "center" }}>
Don't have an account? 
<span 
onClick={() => navigate("/register")} 
style={{ color: "#1e6ae1", cursor: "pointer", marginLeft: "5px" }}
>
Create Account
</span>
</p>

</div>

</div>

</div>

</div>

  );
}

export default Login;