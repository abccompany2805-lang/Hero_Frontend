import React, { useState, useRef, useEffect } from "react";
import API_BASE_URL from "../../config";
import { useParams } from "react-router-dom";


const STORAGE_KEY = "skd_part_scan_qty";



const SKDPartScanning = () => {

  const { stageNo } = useParams();
const stageNumber = Number(stageNo);

  const [vin, setVin] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannedValue, setScannedValue] = useState("");
  const scanInputRef = useRef(null);

  const [wrongSku, setWrongSku] = useState(false);
  const [lastScannedSku, setLastScannedSku] = useState(null);
  const [lastScanText, setLastScanText] = useState("");
const [lastMqttVin, setLastMqttVin] = useState(null);
const [prePitchReceived, setPrePitchReceived] = useState(false);
const [isInterlocked, setIsInterlocked] = useState(false);

const [prePitchValue, setPrePitchValue] = useState(null); // 0 or 1
/* ================= RESULT STATE ================= */
const [finalResult, setFinalResult] = useState(null); // null | PASS | FAIL


const isInvalidStage = !stageNumber || isNaN(stageNumber);
const [mqttSignals, setMqttSignals] = useState([]);



  // SKU → scanned count
  const [scanQtyMap, setScanQtyMap] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  /* ================= FOCUS ================= */
  useEffect(() => {
    scanInputRef.current?.focus();
  }, [scannedValue, wrongSku]);

  /* ================= SAVE TO LOCAL ================= */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scanQtyMap));
  }, [scanQtyMap]);


/* ================= MQTT VIN VIA API (POLLING) -DONE ================= */

useEffect(() => {
  if (!stageNumber) return;

  const fetchMqttSignals = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/mqtt-signal/by-stage-no/${stageNumber}`
      );

      const json = await res.json();

      if (json.success && json.signals) {
        setMqttSignals(json.signals);
        console.log("Loaded MQTT Signals:", json.signals);
      }
    } catch (err) {
      console.error("MQTT Signal Fetch Error:", err);
    }
  };

  fetchMqttSignals();
}, [stageNumber]);
const vinSignal = mqttSignals.find(
  s => s.payload_format === "RAW"
);


const partScanSignal = mqttSignals.find(
  s => s.logical_name.toLowerCase().includes("part")
);

useEffect(() => {
  if (!vinSignal?.topic) return;

  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mqtt/listen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: vinSignal.topic }),
      });

      if (!res.ok) return;

      const json = await res.json();

      if (json.success && json.data) {
        handleNewVin(json.data);
      }
    } catch (err) {
      console.error("MQTT VIN polling error:", err.message);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [vinSignal?.topic]);

useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mqtt/listen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "stage_20_prepitch" }),
      });

      if (!res.ok) return;

      const json = await res.json();
      if (!json.success || json.data === undefined || !routeData) return;

      const prepitch = Number(json.data); // 0 or 1
      setPrePitchValue(prepitch);

const parts = routeData?.partRequirements || [];

const allScanned = parts.every(
  (p) => (scanQtyMap[p.part_no] || 0) >= p.qty_required
);


      /* =================================================
         AUTHORITATIVE DECISION TABLE
      ================================================= */

      // ✅ CASE 1: prepitch = 0 → ALWAYS PASS
      if (prepitch === 0) {
        console.log("Prepitch = 0 → FORCE PASS");
        setIsInterlocked(false);
        publishStageStatus(1);
        return;
      }

      // ✅ CASE 2: prepitch = 1 AND all scanned → PASS
      if (allScanned) {
        console.log("Prepitch = 1 & all scanned → PASS");
        setIsInterlocked(false);
        publishStageStatus(1);
      }
      // ❌ CASE 3: prepitch = 1 AND missing parts → FAIL
      else {
        console.log("Prepitch = 1 & missing parts → FAIL");
        setIsInterlocked(true);
        publishStageStatus(0);
      }

    } catch (err) {
      console.error("PrePitch MQTT error", err);
    }
  }, 500);

  return () => clearInterval(interval);
}, [routeData, scanQtyMap]);




const handleNewVin = (newVin) => {
  if (!newVin) return;

  const trimmedVin = newVin.trim();

  // 🔴 DO NOTHING if VIN is same
  if (trimmedVin === lastMqttVin) return;

  console.log("VIN CHANGED → RESETTING STATE:", trimmedVin);

  setLastMqttVin(trimmedVin);
  setVin(trimmedVin);

  // 🔴 RESET VIN STATE
  setRouteData(null);
  setScanQtyMap({});
  setLastScanText("");
  setLastScannedSku(null);
  setWrongSku(false);
  setPrePitchReceived(false);
  setPrePitchValue(null);
  setIsInterlocked(false);
  setFinalResult(null);

  localStorage.removeItem(STORAGE_KEY);

  // 🔥 CALL API ONLY ON NEW VIN
  fetchVinDataFromApi(trimmedVin);
};



const publishStageStatus = async (value) => {
  if (!partScanSignal?.topic) return;

  try {
    await fetch(`${API_BASE_URL}/api/mqtt/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: partScanSignal.topic,
        data: String(value),
      }),
    });

    console.log("Published:", value);
  } catch (err) {
    console.error("MQTT publish error", err);
  }
};


const fetchVinDataFromApi = async (incomingVin) => {
  try {
    setLoading(true);

    const res = await fetch(
      `${API_BASE_URL}/api/vin/get-model-by-vin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin_no: incomingVin,       // 🔥 FIXED FIELD NAME
         stage_no: stageNumber              // 🔥 REQUIRED PARAM
        }),
      }
    );

    const json = await res.json();
    console.log("VIN API RESPONSE:", json);

    if (json?.model) {
      setRouteData(json);
    } else {
      console.error("Invalid VIN response structure");
      setRouteData(null);
    }
  } catch (err) {
    console.error("VIN API error", err);
  } finally {
    setLoading(false);
  }
};




  /* ================= FETCH VIN ================= */
  const fetchVinData = async () => {
    if (!vin) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/vin/get-model-by-vin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin_no: vin }),
        }
      );

      const json = await res.json();
      if (json.success) {
        setRouteData(json.data);
        setScanQtyMap({});
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error("VIN API error", err);
    } finally {
      setLoading(false);
    }
  };


  /* ================= PARTS ================= */
const parts =
  routeData?.partRequirements?.map((p) => ({
    sku: p.part_no,
    name: p.part_name,
    qty: p.qty_required,
    regex: p.regex_pattern,
    minLen: p.min_len,
    maxLen: p.max_len,
    allowDuplicate: p.allow_duplicate,
  })) || [];


  const chunkData = (data, size) => {
    const chunks = [];
    for (let i = 0; i < data.length; i += size) {
      chunks.push(data.slice(i, i + size));
    }
    return chunks;
  };

  /* ================= SCAN LOGIC ================= */
const handleScan = () => {
  if (!scannedValue || isInterlocked) return;

  const scannedSku = scannedValue.trim();
  setLastScanText(scannedSku);

  const part = parts.find((p) => {
    if (!p.regex) return false;
    return new RegExp(p.regex).test(scannedSku);
  });

  if (!part) {
    setWrongSku(true);
    setScannedValue("");
    return;
  }

  setWrongSku(false);
  setLastScannedSku(part.sku);

  setScanQtyMap((prev) => {
    const current = prev[part.sku] || 0;
    if (current >= part.qty) return prev;
    return { ...prev, [part.sku]: current + 1 };
  });

  setScannedValue("");
};

  /* ================= ROW STYLE ================= */
  const getRowStyle = (row) => {
    const scanned = scanQtyMap[row.sku] || 0;

    if (scanned === 0) {
      return {
        backgroundColor: "#ffffff",
        color: "#000",
        border: "2px solid #000",
      };
    }

    if (scanned < row.qty) {
      return {
        backgroundColor: "#ffa500",
        color: "#000",
      };
    }

    return {
      backgroundColor: "#00ff00",
      color: "#000",
    };
  };

return (
  <>
   {isInvalidStage ? (
      <div style={{ background: "black", color: "white", padding: 40 }}>
        Invalid Stage Number
      </div>
    ) : (
<div style={ui.root}>

  {/* HEADER */}
  <div style={ui.header}>
    <img src="/hero-logo.png" style={ui.logoLeft} />
    <div style={ui.title}>SKD Part Scanning</div>
    
    <img src="/operatex-logo.jpg" style={ui.logoRight} />
  </div>

  {/* MODEL + MQTT */}
  <div style={ui.topRow}>
    <div style={ui.modelText}>
      Model: {routeData?.model?.model_name || "-"}
    </div>

    <div style={ui.skuText}>
        SKU : {routeData?.model?.model_code || "-"}
      </div>

    {/* <div style={ui.mqttText}>
      MQTT Connected
    </div> */}
  </div>

  {/* LINE STATUS + MODE */}
  <div style={ui.statusRow}>
    <div>
      LINE STATUS :
      <span style={{ color: isInterlocked ? "#00ff00" : "#00ff00" }}>
        {isInterlocked ? " INTERLOCKED" : " OK"}
      </span>
    </div>

    <div>
      <span style={{ color: "#00ff00" }}>AUTO</span>
      <span style={{ color: "#ffd700", marginLeft: 20 }}>MANUAL</span>
    </div>
  </div>

  {/* MAIN SECTION */}
 <div style={ui.mainSection}>

  {/* LEFT BOX */}
<div style={ui.leftBox}>

  {/* Stage Row */}
  <div style={ui.stageRow}>
    <div style={ui.stageCircleOuter}>
      <div style={ui.stageCircleInner}>
        {/* {routeData?.routeStep?.stage_no || "-"} */}
        {stageNumber}
      </div>
    </div>

    <div style={ui.stageNameBox}>
      <div style={ui.stageTitle}>Stage</div>
      <div style={ui.stageName}>
        {routeData?.routeStep?.stage_name || "Part Scannning"}
      </div>
    </div>
  </div>
<div>

   {/* Date */}
  <div style={ui.dateTimeRow}>
    <div style={ui.dateTag}>DATE</div>
    <div style={ui.dateValue}>
      {new Date().toLocaleDateString()}
    </div>
  </div>

  {/* Time */}
  <div style={ui.dateTimeRow}>
    <div style={ui.dateTag}>TIME</div>
    <div style={ui.dateValue}>
      {new Date().toLocaleTimeString()}
    </div>
  </div>
</div>
 

</div>


  {/* CENTER DIVIDER PANEL */}
  <div style={ui.centerPanel}>
    <div style={ui.countBoxTop}>
      <div style={ui.countValue}>
        {Object.values(scanQtyMap).reduce((a,b)=>a+b,0)}
      </div>
      <div style={ui.countLabel}>SCAN COMPLETE</div>
      
    </div>

    <div style={ui.centerDividerLine}></div>

    <div style={ui.countBoxBottom}>
      <div style={ui.countValue}>
        {parts.reduce((sum,p)=>sum+p.qty,0) -
         Object.values(scanQtyMap).reduce((a,b)=>a+b,0)}
      </div>
      <div style={ui.countLabel}>SCAN QUANTITY</div>
      
    </div>
  </div>

  {/* RIGHT BOX */}
  <div style={ui.rightBox}>
    <div style={ui.vinDisplay}>
      {vin || "-"}
    </div>

    <div style={ui.scanLabel}>Scanned Data</div>

    <input
      ref={scanInputRef}
      value={scannedValue}
      onChange={(e)=>setScannedValue(e.target.value)}
      onKeyDown={(e)=>e.key==="Enter" && handleScan()}
      style={ui.scanInput}
    />

    <div style={ui.resultBox}>
      {finalResult || "-"}
    </div>

    {/* PART TABLE */}
    <div style={ui.tableContainer}>
      <table style={ui.table}>
        <thead>
          <tr>
            <th>SKU</th>
            <th>NAME</th>
            <th>REQ</th>
            <th>SCAN</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((row,i)=>(
            <tr key={i}>
              <td>{row.sku}</td>
              <td>{row.name}</td>
              <td>{row.qty}</td>
              <td>{scanQtyMap[row.sku] || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

</div>


  {/* FOOTER */}
  <div style={ui.footer}>
    Powered by Opertex Thetavega
  </div>

</div>
  )}
</>
);

};

export default SKDPartScanning;

const ui = {

root:{
  background:"#000",
  color:"#fff",
  height:"100vh",
  display:"flex",
  flexDirection:"column",
  fontFamily:"Segoe UI",

  borderLeft:"6px solid #00cfff",
  borderTop:"6px solid #00cfff",
  borderRight:"6px solid #00cfff",
  borderBottom:"none"   // ❌ no bottom border
},


header:{
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  background:"#ffffff",   // ✅ white instead of grey
  color:"#000",
  height:60,
  position:"relative",
  borderRadius:"0px 0px 20px 20px"
},

titletop:{
  position:"absolute",
  top:0,
  left:"50%",
  transform:"translateX(-50%)",
  height:60,
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
},

title:{
  fontSize:35,
  fontWeight:"bold",
  padding:"2px 60px",
  borderRadius:"0px 0px 30px 30px",
  color:"#000",
  letterSpacing:2
},

logoLeft:{position:"absolute",left:15,height:60},
logoRight:{position:"absolute",right:15,height:60},

topRow:{
  display:"flex",
  justifyContent:"space-around",
  padding:"4px 20px",
  fontSize:25,
  fontWeight: "Bold",
  letterSpacing:1
},

modelText:{color:"#ffd700"},
mqttText:{color:"#00ff00"},

statusRow:{
  borderTop: "2px solid grey",
    borderBottom: "2px solid grey",

  display:"flex",
  justifyContent:"space-between",
  padding:"4px 20px",
  fontSize:28,
  fontWeight: "bold",
  letterSpacing:1
},

mainSection:{
  display:"flex",
  flex:1,
  padding:"10px 10px 90px 10px",
  alignItems:"stretch",
  gap:20
},

centerPanel:{
  width:"auto",     // Clay orange color
  borderRadius:10,
  color: "#ffff",
  display:"flex",
  flexDirection:"column",
  justifyContent:"space-between",
  alignItems:"center",
  padding:"60px 0px"
},

countBoxTop:{
  textAlign:"center",
  display: "flex",
  flexDirection :"column",
  gap: 40
},

countBoxBottom:{
  textAlign:"center",
  display: "flex",
  flexDirection :"column",
  gap: 40
},

countLabel:{
  fontSize:22,
  fontWeight:"bold",
  color:"#fcfcf6",
  marginBottom:10
},

countValue:{
  fontSize:40,
  fontWeight:"bold",
  color:"#f5f101"
},

centerDividerLine:{
  width:"80%",
  height:8,
  background:"#e97f06",
 
},
leftBox:{
  width:"30%",
  border:"4px solid #d000ff",
  borderRadius:16,
  padding:20,
  display:"flex",
  flexDirection:"column",
  justifyContent: "space-between"
},

/* Stage Layout */
stageRow:{
  display:"flex",
  alignItems:"center",
  gap:20
},

stageCircleOuter:{
  width:150,
  height:150,
  borderRadius:"50%",
  border:"4px solid #d000ff",
  display:"flex",
  alignItems:"center",
  justifyContent:"center"
},

stageCircleInner:{
  width:120,
  height:120,
  borderRadius:"50%",
  border:"4px solid #00ff00",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  fontSize:32,
  fontWeight:"bold",
  color:"#ffd700"
},

stageNameBox:{
  display:"flex",
  flexDirection:"column",
  justifyContent:"center"
},

stageTitle:{
  fontSize:22,
  color:"#ffffff",
  marginBottom:8
},

stageName:{
  fontSize:26,
  fontWeight:"bold",
  color:"#ffffff"
},

/* Date & Time EXACT Image Style */
dateTimeRow:{
  display:"flex",
  alignItems:"center",
  gap:15,
  marginTop:0
  
},

dateTag:{
  background:"#e5e5e5",
  color:"#000",
  padding:"6px 12px",
  borderRadius:6,
  fontSize:14,
  fontWeight:"bold",
  minWidth:70,
  textAlign:"center"
},

dateValue:{
  fontSize:22,
  fontWeight:"bold",
  color:"#ffffff"
},


rightBox:{
  flex:1,
  border:"4px solid #00cfff",
  borderRadius:12,
  padding:20,
  display:"flex",
  flexDirection:"column",
  gap:15
},

vinDisplay:{
  background:"#ccc",
  color:"#000",
  padding:10,
  borderRadius:10,
  fontSize:22,
  fontWeight:"bold"
},

skuText:{fontSize:25, letterSpacing: 2},

scanLabel:{color:"#ffd700"},

scanInput:{
  height:45,
  fontSize:20,
  padding:10
},

resultBox:{
  height:80,
  border:"4px solid #00ff00",
  borderRadius:15,
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  fontSize:40,
  fontWeight:"bold",
  color:"#ff0033"
},

tableContainer:{
  flex:1,
  overflow:"auto"
},

table:{
  width:"100%",
  borderCollapse:"collapse"
},

footer:{
  background:"#ff8c00",
  color:"#000",
  textAlign:"center",
  padding:4,
  fontWeight:"bold"
}

};
