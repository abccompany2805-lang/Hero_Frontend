import React, { useState, useRef, useEffect } from "react";
import API_BASE_URL from "../../config";

const STORAGE_KEY = "skd_part_scan_qty";

const SKDPartScanning = () => {
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


/* ================= MQTT VIN VIA API (POLLING) ================= */
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mqtt/listen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "stage_10" }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

    if (json.success && json.data) {
  handleNewVin(json.data);
}
    } catch (err) {
      console.error("MQTT API polling error:", err.message);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [lastMqttVin]);



useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mqtt/listen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "stage_10_prepitch" }),
      });

      if (!res.ok) return;

      const json = await res.json();
      if (!json.success || json.data === undefined || !routeData) return;

      const prepitch = Number(json.data); // 0 or 1
      setPrePitchValue(prepitch);

      const parts = routeData.stages?.[0]?.parts || [];
      const allScanned = parts.every(
        (p) => (scanQtyMap[p.part_number] || 0) >= p.quantity_required
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




// useEffect(() => {
//   if (!prePitchReceived || !routeData) return;

//   const parts = routeData?.stages?.[0]?.parts || [];

//   const allScanned = parts.every(
//     (p) => (scanQtyMap[p.part_number] || 0) >= p.quantity_required
//   );

//   if (!allScanned) {
//     setIsInterlocked(true);
//   }
// }, [prePitchReceived, scanQtyMap, routeData]);


// const handleNewVin = (newVin) => {
//   if (!newVin || newVin === lastMqttVin) return;

//   console.log("VIN CHANGED → RESETTING STATE:", newVin);

//   setLastMqttVin(newVin);
//   setVin(newVin);

//   // 🔴 RESET ALL VIN-DEPENDENT STATE
//   setRouteData(null);
//   setScanQtyMap({});
//   setLastScanText("");
//   setLastScannedSku(null);
//   setWrongSku(false);
//   localStorage.removeItem(STORAGE_KEY);

//   // 🔵 FETCH ROUTE DATA
//   fetchVinDataFromApi(newVin);
// };

const handleNewVin = (newVin) => {
  if (!newVin || newVin === lastMqttVin) return;

  console.log("VIN CHANGED → RESETTING STATE:", newVin);

  setLastMqttVin(newVin);
  setVin(newVin);

  // 🔴 RESET VIN STATE
  setRouteData(null);
  setScanQtyMap({});
  setLastScanText("");
  setLastScannedSku(null);
  setWrongSku(false);
  setPrePitchReceived(false);
  setPrePitchValue(null);
  setIsInterlocked(false);

  localStorage.removeItem(STORAGE_KEY);

  fetchVinDataFromApi(newVin);
};


const publishStageStatus = async (value) => {
  try {
    await fetch(`${API_BASE_URL}/api/mqtt/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "part_stage10_status",
        data: String(value), // "0" or "1"
      }),
    });

    console.log("✅ Published part_stage10_status:", value);
  } catch (err) {
    console.error("❌ MQTT publish error", err);
  }
};


const fetchVinDataFromApi = async (incomingVin) => {
  try {
    setLoading(true);

    const res = await fetch(
      `${API_BASE_URL}/api/vin/get-full-route-with-parts-by-vin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin_number: incomingVin }),
      }
    );

    const json = await res.json();
    if (json.success) {
      setRouteData(json.data);
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
        `${API_BASE_URL}/api/vin/get-full-route-with-parts-by-vin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin_number: vin }),
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
    routeData?.stages?.[0]?.parts?.map((p) => ({
      sku: p.part_number,
      name: p.part_name,
      qty: p.quantity_required,
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
  if (!scannedValue) return;

  const scannedSku = scannedValue.trim();
  setLastScanText(scannedSku); // ✅ NEW — always show last scanned text

  const part = parts.find((p) => p.sku === scannedSku);

  if (!part) {
    setWrongSku(true);
    setScannedValue("");
    return;
  }

  if (!scannedValue || isInterlocked) return;


  setWrongSku(false);
  setLastScannedSku(scannedSku);

  setScanQtyMap((prev) => {
    const current = prev[scannedSku] || 0;
    if (current >= part.qty) return prev;
    return { ...prev, [scannedSku]: current + 1 };
  });

  setScannedValue(""); // clear input
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
    <div style={s.root}>
      {/* ================= HEADER ================= */}
     <div style={s.headerRow}>
  {/* LEFT LOGO */}
  <img
    src="/hero-logo.png"
    alt="Hero"
    style={{
      height: 53,
      position: "absolute",
      left: 20,
    }}
  />

  {/* CENTER TITLE */}
  <div style={s.headerTitle}>SKD Part Scanning</div>

  {/* RIGHT LOGO */}
  <img
    src="/operatex-logo.jpg"
    alt="OperateX"
    style={{
      height: 53,
      position: "absolute",
      right: 20,
    }}
  />
</div>


      {/* ================= MODE ROW ================= */}
      <div style={s.modeRow}>
        <div style={s.modeGroup}>
          <div style={s.modeOption}>
            <span style={s.radioSelected}></span>
            <span style={s.modeText}>Auto Mode</span>
          </div>
          <div style={s.modeOption}>
            <span style={s.radioUnselected}></span>
            <span style={s.modeText}>Manual Mode</span>
          </div>
        </div>
      </div>

      {/* ================= STATUS ================= */}
      <div style={s.statusRow}>
        <span style={{ color: "#00aaff" }}>
         LINE STATUS -{" "}
<span style={{ color: isInterlocked ? "red" : "#00ff00" }}>
  {isInterlocked ? "INTERLOCK" : "OK"}
</span>

        </span>

        <span style={{ color: "#00ff00", fontWeight: "bold" }}>
          SKU: {routeData?.model_sku_code || "---"}
        </span>

        <span style={{ color: "#00ff00", fontWeight: "bold" }}>
          MQTT Connected
        </span>
      </div>

      {/* ================= MAIN ================= */}
      <div
  style={{
    ...s.mainBox,
    border: isInterlocked ? "3px solid red" : s.mainBox.border,
  }}
>

        <div style={s.row1}>
          <div style={s.model}>
            Model:- <span>{routeData?.model_sku_name || "---"}</span>
          </div>

          <input
  style={{
    ...s.vinSingle,
    background: isInterlocked ? "#ff4d4d" : s.vinSingle.background,
  }}

            value={vin}
            placeholder="Enter VIN"
            onChange={(e) => setVin(e.target.value)}
            onKeyDown={(e) => {
  if (e.key === "Enter") {
    handleNewVin(vin.trim());
  }
}}

          />

          <div style={s.dateTimeBox}>
            <div style={s.dateTimeTag}>DATE</div>
            <div style={s.dateTimeValue}>
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <div style={s.row2}>
          <div style={s.stageSideRow}>
            <div style={s.stageItem}>
              <span style={s.stageLabel}>Stage</span>
             <div
  style={{
    ...s.circle,
    border: isInterlocked ? "3px solid red" : s.circle.border,
  }}
>

                {routeData?.stages?.[0]?.stage_no || "--"}
              </div>
            </div>
          </div>

          <div style={s.scanBlock}>
           

           <input
  ref={scanInputRef}
  disabled={isInterlocked}
  style={{
    ...s.scanInput,
    border: isInterlocked
      ? "3px solid red"
      : wrongSku
      ? "3px solid red"
      : s.scanInput.border,
    background: isInterlocked ? "#ffe6e6" : s.scanInput.background,
  }}
  value={scannedValue}

              placeholder="Waiting for scan..."
              onChange={(e) => setScannedValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
            />
            <div style={s.scanLabel}>
  {loading ? "Fetching VIN..." : "Scanned Data:-"}

  {lastScanText && (
    <span style={{ marginLeft: 12, fontWeight: "bold", color: "#00ff00" }}>
      {lastScanText}
    </span>
  )}

  {wrongSku && (
    <span style={{ color: "red", marginLeft: 12, fontWeight: "bold" }}>
      WRONG SKU
    </span>
  )}
</div>

          </div>

          <div style={s.dateTimeBox}>
            <div style={s.dateTimeTag}>TIME</div>
            <div style={s.dateTimeValue}>
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* ================= PASS TABLE ================= */}
<div style={s.passWrapper}>
  <div
    style={{
      ...s.passLabel,
      color: isInterlocked ? "red" : s.passLabel.color,
      border: isInterlocked ? "4px solid red" : s.passLabel.border,
    }}
  >
    {isInterlocked ? (
      <>
        <span>F</span>
        <span>A</span>
        <span>I</span>
        <span>L</span>
      </>
    ) : (
      <>
        <span>P</span>
        <span>A</span>
        <span>S</span>
        <span>S</span>
      </>
    )}
  </div>

  <div style={s.tableArea}>
    {chunkData(
      [...parts].sort((a, b) => {
        if (a.sku === lastScannedSku) return -1;
        if (b.sku === lastScannedSku) return 1;
        return 0;
      }),
      6
    ).map((chunk, idx) => (
      <table key={idx} style={s.passTable}>
        <thead>
          <tr>
            <th style={s.passTh}>Part SKU</th>
            <th style={s.passTh}>Part Name</th>
            <th style={s.passTh}>Qty</th>
            <th style={s.passTh}>Scanned</th>
          </tr>
        </thead>
        <tbody>
          {chunk.map((row, i) => (
            <tr key={i} style={getRowStyle(row)}>
              <td style={s.passTd}>{row.sku}</td>
              <td style={s.passTd}>{row.name}</td>
              <td style={s.passTd}>{row.qty}</td>
              <td style={s.passTd}>{scanQtyMap[row.sku] || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ))}
  </div>
</div>

    </div>
  );
};

export default SKDPartScanning;



/* ================= STYLES ================= */

const green = "#00ff00";



const s = {
 root: {
  width: "100vw",
  height: "100vh",
  background: "#000",
  color: green,
  fontFamily: "Montserrat, Segoe UI, Arial",
  overflow: "hidden",
  paddingBottom: "30px",   // ✅ small bottom space


},

  /* ================= HEADER ================= */
  headerRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },

  headerTitle: {
    background: "#00b7ff",
    color: "#000",
    fontSize: 34,
    fontWeight: "bold",
    padding: "14px 90px",
    borderRadius: "0px 0px 30px 30px",
    lineHeight: 1,
  },

  /* ================= MODE ROW ================= */
  modeRow: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: "6px 16px",
    fontSize: 18,
  },

  modeGroup: {
    display: "flex",
    gap: 68,
    padding: "6px 16px",
    border: "2px solid #ffffff",
  },

  modeOption: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  modeVINOption: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginRight: 54,
  },

  modeText: {
    color: "#ffd700",
    fontSize: 18,
    whiteSpace: "nowrap",
  },

  modeTextWhite: {
    color: "#ffffff",
    fontSize: 18,
    whiteSpace: "nowrap",
  },

  radioSelected: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#ffffff",
    border: "2px solid #ffffff",
  },

  radioUnselected: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "transparent",
    border: "2px solid #ffffff",
  },

  checkboxEmpty: {
    width: 16,
    height: 16,
    border: "2px solid #ffffff",
  },

  checkboxChecked: {
    width: 16,
    height: 16,
    border: "2px solid #ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },

  /* ================= STATUS ================= */
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 20px",
    fontSize: 28,
    width: "100%",
  },

  /* ================= MAIN BOX ================= */
  mainBox: {
    border: `3px solid ${green}`,
    borderRadius: 14,
    padding: 14,
    margin: "8px",

    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  row1: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  row2: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    minHeight: 100,
  },

  /* ================= STAGE / SIDE ================= */
  stageSideRow: {
    display: "flex",
    gap: 30,
    alignItems: "center",
  },

  stageItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  stageLabel: {
    fontSize: 28,
    fontWeight: "bold",
  },

  circle: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    border: `3px solid ${green}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },

  /* ================= MODEL ================= */
  model: {
    fontSize: 24,
    fontWeight: "bold",
  },

  /* ================= VIN ================= */
  vinSingle: {
    width: "420px",
    display: "flex",
    justifyContent: "center",
    background: "#2ecc40",
    color: "#000",
    fontWeight: "bold",
    fontSize: 22,
    padding: "8px 18px",
    borderRadius: 10,
  },

  /* ================= DATE / TIME ================= */
  dateTimeBox: {
    width: 280,
    display: "flex",
    gap: 10,
    color: "#fcf9f9",
    fontWeight: "bold",
    borderRadius: 10,
    padding: "8px 14px",
    textAlign: "center",
  },

  dateTimeTag: {
    fontSize: 22,
    background: "#2ecc40",
    padding: "8px 12px",
    borderRadius: 8,
  },

  dateTimeValue: {
    fontSize: 22,
    marginTop: 2,
  },

  /* ================= SCAN ================= */
  scanBlock: {
    width: "34%",
  },

  scanInput: {
  height: 42,
  width: "100%",
  background: "#ffffff",
  borderRadius: 4,
  border: "2px solid #00ff00",
  fontSize: 20,
  fontWeight: "bold",
  padding: "4px 10px",
  outline: "none",
},


  scanLabel: {
    color: "#ffd700",
    marginBottom: 6,
    fontSize: 28,
  },

  scanBox: {
    height: 42,
    background: "#ffffff",
    borderRadius: 2,
  },

  /* ================= PASS TABLE ================= */
  passWrapper: {
    display: "flex",
    background: "#000",
    border: "4px solid #1aff1a",
    borderRadius: 16,
    padding: 10,
    height: "48%",
    width: "100%",
    gap: 10,
    boxSizing: "border-box",
  },

  passLabel: {
    width: 80,
    background: "#001a00",
    border: "4px solid #1aff1a",
    borderRadius: 14,
    color: "#1aff1a",
    fontWeight: "bold",
    fontSize: 40,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    letterSpacing: 3,
  },

  tableArea: {
    display: "flex",
    flex: 1,
    gap: 6,
    overflow: "hidden",
  },

  passTable: {
    flex: 1,
    borderCollapse: "collapse",
    tableLayout: "fixed",
    background: "#008000",
    color: "#fff",
    fontSize: 20,
    height: "100%",
  },

  passTh: {
    background: "#d9d9d9",
    color: "#000",
    fontWeight: "bold",
    border: "2px solid #ffffff",
    padding: "4px 6px",
    fontSize: 18,
    textAlign: "center",
  },

  passTd: {
    border: "2px solid #ffffff",
    padding: "6px 6px",
    fontSize: 18,
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
