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
  const [serverConnected, setServerConnected] = useState(false);

  const isInvalidStage = !stageNumber || isNaN(stageNumber);
  const [mqttSignals, setMqttSignals] = useState([]);

  const VIN_TOPIC = `ST${stageNumber}_EngineNumber`;
  const RESULT_TOPIC = `ST${stageNumber}_Result`;
  const STATIC_PREPITCH_TOPIC = "PrePitch";
  const [lastScannedValue, setLastScannedValue] = useState("");

  const [operationMode, setOperationMode] = useState("AUTO");

  const mqttClientRef = useRef(null);

  const [alert, setAlert] = useState({
    type: null, // "error" | "warning" | "success"
    message: "",
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
    if (mqttConnected && vin && routeData && finalResult !== "PASS") {
      scanInputRef.current?.focus();
    }
  }, [mqttConnected, vin, routeData, finalResult]);

  useEffect(() => {
    if (!stageNumber) return;

    const fetchMqttSignals = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/mqtt-signal/by-stage-no/${stageNumber}`,
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
  const vinSignal = mqttSignals.find((s) => s.payload_format === "RAW");

  const partScanSignal = mqttSignals.find((s) =>
    s.logical_name.toLowerCase().includes("part"),
  );

  useEffect(() => {
    if (!stageNumber) return;

    const client = mqtt.connect("ws://192.168.1.2:9001", {
      username: "mqttuser",
      password: "Theta@123",
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
      parts.every((p) => (scanQtyMap[p.part_no] || 0) >= p.qty_required);

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

    setScannedBarcodes({});
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
      mqttClientRef.current.publish(RESULT_TOPIC, payload, {
        qos: 0,
        retain: false,
      });

      console.log(`MQTT Published to ${RESULT_TOPIC}:`, payload);
    } catch (err) {
      console.error("MQTT Publish Error:", err);
    }
  };

  const fetchVinDataFromApi = async (incomingVin) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/vin/get-model-by-vin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin_no: incomingVin,
          stage_no: stageNumber,
        }),
      });

      setServerConnected(true);

      const json = await res.json();
      console.log("VIN API RESPONSE:", json);

      // ❌ CASE 1: VIN not found at all
      if (!json?.model) {
        setRouteData(null);
        showAlert("warning", "VIN NOT FOUND ⚠", true);
        return;
      }

      // ❌ CASE 2: VIN exists but no SKU / no parts for this stage
      if (!json?.partRequirements || json.partRequirements.length === 0) {
        setRouteData(null);
        showAlert("error", "WRONG VIN ❌ (NO SKU FOR THIS STAGE)", false);
        return;
      }

      // ✅ CASE 3: VALID VIN + SKU
      setRouteData(json);
    } catch (err) {
      console.error("VIN API error", err);
      setServerConnected(false); // ❌ SERVER DOWN
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
      traceType: p.trace_type,
      partId: p.part_id,
    })) || [];

  const chunkData = (data, size) => {
    const chunks = [];
    for (let i = 0; i < data.length; i += size) {
      chunks.push(data.slice(i, i + size));
    }
    return chunks;
  };

  const savePartScanToDb = async ({
    matchedPart,
    barcode,
    status,
    reason = null,
  }) => {
    try {
      const unitId = routeData?.unitData?.unit_id;
      const routeStepId = routeData?.routeStep?.route_step_id;

      if (!unitId || !routeStepId) {
        console.error("Missing unit or route step");
        return;
      }
      const payload = {
        unit_id: routeData.unitData.unit_id,
        event_ts: new Date().toISOString(),
        route_step_id: routeData.routeStep.route_step_id,
        part_id: matchedPart?.part_id || null,
        barcode_value: barcode,
        result: status, // 'OK' only now
        reason: reason,
        vin_no: vin,
      };

      const res = await fetch(`${API_BASE_URL}/api/part-scan-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const [scannedBarcodes, setScannedBarcodes] = useState({});

  const handleScan = async () => {
    // 1️⃣ Block if final result already PASS
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
        part.part_no,
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
    // ================= WRONG PART =================
    if (!matchedPart) {
      setWrongSku(true);

      showAlert("error", "WRONG PART SCANNED ❌", true);

      // Try to guess closest expected part
      let expectedPart = routeData.partRequirements.find((p) => {
        if (!p.min_len && !p.max_len) return false;

        if (
          (p.min_len && scannedSku.length < p.min_len) ||
          (p.max_len && scannedSku.length > p.max_len)
        ) {
          return false;
        }

        return true;
      });

      // Fallback to first expected part
      if (!expectedPart) {
        expectedPart = routeData.partRequirements[0];
      }

      await savePartScanToDb({
        matchedPart: expectedPart,
        barcode: scannedSku,
        status: "NOK",
        reason: "WRONG_PART",
      });

      setScannedValue("");
      return;
    }

    setWrongSku(false);

    // ================= GET CURRENT COUNT =================
    const currentCount = scanQtyMap[matchedPart.part_no] || 0;

    // ================= BLOCK IF QTY COMPLETED =================
    if (currentCount >= matchedPart.qty_required) {
      showAlert("warning", "PART ALREADY COMPLETED ✅", true);

      setScannedValue("");

      return;
    }

    // ================= DUPLICATE BARCODE CHECK =================
    const scannedList = scannedBarcodes[matchedPart.part_no] || [];

    // SERIAL TRACE VALIDATION
    if (
      matchedPart.traceType === "SERIAL" &&
      scannedList.includes(scannedSku)
    ) {
      showAlert("error", "SERIAL ALREADY SCANNED ❌", true);
      setScannedValue("");
      return;
    }

    // GENERAL DUPLICATE VALIDATION
    if (!matchedPart.allow_duplicate && scannedList.includes(scannedSku)) {
      showAlert("error", "DUPLICATE BARCODE NOT ALLOWED ❌", true);
      setScannedValue("");
      return;
    }

    // ================= VALID SCAN =================

    setScanQtyMap((prev) => ({
      ...prev,
      [matchedPart.part_no]: currentCount + 1,
    }));

    setScannedBarcodes((prev) => ({
      ...prev,
      [matchedPart.part_no]: [...(prev[matchedPart.part_no] || []), scannedSku],
    }));

    setLastScannedSku(matchedPart.part_no);

    await savePartScanToDb({
      matchedPart,
      barcode: scannedSku,
      status: "OK",
      reason: null,
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
      };
    }

    // 🟠 Scanned but not complete
    if (scanned > 0 && scanned < row.qty) {
      return {
        backgroundColor: "#ffa500",
        color: "#000",
        fontWeight: "bold",
      };
    }

    // 🟢 Fully completed
    if (scanned >= row.qty) {
      return {
        backgroundColor: "#00ff00",
        color: "#000",
        fontWeight: "bold",
      };
    }

    return {};
  };

  const dynamicBorderColor = isPass ? "#00ff00" : isFail ? "#ff0033" : null;

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
            boxShadow: `0 0 30px ${mqttConnected ? "#00ff00" : "#ff0033"}`,
          }}
        >
          {/* HEADER */}
          <div style={ui.header}>
            <img src="/hero-logo.png" style={ui.logoLeft} />
            <div style={ui.title}>SKD PART SCANNING</div>
            <img src="/operatex-logo.jpg" style={ui.logoRight} />
          </div>

          {/* MASTER CONTAINER BOX */}
          <div style={ui.masterBox}>
            {/* TOP INDUSTRIAL HEADER PANEL */}
            <div style={ui.topPanel}>
              {/* FIRST ROW → LINE STATUS + MODE */}
              {/* FIRST ROW → LINE STATUS + MODE */}
              <div style={ui.lineRow}>
                {/* LINE STATUS */}
                <div style={ui.lineStatus}>
                  LINE STATUS :
                  <span
                    style={{
                      color: isInterlocked ? "#ff0000" : "#00ff00",
                      marginLeft: 10,
                    }}
                  >
                    {isInterlocked ? " INTERLOCKED" : " OK"}
                  </span>
                </div>

                {/* MODE STATUS */}
                <div style={ui.lineStatus}>
                  MODE :
                  <span
                    style={{
                      color: operationMode === "AUTO" ? "#00ff00" : "#ffd700",
                      marginLeft: 10,
                    }}
                  >
                    {operationMode}
                  </span>
                </div>
              </div>

              {/* SECOND ROW → MODEL + PASS + SCAN INPUT */}
              <div style={ui.secondRow}>
                {/* LEFT → MODEL + SKU */}
                <div style={ui.modelSection}>
                  <div>
                    <span style={ui.modelLabel}>Model:</span>
                    <span style={ui.modelValue}>
                      {routeData?.model?.model_name || "-"}
                    </span>
                  </div>

                  <div>
                    <span style={ui.modelLabel}>SKU :</span>
                    <span style={ui.modelValue}>
                      {routeData?.model?.model_code || "-"}
                    </span>
                  </div>
                </div>

                {/* CENTER → PASS / FAIL */}
                <div
                  style={{
                    ...ui.passStatus,
                    color:
                      finalResult === "PASS"
                        ? "#00ff00"
                        : finalResult === "FAIL"
                          ? "#ff0033"
                          : "#1faff1", // default grey
                    textShadow:
                      finalResult === "PASS"
                        ? "0 0 40px #00ff00, 0 0 80px #00ff00"
                        : finalResult === "FAIL"
                          ? "0 0 40px #ff0033, 0 0 80px #ff0033"
                          : "none",
                  }}
                >
                  {finalResult ?? "-"}
                </div>

                {/* RIGHT → SCANNED DATA INPUT (HEADER STYLE) */}
                <div style={ui.scanTopContainer}>
                  {/* INPUT FIELD */}
                  <input
                    ref={scanInputRef}
                    value={scannedValue}
                    disabled={finalResult === "PASS" || !vin || !routeData}
                    onChange={(e) => setScannedValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setLastScannedValue(scannedValue);
                        handleScan();
                        setTimeout(() => setScannedValue(""), 400);
                      }
                    }}
                    style={ui.scanTopInput}
                    placeholder="Scanned Data"
                  />

                  {/* ALERT / RESULT BELOW INPUT */}
                  <div
                    style={{
                      ...ui.scanAlertBox,
                      border:
                        alert?.type === "error"
                          ? "3px solid #ff0033"
                          : alert?.type === "success"
                            ? "3px solid #00ff00"
                            : "3px solid #555",
                      color:
                        alert?.type === "error"
                          ? "#ff0033"
                          : alert?.type === "success"
                            ? "#00ff00"
                            : "#ccc",
                      boxShadow:
                        alert?.type === "error"
                          ? "0 0 15px #ff0033"
                          : alert?.type === "success"
                            ? "0 0 15px #00ff00"
                            : "none",
                    }}
                  >
                    {alert?.type
                      ? alert.message
                      : lastScannedValue
                        ? `Last Scan: ${lastScannedValue}`
                        : "Waiting for scan..."}
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN SECTION */}
            <div style={ui.mainSection}>
              {/* LEFT BOX → STAGE + DATE/TIME */}
              <div
                style={{
                  ...ui.leftBox,
                  border: `3px solid ${dynamicBorderColor || "#3e3f3f"}`,
                }}
              >
                {/* Stage Row */}
                <div style={ui.stageTopRow}>
                  {/* LEFT SIDE */}
                  <div style={ui.stageNoContainer}>
                    <div style={ui.stageHeader}>Stage No.</div>

                    <div style={ui.stageCircleOuter}>
                      <div style={ui.stageCircleInner}>{stageNumber}</div>
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div style={ui.stageNameContainer}>
                    <div style={ui.stageHeader}>Stage :</div>

                    <div style={ui.stageName}>
                      {routeData?.routeStep?.stage_name || "-"}
                    </div>
                  </div>
                </div>

                {/* Date + Time */}
                <div style={ui.dateTimeContainer}>
                  <div style={ui.dateTimeRow}>
                    <span style={ui.dateTag}>Date:</span>
                    <span style={ui.dateValue}>
                      {new Date().toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  <div style={ui.dateTimeRow}>
                    <span style={ui.dateTag}>Time:</span>
                    <span style={ui.dateValue}>
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* CENTER PANEL → SCAN COMPLETE / SCAN QUANTITY */}
              <div
                style={{
                  ...ui.centerPanel,
                  border: `3px solid ${dynamicBorderColor || "#3e3f3f"}`,
                }}
              >
                <div style={ui.countBoxTop}>
                  <div style={ui.countLabel}> COMPLETE QUANTITY</div>
                  <div style={ui.countValue}>
                    {Object.values(scanQtyMap).reduce((a, b) => a + b, 0)}
                  </div>
                </div>

                <div style={ui.centerDividerLine}></div>

                <div style={ui.countBoxBottom}>
                  <div style={ui.countLabel}>REQUIRED QUANTITY</div>
                  <div style={ui.countValue}>
                    {parts.reduce((sum, p) => sum + p.qty, 0) -
                      Object.values(scanQtyMap).reduce((a, b) => a + b, 0)}
                  </div>
                </div>
              </div>

              {/* RIGHT BOX → VIN + TABLE (BLANK PANEL IN IMAGE) */}
              <div
                style={{
                  ...ui.rightBox,
                  border: `3px solid ${dynamicBorderColor || "#3e3f3f"}`,
                }}
              >
                <div style={ui.vinContainer}>
                  <span style={ui.vinLabel}>VIN :</span>
                  <span style={ui.vinValue}>{vin || "-"}</span>
                </div>

                {/* <div
                style={{
                  ...ui.resultBox,
                  background:
                    finalResult === "PASS"
                      ? "#00ff00"
                      : finalResult === "FAIL"
                      ? "#ff0033"
                      : "#000",
                  color: finalResult === "PASS" ? "#000" : "#fff"
                }}
              >
                {finalResult || "-"}
              </div> */}

                <div style={ui.tableContainer}>
                  <table style={ui.table}>
                    <thead>
                      <tr style={{ background: "#f5f5f5" }}>
                        <th style={ui.th}>CODE</th>
                        <th style={ui.th}>NAME</th>
                        <th style={ui.th}>REQ</th>
                        <th style={ui.th}>SCAN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parts.map((row, i) => (
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
            {/* SYSTEM STATUS BAR */}
            <div style={ui.systemStatusBar}>
              {/* SERVER STATUS */}
              <div style={ui.systemStatusItem}>
                <span style={ui.systemStatusLabel}>Server :</span>

                <span
                  style={{
                    ...ui.systemStatusValue,
                    color: serverConnected ? "#00ff66" : "#ff3333",
                  }}
                >
                  {serverConnected ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>

              {/* DIVIDER */}
              <div style={ui.systemDivider}></div>

              {/* MQTT STATUS */}
              <div style={ui.systemStatusItem}>
                <span style={ui.systemStatusLabel}>Data Logger : </span>

                <span
                  style={{
                    ...ui.systemStatusValue,
                    color: mqttConnected ? "#00ff66" : "#ff3333",
                  }}
                >
                  {mqttConnected ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={ui.footer}>Powered by Opertex Thetavega</div>
        </div>
      )}
    </>
  );
};

export default SKDPartScanning;

const ui = {
  root: {
    background: "#000",
    color: "#fff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Segoe UI",
    borderLeft: "6px solid #00cfff",
    borderTop: "6px solid #00cfff",
    borderRight: "6px solid #00cfff",
    borderBottom: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
    msUserSelect: "none",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fcf9f9",
    color: "#010508",
    height: 75,
    position: "relative",
    borderBottom: "3px solid #0385db",
  },

  title: {
    fontSize: 42,
    fontWeight: "bold",
    padding: "0px 60px",
    color: "#03090e",
    letterSpacing: 3,
    textTransform: "uppercase",
  },

  logoLeft: { position: "absolute", left: 0, height: 64 },
  logoRight: { position: "absolute", right: 0, height: 64 },

  masterBox: {
    margin: "5px",
    padding: "5px",
    border: "3px solid #3e3f3f",
    background: "#111",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },

  /* TOP AREA */
  topPanel: {
    background: "linear-gradient(90deg, #030303, #030303)",
    padding: "8px 18px 0px 18px",
    borderBottom: "2px solid #3e3f3f",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  lineRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 1,
    borderBottom: "2px solid #3e3f3f",
  },

  lineStatus: {
    letterSpacing: 1,
  },

  /* SECOND ROW */
  secondRow: {
    display: "grid",
    gridTemplateColumns: "32% 20% 1fr",
    alignItems: "center",
    marginTop: 0,
  },

  modelSection: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    fontSize: 36,
    fontWeight: "bold",
  },

  modelLabel: {
    color: "#ffd700",
    marginRight: 10,
  },

  modelValue: {
    color: "#ffffff",
  },

  passStatus: {
    textAlign: "center",
    fontSize: 95,
    fontWeight: "bold",
    letterSpacing: 10,
  },

  scanTopContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 10,
  },

  scanTopInput: {
    width: 520,
    height: 52,
    fontSize: 22,
    padding: "8px 16px",
    borderRadius: 12,
    border: "3px solid #d1d5db",
    background: "#e5e7eb",
    color: "#333",
    fontWeight: "bold",
    outline: "none",
  },

  scanAlertBox: {
    width: 520,
    height: 48,
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
    transition: "all 0.3s ease",
  },

  /* MAIN SECTION – 3 COLUMN LAYOUT */
  mainSection: {
    flex: 1,
    marginTop: 0,
    padding: "0",
    display: "grid",
    gridTemplateColumns: "32% 18% 1fr",
    gap: 10,
    alignItems: "stretch",
  },

  leftBox: {
    borderRadius: 6,
    padding: 20,
    display: "flex",
    flexDirection: "column",

    minHeight: 280,
  },

  /* ===== Top Layout ===== */

  stageTopRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 60,
  },

  stageHeader: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ffc107",
    marginBottom: 10,
  },

  stageNoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  stageNameContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: 260,
  },

  stageName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    lineHeight: 1.2,
  },

  stageNoLabel: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffc107",
  },

  /* ===== Circle ===== */

  stageCircleOuter: {
    width: 180,
    height: 180,
    borderRadius: "50%",
    border: "5px solid #00ff66",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 25px #00ff66, inset 0 0 20px rgba(0,255,0,0.4)",
  },

  stageCircleInner: {
    width: 125,
    height: 125,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 52,
    fontWeight: "bold",
    color: "#00ff66",
    background: "radial-gradient(circle at center, #033a18 0%, #000 90%)",
  },

  /* ===== Stage Name ===== */

  stageNameContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 6,
  },

  stageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffc107",
  },

  /* ===== Date Time ===== */

  dateTimeContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "CENTER ",
    gap: 20,
  },

  dateTimeRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  dateTag: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00ffff",
  },

  dateValue: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#ffffff",
  },

  /* CENTER PANEL */
  centerPanel: {
    borderRadius: 5,
    background: "#151515",
    border: "2px solid #3e3f3f",
    borderRight: "2px solid #3e3f3f",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "40px 0",
  },

  countBoxTop: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  countBoxBottom: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  countLabel: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffe600",
  },

  countValue: {
    fontSize: 66,
    fontWeight: "bold",
    color: "#ffe600",
    textShadow: "0 0 20px rgba(255,230,0,0.8)",
  },

  centerDividerLine: {
    width: "75%",
    height: 6,
    background: "#e97f06",
    boxShadow: "0 0 14px rgba(233,127,6,0.9)",
    borderRadius: 3,
  },

  /* RIGHT BOX */
  rightBox: {
    borderRadius: 10,
    padding: 18,
    background: "#151515",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  vinContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    padding: "5px 5px",
    borderRadius: 10,
    background: "linear-gradient(180deg,#2b2b2b,#111)",
    border: "2px solid #00c8ff",
    boxShadow: "0 0 15px rgba(0,200,255,0.5)",
    fontSize: 28,
    fontWeight: "bold",
  },

  vinLabel: {
    color: "#00c8ff",
    fontSize: 30,
    letterSpacing: 1,
  },

  vinValue: {
    color: "#ffffff",
    letterSpacing: 4,
    fontSize: 38,
    fontWeight: "bold",
  },

  resultBox: {
    height: 70,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 34,
    fontWeight: "bold",
  },

  tableContainer: {
    flex: 1,
    overflow: "auto",
    background: "#ffffff",
    borderRadius: 10,
    padding: 8,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#ffffff",
    color: "#000",
  },

  th: {
    padding: 14,
    border: "1px solid #ccc",
    fontWeight: "bold",
    fontSize: 22,
    background: "#f0f0f0",
  },

  td: {
    padding: 12,
    border: "1px solid #ddd",
    fontSize: 20,
    fontWeight: "bold",
  },

  systemStatusBar: {
    marginTop: 12,
    width: "100%",
    height: 50,
    borderRadius: 6,
    border: "2px solid #3e3f3f",
    background: "linear-gradient(180deg,#2d343a,#1a1f24)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
  },

  systemStatusItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  systemStatusLabel: {
    color: "#e5e5e5",
  },

  systemStatusValue: {
    fontWeight: "bold",
    letterSpacing: 2,
  },

  systemDivider: {
    width: 2,
    height: 28,
    background: "#777",
  },

  alertBox: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    color: "#03c50c",
    padding: 10,
  },

  footer: {
    background: "#ff8c00",
    color: "#000",
    textAlign: "center",
    padding: 4,
    fontWeight: "bold",
  },
};



// import React, { useState, useRef, useEffect } from "react";
// import API_BASE_URL from "../../config";
// import { useParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query"; // ✅ React Query

// const STORAGE_KEY = "skd_part_scan_qty";

// const SKDPartScanning = () => {
//   const { stageNo } = useParams();
//   const stageNumber = Number(stageNo);

//   const [vin, setVin] = useState("");
//   const [routeData, setRouteData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [scannedValue, setScannedValue] = useState("");
//   const scanInputRef = useRef(null);

//   const [wrongSku, setWrongSku] = useState(false);
//   const [lastScannedSku, setLastScannedSku] = useState(null);
//   const [lastScanText, setLastScanText] = useState("");
//   const [lastMqttVin, setLastMqttVin] = useState(null);
//   const [prePitchReceived, setPrePitchReceived] = useState(false);
//   const [isInterlocked, setIsInterlocked] = useState(false);

//   const [prePitchValue, setPrePitchValue] = useState(null); // 0 or 1

//   /* ================= RESULT STATE ================= */
//   const [finalResult, setFinalResult] = useState(null); // null | PASS | FAIL
//   const isPass = finalResult === "PASS";
//   const isFail = finalResult === "FAIL";

//   const [mqttConnected, setMqttConnected] = useState(false);

//   const isInvalidStage = !stageNumber || isNaN(stageNumber);
//   const [mqttSignals, setMqttSignals] = useState([]);

//   const [lastScannedValue, setLastScannedValue] = useState("");

//   const [operationMode, setOperationMode] = useState("AUTO");

//   const [alert, setAlert] = useState({
//     type: null, // "error" | "warning" | "success"
//     message: ""
//   });

//   const showAlert = (type, message, autoClear = true) => {
//     setAlert({ type, message });

//     if (autoClear) {
//       setTimeout(() => {
//         setAlert({ type: null, message: "" });
//       }, 3000);
//     }
//   };

//   // SKU → scanned count
//   const [scanQtyMap, setScanQtyMap] = useState({});

//   /* ================= FOCUS ================= */
//   useEffect(() => {
//     scanInputRef.current?.focus();
//   }, [scannedValue, wrongSku]);

//   /* ================= AUTO FOCUS WHEN READY ================= */
//   useEffect(() => {
//     if (mqttConnected && vin && routeData && finalResult !== "PASS") {
//       scanInputRef.current?.focus();
//     }
//   }, [mqttConnected, vin, routeData, finalResult]);

//   /* ================= LOAD MQTT SIGNALS (BY STAGE) ================= */
//   useEffect(() => {
//     if (!stageNumber) return;

//     const fetchMqttSignals = async () => {
//       try {
//         const res = await fetch(
//           `${API_BASE_URL}/api/mqtt-signal/by-stage-no/${stageNumber}`
//         );

//         const json = await res.json();

//         if (json.success && json.signals) {
//           setMqttSignals(json.signals);
//           console.log("Loaded MQTT Signals:", json.signals);
//         }
//       } catch (err) {
//         console.error("MQTT Signal Fetch Error:", err);
//       }
//     };

//     fetchMqttSignals();
//   }, [stageNumber]);

//   const vinSignal = mqttSignals.find((s) => s.payload_format === "RAW");

//   const partScanSignal =
//     mqttSignals.find((s) =>
//       s.logical_name?.toLowerCase()?.includes("part")
//     ) || null;

//   /* ================= MQTT POLLING VIA REACT QUERY ================= */

//   // VIN polling
// /* ================= MQTT TOPICS ================= */

// const VIN_TOPIC = `ST${stageNumber}_EngineNumber`;   // ✅ KEEP LIKE THIS
// const PREPITCH_TOPIC = "PrePitch";                  // ✅ CASE SENSITIVE

// /* ================= MQTT POLLING VIA REACT QUERY ================= */

// // ---------------- VIN POLLING ----------------
// useQuery({
//   queryKey: ["mqtt-vin", VIN_TOPIC],
//   enabled: !!stageNumber,
//   refetchInterval: 2000,
//   queryFn: async () => {
//     const res = await fetch(`${API_BASE_URL}/api/mqtt/listen`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ topic: VIN_TOPIC })
//     });

//     if (!res.ok) throw new Error("VIN listen failed");

//     const json = await res.json();
//     return json.success ? json.data?.trim() : null;
//   },
//   onSuccess: (newVin) => {
//     setMqttConnected(true);

//     if (!newVin) return;
//     if (newVin !== vin) {
//       handleNewVin(newVin);
//     }
//   },
//   onError: () => {
//     setMqttConnected(false);
//   }
// });

// // ---------------- PREPITCH POLLING ----------------
// useQuery({
//   queryKey: ["mqtt-prepitch", PREPITCH_TOPIC],
//   enabled: true,
//   refetchInterval: 1000,
//   queryFn: async () => {
//     const res = await fetch(`${API_BASE_URL}/api/mqtt/listen`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ topic: PREPITCH_TOPIC })
//     });

//     if (!res.ok) throw new Error("PrePitch listen failed");

//     const json = await res.json();
//     return json.success ? Number(json.data ?? 0) : 0;
//   },
//   onSuccess: (value) => {
//     setPrePitchValue(value);
//   },
//   onError: () => {
//     console.error("PREPITCH MQTT listen error");
//   }
// });

//   /* ================= PASS / FAIL DECISION ================= */
//   useEffect(() => {
//     if (!routeData) return;

//     const parts = routeData?.partRequirements || [];

//     const allScanned =
//       parts.length > 0 &&
//       parts.every((p) => (scanQtyMap[p.part_no] || 0) >= p.qty_required);

//     const prepitch = Number(prePitchValue ?? 0); // null → 0

//     // ================= PASS LOGIC =================
//     if (allScanned) {
//       if (finalResult !== "PASS") {
//         setFinalResult("PASS");
//         setIsInterlocked(false);
//         publishPartScanStatus("PASS"); // send immediately

//         showAlert("success", "WAIT FOR THE NEXT CYCLE 🔄", false);
//       }
//       return;
//     }

//     // ================= FAIL LOGIC =================
//     if (!allScanned && prepitch === 1) {
//       if (finalResult !== "FAIL") {
//         setFinalResult("FAIL");

//         // DO NOT INTERLOCK (as per your latest logic)
//         // setIsInterlocked(true);

//         publishPartScanStatus("FAIL");
//       }
//       return;
//     }

//     // ================= DEFAULT =================
//     setFinalResult(null);
//   }, [scanQtyMap, routeData, prePitchValue]); // eslint-disable-line react-hooks/exhaustive-deps

//   /* ================= NEW VIN HANDLER ================= */
//   const handleNewVin = (newVin) => {
//     if (!newVin || typeof newVin !== "string") return;

//     const trimmedVin = newVin.trim();
//     if (!trimmedVin) return;

//     if (vin === trimmedVin) return;

//     console.log("VIN CHANGED → RESETTING STATE:", trimmedVin);

//     setLastMqttVin(trimmedVin);
//     setVin(trimmedVin);

//     // DO NOT clear routeData here (prevents blinking)
//     setScanQtyMap({});
//     setLastScanText("");
//     setLastScannedSku(null);
//     setWrongSku(false);
//     setPrePitchReceived(false);
//     setPrePitchValue(null);
//     setIsInterlocked(false);
//     setFinalResult(null);

//     localStorage.removeItem(STORAGE_KEY);

//     fetchVinDataFromApi(trimmedVin);
//   };

//   /* ================= PUBLISH PASS / FAIL VIA API ================= */
//   const publishPartScanStatus = async (status) => {
//     if (!partScanSignal?.topic) return;

//     try {
//       await fetch(`${API_BASE_URL}/api/mqtt/publish`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           topic: partScanSignal.topic, // from mqtt-signal master
//           data: status === "PASS" ? "1" : "0"
//         })
//       });

//       console.log("Published Part Scan Status:", status);
//     } catch (err) {
//       console.error("MQTT publish error", err);
//     }
//   };

//   /* ================= FETCH VIN → MODEL + PARTS ================= */
//   const fetchVinDataFromApi = async (incomingVin) => {
//     try {
//       setLoading(true);

//       const res = await fetch(`${API_BASE_URL}/api/vin/get-model-by-vin`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           vin_no: incomingVin,
//           stage_no: stageNumber
//         })
//       });

//       const json = await res.json();
//       console.log("VIN API RESPONSE:", json);

//       // CASE 1: VIN not found at all
//       if (!json?.model) {
//         setRouteData(null);
//         showAlert("warning", "VIN NOT FOUND ⚠", true);
//         return;
//       }

//       // CASE 2: VIN exists but no SKU / no parts for this stage
//       if (!json?.partRequirements || json.partRequirements.length === 0) {
//         setRouteData(null);
//         showAlert(
//           "error",
//           "WRONG VIN ❌ (NO SKU FOR THIS STAGE)",
//           false
//         );
//         return;
//       }

//       // CASE 3: VALID VIN + SKU
//       setRouteData(json);
//       showAlert("success", "VIN LOADED ✅", true);
//     } catch (err) {
//       console.error("VIN API error", err);
//       showAlert("error", "SERVER CONNECTION FAILED 🌐", false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= PARTS MAPPING ================= */
//   const parts =
//     routeData?.partRequirements?.map((p) => ({
//       sku: p.part_no,
//       name: p.part_name,
//       qty: p.qty_required,
//       regex: p.regex_pattern,
//       minLen: p.min_len,
//       maxLen: p.max_len,
//       allowDuplicate: p.allow_duplicate
//     })) || [];

//   const chunkData = (data, size) => {
//     const chunks = [];
//     for (let i = 0; i < data.length; i += size) {
//       chunks.push(data.slice(i, i + size));
//     }
//     return chunks;
//   };

//   /* ================= SAVE SCAN TO DB ================= */
//   const savePartScanToDb = async ({
//     matchedPart,
//     barcode,
//     status,
//     reason = null
//   }) => {
//     try {
//       if (!routeData?.unitData?.unit_id) {
//         console.error("Unit ID missing");
//         return;
//       }

//       if (!routeData?.routeStep?.route_step_id) {
//         console.error("Route Step ID missing");
//         return;
//       }

//       const payload = {
//         unit_id: routeData.unitData.unit_id,
//         event_ts: new Date().toISOString(),
//         route_step_id: routeData.routeStep.route_step_id,
//         part_id: matchedPart?.part_id || null,
//         barcode_value: barcode,
//         result: status, // 'OK' only now
//         reason: reason
//       };

//       const res = await fetch(`${API_BASE_URL}/api/part-scan-results`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       const json = await res.json();

//       if (!json.success) {
//         console.error("DB Insert Failed:", json.message);
//       } else {
//         console.log("Scan saved:", json.data);
//       }
//     } catch (err) {
//       console.error("Part Scan Save Error:", err);
//     }
//   };

//   /* ================= SCAN HANDLER ================= */
//   const handleScan = async () => {
//     // 1) Block if final result already PASS
//     if (finalResult === "PASS") {
//       showAlert("warning", "SCAN NOT ALLOWED - STATUS PASS ✅", true);
//       return;
//     }

//     if (!scannedValue) return;
//     if (!routeData?.partRequirements) return;

//     const scannedSku = scannedValue.replace(/[\r\n]/g, "").trim();
//     setLastScanText(scannedSku);

//     if (!scannedSku) return;

//     let matchedPart = null;

//     // FIND MATCH
//     for (const part of routeData.partRequirements) {
//       if (!part.regex_pattern) continue;

//       const finalPattern = part.regex_pattern.replace(
//         "PART_CODE",
//         part.part_no
//       );

//       const regex = new RegExp(finalPattern);

//       if (!regex.test(scannedSku)) continue;

//       if (
//         (part.min_len && scannedSku.length < part.min_len) ||
//         (part.max_len && scannedSku.length > part.max_len)
//       ) {
//         continue;
//       }

//       matchedPart = part;
//       break;
//     }

//     // WRONG PART
//     if (!matchedPart) {
//       setWrongSku(true);
//       showAlert("error", "WRONG PART SCANNED ❌", true);

//       // DO NOT SAVE WRONG PART TO DB
//       setScannedValue("");
//       return;
//     }

//     setWrongSku(false);

//     const currentCount = scanQtyMap[matchedPart.part_no] || 0;

//     // BLOCK IF QTY COMPLETED
//     if (currentCount >= matchedPart.qty_required) {
//       showAlert("warning", "PART ALREADY COMPLETED ✅", true);
//       setScannedValue("");
//       return; // DO NOT SAVE
//     }

//     // BLOCK DUPLICATE (WHEN NOT ALLOWED)
//     if (!matchedPart.allow_duplicate && currentCount > 0) {
//       showAlert("error", "DUPLICATE SCAN NOT ALLOWED ❌", true);
//       setScannedValue("");
//       return; // DO NOT SAVE
//     }

//     // VALID SCAN
//     setScanQtyMap((prev) => ({
//       ...prev,
//       [matchedPart.part_no]: currentCount + 1
//     }));

//     setLastScannedSku(matchedPart.part_no);

//     // ONLY HERE WE SAVE TO DB (OK)
//     await savePartScanToDb({
//       matchedPart,
//       barcode: scannedSku,
//       status: "OK",
//       reason: null
//     });

//     setScannedValue("");
//   };

//   /* ================= ROW STYLE ================= */
//   const getRowStyle = (row) => {
//     const scanned = scanQtyMap[row.sku] || 0;

//     if (scanned === 0) {
//       return {
//         backgroundColor: "#ffffff",
//         color: "#000"
//       };
//     }

//     // Scanned but not complete
//     if (scanned > 0 && scanned < row.qty) {
//       return {
//         backgroundColor: "#ffa500",
//         color: "#000",
//         fontWeight: "bold"
//       };
//     }

//     // Fully completed
//     if (scanned >= row.qty) {
//       return {
//         backgroundColor: "#00ff00",
//         color: "#000",
//         fontWeight: "bold"
//       };
//     }

//     return {};
//   };

//   const dynamicBorderColor = isPass
//     ? "#00ff00"
//     : isFail
//     ? "#ff0033"
//     : null;

//   /* ================= RENDER ================= */
//   return (
//     <>
//       {isInvalidStage ? (
//         <div style={{ background: "black", color: "white", padding: 40 }}>
//           Invalid Stage Number
//         </div>
//       ) : (
//         <div
//           style={{
//             ...ui.root,
//             borderLeft: `6px solid ${
//               mqttConnected ? "#00ff00" : "#ff0033"
//             }`,
//             borderTop: `6px solid ${
//               mqttConnected ? "#00ff00" : "#ff0033"
//             }`,
//             borderRight: `6px solid ${
//               mqttConnected ? "#00ff00" : "#ff0033"
//             }`,
//             boxShadow: `0 0 30px ${
//               mqttConnected ? "#00ff00" : "#ff0033"
//             }`
//           }}
//         >
//           {/* HEADER */}
//           <div style={ui.header}>
//             <img src="/hero-logo.png" style={ui.logoLeft} />
//             <div style={ui.title}>SKD PART SCANNING</div>
//             <img src="/operatex-logo.jpg" style={ui.logoRight} />
//           </div>

//           {/* MASTER CONTAINER BOX */}
//           <div style={ui.masterBox}>
//             {/* TOP INDUSTRIAL HEADER PANEL */}
//             <div style={ui.topPanel}>
//               {/* FIRST ROW → LINE STATUS + MODE */}
//               <div style={ui.lineRow}>
//                 <div style={ui.lineStatus}>
//                   LINE STATUS :
//                   <span
//                     style={{
//                       color: isInterlocked ? "#ff0000" : "#00ff00",
//                       marginLeft: 10
//                     }}
//                   >
//                     {isInterlocked ? " INTERLOCKED" : " OK"}
//                   </span>
//                 </div>

//                 <div style={ui.modeContainer}>
//                   <span style={{ color: "#00ff00" }}>AUTO</span>

//                   <div
//                     style={ui.toggleSwitch}
//                     onClick={() =>
//                       setOperationMode((prev) =>
//                         prev === "AUTO" ? "MANUAL" : "AUTO"
//                       )
//                     }
//                   >
//                     <div
//                       style={{
//                         ...ui.toggleKnob,
//                         transform:
//                           operationMode === "AUTO"
//                             ? "translateX(0px)"
//                             : "translateX(28px)"
//                       }}
//                     />
//                   </div>

//                   <span style={{ color: "#ffd700" }}>MANUAL</span>
//                 </div>
//               </div>

//               {/* SECOND ROW → MODEL + PASS + SCAN INPUT */}
//               <div style={ui.secondRow}>
//                 {/* LEFT → MODEL + SKU */}
//                 <div style={ui.modelSection}>
//                   <div>
//                     <span style={ui.modelLabel}>Model:</span>
//                     <span style={ui.modelValue}>
//                       {routeData?.model?.model_name || "-"}
//                     </span>
//                   </div>

//                   <div>
//                     <span style={ui.modelLabel}>SKU :</span>
//                     <span style={ui.modelValue}>
//                       {routeData?.model?.model_code || "-"}
//                     </span>
//                   </div>
//                 </div>

//                 {/* CENTER → PASS / FAIL */}
//                 <div
//                   style={{
//                     ...ui.passStatus,
//                     color:
//                       finalResult === "PASS"
//                         ? "#00ff00"
//                         : finalResult === "FAIL"
//                         ? "#ff0033"
//                         : "#1faff1",
//                     textShadow:
//                       finalResult === "PASS"
//                         ? "0 0 40px #00ff00, 0 0 80px #00ff00"
//                         : finalResult === "FAIL"
//                         ? "0 0 40px #ff0033, 0 0 80px #ff0033"
//                         : "none"
//                   }}
//                 >
//                   {finalResult ?? "-"}
//                 </div>

//                 {/* RIGHT → SCANNED DATA INPUT (HEADER STYLE) */}
//                 <div style={ui.scanTopContainer}>
//                   {/* INPUT FIELD */}
//                   <input
//                     ref={scanInputRef}
//                     value={scannedValue}
//                     disabled={finalResult === "PASS" || !vin || !routeData}
//                     onChange={(e) => setScannedValue(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") {
//                         setLastScannedValue(scannedValue);
//                         handleScan();
//                         setTimeout(() => setScannedValue(""), 400);
//                       }
//                     }}
//                     style={ui.scanTopInput}
//                     placeholder="Scanned Data"
//                   />

//                   {/* ALERT / RESULT BELOW INPUT */}
//                   <div
//                     style={{
//                       ...ui.scanAlertBox,
//                       border:
//                         alert?.type === "error"
//                           ? "3px solid #ff0033"
//                           : alert?.type === "success"
//                           ? "3px solid #00ff00"
//                           : "3px solid #555",
//                       color:
//                         alert?.type === "error"
//                           ? "#ff0033"
//                           : alert?.type === "success"
//                           ? "#00ff00"
//                           : "#ccc",
//                       boxShadow:
//                         alert?.type === "error"
//                           ? "0 0 15px #ff0033"
//                           : alert?.type === "success"
//                           ? "0 0 15px #00ff00"
//                           : "none"
//                     }}
//                   >
//                     {alert?.type
//                       ? alert.message
//                       : lastScannedValue
//                       ? `Last Scan: ${lastScannedValue}`
//                       : "Waiting for scan..."}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* MAIN SECTION */}
//             <div style={ui.mainSection}>
//               {/* LEFT BOX → STAGE + DATE/TIME */}
//               <div
//                 style={{
//                   ...ui.leftBox,
//                   border: `3px solid ${dynamicBorderColor || "#3e3f3f"}`
//                 }}
//               >
//                 <div style={ui.stageRow}>
//                   <div style={ui.stageCircleOuter}>
//                     <div style={ui.stageCircleInner}>{stageNumber}</div>
//                   </div>

//                   <div style={ui.stageNameBox}>
//                     <div style={ui.stageTitle}>Stage :</div>
//                     <div style={ui.stageName}>
//                       {routeData?.routeStep?.stage_name || "-"}
//                     </div>
//                   </div>
//                 </div>

//                 <div style={ui.dateTimeContainer}>
//                   <div style={ui.dateTimeRow}>
//                     <div style={ui.dateTag}>Date:</div>
//                     <div style={ui.dateValue}>
//                       {new Date().toLocaleDateString()}
//                     </div>
//                   </div>

//                   <div style={ui.dateTimeRow}>
//                     <div style={ui.dateTag}>Time:</div>
//                     <div style={ui.dateValue}>
//                       {new Date().toLocaleTimeString()}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* CENTER PANEL → SCAN COMPLETE / SCAN QUANTITY */}
//               <div style={ui.centerPanel}>
//                 <div style={ui.countBoxTop}>
//                   <div style={ui.countLabel}>SCAN COMPLETE</div>
//                   <div style={ui.countValue}>
//                     {Object.values(scanQtyMap).reduce((a, b) => a + b, 0)}
//                   </div>
//                 </div>

//                 <div style={ui.centerDividerLine}></div>

//                 <div style={ui.countBoxBottom}>
//                   <div style={ui.countLabel}>SCAN QUANTITY</div>
//                   <div style={ui.countValue}>
//                     {parts.reduce((sum, p) => sum + p.qty, 0) -
//                       Object.values(scanQtyMap).reduce((a, b) => a + b, 0)}
//                   </div>
//                 </div>
//               </div>

//               {/* RIGHT BOX → VIN + TABLE */}
//               <div
//                 style={{
//                   ...ui.rightBox,
//                   border: `3px solid ${dynamicBorderColor || "#3e3f3f"}`
//                 }}
//               >
//                 <div style={ui.vinContainer}>
//                   <span style={ui.vinLabel}>VIN :</span>
//                   <span style={ui.vinValue}>{vin || "-"}</span>
//                 </div>

//                 <div style={ui.tableContainer}>
//                   <table style={ui.table}>
//                     <thead>
//                       <tr style={{ background: "#f5f5f5" }}>
//                         <th style={ui.th}>SKU</th>
//                         <th style={ui.th}>NAME</th>
//                         <th style={ui.th}>REQ</th>
//                         <th style={ui.th}>SCAN</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {parts.map((row, i) => (
//                         <tr key={i} style={getRowStyle(row)}>
//                           <td style={ui.td}>{row.sku}</td>
//                           <td style={ui.td}>{row.name}</td>
//                           <td style={ui.td}>{row.qty}</td>
//                           <td style={ui.td}>{scanQtyMap[row.sku] || 0}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* FOOTER */}
//           <div style={ui.footer}>Powered by Opertex Thetavega</div>
//         </div>
//       )}
//     </>
//   );
// };

// export default SKDPartScanning;

// const ui = {
//   root: {
//     background: "#000",
//     color: "#fff",
//     height: "100vh",
//     display: "flex",
//     flexDirection: "column",
//     fontFamily: "Segoe UI",
//     borderLeft: "6px solid #00cfff",
//     borderTop: "6px solid #00cfff",
//     borderRight: "6px solid #00cfff",
//     borderBottom: "none",
//     userSelect: "none",
//     WebkitUserSelect: "none",
//     msUserSelect: "none"
//   },

//   header: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     background: "#000",
//     color: "#fff",
//     height: 75,
//     position: "relative",
//     borderBottom: "3px solid #0099ff"
//   },

//   title: {
//     fontSize: 42,
//     fontWeight: "bold",
//     padding: "0px 60px",
//     color: "#faf6f6",
//     letterSpacing: 3,
//     textTransform: "uppercase"
//   },

//   logoLeft: { position: "absolute", left: 0, height: 74 },
//   logoRight: { position: "absolute", right: 0, height: 74 },

//   masterBox: {
//     margin: "5px",
//     padding: "5px",
//     border: "3px solid #3e3f3f",
//     background: "#111",
//     display: "flex",
//     flexDirection: "column",
//     gap: 10,
//     flex: 1
//   },

//   /* TOP AREA */
//   topPanel: {
//     background: "linear-gradient(90deg, #030303, #030303)",
//     padding: "8px 18px 0px 18px",
//     borderBottom: "2px solid #3e3f3f",
//     display: "flex",
//     flexDirection: "column",
//     gap: 4
//   },

//   lineRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     fontSize: 32,
//     fontWeight: "bold",
//     letterSpacing: 1,
//     borderBottom: "2px solid #3e3f3f",
//   },

//   lineStatus: {
//     letterSpacing: 1
//   },

//   modeContainer: {
//     display: "flex",
//     alignItems: "center",
//     gap: 15,
//     fontSize: 26,
//     fontWeight: "bold"
//   },

//   toggleSwitch: {
//     width: 60,
//     height: 28,
//     background: "#333",
//     borderRadius: 20,
//     position: "relative",
//     padding: 2,
//     boxShadow: "0 0 10px rgba(0,0,0,0.8)"
//   },

//   toggleKnob: {
//     width: 24,
//     height: 24,
//     background: "#00ff99",
//     borderRadius: "50%",
//     transition: "0.3s"
//   },

//   /* SECOND ROW */
//   secondRow: {
//     display: "grid",
//     gridTemplateColumns: "32% 20% 1fr",
//     alignItems: "center",
//     marginTop: 0
//   },

//   modelSection: {
//     display: "flex",
//     flexDirection: "column",
//     gap: 2,
//     fontSize: 36,
//     fontWeight: "bold"
//   },

//   modelLabel: {
//     color: "#ffd700",
//     marginRight: 10
//   },

//   modelValue: {
//     color: "#ffffff"
//   },

//   passStatus: {
//     textAlign: "center",
//     fontSize: 95,
//     fontWeight: "bold",
//     letterSpacing: 10
//   },

// scanTopContainer: {
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "flex-end",
//   gap: 8,
//   marginTop: 10
// },

// scanTopInput: {
//   width: 520,
//   height: 52,
//   fontSize: 22,
//   padding: "8px 16px",
//   borderRadius: 12,
//   border: "3px solid #d1d5db",
//   background: "#e5e7eb",
//   color: "#333",
//   fontWeight: "bold",
//   outline: "none"
// },

// scanAlertBox: {
//   width: 520,
//   height: 48,
//   background: "transparent",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   fontSize: 20,
//   fontWeight: "bold",
//   letterSpacing: 1,
//   transition: "all 0.3s ease"
// },

//   /* MAIN SECTION – 3 COLUMN LAYOUT */
//   mainSection: {
//     flex: 1,
//     marginTop: 10,
//     padding: "10px 10px 20px 10px",
//     display: "grid",
//     gridTemplateColumns: "32% 18% 1fr",
//     gap: 10,
//     alignItems: "stretch"
//   },

//   /* LEFT BOX */
//   leftBox: {
//     borderRadius: 10,
//     padding: 18,
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "space-between",
//     background: "#151515"
//   },

//   stageRow: {
//     display: "flex",
//     alignItems: "center",
//     gap: 20
//   },

//   stageCircleOuter: {
//     width: 140,
//     height: 140,
//     borderRadius: "50%",
//     border: "4px solid #00ff66",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     boxShadow: "0 0 20px rgba(0,255,0,0.4)"
//   },

//   stageCircleInner: {
//     width: 110,
//     height: 110,
//     borderRadius: "50%",
//     border: "4px solid #003300",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: 38,
//     fontWeight: "bold",
//     color: "#00ff66",
//     background: "radial-gradient(circle, #003300, #000)"
//   },

//   stageNameBox: {
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "center"
//   },

//   stageTitle: {
//     fontSize: 22,
//     color: "#ffd700",
//     marginBottom: 4
//   },

//   stageName: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#ffffff"
//   },

//   dateTimeContainer: {
//     marginTop: 20,
//     display: "flex",
//     flexDirection: "column",
//     gap: 10
//   },

//   dateTimeRow: {
//     display: "flex",
//     alignItems: "center",
//     gap: 15
//   },

//   dateTag: {
//     background: "#e5e5e5",
//     color: "#000",
//     padding: "6px 16px",
//     borderRadius: 6,
//     fontSize: 18,
//     fontWeight: "bold",
//     minWidth: 90,
//     textAlign: "center",
//     textTransform: "uppercase"
//   },

//   dateValue: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#ffffff"
//   },

//   /* CENTER PANEL */
//   centerPanel: {
//     borderRadius: 10,
//     background: "#151515",
//     borderLeft: "2px solid #3e3f3f",
//     borderRight: "2px solid #3e3f3f",
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "40px 0"
//   },

//   countBoxTop: {
//     textAlign: "center",
//     display: "flex",
//     flexDirection: "column",
//     gap: 18
//   },

//   countBoxBottom: {
//     textAlign: "center",
//     display: "flex",
//     flexDirection: "column",
//     gap: 18
//   },

//   countLabel: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#ffe600",
//     letterSpacing: 1
//   },

//   countValue: {
//     fontSize: 46,
//     fontWeight: "bold",
//     color: "#ffe600",
//     textShadow: "0 0 20px rgba(255,230,0,0.8)"
//   },

//   centerDividerLine: {
//     width: "75%",
//     height: 6,
//     background: "#e97f06",
//     boxShadow: "0 0 14px rgba(233,127,6,0.9)",
//     borderRadius: 3
//   },

//   /* RIGHT BOX */
//   rightBox: {
//     borderRadius: 10,
//     padding: 18,
//     background: "#151515",
//     display: "flex",
//     flexDirection: "column",
//     gap: 12
//   },

//   vinContainer: {
//     background: "#cccccc",
//     color: "#000",
//     padding: 10,
//     borderRadius: 10,
//     fontSize: 22,
//     fontWeight: "bold",
//     display: "flex",
//     gap: 15,
//     alignItems: "center"
//   },

//   vinLabel: {
//     color: "#000",
//     fontWeight: "bold"
//   },

//   vinValue: {
//     color: "#000",
//     letterSpacing: 2
//   },

//   resultBox: {
//     height: 70,
//     borderRadius: 12,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: 34,
//     fontWeight: "bold"
//   },

//   tableContainer: {
//     flex: 1,
//     overflow: "auto",
//     background: "#ffffff",
//     borderRadius: 10,
//     padding: 5
//   },

//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//     background: "#ffffff",
//     color: "#000"
//   },

//   th: {
//     padding: 8,
//     border: "1px solid #ccc",
//     fontWeight: "bold",
//     fontSize: 15
//   },

//   td: {
//     padding: 6,
//     border: "1px solid #ddd",
//     fontSize: 14
//   },

//   alertBox: {
//     textAlign: "center",
//     fontWeight: "bold",
//     fontSize: 20,
//     color: "#03c50c",
//     padding: 10
//   },

//   footer: {
//     background: "#ff8c00",
//     color: "#000",
//     textAlign: "center",
//     padding: 4,
//     fontWeight: "bold"
//   }
// };
