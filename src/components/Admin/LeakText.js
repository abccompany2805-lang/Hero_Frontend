

// Code with dummy data 
// import React, { useEffect, useState } from "react";

// const DCToolHMI = () => {
//   const [now, setNow] = useState(new Date());

//   // Dummy states (later from DB / MQTT)
//   const [operationMode, setOperationMode] = useState("ACTIVE"); // ACTIVE | MANUAL
//   const [lineStatus, setLineStatus] = useState("INTERLOCKED"); // INTERLOCKED | BYPASSED

//   /* ===== REAL-TIME CLOCK ===== */
//   useEffect(() => {
//     const timer = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   /* ===== DUMMY MODE TOGGLE ===== */
//   useEffect(() => {
//     const modeTimer = setInterval(() => {
//       setOperationMode((prev) => (prev === "AUTO" ? "MANUAL" : "AUTO"));
//     }, 5000);

//     return () => clearInterval(modeTimer);
//   }, []);

//   /* ===== DUMMY LINE STATUS TOGGLE ===== */
//   useEffect(() => {
//     const statusTimer = setInterval(() => {
//       setLineStatus((prev) =>
//         prev === "INTERLOCKED" ? "BYPASSED" : "INTERLOCKED",
//       );
//     }, 6000);

//     return () => clearInterval(statusTimer);
//   }, []);

//   const formatDate = now.toLocaleDateString("en-GB");
//   const formatTime = now.toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });

//   return (
//     <div style={styles.root}>
//       {/* ================= HEADER ================= */}
//       <div style={styles.header}>
//         {/* LEFT LOGO */}
//         <img src="/hero-logo.png" alt="Hero Logo" style={styles.heroLogo} />

//         {/* CENTER TITLE */}
//         <div style={styles.headerPill}>
//           <div style={styles.headerTitle}>LEAK TEST STAGE</div>
//         </div>

//         {/* RIGHT LOGO */}
//         <img
//           src="/operatex-logo.jpg"
//           alt="OperateX Logo"
//           style={styles.operatexLogo}
//         />
//       </div>

//       {/* ================= MODEL ROW ================= */}
//       <div style={styles.modelRow}>
//         <div style={styles.modelText}>
//           Model:{" "}
//           <span style={styles.modelValue}>
//             FUEL SYSTEM LEAK TEST 
//           </span>
//         </div>
//         <div style={styles.mqtt}>MQTT Connected</div>
//       </div>

//       {/* ================= LINE STATUS ================= */}
//       <div style={styles.lineStatusRow}>
//         {/* LEFT */}
//         <div style={styles.lineStatusLeft}>
//           <span style={styles.lineStatusTitle}>LINE STATUS :</span>
//           <span
//             style={{
//               ...styles.lineStatusValue,
//               color: lineStatus === "INTERLOCKED" ? "#00ff00" : "#ff8000df",
//               textShadow:
//                 lineStatus === "INTERLOCKED"
//                   ? "0 0 10px #00ff00"
//                   : "0 0 10px #ff8000df",
//             }}
//           >
//             {lineStatus}
//           </span>
//         </div>

//         {/* RIGHT */}
//         <div style={styles.lineStatusRight}>
//           <span
//             style={{
//               ...styles.lineActive,
//               opacity: operationMode === "AUTO" ? 1 : 0.3,
//               textShadow:
//                 operationMode === "AUTO" ? "0 0 8px #00ff00" : "none",
//             }}
//           >
//             AUTO
//           </span>

//           <span style={styles.lineSeparator}>|</span>

//           <span
//             style={{
//               ...styles.lineManual,
//               opacity: operationMode === "MANUAL" ? 1 : 0.3,
//               textShadow:
//                 operationMode === "MANUAL" ? "0 0 8px #ffd000" : "none",
//             }}
//           >
//             MANUAL
//           </span>
//         </div>
//       </div>

//       {/* ================= BODY ================= */}
//       <div style={styles.body}>
//         {/* LEFT PANEL */}
//         <div style={styles.leftPanel}>
//           <div style={styles.circleRow}>
//             <div style={styles.circleOuter}>
//               <div style={styles.circleInner}>
//                 <div style={styles.circleValue}>10</div>
//               </div>
//               <div style={styles.circleLabel}>
//                 Stage
//                 <br />
//                 Number
//               </div>
//             </div>

//             <div style={styles.circleOuter}>
//               <div style={styles.circleInner}>
//                 <div style={styles.circleValue}>LH</div>
//               </div>
//               <div style={styles.circleLabel}>Side</div>
//             </div>
//           </div>

//           <div style={styles.dateTimeBlock}>
//             <div style={styles.dateTimeRow}>
//               <div style={styles.dateTimeLabel}>DATE</div>
//               <div style={styles.dateTimeValue}>{formatDate}</div>
//             </div>

//             <div style={styles.dateTimeRow}>
//               <div style={styles.dateTimeLabel}>TIME</div>
//               <div style={styles.dateTimeValue}>{formatTime}</div>
//             </div>
//           </div>
//         </div>

//         {/* TORQUE LIMIT */}
//         <div style={styles.torqueLimits}>
//           <div style={styles.torqueBox}>
//             <div style={styles.torqueValue}>4.5</div>
//             <div style={styles.torqueLabel}>
//               MINIMUM
//               <br />
//               LEAK VALUE
//             </div>
//           </div>

//           <div style={styles.torqueDivider} />

//           <div style={styles.torqueBox}>
//             <div style={styles.torqueValue}>5.5</div>
//             <div style={styles.torqueLabel}>
//               MAXIMUM
//               <br />
//               LEAK VALUE
//             </div>
//           </div>
//         </div>

//         {/* RIGHT PANEL */}
//         <div style={styles.rightPanel}>
//           <div style={styles.vinBox}>VIN: MD2B68BX2TWL20741</div>

//           <div style={styles.skuBlock}>
//             <div style={styles.skuRow}>
//               <div style={styles.skuText}>
//                 SKU: <span style={styles.yellow}>00DH71D7</span>
//               </div>
//               <div style={styles.resultBtn}>RESULT</div>
//             </div>

           
//           </div>

//           <div style={styles.torqueDisplay}>
//             <div style={styles.torqueIndicator}></div>
//           </div>

//           <div style={styles.torqueText}>
//             LEAK
//             <br />
//             VALUE
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ================= STYLES ================= */
// const styles = {
//   root: {
//     width: "100%",
//     height: "95vh",
//     background: "#000",
//     color: "#fff",
//     fontFamily: "Segoe UI, Arial, sans-serif",

//     /* FULL BLUE BORDER – ALL 4 SIDES */
//     border: "6px solid #00c3ff",
//     boxSizing: "border-box",

//     /* REMOVE GAP */
//     margin: 0,
//     marginTop: 47,

//     /* OPTIONAL: industrial double-line look */
//     outline: "2px solid #0099cc",
//     outlineOffset: -8,
//   },

//   header: {
//     height: 80,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     position: "relative", // ⬅️ IMPORTANT
//   },

//   heroLogo: {
//     position: "absolute",
//     left: 23,
//     height: 55,
//     objectFit: "contain",
//   },

//   operatexLogo: {
//     position: "absolute",
//     right: 23,
//     height: 55,
  
//     objectFit: "contain",
//   },

//   headerPill: {
//     width: "50%",
//     background: "#12bdf2",
//     borderRadius: "0 0 22px 22px",
//     padding: "12px 0",
//     textAlign: "center",
//   },

//   headerTitle: {
//     fontSize: 35,
//     fontWeight: "bold",
//     color: "#000",
//   },

//   modelRow: {
//     display: "flex",
//     padding: "8px 20px",
//     borderBottom: "5px solid #222",
//     marginTop: 20,
//   },

//   modelText: {
//     flex: 1,
//     color: "#ffd000",
//     fontSize: 35,
//   },

//   modelValue: { fontWeight: "bold" },

//   mqtt: {
//     color: "#00ff00",
//     fontSize: 28,
//     fontWeight: "bold",
//   },

//   lineStatusRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "10px 20px",
//     background: "#111",
//     borderBottom: "2px solid #222",
//   },

//   lineStatusLeft: {
//     display: "flex",
//     alignItems: "center",
//   },

//   lineStatusTitle: {
//     fontSize: 32,
//     color: "#00c3ff",
//     marginRight: 10,
//     fontWeight: "bold",
//   },

//   lineStatusValue: {
//     fontSize: 32,
//     fontWeight: "bold",
//   },

//   lineStatusRight: {
//     display: "flex",
//     alignItems: "center",
//     fontSize: 28,
//     fontWeight: "bold",
//   },

//   lineActive: { color: "#00ff00" },
//   lineManual: { color: "#ffd000" },
//   lineSeparator: { margin: "0 10px", color: "#888" },

//   body: {
//     display: "flex",
//     padding: "20px 0",
//     gap: 20,
//   },

//   leftPanel: {
//     width: 500,
//     border: "4px solid #b400ff",
//     borderRadius: 16,
//     padding: 16,
//     height: 500,
//   },

//   circleRow: {
//     display: "flex",
//     justifyContent: "center", // ⬅️ centers both circles together
//     alignItems: "flex-start",
//     gap: 80,
//     marginTop: 20, // ⬅️ space between the two circles
//   },

//   circleOuter: { textAlign: "center" },

//   circleInner: {
//     width: 130,
//     height: 130,
//     borderRadius: "60%",
//     border: "4px solid #00ff00",
//     outline: "4px solid #b400ff",
//     outlineOffset: 5,
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   circleValue: {
//     fontSize: 46,
//     color: "#ffd000",
//     fontWeight: "bold",
//   },

//   circleLabel: {
//     marginTop: 12,
//     fontSize: 23,
//     fontWeight: "bold",
//   },

//   dateTimeBlock: {
//     marginTop: 100,
//     display: "flex",
//     flexDirection: "column",
//     gap: 16,
//   },

//   dateTimeRow: {
//     display: "flex",
//     gap: 30,
//     alignItems: "center",
//   },

//   dateTimeLabel: {
//     background: "#fff",
//     color: "#000",
//     padding: "6px 14px",
//     borderRadius: 6,
//     fontWeight: "bold",
//     fontSize: 20,
//   },

//   dateTimeValue: {
//     fontSize: 34,
//     fontWeight: "bold",
//   },

//   torqueLimits: {
//     width: 180,
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   torqueBox: { textAlign: "center" },

//   torqueValue: {
//     fontSize: 60,
//     color: "#ffd000",
//     fontWeight: "bold",
//   },

//   torqueLabel: { fontSize: 16 },

//   torqueDivider: {
//     height: 2,
//     width: "80%",
//     background: "#b400ff",
//     margin: "20px 0",
//   },

//   rightPanel: {
//     flex: 1,
//     border: "4px solid #00c3ff",
//     padding: 10,
//     borderRadius: 16,
//   },

//   vinBox: {
//     background: "#fff",
//     color: "#000",
//     fontSize: 40,
//     fontWeight: "bold",
//     padding: 10,
//     borderRadius: 20,
//     marginBottom: 15,
//   },

//   skuBlock: {
//     display: "flex",
//     flexDirection: "column",
//     gap: 10,
//   },

//   skuRow: {
//     display: "flex",
//     gap: 25,
//     fontSize: 40,
//   },

//   skuText: { color: "#fff" },
//   yellow: { color: "#ffd000", fontWeight: "bold" },

//   resultBtn: {
//     background: "#fff",
//     color: "#000",
//     padding: "6px 18px",
//     borderRadius: 20,

//     marginTop: 10,
//     marginLeft: 250,
//   },

//   angleRow: {
//     fontSize: 40,
//   },

//   torqueDisplay: {
//     height: 150,
//     width: 420,
//     border: "4px solid #00ff00",
//     borderRadius: 20,
//     marginTop: 14,
//     display: "flex",
//     alignItems: "center",
//     padding: 10,
//   },

//   torqueIndicator: {
//     width: 20,
//     height: 12,
//     background: "#00ff00",
//   },

//   torqueText: {
//     color: "#ffd000",
//     fontSize: 20,
//     textAlign: "right",
//     width: "100%",
//     paddingRight: 230,
//     marginTop: -70,
//   },
// };

// export default DCToolHMI;






// Code with api integrated
import React, { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

const LeakTest = () => {
  const [now, setNow] = useState(new Date());

  /* ================= OPERATION STATES ================= */
  const [operationMode, setOperationMode] = useState("AUTO"); // AUTO | MANUAL
  const [lineStatus, setLineStatus] = useState("INTERLOCKED"); // INTERLOCKED | BYPASSED

  /* ================= JOB DATA (FROM API) ================= */
  const [jobData, setJobData] = useState({
    vin: "",
    sku: "",
    model: "",
    stageNo: "",
    side: "",
    minLeak: 0,
    maxLeak: 0,
  });

  /* ================= LIVE DATA (FROM MQTT) ================= */
  const [leakValue, setLeakValue] = useState(null);
  const [result, setResult] = useState(null); // OK | NOT_OK | null

  const lastPublishedResult = useRef(null);
  const mqttClientRef = useRef(null);

  /* ================= REAL TIME CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ================= FETCH JOB DATA FROM API ================= */
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const res = await fetch("http://YOUR_API/leak-test/current");
        const data = await res.json();

        setJobData({
          vin: data.vin,
          sku: data.sku,
          model: data.model,
          stageNo: data.stageNo,
          side: data.side,
          minLeak: data.minLeak,
          maxLeak: data.maxLeak,
        });
      } catch (err) {
        console.error("Job API Error", err);
      }
    };

    fetchJobData();
  }, []);

  /* ================= MQTT CONNECT ================= */
  useEffect(() => {
    const client = mqtt.connect("ws://BROKER_IP:PORT");
    mqttClientRef.current = client;

    client.on("connect", () => {
      client.subscribe("leak/value");
    });

    client.on("message", (topic, message) => {
      if (topic === "leak/value") {
        const value = parseFloat(message.toString());
        if (!isNaN(value)) setLeakValue(value);
      }
    });

    return () => client.end();
  }, []);

  /* ================= LEAK COMPARISON LOGIC ================= */
  useEffect(() => {
    if (leakValue === null) return;

    const { minLeak, maxLeak } = jobData;
    let currentResult = "NOT_OK";

    if (leakValue >= minLeak && leakValue <= maxLeak) {
      currentResult = "OK";
    }

    setResult(currentResult);

    if (lastPublishedResult.current !== currentResult) {
      mqttClientRef.current?.publish(
        "leak/result",
        currentResult === "OK" ? "1" : "0",
      );
      lastPublishedResult.current = currentResult;
    }
  }, [leakValue, jobData]);

  const formatDate = now.toLocaleDateString("en-GB");
  const formatTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div style={styles.root}>
      {/* ================= HEADER ================= */}
      <div style={styles.header}>
        <img src="/hero-logo.png" alt="Hero Logo" style={styles.heroLogo} />

        <div style={styles.headerPill}>
          <div style={styles.headerTitle}>LEAK TEST STAGE</div>
        </div>

        <img
          src="/operatex-logo.jpg"
          alt="OperateX Logo"
          style={styles.operatexLogo}
        />
      </div>

      {/* ================= MODEL ROW ================= */}
      <div style={styles.modelRow}>
        <div style={styles.modelText}>
          Model: <span style={styles.modelValue}>{jobData.model}</span>
        </div>
        <div style={styles.mqtt}>MQTT Connected</div>
      </div>

      {/* ================= LINE STATUS ================= */}
      <div style={styles.lineStatusRow}>
        <div style={styles.lineStatusLeft}>
          <span style={styles.lineStatusTitle}>LINE STATUS :</span>
          <span
            style={{
              ...styles.lineStatusValue,
              color:
                lineStatus === "INTERLOCKED" ? "#00ff00" : "#ff8000df",
              textShadow:
                lineStatus === "INTERLOCKED"
                  ? "0 0 10px #00ff00"
                  : "0 0 10px #ff8000df",
            }}
          >
            {lineStatus}
          </span>
        </div>

        <div style={styles.lineStatusRight}>
          <span
            style={{
              ...styles.lineActive,
              opacity: operationMode === "AUTO" ? 1 : 0.3,
            }}
          >
            AUTO
          </span>
          <span style={styles.lineSeparator}>|</span>
          <span
            style={{
              ...styles.lineManual,
              opacity: operationMode === "MANUAL" ? 1 : 0.3,
            }}
          >
            MANUAL
          </span>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div style={styles.body}>
        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          <div style={styles.circleRow}>
            <div style={styles.circleOuter}>
              <div style={styles.circleInner}>
                <div style={styles.circleValue}>{jobData.stageNo}</div>
              </div>
              <div style={styles.circleLabel}>Stage<br />Number</div>
            </div>

            <div style={styles.circleOuter}>
              <div style={styles.circleInner}>
                <div style={styles.circleValue}>{jobData.side}</div>
              </div>
              <div style={styles.circleLabel}>Side</div>
            </div>
          </div>

          <div style={styles.dateTimeBlock}>
            <div style={styles.dateTimeRow}>
              <div style={styles.dateTimeLabel}>DATE</div>
              <div style={styles.dateTimeValue}>{formatDate}</div>
            </div>
            <div style={styles.dateTimeRow}>
              <div style={styles.dateTimeLabel}>TIME</div>
              <div style={styles.dateTimeValue}>{formatTime}</div>
            </div>
          </div>
        </div>

        {/* LIMITS */}
        <div style={styles.torqueLimits}>
          <div style={styles.torqueBox}>
            <div style={styles.torqueValue}>{jobData.minLeak}</div>
            <div style={styles.torqueLabel}>MINIMUM<br />LEAK VALUE</div>
          </div>

          <div style={styles.torqueDivider} />

          <div style={styles.torqueBox}>
            <div style={styles.torqueValue}>{jobData.maxLeak}</div>
            <div style={styles.torqueLabel}>MAXIMUM<br />LEAK VALUE</div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.rightPanel}>
          <div style={styles.vinBox}>VIN: {jobData.vin}</div>

          <div style={styles.skuRow}>
            <div style={styles.skuText}>
              SKU: <span style={styles.yellow}>{jobData.sku}</span>
            </div>

            <div
              style={{
                ...styles.resultBtn,
                background:
                  result === "OK"
                    ? "#00ff00"
                    : result === "NOT_OK"
                    ? "#ff0000"
                    : "#888",
                boxShadow:
                  result === "OK"
                    ? "0 0 15px #00ff00"
                    : result === "NOT_OK"
                    ? "0 0 15px #ff0000"
                    : "none",
              }}
            >
              {result ?? "WAIT"}
            </div>
          </div>

          <div style={styles.torqueDisplay}>
            <div style={styles.torqueIndicator}>
              <span style={{ fontSize: 40, fontWeight: "bold" }}>
                {leakValue ?? "--"}
              </span>
            </div>
          </div>

          <div style={styles.torqueText}>
            LEAK<br />VALUE
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  root: {
    width: "100%",
    height: "95vh",
    background: "#000",
    color: "#fff",
    fontFamily: "Segoe UI, Arial, sans-serif",

    /* FULL BLUE BORDER – ALL 4 SIDES */
    border: "6px solid #00c3ff",
    boxSizing: "border-box",

    /* REMOVE GAP */
    margin: 0,
    marginTop: 47,

    /* OPTIONAL: industrial double-line look */
    outline: "2px solid #0099cc",
    outlineOffset: -8,
  },

  header: {
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // ⬅️ IMPORTANT
  },

  heroLogo: {
    position: "absolute",
    left: 23,
    height: 55,
    objectFit: "contain",
  },

  operatexLogo: {
    position: "absolute",
    right: 23,
    height: 55,
  
    objectFit: "contain",
  },

  headerPill: {
    width: "50%",
    background: "#12bdf2",
    borderRadius: "0 0 22px 22px",
    padding: "12px 0",
    textAlign: "center",
  },

  headerTitle: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#000",
  },

  modelRow: {
    display: "flex",
    padding: "8px 20px",
    borderBottom: "5px solid #222",
    marginTop: 20,
  },

  modelText: {
    flex: 1,
    color: "#ffd000",
    fontSize: 35,
  },

  modelValue: { fontWeight: "bold" },

  mqtt: {
    color: "#00ff00",
    fontSize: 28,
    fontWeight: "bold",
  },

  lineStatusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    background: "#111",
    borderBottom: "2px solid #222",
  },

  lineStatusLeft: {
    display: "flex",
    alignItems: "center",
  },

  lineStatusTitle: {
    fontSize: 32,
    color: "#00c3ff",
    marginRight: 10,
    fontWeight: "bold",
  },

  lineStatusValue: {
    fontSize: 32,
    fontWeight: "bold",
  },

  lineStatusRight: {
    display: "flex",
    alignItems: "center",
    fontSize: 28,
    fontWeight: "bold",
  },

  lineActive: { color: "#00ff00" },
  lineManual: { color: "#ffd000" },
  lineSeparator: { margin: "0 10px", color: "#888" },

  body: {
    display: "flex",
    padding: "20px 0",
    gap: 20,
  },

  leftPanel: {
    width: 500,
    border: "4px solid #b400ff",
    borderRadius: 16,
    padding: 16,
    height: 500,
  },

  circleRow: {
    display: "flex",
    justifyContent: "center", // ⬅️ centers both circles together
    alignItems: "flex-start",
    gap: 80,
    marginTop: 20, // ⬅️ space between the two circles
  },

  circleOuter: { textAlign: "center" },

  circleInner: {
    width: 130,
    height: 130,
    borderRadius: "60%",
    border: "4px solid #00ff00",
    outline: "4px solid #b400ff",
    outlineOffset: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  circleValue: {
    fontSize: 46,
    color: "#ffd000",
    fontWeight: "bold",
  },

  circleLabel: {
    marginTop: 12,
    fontSize: 23,
    fontWeight: "bold",
  },

  dateTimeBlock: {
    marginTop: 100,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  dateTimeRow: {
    display: "flex",
    gap: 30,
    alignItems: "center",
  },

  dateTimeLabel: {
    background: "#fff",
    color: "#000",
    padding: "6px 14px",
    borderRadius: 6,
    fontWeight: "bold",
    fontSize: 20,
  },

  dateTimeValue: {
    fontSize: 34,
    fontWeight: "bold",
  },

  torqueLimits: {
    width: 180,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  torqueBox: { textAlign: "center" },

  torqueValue: {
    fontSize: 60,
    color: "#ffd000",
    fontWeight: "bold",
  },

  torqueLabel: { fontSize: 16 },

  torqueDivider: {
    height: 2,
    width: "80%",
    background: "#b400ff",
    margin: "20px 0",
  },

  rightPanel: {
    flex: 1,
    border: "4px solid #00c3ff",
    padding: 10,
    borderRadius: 16,
  },

  vinBox: {
    background: "#fff",
    color: "#000",
    fontSize: 40,
    fontWeight: "bold",
    padding: 10,
    borderRadius: 20,
    marginBottom: 15,
  },

  skuBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  skuRow: {
    display: "flex",
    gap: 25,
    fontSize: 40,
  },

  skuText: { color: "#fff" },
  yellow: { color: "#ffd000", fontWeight: "bold" },

  resultBtn: {
    background: "#fff",
    color: "#000",
    padding: "6px 18px",
    borderRadius: 20,

    marginTop: 10,
    marginLeft: 250,
  },

  angleRow: {
    fontSize: 40,
  },

  torqueDisplay: {
    height: 150,
    width: 420,
    border: "4px solid #00ff00",
    borderRadius: 20,
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    padding: 10,
  },

  torqueIndicator: {
    width: 20,
    height: 12,
    background: "#00ff00",
  },

  torqueText: {
    color: "#ffd000",
    fontSize: 20,
    textAlign: "right",
    width: "100%",
    paddingRight: 230,
    marginTop: -70,
  },
};

export default LeakTest;

