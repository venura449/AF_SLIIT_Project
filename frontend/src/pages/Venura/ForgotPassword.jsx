import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authService";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to send reset link. Try again.",
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
              <i className="fas fa-key text-2xl"></i>
            </div>
          </div>

          <h1 className="text-2xl font-light text-white tracking-wider">
            Forgot{" "}
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              Password
            </span>
          </h1>

          <p className="text-sm text-green-200/70 font-light mt-2 max-w-xs mx-auto">
            Enter your email and we'll send you a link to reset your password
          </p>

          <div className="w-16 h-0.5 bg-gradient-to-r from-green-400 to-emerald-300 mx-auto mt-2 rounded-full"></div>
        </div>

        {sent ? (
          /* Success State */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <i className="fas fa-envelope-circle-check text-green-400 text-2xl"></i>
            </div>
            <p className="text-green-200/80 text-sm">
              We've sent a password reset link to{" "}
              <span className="text-green-300 font-medium">{email}</span>
            </p>
            <p className="text-green-200/50 text-xs">
              Check your inbox and follow the link to reset your password. The
              link expires in 15 minutes.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-green-400 hover:text-green-300 text-sm transition-colors border-b border-green-400/30 hover:border-green-300"
            >
              <i className="fas fa-redo mr-1 text-xs"></i>Send again
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-xs font-medium text-green-200/70 uppercase tracking-wider flex items-center"
              >
                <i className="fas fa-envelope mr-2 text-xs"></i> Email Address
              </label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/50 group-hover:text-green-300 transition-colors">
                  <i className="fas fa-at"></i>
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-white/30 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-300 rounded-xl outline-none"
                  placeholder="Someone@example.com"
                />
              </div>
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
                  <i className="fas fa-paper-plane"></i>
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        )}

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

export default ForgotPassword;
