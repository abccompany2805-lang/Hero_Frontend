
import React from 'react';
import logo from '../Assets/hero-moto.png';

const Navbar = () => {
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
          }

          .logo-placeholder {
            width: 36px;
            height: 36px;
            background: #E5E7EB;
            border-radius: 6px;
          }

          .user-btn {
            background: transparent;
            border: none;
            font-weight: 500;
            color: #1F2937;
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
            margin-right: 6px;
          }
        `}
      </style>

      <nav className="navbar app-navbar">
        <div className="container-fluid">

          {/* Logo Placeholder */}
         <div className="d-flex align-items-center">
  <img
    src={logo}
    alt="Hero Logo"
    style={{
      height: '36px',
      width: 'auto',
      marginRight: '18px'
    }}
  />

</div>
<div
  className="position-absolute start-50 translate-middle-x fw-bold d-flex align-items-center"
  style={{ color: '#1F2937' }}
>
  <span style={{ color: '#E53935', fontSize: '1.9rem', lineHeight: '1' }}>O</span>
  <span style={{ fontSize: '1.5rem', letterSpacing: '0.5px' }}>perate</span>
  <span style={{ color: '#E53935', fontSize: '1.9rem', lineHeight: '1' }}>X</span>
</div>



          {/* User Dropdown */}
          <div className="dropdown ms-auto">
            <button
              className="user-btn dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <span className="user-circle">V</span> Vaishnavi
            </button>

            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <a className="dropdown-item" href="#">Profile</a>
              </li>
              <li>
                <a className="dropdown-item" href="#">Logout</a>
              </li>
            </ul>
          </div>

        </div>
      </nav>
    </>
  );
};

export default Navbar;
