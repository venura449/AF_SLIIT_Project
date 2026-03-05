import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout } from '../../services/authService';

const NeedRequest = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'food',
    urgency: 'medium',
    location: '',
    targetAmount: '',
  });
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

  const handleCreateRequest = (e) => {
    e.preventDefault();
    const request = {
      id: needRequests.length + 1,
      ...newRequest,
      status: 'active',
      currentAmount: 0,
      createdAt: 'just now',
      donor: user?.username || 'Anonymous',
      image: '❤️'
    };
    setNeedRequests([request, ...needRequests]);
    setNewRequest({
      title: '',
      description: '',
      category: 'food',
      urgency: 'medium',
      location: '',
      targetAmount: '',
    });
    setShowCreateModal(false);
  };

  const filteredRequests = needRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getProgressPercentage = (current, target) => {
    return Math.round((current / target) * 100);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'from-red-500/20 to-red-600/20 border-red-500/30';
      case 'high':
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/30';
      case 'medium':
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      default:
        return 'from-green-500/20 to-green-600/20 border-green-500/30';
    }
  };

  const getUrgencyBadgeColor = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-green-500/20 text-green-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-green-400 mb-4"></i>
          <p className="text-green-200/70">Loading needs...</p>
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
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-green-200/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                    >
                      <i className="fas fa-chart-line w-5"></i>
                      <span>Dashboard</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-green-200/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
                      <i className="fas fa-cog w-5"></i>
                      <span>Settings</span>
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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-light text-white mb-2">
                Need<span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300"> Requests</span>
              </h2>
              <p className="text-green-200/60">Browse and support community needs</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 flex items-center space-x-2"
            >
              <i className="fas fa-plus"></i>
              <span>Create Request</span>
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-green-200/40 focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
              />
              <i className="fas fa-search absolute right-3 top-3.5 text-green-200/40"></i>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
            >
              <option value="all">All Categories</option>
              <option value="food">Food</option>
              <option value="medical">Medical</option>
              <option value="education">Education</option>
              <option value="shelter">Shelter</option>
              <option value="healthcare">Healthcare</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-hand-holding-heart text-xl text-green-400"></i>
              </div>
              <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">{filteredRequests.length}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{filteredRequests.length}</h3>
            <p className="text-sm text-green-200/50">Active Requests</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-users text-xl text-blue-400"></i>
              </div>
              <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">+5</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">847</h3>
            <p className="text-sm text-green-200/50">People Helped</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-money-bill-wave text-xl text-purple-400"></i>
              </div>
              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">LKR</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">2.3M</h3>
            <p className="text-sm text-green-200/50">Funds Raised</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-check-circle text-xl text-yellow-400"></i>
              </div>
              <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">85%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">127</h3>
            <p className="text-sm text-green-200/50">Completed</p>
          </div>
        </div>

        {/* Needs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`bg-gradient-to-br ${getUrgencyColor(request.urgency)} backdrop-blur-xl border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
            >
              {/* Card Header with Image/Emoji */}
              <div className="relative h-32 bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <span className="text-6xl">{request.image}</span>
                {request.status === 'completed' && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <i className="fas fa-check"></i>
                    <span>Completed</span>
                  </div>
                )}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyBadgeColor(request.urgency)}`}>
                  {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{request.title}</h3>
                <p className="text-sm text-green-200/70 mb-4 line-clamp-2">{request.description}</p>

                {/* Category and Location */}
                <div className="flex items-center justify-between mb-4 text-xs text-green-200/50">
                  <span className="flex items-center space-x-1">
                    <i className="fas fa-tag"></i>
                    <span className="capitalize">{request.category}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{request.location}</span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-green-200/70">Progress</span>
                    <span className="text-xs font-semibold text-green-400">
                      {getProgressPercentage(request.currentAmount, request.targetAmount)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${getProgressPercentage(request.currentAmount, request.targetAmount)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amount Info */}
                <div className="mb-4 p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-200/50 mb-1">Raised</p>
                      <p className="text-sm font-bold text-white">LKR {request.currentAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-200/50 mb-1">Target</p>
                      <p className="text-sm font-bold text-white">LKR {request.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-xs text-green-200/50">
                    <p className="mb-1">{request.donor}</p>
                    <p>{request.createdAt}</p>
                  </div>
                  <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors">
                    <i className="fas fa-hand-holding-usd mr-1"></i>
                    Donate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-4xl text-green-400/40 mb-4"></i>
            <p className="text-green-200/60">No needs requests found matching your filters</p>
          </div>
        )}
      </main>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#0D2B3E] border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0D2B3E] border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Create Need Request</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-green-200/50 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Request Title</label>
                <input
                  type="text"
                  required
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-green-200/40 focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
                  placeholder="e.g., Food Assistance for Family"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  required
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-green-200/40 focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300 resize-none h-24"
                  placeholder="Describe the need in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Category</label>
                  <select
                    value={newRequest.category}
                    onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
                  >
                    <option value="food">Food</option>
                    <option value="medical">Medical</option>
                    <option value="education">Education</option>
                    <option value="shelter">Shelter</option>
                    <option value="healthcare">Healthcare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Urgency</label>
                  <select
                    value={newRequest.urgency}
                    onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Location</label>
                <input
                  type="text"
                  required
                  value={newRequest.location}
                  onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-green-200/40 focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
                  placeholder="e.g., Colombo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Target Amount (LKR)</label>
                <input
                  type="number"
                  required
                  value={newRequest.targetAmount}
                  onChange={(e) => setNewRequest({ ...newRequest, targetAmount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-green-200/40 focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeedRequest;
