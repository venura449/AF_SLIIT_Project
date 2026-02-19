import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../../services/authService';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;
  
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    phone: '',
    address: '',
    bio: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
        setFormData({
          username: profile.username || '',
          fullName: profile.profile?.fullName || '',
          phone: profile.profile?.phone || '',
          address: profile.profile?.address || '',
          bio: profile.profile?.bio || '',
        });
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await updateProfile({
        username: formData.username,
        profile: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
        },
      });
      setUser(updatedUser);
      setSuccess('Profile updated successfully!');
      setCurrentPage(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
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
          <p className="text-green-200/70">Loading profile...</p>
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
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/30 flex items-center justify-center text-white">
                <i className="fas fa-hand-holding-heart text-lg"></i>
              </div>
              <h1 className="text-xl font-light text-white tracking-wider">
                Bridge<span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Connect</span>
              </h1>
            </Link>

            {/* Back to Dashboard */}
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-green-200/70 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
              <span className="text-sm">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-light text-white mb-2">
            My <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Profile</span>
          </h2>
          <p className="text-green-200/60">Manage your account information and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center h-full">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-green-500/30">
                {getInitials(formData.fullName || user?.username)}
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{formData.fullName || user?.username}</h3>
              <p className="text-sm text-green-200/50 mb-4">{user?.email}</p>
              
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'Donor' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : user?.role === 'Admin'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  <i className={`fas ${user?.role === 'Donor' ? 'fa-hand-holding-heart' : user?.role === 'Admin' ? 'fa-shield-alt' : 'fa-user'} mr-1`}></i>
                  {user?.role}
                </span>
                {user?.isVerified && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <i className="fas fa-check-circle mr-1"></i>
                    Verified
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-green-200/40 mb-4">
                  Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                
                {/* Inspirational Quote */}
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <i className="fas fa-quote-left text-green-400/30 text-lg mb-2"></i>
                  <p className="text-sm text-green-200/60 italic leading-relaxed">
                    "The best way to find yourself is to lose yourself in the service of others."
                  </p>
                  <p className="text-xs text-green-400/50 mt-2 text-right">— Mahatma Gandhi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full">
              {/* Page Indicator */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <i className="fas fa-edit text-green-400 mr-2"></i>
                  Edit Profile
                </h3>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                          : 'bg-white/10 text-green-200/50 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Labels */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-4 text-xs">
                  <span className={`flex items-center ${currentPage === 1 ? 'text-green-400' : 'text-green-200/40'}`}>
                    <i className="fas fa-user mr-1"></i> Account
                  </span>
                  <i className="fas fa-chevron-right text-green-200/20"></i>
                  <span className={`flex items-center ${currentPage === 2 ? 'text-green-400' : 'text-green-200/40'}`}>
                    <i className="fas fa-id-card mr-1"></i> Personal
                  </span>
                  <i className="fas fa-chevron-right text-green-200/20"></i>
                  <span className={`flex items-center ${currentPage === 3 ? 'text-green-400' : 'text-green-200/40'}`}>
                    <i className="fas fa-info-circle mr-1"></i> About
                  </span>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm text-center">
                  <i className="fas fa-check-circle mr-2"></i>{success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>{error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Page 1: Account Info */}
                {currentPage === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-user text-green-400 text-xl"></i>
                      </div>
                      <h4 className="text-white font-medium">Account Information</h4>
                      <p className="text-xs text-green-200/50 mt-1">Your basic account details</p>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-green-200/70 uppercase tracking-wider flex items-center">
                        <i className="fas fa-envelope mr-2 text-xs"></i> Email Address
                        <span className="ml-2 text-xs text-green-200/40 normal-case">(Cannot be changed)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/30">
                          <i className="fas fa-lock"></i>
                        </span>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-green-200/50 rounded-xl outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-1">
                      <label htmlFor="username" className="text-xs font-medium text-green-200/70 uppercase tracking-wider flex items-center">
                        <i className="fas fa-at mr-2 text-xs"></i> Username
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/50 group-hover:text-green-300 transition-colors">
                          <i className="fas fa-user"></i>
                        </span>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          minLength={3}
                          className="w-full bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-white/30 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-300 rounded-xl outline-none"
                          placeholder="Your username"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 2: Personal Info */}
                {currentPage === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-id-card text-blue-400 text-xl"></i>
                      </div>
                      <h4 className="text-white font-medium">Personal Information</h4>
                      <p className="text-xs text-green-200/50 mt-1">Your contact and location details</p>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1">
                      <label htmlFor="fullName" className="text-xs font-medium text-green-200/70 uppercase tracking-wider flex items-center">
                        <i className="fas fa-id-card mr-2 text-xs"></i> Full Name
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/50 group-hover:text-green-300 transition-colors">
                          <i className="fas fa-user-circle"></i>
                        </span>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-white/30 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-300 rounded-xl outline-none"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label htmlFor="phone" className="text-xs font-medium text-green-200/70 uppercase tracking-wider flex items-center">
                        <i className="fas fa-phone mr-2 text-xs"></i> Phone Number
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/50 group-hover:text-green-300 transition-colors">
                          <i className="fas fa-mobile-alt"></i>
                        </span>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-white/30 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-300 rounded-xl outline-none"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                      <label htmlFor="address" className="text-xs font-medium text-green-200/70 uppercase tracking-wider flex items-center">
                        <i className="fas fa-map-marker-alt mr-2 text-xs"></i> Address
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/50 group-hover:text-green-300 transition-colors">
                          <i className="fas fa-home"></i>
                        </span>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-white placeholder-white/30 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-300 rounded-xl outline-none"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Page 3: About */}
                {currentPage === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-info-circle text-purple-400 text-xl"></i>
                      </div>
                      <h4 className="text-white font-medium">About You</h4>
                      <p className="text-xs text-green-200/50 mt-1">Tell others about yourself</p>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1">
                      <label htmlFor="bio" className="text-xs font-medium text-green-200/70 uppercase tracking-wider flex items-center">
                        <i className="fas fa-pen mr-2 text-xs"></i> Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={5}
                        className="w-full bg-white/5 border border-white/10 py-2.5 px-4 text-white placeholder-white/30 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-300 rounded-xl outline-none resize-none"
                        placeholder="Tell us a little about yourself, your interests, and why you joined BridgeConnect..."
                      />
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-xs text-green-200/50">
                        <i className="fas fa-lightbulb text-yellow-400 mr-2"></i>
                        Tip: A detailed bio helps build trust and connection with the community.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2.5 text-sm rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                      currentPage === 1
                        ? 'text-green-200/30 cursor-not-allowed'
                        : 'text-green-200/70 hover:text-white border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <i className="fas fa-arrow-left"></i>
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <Link
                      to="/dashboard"
                      className="px-4 py-2.5 text-sm text-green-200/70 hover:text-white transition-colors"
                    >
                      Cancel
                    </Link>

                    {currentPage < totalPages ? (
                      <button
                        type="button"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-medium rounded-xl shadow-lg shadow-green-500/30 hover:shadow-emerald-500/40 transition-all duration-300 text-sm flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-medium rounded-xl shadow-lg shadow-green-500/30 hover:shadow-emerald-500/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save"></i>
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
