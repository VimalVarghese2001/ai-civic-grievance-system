import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import CitizenLayout from "../../components/CitizenLayout";

function CreateComplaint(){

const [district,setDistrict] = useState("");
const [localBodyType,setLocalBodyType] = useState("")
const [localBody,setLocalBody] = useState("")
const [ward,setWard] = useState("")
const [address,setAddress] = useState("")
const [description,setDescription] = useState("");
const [image,setImage] = useState(null);

const [districts,setDistricts] = useState([]);
const [localBodies,setLocalBodies] = useState([]);
const [fileKey,setFileKey] = useState(Date.now());

const [successMessage, setSuccessMessage] = useState("");
const [complaintId, setComplaintId] = useState("");

const navigate = useNavigate();

useEffect(() => {
  fetchDistricts();
}, []);

const fetchDistricts = async () => {
  try {
    const res = await API.get("/locations/districts");
    setDistricts(res.data);
  } catch (error) {
    console.error(error);
  }
};

const fetchLocalBodies = async (districtValue, bodyTypeValue) => {

try{

const res = await API.get(
`/locations/local-bodies/${districtValue}/${bodyTypeValue}`
);

setLocalBodies(res.data);

}catch(error){
console.error(error);
}

};


const submitComplaint = async () => {

try{

const token = localStorage.getItem("token");

const formData = new FormData();

formData.append("district",district);
formData.append("complaint_text",description);

formData.append("local_body_type", localBodyType);
formData.append("local_body", localBody);
formData.append("ward", ward);
formData.append("address", address);

if(image){
formData.append("image",image);
}

const res = await API.post(
"/submit-complaint",
formData,
{
headers:{
Authorization:`Bearer ${token}`,
"Content-Type":"multipart/form-data"
}
}
);

setSuccessMessage("Complaint Submitted Successfully!");
setComplaintId(res.data.complaint_id);
setDistrict("");
setLocalBodyType("");
setLocalBody("");
setWard("");
setAddress("");
setDescription("");
setImage(null);
setLocalBodies([]);
setFileKey(Date.now());

}catch(error){

console.error(error);
alert("Error submitting complaint");

}

};

return(

<CitizenLayout>

<div className="container mt-4">

<div className="card shadow-sm">
<div className="card-body">

{!successMessage && <h3 className="mb-4">Create Complaint</h3>}

{successMessage && (

<div className="alert alert-success">

<h5>
✔ {successMessage}
</h5>

<p>
Complaint ID: <strong>{complaintId}</strong>
</p>

<p>
Track your complaint in <strong>My Complaints</strong>
</p>

<button
className="btn btn-success"
onClick={()=>navigate("/citizen/my-complaints")}
>
View My Complaints
</button>

</div>

)}

{!successMessage && (
<>

<div className="row g-3 mb-3">

<div className="col-md-3">
<select
className="form-select"
value={district}
onChange={(e)=>{

const d = e.target.value;
setDistrict(d);

if(d && localBodyType){
fetchLocalBodies(d,localBodyType);
}

}}
>
<option value="">Select District</option>

{districts.map((d)=>(
<option key={d} value={d}>
{d}
</option>
))}
</select>
</div>

<div className="col-md-3">
<select
className="form-select"
value={localBodyType}
onChange={(e)=>{

const type = e.target.value;
setLocalBodyType(type);

if(district && type){
fetchLocalBodies(district,type);
}

}}
>
<option>Select Local Body</option>
<option>Corporation</option>
<option>Municipality</option>
<option>Panchayat</option>
</select>
</div>

<div className="col-md-3">
<select
className="form-select"
value={localBody}
onChange={(e)=>setLocalBody(e.target.value)}
>

<option value="">Select Local Body</option>

{localBodies.map((body)=>(
<option key={body} value={body}>
{body}
</option>
))}

</select>
</div>

<div className="col-md-3">
<input
className="form-control"
placeholder="Ward Number"
value={ward}
onChange={(e)=>setWard(e.target.value)}
/>
</div>

</div>


<div className="mb-3">

<input
className="form-control"
placeholder="Landmark / Address"
value={address}
onChange={(e)=>setAddress(e.target.value)}
/>

</div>


<div className="mb-3">

<textarea
className="form-control"
rows="4"
placeholder="Describe your problem"
value={description}
onChange={(e)=>setDescription(e.target.value)}
/>

</div>


<div className="mb-3">

<input
key={fileKey}
type="file"
className="form-control"
onChange={(e)=>setImage(e.target.files[0])}
/>

</div>


<button
className="btn btn-primary"
onClick={submitComplaint}
>
Submit Complaint
</button>

</>
)}

</div>
</div>
</div>

</CitizenLayout>

);

}

export default CreateComplaint;