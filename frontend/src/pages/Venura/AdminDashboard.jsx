import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout, getAllUsers, updateUserStatus, updateUser, deleteUser } from '../../services/authService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const profileMenuRef = useRef(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    role: '',
    isVerified: false,
    isActive: true,
  });

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  // Search, Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter users based on search and filters
  const filteredUsers = users.filter(u => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role filter
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && u.isActive !== false) ||
      (statusFilter === 'inactive' && u.isActive === false);
    
    // Verified filter
    const matchesVerified = verifiedFilter === 'all' ||
      (verifiedFilter === 'verified' && u.isVerified) ||
      (verifiedFilter === 'pending' && !u.isVerified);

    return matchesSearch && matchesRole && matchesStatus && matchesVerified;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter, verifiedFilter, itemsPerPage]);

  // Computed stats from real data
  const stats = {
    totalUsers: users.length,
    totalDonors: users.filter(u => u.role === 'Donor').length,
    totalRecipients: users.filter(u => u.role === 'Recipient').length,
    totalAdmins: users.filter(u => u.role === 'Admin').length,
    activeUsers: users.filter(u => u.isActive !== false).length,
    inactiveUsers: users.filter(u => u.isActive === false).length,
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        // Verify admin role
        if (profile.role !== 'Admin') {
          navigate('/dashboard');
          return;
        }
        setUser(profile);
        // Fetch users after verifying admin
        fetchUsers();
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Fetch all users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Handle toggle user status (active/deactive)
  const handleToggleStatus = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      await updateUserStatus(userId, !currentStatus);
      // Refresh users list
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Open edit modal
  const handleEditClick = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditFormData({
      username: userToEdit.username,
      email: userToEdit.email,
      role: userToEdit.role,
      isVerified: userToEdit.isVerified || false,
      isActive: userToEdit.isActive !== false,
    });
    setShowEditModal(true);
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(editingUser._id);
    try {
      await updateUser(editingUser._id, editFormData);
      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = (userToDelete) => {
    setDeletingUser(userToDelete);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    setActionLoading(deletingUser._id);
    try {
      await deleteUser(deletingUser._id);
      await fetchUsers();
      setShowDeleteModal(false);
      setDeletingUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setActionLoading(null);
    }
  };

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
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-green-400 mb-4"></i>
          <p className="text-green-200/70">Loading admin dashboard...</p>
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
            {/* Logo & Admin Badge */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/30 flex items-center justify-center text-white">
                <i className="fas fa-hand-holding-heart text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-light text-white tracking-wider">
                  Bridge<span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Connect</span>
                </h1>
                <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-full font-medium">
                  <i className="fas fa-shield-alt mr-1"></i>Admin Panel
                </span>
              </div>
            </div>

            {/* Profile Section - Top Right */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-2 px-4 transition-all duration-300 group"
              >
                <span className="text-sm text-green-200/80 group-hover:text-white transition-colors hidden sm:block">
                  {user?.username || 'Admin'}
                </span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-orange-500/30">
                  {getInitials(user?.username)}
                </div>
                <i className={`fas fa-chevron-down text-xs text-green-300/50 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0D2B3E]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-fadeIn">
                  <div className="p-4 border-b border-white/15">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/30">
                        {getInitials(user?.username)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user?.username}</p>
                        <p className="text-xs text-orange-400">Administrator</p>
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
            Admin Dashboard
          </h2>
          <p className="text-green-200/60">Manage users, donations, and monitor platform activity.</p>
        </div>

        {/* Admin Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-users text-lg text-blue-400"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalUsers.toLocaleString()}</h3>
            <p className="text-xs text-green-200/50">Total Users</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-hand-holding-heart text-lg text-green-400"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalDonors.toLocaleString()}</h3>
            <p className="text-xs text-green-200/50">Donors</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-user-friends text-lg text-purple-400"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalRecipients.toLocaleString()}</h3>
            <p className="text-xs text-green-200/50">Recipients</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-user-shield text-lg text-orange-400"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalAdmins.toLocaleString()}</h3>
            <p className="text-xs text-green-200/50">Admins</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-user-check text-lg text-emerald-400"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.activeUsers.toLocaleString()}</h3>
            <p className="text-xs text-green-200/50">Active Users</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-user-times text-lg text-red-400"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.inactiveUsers.toLocaleString()}</h3>
            <p className="text-xs text-green-200/50">Inactive Users</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {['overview', 'users', 'verifications', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-white/5 text-green-200/70 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <i className={`fas fa-${tab === 'overview' ? 'chart-pie' : tab === 'users' ? 'users' : tab === 'verifications' ? 'user-check' : 'file-alt'} mr-2`}></i>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {/* Main Content Area - Full Width */}
          <div className="w-full">
            {activeTab === 'overview' && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fas fa-chart-line text-green-400 mr-2"></i>
                  Platform Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <i className="fas fa-arrow-trend-up text-green-400"></i>
                      </div>
                      <div>
                        <p className="text-white font-medium">User Growth</p>
                        <p className="text-xs text-green-200/50">This month</p>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold">+18%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <i className="fas fa-hand-holding-usd text-blue-400"></i>
                      </div>
                      <div>
                        <p className="text-white font-medium">Donation Volume</p>
                        <p className="text-xs text-green-200/50">This month</p>
                      </div>
                    </div>
                    <span className="text-blue-400 font-bold">+24%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <i className="fas fa-check-double text-purple-400"></i>
                      </div>
                      <div>
                        <p className="text-white font-medium">Success Rate</p>
                        <p className="text-xs text-green-200/50">Donation completion</p>
                      </div>
                    </div>
                    <span className="text-purple-400 font-bold">96.5%</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <i className="fas fa-users text-green-400 mr-2"></i>
                    User Management
                  </h3>
                  <button 
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/10"
                  >
                    <i className="fas fa-refresh mr-2"></i>Refresh
                  </button>
                </div>

                {/* Search Bar and Filters */}
                <div className="mb-6 space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/50">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="Search by username or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-white/30 focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition-all duration-300 outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-300/50 hover:text-white transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>

                  {/* Filters Row */}
                  <div className="flex flex-wrap gap-3">
                    {/* Role Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-green-200/50 whitespace-nowrap">Role:</label>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:border-green-400 focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="bg-[#0D2B3E]">All Roles</option>
                        <option value="Admin" className="bg-[#0D2B3E]">Admin</option>
                        <option value="Donor" className="bg-[#0D2B3E]">Donor</option>
                        <option value="Recipient" className="bg-[#0D2B3E]">Recipient</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-green-200/50 whitespace-nowrap">Status:</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:border-green-400 focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="bg-[#0D2B3E]">All Status</option>
                        <option value="active" className="bg-[#0D2B3E]">Active</option>
                        <option value="inactive" className="bg-[#0D2B3E]">Inactive</option>
                      </select>
                    </div>

                    {/* Verified Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-green-200/50 whitespace-nowrap">Verified:</label>
                      <select
                        value={verifiedFilter}
                        onChange={(e) => setVerifiedFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:border-green-400 focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="bg-[#0D2B3E]">All</option>
                        <option value="verified" className="bg-[#0D2B3E]">Verified</option>
                        <option value="pending" className="bg-[#0D2B3E]">Pending</option>
                      </select>
                    </div>

                    {/* Items Per Page */}
                    <div className="flex items-center space-x-2 ml-auto">
                      <label className="text-xs text-green-200/50 whitespace-nowrap">Show:</label>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:border-green-400 focus:outline-none cursor-pointer"
                      >
                        <option value={5} className="bg-[#0D2B3E]">5</option>
                        <option value={10} className="bg-[#0D2B3E]">10</option>
                        <option value={25} className="bg-[#0D2B3E]">25</option>
                        <option value={50} className="bg-[#0D2B3E]">50</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || verifiedFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setRoleFilter('all');
                          setStatusFilter('all');
                          setVerifiedFilter('all');
                        }}
                        className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                      >
                        <i className="fas fa-times mr-1"></i>Clear Filters
                      </button>
                    )}
                  </div>

                  {/* Results info */}
                  <div className="flex items-center justify-between text-xs text-green-200/50">
                    <span>
                      Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                      {filteredUsers.length !== users.length && ` (filtered from ${users.length} total)`}
                    </span>
                  </div>
                </div>
                
                {usersLoading ? (
                  <div className="text-center py-12">
                    <i className="fas fa-spinner fa-spin text-3xl text-green-400 mb-3"></i>
                    <p className="text-green-200/70">Loading users...</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-green-200/50 text-xs uppercase border-b border-white/10">
                            <th className="pb-3 pr-4">User</th>
                            <th className="pb-3 pr-4">Role</th>
                            <th className="pb-3 pr-4">Status</th>
                            <th className="pb-3 pr-4">Verified</th>
                            <th className="pb-3 pr-4">Joined</th>
                            <th className="pb-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedUsers.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-8 text-center text-green-200/50">
                                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || verifiedFilter !== 'all' 
                                  ? 'No users match your filters' 
                                  : 'No users found'}
                              </td>
                            </tr>
                          ) : (
                            paginatedUsers.map((u) => (
                              <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-3 pr-4">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                      u.role === 'Admin' 
                                        ? 'bg-gradient-to-br from-orange-500 to-amber-400' 
                                        : 'bg-gradient-to-br from-green-500 to-emerald-400'
                                    }`}>
                                      {u.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-white text-sm font-medium">{u.username}</p>
                                      <p className="text-xs text-green-200/50">{u.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 pr-4">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    u.role === 'Admin' ? 'text-orange-400 bg-orange-500/20' :
                                    u.role === 'Donor' ? 'text-green-400 bg-green-500/20' : 
                                    'text-purple-400 bg-purple-500/20'
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="py-3 pr-4">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    u.isActive !== false ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                                  }`}>
                                    {u.isActive !== false ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="py-3 pr-4">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    u.isVerified ? 'text-blue-400 bg-blue-500/20' : 'text-yellow-400 bg-yellow-500/20'
                                  }`}>
                                    {u.isVerified ? 'Verified' : 'Pending'}
                                  </span>
                                </td>
                                <td className="py-3 pr-4 text-sm text-green-200/70">
                                  {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3">
                                  <div className="flex items-center space-x-1">
                                    {/* Toggle Active/Inactive */}
                                    <button 
                                      onClick={() => handleToggleStatus(u._id, u.isActive !== false)}
                                      disabled={actionLoading === u._id}
                                      className={`p-2 rounded-lg transition-colors ${
                                        u.isActive !== false 
                                          ? 'text-yellow-400 hover:bg-yellow-500/20' 
                                          : 'text-green-400 hover:bg-green-500/20'
                                      } disabled:opacity-50`}
                                      title={u.isActive !== false ? 'Deactivate User' : 'Activate User'}
                                    >
                                      {actionLoading === u._id ? (
                                        <i className="fas fa-spinner fa-spin text-xs"></i>
                                      ) : (
                                        <i className={`fas ${u.isActive !== false ? 'fa-user-slash' : 'fa-user-check'} text-xs`}></i>
                                      )}
                                    </button>
                                    {/* Edit */}
                                    <button 
                                      onClick={() => handleEditClick(u)}
                                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                      title="Edit User"
                                    >
                                      <i className="fas fa-edit text-xs"></i>
                                    </button>
                                    {/* Delete */}
                                    <button 
                                      onClick={() => handleDeleteClick(u)}
                                      disabled={u._id === user?._id}
                                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                      title={u._id === user?._id ? "Cannot delete yourself" : "Delete User"}
                                    >
                                      <i className="fas fa-trash text-xs"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-green-200/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <i className="fas fa-chevron-left mr-2"></i>Previous
                        </button>

                        <div className="flex items-center space-x-1">
                          {/* First page */}
                          {currentPage > 3 && (
                            <>
                              <button
                                onClick={() => setCurrentPage(1)}
                                className="w-8 h-8 rounded-lg text-sm text-green-200/70 hover:bg-white/10 hover:text-white transition-all"
                              >
                                1
                              </button>
                              {currentPage > 4 && <span className="text-green-200/30 px-1">...</span>}
                            </>
                          )}

                          {/* Page numbers around current */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                            .map(page => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-sm transition-all ${
                                  currentPage === page
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                                    : 'text-green-200/70 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {page}
                              </button>
                            ))}

                          {/* Last page */}
                          {currentPage < totalPages - 2 && (
                            <>
                              {currentPage < totalPages - 3 && <span className="text-green-200/30 px-1">...</span>}
                              <button
                                onClick={() => setCurrentPage(totalPages)}
                                className="w-8 h-8 rounded-lg text-sm text-green-200/70 hover:bg-white/10 hover:text-white transition-all"
                              >
                                {totalPages}
                              </button>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-green-200/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Next<i className="fas fa-chevron-right ml-2"></i>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'verifications' && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fas fa-user-check text-green-400 mr-2"></i>
                  Pending Verifications
                </h3>
                <div className="space-y-3">
                  {users.filter(u => !u.isVerified && u.role === 'Recipient').length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-check-circle text-4xl text-green-400 mb-3"></i>
                      <p className="text-green-200/70">No pending verifications</p>
                    </div>
                  ) : (
                    users.filter(u => !u.isVerified && u.role === 'Recipient').map((u) => (
                      <div key={u._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-400 flex items-center justify-center text-white font-bold">
                            {u.username?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{u.username}</p>
                            <p className="text-xs text-green-200/50">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={async () => {
                              setActionLoading(u._id);
                              try {
                                await updateUser(u._id, { isVerified: true });
                                await fetchUsers();
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setActionLoading(null);
                              }
                            }}
                            disabled={actionLoading === u._id}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                          >
                            {actionLoading === u._id ? (
                              <i className="fas fa-spinner fa-spin mr-1"></i>
                            ) : (
                              <i className="fas fa-check mr-1"></i>
                            )}
                            Approve
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fas fa-file-alt text-green-400 mr-2"></i>
                  System Reports
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <i className="fas fa-users text-blue-400"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">User Report</p>
                      <p className="text-xs text-green-200/50">Export user data</p>
                    </div>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <i className="fas fa-donate text-green-400"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Donation Report</p>
                      <p className="text-xs text-green-200/50">Export donation data</p>
                    </div>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <i className="fas fa-chart-bar text-purple-400"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Analytics Report</p>
                      <p className="text-xs text-green-200/50">Platform analytics</p>
                    </div>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <i className="fas fa-exclamation-triangle text-orange-400"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Activity Logs</p>
                      <p className="text-xs text-green-200/50">System audit logs</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#0D2B3E] border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Edit User</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-green-200/50 hover:text-white transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-green-200/70 mb-1">Username</label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-green-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-green-200/70 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-green-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-green-200/70 mb-1">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-green-400 focus:outline-none"
                  >
                    <option value="Donor" className="bg-[#0D2B3E]">Donor</option>
                    <option value="Recipient" className="bg-[#0D2B3E]">Recipient</option>
                    <option value="Admin" className="bg-[#0D2B3E]">Admin</option>
                  </select>
                </div>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.isVerified}
                      onChange={(e) => setEditFormData({ ...editFormData, isVerified: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500/20"
                    />
                    <span className="text-sm text-green-200/70">Verified</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500/20"
                    />
                    <span className="text-sm text-green-200/70">Active</span>
                  </label>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === editingUser._id}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl hover:from-green-500 hover:to-emerald-400 transition-all disabled:opacity-50"
                  >
                    {actionLoading === editingUser._id ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#0D2B3E] border border-white/20 rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <i className="fas fa-trash text-2xl text-red-400"></i>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Delete User</h3>
                <p className="text-green-200/70 mb-6">
                  Are you sure you want to delete <span className="text-white font-medium">{deletingUser.username}</span>? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={actionLoading === deletingUser._id}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === deletingUser._id ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
