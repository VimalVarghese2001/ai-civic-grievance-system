import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

function ManageOfficers(){

const [officers,setOfficers] = useState([]);

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [district,setDistrict] = useState("");
const [department,setDepartment] = useState("");

const [filterDistrict,setFilterDistrict] = useState("");
const [filterDepartment,setFilterDepartment] = useState("");

const [districts,setDistricts] = useState([]);
const [departments,setDepartments] = useState([]);

const [editingOfficer,setEditingOfficer] = useState(null);


useEffect(()=>{
fetchOfficers();
fetchDistricts();
fetchDepartments();
},[]);

const fetchDistricts = async () => {

try{

const res = await API.get("/locations/districts");

setDistricts(res.data);

}catch(error){
console.error(error);
}

};

const fetchDepartments = async () => {

try{

const token = localStorage.getItem("token");

const res = await API.get(
"/admin/departments",
{
headers:{Authorization:`Bearer ${token}`}
}
);

setDepartments(res.data.departments);

}catch(error){
console.error(error);
}

};

const fetchOfficers = async () => {

const token = localStorage.getItem("token");

const res = await API.get(
"/admin/officers",
{
headers:{Authorization:`Bearer ${token}`}
}
);

setOfficers(res.data.officers);

};

const createOfficer = async () => {

const token = localStorage.getItem("token");

await API.post(
"/admin/create-officer",
{
name,
email,
password,
district,
department
},
{
headers:{Authorization:`Bearer ${token}`}
}
);

clearForm();
fetchOfficers();

};

const updateOfficer = async () => {

const token = localStorage.getItem("token");

await API.put(
`/admin/officer/${editingOfficer}`,
{
name,
email,
district,
department
},
{
headers:{Authorization:`Bearer ${token}`}
}
);

setEditingOfficer(null);
clearForm();
fetchOfficers();

};

const deleteOfficer = async (id) => {

const token = localStorage.getItem("token");

await API.delete(
`/admin/officer/${id}`,
{
headers:{Authorization:`Bearer ${token}`}
}
);

fetchOfficers();

};

const clearForm = () => {
setName("");
setEmail("");
setPassword("");
setDistrict("");
setDepartment("");
};

return(

<AdminLayout>

<div style={{padding:"40px"}}>

<h1>Manage Officers</h1>

{/* Create / Edit Officer */}

<h3>{editingOfficer ? "Edit Officer" : "Create Officer"}</h3>

<input
placeholder="Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

{!editingOfficer && (
<input
placeholder="Password"
type="password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>
)}

<select
value={district}
onChange={(e)=>setDistrict(e.target.value)}
>

<option value="">Select District</option>

{districts.map((d)=>(
<option key={d} value={d}>
{d}
</option>
))}

</select>

<select
value={department}
onChange={(e)=>setDepartment(e.target.value)}
>

<option value="">Select Department</option>

{departments.map((d)=>(
<option key={d} value={d}>
{d}
</option>
))}

</select>

<button
onClick={editingOfficer ? updateOfficer : createOfficer}
style={{
padding:"8px 15px",
background:"#28a745",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginLeft:"10px"
}}
>
{editingOfficer ? "Update Officer" : "Create Officer"}
</button>



{/* Filters */}

<h4 style={{marginTop:"30px"}}>Filter Officers</h4>

<select
value={filterDistrict}
onChange={(e)=>setFilterDistrict(e.target.value)}
>

<option value="">All Districts</option>

{districts.map((d)=>(
<option key={d} value={d}>
{d}
</option>
))}

</select>

<select
value={filterDepartment}
onChange={(e)=>setFilterDepartment(e.target.value)}
>

<option value="">All Departments</option>

{departments.map((d)=>(
<option key={d} value={d}>
{d}
</option>
))}

</select>



{/* Officer Table */}

<table style={{width:"100%",borderCollapse:"collapse",marginTop:"20px",background:"white"}}>

<thead>
<tr>
<th style={tableHeader}>Name</th>
<th style={tableHeader}>Email</th>
<th style={tableHeader}>District</th>
<th style={tableHeader}>Department</th>
<th style={tableHeader}>Action</th>
</tr>
</thead>

<tbody>

{officers
.filter(o =>
(!filterDistrict || o.district === filterDistrict) &&
(!filterDepartment || o.department === filterDepartment)
)
.map(o=>(
<tr key={o._id} style={rowStyle}>

<td style={tableCell}>{o.name}</td>
<td style={tableCell}>{o.email}</td>
<td style={tableCell}>{o.district}</td>
<td style={tableCell}>{o.department}</td>

<td style={tableCell}>

<button
onClick={()=>{
setEditingOfficer(o._id);
setName(o.name);
setEmail(o.email);
setDistrict(o.district);
setDepartment(o.department);
}}
style={{
padding:"5px 12px",
background:"#007bff",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
Edit
</button>

<button
onClick={()=>deleteOfficer(o._id)}
style={{
marginLeft:"10px",
padding:"5px 12px",
background:"#dc3545",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
Delete
</button>

</td>

</tr>
))}

</tbody>

</table>

</div>

</AdminLayout>

);

}
const tableHeader = {
padding:"12px",
textAlign:"left",
borderBottom:"2px solid #ddd",
background:"#f8fafc"
};

const tableCell = {
padding:"12px",
borderBottom:"1px solid #ddd"
};

const rowStyle = {
transition:"0.2s"
};
export default ManageOfficers;