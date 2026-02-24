import React, { useState, useRef, useEffect } from "react";
import API_BASE_URL from "../../config";
import { useParams } from "react-router-dom";
import mqtt from "mqtt";

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

const isPass = finalResult === "PASS";
const isFail = finalResult === "FAIL";
const [mqttConnected, setMqttConnected] = useState(false);


const isInvalidStage = !stageNumber || isNaN(stageNumber);
const [mqttSignals, setMqttSignals] = useState([]);

const VIN_TOPIC = `ST${stageNumber}_EngineNumber`;
const RESULT_TOPIC = `ST${stageNumber}_Result`;
const STATIC_PREPITCH_TOPIC = "PrePitch";


const mqttClientRef = useRef(null);


const [alert, setAlert] = useState({
  type: null, // "error" | "warning" | "success"
  message: ""
});


const showAlert = (type, message, autoClear = true) => {
  setAlert({ type, message });

  if (autoClear) {
    setTimeout(() => {
      setAlert({ type: null, message: "" });
    }, 3000);
  }
};


  // SKU → scanned count
  // const [scanQtyMap, setScanQtyMap] = useState(() => {
  //   const saved = localStorage.getItem(STORAGE_KEY);
  //   return saved ? JSON.parse(saved) : {};
  // });
const [scanQtyMap, setScanQtyMap] = useState({});
  /* ================= FOCUS ================= */
  useEffect(() => {
    scanInputRef.current?.focus();
  }, [scannedValue, wrongSku]);

  /* ================= SAVE TO LOCAL ================= */
  // useEffect(() => {
  //   localStorage.setItem(STORAGE_KEY, JSON.stringify(scanQtyMap));
  // }, [scanQtyMap]);


/* ================= MQTT VIN VIA API (POLLING) -DONE ================= */


useEffect(() => {
  if (
    mqttConnected &&
    vin &&
    routeData &&
    finalResult !== "PASS"
  ) {
    scanInputRef.current?.focus();
  }
}, [mqttConnected, vin, routeData, finalResult]);


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
  if (!stageNumber) return;

  const client = mqtt.connect("ws://192.168.1.12:9001", {
    reconnectPeriod: 3000,
    connectTimeout: 4000,
    clean: true,
    keepalive: 60,
  });

  mqttClientRef.current = client;

  client.on("connect", () => {
    console.log("✅ MQTT Connected");
    setMqttConnected(true);

    client.subscribe(VIN_TOPIC, { qos: 0 });
    client.subscribe(STATIC_PREPITCH_TOPIC, { qos: 0 });

    showAlert("success", "MQTT CONNECTED ✅", true);
  });

  client.on("message", (topic, message) => {
    const value = message.toString().trim();

    // VIN
    if (topic === VIN_TOPIC && value) {
      handleNewVin(value);
    }

    // PREPITCH
    if (topic === STATIC_PREPITCH_TOPIC) {
      setPrePitchValue(Number(value || 0));
    }
  });

  client.on("offline", () => {
    setMqttConnected(false);
    showAlert("error", "MQTT CONNECTION LOST 🔌", false);
  });

  client.on("error", (err) => {
    console.error("❌ MQTT Error:", err.message);
  });

  return () => {
    client.end(true);
  };

}, [stageNumber]);



useEffect(() => {
  if (!routeData) return;

  const parts = routeData?.partRequirements || [];

  const allScanned =
    parts.length > 0 &&
    parts.every(
      (p) => (scanQtyMap[p.part_no] || 0) >= p.qty_required
    );

  const prepitch = Number(prePitchValue ?? 0); // null → 0

  // ================= PASS LOGIC =================
  if (allScanned) {
    if (finalResult !== "PASS") {
      setFinalResult("PASS");
      setIsInterlocked(false);
      publishPartScanStatus("PASS"); // 🔥 send immediately

      showAlert("success", "WAIT FOR THE NEXT CYCLE 🔄", false);
    }
    return;
  }

  // ================= FAIL LOGIC =================
 // ================= FAIL LOGIC =================
if (!allScanned && prepitch === 1) {
  if (finalResult !== "FAIL") {
    setFinalResult("FAIL");

    // 🚫 DO NOT INTERLOCK
    // setIsInterlocked(true);

    publishPartScanStatus("FAIL");
  }
  return;
}

  // ================= DEFAULT =================
  setFinalResult(null);

}, [scanQtyMap, routeData, prePitchValue]);





const handleNewVin = (newVin) => {
  if (!newVin || typeof newVin !== "string") return;

  const trimmedVin = newVin.trim();

  if (!trimmedVin) return;

if (vin === trimmedVin) return;

  console.log("VIN CHANGED → RESETTING STATE:", trimmedVin);

  setLastMqttVin(trimmedVin);
  setVin(trimmedVin);

  // DO NOT clear routeData here (prevents blinking)

  setScanQtyMap({});
  setLastScanText("");
  setLastScannedSku(null);
  setWrongSku(false);
  setPrePitchReceived(false);
  setPrePitchValue(null);
  setIsInterlocked(false);
  setFinalResult(null);

  localStorage.removeItem(STORAGE_KEY);

  fetchVinDataFromApi(trimmedVin);
};




const publishPartScanStatus = (status) => {
  if (!mqttClientRef.current) return;

  const payload = status === "PASS" ? "1" : "0";

  try {
    mqttClientRef.current.publish(
      RESULT_TOPIC,
      payload,
      { qos: 0, retain: false }
    );

    console.log(`MQTT Published to ${RESULT_TOPIC}:`, payload);
  } catch (err) {
    console.error("MQTT Publish Error:", err);
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
  setRouteData(null);
  showAlert("warning", "VIN NOT FOUND ⚠", true);
}
  } catch (err) {
   console.error("VIN API error", err);
showAlert("error", "SERVER CONNECTION FAILED 🌐", false);
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
// const handleScan = () => {

//   // 🚫 HARD LOCK IF PASS
//   if (finalResult === "PASS") {
//     showAlert("warning", "SCAN NOT ALLOWED - STATUS PASS ✅", true);
//     return;
//   }

//   if (!scannedValue) return;
//   if (!routeData?.partRequirements) return;


  

//   const scannedSku = scannedValue.replace(/[\r\n]/g, "").trim();
//   setLastScanText(scannedSku);   // ✅ ADD THIS

//   if (!scannedSku) {
   
//     return;
//   }

//   let matchedPart = null;

//   for (const part of routeData.partRequirements) {
//     if (!part.regex_pattern) continue;

//     // 🔥 Replace (PART_CODE) with actual part_no
//     const finalPattern = part.regex_pattern.replace(
//       "PART_CODE",
//       part.part_no
//     );

//     const regex = new RegExp(finalPattern);

//     // 1️⃣ Regex match
//     if (!regex.test(scannedSku)) continue;

//     // 2️⃣ Length validation
//     if (
//       (part.min_len && scannedSku.length < part.min_len) ||
//       (part.max_len && scannedSku.length > part.max_len)
//     ) {
//       continue;
//     }

//     matchedPart = part;
//     break;
//   }

//  if (!matchedPart) {
//   setWrongSku(true);
//   showAlert("error", "WRONG PART SCANNED ❌", true);
 
//   return;
// }

//   setWrongSku(false);
//   setLastScannedSku(matchedPart.part_no);

// setScanQtyMap((prev) => {
//   const current = prev[matchedPart.part_no] || 0;

//   // ❌ Duplicate not allowed
//   if (!matchedPart.allow_duplicate && current >= 1) {
//     showAlert("error", "DUPLICATE SCAN NOT ALLOWED ❌", true);
//     return prev;
//   }

//   // ❌ Exceeds required qty
//   if (current >= matchedPart.qty_required) {
//     showAlert("warning", "REQUIRED QTY ALREADY COMPLETED ⚠", true);
//     return prev;
//   }

//   return {
//     ...prev,
//     [matchedPart.part_no]: current + 1,
//   };
// });

//   setScannedValue("");
// };

const savePartScanToDb = async ({
  matchedPart,
  barcode,
  status,
  reason = null
}) => {
  try {
    if (!routeData?.unitData?.unit_id) {
      console.error("Unit ID missing");
      return;
    }

    if (!routeData?.routeStep?.route_step_id) {
      console.error("Route Step ID missing");
      return;
    }

    const payload = {
      unit_id: routeData.unitData.unit_id,
      event_ts: new Date().toISOString(),
      route_step_id: routeData.routeStep.route_step_id,
      part_id: matchedPart?.part_id || null,
      barcode_value: barcode,
      result: status, // 'OK' only now
      reason: reason
    };

    const res = await fetch(`${API_BASE_URL}/api/part-scan-results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!json.success) {
      console.error("DB Insert Failed:", json.message);
    } else {
      console.log("Scan saved:", json.data);
    }

  } catch (err) {
    console.error("Part Scan Save Error:", err);
  }
};


const handleScan = async () => {
  // 1) Block if final result already PASS
  if (finalResult === "PASS") {
    showAlert("warning", "SCAN NOT ALLOWED - STATUS PASS ✅", true);
    return;
  }

  if (!scannedValue) return;
  if (!routeData?.partRequirements) return;

  const scannedSku = scannedValue.replace(/[\r\n]/g, "").trim();
  setLastScanText(scannedSku);

  if (!scannedSku) return;

  let matchedPart = null;

  // ================= FIND MATCH =================
  for (const part of routeData.partRequirements) {
    if (!part.regex_pattern) continue;

    const finalPattern = part.regex_pattern.replace(
      "PART_CODE",
      part.part_no
    );

    const regex = new RegExp(finalPattern);

    if (!regex.test(scannedSku)) continue;

    if (
      (part.min_len && scannedSku.length < part.min_len) ||
      (part.max_len && scannedSku.length > part.max_len)
    ) {
      continue;
    }

    matchedPart = part;
    break;
  }

  // ================= WRONG PART =================
  if (!matchedPart) {
    setWrongSku(true);
    showAlert("error", "WRONG PART SCANNED ❌", true);

    // ❌ DO NOT SAVE WRONG PART TO DB
    setScannedValue("");
    return;
  }

  setWrongSku(false);

  const currentCount = scanQtyMap[matchedPart.part_no] || 0;

  // ================= BLOCK IF QTY COMPLETED =================
  if (currentCount >= matchedPart.qty_required) {
    showAlert("warning", "PART ALREADY COMPLETED ✅", true);
    setScannedValue("");
    return; // 🚫 DO NOT SAVE
  }

  // ================= BLOCK DUPLICATE (WHEN NOT ALLOWED) =================
  if (!matchedPart.allow_duplicate && currentCount > 0) {
    showAlert("error", "DUPLICATE SCAN NOT ALLOWED ❌", true);
    setScannedValue("");
    return; // 🚫 DO NOT SAVE
  }

  // ================= VALID SCAN =================
  setScanQtyMap((prev) => ({
    ...prev,
    [matchedPart.part_no]: currentCount + 1,
  }));

  setLastScannedSku(matchedPart.part_no);

  // ✅ ONLY HERE WE SAVE TO DB (OK)
  await savePartScanToDb({
    matchedPart,
    barcode: scannedSku,
    status: "OK",
    reason: null
  });

  setScannedValue("");
};
  /* ================= ROW STYLE ================= */
const getRowStyle = (row) => {
  const scanned = scanQtyMap[row.sku] || 0;

  if (scanned === 0) {
    return {
      backgroundColor: "#ffffff",
      color: "#000"
    };
  }

  // 🟠 Scanned but not complete
  if (scanned > 0 && scanned < row.qty) {
    return {
      backgroundColor: "#ffa500",
      color: "#000",
      fontWeight: "bold"
    };
  }

  // 🟢 Fully completed
  if (scanned >= row.qty) {
    return {
      backgroundColor: "#00ff00",
      color: "#000",
      fontWeight: "bold"
    };
  }

  return {};
};

const dynamicBorderColor = isPass
  ? "#00ff00"
  : isFail
  ? "#ff0033"
  : null;

return (
  <>
   {isInvalidStage ? (
      <div style={{ background: "black", color: "white", padding: 40 }}>
        Invalid Stage Number
      </div>
    ) : (
<div
  style={{
    ...ui.root,
    borderLeft: `6px solid ${mqttConnected ? "#00ff00" : "#ff0033"}`,
    borderTop: `6px solid ${mqttConnected ? "#00ff00" : "#ff0033"}`,
    borderRight: `6px solid ${mqttConnected ? "#00ff00" : "#ff0033"}`,
    boxShadow: `0 0 30px ${mqttConnected ? "#00ff00" : "#ff0033"}`
  }}
>


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
<div
  style={{
    ...ui.leftBox,
    border: `4px solid ${dynamicBorderColor || "#d000ff"}`
  }}
>
  {/* Stage Row */}
  <div style={ui.stageRow}>
    <div
  style={{
    ...ui.stageCircleOuter,
    border: `4px solid ${dynamicBorderColor || "#d000ff"}`
  }}
>
     <div
  style={{
    ...ui.stageCircleInner,
    border: `4px solid ${isPass ? "#00ff00" : "#00ff00"}`
  }}
>
        {stageNumber}
      </div>
    </div>

    <div style={ui.stageNameBox}>
      <div style={ui.stageTitle}>Stage</div>
      <div style={ui.stageName}>
        {routeData?.routeStep?.stage_name || "-"}
      </div>
    </div>
  </div>

  {/* DATE + TIME SECTION */}
  <div style={ui.dateTimeContainer}>

    <div style={ui.dateTimeRow}>
      <div style={ui.dateTag}>DATE</div>
      <div style={ui.dateValue}>
        {new Date().toLocaleDateString()}
      </div>
    </div>

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
  <div
  style={{
    ...ui.rightBox,
   border: `4px solid ${dynamicBorderColor || "#00cfff"}`
  }}
>
  <div style={ui.vinContainer}>
  <span style={ui.vinLabel}>VIN :</span>
  <span style={ui.vinValue}>{vin || "-"}</span>
</div>

{/* SCAN ROW */}
<div style={{ ...ui.scanRow, display: "flex", alignItems: "center", gap: 15 }}>
  
  <div style={ui.scanLabel}>Scanned Data</div>

  <input
    ref={scanInputRef}
    value={scannedValue}
    disabled={
      finalResult === "PASS" ||
      !vin ||
      !routeData
    }
    onChange={(e)=>setScannedValue(e.target.value)}
    onKeyDown={(e)=>e.key==="Enter" && handleScan()}
    style={{
      ...ui.scanInput,
      width: 200   // 🔥 reduced width
    }}
  />

  {/* Previous Scan Display */}
  <div style={{
      minWidth: 180,
      fontWeight: "bold",
      color: "#00ffff"
  }}>
    {lastScanText}
  </div>

</div>


<div
  style={{
    ...ui.resultBox,
    border: `4px solid ${dynamicBorderColor || "#00ff00"}`,
    background:
      finalResult === "PASS"
        ? "#00ff00"
        : finalResult === "FAIL"
        ? "#ff0033"
        : "#000",
    color:
      finalResult === "PASS"
        ? "#000"
        : "#fff",
  }}
>
  {finalResult || "-"}
</div>


    {/* PART TABLE */}
<div style={ui.tableContainer}>
  <table style={ui.table}>
    <thead>
      <tr style={{ background:"#f5f5f5" }}>
        <th style={ui.th}>SKU</th>
        <th style={ui.th}>NAME</th>
        <th style={ui.th}>REQ</th>
        <th style={ui.th}>SCAN</th>
      </tr>
    </thead>
    <tbody>
      {parts.map((row,i)=>(
     <tr key={i} style={getRowStyle(row)}>
          <td style={ui.td}>{row.sku}</td>
          <td style={ui.td}>{row.name}</td>
          <td style={ui.td}>{row.qty}</td>
          <td style={ui.td}>{scanQtyMap[row.sku] || 0}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  </div>

</div>
  {alert.type && (
  <div
    style={{
     
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 20,
      // background:
      //   alert.type === "error"
      //     ? "#ff0033"
      //     : alert.type === "warning"
      //     ? "#ffa500"
      //     : "#00ff00",
      color: alert.type === "success" ? "#03c50c" : "#fc8383"
    }}
  >
    {alert.message}
  </div>
)}

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
  justifyContent:"space-between",
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
  padding:"10px 10px 30px 10px",
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

dateTimeContainer:{
  flex:1,                        // takes remaining space
  display:"flex",
  alignItems:"center",
  flexDirection:"column",
  justifyContent:"space-around", // DATE top, TIME bottom
  marginTop:20
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
  fontSize:18,
  fontWeight:"bold",
  minWidth:70,
  textAlign:"center"
},

dateValue:{
  fontSize:24,
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

vinContainer:{
  background:"#ccc",
  color:"#000",
  padding:10,
  borderRadius:10,
  fontSize:22,
  fontWeight:"bold",
  display:"flex",
  gap:15,
  alignItems:"center"
},

vinLabel:{
  color:"#000",
  fontWeight:"bold"
},

vinValue:{
  color:"#000",
  letterSpacing:2
},

th:{
  padding:10,
  border:"1px solid #ccc",
  fontWeight:"bold",
  fontSize:16
},

td:{
  padding:8,
  border:"1px solid #ddd",
  fontSize:15
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

scanRow:{
  display:"flex",
  alignItems:"center",
  gap:15
},

scanLabel:{
  color:"#ffd700",
  fontSize:20,
  fontWeight:"bold",
  minWidth:140
},

scanInput:{
  flex:1,                 // 🔥 takes remaining width
  height:45,
  fontSize:20,
  padding:10,
  borderRadius:8
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
  overflow:"auto",
  background:"#ffffff",
  borderRadius:10,
  padding:5
},

table:{
  width:"100%",
  borderCollapse:"collapse",
  background:"#ffffff",
  color:"#000"
},

footer:{
  background:"#ff8c00",
  color:"#000",
  textAlign:"center",
  padding:4,
  fontWeight:"bold"
}

};
