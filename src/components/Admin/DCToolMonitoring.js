
// Code with prepitch logic  and without MQTT Connection logic
// import React, { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import mqtt from "mqtt";

// const API_URL = "http://192.168.1.7:5003/api/vin/get-model-by-vin";

// const MQTT_SIGNAL_API = "http://192.168.1.7:5003/api/mqtt-signal/by-stage-no";

// const DCToolHMI = () => {
//   const [now, setNow] = useState(new Date());

//   /* ================= STAGE ================= */
//   const { stageNo } = useParams();
//   const stageNumber = parseInt(stageNo, 10);
//   const isInvalidStage = isNaN(stageNumber);
//   const torqueTopic = `ST${stageNumber}_Torque`;
//   const angleTopic = `ST${stageNumber}_Angle`;
//   const resultTopic = `ST${stageNumber}_Result`;
//   const prePitchTopic = "PrePitch";

//   /* ================= SYSTEM STATES ================= */
//   const [operationMode, setOperationMode] = useState("AUTO");
//   const [lineStatus, setLineStatus] = useState("INTERLOCKED");

//   /* ================= API DATA STATES ================= */
//   const [vinInput, setVinInput] = useState("");
//   const [modelName, setModelName] = useState("-");
//   const [modelSku, setModelSku] = useState("-");
//   const [minTorque, setMinTorque] = useState("-");
//   const [maxTorque, setMaxTorque] = useState("-");
//   const [showResult, setShowResult] = useState(false);
//   const [showTorqueValue, setShowTorqueValue] = useState(false);
//   const [liveTorque, setLiveTorque] = useState(0);
//   const [liveAngle, setLiveAngle] = useState(0);
//   const [finalStatus, setFinalStatus] = useState(null);
//   const [stageName, setStageName] = useState("-");
//   const mqttClientRef = useRef(null);
//   const [prePitch, setPrePitch] = useState(0);
//   const [resultPublished, setResultPublished] = useState(false);

//   const [mqttSignals, setMqttSignals] = useState([]);
//   const lastVinRef = useRef(null);

//   /* ================= OK / NOT OK LOGIC ================= */
//   const isTorqueOk =
//     minTorque !== "-" &&
//     maxTorque !== "-" &&
//     liveTorque >= Number(minTorque) &&
//     liveTorque <= Number(maxTorque);

//   /* ================= CLOCK ================= */
//   useEffect(() => {
//     const timer = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   /* ================= LOAD MQTT SIGNALS ================= */
//   useEffect(() => {
//     if (isInvalidStage) return;

//     const fetchSignals = async () => {
//       try {
//         const res = await fetch(`${MQTT_SIGNAL_API}/${stageNumber}`);
//         const json = await res.json();

//         if (json.success && json.signals) {
//           setMqttSignals(json.signals.filter((s) => s.active));
//         }
//       } catch (err) {
//         console.error("Signal Load Error:", err);
//       }
//     };

//     fetchSignals();
//   }, [stageNumber]);

//   /* ================= ANIMATION STYLES ================= */
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.innerHTML = `
//       @keyframes fullScreenFlashRed {
//         0% { background-color: #000; }
//         50% { background-color: #330000; }
//         100% { background-color: #000; }
//       }

//       @keyframes fullScreenPulseGreen {
//         0% { background-color: #000; }
//         50% { background-color: #002200; }
//         100% { background-color: #000; }
//       }
//     `;
//     document.head.appendChild(style);
//   }, []);

//   const handleVinKeyDown = (e) => {
//     if (e.key === "Enter") {
//       const trimmed = vinInput.trim();
//       if (!trimmed) return;

//       lastVinRef.current = trimmed; // prevent duplicate MQTT call
//       fetchModelData(trimmed, stageNumber);
//     }
//   };

//   const getRootStyle = () => {
//     let baseStyle = { ...styles.root };

//     if (showResult) {
//       if (finalStatus === "PASS") {
//         baseStyle.animation = "fullScreenPulseGreen 1.5s infinite";
//       } else {
//         baseStyle.animation = "fullScreenFlashRed 0.7s infinite";
//       }
//     }

//     return baseStyle;
//   };

//   /* ================= SIGNAL DETECTION ================= */

//   const vinSignal = mqttSignals.find((s) =>
//     s.topic?.toLowerCase().includes("engineno"),
//   );

//   /* ================= GENERIC MQTT LISTENER ================= */

//   /* ================= VIN LISTENER ================= */

//   useEffect(() => {
//     if (!vinSignal?.topic && !stageNumber) return;

//     if (mqttClientRef.current) {
//       mqttClientRef.current.end(true);
//     }

//     const client = mqtt.connect("ws://192.168.1.7:9001", {
//       reconnectPeriod: 3000,
//       clean: true,
//     });

//     mqttClientRef.current = client;

//     client.on("connect", () => {
//       console.log("MQTT Connected ✅");

//       // VIN dynamic topic
//       if (vinSignal?.topic) {
//         client.subscribe(vinSignal.topic);
//       }

//       // Static Torque + Angle topics
//       client.subscribe(torqueTopic);
//       client.subscribe(angleTopic);
//       client.subscribe(prePitchTopic);
//     });

//     client.on("message", (topic, message) => {
//       const payload = message.toString();

//       /* ===== VIN ===== */
//       if (topic === vinSignal?.topic) {
//         const vin = payload.trim();

//         if (!vin) return;
//         if (lastVinRef.current === vin) return;

//         lastVinRef.current = vin;
//         setVinInput(vin);
//         fetchModelData(vin, stageNumber);
//       }

//       /* ===== Torque ===== */
//       if (topic === torqueTopic) {
//         const value = Number(payload);
//         if (!isNaN(value)) {
//           setLiveTorque(value);
//         }
//       }

//       /* ===== Angle ===== */
//       if (topic === angleTopic) {
//         const value = Number(payload);
//         if (!isNaN(value)) {
//           setLiveAngle(value);
//         }
//       }

//       if (topic === prePitchTopic) {
//         const value = Number(payload);

//         if (!isNaN(value)) {
//           setPrePitch(value);
//           console.log("PrePitch received from DataLogger:", value);
//         }
//       }
//     });

//     client.on("error", (err) => {
//       console.error("MQTT Error:", err);
//     });

//     return () => {
//       client.end();
//     };
//   }, [vinSignal?.topic, stageNumber]);

//   /* ================= TIGHTENING LISTENER ================= */

//   /* ================= PASS / FAIL LOGIC ================= */

//   useEffect(() => {
//   if (
//     minTorque === "-" ||
//     maxTorque === "-" ||
//     liveTorque <= 0 ||
//     !mqttClientRef.current
//   ) {
//     return;
//   }

//   const pass =
//     liveTorque >= Number(minTorque) &&
//     liveTorque <= Number(maxTorque);

//   const result = pass ? "OK" : "NOT_OK";

//   setFinalStatus(pass ? "PASS" : "FAIL");
//   setShowResult(true);
//   setShowTorqueValue(true);

//   // 🔹 CASE 1 → Before PrePitch
//   if (prePitch === 0) {
//     if (pass) {
//       mqttClientRef.current.publish(resultTopic, "OK");
//       console.log("Published OK before PrePitch");
//     }
//     return;
//   }

//   // 🔹 CASE 2 → After PrePitch
//   if (prePitch === 1) {
//     mqttClientRef.current.publish(resultTopic, result);
//     console.log("Published After PrePitch:", result);
//   }

// }, [liveTorque, prePitch]);
//   /* ================= FETCH MODEL DATA ================= */

//   const fetchModelData = async (vin_no, stage_no) => {
//     setFinalStatus(null);
//     setLiveTorque(0);
//     setLiveAngle(0);
//     setShowResult(false);
//     setShowTorqueValue(false);
//     setPrePitch(0);
//     setResultPublished(false);

//     try {
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           vin_no,
//           stage_no,
//         }),
//       });

//       const json = await res.json();
//       if (!json) return;

//       const recipeProcess = json.recipeProcess?.[0];

//       setModelName(json.model?.model_name ?? "-");
//       setModelSku(json.model?.model_code ?? "-");

//       setStageName(json.routeStep?.stage_name ?? "-");

//       setMinTorque(recipeProcess?.lsl ?? "-");
//       setMaxTorque(recipeProcess?.usl ?? "-");
//     } catch (err) {
//       console.error("Model fetch failed", err);
//     }
//   };

//   const formatDate = now.toLocaleDateString("en-GB");
//   const formatTime = now.toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });

//   if (isInvalidStage) {
//     return <div>Invalid Stage Number</div>;
//   }

//   return (
//     <div style={getRootStyle()}>
//       {/* ================= HEADER ================= */}
//       <div style={styles.header}>
//         <img src="/Hero.svg" alt="Hero Logo" style={styles.heroLogo} />
//         <div style={styles.headerPill}>
//           <div style={styles.headerTitle}>FRONT WHEEL AXLE TIGHTENING</div>
//         </div>
//         <img
//           src="/operatex.png"
//           alt="OperateX Logo"
//           style={styles.operatexLogo}
//         />
//       </div>

//       {/* ================= MODEL ROW ================= */}
//       <div style={styles.modelRow}>
//         <div style={styles.modelText}>
//           Model: <span style={styles.modelValue}>{modelName}</span>
//         </div>
//         <div style={styles.mqtt}>MQTT Connected</div>
//       </div>

//       {/* ================= LINE STATUS ================= */}
//       <div style={styles.lineStatusRow}>
//         <div style={styles.lineStatusLeft}>
//           <span style={styles.lineStatusTitle}>LINE STATUS :</span>
//           <span
//             style={{
//               ...styles.lineStatusValue,
//               color: lineStatus === "INTERLOCKED" ? "#00ff00" : "#ff8000df",
//             }}
//           >
//             {lineStatus}
//           </span>
//         </div>

//         <div style={styles.lineStatusRight}>
//           <span
//             style={{
//               ...styles.lineActive,
//               opacity: operationMode === "AUTO" ? 1 : 0.3,
//             }}
//           >
//             AUTO
//           </span>
//           <span style={styles.lineSeparator}>|</span>
//           <span
//             style={{
//               ...styles.lineManual,
//               opacity: operationMode === "MANUAL" ? 1 : 0.3,
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
//                 <div style={styles.circleValue}>{stageNo}</div>
//               </div>
//               <div style={styles.circleLabel}>
//                 Stage
//                 <br />
//                 Number
//               </div>
//             </div>

//             <div style={styles.stageNameBox}>
//               <div style={styles.stageNameText}>{stageName}</div>
//               <div style={styles.stageNameLabel}>
//                 Stage
//                 <br /> Name
//               </div>
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
//             <div style={styles.torqueValue}>{minTorque}</div>
//             <div style={styles.torqueLabel}>
//               MINIMUM
//               <br />
//               TORQUE
//             </div>
//           </div>
//           <div style={styles.torqueDivider} />
//           <div style={styles.torqueBox}>
//             <div style={styles.torqueValue}>{maxTorque}</div>
//             <div style={styles.torqueLabel}>
//               MAXIMUM
//               <br />
//               TORQUE
//             </div>
//           </div>
//         </div>

//         {/* RIGHT PANEL */}
//         <div style={styles.rightPanel}>
//           <input
//             style={styles.vinBox}
//             placeholder="ENTER VIN & PRESS ENTER"
//             value={vinInput}
//             onChange={(e) => {
//               setVinInput(e.target.value);
//               setShowResult(false);
//               setShowTorqueValue(false);
//             }}
//             onKeyDown={handleVinKeyDown}
//           />

//           <div style={styles.skuBlock}>
//             <div style={styles.skuRow}>
//               <div style={styles.skuText}>
//                 SKU - <span style={styles.yellow}>{modelSku}</span>
//               </div>
//             </div>

//             <div style={styles.angleRow}>
//               ANGLE -{" "}
//               {showTorqueValue && (
//                 <span style={styles.yellow}>{liveAngle}°</span>
//               )}
//             </div>
//           </div>

//           <div style={styles.torqueDisplay}>
//             <div
//               style={{
//                 fontSize: 80,
//                 fontWeight: "bold",
//                 color: isTorqueOk ? "#00ff00" : "#ff0033",
//                 textAlign: "center",
//                 width: "100%",
//                 textShadow: isTorqueOk
//                   ? "0 0 15px #00ff00"
//                   : "0 0 15px #ff0033",
//                 ...(showResult ? styles.blinkText : {}),
//               }}
//             >
//               {showResult && finalStatus}
//             </div>
//           </div>

//           <div style={styles.torqueText}>
//             {showTorqueValue && (
//               <div style={{ fontSize: 60, fontWeight: "bold" }}>
//                 {liveTorque} Nm
//               </div>
//             )}
//             TORQUE
//             <br />
//             VALUE
//           </div>
//         </div>
//       </div>
//       {/* FOOTER */}
//       <div style={styles.footer}>
//         Powered by{" "}
//         <span style={styles.footerHighlight}>Operatex Thetavega</span>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   root: {
//     width: "100vw",
//     height: "100vh",
//     background: "#000",
//     color: "#fff",
//     fontFamily: "Segoe UI, Arial, sans-serif",
//     border: "8px solid #00c3ff",
//     outline: "2px solid #0099cc",
//     outlineOffset: -8,
//     boxSizing: "border-box",
//   },

//   header: {
//     height: 80,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     position: "relative",
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
//     top: "60%",
//     transform: "translateY(-50%)",
//     height: 155,
//     objectFit: "contain",
//   },

//   blinkText: {
//     animation: "blink 3s infinite",
//   },

//   headerPill: {
//     width: "100%",
//     background: "#fff",
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
//     fontSize: 38,
//     fontWeight: "bold",
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
//     border: "10px solid #b400ff",
//     borderRadius: 16,
//     padding: 16,
//     height: 500,
//   },

//   circleRow: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 80,
//     marginTop: 20,
//   },

//   circleOuter: { textAlign: "center" },

//   circleInner: {
//     width: 130,
//     height: 130,
//     borderRadius: "60%",
//     border: "8px solid #00ff00",
//     outline: "8px solid #b400ff",
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

//   stageNameBox: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center", // 🔥 center align like circle
//     justifyContent: "center",
//     textAlign: "center",
//   },

//   stageNameText: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#00d4ff",
//     letterSpacing: 1,
//   },

//   stageNameLabel: {
//     fontSize: 23,
//     fontWeight: "bold",
//     marginTop: 23,
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
//     background: "#ff8000df",
//     margin: "20px 0",
//     border: "5px solid #ff8000df",
//   },

//   rightPanel: {
//     flex: 1,
//     border: "10px solid #00c3ff",
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
//     width: "100%",
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

//   angleRow: {
//     fontSize: 40,
//   },

//   torqueDisplay: {
//     height: 150,
//     width: 420,
//     border: "10px solid #00ff00",
//     borderRadius: 20,
//     marginTop: 14,
//     display: "flex",
//     alignItems: "center",
//     padding: 10,
//   },

//   torqueText: {
//     color: "#ffd000",
//     fontSize: 20,
//     textAlign: "right",
//     width: "100%",
//     paddingRight: 180,
//     marginTop: -150,
//   },

//   footer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     width: "100%",
//     background: "#ff8000",
//     color: "#000",
//     textAlign: "center",
//     fontSize: 16,
//     fontWeight: "bold",
//     padding: "8px 0",
//     letterSpacing: 1,
//     boxShadow: "0 -2px 10px rgba(0,0,0,0.6)",
//     zIndex: 1000,
//   },

//   footerHighlight: {
//     fontWeight: "bold",
//   },
// };

// export default DCToolHMI;



// import React, { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import mqtt from "mqtt";

// const API_URL = "http://192.168.29.61:5003/api/vin/get-model-by-vin";
// const MQTT_SIGNAL_API = "http://192.168.29.61:5003/api/mqtt-signal/by-stage-no";

// const DCToolHMI = () => {
//   const [now, setNow] = useState(new Date());

//   /* ================= STAGE ================= */
//   const { stageNo } = useParams();
//   const stageNumber = parseInt(stageNo, 10);
//   const isInvalidStage = isNaN(stageNumber);
//   const torqueTopic = `ST${stageNumber}_Torque`;
//   const angleTopic = `ST${stageNumber}_Angle`;
//   const resultTopic = `ST${stageNumber}_Result`;
//   const prePitchTopic = "PrePitch";

//   /* ================= SYSTEM STATES ================= */
//   const [operationMode, setOperationMode] = useState("AUTO");
//   const [lineStatus, setLineStatus] = useState("INTERLOCKED");

//   /* ================= API DATA STATES ================= */
//   const [vinInput, setVinInput] = useState("");
//   const [modelName, setModelName] = useState("-");
//   const [modelSku, setModelSku] = useState("-");
//   const [minTorque, setMinTorque] = useState("-");
//   const [maxTorque, setMaxTorque] = useState("-");
//   const [showResult, setShowResult] = useState(false);
//   const [showTorqueValue, setShowTorqueValue] = useState(false);
//   const [liveTorque, setLiveTorque] = useState(0);
//   const [liveAngle, setLiveAngle] = useState(0);
//   const [finalStatus, setFinalStatus] = useState(null);
//   const [stageName, setStageName] = useState("-");
//   const mqttClientRef = useRef(null);
//   const [prePitch, setPrePitch] = useState(0);
//   const [resultPublished, setResultPublished] = useState(false);
//   const [mqttConnected, setMqttConnected] = useState(false);

//   const [mqttSignals, setMqttSignals] = useState([]);
//   const lastVinRef = useRef(null);
//   const vinTopicRef = useRef(null);

//   /* ================= OK / NOT OK LOGIC ================= */
//   const isTorqueOk =
//     minTorque !== "-" &&
//     maxTorque !== "-" &&
//     liveTorque >= Number(minTorque) &&
//     liveTorque <= Number(maxTorque);

//   /* ================= CLOCK ================= */
//   useEffect(() => {
//     const timer = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   /* ================= LOAD MQTT SIGNALS ================= */
//   useEffect(() => {
//     if (isInvalidStage) return;

//     const fetchSignals = async () => {
//       try {
//         const res = await fetch(`${MQTT_SIGNAL_API}/${stageNumber}`);
//         const json = await res.json();

//         if (json.success && json.signals) {
//           setMqttSignals(json.signals.filter((s) => s.active));
//         }
//       } catch (err) {
//         console.error("Signal Load Error:", err);
//       }
//     };

//     fetchSignals();
//   }, [stageNumber]);

//   /* ================= ANIMATION STYLES ================= */
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.innerHTML = `
//       @keyframes fullScreenFlashRed {
//         0% { background-color: #000; }
//         50% { background-color: #330000; }
//         100% { background-color: #000; }
//       }

//       @keyframes fullScreenPulseGreen {
//         0% { background-color: #000; }
//         50% { background-color: #002200; }
//         100% { background-color: #000; }
//       }
//     `;
//     document.head.appendChild(style);
//   }, []);

//   const handleVinKeyDown = (e) => {
//     if (e.key === "Enter") {
//       const trimmed = vinInput.trim();
//       if (!trimmed) return;

//       lastVinRef.current = trimmed; // prevent duplicate MQTT call
//       fetchModelData(trimmed, stageNumber);
//     }
//   };

//   const getRootStyle = () => {
//     let baseStyle = { ...styles.root };

//     if (showResult) {
//       if (finalStatus === "PASS") {
//         baseStyle.animation = "fullScreenPulseGreen 1.5s infinite";
//       } else {
//         baseStyle.animation = "fullScreenFlashRed 0.7s infinite";
//       }
//     }

//     return baseStyle;
//   };

//   /* ================= SIGNAL DETECTION ================= */

//   const vinSignal = mqttSignals.find((s) =>
//     s.topic?.toLowerCase().includes("engineno"),
//   );

//   /* ================= GENERIC MQTT LISTENER ================= */

//   /* ================= VIN LISTENER ================= */

//   useEffect(() => {
//     if (!stageNumber) return;

//     if (mqttClientRef.current) {
//       mqttClientRef.current.end(true);
//     }

//     const client = mqtt.connect("ws://192.168.29.61:9001", {
//       reconnectPeriod: 3000,
//       clean: true,
//     });

//     mqttClientRef.current = client;

//     client.on("connect", () => {
//       console.log("MQTT Connected ✅");
//       setMqttConnected(true);

//       if (vinSignal?.topic) {
//         client.subscribe(vinSignal.topic);
//       }

//       client.subscribe(torqueTopic);
//       client.subscribe(angleTopic);
//       client.subscribe(prePitchTopic);
//     });

//     client.on("message", (topic, message) => {
//       const payload = message.toString();

//       /* ===== VIN ===== */
//       if (topic === vinTopicRef.current) {
//         const vin = payload.trim();

//         if (!vin) return;
//         if (lastVinRef.current === vin) return;

//         lastVinRef.current = vin;
//         setVinInput(vin);
//         fetchModelData(vin, stageNumber);
//       }

//       /* ===== Torque ===== */
//       if (topic === torqueTopic) {
//         const value = Number(payload);
//         if (!isNaN(value)) {
//           setLiveTorque(value);
//         }
//       }

//       /* ===== Angle ===== */
//       if (topic === angleTopic) {
//         const value = Number(payload);
//         if (!isNaN(value)) {
//           setLiveAngle(value);
//         }
//       }

//       if (topic === prePitchTopic) {
//         const value = Number(payload);

//         if (!isNaN(value)) {
//           setPrePitch(value);
//           console.log("PrePitch received from DataLogger:", value);
//         }
//       }
//     });

//     client.on("close", () => {
//       if (!client.connected) {
//         console.log("MQTT Disconnected ❌");
//         setMqttConnected(false);
//       }
//     });

//     client.on("offline", () => {
//       console.log("MQTT Offline ❌");
//       setMqttConnected(false);
//     });

//     client.on("error", (err) => {
//       console.error("MQTT Error:", err);
//       setMqttConnected(false);
//     });

//     client.on("reconnect", () => {
//       console.log("MQTT Reconnecting...");
//     });

//     return () => {
//       client.end();
//     };
//   }, [stageNumber]);


//   useEffect(() => {
//   if (!vinSignal?.topic) return;

//   vinTopicRef.current = vinSignal.topic;

//   if (mqttClientRef.current) {
//     mqttClientRef.current.subscribe(vinSignal.topic);
//     console.log("Subscribed to VIN topic:", vinSignal.topic);
//   }
// }, [vinSignal]);

//   /* ================= TIGHTENING LISTENER ================= */

//   /* ================= PASS / FAIL LOGIC ================= */

//   useEffect(() => {
//     if (
//       minTorque === "-" ||
//       maxTorque === "-" ||
//       liveTorque <= 0 ||
//       !mqttClientRef.current
//     ) {
//       return;
//     }

//     const pass =
//       liveTorque >= Number(minTorque) && liveTorque <= Number(maxTorque);

//     const result = pass ? "OK" : "NOT_OK";

//     setFinalStatus(pass ? "PASS" : "FAIL");
//     setShowResult(true);
//     setShowTorqueValue(true);

//     // 🔹 CASE 1 → Before PrePitch
//     if (prePitch === 0) {
//       if (pass) {
//         mqttClientRef.current.publish(resultTopic, "1");
//         console.log("Published OK before PrePitch");
//       }
//       return;
//     }

//     // 🔹 CASE 2 → After PrePitch
//     if (prePitch === 1) {
//       mqttClientRef.current.publish(resultTopic, result);
//       console.log("Published After PrePitch:", result);
//     }
//   }, [liveTorque, prePitch]);
//   /* ================= FETCH MODEL DATA ================= */

//   const fetchModelData = async (vin_no, stage_no) => {
//     setFinalStatus(null);
//     setLiveTorque(0);
//     setLiveAngle(0);
//     setShowResult(false);
//     setShowTorqueValue(false);
//     setPrePitch(0);
//     setResultPublished(false);

//     try {
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           vin_no,
//           stage_no,
//         }),
//       });

//       const json = await res.json();
//       if (!json) return;

//       const recipeProcess = json.recipeProcess?.[0];

//       setModelName(json.model?.model_name ?? "-");
//       setModelSku(json.model?.model_code ?? "-");

//       setStageName(json.routeStep?.stage_name ?? "-");

//       setMinTorque(recipeProcess?.lsl ?? "-");
//       setMaxTorque(recipeProcess?.usl ?? "-");
//     } catch (err) {
//       console.error("Model fetch failed", err);
//     }
//   };

//   const formatDate = now.toLocaleDateString("en-GB");
//   const formatTime = now.toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });

//   if (isInvalidStage) {
//     return <div>Invalid Stage Number</div>;
//   }

//   return (
//     <div style={getRootStyle()}>
//       {/* ================= HEADER ================= */}
//       <div style={styles.header}>
//         <img src="/Hero.svg" alt="Hero Logo" style={styles.heroLogo} />
//         <div style={styles.headerPill}>
//           <div style={styles.headerTitle}>DC TOOL TIGHTENING</div>
//         </div>
//         <img
//           src="/operatex.png"
//           alt="OperateX Logo"
//           style={styles.operatexLogo}
//         />
//       </div>

//       {/* ================= MODEL ROW ================= */}
//       <div style={styles.modelRow}>
//         <div style={styles.modelText}>
//           Model: <span style={styles.modelValue}>{modelName}</span>
//         </div>
//         <div
//           style={{
//             ...styles.mqtt,
//             color: mqttConnected ? "#00ff00" : "#ff0033",
//           }}
//         >
//           {mqttConnected ? "MQTT Connected" : "MQTT Disconnected"}
//         </div>
//       </div>

//       {/* ================= LINE STATUS ================= */}
//       <div style={styles.lineStatusRow}>
//         <div style={styles.lineStatusLeft}>
//           <span style={styles.lineStatusTitle}>LINE STATUS :</span>
//           <span
//             style={{
//               ...styles.lineStatusValue,
//               color: lineStatus === "INTERLOCKED" ? "#00ff00" : "#ff8000df",
//             }}
//           >
//             {lineStatus}
//           </span>
//         </div>

//         <div style={styles.lineStatusRight}>
//           <span
//             style={{
//               ...styles.lineActive,
//               opacity: operationMode === "AUTO" ? 1 : 0.3,
//             }}
//           >
//             AUTO
//           </span>
//           <span style={styles.lineSeparator}>|</span>
//           <span
//             style={{
//               ...styles.lineManual,
//               opacity: operationMode === "MANUAL" ? 1 : 0.3,
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
//                 <div style={styles.circleValue}>{stageNo}</div>
//               </div>
//               <div style={styles.circleLabel}>
//                 Stage
//                 <br />
//                 Number
//               </div>
//             </div>

//             <div style={styles.stageNameBox}>
//               <div style={styles.stageNameText}>{stageName}</div>
//               <div style={styles.stageNameLabel}>
//                 Stage
//                 <br /> Name
//               </div>
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
//             <div style={styles.torqueValue}>{minTorque}</div>
//             <div style={styles.torqueLabel}>
//               MINIMUM
//               <br />
//               TORQUE
//             </div>
//           </div>
//           <div style={styles.torqueDivider} />
//           <div style={styles.torqueBox}>
//             <div style={styles.torqueValue}>{maxTorque}</div>
//             <div style={styles.torqueLabel}>
//               MAXIMUM
//               <br />
//               TORQUE
//             </div>
//           </div>
//         </div>

//         {/* RIGHT PANEL */}
//         <div style={styles.rightPanel}>
//           <input
//             style={styles.vinBox}
//             placeholder="ENTER VIN & PRESS ENTER"
//             value={vinInput}
//             onChange={(e) => {
//               setVinInput(e.target.value);
//               setShowResult(false);
//               setShowTorqueValue(false);
//             }}
//             onKeyDown={handleVinKeyDown}
//           />

//           <div style={styles.skuBlock}>
//             <div style={styles.skuRow}>
//               <div style={styles.skuText}>
//                 SKU - <span style={styles.yellow}>{modelSku}</span>
//               </div>
//             </div>

//             <div style={styles.angleRow}>
//               ANGLE -{" "}
//               {showTorqueValue && (
//                 <span style={styles.yellow}>{liveAngle}°</span>
//               )}
//             </div>
//           </div>

//           <div style={styles.torqueDisplay}>
//             <div
//               style={{
//                 fontSize: 80,
//                 fontWeight: "bold",
//                 color: isTorqueOk ? "#00ff00" : "#ff0033",
//                 textAlign: "center",
//                 width: "100%",
//                 textShadow: isTorqueOk
//                   ? "0 0 15px #00ff00"
//                   : "0 0 15px #ff0033",
//                 ...(showResult ? styles.blinkText : {}),
//               }}
//             >
//               {showResult && finalStatus}
//             </div>
//           </div>

//           <div style={styles.torqueText}>
//             {showTorqueValue && (
//               <div style={{ fontSize: 60, fontWeight: "bold" }}>
//                 {liveTorque} Nm
//               </div>
//             )}
//             TORQUE
//             <br />
//             VALUE
//           </div>
//         </div>
//       </div>
//       {/* FOOTER */}
//       <div style={styles.footer}>
//         Powered by{" "}
//         <span style={styles.footerHighlight}>OperateX Thetavega</span>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   root: {
//     width: "100vw",
//     height: "100vh",
//     background: "#000",
//     color: "#fff",
//     fontFamily: "Segoe UI, Arial, sans-serif",
//     border: "8px solid #00c3ff",
//     outline: "2px solid #0099cc",
//     outlineOffset: -8,
//     boxSizing: "border-box",
//   },

//   header: {
//     height: 80,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     position: "relative",
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
//     top: "60%",
//     transform: "translateY(-50%)",
//     height: 155,
//     objectFit: "contain",
//   },

//   blinkText: {
//     animation: "blink 3s infinite",
//   },

//   headerPill: {
//     width: "100%",
//     background: "#fff",
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
//     fontSize: 38,
//     fontWeight: "bold",
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
//     border: "10px solid #b400ff",
//     borderRadius: 16,
//     padding: 16,
//     height: 500,
//   },

//   circleRow: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 80,
//     marginTop: 20,
//   },

//   circleOuter: { textAlign: "center" },

//   circleInner: {
//     width: 130,
//     height: 130,
//     borderRadius: "60%",
//     border: "8px solid #00ff00",
//     outline: "8px solid #b400ff",
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

//   stageNameBox: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center", // 🔥 center align like circle
//     justifyContent: "center",
//     textAlign: "center",
//   },

//   stageNameText: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#00d4ff",
//     letterSpacing: 1,
//   },

//   stageNameLabel: {
//     fontSize: 23,
//     fontWeight: "bold",
//     marginTop: 23,
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
//     background: "#ff8000df",
//     margin: "20px 0",
//     border: "5px solid #ff8000df",
//   },

//   rightPanel: {
//     flex: 1,
//     border: "10px solid #00c3ff",
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
//     width: "100%",
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

//   angleRow: {
//     fontSize: 40,
//   },

//   torqueDisplay: {
//     height: 150,
//     width: 420,
//     border: "10px solid #00ff00",
//     borderRadius: 20,
//     marginTop: 14,
//     display: "flex",
//     alignItems: "center",
//     padding: 10,
//   },

//   torqueText: {
//     color: "#ffd000",
//     fontSize: 20,
//     textAlign: "right",
//     width: "100%",
//     paddingRight: 180,
//     marginTop: -150,
//   },

//   footer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     width: "100%",
//     background: "#ff8000",
//     color: "#000",
//     textAlign: "center",
//     fontSize: 17,
//     fontWeight: "bold",
//     padding: "8px 0",
//     letterSpacing: 1,
//     boxShadow: "0 -2px 10px rgba(0,0,0,0.6)",
//     zIndex: 1000,
//   },

//   footerHighlight: {
//     fontWeight: "bold",
//   },
// };

// export default DCToolHMI;







// Final code without DB insert and rest all is been done
// import React, { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import mqtt from "mqtt";

// const API_URL = "http://192.168.1.15:5003/api/vin/get-model-by-vin";
// const MQTT_SIGNAL_API = "http://192.168.1.15:5003/api/mqtt-signal/by-stage-no";

// const DCToolHMI = () => {
//   const [now, setNow] = useState(new Date());

//   /* ================= STAGE ================= */
//   const { stageNo } = useParams();
//   const stageNumber = parseInt(stageNo, 10);
//   const isInvalidStage = isNaN(stageNumber);
//   const torqueTopic = `ST${stageNumber}_Torque`;
//   const angleTopic = `ST${stageNumber}_Angle`;
//   const resultTopic = `ST${stageNumber}_Result`;
//   const prePitchTopic = "PrePitch";

//   /* ================= SYSTEM STATES ================= */
//   const [operationMode, setOperationMode] = useState("AUTO");
//   const [lineStatus, setLineStatus] = useState("INTERLOCKED");

//   /* ================= API DATA STATES ================= */
//   const [vinInput, setVinInput] = useState("");
//   const [modelName, setModelName] = useState("-");
//   const [modelSku, setModelSku] = useState("-");
//   const [minTorque, setMinTorque] = useState("-");
//   const [maxTorque, setMaxTorque] = useState("-");
//   const [showResult, setShowResult] = useState(false);
//   const [showTorqueValue, setShowTorqueValue] = useState(false);
//   const [liveTorque, setLiveTorque] = useState(0);
//   const [liveAngle, setLiveAngle] = useState(0);
//   const [finalStatus, setFinalStatus] = useState(null);
//   const [stageName, setStageName] = useState("-");
//   const mqttClientRef = useRef(null);
//   const [prePitch, setPrePitch] = useState(0);
//   const [resultPublished, setResultPublished] = useState(false);
//   const [mqttConnected, setMqttConnected] = useState(false);

//   const [mqttSignals, setMqttSignals] = useState([]);
//   const lastVinRef = useRef(null);
//   const vinTopicRef = useRef(null);

//   /* ================= OK / NOT OK LOGIC ================= */
//   const isTorqueOk =
//     minTorque !== "-" &&
//     maxTorque !== "-" &&
//     liveTorque >= Number(minTorque) &&
//     liveTorque <= Number(maxTorque);

//   /* ================= CLOCK ================= */
//   useEffect(() => {
//     const timer = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   /* ================= LOAD MQTT SIGNALS ================= */
//   useEffect(() => {
//     if (isInvalidStage) return;

//     const fetchSignals = async () => {
//       try {
//         const res = await fetch(`${MQTT_SIGNAL_API}/${stageNumber}`);
//         const json = await res.json();

//         if (json.success && json.signals) {
//           setMqttSignals(json.signals.filter((s) => s.active));
//         }
//       } catch (err) {
//         console.error("Signal Load Error:", err);
//       }
//     };

//     fetchSignals();
//   }, [stageNumber]);

//   /* ================= ANIMATION STYLES ================= */
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.innerHTML = `
//       @keyframes fullScreenFlashRed {
//         0% { background-color: #000; }
//         50% { background-color: #330000; }
//         100% { background-color: #000; }
//       }

//       @keyframes fullScreenPulseGreen {
//         0% { background-color: #000; }
//         50% { background-color: #002200; }
//         100% { background-color: #000; }
//       }
//     `;
//     document.head.appendChild(style);
//   }, []);

//   const handleVinKeyDown = (e) => {
//     if (e.key === "Enter") {
//       const trimmed = vinInput.trim();
//       if (!trimmed) return;

//       lastVinRef.current = trimmed; // prevent duplicate MQTT call
//       fetchModelData(trimmed, stageNumber);
//     }
//   };

//   const getRootStyle = () => {
//     let baseStyle = { ...styles.root };

//     if (showResult) {
//       if (finalStatus === "PASS") {
//         baseStyle.animation = "fullScreenPulseGreen 1.5s infinite";
//       } else {
//         baseStyle.animation = "fullScreenFlashRed 0.7s infinite";
//       }
//     }

//     return baseStyle;
//   };

//   /* ================= SIGNAL DETECTION ================= */

//   const vinSignal = mqttSignals.find((s) =>
//     s.topic?.toLowerCase().includes("engineno"),
//   );

//   /* ================= GENERIC MQTT LISTENER ================= */

//   /* ================= VIN LISTENER ================= */

//   useEffect(() => {
//     if (!stageNumber) return;

//     if (mqttClientRef.current) {
//       mqttClientRef.current.end(true);
//     }

//     const client = mqtt.connect("ws://192.168.1.15:9001", {
//       reconnectPeriod: 3000,
//       clean: true,
//     });

//     mqttClientRef.current = client;

//     client.on("connect", () => {
//       console.log("MQTT Connected ✅");
//       setMqttConnected(true);

//       if (vinSignal?.topic) {
//         client.subscribe(vinSignal.topic);
//       }

//       client.subscribe(torqueTopic);
//       client.subscribe(angleTopic);
//       client.subscribe(prePitchTopic);
//     });

//     client.on("message", (topic, message) => {
//       const payload = message.toString();

//       /* ===== VIN ===== */
//       if (topic === vinTopicRef.current) {
//         const vin = payload.trim();

//         if (!vin) return;
//         if (lastVinRef.current === vin) return;

//         lastVinRef.current = vin;
//         setVinInput(vin);
//         fetchModelData(vin, stageNumber);
//       }

//       /* ===== Torque ===== */
//       if (topic === torqueTopic) {
//         const value = Number(payload);
//         if (!isNaN(value)) {
//           setLiveTorque(value);
//         }
//       }

//       /* ===== Angle ===== */
//       if (topic === angleTopic) {
//         const value = Number(payload);
//         if (!isNaN(value)) {
//           setLiveAngle(value);
//         }
//       }

//       if (topic === prePitchTopic) {
//         const value = Number(payload);

//         if (!isNaN(value)) {
//           setPrePitch(value);
//           console.log("PrePitch received from DataLogger:", value);
//         }
//       }
//     });

//     client.on("close", () => {
//       if (!client.connected) {
//         console.log("MQTT Disconnected ❌");
//         setMqttConnected(false);
//       }
//     });

//     client.on("offline", () => {
//       console.log("MQTT Offline ❌");
//       setMqttConnected(false);
//     });

//     client.on("error", (err) => {
//       console.error("MQTT Error:", err);
//       setMqttConnected(false);
//     });

//     client.on("reconnect", () => {
//       console.log("MQTT Reconnecting...");
//     });

//     return () => {
//       client.end();
//     };
//   }, [stageNumber]);


//   useEffect(() => {
//   if (!vinSignal?.topic) return;

//   vinTopicRef.current = vinSignal.topic;

//   if (mqttClientRef.current) {
//     mqttClientRef.current.subscribe(vinSignal.topic);
//     console.log("Subscribed to VIN topic:", vinSignal.topic);
//   }
// }, [vinSignal]);

//   /* ================= TIGHTENING LISTENER ================= */

//   /* ================= PASS / FAIL LOGIC ================= */

//   useEffect(() => {
//     if (
//       minTorque === "-" ||
//       maxTorque === "-" ||
//       liveTorque <= 0 ||
//       !mqttClientRef.current
//     ) {
//       return;
//     }

//     const pass =
//       liveTorque >= Number(minTorque) && liveTorque <= Number(maxTorque);

//     const result = pass ? "1" : "0";

//     setFinalStatus(pass ? "PASS" : "FAIL");
//     setShowResult(true);
//     setShowTorqueValue(true);

//     // 🔹 CASE 1 → Before PrePitch
//     if (prePitch === 0) {
//       if (pass) {
//         mqttClientRef.current.publish(resultTopic, "1");
//         console.log("Published OK before PrePitch");
//       }
//       return;
//     }

//     // 🔹 CASE 2 → After PrePitch
//     if (prePitch === 1) {
//       mqttClientRef.current.publish(resultTopic, result);
//       console.log("Published After PrePitch:", result);
//     }
//   }, [liveTorque, prePitch]);
//   /* ================= FETCH MODEL DATA ================= */

//   const fetchModelData = async (vin_no, stage_no) => {
//     setFinalStatus(null);
//     setLiveTorque(0);
//     setLiveAngle(0);
//     setShowResult(false);
//     setShowTorqueValue(false);
//     setPrePitch(0);
//     setResultPublished(false);

//     try {
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           vin_no,
//           stage_no,
//         }),
//       });

//       const json = await res.json();
//       if (!json) return;

//       const recipeProcess = json.recipeProcess?.[0];

//       setModelName(json.model?.model_name ?? "-");
//       setModelSku(json.model?.model_code ?? "-");

//       setStageName(json.routeStep?.stage_name ?? "-");

//       setMinTorque(recipeProcess?.lsl ?? "-");
//       setMaxTorque(recipeProcess?.usl ?? "-");
//     } catch (err) {
//       console.error("Model fetch failed", err);
//     }
//   };


//     /* ================= PASS / FAIL + TORQUE SECTION COMPONENT ================= */

//   const TorqueResultSection = () => {
//     return (
//       <>
//         {/* ===== PASS / FAIL DISPLAY ===== */}
//         <div style={styles.torqueDisplay}>
//           <div
//             style={{
//               fontSize: 80,
//               fontWeight: "bold",
//               color: isTorqueOk ? "#00ff00" : "#ff0033",
//               textAlign: "center",
//               width: "100%",
//               textShadow: isTorqueOk
//                 ? "0 0 15px #00ff00"
//                 : "0 0 15px #ff0033",
//               ...(showResult ? styles.blinkText : {}),
//             }}
//           >
//             {showResult && finalStatus}
//           </div>
//         </div>

//         {/* ===== TORQUE VALUE DISPLAY ===== */}
//         <div style={styles.torqueText}>
//           {showTorqueValue && (
//             <div style={{ fontSize: 60, fontWeight: "bold", marginTop: "10" }}>
//               {liveTorque} Nm
//             </div>
//           )}
//           TORQUE
//           <br />
//           VALUE
//         </div>
//       </>
//     );
//   };

//   const formatDate = now.toLocaleDateString("en-GB");
//   const formatTime = now.toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });

//   if (isInvalidStage) {
//     return <div>Invalid Stage Number</div>;
//   }

//   return (
//     <div style={getRootStyle()}>
//       {/* ================= HEADER ================= */}
//       <div style={styles.header}>
//         <img src="/Hero.svg" alt="Hero Logo" style={styles.heroLogo} />
//         <div style={styles.headerPill}>
//           <div style={styles.headerTitle}>DC TOOL TIGHTENING</div>
//         </div>
//         <img
//           src="/operatex.png"
//           alt="OperateX Logo"
//           style={styles.operatexLogo}
//         />
//       </div>

//       {/* ================= MODEL ROW ================= */}
//       <div style={styles.modelRow}>
//         <div style={styles.modelText}>
//           Model: <span style={styles.modelValue}>{modelName}</span>
//         </div>
//         <div
//           style={{
//             ...styles.mqtt,
//             color: mqttConnected ? "#00ff00" : "#ff0033",
//           }}
//         >
//           {mqttConnected ? "MQTT Connected" : "MQTT Disconnected"}
//         </div>
//       </div>

//       {/* ================= LINE STATUS ================= */}
//       <div style={styles.lineStatusRow}>
//         <div style={styles.lineStatusLeft}>
//           <span style={styles.lineStatusTitle}>LINE STATUS :</span>
//           <span
//             style={{
//               ...styles.lineStatusValue,
//               color: lineStatus === "INTERLOCKED" ? "#00ff00" : "#ff8000df",
//             }}
//           >
//             {lineStatus}
//           </span>
//         </div>

//         <div style={styles.lineStatusRight}>
//           <span
//             style={{
//               ...styles.lineActive,
//               opacity: operationMode === "AUTO" ? 1 : 0.3,
//             }}
//           >
//             AUTO
//           </span>
//           <span style={styles.lineSeparator}>|</span>
//           <span
//             style={{
//               ...styles.lineManual,
//               opacity: operationMode === "MANUAL" ? 1 : 0.3,
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
//                 <div style={styles.circleValue}>{stageNo}</div>
//               </div>
//               <div style={styles.circleLabel}>
//                 Stage
//                 <br />
//                 Number
//               </div>
//             </div>

//             <div style={styles.stageNameBox}>
//               <div style={styles.stageNameText}>{stageName}</div>
//               <div style={styles.stageNameLabel}>
//                 Stage
//                 <br /> Name
//               </div>
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
//             <div style={styles.torqueValue}>{minTorque}</div>
//             <div style={styles.torqueLabel}>
//               MINIMUM
//               <br />
//               TORQUE
//             </div>
//           </div>
//           <div style={styles.torqueDivider} />
//           <div style={styles.torqueBox}>
//             <div style={styles.torqueValue}>{maxTorque}</div>
//             <div style={styles.torqueLabel}>
//               MAXIMUM
//               <br />
//               TORQUE
//             </div>
//           </div>
//         </div>

//         {/* RIGHT PANEL */}
//         <div style={styles.rightPanel}>
//           <input
//             style={styles.vinBox}
//             placeholder="ENTER VIN"
//             value={vinInput}
//             onChange={(e) => {
//               setVinInput(e.target.value);
//               setShowResult(false);
//               setShowTorqueValue(false);
//             }}
//             onKeyDown={handleVinKeyDown}
//           />

//           <div style={styles.skuBlock}>
//             <div style={styles.skuRow}>
//               <div style={styles.skuText}>
//                 SKU - <span style={styles.yellow}>{modelSku}</span>
//               </div>
//             </div>

//             <div style={styles.angleRow}>
//               ANGLE -{" "}
//               {showTorqueValue && (
//                 <span style={styles.yellow}>{liveAngle}°</span>
//               )}
//             </div>
//           </div>

//           <TorqueResultSection />
//         </div>
//       </div>
//       {/* FOOTER */}
//       <div style={styles.footer}>
//         Powered by{" "}
//         <span style={styles.footerHighlight}>OperateX Thetavega</span>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   root: {
//     width: "100vw",
//     height: "100vh",
//     background: "#000",
//     color: "#fff",
//     fontFamily: "Segoe UI, Arial, sans-serif",
//     border: "8px solid #00c3ff",
//     outline: "2px solid #0099cc",
//     outlineOffset: -8,
//     boxSizing: "border-box",
//   },

//   header: {
//     height: 80,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     position: "relative",
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
//     top: "60%",
//     transform: "translateY(-50%)",
//     height: 155,
//     objectFit: "contain",
//   },

//   blinkText: {
//     animation: "blink 3s infinite",
//   },

//   headerPill: {
//     width: "100%",
//     background: "#fff",
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
//     fontSize: 38,
//     fontWeight: "bold",
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
//     border: "10px solid #b400ff",
//     borderRadius: 16,
//     padding: 16,
//     height: 500,
//   },

//   circleRow: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 80,
//     marginTop: 20,
//   },

//   circleOuter: { textAlign: "center" },

//   circleInner: {
//     width: 130,
//     height: 130,
//     borderRadius: "60%",
//     border: "8px solid #00ff00",
//     outline: "8px solid #b400ff",
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

//   stageNameBox: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center", // 🔥 center align like circle
//     justifyContent: "center",
//     textAlign: "center",
//   },

//   stageNameText: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#00d4ff",
//     letterSpacing: 1,
//   },

//   stageNameLabel: {
//     fontSize: 23,
//     fontWeight: "bold",
//     marginTop: 23,
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
//     background: "#ff8000df",
//     margin: "20px 0",
//     border: "5px solid #ff8000df",
//   },

//   rightPanel: {
//     flex: 1,
//     border: "10px solid #00c3ff",
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
//     width: "100%",
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

//   angleRow: {
//     fontSize: 40,
//   },

//   torqueDisplay: {
//     height: 150,
//     width: 420,
//     border: "10px solid #00ff00",
//     borderRadius: 20,
//     marginTop: 14,
//     display: "flex",
//     alignItems: "center",
//     padding: 10,
//   },

//   torqueText: {
//     color: "#ffd000",
//     fontSize: 20,
//     textAlign: "right",
//     width: "100%",
//     paddingRight: 180,
//     marginTop: -150,
//   },

//   footer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     width: "100%",
//     background: "#ff8000",
//     color: "#000",
//     textAlign: "center",
//     fontSize: 17,
//     fontWeight: "bold",
//     padding: "8px 0",
//     letterSpacing: 1,
//     boxShadow: "0 -2px 10px rgba(0,0,0,0.6)",
//     zIndex: 1000,
//   },

//   footerHighlight: {
//     fontWeight: "bold",
//   },
// };

// export default DCToolHMI;



// Code with MQTT publish + DB insert
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import mqtt from "mqtt";

const API_URL = "http://192.168.1.15:5003/api/vin/get-model-by-vin";
const MQTT_SIGNAL_API = "http://192.168.1.15:5003/api/mqtt-signal/by-stage-no";
const PROCESS_RESULT_API = "http://192.168.1.15:5003/api/process-result";

const DCToolHMI = () => {
  const [now, setNow] = useState(new Date());

  /* ================= STAGE ================= */
  const { stageNo } = useParams();
  const stageNumber = parseInt(stageNo, 10);
  const isInvalidStage = isNaN(stageNumber);
  const torqueTopic = `ST${stageNumber}_Torque`;
  const angleTopic = `ST${stageNumber}_Angle`;
  const resultTopic = `ST${stageNumber}_Result`;
  const prePitchTopic = "PrePitch";

  /* ================= SYSTEM STATES ================= */
  const [operationMode, setOperationMode] = useState("AUTO");
  const [lineStatus, setLineStatus] = useState("INTERLOCKED");

  /* ================= API DATA STATES ================= */
  const [vinInput, setVinInput] = useState("");
  const [modelName, setModelName] = useState("-");
  const [modelSku, setModelSku] = useState("-");
  const [minTorque, setMinTorque] = useState("-");
  const [maxTorque, setMaxTorque] = useState("-");
  const [showResult, setShowResult] = useState(false);
  const [showTorqueValue, setShowTorqueValue] = useState(false);
  const [liveTorque, setLiveTorque] = useState(0);
  const [liveAngle, setLiveAngle] = useState(0);
  const [finalStatus, setFinalStatus] = useState(null);
  const [stageName, setStageName] = useState("-");
  const mqttClientRef = useRef(null);
  const [prePitch, setPrePitch] = useState(0);
  const [resultPublished, setResultPublished] = useState(false);
  const [mqttConnected, setMqttConnected] = useState(false);

  const [mqttSignals, setMqttSignals] = useState([]);
  const lastVinRef = useRef(null);
  const vinTopicRef = useRef(null);
  const [alreadyLogged, setAlreadyLogged] = useState(false);

  const [unitId, setUnitId] = useState(null);
const [routeStepId, setRouteStepId] = useState(null);
const [toolId, setToolId] = useState(null);
const [programNo, setProgramNo] = useState(null);

  /* ================= OK / NOT OK LOGIC ================= */
  const isTorqueOk =
    minTorque !== "-" &&
    maxTorque !== "-" &&
    liveTorque >= Number(minTorque) &&
    liveTorque <= Number(maxTorque);

  /* ================= CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ================= LOAD MQTT SIGNALS ================= */
  useEffect(() => {
    if (isInvalidStage) return;

    const fetchSignals = async () => {
      try {
        const res = await fetch(`${MQTT_SIGNAL_API}/${stageNumber}`);
        const json = await res.json();

        if (json.success && json.signals) {
          setMqttSignals(json.signals.filter((s) => s.active));
        }
      } catch (err) {
        console.error("Signal Load Error:", err);
      }
    };

    fetchSignals();
  }, [stageNumber]);

  /* ================= ANIMATION STYLES ================= */
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fullScreenFlashRed {
        0% { background-color: #000; }
        50% { background-color: #330000; }
        100% { background-color: #000; }
      }

      @keyframes fullScreenPulseGreen {
        0% { background-color: #000; }
        50% { background-color: #002200; }
        100% { background-color: #000; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const handleVinKeyDown = (e) => {
    if (e.key === "Enter") {
      const trimmed = vinInput.trim();
      if (!trimmed) return;

      lastVinRef.current = trimmed; // prevent duplicate MQTT call
      fetchModelData(trimmed, stageNumber);
    }
  };

  const getRootStyle = () => {
    let baseStyle = { ...styles.root };

    if (showResult) {
      if (finalStatus === "PASS") {
        baseStyle.animation = "fullScreenPulseGreen 1.5s infinite";
      } else {
        baseStyle.animation = "fullScreenFlashRed 0.7s infinite";
      }
    }

    return baseStyle;
  };

  /* ================= SIGNAL DETECTION ================= */

  const insertProcessResult = async (oknokValue) => {
  try {
    await fetch(PROCESS_RESULT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unit_id: unitId,
        route_step_id: routeStepId,
        tool_id: toolId,
        program_no: programNo,
        result: oknokValue, // "OK" or "NOK"
        value_payload: {
          torque: liveTorque,
          angle: liveAngle,
          stage_no: stageNumber,
        },
        lsl: minTorque,
        usl: maxTorque,
      }),
    });

    console.log("Process result inserted in DB ✅");
  } catch (err) {
    console.error("Process Result Insert Failed ❌", err);
  }
};

  const vinSignal = mqttSignals.find((s) =>
    s.topic?.toLowerCase().includes("engineno"),
  );

  /* ================= GENERIC MQTT LISTENER ================= */

  /* ================= VIN LISTENER ================= */

  useEffect(() => {
    if (!stageNumber) return;

    if (mqttClientRef.current) {
      mqttClientRef.current.end(true);
    }

    const client = mqtt.connect("ws://192.168.1.15:9001", {
      reconnectPeriod: 3000,
      clean: true,
    });

    mqttClientRef.current = client;

    client.on("connect", () => {
      console.log("MQTT Connected ✅");
      setMqttConnected(true);

      if (vinSignal?.topic) {
        client.subscribe(vinSignal.topic);
      }

      client.subscribe(torqueTopic);
      client.subscribe(angleTopic);
      client.subscribe(prePitchTopic);
    });

    client.on("message", (topic, message) => {
      const payload = message.toString();

      /* ===== VIN ===== */
      if (topic === vinTopicRef.current) {
        const vin = payload.trim();

        if (!vin) return;
        if (lastVinRef.current === vin) return;

        lastVinRef.current = vin;
        setVinInput(vin);
        fetchModelData(vin, stageNumber);
      }

      /* ===== Torque ===== */
      if (topic === torqueTopic) {
        const value = Number(payload);
        if (!isNaN(value)) {
          setLiveTorque(value);
        }
      }

      /* ===== Angle ===== */
      if (topic === angleTopic) {
        const value = Number(payload);
        if (!isNaN(value)) {
          setLiveAngle(value);
        }
      }

      if (topic === prePitchTopic) {
        const value = Number(payload);

        if (!isNaN(value)) {
          setPrePitch(value);
          console.log("PrePitch received from DataLogger:", value);
        }
      }
    });

    client.on("close", () => {
      if (!client.connected) {
        console.log("MQTT Disconnected ❌");
        setMqttConnected(false);
      }
    });

    client.on("offline", () => {
      console.log("MQTT Offline ❌");
      setMqttConnected(false);
    });

    client.on("error", (err) => {
      console.error("MQTT Error:", err);
      setMqttConnected(false);
    });

    client.on("reconnect", () => {
      console.log("MQTT Reconnecting...");
    });

    return () => {
      client.end();
    };
  }, [stageNumber]);


  useEffect(() => {
  if (!vinSignal?.topic) return;

  vinTopicRef.current = vinSignal.topic;

  if (mqttClientRef.current) {
    mqttClientRef.current.subscribe(vinSignal.topic);
    console.log("Subscribed to VIN topic:", vinSignal.topic);
  }
}, [vinSignal]);

  /* ================= TIGHTENING LISTENER ================= */

  /* ================= PASS / FAIL LOGIC ================= */

  useEffect(() => {
  if (
    minTorque === "-" ||
    maxTorque === "-" ||
    liveTorque <= 0 ||
    !mqttClientRef.current ||
    !unitId ||
    !routeStepId ||
    !toolId ||
    alreadyLogged
  ) {
    return;
  }

  const processResult = async () => {
    const pass =
      liveTorque >= Number(minTorque) &&
      liveTorque <= Number(maxTorque);

    const mqttResult = pass ? "1" : "0";
    const oknokValue = pass ? "OK" : "NOK";

    setFinalStatus(pass ? "PASS" : "FAIL");
    setShowResult(true);
    setShowTorqueValue(true);

    if (prePitch === 0) {
      if (pass) {
        mqttClientRef.current.publish(resultTopic, "1");
        await insertProcessResult("OK");
        setAlreadyLogged(true);
      }
      return;
    }

    if (prePitch === 1) {
      mqttClientRef.current.publish(resultTopic, mqttResult);
      await insertProcessResult(oknokValue);
      setAlreadyLogged(true);
    }
  };

  processResult();
}, [liveTorque, prePitch, unitId, routeStepId, toolId, alreadyLogged]);
  /* ================= FETCH MODEL DATA ================= */

  const fetchModelData = async (vin_no, stage_no) => {
  try {
    setAlreadyLogged(false);
    setFinalStatus(null);
    setLiveTorque(0);
    setLiveAngle(0);
    setShowResult(false);
    setShowTorqueValue(false);
    setPrePitch(0);
    setResultPublished(false);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vin_no,
        stage_no,
      }),
    });

    const json = await res.json();
    if (!json) return;

    const recipeProcess = json.recipeProcess?.[0];

    // 🔹 UI data
    setModelName(json.model?.model_name ?? "-");
    setModelSku(json.model?.model_code ?? "-");
    setStageName(json.routeStep?.stage_name ?? "-");
    setMinTorque(recipeProcess?.lsl ?? "-");
    setMaxTorque(recipeProcess?.usl ?? "-");

    // 🔹 IDs for DB insert
    setUnitId(json.unit?.unit_id); // assumed
    setRouteStepId(json.routeStep?.route_step_id);
    setToolId(recipeProcess?.tool_id);
    setProgramNo(recipeProcess?.program_no);

  } catch (err) {
    console.error("Model fetch failed", err);
  }
};


    /* ================= PASS / FAIL + TORQUE SECTION COMPONENT ================= */

  const TorqueResultSection = () => {
    return (
      <>
        {/* ===== PASS / FAIL DISPLAY ===== */}
        <div style={styles.torqueDisplay}>
          <div
            style={{
              fontSize: 80,
              fontWeight: "bold",
              color: isTorqueOk ? "#00ff00" : "#ff0033",
              textAlign: "center",
              width: "100%",
              textShadow: isTorqueOk
                ? "0 0 15px #00ff00"
                : "0 0 15px #ff0033",
              ...(showResult ? styles.blinkText : {}),
            }}
          >
            {showResult && finalStatus}
          </div>
        </div>

        {/* ===== TORQUE VALUE DISPLAY ===== */}
        <div style={styles.torqueText}>
          {showTorqueValue && (
            <div style={{ fontSize: 60, fontWeight: "bold", marginTop: "10" }}>
              {liveTorque} Nm
            </div>
          )}
          TORQUE
          <br />
          VALUE
        </div>
      </>
    );
  };

  const formatDate = now.toLocaleDateString("en-GB");
  const formatTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (isInvalidStage) {
    return <div>Invalid Stage Number</div>;
  }

  return (
    <div style={getRootStyle()}>
      {/* ================= HEADER ================= */}
      <div style={styles.header}>
        <img src="/Hero.svg" alt="Hero Logo" style={styles.heroLogo} />
        <div style={styles.headerPill}>
          <div style={styles.headerTitle}>DC TOOL TIGHTENING</div>
        </div>
        <img
          src="/operatex.png"
          alt="OperateX Logo"
          style={styles.operatexLogo}
        />
      </div>

      {/* ================= MODEL ROW ================= */}
      <div style={styles.modelRow}>
        <div style={styles.modelText}>
          Model: <span style={styles.modelValue}>{modelName}</span>
        </div>
        <div
          style={{
            ...styles.mqtt,
            color: mqttConnected ? "#00ff00" : "#ff0033",
          }}
        >
          {mqttConnected ? "MQTT Connected" : "MQTT Disconnected"}
        </div>
      </div>

      {/* ================= LINE STATUS ================= */}
      <div style={styles.lineStatusRow}>
        <div style={styles.lineStatusLeft}>
          <span style={styles.lineStatusTitle}>LINE STATUS :</span>
          <span
            style={{
              ...styles.lineStatusValue,
              color: lineStatus === "INTERLOCKED" ? "#00ff00" : "#ff8000df",
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
                <div style={styles.circleValue}>{stageNo}</div>
              </div>
              <div style={styles.circleLabel}>
                Stage
                <br />
                Number
              </div>
            </div>

            <div style={styles.stageNameBox}>
              <div style={styles.stageNameText}>{stageName}</div>
              <div style={styles.stageNameLabel}>
                Stage
                <br /> Name
              </div>
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

        {/* TORQUE LIMIT */}
        <div style={styles.torqueLimits}>
          <div style={styles.torqueBox}>
            <div style={styles.torqueValue}>{minTorque}</div>
            <div style={styles.torqueLabel}>
              MINIMUM
              <br />
              TORQUE
            </div>
          </div>
          <div style={styles.torqueDivider} />
          <div style={styles.torqueBox}>
            <div style={styles.torqueValue}>{maxTorque}</div>
            <div style={styles.torqueLabel}>
              MAXIMUM
              <br />
              TORQUE
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.rightPanel}>
          <input
            style={styles.vinBox}
            placeholder="ENTER VIN"
            value={vinInput}
            onChange={(e) => {
              setVinInput(e.target.value);
              setShowResult(false);
              setShowTorqueValue(false);
            }}
            onKeyDown={handleVinKeyDown}
          />

          <div style={styles.skuBlock}>
            <div style={styles.skuRow}>
              <div style={styles.skuText}>
                SKU - <span style={styles.yellow}>{modelSku}</span>
              </div>
            </div>

            <div style={styles.angleRow}>
              ANGLE -{" "}
              {showTorqueValue && (
                <span style={styles.yellow}>{liveAngle}°</span>
              )}
            </div>
          </div>

          <TorqueResultSection />
        </div>
      </div>
      {/* FOOTER */}
      <div style={styles.footer}>
        Powered by{" "}
        <span style={styles.footerHighlight}>OperateX Thetavega</span>
      </div>
    </div>
  );
};

const styles = {
  root: {
    width: "100vw",
    height: "100vh",
    background: "#000",
    color: "#fff",
    fontFamily: "Segoe UI, Arial, sans-serif",
    border: "8px solid #00c3ff",
    outline: "2px solid #0099cc",
    outlineOffset: -8,
    boxSizing: "border-box",
  },

  header: {
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
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
    top: "60%",
    transform: "translateY(-50%)",
    height: 155,
    objectFit: "contain",
  },

  blinkText: {
    animation: "blink 3s infinite",
  },

  headerPill: {
    width: "100%",
    background: "#fff",
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
    fontSize: 38,
    fontWeight: "bold",
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
    border: "10px solid #b400ff",
    borderRadius: 16,
    padding: 16,
    height: 500,
  },

  circleRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 80,
    marginTop: 20,
  },

  circleOuter: { textAlign: "center" },

  circleInner: {
    width: 130,
    height: 130,
    borderRadius: "60%",
    border: "8px solid #00ff00",
    outline: "8px solid #b400ff",
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

  stageNameBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // 🔥 center align like circle
    justifyContent: "center",
    textAlign: "center",
  },

  stageNameText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00d4ff",
    letterSpacing: 1,
  },

  stageNameLabel: {
    fontSize: 23,
    fontWeight: "bold",
    marginTop: 23,
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
    background: "#ff8000df",
    margin: "20px 0",
    border: "5px solid #ff8000df",
  },

  rightPanel: {
    flex: 1,
    border: "10px solid #00c3ff",
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
    width: "100%",
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

  angleRow: {
    fontSize: 40,
  },

  torqueDisplay: {
    height: 150,
    width: 420,
    border: "10px solid #00ff00",
    borderRadius: 20,
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    padding: 10,
  },

  torqueText: {
    color: "#ffd000",
    fontSize: 20,
    textAlign: "right",
    width: "100%",
    paddingRight: 180,
    marginTop: -150,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    background: "#ff8000",
    color: "#000",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "bold",
    padding: "8px 0",
    letterSpacing: 1,
    boxShadow: "0 -2px 10px rgba(0,0,0,0.6)",
    zIndex: 1000,
  },

  footerHighlight: {
    fontWeight: "bold",
  },
};

export default DCToolHMI;
