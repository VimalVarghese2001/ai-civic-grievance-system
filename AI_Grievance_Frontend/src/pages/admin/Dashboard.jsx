import { useEffect, useState } from "react";
import API from "../../api/axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
LineElement,
PointElement,
ArcElement,
Title,
Tooltip,
Legend
} from "chart.js";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
LineElement,
PointElement,
ArcElement,
Title,
Tooltip,
Legend
);

function AdminDashboard(){

const navigate = useNavigate();

const goToComplaints = (status) => {
  navigate(`/admin/complaints?status=${status}`);
};

const [stats,setStats] = useState({});
const [districtData,setDistrictData] = useState(null);
const [departmentData,setDepartmentData] = useState(null);
const [trendData,setTrendData] = useState(null);
const [district,setDistrict] = useState("");
const [districts,setDistricts] = useState([]);

useEffect(()=>{
fetchAnalytics();
fetchDistrictAnalytics();
fetchDepartmentAnalytics();
fetchTrendAnalytics();
fetchDistricts();
},[district]);


const fetchTrendAnalytics = async () => {

try{

const token = localStorage.getItem("token");

let url = "/admin/analytics/trend";

if(district){
url = `/admin/analytics/trend?district=${district}`;
}

const res = await API.get(
url,
{
headers:{ Authorization:`Bearer ${token}` }
}
);

const months = [
"Jan","Feb","Mar","Apr","May","Jun",
"Jul","Aug","Sep","Oct","Nov","Dec"
];

const labels = res.data.trend.map(
t => months[t.month-1] + " " + t.year
);

const counts = res.data.trend.map(t => t.count);

setTrendData({
labels,
datasets:[
{
label:"Monthly Complaints",
data:counts,
borderColor:"#007bff",
backgroundColor:"rgba(0,123,255,0.2)",
tension:0.3
}
]
});

}catch(error){
console.error(error);
}

};


const fetchAnalytics = async () => {

try{

const token = localStorage.getItem("token");

let url = "/admin/analytics/overview";

if(district){
url = `/admin/analytics/overview?district=${district}`;
}

const res = await API.get(
url,
{
headers:{ Authorization:`Bearer ${token}` }
}
);

setStats(res.data);

}catch(error){
console.error(error);
}
};


const fetchDistricts = async () => {

try{

const res = await API.get("/locations/districts");

setDistricts(res.data);

}catch(error){
console.error(error);
}

};


const fetchDistrictAnalytics = async () => {

try{

const token = localStorage.getItem("token");

const res = await API.get(
"/admin/analytics/by-district",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

const labels = res.data.district_analysis.map(d => d._id);
const counts = res.data.district_analysis.map(d => d.count);

setDistrictData({
labels,
datasets:[
{
label:"Complaints",
data:counts,
backgroundColor:"#4f9cff"
}
]
});

}catch(error){
console.error(error);
}

};


const fetchDepartmentAnalytics = async () => {

try{

const token = localStorage.getItem("token");

let url = "/admin/analytics/by-department";

if(district){
url = `/admin/analytics/by-department?district=${district}`;
}

const res = await API.get(
url,
{
headers:{ Authorization:`Bearer ${token}` }
}
);

const labels = res.data.department_analysis.map(d => d._id);
const counts = res.data.department_analysis.map(d => d.count);

setDepartmentData({
labels,
datasets:[
{
label:"Complaints",
data:counts,
backgroundColor:"#ff6b81"
}
]
});

}catch(error){
console.error(error);
}

};


const chartOptions = {
responsive: true,
maintainAspectRatio: false,
plugins:{
legend:{
position:"top"
}
}
};


const statusPieData = {
labels: ["Assigned", "In Progress", "Resolved"],
datasets: [
{
data: [
stats.assigned || 0,
stats.in_progress || 0,
stats.resolved || 0
],
backgroundColor: [
"#ffc107",
"#17a2b8",
"#28a745"
]
}
]
};


return(

<AdminLayout>

<div style={{padding:"40px"}}>

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"20px"
}}>

<h1>
Admin Dashboard {district && <span style={{color:"#007bff"}}> ({district} District)</span>}
</h1>

<div>

<label style={{marginRight:"10px"}}>District:</label>

<select
value={district}
onChange={(e)=>setDistrict(e.target.value)}
style={{padding:"6px"}}
>

<option value="">All Districts</option>

{districts.map((d,i)=>(
<option key={i} value={d}>{d}</option>
))}

</select>

</div>

</div>


{/* Navigation Buttons */}

<div style={{marginBottom:"20px"}}>

<button
onClick={()=>navigate("/admin/map")}
style={buttonBlue}
>
View Complaint Map
</button>

<button
onClick={()=>navigate("/admin/officers")}
style={buttonGreen}
>
Manage Officers
</button>



<button
onClick={()=>navigate("/admin/departments")}
style={{
padding:"10px 20px",
background:"#6f42c1",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginLeft:"10px"
}}
>
Manage Departments
</button>

</div>

{/* KPI Cards */}

<div style={statsGrid}>

<div style={{...cardStyle, borderLeft:"6px solid #007bff"}}
onClick={() => navigate("/admin/complaints")}>

<h3>📊 Total Complaints</h3>
<p style={statNumber}>{stats.total_complaints}</p>

</div>


<div style={{...cardStyle, borderLeft:"6px solid #ffc107"}}
onClick={() => goToComplaints("Assigned")}>

<h3>📌 Assigned</h3>
<p style={statNumber}>{stats.assigned}</p>

</div>


<div style={{...cardStyle, borderLeft:"6px solid #17a2b8"}}
onClick={() => goToComplaints("In Progress")}>

<h3>⏳ In Progress</h3>
<p style={statNumber}>{stats.in_progress}</p>

</div>


<div style={{...cardStyle, borderLeft:"6px solid #28a745"}}
onClick={() => goToComplaints("Resolved")}>

<h3>✅ Resolved</h3>
<p style={statNumber}>{stats.resolved}</p>

</div>


<div style={{...cardStyle, borderLeft:"6px solid #dc3545"}}
onClick={() => navigate("/admin/complaints?duplicate=true")}>

<h3>⚠ Duplicate</h3>
<p style={statNumber}>{stats.duplicate_complaints}</p>

</div>


<div style={{...cardStyle, borderLeft:"6px solid #6f42c1"}}>

<h3>🔥 Avg Priority</h3>
<p style={statNumber}>{stats.average_priority}</p>

</div>

</div>



{/* Charts */}

<div style={chartGrid}>


{/* District Chart */}

<div style={chartCard}>

<h2>Complaints by District</h2>

<div style={{height:"300px"}}>

{districtData && (
<Bar data={districtData} options={chartOptions}/>
)}

</div>

</div>



{/* Department Chart */}

<div style={chartCard}>

<h2>Complaints by Department</h2>

<div style={{height:"300px"}}>

{departmentData && (
<Bar data={departmentData} options={chartOptions}/>
)}

</div>

</div>


</div>



{/* Pie Chart */}

{/* Second Row Charts */}

<div style={chartGrid}>

{/* Status Pie Chart */}

<div style={chartCard}>

<h2>Complaint Status Distribution</h2>

<div style={{height:"300px",maxWidth:"380px",margin:"auto"}}>

<Pie data={statusPieData}/>

</div>

</div>


{/* Trend Chart */}

<div style={chartCard}>

<h2>Complaint Trend Analysis</h2>

<div style={{height:"300px"}}>

{trendData && (
<Line data={trendData} options={chartOptions}/>
)}

</div>

</div>

</div>


</div>

</AdminLayout>

);

}


/* Styles */

const statsGrid = {
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
gap:"20px",
marginBottom:"40px"
};

const chartGrid = {
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"30px",
marginBottom:"30px"
};

const chartCard = {
background:"#ffffff",
padding:"20px",
borderRadius:"12px",
boxShadow:"0 3px 12px rgba(0,0,0,0.1)"
};

const cardStyle = {
background:"#ffffff",
padding:"20px",
borderRadius:"12px",
textAlign:"center",
cursor:"pointer",
boxShadow:"0 3px 10px rgba(0,0,0,0.1)",
transition:"0.2s"
};

const buttonBlue = {
padding:"10px 20px",
background:"#007bff",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer",
marginRight:"10px"
};

const buttonGreen = {
padding:"10px 20px",
background:"#28a745",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer"
};

const statNumber = {
fontSize:"28px",
fontWeight:"bold",
marginTop:"10px",
color:"#333"
};

export default AdminDashboard;