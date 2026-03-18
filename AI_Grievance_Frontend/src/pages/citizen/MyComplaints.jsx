import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import CitizenLayout from "../../components/CitizenLayout";

function MyComplaints(){

const [complaints,setComplaints] = useState([]);
const navigate = useNavigate();

useEffect(()=>{
fetchComplaints();
},[]);

const fetchComplaints = async () => {
  try {

    const token = localStorage.getItem("token");

    const res = await API.get(
      "/citizen/complaints",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setComplaints(res.data.complaints);

  } catch (error) {
    console.error(error);
  }
};

return(

<CitizenLayout>

<div className="container mt-4">

<div className="card shadow-sm">

<div className="card-body">

<h3 className="mb-4">My Complaints</h3>

<div className="table-responsive">

<table className="table table-hover align-middle">

<thead className="table-light">

<tr>
<th>ID</th>
<th>Complaint</th>
<th>District</th>
<th>Status</th>
<th>Action</th>
</tr>

</thead>

<tbody>

{complaints.map((c)=>(

<tr key={c._id}>

<td>{c._id.slice(-6)}</td>

<td>{c.complaint_text}</td>

<td>{c.district}</td>

<td>

<span
className={`badge ${
c.overall_status === "Resolved"
? "bg-success"
: c.overall_status === "In Progress"
? "bg-primary"
: c.overall_status === "Assigned"
? "bg-warning text-dark"
: "bg-secondary"
}`}
>

{c.overall_status}

</span>

</td>

<td>

<button
className="btn btn-outline-primary btn-sm"
onClick={()=>navigate(`/complaint/${c._id}`)}
>
Track
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

</div>

</div>

</CitizenLayout>

);

}

export default MyComplaints;