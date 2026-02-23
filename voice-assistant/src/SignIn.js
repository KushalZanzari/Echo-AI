import { useState, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff, Sun, Moon, AudioLines } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./SignIn.css";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const navigate = useNavigate();

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        alert("Signed in successfully!");
        navigate("/");
      } else {
        alert(data.error || "Invalid email or password!");
      }
    } catch (error) {
      console.error("Signin error:", error);
      alert("Error connecting to the server. Please try again later.");
    }
  };

  return (
    <div className="signin-container">
      {/* Floating Theme Toggle */}
      <button
        className="auth-theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle Theme"
        title="Toggle Theme"
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="signin-box">
        <div className="signin-header">
          <Link to="/" className="signin-back-link">
            <ArrowLeft className="signin-back-icon" />
            Back to HomePage
          </Link>

          <div className="signin-title-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="Echo AI Logo" style={{ height: '80px', width: 'auto' }} />
            <h1 className="signin-title" style={{ marginTop: 0 }}>Sign In</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="signin-form">
          <div>
            <label htmlFor="email" className="signin-label">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="signin-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="signin-password-wrapper">
            <label htmlFor="password" className="signin-label">Password</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="signin-input"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="signin-button">
            Sign In
          </button>
        </form>

        <p className="signin-footer">
          Don't have an account?{" "}
          <Link to="/signup" className="signin-signup-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
