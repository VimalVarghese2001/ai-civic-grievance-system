import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axios";
import CitizenLayout from "../../components/CitizenLayout";

function ComplaintTimeline(){

const { id } = useParams();
const [timeline,setTimeline] = useState([]);

useEffect(()=>{
fetchTimeline();
},[]);

const fetchTimeline = async () => {

const token = localStorage.getItem("token");

const res = await API.get(
`/complaint/${id}/timeline`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setTimeline(res.data.timeline);

};

return(

<CitizenLayout>

<div style={{padding:"40px"}}>

<h1>Complaint Timeline</h1>

{timeline.length === 0 ? (
<p>No updates yet. Complaint is still assigned.</p>
) : (
timeline.map((log,index)=>(
<div key={index} style={timelineStyle}>

<p><b>Department:</b> {log.department}</p>

{log.old_status !== log.new_status && (
<p>{log.old_status} ➜ {log.new_status}</p>
)}

<p style={{color:"gray"}}>
{log.timestamp && new Date(log.timestamp.$date || log.timestamp).toLocaleString("en-IN", {
dateStyle:"medium",
timeStyle:"short"
})}
</p>

</div>
))
)}

</div>

</CitizenLayout>

);

}

const timelineStyle = {
borderLeft:"4px solid #007bff",
padding:"15px",
marginBottom:"20px",
background:"#f5f5f5",
borderRadius:"6px"
};

export default ComplaintTimeline;