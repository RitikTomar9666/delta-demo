import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ FIX: "Cntent-Type" typo tha
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        // ✅ Name save karo — sidebar mein dynamically dikhega
        localStorage.setItem("userName", data.user?.name || "User");
        navigate("/"); // ✅ FIX: window.location.href ki jagah
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authLogo">
          <div className="logoCircle">
            <i className="fa-solid fa-brain"></i>
          </div>
        </div>

        <h1 className="authTitle">Welcome back</h1>
        <p className="authSubtitle">Sign in to continue to Teach AI</p>

        {error && <div className="authError">{error}</div>}

        <div className="authFields">
          <div className="inputGroup">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
          </div>
          <div className="inputGroup">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
          </div>
        </div>

        <button className="authBtn" onClick={login} disabled={loading}>
          {loading ? <span className="authSpinner"></span> : "Sign in"}
        </button>

        <p className="authSwitch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
