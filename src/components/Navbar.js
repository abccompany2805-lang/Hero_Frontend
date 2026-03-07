// import React, { useState } from "react";
// import logo from "../Assets/hero-moto.png";

// const Navbar = () => {
//   const [open, setOpen] = useState(false);

//   // 🔹 Get logged-in user
//   const user = JSON.parse(localStorage.getItem("user"));
//   const username = user?.username || "User";
//   const firstLetter = username.charAt(0).toUpperCase();

//   const handleLogout = () => {
//     localStorage.clear();
//     window.location.href = "/login";
//   };

//   return (
//     <>
//       <style>
//         {`
//           body {
//             font-family: 'Montserrat', sans-serif;
//           }

//           .app-navbar {
//             background: #FFFFFF;
//             border-bottom: 1px solid #E5E7EB;
//             padding: 0.75rem 1.5rem;
//             position: sticky;
//             top: 0;
//             z-index: 1050;
//           }

//           .user-btn {
//             background: transparent;
//             border: none;
//             font-weight: 500;
//             color: #1F2937;
//             display: flex;
//             align-items: center;
//             cursor: pointer;
//           }

//           .user-circle {
//             background: #E53935;
//             color: #fff;
//             width: 32px;
//             height: 32px;
//             border-radius: 50%;
//             display: inline-flex;
//             align-items: center;
//             justify-content: center;
//             margin-right: 8px;
//             font-weight: 600;
//           }

//           .dropdown-menu-custom {
//             position: absolute;
//             right: 0;
//             top: 45px;
//             background: #fff;
//             border: 1px solid #E5E7EB;
//             border-radius: 6px;
//             min-width: 160px;
//             box-shadow: 0 10px 25px rgba(0,0,0,0.08);
//             z-index: 2000;
//           }

//           .dropdown-menu-custom button {
//             width: 100%;
//             padding: 10px 14px;
//             border: none;
//             background: transparent;
//             text-align: left;
//             cursor: pointer;
//             font-size: 14px;
//           }

//           .dropdown-menu-custom button:hover {
//             background: #F3F4F6;
//           }
//         `}
//       </style>

//       <nav className="navbar app-navbar">
//         <div className="container-fluid position-relative">

//           {/* LEFT LOGO */}
//           <div className="d-flex align-items-center">
//             <img
//               src={logo}
//               alt="Hero Logo"
//               style={{ height: "36px", width: "auto", marginRight: "18px" }}
//             />
//           </div>

//           {/* CENTER TITLE */}
//           <div
//             className="position-absolute start-50 translate-middle-x fw-bold d-flex align-items-center"
//             style={{ color: "#1F2937" }}
//           >
//             <span style={{ color: "#E53935", fontSize: "1.9rem" }}>O</span>
//             <span style={{ fontSize: "1.5rem", letterSpacing: "0.5px" }}>
//               perate
//             </span>
//             <span style={{ color: "#E53935", fontSize: "1.9rem" }}>X</span>
//           </div>

//           {/* RIGHT USER DROPDOWN */}
//           <div className="ms-auto position-relative">
//             <button
//               className="user-btn"
//               onClick={() => setOpen(!open)}
//             >
//               <span className="user-circle">{firstLetter}</span>
//               {username}
//             </button>

//             {open && (
//               <div className="dropdown-menu-custom">
//                 <button disabled>
//                   Role: {user?.role}
//                 </button>
//                 <button onClick={handleLogout}>
//                   Logout
//                 </button>
//               </div>
//             )}
//           </div>

//         </div>
//       </nav>
//     </>
//   );
// };

// export default Navbar;

import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import logo from "../Assets/hero-moto.png";
import PartBarcodeRuleMaster from "./Master/BarcodeRulesMaster";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "User";
  const firstLetter = username.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const splitIntoColumns = (items, size = 5) => {
    const cols = [];
    for (let i = 0; i < items.length; i += size) {
      cols.push(items.slice(i, i + size));
    }
    return cols;
  };

  const sections = [
    {
      title: "Pages",
      items: [
        { to: "/", label: "Dashboard" },
        { to: "/part-scanning-monitoring", label: "Part Scanning" },
        { to: "/dctool-monitoring", label: "DC Tool" },
        { to: "/leaktest-monitoring", label: "Leak Test" },
        { to: "/sop", label: "SOP" },
      ],
    },
    {
      title: "Masters",
      items: [
        { to: "/plant-master", label: "Plant Master" },
        { to: "/line-master", label: "Line Master" },
        { to: "/stage-master", label: "Stage Master" },
        { to: "/model-master", label: "Model Master" },
        { to: "/process-master", label: "Operation Master" },
        { to: "/route-master", label: "Route Master" },
        { to: "/route-step-master", label: "Route Step Master" },
        { to: "/part-master", label: "Part Master" },
        { to: "/tool-master", label: "Tool Master" },
        { to: "/tool-program-master", label: "Tool Program Master" },
        { to: "/plc-tag-master", label: "PLC Tag Master" },
        { to: "/stage-doc-master", label: "Stage Document Master" },
        { to: "/barcode-rules-master", label: "Part Barcode Rule Master" },
        {
          to: "/stage-part-requirement",
          label: "Stage Part Requirement Master",
        },
        { to: "/recipe-master", label: "Recipe Master" },
        { to: "/recipe-process-master", label: "Recipe Process Master" },
        { to: "/recipe-partscan-master", label: "Recipe Part Scan Master" },
      ],
    },
    {
      title: "Configuration",
      items: [
        { to: "/sop", label: "SOP" },
        { to: "/mqtt-signal-master", label: "MQTT Signal Master" },
        { to: "/logical-name-master", label: "Logical Name Master" },
      ],
    },
  ];

  return (
    <>
      {/* ======= YOUR ORIGINAL STYLES (UNCHANGED) ======= */}
      <style>
        {`
          body {
            font-family: 'Montserrat', sans-serif;
          }

          .app-navbar {
            background: #FFFFFF;
            border-bottom: 1px solid #E5E7EB;
            
            position: sticky;
            top: 0;
            z-index: 1050;
          }

          .hamburger-btn {
            background: transparent;
            border: none;
            font-size: 22px;
            color: #1F2937;
            cursor: pointer;
            margin-right: 14px;
          }

          .user-btn {
            background: transparent;
            border: none;
            font-weight: 500;
            color: #1F2937;
            display: flex;
            align-items: center;
            cursor: pointer;
          }

          .user-circle {
            background: #E53935;
            color: #fff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
            font-weight: 600;
          }

          .dropdown-menu-custom {
            position: absolute;
            right: 0;
            top: 45px;
            background: #fff;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            min-width: 160px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            z-index: 2000;
          }

          .dropdown-menu-custom button {
            width: 100%;
            padding: 10px 14px;
            border: none;
            background: transparent;
            text-align: left;
            cursor: pointer;
            font-size: 14px;
          }

          .dropdown-menu-custom button:hover {
            background: #F3F4F6;
          }

          /* ======= NEW DRAWER STYLING (Separate, doesn't affect navbar) ======= */

     .top-drawer {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  width: 100%;
  background: #15254b;
padding: 30px 40px;
  box-sizing: border-box;

  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transform: translateY(-8px);
  transition: all 0.35s ease;

  z-index: 1049;

  pointer-events: none;   /* ⭐ VERY IMPORTANT */
}

.drawer-link {
  display: block;
  color: #fff;
  text-decoration: none;
  margin-bottom: 10px;
  font-size: 16px;
  transition: color 0.2s ease;
}



.top-drawer.open {
  max-height: 1900px;
  opacity: 1;
  transform: translateY(0);

  pointer-events: auto;   /* ⭐ allow clicks only when open */
}

          .top-drawer.open {
            max-height: 1900px;
            opacity: 1;
            transform: translateY(0);
          }

.drawer-container {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  gap: 60px;
  width: 100%;
  padding: 0 60px;
}

       .drawer-section {
  text-align: left;
}

          .drawer-heading {
            color: #fff;
            margin-bottom: 30px;
            letter-spacing: 1px;
            font-size: 15px;
            text-transform: uppercase;
            opacity: 0.75;
          }
            
.drawer-columns {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px 40px;
}

          .drawer-link {
            display: block;
            color: #fff;
            text-decoration: none;
            margin-bottom: 14px;
            font-size: 18px;
            transition: color 0.2s ease;
          }

          .drawer-link:hover {
            color: #E53935;
          }
        `}
      </style>

      <nav className="navbar app-navbar">
        <div
          className="container-fluid position-relative d-flex align-items-center"
          onMouseLeave={() => setIsDrawerOpen(false)}
        >
          {/* LEFT – HAMBURGER + LOGO */}
          <div className="d-flex align-items-center">
            <button
              className="hamburger-btn"
              onMouseEnter={() => setIsDrawerOpen(true)}
            >
              <FaBars />
            </button>

            <img
              src={logo}
              alt="Hero Logo"
              style={{ height: "36px", width: "auto", marginRight: "18px" }}
            />
          </div>

          {/* CENTER – TITLE */}
          <div
            className="position-absolute start-50 translate-middle-x fw-bold d-flex align-items-center"
            style={{ color: "#1F2937" }}
          >
            <span style={{ color: "#E53935", fontSize: "1.9rem" }}>O</span>
            <span style={{ fontSize: "1.5rem", letterSpacing: "0.5px" }}>
              perate
            </span>
            <span style={{ color: "#E53935", fontSize: "1.9rem" }}>X</span>
          </div>

          {/* RIGHT – USER */}
          <div className="ms-auto position-relative">
            <button className="user-btn" onClick={() => setOpen(!open)}>
              <span className="user-circle">{firstLetter}</span>
              {username}
            </button>

            {open && (
              <div className="dropdown-menu-custom">
                <button disabled>Role: {user?.role}</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>

          {/* ===== DRAWER ===== */}
          <div className={`top-drawer ${isDrawerOpen ? "open" : ""}`}>
            <div className="drawer-container">
              {sections.map((section) => {
                const cols = splitIntoColumns(section.items);
                return (
                  <div key={section.title} className="drawer-section">
                    <div className="drawer-heading">{section.title}</div>
                    <div className="drawer-columns">
                      {section.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className="drawer-link"
                          onClick={() => setIsDrawerOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
