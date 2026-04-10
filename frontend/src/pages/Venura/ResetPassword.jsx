import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      toast.success("Password reset successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Failed to reset password. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E] overflow-hidden">
      {/* Abstract Connection Lines SVG */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <line
            x1="10%"
            y1="20%"
            x2="30%"
            y2="80%"
            stroke="#4ADE80"
            strokeWidth="1"
          />
          <line
            x1="90%"
            y1="30%"
            x2="70%"
            y2="90%"
            stroke="#22C55E"
            strokeWidth="1"
          />
          <line
            x1="20%"
            y1="90%"
            x2="80%"
            y2="10%"
            stroke="#16A34A"
            strokeWidth="1"
          />
          <circle cx="30%" cy="20%" r="3" fill="#4ADE80" opacity="0.5" />
          <circle cx="70%" cy="80%" r="3" fill="#22C55E" opacity="0.5" />
        </svg>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-green-400/20 rounded-full top-1/4 left-1/4 animate-pulse"></div>
        <div
          className="absolute w-3 h-3 bg-blue-400/20 rounded-full top-3/4 left-2/3 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute w-1.5 h-1.5 bg-emerald-300/20 rounded-full top-1/2 left-1/2 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md p-6 rounded-3xl relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-green-500/10">
        {/* Decorative Top Accent */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 rounded-full"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2 relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/30 flex items-center justify-center text-white text-xl font-bold">
              <i className="fas fa-shield-halved text-2xl"></i>
            </div>
          </div>

          <h1 className="text-2xl font-light text-white tracking-wider">
            Reset{" "}
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              Password
            </span>
          </h1>

          <p className="text-sm text-green-200/70 font-light mt-2 max-w-xs mx-auto">
            Enter your new password below
          </p>

          <div className="w-16 h-0.5 bg-gradient-to-r from-green-400 to-emerald-300 mx-auto mt-2 rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-medium text-green-200/70 uppercase tracking-wider flex items-center"
            >
              <i className="fas fa-lock mr-2 text-xs"></i> New Password
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/50 group-hover:text-green-300 transition-colors">
                <i className="fas fa-key"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-white/5 border border-white/10 py-2.5 pl-10 pr-12 text-white placeholder-white/30 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-300 rounded-xl outline-none"
                placeholder="··········"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-300/50 hover:text-green-300"
              >
                <i
                  className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-medium text-green-200/70 uppercase tracking-wider flex items-center"
            >
              <i className="fas fa-lock mr-2 text-xs"></i> Confirm Password
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/50 group-hover:text-green-300 transition-colors">
                <i className="fas fa-check-double"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-white/30 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-300 rounded-xl outline-none"
                placeholder="··········"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                <i className="fas fa-exclamation-circle mr-1"></i>Passwords do
                not match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-medium rounded-xl shadow-lg shadow-green-500/30 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 text-base tracking-wide flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fas fa-check-circle"></i>
                <span>Reset Password</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-green-200/50 hover:text-green-300 transition-colors"
          >
            <i className="fas fa-arrow-left mr-1 text-xs"></i>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
