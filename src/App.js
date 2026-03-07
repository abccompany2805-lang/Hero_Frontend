
import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { Navigate } from "react-router-dom";


import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

// Pages
import PartMaster from "./components/Master/PartMaster";
import StageMaster from "./components/Master/StageMaster";
import ModelMaster from "./components/Master/ModelMaster";

import DCTool from "./components/Master/DcToolMaster";
import LeakTestMaster from "./components/Master/LeakTestMaster";
import Sop from "./components/Master/sop";
// import PartScanningMonitoring from "./components/Admin/PartScanningMonitoring";
import PartScanningMonitoring from "./components/Admin/partscan2";
import PlantMaster from "./components/Master/PlantMaster";
import LineMaster from "./components/Master/LineMaster";
import ProcessMaster from "./components/Master/ProcessMaster";
import RouteStepMaster from "./components/Master/RouteStepMaster";
import DCToolMonitoring from "./components/Admin/DCToolMonitoring";
import Dashboard from "./components/Admin/Dashboard";
import ToolMaster from "./components/Master/toolmaster";
import SpindleMaster from "./components/Master/SpindleMaster";
import ToolProgramMaster from "./components/Master/ToolProgramMaster";
import LimitMaster from "./components/Master/LimitMaster";
import RecipeMaster from "./components/Master/RecipeMaster";
import BarcodeRuleMaster from "./components/Master/BarcodeRulesMaster";
import DeviceMaster from "./components/Master/DeviceMaster";
import StageDeviceMaster from "./components/Master/StageDeviceMaster";
import MqttSignalMaster from "./components/Master/MQTTSignalMaster";
import RouteStepRequirementMaster from "./components/Master/RouteStepRequirementMaster";
import DeviceSignalMaster from "./components/Master/DeviceSignalMaster";
import DocumentMaster from "./components/Master/DocumentMaster";
import DocumentVersionMaster from "./components/Master/DocumentVersionMaster";
import StageDocumentMapMaster from "./components/Master/StageDocumentMap";

import LeakTest from "./components/Admin/LeakText"
import StagePartRequirementMaster from "./components/Master/stage_part_requirement";
import RecipeProcessMaster from "./components/Master/RecipeProcessMaster";
import PLC_TagMaster from "./components/Master/PLC_TagMaster"
import RecipePartScan from "./components/Master/RecipePartScan"
import Login from "./components/Auth/Login";
import RouteMaster from "./components/Master/RouteMaster";
import LogicalNameMaster from "./components/Master/LogicalName";

import RegisterUser from "./components/Auth/RegisterUser";
import StageGuard from "./components/StageGuard";
import SOPViewer from "./components/Master/sop";



function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // 👇 Pages that should be FULL SCREEN (NO Navbar & Footer)
const hideLayout =
  location.pathname.startsWith("/dctool-monitoring/") ||
  location.pathname.startsWith("/part-scanning-monitoring/") ||
  location.pathname.startsWith("/leaktest-monitoring/") ||
  location.pathname.startsWith("/sop/") ||
  location.pathname === "/login" ||
  location.pathname === "/signup";


  return (
    <>
      {/* NAVBAR (conditional) */}
      {!hideLayout && (
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}

      <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)" }}>
        {/* SIDEBAR (optional: keep it hidden on fullscreen pages) */}
        {!hideLayout && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <main
          className="flex-fill"
          style={{ background: "#F5F7FA" }}
        >
          {/* <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<RegisterUser />} />

<Route
  path="/dctool-monitoring/:stageNo"
  element={
    <StageGuard allowedTypes={["TIGHTENING"]}>
      <DCToolMonitoring />
    </StageGuard>
  }
/>

<Route
  path="/part-scanning-monitoring/:stageNo"
  element={
    <StageGuard allowedTypes={["PART_SCAN"]}>
      <PartScanningMonitoring />
    </StageGuard>
  }
/>

<Route
  path="/leaktest-monitoring/:stageNo"
  element={
    <StageGuard allowedTypes={["TESTING"]}>
      <LeakTest />
    </StageGuard>
  }
/>

            <Route path="/stage-master" element={<StageMaster />} />
            <Route path="/model-master" element={<ModelMaster />} />
            <Route path="/recipe-partscan-master" element={<RecipePartScan/>} />
            <Route path="/dc-tool" element={<DCTool />} />
            <Route path="/sop" element={<Sop />} />
            <Route path="/leak-test-master" element={<LeakTestMaster />} />
            <Route path="/line-master" element={<LineMaster />} />
            <Route path="/plant-master" element={<PlantMaster />} />
            <Route path="/process-master" element={<ProcessMaster />} />
            <Route path="/route-step-master" element={<RouteStepMaster />} />
            <Route path="/part-master" element={<PartMaster />} />
            <Route path="/tool-master" element={<ToolMaster />} />
            <Route path="/spindle-master" element={<SpindleMaster />} />
            <Route path="/tool-program-master" element={<ToolProgramMaster />} />
            <Route path="/limit-master" element={<LimitMaster />} />
            <Route path="/recipe-master" element={<RecipeMaster />} />
            <Route path="/barcode-rules-master" element={<BarcodeRuleMaster />} />
            <Route path="/device-master" element={<DeviceMaster />} />
            <Route path="/stage-device-master" element={<StageDeviceMaster />} />
            <Route path="/mqtt-signal-master" element={<MqttSignalMaster />} />
            <Route path="/device-signal-master" element={<DeviceSignalMaster />} />
            <Route path="/route-step-requirement" element={<RouteStepRequirementMaster />} />
            <Route path="/document-master" element={<DocumentMaster />} />
            <Route path="/document-version-master" element={<DocumentVersionMaster />} />
            <Route path="/stage-doc-master" element={<StageDocumentMapMaster />} />
            <Route path ="/stage-part-requirement" element = {<StagePartRequirementMaster />} />
            <Route path = "/recipe-process-master" element = {<RecipeProcessMaster/>}/>
            <Route path = "/plc-tag-master" element = {<PLC_TagMaster/>} />
            <Route path = "/route-master" element = {<RouteMaster />} />
            <Route path = "/logical-name-master" element = {<LogicalNameMaster />} />

          </Routes> */}
          <Routes>

  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<RegisterUser />} />

  <Route
    path="/dctool-monitoring/:stageNo"
    element={
      <StageGuard allowedTypes={["TIGHTENING"]}>
        <DCToolMonitoring />
      </StageGuard>
    }
  />

  <Route
    path="/part-scanning-monitoring/:stageNo"
    element={
      <StageGuard allowedTypes={["PART_SCAN"]}>
        <PartScanningMonitoring />
      </StageGuard>
    }
  />

  <Route
    path="/leaktest-monitoring/:stageNo"
    element={
      <StageGuard allowedTypes={["TESTING"]}>
        <LeakTest />
      </StageGuard>
    }
  />

  {/* Protected Routes */}
<Route
  path="*"
  element={
    isAuthenticated ? (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stage-master" element={<StageMaster />} />
        <Route path="/model-master" element={<ModelMaster />} />
        <Route path="/recipe-partscan-master" element={<RecipePartScan />} />
        <Route path="/dc-tool" element={<DCTool />} />
        <Route path="/sop" element={<Sop />} />
        <Route path="/leak-test-master" element={<LeakTestMaster />} />
        <Route path="/line-master" element={<LineMaster />} />
        <Route path="/plant-master" element={<PlantMaster />} />
        <Route path="/process-master" element={<ProcessMaster />} />
        <Route path="/route-step-master" element={<RouteStepMaster />} />
        <Route path="/part-master" element={<PartMaster />} />
        <Route path="/tool-master" element={<ToolMaster />} />
        <Route path="/spindle-master" element={<SpindleMaster />} />
        <Route path="/tool-program-master" element={<ToolProgramMaster />} />
        <Route path="/limit-master" element={<LimitMaster />} />
        <Route path="/recipe-master" element={<RecipeMaster />} />
        <Route path="/barcode-rules-master" element={<BarcodeRuleMaster />} />
        <Route path="/device-master" element={<DeviceMaster />} />
        <Route path="/stage-device-master" element={<StageDeviceMaster />} />
        <Route path="/mqtt-signal-master" element={<MqttSignalMaster />} />
        <Route path="/device-signal-master" element={<DeviceSignalMaster />} />
        <Route path="/route-step-requirement" element={<RouteStepRequirementMaster />} />
        <Route path="/document-master" element={<DocumentMaster />} />
        <Route path="/document-version-master" element={<DocumentVersionMaster />} />
        <Route path="/stage-doc-master" element={<StageDocumentMapMaster />} />
        <Route path="/stage-part-requirement" element={<StagePartRequirementMaster />} />
        <Route path="/recipe-process-master" element={<RecipeProcessMaster />} />
        <Route path="/plc-tag-master" element={<PLC_TagMaster />} />
        <Route path="/route-master" element={<RouteMaster />} />
        <Route path="/logical-name-master" element={<LogicalNameMaster />} />
        <Route
  path="/sop/:modelId/:stageId"
  element={<SOPViewer />}
/>
      </Routes>
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>

</Routes>
        </main>
      </div>

      {/* FOOTER (conditional) */}
      {!hideLayout && <Footer />}
    </>
  );
}

export default App;
