import { useState } from "react";
import CitizenLayout from "../../components/CitizenLayout";
import API from "../../api/axios";

function Profile(){

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [successMessage,setSuccessMessage] = useState("");

const updateProfile = async () => {

try{

const token = localStorage.getItem("token");

await API.put(
"/auth/update-profile",
{
name,
email
},
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setSuccessMessage("Profile updated successfully!");

setTimeout(()=>{
setSuccessMessage("");
},3000);

}catch(error){

console.error(error);
alert("Failed to update profile");

}

};

return(

<CitizenLayout>

<div className="container mt-4">

<div className="row justify-content-center">

<div className="col-md-6">

<div className="card shadow-sm">

<div className="card-body">

<h3 className="mb-4">User Profile</h3>

{successMessage && (

<div className="alert alert-success">
{successMessage}
</div>

)}

<div className="mb-3">

<label className="form-label">Name</label>

<input
className="form-control"
placeholder="Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

</div>

<div className="mb-3">

<label className="form-label">Email</label>

<input
className="form-control"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

</div>

<button
className="btn btn-primary"
onClick={updateProfile}
>
Update Profile
</button>

</div>

</div>

</div>

</div>

</div>

</CitizenLayout>

);

}

export default Profile;