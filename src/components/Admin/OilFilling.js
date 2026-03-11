// code with single oil level filling, DB insert and mqtt from frontend
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import mqtt from "mqtt";
import API_BASE_URL from "../../config";

const OilFilling = () => {
  const [now, setNow] = useState(new Date());

  /* ================= STAGE ================= */
  const { stageNo } = useParams();
  const stageNumber = parseInt(stageNo, 10);
  const isInvalidStage = isNaN(stageNumber);
  const oilLevelTopic = `ST${stageNumber}_OilLevel`;
  const resultTopic = `ST${stageNumber}_Result`;
  const prePitchTopic = "PrePitch";
  const engineTopic = `ST${stageNumber}_EngineNumber`;

  /* ================= SYSTEM STATES ================= */
  const [operationMode, setOperationMode] = useState("AUTO");
  const [lineStatus, setLineStatus] = useState("INTERLOCKED");

  /* ================= API DATA STATES ================= */
  const [vinInput, setVinInput] = useState("");
  const [modelName, setModelName] = useState("-");
  const [modelSku, setModelSku] = useState("-");
  const [minOil, setMinOil] = useState("-");
  const [maxOil, setMaxOil] = useState("-");
  const [showResult, setShowResult] = useState(false);
  const [showOilValue, setShowOilValue] = useState(false);
  const [liveOil, setLiveOil] = useState(0);

  const [finalStatus, setFinalStatus] = useState(null);
  const [stageName, setStageName] = useState("-");
  const mqttClientRef = useRef(null);
  const [prePitch, setPrePitch] = useState(0);
  const [resultPublished, setResultPublished] = useState(false);
  const [mqttConnected, setMqttConnected] = useState(false);
  const lastSentStatusRef = useRef(null);
  const [vinError, setVinError] = useState(null);

  const [mqttSignals, setMqttSignals] = useState([]);
  const lastVinRef = useRef(null);
  const vinTopicRef = useRef(null);
  const [apiData, setApiData] = useState(null);
  const [oilResult, setOilResult] = useState(null);
  const [vinLoaded, setVinLoaded] = useState(false);
  const [passLocked, setPassLocked] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [oilAttempts, setOilAttempts] = useState([]);

  /* ================= OK / NOT OK LOGIC ================= */
  const isOilOk =
    minOil !== "-" &&
    maxOil !== "-" &&
    liveOil >= Number(minOil) &&
    liveOil <= Number(maxOil);

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
        const res = await fetch(
          `${API_BASE_URL}/api/mqtt-signal/by-stage-no/${stageNumber}`,
        );
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
        50% { background-color: #980c0c; }
        100% { background-color: #000; }
      }

      @keyframes fullScreenPulseGreen {
        0% { background-color: #000; }
        50% { background-color: #084b08; }
        100% { background-color: #000; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const resetCycleState = () => {
    // 🔴 Clear tightening data
    localStorage.removeItem(`stage_${stageNumber}_result_id`);
    setFinalStatus(null);
    setOilResult(null);
    setLiveOil(0);
    setAttempt(1);

    setPrePitch(0);
    setPassLocked(false);

    // 🔴 Clear VIN state
    setVinLoaded(false);
    setVinError(null);

    // 🔴 Clear Model + SKU + Stage info
    setModelName("-");
    setModelSku("-");
    setStageName("-");
    setMinOil("-");
    setMaxOil("-");

    // 🔴 Clear backend data
    setApiData(null);

    // 🔴 Clear publish tracking
    lastSentStatusRef.current = null;
  };

  const handleVinKeyDown = (e) => {
    if (e.key === "Enter") {
      const trimmed = vinInput.trim();
      if (!trimmed) return;

      resetCycleState();

      lastVinRef.current = trimmed; // prevent duplicate MQTT call
      fetchModelData(trimmed, stageNumber);
    }
  };

  const getRootStyle = () => {
    let baseStyle = { ...styles.root };

    if (finalStatus === "NOK") {
      baseStyle.animation = "fullScreenFlashRed 0.7s infinite";
    } else if (finalStatus === "OK") {
      baseStyle.animation = "fullScreenPulseGreen 1.5s infinite";
    } else {
      baseStyle.animation = "none";
    }

    return baseStyle;
  };

  // const insertProcessResult = async (resultValue) => {
  //   try {
  //     const recipeProcess = apiData.recipeProcess?.[0];

  //     const payload = {
  //       event_ts: new Date().toISOString(),
  //       unit_id: apiData.unitData.unit_id,
  //       route_step_id: apiData.routeStep.route_step_id,
  //       tool_id: recipeProcess.tool_id,
  //       program_no: recipeProcess.program_no,
  //       result: resultValue,
  //       lsl: recipeProcess.lsl,
  //       usl: recipeProcess.usl,
  //       vin_no: vinInput,
  //       value_payload: {
  //         oil_level_value: liveOil,
  //         stage_no: stageNumber,
  //         timestamp: new Date().toISOString(),
  //       },
  //     };

  //     // 🔹 Get stored result_id (if any)
  //     const storedResultId = localStorage.getItem(
  //       `stage_${stageNumber}_result_id`,
  //     );

  //     let response;

  //     if (storedResultId) {
  //       // 🔥 UPDATE (Rework case)
  //       response = await fetch(
  //         `${API_BASE_URL}/api/process-results/${storedResultId}`,
  //         {
  //           method: "PUT",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             result: resultValue,
  //             value_payload: payload.value_payload,
  //           }),
  //         },
  //       );
  //     } else {
  //       // 🔥 FIRST INSERT
  //       response = await fetch(`${API_BASE_URL}/api/process-results`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       });
  //     }

  //     const data = await response.json();

  //     // 🔴 If first time NOK → store result_id
  //     if (!storedResultId && resultValue === "NOK") {
  //       localStorage.setItem(`stage_${stageNumber}_result_id`, data.result_id);
  //     }
  //   } catch (err) {
  //     console.error("Process Result Error:", err);
  //   }
  // };

  //   const insertProcessResult = async (resultValue) => {
  //   try {

  //     if (!apiData) return;

  //     const recipeProcess = apiData.recipeProcess?.[0];

  //     if (!recipeProcess) {
  //       console.error("Recipe process data missing");
  //       return;
  //     }

  //     const payload = {
  //       event_ts: new Date().toISOString(),
  //       unit_id: apiData.unitData?.unit_id,
  //       route_step_id: apiData.routeStep?.route_step_id,
  //       tool_id: recipeProcess.tool_id,
  //       program_no: recipeProcess.program_no,
  //       result: resultValue,
  //       lsl: recipeProcess.lsl,
  //       usl: recipeProcess.usl,
  //       vin_no: vinInput,

  //       value_payload: {
  //         oil_level_value: liveOil,
  //         stage_no: stageNumber,
  //         timestamp: new Date().toISOString(),
  //       },
  //     };

  //     const storageKey = `stage_${stageNumber}_result_id`;
  //     const storedResultId = localStorage.getItem(storageKey);

  //     let response;

  //     /* ================= UPDATE (REWORK) ================= */

  //     if (storedResultId) {

  //       response = await fetch(
  //         `${API_BASE_URL}/api/process-results/${storedResultId}`,
  //         {
  //           method: "PUT",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             result: resultValue,
  //             value_payload: payload.value_payload,
  //           }),
  //         }
  //       );

  //     }

  //     /* ================= FIRST INSERT ================= */

  //     else {

  //       response = await fetch(
  //         `${API_BASE_URL}/api/process-results`,
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(payload),
  //         }
  //       );

  //     }

  //     const data = await response.json();

  //     /* ================= STORE RESULT ID ================= */

  //     if (!storedResultId && data?.result_id) {
  //       localStorage.setItem(storageKey, data.result_id);
  //     }

  //   } catch (err) {
  //     console.error("Process Result Error:", err);
  //   }
  // };

  const insertProcessResult = async (resultValue) => {
    try {
      if (!apiData) return;

      const recipeProcess = apiData.recipeProcess?.[0];
      if (!recipeProcess) return;

      const payload = {
        event_ts: new Date().toISOString(),
        unit_id: apiData.unitData.unit_id,
        route_step_id: apiData.routeStep.route_step_id,
        tool_id: recipeProcess.tool_id,
        program_no: recipeProcess.program_no,
        result: resultValue,
        lsl: recipeProcess.lsl,
        usl: recipeProcess.usl,
        vin_no: vinInput,
        line_status: lineStatus,

        value_payload: {
          oil_level_value: liveOil,
          stage_no: stageNumber,
          timestamp: new Date().toISOString(),
        },
      };

      console.log("Sending Payload:", payload);

      const storageKey = `stage_${stageNumber}_result_id`;
      const storedResultId = localStorage.getItem(storageKey);

      let response;

      if (storedResultId) {
        response = await fetch(
          `${API_BASE_URL}/api/process-results/${storedResultId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
      } else {
        response = await fetch(`${API_BASE_URL}/api/process-results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const text = await response.text();
        console.error("API ERROR:", text);
        return;
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (!storedResultId && data?.result_id) {
        localStorage.setItem(storageKey, data.result_id);
      }
    } catch (err) {
      console.error("Process Result Error:", err);
    }
  };
  /* ================= VIN LISTENER ================= */

  useEffect(() => {
    if (!stageNumber) return;

    if (mqttClientRef.current) {
      mqttClientRef.current.end(true);
    }

    const client = mqtt.connect("ws://192.168.29.14:9001", {
      username: "mqttuser",
      password: "Theta@123",
      reconnectPeriod: 3000,
      connectTimeout: 4000,
      keepalive: 60,
      clean: true,
    });

    mqttClientRef.current = client;

    client.on("connect", () => {
      console.log("MQTT Connected ✅");
      setMqttConnected(true);

      client.subscribe(engineTopic);
      client.subscribe(oilLevelTopic);
      client.subscribe(prePitchTopic);
    });

    client.on("message", (topic, message) => {
      const payload = message.toString();

      /* ===== VIN ===== */
      if (topic === engineTopic) {
        const vin = payload.trim();

        if (!vin) return;
        if (lastVinRef.current === vin) return;

        if (lastVinRef.current !== vin) {
          resetCycleState(); // 🔥 clear everything

          lastVinRef.current = vin;
          setVinInput(vin);
          fetchModelData(vin, stageNumber);
        }
      }

      if (topic === oilLevelTopic) {
        if (!vinLoaded || passLocked) return;

        const value = Number(payload);

        if (!isNaN(value)) {
          setLiveOil(value);

          const min = Number(minOil);
          const max = Number(maxOil);

          if (value >= min && value <= max) {
            setOilResult("OK");
          } else {
            setOilResult("NOK");
          }
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
  }, [stageNumber, passLocked, vinLoaded]);
  // }, [stageNumber]);

  /* ================= TIGHTENING LISTENER ================= */

  /* ================= PASS / FAIL LOGIC ================= */

  useEffect(() => {
    if (!vinLoaded) return;
    if (!oilResult) return;

    let final = null;

    if (oilResult === "OK") {
      final = "OK";
    } else if (oilResult === "NOK" && prePitch === 1) {
      final = "NOK";
    }

    if (!final) return;

    if (final !== lastSentStatusRef.current) {
      mqttClientRef.current?.publish(resultTopic, final === "OK" ? "1" : "0");

      insertProcessResult(final);
      setFinalStatus(final);

      if (final === "OK") {
        setPassLocked(true);
      }

      lastSentStatusRef.current = final;
    }
  }, [oilResult, prePitch, vinLoaded]);

  /* ================= FETCH MODEL DATA ================= */

  const fetchModelData = async (vin_no, stage_no) => {
    setVinLoaded(false);

    setShowResult(false);
    setShowOilValue(false);

    setResultPublished(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/vin/get-model-by-vin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin_no,
          stage_no,
        }),
      });

      const json = await res.json();

      if (!json || !json.model) {
        setVinError("WRONG VIN NO");
        setVinLoaded(false);
        setOilResult(null);
        setFinalStatus(null);
        return;
      }

      setVinError(null); // Clear error if valid
      setApiData(json);

      /* ✅ ADD THIS LINE */
      setVinLoaded(true);

      const recipeProcess = json.recipeProcess?.[0];
      setOilResult(null);
      setLiveOil(0);

      setModelName(json.model?.model_name ?? "-");
      setModelSku(json.model?.model_code ?? "-");

      setStageName(json.routeStep?.stage_name ?? "-");

      setMinOil(recipeProcess?.lsl ?? "-");
      setMaxOil(recipeProcess?.usl ?? "-");
    } catch (err) {
      console.error("Model fetch failed", err);
    }
  };

  /* ================= PASS / FAIL + OIL SECTION COMPONENT ================= */

  const OilResultSection = () => {
    return (
      <div style={styles.boltTableContainer}>
        <table style={styles.boltTable}>
          <thead>
            <tr>
              <th style={styles.boltTableTh}>Level's</th>
              <th style={styles.boltTableTh}>Min</th>
              <th style={styles.boltTableTh}>Max</th>
              <th style={styles.boltTableTh}>Oil Level</th>
              <th style={styles.boltTableTh}>Result</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={styles.boltTableTd}>Oil_Level_Value</td>
              <td style={styles.boltTableTd}>{minOil}</td>
              <td style={styles.boltTableTd}>{maxOil}</td>

              <td style={styles.boltTableTd}>{liveOil ?? "-"}</td>

              <td
                style={{
                  ...styles.boltTableTd,
                  color:
                    oilResult === "OK"
                      ? "#00ff00"
                      : oilResult === "NOK"
                        ? "#ff0033"
                        : "#ffffff",
                  fontWeight: "bold",
                }}
              >
                {oilResult ?? "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const formatDate = now.toLocaleDateString("en-GB");
  const formatTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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
          <div style={styles.headerTitle}> OIL FILLING </div>
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

        {finalStatus && (
          <div
            style={{
              fontSize: 50,

              textAlign: "center",
              fontWeight: "900",
              letterSpacing: 3,
              color: finalStatus === "OK" ? "#00ff00" : "#ff0033",
              textShadow:
                finalStatus === "OK" ? "0 0 20px #00ff00" : "0 0 20px #ff0033",
            }}
          >
            FINAL STATUS: {finalStatus === "OK" ? "PASS" : "FAIL"}
          </div>
        )}

        <div style={styles.lineStatusRight}>
          <span
            style={{
              ...styles.lineActive,
              opacity: operationMode === "AUTO" ? 1 : 0.3,
            }}
          >
            AUTO
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

        {/* OIL LIMIT */}
        <div style={styles.oilLimits}>
          <div style={styles.oilBox}>
            <div style={styles.oilValue}>{minOil}</div>
            <div style={styles.oilLabel}>
              MINIMUM
              <br />
              OIL
            </div>
          </div>
          <div style={styles.oilDivider} />
          <div style={styles.oilBox}>
            <div style={styles.oilValue}>{maxOil}</div>
            <div style={styles.oilLabel}>
              MAXIMUM
              <br />
              OIL
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
              setShowOilValue(false);
            }}
            onKeyDown={handleVinKeyDown}
          />

          <div style={styles.skuBlock}>
            <div style={styles.skuRow}>
              <div style={styles.skuText}>
                SKU - <span style={styles.yellow}>{modelSku}</span>
              </div>
            </div>
          </div>

          {vinError ? (
            <div
              style={{
                textAlign: "center",
                marginTop: 80,
                fontSize: 32,
                color: "#ff0033",
                fontWeight: "bold",
                textShadow: "0 0 15px #ff0033",
              }}
            >
              ❌ {vinError}
            </div>
          ) : vinLoaded ? (
            <OilResultSection />
          ) : (
            <div
              style={{
                textAlign: "center",
                marginTop: 80,
                fontSize: 28,
                color: "#ffaa00",
                fontWeight: "bold",
              }}
            >
              ⚠ WAITING FOR VIN
            </div>
          )}
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

  oilLimits: {
    width: 180,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  oilBox: { textAlign: "center" },

  oilValue: {
    fontSize: 60,
    color: "#ffd000",
    fontWeight: "bold",
  },

  oilLabel: { fontSize: 16 },

  oilDivider: {
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

  skuText: { color: "#fff", fontWeight: "bold" },
  yellow: { color: "#ffd000", fontWeight: "bold" },

  angleRow: {
    fontSize: 40,
  },

  oilDisplay: {
    height: 150,
    width: 420,
    border: "10px solid #00ff00",
    borderRadius: 20,
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    padding: 10,
  },

  oilText: {
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

  boltTableContainer: {
    marginTop: 20,
    backgroundColor: "#0b0f1a",
    border: "3px solid #00c3ff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 0 20px rgba(0,195,255,0.4)",
  },

  boltTable: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center",
    fontSize: 20,
    color: "#ffffff",
  },

  boltTableTh: {
    border: "1px solid #00c3ff",
    padding: "12px 8px",
    fontWeight: "bold",
    fontSize: 22,
    backgroundColor: "#111827",
    color: "#00c3ff",
  },

  boltTableTd: {
    border: "1px solid #1f2937",
    padding: "10px 8px",
    fontSize: 18,
  },
};

export default OilFilling;
