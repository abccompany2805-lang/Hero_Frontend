import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import API_BASE_URL from "../../config";
import { Link } from "react-router-dom";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    mobile_no: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN", // default role
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/users`, {
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name,
        email: formData.email,
        mobile_no: formData.mobile_no,
        role: formData.role,
      });

      setSuccess("User registered successfully");
      setFormData({
        username: "",
        full_name: "",
        email: "",
        mobile_no: "",
        password: "",
        confirmPassword: "",
        role: "ADMIN",
      });

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef2f7, #e3e9f1)",
        padding: "15px",
      }}
    >
      <style>
        {`
          .auth-card {
            animation: slideUpFade 0.6s ease-out forwards;
          }
          @keyframes slideUpFade {
            from { transform: translateY(40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>

      <Card className="auth-card shadow-lg border-0" style={{ width: "100%", maxWidth: "450px", borderRadius: "16px" }}>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">
              <span className="text-danger">O</span>perate
              <span className="text-danger">X</span>
            </h2>

          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-2">
              <Form.Label>Username</Form.Label>
              <Form.Control
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Mobile No</Form.Label>
              <Form.Control
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button type="submit" className="w-100 fw-semibold" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </Form>

<div className="text-center mt-4">
  Don’t have an account?{" "}
  <Link
    to="/login"
    className="text-primary text-decoration-none fw-semibold"
  >
    Login here
  </Link>
</div>

        </Card.Body>
      </Card>
    </div>
  );
};

export default RegisterUser;
