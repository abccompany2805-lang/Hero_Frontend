import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <style>
        {`
          .sidebar-wrapper {
            position: fixed;
            top: 56px; /* navbar height */
            left: 0;
            height: calc(100vh - 56px);
            width: 300px; /* ✅ increased width */
            background: #0F172A;
            padding: 1.5rem 1rem 1.5rem 1rem; /* ✅ top padding increased */
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
            z-index: 1040;
            overflow-y: auto; /* ✅ scroller */
          }

          .sidebar-wrapper.open {
            transform: translateX(0);
          }

          /* Scrollbar styling (optional but clean) */
          .sidebar-wrapper::-webkit-scrollbar {
            width: 6px;
          }

          .sidebar-wrapper::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.25);
            border-radius: 4px;
          }

          .sidebar-wrapper::-webkit-scrollbar-track {
            background: transparent;
          }

          .sidebar {
            padding-bottom: 2rem; /* space at bottom */
          }

          .sidebar .nav-item {
            margin-bottom: 8px; /* ✅ increased gap between items */
          }

          .sidebar .nav-link {
            color: #fefeff;
            padding: 0.85rem 1.2rem; /* slightly bigger touch area */
            border-radius: 8px;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 16px; /* ✅ icon-text gap increased */
            text-decoration: none;
            border-left: 4px solid transparent;
            transition: background 0.2s ease, border-color 0.2s ease;
          }

          .sidebar .nav-link:hover {
            background: rgba(255,255,255,0.08);
            border-left-color: #d60804;
          }

          .sidebar .nav-link.active {
            background: rgba(255,255,255,0.12);
            border-left-color: #d60804;
            font-weight: 500;
          }

          .sidebar-title {
            color: #fff;
            font-size: 0.75rem;
            margin: 1.8rem 0 0.8rem;
            padding: 0.5rem 1.2rem;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 0.6px;
          }

          /* Overlay */
          .sidebar-overlay {
            position: fixed;
            top: 56px;
            left: 0;
            width: 100vw;
            height: calc(100vh - 56px);
            background: rgba(0,0,0,0.4);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 1030;
          }

          .sidebar-overlay.show {
            opacity: 1;
            pointer-events: all;
          }
        `}
      </style>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`sidebar-wrapper ${isOpen ? "open" : ""}`}>
        <div className="sidebar">
          <ul className="nav flex-column">
            <li className="nav-item">
              <NavLink to="/" className="nav-link" onClick={onClose}>
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/part-scanning-monitoring"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-layers"></i>
                <span>Part Scanning</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/dctool-monitoring"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-layers"></i>
                <span>DC Tool </span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/leaktest-monitoring"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-layers"></i>
                <span>Leak Test</span>
              </NavLink>
            </li>

            <div className="sidebar-title">Masters</div>

            <li className="nav-item">
              <NavLink
                to="/model-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-box"></i>
                <span>Model Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/part-master" className="nav-link" onClick={onClose}>
                <i className="bi bi-box-seam"></i>
                <span>Part Master</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/stage-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span>Stage Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/line-master" className="nav-link" onClick={onClose}>
                <i className="bi bi-diagram-3"></i>
                <span>Line Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/process-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span>Process Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/route-step-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span>Route Step Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/tool-master" className="nav-link" onClick={onClose}>
                <i className="bi bi-diagram-3"></i>
                <span>Tool Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/tool-program-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span>Tool Program Master</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/spindle-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span>Spindle Master</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/limit-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span>Limit Master</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/recipe-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span>Recipe Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/barcode-rules-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span>Barcode Rules Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/device-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span> Device Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/stage-device-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span> Stage Device Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/mqtt-signal-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span> MQTT Signal Master</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/device-signal-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span> Device Signal Master</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/route-step-requirement"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span> Route Step Requirement Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/document-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span> Document Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/document-version-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span> Document Version Master</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/stage-doc-map"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-diagram-3"></i>
                <span> Stage Document Map Master</span>
              </NavLink>
            </li>
             <li className="nav-item">
              <NavLink to="/stage-part-requirement" className="nav-link" onClick={onClose}>
                <i className="bi bi-file-earmark-text"></i>
                <span>Stage Part Requirement Master</span>
              </NavLink>
            </li>


            
            <div className="sidebar-title">Configuration</div>

            <li className="nav-item">
              <NavLink
                to="/part-scanning-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-layers"></i>
                <span>Part Scanning Master</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/plant-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-layers"></i>
                <span>Plant Master</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/dc-tool" className="nav-link" onClick={onClose}>
                <i className="bi bi-tools"></i>
                <span>DC Tool</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/leak-test-master"
                className="nav-link"
                onClick={onClose}
              >
                <i className="bi bi-droplet"></i>
                <span>Leak Test</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/sop" className="nav-link" onClick={onClose}>
                <i className="bi bi-file-earmark-text"></i>
                <span>SOP</span>
              </NavLink>
            </li>
              
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
