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
import logo from "../Assets/hero-moto.png";

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [open, setOpen] = useState(false);

  // 🔹 Get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "User";
  const firstLetter = username.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      <style>
        {`
          body {
            font-family: 'Montserrat', sans-serif;
          }

          .app-navbar {
            background: #FFFFFF;
            border-bottom: 1px solid #E5E7EB;
            padding: 0.75rem 1.5rem;
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
        `}
      </style>

      <nav className="navbar app-navbar">
        <div className="container-fluid position-relative d-flex align-items-center">

          {/* LEFT – HAMBURGER + LOGO */}
          <div className="d-flex align-items-center">
            <button
              className="hamburger-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Toggle Menu"
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
            <button
              className="user-btn"
              onClick={() => setOpen(!open)}
            >
              <span className="user-circle">{firstLetter}</span>
              {username}
            </button>

            {open && (
              <div className="dropdown-menu-custom">
                <button disabled>
                  Role: {user?.role}
                </button>
                <button onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </nav>
    </>
  );
};

export default Navbar;
