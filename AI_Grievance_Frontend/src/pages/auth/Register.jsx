import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

function Register() {

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleRegister = async () => {

    try {

      const response = await API.post("/auth/register",{
        name,
        email,
        password,
        role: "citizen"
      });

      alert("Registration successful");

      navigate("/login");

    } catch(error){

      alert("Registration failed");

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
style={{width:"200px"}}
alt="civic"
/>

<h1 className="mt-4 fw-bold">Join Us</h1>

<p className="mt-3 text-center" style={{maxWidth:"420px"}}>

Create your citizen account and start reporting public issues 
in your area using our AI powered civic grievance system.

</p>

<div className="mt-4">

<p>📍 Report Civic Issues</p>
<p>🤖 AI Complaint Categorization</p>
<p>📊 Track Complaint Status</p>

</div>

</div>


{/* RIGHT SIDE REGISTER */}

<div className="col-md-5 d-flex justify-content-center align-items-center bg-light">

<div className="card shadow p-4" style={{width:"360px",borderRadius:"12px"}}>

<h3 className="text-center mb-4">Create your account</h3>


{/* NAME */}

<div className="input-group mb-3">

<span className="input-group-text">
<FaUser/>
</span>

<input
type="text"
className="form-control"
placeholder="Full Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

</div>


{/* EMAIL */}

<div className="input-group mb-3">

<span className="input-group-text">
<FaEnvelope/>
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
onClick={handleRegister}
>
Register
</button>


{/* BACK TO LOGIN */}

<p className="text-center mt-3">

Already have an account?

<span
onClick={()=>navigate("/login")}
style={{color:"#1e6ae1",cursor:"pointer",marginLeft:"5px"}}
>

Login

</span>

</p>

</div>

</div>

</div>

</div>

  );
}

export default Register;