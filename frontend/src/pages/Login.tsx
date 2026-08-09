import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed");
      }

      const { token, user } = result.data;

      // Store the actual JWT token + user
      login(user, token);

      navigate("/dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-brand">
          <div className="brand-icon">+</div>
          <h1>Healthcare Automation</h1>
          <p>Secure Healthcare Management Platform</p>
        </div>

        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="login-subtitle">
            Sign in to access your healthcare dashboard
          </p>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>
          <div className="register-footer">
            <span>Don't have an account?</span>

            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/register")}
            >
              Create account
            </button>
          </div>

          <div className="login-footer">
            <span>Secure access to your healthcare services</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;