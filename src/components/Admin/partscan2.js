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
const STATIC_PREPITCH_TOPIC = "PREPITCH";



const isInvalidStage = !stageNumber || isNaN(stageNumber);
const [mqttSignals, setMqttSignals] = useState([]);


const mqttClientRef = useRef(null);



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




//   if (!vinSignal?.topic && !prepitchSignal?.topic) return;

//   const client = mqtt.connect("ws://localhost:9001");

//   mqttClientRef.current = client;

//   client.on("connect", () => {
//     console.log("MQTT Connected");

//     if (vinSignal?.topic) {
//       client.subscribe(vinSignal.topic);
//       console.log("Subscribed VIN:", vinSignal.topic);
//     }

//     if (prepitchSignal?.topic) {
//       client.subscribe(prepitchSignal.topic);
//       console.log("Subscribed PrePitch:", prepitchSignal.topic);
//     }
//   });

//   client.on("message", (topic, message) => {
//     const value = message.toString().trim();

//     if (topic === vinSignal?.topic && value) {
//       handleNewVin(value);
//     }

//     if (topic === prepitchSignal?.topic) {
//       const prepitchVal = Number(value || 0);
//       setPrePitchValue(prepitchVal);
//     }
//   });

//   client.on("error", (err) => {
//     console.error("MQTT Error:", err);
//   });

//   return () => {
//     client.end();
//   };

// }, [vinSignal?.topic, prepitchSignal?.topic]);


// useEffect(() => {
//   if (!vinSignal?.topic && !prepitchSignal?.topic) return;

//   let reconnectTimeout = null;

//   const connectMqtt = () => {
//     console.log("Connecting MQTT...");

//     const client = mqtt.connect("ws://192.168.1.15:9001", {
//       reconnectPeriod: 3000,   // 🔥 auto reconnect every 3 sec
//       connectTimeout: 4000,
//       clean: true,
//       keepalive: 60,
//     });

//     mqttClientRef.current = client;

//     client.on("connect", () => {
//       console.log("✅ MQTT Connected");

//       if (vinSignal?.topic) {
//         client.subscribe(vinSignal.topic, { qos: 0 });
//         console.log("Subscribed VIN:", vinSignal.topic);
//       }

//       if (prepitchSignal?.topic) {
//         client.subscribe(prepitchSignal.topic, { qos: 0 });
//         console.log("Subscribed PrePitch:", prepitchSignal.topic);
//       }
//     });

//     client.on("message", (topic, message) => {
//       const value = message.toString().trim();

//       if (topic === vinSignal?.topic && value) {
//         handleNewVin(value);
//       }

//       if (topic === prepitchSignal?.topic) {
//         setPrePitchValue(Number(value || 0));
//       }
//     });

//     client.on("reconnect", () => {
//       console.log("🔄 MQTT Reconnecting...");
//     });

//     client.on("close", () => {
//       console.log("⚠️ MQTT Connection Closed");
//     });

//     client.on("offline", () => {
//       console.log("📴 MQTT Offline");
//     });

//     client.on("error", (err) => {
//       console.error("❌ MQTT Error:", err.message);
//       client.end();
//     });

//     return client;
//   };

//   const client = connectMqtt();

//   return () => {
//     console.log("Cleaning MQTT...");
//     if (client) {
//       client.end(true);
//     }
//     if (reconnectTimeout) {
//       clearTimeout(reconnectTimeout);
//     }
//   };

// }, [vinSignal?.topic, prepitchSignal?.topic]);


useEffect(() => {
  if (!vinSignal?.topic) return;

  console.log("🚀 useEffect triggered");
  console.log("VIN Topic:", vinSignal?.topic);

  const client = mqtt.connect("ws://localhost:9001", {
    reconnectPeriod: 3000,
    connectTimeout: 4000,
    clean: true,
    keepalive: 60,
  });

  mqttClientRef.current = client;

  client.on("connect", () => {
    console.log("✅ MQTT Connected");

    // VIN topic from API
    client.subscribe(vinSignal.topic, { qos: 0 });
    console.log("📡 Subscribed VIN:", vinSignal.topic);

    // Static PrePitch
    client.subscribe(STATIC_PREPITCH_TOPIC, { qos: 0 });
    console.log("📡 Subscribed Static PrePitch:", STATIC_PREPITCH_TOPIC);
  });

  client.on("message", (topic, message) => {
    const value = message.toString().trim();

    if (topic === vinSignal.topic && value) {
      handleNewVin(value);
    }

    if (topic === STATIC_PREPITCH_TOPIC) {
      setPrePitchValue(Number(value || 0));
    }
  });

  client.on("reconnect", () => {
    console.log("🔄 MQTT Reconnecting...");
  });

  client.on("offline", () => {
    console.log("📴 MQTT Offline");
  });

  client.on("error", (err) => {
    console.error("❌ MQTT Error:", err.message);
  });

  return () => {
    console.log("🧹 Cleaning MQTT Connection...");
    client.end(true);
  };

}, [vinSignal?.topic]);



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
    }
    return;
  }

  // ================= FAIL LOGIC =================
  if (!allScanned && prepitch === 1) {
    if (finalResult !== "FAIL") {
      setFinalResult("FAIL");
      setIsInterlocked(true);
      publishPartScanStatus("FAIL"); // 🔥 send only when prepitch = 1
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
  if (!partScanSignal?.topic) return;
  if (!mqttClientRef.current) return;

  try {
    mqttClientRef.current.publish(
      partScanSignal.topic,
      status,
      { qos: 0, retain: false }
    );

    console.log("MQTT Published:", status);
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
      console.error("Invalid VIN response structure");
      setRouteData(null);
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
  if (!routeData?.partRequirements) return;

  const scannedSku = scannedValue.replace(/[\r\n]/g, "").trim();

  if (!scannedSku) {
    setScannedValue("");
    return;
  }

  let matchedPart = null;

  for (const part of routeData.partRequirements) {
    if (!part.regex_pattern) continue;

    // 🔥 Replace (PART_CODE) with actual part_no
    const finalPattern = part.regex_pattern.replace(
      "PART_CODE",
      part.part_no
    );

    const regex = new RegExp(finalPattern);

    // 1️⃣ Regex match
    if (!regex.test(scannedSku)) continue;

    // 2️⃣ Length validation
    if (
      (part.min_len && scannedSku.length < part.min_len) ||
      (part.max_len && scannedSku.length > part.max_len)
    ) {
      continue;
    }

    matchedPart = part;
    break;
  }

  if (!matchedPart) {
    setWrongSku(true);
    setScannedValue("");
    return;
  }

  setWrongSku(false);
  setLastScannedSku(matchedPart.part_no);

  setScanQtyMap((prev) => {
    const current = prev[matchedPart.part_no] || 0;

    if (current >= matchedPart.qty_required) return prev;

    return {
      ...prev,
      [matchedPart.part_no]: current + 1,
    };
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
        {stageNumber}
      </div>
    </div>

    <div style={ui.stageNameBox}>
      <div style={ui.stageTitle}>Stage</div>
      <div style={ui.stageName}>
        {routeData?.routeStep?.stage_name || "Part Scanning"}
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
  <div style={ui.rightBox}>
    <div style={ui.vinDisplay}>
      {vin || "-"}
    </div>

{/* SCAN ROW */}
<div style={ui.scanRow}>
  <div style={ui.scanLabel}>Scanned Data</div>

  <input
    ref={scanInputRef}
    value={scannedValue}
    onChange={(e)=>setScannedValue(e.target.value)}
    onKeyDown={(e)=>e.key==="Enter" && handleScan()}
    style={ui.scanInput}
  />
</div>


<div
  style={{
    ...ui.resultBox,
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
        <tr key={i}>
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
