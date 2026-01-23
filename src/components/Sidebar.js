import React, { useState } from 'react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <style>
        {`
          .sidebar {
            min-height: 100vh;
            background: #0F172A;
            padding: 1rem;
            transition: width 0.3s ease;
          }

          .sidebar.expanded {
            width: 260px;
          }

          .sidebar.collapsed {
            width: 80px;
          }

          .sidebar .nav-link {
            color: #fefeff;
            padding: 0.75rem 1rem;
            border-radius: 6px;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 14px;
            white-space: nowrap;
            text-decoration: none;
            border-left: 3px solid transparent; /* reserve space */
            transition: 
              background 0.2s ease, 
              color 0.2s ease, 
              border-color 0.2s ease;
          }

          /* ICON COLOR */
          .sidebar .nav-link i {
            font-size: 1.1rem;
            color: #cbd5e1;
          }

          .sidebar .nav-link span {
            transition: opacity 0.2s ease;
          }

          .sidebar.collapsed .nav-link span {
            opacity: 0;
            width: 0;
            overflow: hidden;
          }

          /* HOVER */
          .sidebar .nav-link:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #fefeff;
            text-decoration: underline;
            text-underline-offset: 4px;
            border-left-color: #d60804; /* red border */
          }

          .sidebar .nav-link:hover i {
            color: #f8fafc;
          }

          /* ACTIVE */
        .sidebar .nav-link.active {
  background: rgba(255, 255, 255, 0.12);
  color: #fefeff;
  font-weight: 500;
  border-left: 3px solid #d60804;
  text-decoration: underline;
  text-underline-offset: 4px;
}


          /* SECTION TITLES */
          .sidebar-title {
            color: #fefeff;
            font-size: 0.8rem;
            margin: 1.5rem 0 0.5rem 0;
            padding: 0.5rem 1rem;
            width: 100%;
            text-transform: uppercase;
            opacity: 0.75;
            transition: opacity 0.2s ease;
          }

          .sidebar.collapsed .sidebar-title {
            opacity: 0;
          }

          /* HAMBURGER */
          .hamburger-wrapper {
            padding: 0;
            margin-bottom: 0.75rem;
          }

          .hamburger {
            width: 40px;
            height: 40px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: #cbd5e1;
            cursor: pointer;
            border-radius: 8px;
            transition: background 0.2s ease, color 0.2s ease;
          }

          .hamburger:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #f8fafc;
          }

          @media (max-width: 768px) {
            .sidebar {
              display: none;
            }
          }
        `}
      </style>

      <aside className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
        <ul className="nav flex-column">

          {/* Hamburger */}
          <li
            className={`nav-item hamburger-wrapper d-flex ${
              collapsed ? 'justify-content-start' : 'justify-content-end'
            }`}
          >
            <div
              className="hamburger"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <i className="bi bi-list"></i>
            </div>
          </li>

          {/* Dashboard */}
          <li className="nav-item">
            <a className="nav-link active" href="#">
              <i className="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </a>
          </li>

          <div className="sidebar-title">Masters</div>

          <li className="nav-item">
            <a className="nav-link" href="#">
              <i className="bi bi-box"></i>
              <span>Line Master</span>
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="#">
              <i className="bi bi-diagram-3"></i>
              <span>Model Master</span>
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="#">
              <i className="bi bi-layers"></i>
              <span>Stage Master</span>
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="#">
              <i className="bi bi-archive"></i>
              <span>Part Master</span>
            </a>
          </li>

          <div className="sidebar-title">Configuration</div>

          <li className="nav-item">
            <a className="nav-link" href="#">
              <i className="bi bi-upc-scan"></i>
              <span>Part Scanning</span>
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="#">
              <i className="bi bi-tools"></i>
              <span>DC Tool</span>
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="#">
              <i className="bi bi-droplet"></i>
              <span>Leak Test</span>
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="#">
              <i className="bi bi-journal-text"></i>
              <span>SOP</span>
            </a>
          </li>

          <div className="sidebar-title">Admin</div>

          <li className="nav-item">
            <a className="nav-link" href="#">
              <i className="bi bi-people"></i>
              <span>Users</span>
            </a>
          </li>

        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
