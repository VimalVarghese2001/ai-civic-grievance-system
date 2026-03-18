import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

function ManageDepartments(){

const [departments,setDepartments] = useState([]);
const [departmentName,setDepartmentName] = useState("");
const [category,setCategory] = useState("");

useEffect(()=>{
fetchDepartments();
},[]);


const fetchDepartments = async () => {

try{

const token = localStorage.getItem("token");

const res = await API.get(
"/admin/departments",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

setDepartments(res.data.departments);

}catch(error){
console.error(error);
}

};


const addDepartment = async () => {

try{

const token = localStorage.getItem("token");

await API.post(
"/admin/departments",
{
department_name: departmentName,
category: category
},
{
headers:{ Authorization:`Bearer ${token}` }
}
);

setDepartmentName("");
setCategory("");

fetchDepartments();

}catch(error){
console.error(error);
}

};


const deleteDepartment = async (dept) => {

try{

const token = localStorage.getItem("token");

await API.delete(
`/admin/departments/${dept}`,
{
headers:{ Authorization:`Bearer ${token}` }
}
);

fetchDepartments();

}catch(error){
console.error(error);
}

};


return(

<AdminLayout>

<div style={{padding:"40px"}}>

<h1>Manage Departments</h1>


{/* Add Department */}

<div style={{marginTop:"20px",marginBottom:"30px"}}>

<input
placeholder="Department Name"
value={departmentName}
onChange={(e)=>setDepartmentName(e.target.value)}
style={inputStyle}
/>

<input
placeholder="Category"
value={category}
onChange={(e)=>setCategory(e.target.value)}
style={inputStyle}
/>

<button
onClick={addDepartment}
style={addButton}
>
Add Department
</button>

</div>


{/* Department List */}

<table style={tableStyle}>

<thead>
<tr>
<th>Department</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{departments.map((dept,i)=>(

<tr key={i}>

<td>{dept}</td>

<td>

<button
onClick={()=>deleteDepartment(dept)}
style={deleteButton}
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


/* Styles */

const inputStyle = {
padding:"8px",
marginRight:"10px",
borderRadius:"6px",
border:"1px solid #ccc"
};

const addButton = {
padding:"8px 15px",
background:"#28a745",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer"
};

const deleteButton = {
padding:"5px 12px",
background:"#dc3545",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer"
};

const tableStyle = {
width:"100%",
borderCollapse:"collapse"
};

export default ManageDepartments;