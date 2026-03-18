import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { useEffect, useState } from "react"
import axios from "axios"
import L from "leaflet";

const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32]
});

const yellowIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [32, 32]
});

const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32]
});

function ComplaintMap() {

  const [complaints, setComplaints] = useState([])
  const [districts, setDistricts] = useState([])
  const [district, setDistrict] = useState("")

  const getMarkerIcon = (priority) => {

  if(priority >= 70){
    return redIcon;
  }

  if(priority >= 40){
    return yellowIcon;
  }

  return greenIcon;

};

const fetchDistricts = async () => {

  const res = await axios.get(
    "http://localhost:5000/locations/districts"
  )

  setDistricts(res.data)

}

  useEffect(() => {
  fetchComplaints()
  fetchDistricts()
}, [])

  const fetchComplaints = async () => {

    const token = localStorage.getItem("token")

    const res = await axios.get(
      "http://localhost:5000/admin/complaints/map",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    console.log("Complaints from API:", res.data)

    setComplaints(res.data)
  }

  return (

  <div style={{
  width: "95%",
  margin: "30px auto",
  padding: "20px",
  background: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
}}>

  <h2 style={{marginBottom: "15px",fontWeight: "600",color: "#333"}}>
Complaint Monitoring Map</h2>


<div style={{marginBottom:"15px"}}>

<label style={{marginRight:"10px"}}>Filter by District:</label>

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

      <MapContainer
  center={[10.2, 76.3]}
  zoom={8}
  style={{ height: "500px", width: "100%", borderRadius:"10px" }}
  maxBounds={[
    [7.8, 74.8],   // Southwest Kerala
    [12.8, 77.6]   // Northeast Kerala
  ]}
  maxBoundsViscosity={1.0}
>

        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        

        {complaints
        .filter(c => !district || c.district === district)
        .map((c,i)=>(
          <Marker key={i} position={[c.lat, c.lng]} icon={getMarkerIcon(c.priority)}>
            
            <Popup>

              <b>{c.local_body}, {c.district}</b><br/>
              Ward: {c.ward}<br/><br/>
              Landmark/Address: {c.address}<br/><br/>
              {c.complaint_text}<br/><br/>
              Priority: {c.priority}<br/>
              Status: {c.status},<br/>
              Similar Complaints: {c.duplicate_count}

          </Popup>
        </Marker>
        ))}
        

      </MapContainer>

    </div>
  )
}

export default ComplaintMap