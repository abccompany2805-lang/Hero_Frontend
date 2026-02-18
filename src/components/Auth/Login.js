



// import React, { useState } from "react";
// import { Card, Form, Button, Alert } from "react-bootstrap";
// import { loginUser } from "../../Apis";   // ✅ USE API FILE
// import { Link } from "react-router-dom";


// const Login = () => {
//   const [loginId, setLoginId] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

// const handleLogin = async (e) => {
//   e.preventDefault();
//   setError("");
//   setLoading(true);

//   try {
// const res = await loginUser({
//   username: loginId,
//   password,
// });


// const { token, user } = res.data;


//     if (user.role !== "ADMIN") {
//       setError("Access denied. Admin login only.");
//       return;
//     }

//     localStorage.setItem("token", token);
//     localStorage.setItem("role", user.role);

//     localStorage.setItem("user", JSON.stringify(user));

//     window.location.href = "/";

//   } catch (err) {
//     setError(err.response?.data?.message || "Invalid email or password");
//   } finally {
//     setLoading(false);
//   }
// };

//   // UI remains SAME (no change)
//   return (
//     <div
//       className="d-flex justify-content-center align-items-center"
//       style={{
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #eef2f7, #e3e9f1)",
//         padding: "15px",
//       }}
//     >
//       <style>
//         {`
//           .auth-card {
//             animation: slideUpFade 0.6s ease-out forwards;
//           }
//           @keyframes slideUpFade {
//             from { transform: translateY(40px); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//         `}
//       </style>

//       <Card className="auth-card shadow-lg border-0" style={{ width: "100%", maxWidth: "420px", borderRadius: "16px" }}>
//         <Card.Body className="p-4">
//           {/* HEADER */}
//           <div className="text-center mb-4">
//             <h2 className="fw-bold mb-1">
//               <span className="text-danger">O</span>perate
//               <span className="text-danger">X</span>
//             </h2>

//           </div>

//           {/* ERROR */}
//           {error && <Alert variant="danger">{error}</Alert>}

//           {/* FORM */}
//           <Form onSubmit={handleLogin}>
//             <Form.Group className="mb-3">
//               <Form.Label>Username</Form.Label>
//               <Form.Control
//                 placeholder="Username  or Token No"
//                 value={loginId}
//                 onChange={(e) => setLoginId(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mb-4">
//               <Form.Label>Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 placeholder="Enter password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             <Button variant="primary" className="w-100 fw-semibold" type="submit" disabled={loading}>
//               {loading ? "Logging in..." : "Login"}
//             </Button>
//           </Form>

// <div className="text-center mt-4">
//   Don’t have an account?{" "}
//   <Link
//     to="/register-user"
//     className="text-primary text-decoration-none fw-semibold"
//   >
//     Register here
//   </Link>
// </div>

//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default Login;


import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

import Bike1 from "../../Assets/0011-removebg-preview.png";
import Bike2 from "../../Assets/hqdefault-removebg-preview.png";
import Bike3 from "../../Assets/szczecinpolandmay-2025harleydavidson-softail-springer-classic-260nw-2633606431-removebg-preview.png";
import Background from "../../Assets/WhatsApp Image 2026-02-12 at 1.56.34 PM.jpeg";

const bikes = [Bike1, Bike2, Bike3];

export default function HeroLoginPage() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("visible");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase("zoomIn");

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % bikes.length);
        setPhase("zoomOut");

        setTimeout(() => {
          setPhase("visible");
        }, 800);
      }, 800);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const animationVariants = {
    visible: { scale: 1, opacity: 1 },
    zoomIn: { scale: 1.8, opacity: 0 },
    zoomOut: { scale: 0.6, opacity: 1 },
  };

  return (
    <div
      className="container-fluid vh-100 position-relative"
      style={{
        overflow: "hidden",
        backgroundImage: `url("../../Assets/WhatsApp Image 2026-02-12 at 1.56.34 PM.jpeg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
        }}
      />

      <div className="row h-100 position-relative">

        {/* ================= LEFT BIKE AREA ================= */}
        <div className="col-lg-7 d-flex align-items-center justify-content-center position-relative">

          {/* Red Glow */}
          <div
            style={{
              position: "absolute",
              width: "500px",
              height: "500px",
              background: "radial-gradient(circle, rgba(220,0,0,0.5) 0%, transparent 70%)",
              filter: "blur(80px)",
              animation: "pulseGlow 3s infinite",
            }}
          />

          <AnimatePresence mode="wait">
            <motion.img
              key={index}
              src={bikes[index]}
              initial="zoomOut"
              animate={phase}
              variants={animationVariants}
              transition={{ duration: 0.8 }}
              style={{
                width: "600px",
                maxWidth: "90%",
                zIndex: 2,
              }}
            />
          </AnimatePresence>
        </div>

        {/* ================= RIGHT LOGIN CARD ================= */}
        <div className="col-lg-5 d-flex align-items-center justify-content-center">
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="card shadow-lg border-0"
            style={{
              width: "100%",
              maxWidth: "420px",
              borderRadius: "25px",
              padding: "40px",
              background: "white",
              zIndex: 2,
              display: "flex",
            }}
          >
            {/* LOGOS */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <img
                src="/hero-logo.png"
                alt="Hero Logo"
                style={{ height: "90px" }}
              />
              <img
                src="/Artboard 4@600x.png"
                alt="Company Logo"
                style={{ height: "65px" }}
              />
            </div>
            <div className="w-100 d-flex justify-content-center">  
              <h4 className="fw-bold mb-4" style={{justifySelf: "center"}}>
              Welcome to <span style={{color:"#f82828"}}>O</span>perate<span style={{color:"#f82828"}}>X</span>
            </h4> 
            </div>
            

            {/* USERNAME */}
            <div className="mb-3">
              <label className="form-label text-muted">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                style={{
                  borderRadius: "12px",
                  padding: "12px",
                }}
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-4 position-relative">
              <label className="form-label text-muted">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter password"
                style={{
                  borderRadius: "12px",
                  padding: "12px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "42px",
                  background: "transparent",
                  border: "none",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="btn w-100"
              style={{
                backgroundColor: "#dc0000",
                color: "white",
                borderRadius: "12px",
                padding: "12px",
                fontWeight: "600",
              }}
            >
              Login
            </motion.button>

            <div className="d-flex justify-content-between mt-3 small text-muted">
              <div>
                <input type="checkbox" className="me-1" />
                Remember me
              </div>
              <div style={{ cursor: "pointer", color: "#dc0000" }}>
                Forgot Password?
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Glow Animation Keyframe */}
      <style>
        {`
          @keyframes pulseGlow {
            0% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0.6; }
          }
        `}
      </style>
    </div>
  );
}
