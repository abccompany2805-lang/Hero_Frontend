import React from "react";

const Footer = () => {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        textAlign: "center",
        padding: "5px 0",
        fontSize: "14px",
        fontWeight: 600,
        color: "#0a0b0c",
        background: "#f87306",
        borderTop: "1px solid #f87306",
        zIndex: 1000, // stay above all UI
      }}
    >
      © 2026 Thetavega Tech Pvt. Ltd.
    </footer>
  );
};

export default Footer;
