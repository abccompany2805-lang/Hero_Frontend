import { useState } from "react";
import { Eye, EyeOff, User, Lock  } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import Bike from "../../Assets/x440-right-side-view-16.avif";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";

export default function HeroLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

const [formData, setFormData] = useState({
  username: "",
  password: "",
});

const [loading, setLoading] = useState(false);
const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleLogin = async (e) => {
  e.preventDefault();

  if (!formData.username || !formData.password) {
    alert("Please enter username and password");
    return;
  }

  try {
    setLoading(true);

    const res = await axios.post(
      `${API_BASE_URL}/api/usersmaster/login`, // 🔥 Make sure backend route matches
      {
        username: formData.username,
        password: formData.password,
      }
    );

    // ✅ Store token
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    alert("Login successful");

    navigate("/"); // redirect after login

  } catch (error) {
    alert(error.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="vh-100 d-flex position-relative" style={{ overflow: "hidden" }}>

      {/* ================= THETAVEGA LOGO ================= */}
      <img
        src="/Artboard 2.png"
        alt="Thetavega"
        style={{
          position: "absolute",
          top: "20px",
          left: "40px",
          height: "80px",
          zIndex: 20,
        }}
      />

      {/* ================= LEFT 60% ================= */}
      <div
        style={{
          width: "70%",
          background: "linear-gradient(135deg, #666565 0%, #585757 100%)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Soft Red Glow Behind Bike */}
        <div
          style={{
            
            position: "absolute",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(220,0,0,0.35) 0%, rgba(220,0,0,0.15) 40%, transparent 70%)",
            filter: "blur(70px)",
            animation: "pulseGlow 4s ease-in-out infinite",
            transform: "translateX(-60px)", 
          }}
        />

        {/* Bike */}
        <img
          src={Bike}
          alt="Bike"
          style={{
            width: "750px",
            position: "relative",
            zIndex: 2,
            transform: "translateX(-60px)", 
          }}
        />
      </div>

      {/* ================= RIGHT 40% ================= */}
      <div
        style={{
          width: "30%",
          background:
            "linear-gradient(135deg, #850505 0%, #c91a1a 100%)",
          position: "relative",
        }}
      />

      {/* ================= LOGIN CARD ================= */}
      {/* ================= LOGIN CARD WRAPPER (SPLIT BORDER) ================= */}
<div
  style={{
    position: "absolute",
    left: "70%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "390px",
    padding: "8px", // border thickness
    borderRadius: "8px",
    background: "linear-gradient(to right, #b30000 50%, #2b2a2a 50%)",
    zIndex: 15,
  }}
>
  {/* Inner White Card */}
  <div
    style={{
      background: "#ffffff",
      borderRadius: "16px",
      padding: "20px 40px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    }}
  >
    <div className="text-center mb-4">
      <img
        src="/hero-logo.png"
        alt="Hero"
        style={{ height: "95px" }}
      />
    </div>

    {/* Username */}
<div className="floating-group">
<input
  type="text"
  name="username"
  className="floating-input"
  placeholder="Username"
  value={formData.username}
  onChange={handleChange}
/>
  <label className="floating-label">
    <User size={14} style={{ marginRight: "6px" }} />
    Username
  </label>
</div>

    {/* Password */}
<div className="floating-group position-relative">
<input
  type={showPassword ? "text" : "password"}
  name="password"
  className="floating-input"
  placeholder="Password"
  value={formData.password}
  onChange={handleChange}
/>
  <label className="floating-label">
    <Lock size={14} style={{ marginRight: "6px" }} />
    Password
  </label>

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      right: "0px",
      top: "5px",
      background: "transparent",
      border: "none",
      color: "#777",
    }}
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>

{/* Remember Me + Forgot Password */}
<div className="d-flex justify-content-between align-items-center mb-4">
  <div className="form-check">
    <input
      className="form-check-input"
      type="checkbox"
      id="rememberMe"
      style={{ cursor: "pointer" }}
    />
    <label
      className="form-check-label"
      htmlFor="rememberMe"
      style={{ fontSize: "14px", color: "#555", cursor: "pointer" }}
    >
      Remember Me
    </label>
  </div>

 <Link
    to="/forgot-password"
    style={{
      fontSize: "14px",
      color: "#dc0000",
      textDecoration: "none",
      fontWeight: "500",
    }}
  >
    Forgot Password?
  </Link>
</div>

{/* Login Button */}
<button
  type="button"
  onClick={handleLogin}
  disabled={loading}
  className="btn w-100"
  style={{
    backgroundColor: "#dc0000",
    color: "white",
    borderRadius: "10px",
    padding: "12px",
    fontWeight: "600",
  }}
>
  {loading ? "Logging in..." : "Login"}
</button>

{/* Signup Sentence */}
<div className="text-center mt-2">
  <span style={{ fontSize: "16px", color: "#666" }}>
    Don’t have an account?{" "}
  </span>
<Link
  to="/signup"
  style={{
    fontSize: "14px",
    color: "#dc0000",
    fontWeight: "600",
    textDecoration: "none",
  }}
>
  Sign Up
</Link>
</div>
  </div>
</div>

      {/* ================= ANIMATION ================= */}
    <style>
{`
  @keyframes pulseGlow {
    0% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.1); opacity: 0.6; }
    100% { transform: scale(1); opacity: 0.4; }
  }

  .floating-group {
    position: relative;
    margin-bottom: 30px;
  }

  .floating-input {
    width: 100%;
    border: none;
    border-bottom: 2px solid #ccc;
    outline: none;
    padding: 8px 0;
    font-size: 16px;
    background: transparent;
    transition: border-color 0.3s ease;
  }

  .floating-input:focus {
    border-bottom: 2px solid #dc0000;
  }

  .floating-label {
    position: absolute;
    left: 0;
    top: 8px;
    color: #888;
    font-size: 18px;
    pointer-events: none;
    transition: 0.3s ease all;
  }

  .floating-input:focus + .floating-label,
  .floating-input:not(:placeholder-shown) + .floating-label {
    top: -12px;
    font-size: 14px;
    color: #dc0000;
  }

  .floating-input::placeholder {
    color: transparent;
  }

`}
</style>

    </div>
  );
}