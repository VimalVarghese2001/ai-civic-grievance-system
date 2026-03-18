import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

function AdminComplaints(){

const [complaints,setComplaints] = useState([]);
const [searchParams] = useSearchParams();
const [page,setPage] = useState(1);

const [district,setDistrict] = useState("");
const [localBodyType,setLocalBodyType] = useState("");
const [localBody,setLocalBody] = useState("");
const [ward,setWard] = useState("");

const [districts,setDistricts] = useState([]);
const [localBodies,setLocalBodies] = useState([]);

const [status,setStatus] = useState(searchParams.get("status") || "");
const [totalPages,setTotalPages] = useState(1);


useEffect(()=>{
fetchDistricts();
},[]);

useEffect(()=>{
fetchComplaints();
},[district,localBody,ward,status,page]);


const fetchDistricts = async () => {

try{

const res = await API.get("/locations/districts");

setDistricts(res.data);

}catch(error){
console.error(error);
}

};


const fetchLocalBodies = async (districtValue, typeValue) => {

try{

const res = await API.get(
`/locations/local-bodies/${districtValue}/${typeValue}`
);

setLocalBodies(res.data);

}catch(error){
console.error(error);
}

};

const fetchComplaints = async () => {

try{

const token = localStorage.getItem("token");

const res = await API.get(
`/admin/complaints?district=${district}&local_body=${localBody}&ward=${ward}&status=${status}&page=${page}`,
{
headers:{ Authorization:`Bearer ${token}` }
}
);

setComplaints(res.data.complaints);
setTotalPages(res.data.total_pages);

}catch(error){
console.error(error);
}

};

return(

<div style={{padding:"40px"}}>

<h1>All Complaints</h1>
<div style={{display:"flex",gap:"20px",marginTop:"20px"}}>

<select
value={district}
onChange={(e)=>{

const d = e.target.value;
setDistrict(d);
setPage(1);

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


<select
value={localBodyType}
onChange={(e)=>{

const type = e.target.value;

setLocalBodyType(type);

if(district && type){
fetchLocalBodies(district,type);
}

}}
>

<option value="Corporation">Corporation</option>
<option value="Municipality">Municipality</option>
<option value="Panchayat">Panchayat</option>

</select>


<select
value={localBody}
onChange={(e)=>{
setLocalBody(e.target.value);
setPage(1);
}}
>

<option value="">Select Local Body</option>

{localBodies.map((body)=>(
<option key={body} value={body}>
{body}
</option>
))}

</select>


<input
value={ward}
placeholder="Ward Number"
style={{width:"120px"}}
onChange={(e)=>{
setWard(e.target.value);
setPage(1);
}}
/>


<select
value={status}
onChange={(e)=>{
setStatus(e.target.value);
setPage(1);
}}
>

<option value="">All Status</option>
<option value="Assigned">Assigned</option>
<option value="In Progress">In Progress</option>
<option value="Resolved">Resolved</option>

</select>


</div>
<table border="1" cellPadding="10" style={{width:"100%",marginTop:"20px"}}>

<thead>
<tr>
<th>ID</th>
<th>District</th>
<th>Local Body</th>
<th>Ward</th>
<th>Complaint</th>
<th>Status</th>
</tr>
</thead>

<tbody>

{complaints.length === 0 ? (
<tr>
<td colSpan="6">No complaints found</td>
</tr>
) : (

complaints.map((c)=>(
<tr key={c._id}>

<td>
<Link to={`/admin/complaint/${c._id}`}>
{c._id.slice(-6)}
</Link>
</td>

<td>{c.district}</td>
<td>{c.local_body}</td>
<td>{c.ward || "-"}</td>
<td>{c.complaint_text}</td>
<td>{c.overall_status}</td>

</tr>
))
)}
</tbody>

</table>
<div style={{marginTop:"20px"}}>

<button
disabled={page === 1}
onClick={()=>setPage(page-1)}
>
Previous
</button>

<span style={{margin:"0 10px"}}>
Page {page} of {totalPages}
</span>

<button
disabled={page === totalPages}
onClick={()=>setPage(page+1)}
>
Next
</button>

</div>

</div>

);

}

export default AdminComplaints;