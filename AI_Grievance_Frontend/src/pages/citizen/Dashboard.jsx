import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import CitizenLayout from "../../components/CitizenLayout";

function CitizenDashboard(){

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

const total = complaints.length;
const resolved = complaints.filter(c=>c.overall_status==="Resolved").length;
const progress = complaints.filter(c=>c.overall_status==="In Progress").length;
const assigned = complaints.filter(c=>c.overall_status==="Assigned").length;

return(

<CitizenLayout>

{/* Statistics Cards */}

<div className="row mb-4">

<div className="col-md-3">
<div className="card shadow-sm bg-info-subtle">
<div className="card-body">
<h5 className="card-title">Total Complaints</h5>
<h3>{total}</h3>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card shadow-sm bg-warning-subtle">
<div className="card-body">
<h5 className="card-title">Assigned</h5>
<h3>{assigned}</h3>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card shadow-sm bg-primary-subtle">
<div className="card-body">
<h5 className="card-title">In Progress</h5>
<h3>{progress}</h3>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card shadow-sm bg-success-subtle">
<div className="card-body">
<h5 className="card-title">Resolved</h5>
<h3>{resolved}</h3>
</div>
</div>
</div>

</div>


{/* Quick Actions */}

<div className="mb-4 d-flex gap-3">

<button
className="btn btn-primary"
onClick={()=>navigate("/citizen/create-complaint")}
>
Create Complaint
</button>

<button
className="btn btn-secondary"
onClick={()=>navigate("/citizen/my-complaints")}
>
View My Complaints
</button>

</div>


{/* Recent Complaints */}

<div className="card shadow-sm">

<div className="card-body">

<h4 className="card-title mb-3">Recent Complaints</h4>

<div className="table-responsive">

<table className="table table-hover">

<thead className="table-light">

<tr>
<th>ID</th>
<th>Complaint</th>
<th>District</th>
<th>Status</th>
</tr>

</thead>

<tbody>

{complaints.slice(0,5).map((c)=>(

<tr key={c._id}>

<td>{c._id.slice(-6)}</td>
<td>{c.complaint_text}</td>
<td>{c.district}</td>

<td>
<span className="badge bg-success">
{c.overall_status}
</span>
</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

</div>

</CitizenLayout>

);

}

export default CitizenDashboard;