// import React, { useState } from "react";
// import { Card, Form, Button, Alert } from "react-bootstrap";
// import axios from "axios";
// import API_BASE_URL from "../config";

// const Login = () => {
//   const [loginId, setLoginId] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const res = await axios.post(`${API_BASE_URL}/api/users/login`, {
//         username: loginId,   // email or token
//         password,
//       });

//       const { token, role, user } = res.data;

//       // ✅ Allow only ADMIN for now
//       if (role !== "ADMIN") {
//         setError("Access denied. Admin login only.");
//         setLoading(false);
//         return;
//       }

//       // ✅ Store login info
//       localStorage.setItem("token", token);
//       localStorage.setItem("role", role);
//       localStorage.setItem("user", JSON.stringify(user));

//       // 🚀 Redirect (we will control routes in App.js)
//       window.location.href = "/dashboard";

//     } catch (err) {
//       setError(err.response?.data?.message || "Invalid credentials");
//     } finally {
//       setLoading(false);
//     }
//   };

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
//             <div className="text-muted" style={{ letterSpacing: "2px" }}>
//               ADMIN LOGIN
//             </div>
//           </div>

//           {/* ERROR */}
//           {error && <Alert variant="danger">{error}</Alert>}

//           {/* FORM */}
//           <Form onSubmit={handleLogin}>
//             <Form.Group className="mb-3">
//               <Form.Label>Login ID</Form.Label>
//               <Form.Control
//                 placeholder="Email or Token No"
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

//           <div className="text-center mt-4">
//             Don’t have an account?{" "}
//             <a href="/register" className="text-primary text-decoration-none fw-semibold">
//               Register here
//             </a>
//           </div>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default Login;





import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { loginUser } from "../../Apis";   // ✅ USE API FILE
import { Link } from "react-router-dom";


const Login = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
const res = await loginUser({
  username: loginId,
  password,
});


const { token, user } = res.data;


    if (user.role !== "ADMIN") {
      setError("Access denied. Admin login only.");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);

    localStorage.setItem("user", JSON.stringify(user));

    window.location.href = "/";

  } catch (err) {
    setError(err.response?.data?.message || "Invalid email or password");
  } finally {
    setLoading(false);
  }
};

  // UI remains SAME (no change)
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

      <Card className="auth-card shadow-lg border-0" style={{ width: "100%", maxWidth: "420px", borderRadius: "16px" }}>
        <Card.Body className="p-4">
          {/* HEADER */}
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">
              <span className="text-danger">O</span>perate
              <span className="text-danger">X</span>
            </h2>

          </div>

          {/* ERROR */}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* FORM */}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                placeholder="Username  or Token No"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" className="w-100 fw-semibold" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Form>

<div className="text-center mt-4">
  Don’t have an account?{" "}
  <Link
    to="/register-user"
    className="text-primary text-decoration-none fw-semibold"
  >
    Register here
  </Link>
</div>

        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
