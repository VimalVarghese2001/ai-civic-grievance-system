import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axios";

function ComplaintDetails(){

const { id } = useParams();

const [complaint,setComplaint] = useState(null);
const [timeline,setTimeline] = useState([]);
const [showImage,setShowImage] = useState(false);

useEffect(()=>{
fetchComplaint();
fetchTimeline();
},[]);

const fetchComplaint = async () => {

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

const endpoint =
role === "admin"
? `/admin/complaint/${id}`
: `/officer/complaint/${id}`;

const res = await API.get(
endpoint,
{
headers:{ Authorization:`Bearer ${token}` }
}
);

setComplaint(res.data);

};

const fetchTimeline = async () => {

const token = localStorage.getItem("token");

const res = await API.get(
`/complaint/${id}/timeline`,
{
headers:{ Authorization:`Bearer ${token}` }
}
);

setTimeline(res.data.timeline);
};

if(!complaint) return <h2 style={{padding:"40px"}}>Loading complaint...</h2>;


const priorityColor =
complaint.final_priority >= 70 ? "#dc3545" :
complaint.final_priority >= 40 ? "#fd7e14" :
"#28a745";

const statusColor =
complaint.overall_status === "Assigned" ? "#ffc107" :
complaint.overall_status === "In Progress" ? "#17a2b8" :
"#28a745";


return(

<div style={{padding:"40px",maxWidth:"900px",margin:"auto"}}>

<h1 style={{marginBottom:"30px"}}>Complaint Details</h1>


{/* Complaint Card */}

<div style={card}>

<h2>{complaint.complaint_text}</h2>

<p>
<strong>District:</strong> {complaint.district}
</p>

<p>
<strong>Priority:</strong>

<span style={{
marginLeft:"10px",
padding:"4px 10px",
borderRadius:"6px",
color:"white",
background:priorityColor
}}>
{complaint.final_priority?.toFixed(2)}
</span>

</p>

<p>
<strong>Status:</strong>

<span style={{
marginLeft:"10px",
padding:"4px 10px",
borderRadius:"6px",
color:"white",
background:statusColor
}}>
{complaint.overall_status}
</span>

</p>

</div>


{/* Evidence Image */}

<div style={card}>

<h3>Evidence Image</h3>

{complaint.image_path ? (
<>

<img
src={`http://localhost:5000/${complaint.image_path}`}
alt="Evidence"
style={{
width:"350px",
borderRadius:"10px",
marginTop:"10px",
cursor:"pointer"
}}
onClick={()=>setShowImage(true)}
/>

{showImage && (
<div
onClick={()=>setShowImage(false)}
style={overlay}
>

<img
src={`http://localhost:5000/${complaint.image_path}`}
alt="Evidence"
style={{
maxWidth:"90%",
maxHeight:"90%",
borderRadius:"10px"
}}
/>

</div>
)}

</>
) : (
<p>No evidence uploaded</p>
)}

</div>


{/* Departments */}

<div style={card}>

<h3>Departments Handling Complaint</h3>

<ul style={{lineHeight:"2"}}>

{complaint.departments?.map((d)=>{

const deptColor =
d.status === "Resolved" ? "#28a745" :
d.status === "In Progress" ? "#17a2b8" :
"#ffc107";

return(

<li key={d.name}>

{d.name}

<span style={{
marginLeft:"10px",
padding:"3px 8px",
borderRadius:"6px",
color:"white",
background:deptColor
}}>
{d.status}
</span>

</li>

);

})}

</ul>

</div>


{/* Timeline */}

<div style={card}>

<h3>Complaint Timeline</h3>

<div style={timelineBox}>

{timeline?.map((log,i)=>(

<div key={i} style={timelineItem}>

<strong>{log.department}</strong>

<p>
{log.old_status} → {log.new_status}
</p>

<p style={{fontSize:"12px",color:"gray"}}>
{log.timestamp
 ? new Date(log.timestamp.$date || log.timestamp).toLocaleString("en-IN",{
     dateStyle:"medium",
     timeStyle:"short"
   })
 : "Time not available"}
</p>

</div>

))}

</div>

</div>

</div>

);

}


/* Styles */

const card = {
background:"#ffffff",
padding:"20px",
borderRadius:"12px",
boxShadow:"0 3px 12px rgba(0,0,0,0.1)",
marginBottom:"20px"
};

const timelineBox = {
display:"flex",
flexDirection:"column",
gap:"12px",
marginTop:"10px"
};

const timelineItem = {
background:"#f8f8f8",
padding:"10px",
borderRadius:"8px"
};

const overlay = {
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.8)",
display:"flex",
alignItems:"center",
justifyContent:"center",
zIndex:1000
};

export default ComplaintDetails;