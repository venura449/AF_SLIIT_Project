import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout } from '../../services/authService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-green-400 mb-4"></i>
          <p className="text-green-200/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="20%" x2="30%" y2="80%" stroke="#4ADE80" strokeWidth="1" />
          <line x1="90%" y1="30%" x2="70%" y2="90%" stroke="#22C55E" strokeWidth="1" />
          <line x1="20%" y1="90%" x2="80%" y2="10%" stroke="#16A34A" strokeWidth="1" />
          <circle cx="30%" cy="20%" r="3" fill="#4ADE80" opacity="0.5" />
          <circle cx="70%" cy="80%" r="3" fill="#22C55E" opacity="0.5" />
        </svg>
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/30 flex items-center justify-center text-white">
                <i className="fas fa-hand-holding-heart text-lg"></i>
              </div>
              <h1 className="text-xl font-light text-white tracking-wider">
                Bridge<span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Connect</span>
              </h1>
            </div>

            {/* Profile Section - Top Right */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-2 px-4 transition-all duration-300 group"
              >
                <span className="text-sm text-green-200/80 group-hover:text-white transition-colors hidden sm:block">
                  {user?.username || 'User'}
                </span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-green-500/30">
                  {getInitials(user?.username)}
                </div>
                <i className={`fas fa-chevron-down text-xs text-green-300/50 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0D2B3E]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-fadeIn">
                  <div className="p-4 border-b border-white/15">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/30">
                        {getInitials(user?.username)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user?.username}</p>
                        <p className="text-xs text-green-200/50">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-green-200/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                    >
                      <i className="fas fa-user-circle w-5"></i>
                      <span>My Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-green-200/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
                      <i className="fas fa-cog w-5"></i>
                      <span>Settings</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-green-200/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
                      <i className="fas fa-bell w-5"></i>
                      <span>Notifications</span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-white/15">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                    >
                      <i className="fas fa-sign-out-alt w-5"></i>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-light text-white mb-2">
            Welcome back, <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">{user?.username}</span>
          </h2>
          <p className="text-green-200/60">Here's what's happening in your community today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-hand-holding-heart text-xl text-green-400"></i>
              </div>
              <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">1,247</h3>
            <p className="text-sm text-green-200/50">Total Donations</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-users text-xl text-blue-400"></i>
              </div>
              <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">892</h3>
            <p className="text-sm text-green-200/50">People Helped</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-map-marker-alt text-xl text-purple-400"></i>
              </div>
              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">+3</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">15</h3>
            <p className="text-sm text-green-200/50">Communities</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-star text-xl text-yellow-400"></i>
              </div>
              <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">4.9</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">98%</h3>
            <p className="text-sm text-green-200/50">Success Rate</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-bolt text-yellow-400 mr-2"></i>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-plus text-green-400"></i>
                </div>
                <span className="text-sm text-green-200/80">New Donation</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-search text-blue-400"></i>
                </div>
                <span className="text-sm text-green-200/80">Find Needs</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-history text-purple-400"></i>
                </div>
                <span className="text-sm text-green-200/80">History</span>
              </button>

              <button className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-chart-line text-orange-400"></i>
                </div>
                <span className="text-sm text-green-200/80">Analytics</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-clock text-green-400 mr-2"></i>
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-gift text-green-400 text-xs"></i>
                </div>
                <div>
                  <p className="text-sm text-white">Donation completed</p>
                  <p className="text-xs text-green-200/50">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-user-plus text-blue-400 text-xs"></i>
                </div>
                <div>
                  <p className="text-sm text-white">New match found</p>
                  <p className="text-xs text-green-200/50">5 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-check-circle text-purple-400 text-xs"></i>
                </div>
                <div>
                  <p className="text-sm text-white">Profile verified</p>
                  <p className="text-xs text-green-200/50">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
