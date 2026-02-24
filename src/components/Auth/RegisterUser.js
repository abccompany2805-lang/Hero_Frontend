import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import Bike from "../../Assets/x440-right-side-view-16.avif";
import API_BASE_URL from "../../config";
import { Link } from "react-router-dom";

export default function HeroSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    mobile_no: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_BASE_URL}/api/usersmaster`, {
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        mobile_no: formData.mobile_no,
        password: formData.password,
         role: "Admin",
      });

      alert("Admin created successfully");
      setFormData({
        full_name: "",
        username: "",
        email: "",
        mobile_no: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex position-relative" style={{ overflow: "hidden" }}>

      {/* LOGO */}
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

      {/* LEFT 70% */}
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

      {/* RIGHT 30% */}
      <div
        style={{
          width: "30%",
          background: "linear-gradient(135deg, #850505 0%, #c91a1a 100%)",
        }}
      />

      {/* CARD */}
     {/* ================= SIGNUP CARD ================= */}
<div
  style={{
    position: "absolute",
    left: "70%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "390px",
    padding: "8px",
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
      padding: "25px 40px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    }}
  >
    <div className="text-center mb-4">
      <img
        src="/hero-logo.png"
        alt="Hero"
        style={{ height: "90px" }}
      />
    </div>

    <form onSubmit={handleSubmit}>

      {/* Full Name */}
      <div className="floating-group">
        <input
          type="text"
          name="full_name"
          className="floating-input"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
        <label className="floating-label">
          <User size={14} style={{ marginRight: "6px" }} />
          Full Name
        </label>
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
          required
        />
        <label className="floating-label">
          <User size={14} style={{ marginRight: "6px" }} />
          Username
        </label>
      </div>

      {/* Email */}
      <div className="floating-group">
        <input
          type="email"
          name="email"
          className="floating-input"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <label className="floating-label">
          <Mail size={14} style={{ marginRight: "6px" }} />
          Email
        </label>
      </div>

      {/* Mobile */}
      <div className="floating-group">
        <input
          type="text"
          name="mobile_no"
          className="floating-input"
          placeholder="Mobile"
          value={formData.mobile_no}
          onChange={handleChange}
        />
        <label className="floating-label">
          <Phone size={14} style={{ marginRight: "6px" }} />
          Mobile
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
          required
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

      {/* Confirm Password */}
      <div className="floating-group position-relative">
        <input
          type={showConfirm ? "text" : "password"}
          name="confirmPassword"
          className="floating-input"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <label className="floating-label">
          <Lock size={14} style={{ marginRight: "6px" }} />
          Confirm Password
        </label>

        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          style={{
            position: "absolute",
            right: "0px",
            top: "5px",
            background: "transparent",
            border: "none",
            color: "#777",
          }}
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Register Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn w-100"
        style={{
          backgroundColor: "#dc0000",
          color: "white",
          borderRadius: "10px",
          padding: "12px",
          fontWeight: "600",
          transition: "0.3s",
        }}
      >
        {loading ? "Creating..." : "Register Admin"}
      </button>

      {/* Already Have Account */}
      <div className="text-center mt-3">
        <span style={{ fontSize: "14px", color: "#666" }}>
          Already have an account?{" "}
        </span>
        <Link
          to="/login"
          style={{
            fontSize: "14px",
            color: "#dc0000",
            fontWeight: "600",
            textDecoration: "none",
          }}
        >
          Login
        </Link>
      </div>

    </form>
  </div>
</div>

    <style>
{`
  .floating-group {
    position: relative;
    margin-bottom: 28px;
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
    font-size: 13px;
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