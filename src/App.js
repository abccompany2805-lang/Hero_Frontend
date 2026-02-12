// // import './App.css';
// // import Navbar from './components/Navbar';
// // import Sidebar from './components/Sidebar';
// // import { Routes, Route } from "react-router-dom";

// // // Pages
// // import PartMaster from './components/Master/PartMaster';
// // import StageMaster from './components/Master/StageMaster';
// // import ModelMaster from './components/Master/ModelMaster';
// // import PartScanningMaster from './components/Master/PartScanningMaster';
// // import DCTool from './components/Master/DcToolMaster';
// // import LeakTestMaster from './components/Master/LeakTestMaster';

// // import Sop from './components/Master/sop';
// // // import Sop from './pages/Sop';

// // function App() {
// //   return (
// //     <>
// //       <Navbar />

// //       <div className="d-flex">
// //         <Sidebar />

// //         <main className="flex-fill p-4" style={{ background: '#F5F7FA' }}>
// //           <Routes>
// //             <Route path="/" element={<PartMaster />} />
// //             <Route path="/stage-master" element={<StageMaster />} />
// //             <Route path="/model-master" element={<ModelMaster />} />
// //             <Route path="/part-scanning-master" element={<PartScanningMaster />} />
// //             <Route path="/dc-tool" element={<DCTool />} />
// //             <Route path="/sop" element={<Sop />} />
// //             <Route path="/leak-test-master" element={<LeakTestMaster />} />
// //           </Routes>
// //         </main>
// //       </div>
// //     </>
// //   );
// // }

// // export default App;


// import "./App.css";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Sidebar from "./components/Sidebar";
// import Footer from "./components/Footer";

// // Pages (ADMIN MASTER)
// import PartMaster from "./components/Master/PartMaster";
// import StageMaster from "./components/Master/StageMaster";
// import ModelMaster from "./components/Master/ModelMaster";
// import PartScanningMaster from "./components/Master/PartScanningMaster";
// import DCTool from "./components/Master/DcToolMaster";
// import LeakTestMaster from "./components/Master/LeakTestMaster";
// import Sop from "./components/Master/sop";


// import PartScanningMonitoring from "./components/Admin/PartScanningMonitoring";

// // Auth
// import Login from "./components/Auth/Login"; // adjust path if needed
// import RegisterUser from "./components/Auth/RegisterUser";

// // ================= PROTECTED ROUTE =================
// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("token");
//   const role = localStorage.getItem("role");

//   // ❌ Not logged in
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   // ❌ Logged in but not ADMIN
//   if (role !== "ADMIN") {
//     return <Navigate to="/login" replace />;
//   }

//   // ✅ ADMIN allowed
//   return children;
// };

// function App() {
 
//   return (
//     <>
//       {/* Show Navbar only after login */}
//       {/* {isLoggedIn && <Navbar />} */}

//       <Routes>
//         {/* ================= LOGIN ================= */}
//         <Route path="/login" element={<Login />} />
//          <Route path="/register-user" element={<RegisterUser />} />

//         {/* ================= ADMIN MASTER LAYOUT ================= */}
//         <Route
//           path="/*"
//           element={
//             <ProtectedRoute> 
//               <Navbar />
//               <div className="d-flex">
//                 <Sidebar />
               

//                 <main className="flex-fill p-" style={{ background: "#F5F7FA" }}>
//                   <Routes>
//                     <Route path="/" element={<PartMaster />} />



//                     <Route path="/part-scanning-monitoring" element={<PartScanningMonitoring />} />
//                     <Route path="/stage-master" element={<StageMaster />} />
//                     <Route path="/model-master" element={<ModelMaster />} />
//                     <Route path="/part-scanning-master" element={<PartScanningMaster />} />
//                     <Route path="/dc-tool" element={<DCTool />} />
//                     <Route path="/sop" element={<Sop />} />
//                     <Route path="/leak-test-master" element={<LeakTestMaster />} />
                    
//                   </Routes>
//                 </main>
               
//               </div>
//                <Footer />
//             </ProtectedRoute>
//           }
//         />
        
//       </Routes>
//     </>
//   );
// }

// export default App;


// import "./App.css";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useState } from "react";

// import Navbar from "./components/Navbar";
// import Sidebar from "./components/Sidebar";
// import Footer from "./components/Footer";

// // Pages
// import PartMaster from "./components/Master/PartMaster";
// import StageMaster from "./components/Master/StageMaster";
// import ModelMaster from "./components/Master/ModelMaster";
// import PartScanningMaster from "./components/Master/PartScanningMaster";
// import DCTool from "./components/Master/DcToolMaster";
// import LeakTestMaster from "./components/Master/LeakTestMaster";
// import Sop from "./components/Master/sop";
// import PartScanningMonitoring from "./components/Admin/PartScanningMonitoring";

// // Auth
// import Login from "./components/Auth/Login";
// import RegisterUser from "./components/Auth/RegisterUser";

// import PlantMaster from "./components/Master/PlantMaster";
// import LineMaster from "./components/Master/LineMaster";

// // ================= PROTECTED ROUTE =================
// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("token");
//   const role = localStorage.getItem("role");

//   if (!token || role !== "ADMIN") {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// function App() {
//   // 🔑 Sidebar control (DEFAULT: CLOSED)
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   return (
//     <>
//       <Routes>
//         {/* ================= AUTH ================= */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register-user" element={<RegisterUser />} />

//         {/* ================= ADMIN LAYOUT ================= */}
//         <Route
//           path="/*"
//           element={
//             <ProtectedRoute>
//               {/* NAVBAR (contains hamburger) */}
//               <Navbar
//                 isSidebarOpen={isSidebarOpen}
//                 setIsSidebarOpen={setIsSidebarOpen}
//               />

//               <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)" }}>
//                 {/* SIDEBAR – RENDER ONLY WHEN OPEN */}
// <Sidebar
//   isOpen={isSidebarOpen}
//   onClose={() => setIsSidebarOpen(false)}
// />


//                 {/* MAIN CONTENT – ALWAYS FULL WIDTH */}
//                 <main
//                   className="flex-fill"
//                   style={{
//                     background: "#F5F7FA",
//                     padding: 20,
//                   }}
//                 >
//                   <Routes>
//                     <Route path="/" element={<PartMaster />} />
//                     <Route
//                       path="/part-scanning-monitoring"
//                       element={<PartScanningMonitoring />}
//                     />
//                     <Route path="/stage-master" element={<StageMaster />} />
//                     <Route path="/model-master" element={<ModelMaster />} />
//                     <Route
//                       path="/part-scanning-master"
//                       element={<PartScanningMaster />}
//                     />
//                     <Route path="/dc-tool" element={<DCTool />} />
//                     <Route path="/sop" element={<Sop />} />
//                     <Route
//                       path="/leak-test-master"
//                       element={<LeakTestMaster />}
//                     />
//                       <Route
//                       path="/line-master"
//                       element={<LineMaster />}
//                     />
//                       <Route
//                       path="/plant-master"
//                       element={<PlantMaster />}
//                     />
//                   </Routes>
//                 </main>
//               </div>

//               <Footer />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </>
//   );
// }

// export default App;



// import "./App.css";
// import { Routes, Route } from "react-router-dom";
// import { useState } from "react";

// import Navbar from "./components/Navbar";
// import Sidebar from "./components/Sidebar";
// import Footer from "./components/Footer";

// // Pages
// import PartMaster from "./components/Master/PartMaster";
// import StageMaster from "./components/Master/StageMaster";
// import ModelMaster from "./components/Master/ModelMaster";
// import PartScanningMaster from "./components/Master/PartScanningMaster";
// import DCTool from "./components/Master/DcToolMaster";
// import LeakTestMaster from "./components/Master/LeakTestMaster";
// import Sop from "./components/Master/sop";
// import PartScanningMonitoring from "./components/Admin/PartScanningMonitoring";
// import PlantMaster from "./components/Master/PlantMaster";
// import LineMaster from "./components/Master/LineMaster";
// import ProcessMaster from "./components/Master/ProcessMaster";
// import RouteStepMaster from "./components/Master/RouteStepMaster";
// import DCToolMonitoring from "./components/Admin/DCToolMonitoring";
// import Dashboard from "./components/Admin/Dashboard";
// import ToolMaster from "./components/Master/toolmaster";
// import SpindleMaster from "./components/Master/SpindleMaster";
// import ToolProgramMaster from "./components/Master/ToolProgramMaster";
// import LimitMaster from "./components/Master/LimitMaster";
// import RecipeMaster from "./components/Master/RecipeMaster";
// import BarcodeRuleMaster from "./components/Master/BarcodeRulesMaster";
// import DeviceMaster from "./components/Master/DeviceMaster";
// import StageDeviceMaster from "./components/Master/StageDeviceMaster";
// import MqttSignalMaster from "./components/Master/MQTTSignalMaster";
// import RouteStepRequirementMaster from "./components/Master/RouteStepRequirementMaster";


// import DeviceSignalMaster from "./components/Master/DeviceSignalMaster";
// import DocumentMaster from "./components/Master/DocumentMaster";
// import DocumentVersionMaster from "./components/Master/DocumentVersionMaster";
// import StageDocumentMapMaster from "./components/Master/StageDocumentMap";




// function App() {
//   // 🔑 Sidebar control (DEFAULT: CLOSED)
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   return (
//     <>
//       {/* NAVBAR */}
//       <Navbar
//         isSidebarOpen={isSidebarOpen}
//         setIsSidebarOpen={setIsSidebarOpen}
//       />

//       <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)" }}>
//         {/* SIDEBAR */}
//         <Sidebar
//           isOpen={isSidebarOpen}
//           onClose={() => setIsSidebarOpen(false)}
//         />

//         {/* MAIN CONTENT */}
//         <main
//           className="flex-fill"
//           style={{
//             background: "#F5F7FA",
            
//           }}
//         >
//           <Routes>
//             {/* DEFAULT DASHBOARD */}
//             <Route path="/" element={<Dashboard />} />

//             {/* ADMIN / MASTER ROUTES */}
//             <Route
//               path="/part-scanning-monitoring"
//               element={<PartScanningMonitoring />}
//             />
//             <Route path="/stage-master" element={<StageMaster />} />
//             <Route path="/model-master" element={<ModelMaster />} />
//             <Route
//               path="/part-scanning-master"
//               element={<PartScanningMaster />}
//             />
//             <Route path="/dc-tool" element={<DCTool />} />
//             <Route path="/sop" element={<Sop />} />
//             <Route path="/leak-test-master" element={<LeakTestMaster />} />
//             <Route path="/line-master" element={<LineMaster />} />
//             <Route path="/plant-master" element={<PlantMaster />} />
//             <Route path="/process-master" element={<ProcessMaster />} />
//             <Route path="/route-step-master" element={<RouteStepMaster />} />
//             <Route path="/dctool-monitoring" element={<DCToolMonitoring />} />
//             <Route path="/part-master" element={<PartMaster />} />
//             <Route path= "/tool-master" element ={<ToolMaster/>} />
//             <Route path="/spindle-master" element = {<SpindleMaster />} />
//             <Route path = "/tool-program-master" element = { <ToolProgramMaster/>} />
//             <Route path ="/limit-master" element = {<LimitMaster/>} />
//             <Route path = "/recipe-master" element = {<RecipeMaster/>} />
//             <Route path ="barcode-rules-master" element={<BarcodeRuleMaster/>}/>
//             <Route path = "/device-master" element = {<DeviceMaster />} />
//             <Route path ="/stage-device-master" element = {<StageDeviceMaster />} />
//             <Route path ="/mqtt-signal-master" element = {<MqttSignalMaster />} />
//             <Route path ="/device-signal-master" element = {<DeviceSignalMaster />} />
//             <Route path ="/route-step-requirement" element ={<RouteStepRequirementMaster />} />
//             <Route path ="/document-master" element = {<DocumentMaster />}/>
//             <Route path ="document-version-master" element = {<DocumentVersionMaster />} />
//             <Route path ="/stage-doc-map" element = {<StageDocumentMapMaster /> } />
//           </Routes>
//         </main>
//       </div>

//       <Footer />
//     </>
//   );
// }

// export default App;





import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

// Pages
import PartMaster from "./components/Master/PartMaster";
import StageMaster from "./components/Master/StageMaster";
import ModelMaster from "./components/Master/ModelMaster";
import PartScanningMaster from "./components/Master/PartScanningMaster";
import DCTool from "./components/Master/DcToolMaster";
import LeakTestMaster from "./components/Master/LeakTestMaster";
import Sop from "./components/Master/sop";
import PartScanningMonitoring from "./components/Admin/PartScanningMonitoring";
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

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // 👇 Pages that should be FULL SCREEN (NO Navbar & Footer)
  const hideLayoutRoutes = [
    "/dctool-monitoring",
    "/part-scanning-monitoring",
    "/leaktest-monitoring"
  ];

  const hideLayout = hideLayoutRoutes.includes(location.pathname);

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
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/part-scanning-monitoring" element={<PartScanningMonitoring />} />
            <Route path="/dctool-monitoring" element={<DCToolMonitoring />} />
            <Route path="/leaktest-monitoring" element={<LeakTest />} />

            <Route path="/stage-master" element={<StageMaster />} />
            <Route path="/model-master" element={<ModelMaster />} />
            <Route path="/part-scanning-master" element={<PartScanningMaster />} />
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
            <Route path="/stage-doc-map" element={<StageDocumentMapMaster />} />
            <Route path ="/stage-part-requirement" element = {<StagePartRequirementMaster />} />
          </Routes>
        </main>
      </div>

      {/* FOOTER (conditional) */}
      {!hideLayout && <Footer />}
    </>
  );
}

export default App;
