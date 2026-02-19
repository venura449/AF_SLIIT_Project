import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [role, setRole] = useState('Donor');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate username from email
  const generateUsername = (email) => {
    return email.split('@')[0];
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service');
      setLoading(false);
      return;
    }

    const username = generateUsername(formData.email);

    try {
      const result = await signup(username, formData.email, formData.password, role);
      localStorage.setItem('token', result.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E] animate-gradient overflow-auto">
      {/* Abstract Connection Lines SVG */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="20%" x2="30%" y2="80%" stroke="#4ADE80" strokeWidth="1" className="connecting-line" />
          <line x1="90%" y1="30%" x2="70%" y2="90%" stroke="#22C55E" strokeWidth="1" className="connecting-line" />
          <line x1="20%" y1="90%" x2="80%" y2="10%" stroke="#16A34A" strokeWidth="1" className="connecting-line" />
          <circle cx="30%" cy="20%" r="3" fill="#4ADE80" opacity="0.5" />
          <circle cx="70%" cy="80%" r="3" fill="#22C55E" opacity="0.5" />
        </svg>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-green-400/20 rounded-full top-1/4 left-1/4 animate-pulse"></div>
        <div className="absolute w-3 h-3 bg-blue-400/20 rounded-full top-3/4 left-2/3 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-1.5 h-1.5 bg-emerald-300/20 rounded-full top-1/2 left-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md p-6 rounded-3xl relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-green-500/10 transform transition-all duration-500 hover:shadow-green-500/20">
        {/* Decorative Top Accent */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 rounded-full"></div>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-2 relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/30 flex items-center justify-center text-white font-bold transform rotate-3 hover:rotate-0 transition-transform duration-300 animate-float">
              <i className="fas fa-user-plus text-xl"></i>
            </div>
            <div className="absolute -right-2 top-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <div className="absolute -left-2 top-1/2 w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>

          <h1 className="text-2xl font-light text-white tracking-wider">
            Join <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">BridgeConnect</span>
          </h1>

          <div className="w-16 h-0.5 bg-gradient-to-r from-green-400 to-emerald-300 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex bg-white/5 rounded-lg p-1 mb-4 border border-white/10">
          <button
            type="button"
            onClick={() => setRole('Donor')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
              role === 'Donor' ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'text-green-300/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <i className="fas fa-hand-holding-heart mr-2"></i>Donor
          </button>
          <button
            type="button"
            onClick={() => setRole('Recipient')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
              role === 'Recipient' ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'text-green-300/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <i className="fas fa-users mr-2"></i>Recipient
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
            <i className="fas fa-exclamation-circle mr-2"></i>{error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email Field */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-green-200/70 uppercase tracking-wider flex items-center">
              <i className="fas fa-envelope mr-2 text-xs"></i> Email Address
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/50 group-hover:text-green-300 transition-colors">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-white/30 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-300 rounded-xl outline-none"
                placeholder="johndoe@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-medium text-green-200/70 uppercase tracking-wider flex items-center">
              <i className="fas fa-lock mr-2 text-xs"></i> Password
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/50 group-hover:text-green-300 transition-colors">
                <i className="fas fa-key"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-white/5 border border-white/10 py-2.5 pl-10 pr-12 text-white placeholder-white/30 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-300 rounded-xl outline-none"
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-300/50 hover:text-green-300"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-2 text-sm">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500/20 transition-all duration-300"
            />
            <label htmlFor="agreeTerms" className="text-green-200/70 cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-green-400 hover:text-green-300 border-b border-green-400/30">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-green-400 hover:text-green-300 border-b border-green-400/30">Privacy Policy</a>
            </label>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-medium rounded-xl shadow-lg shadow-green-500/30 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 text-base tracking-wide flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <>
                <span><i className="fas fa-user-plus"></i></span>
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Alternative Register Methods */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-transparent text-green-200/50">Or sign up with</span>
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            <button type="button" className="flex-1 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2">
              <i className="fab fa-google text-lg"></i>
              <span className="text-sm">Google</span>
            </button>
            <button type="button" className="flex-1 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2">
              <i className="fab fa-facebook-f text-lg"></i>
              <span className="text-sm">Facebook</span>
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-green-200/50">
            Already have an account?{' '}
            <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors border-b border-green-400/30 hover:border-green-300">
              Sign in <i className="fas fa-arrow-right text-xs ml-1"></i>
            </Link>
          </p>
        </div>

        {/* Footer with Stats */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-green-400 font-semibold">1,247+</div>
              <div className="text-xs text-green-200/50">Donors</div>
            </div>
            <div>
              <div className="text-green-400 font-semibold">892+</div>
              <div className="text-xs text-green-200/50">Recipients</div>
            </div>
            <div>
              <div className="text-green-400 font-semibold">15</div>
              <div className="text-xs text-green-200/50">Communities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
