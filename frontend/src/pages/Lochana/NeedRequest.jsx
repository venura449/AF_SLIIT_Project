import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logout } from "../../services/authService";
import * as needService from "../../services/needService";

const NeedRequest = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'my-requests'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    category: "Food",
    urgency: "Medium",
    location: "",
    targetAmount: "",
  });
  const profileMenuRef = useRef(null);
  const [needRequests, setNeedRequests] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchNeeds = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === "my") {
        // This calls exports.getMyNeeds in your controller
        response = await needService.getMyRequests();
      } else {
        // This calls exports.getAllNeeds in your controller
        response = await needService.getAllNeeds();
      }
      // Ensure we set an array, even if the backend returns null
      setNeedRequests(response?.data || response || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setNeedRequests([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, [activeTab]); // Refetch when tab changes

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    if (newRequest.category === "Medical" && !selectedFile) {
      return alert("Please upload a medical document for verification.");
    }

    // Validate required fields
    if (!newRequest.title.trim() || !newRequest.description.trim() || !newRequest.location.trim()) {
      return alert("Please fill in all required fields.");
    }

    const amount = parseFloat(newRequest.targetAmount);
    if (isNaN(amount) || amount <= 0) {
      return alert("Please enter a valid target amount.");
    }

    // Prepare JSON data instead of FormData
    const needData = {
      title: newRequest.title.trim(),
      description: newRequest.description.trim(),
      category: newRequest.category,
      urgency: newRequest.urgency,
      location: newRequest.location.trim(),
      goalAmount: amount,
    };

    try {
      const createdNeed = await needService.createNeed(needData);

      // If there's a file and it's medical, upload it separately
      if (selectedFile && newRequest.category === "Medical") {
        try {
          await needService.uploadNeedDocs(createdNeed._id, selectedFile);
        } catch (uploadErr) {
          console.error("File upload error:", uploadErr);
          alert("Need created but file upload failed. You can retry from your profile.");
        }
      }

      // Add to the list - medical requests will show as "Pending Verification"
      setNeedRequests((prev) => [createdNeed, ...prev]);
      
      let successMessage = "Request created successfully!";
      if (newRequest.category === "Medical") {
        successMessage += " Your medical request is pending admin verification.";
      }
      alert(successMessage);

      setShowCreateModal(false);
      setNewRequest({
        title: "",
        description: "",
        category: "Food",
        urgency: "Medium",
        location: "",
        targetAmount: "",
      });
      setSelectedFile(null);
    } catch (err) {
      console.error("Create need error:", err);
      alert(err.response?.data?.message || "Failed to create need request. Please try again.");
    }
  };

  const filteredRequests = needRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || request.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || request.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getProgressPercentage = (current, target) => {
    return Math.round((current / target) * 100);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Critical":
        return "from-red-500/20 to-red-600/20 border-red-500/30";
      case "High":
        return "from-orange-500/20 to-orange-600/20 border-orange-500/30";
      case "Medium":
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      default:
        return "from-green-500/20 to-green-600/20 border-green-500/30";
    }
  };

  const getUrgencyBadgeColor = (urgency) => {
    switch (urgency) {
      case "Critical":
        return "bg-red-500/20 text-red-400";
      case "High":
        return "bg-orange-500/20 text-orange-400";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-green-500/20 text-green-400";
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
                Bridge
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                  Connect
                </span>
              </h1>
            </div>

            {/* Profile Section - Top Right */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-2 px-4 transition-all duration-300 group"
              >
                <span className="text-sm text-green-200/80 group-hover:text-white transition-colors hidden sm:block">
                  {user?.username || "User"}
                </span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-green-500/30">
                  {getInitials(user?.username)}
                </div>
                <i
                  className={`fas fa-chevron-down text-xs text-green-300/50 transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""}`}
                ></i>
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
                        <p className="text-white font-medium">
                          {user?.username}
                        </p>
                        <p className="text-xs text-green-200/50">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-green-200/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                    >
                      <i className="fas fa-user-circle w-5"></i>
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => navigate("/dashboard")}
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
                Need
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                  {" "}
                  Requests
                </span>
              </h2>
              <p className="text-green-200/60">
                Browse and support community needs
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 flex items-center space-x-2"
            >
              <i className="fas fa-plus"></i>
              <span>Create Request</span>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "all"
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                  : "bg-white/10 text-green-200/80 hover:bg-white/20"
              }`}
            >
              <i className="fas fa-globe mr-2"></i>
              All Requests
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "my"
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                  : "bg-white/10 text-green-200/80 hover:bg-white/20"
              }`}
            >
              <i className="fas fa-folder-open mr-2"></i>
              My Requests
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
              <option value="Food">Food</option>
              <option value="Education">Education</option>
              <option value="Medical">Medical</option>
              <option value="Other">Other</option>
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
              <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                {filteredRequests.length}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {filteredRequests.length}
            </h3>
            <p className="text-sm text-green-200/50">Active Requests</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-users text-xl text-blue-400"></i>
              </div>
              <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                +5
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">847</h3>
            <p className="text-sm text-green-200/50">People Helped</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-money-bill-wave text-xl text-purple-400"></i>
              </div>
              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                LKR
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">2.3M</h3>
            <p className="text-sm text-green-200/50">Funds Raised</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-check-circle text-xl text-yellow-400"></i>
              </div>
              <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">
                85%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">127</h3>
            <p className="text-sm text-green-200/50">Completed</p>
          </div>
        </div>

        {/* Needs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className={`bg-gradient-to-br ${getUrgencyColor(request.urgency)} backdrop-blur-xl border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
            >
              {/* Card Header with Image/Emoji */}
              <div className="relative h-32 bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <span className="text-6xl">{request.image}</span>
                {request.status === "Fulfilled" && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <i className="fas fa-check"></i>
                    <span>Fulfilled</span>
                  </div>
                )}
                {request.category === "Medical" && !request.isVerified && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <i className="fas fa-clock"></i>
                    <span>Pending</span>
                  </div>
                )}
                <div
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyBadgeColor(request.urgency)}`}
                >
                  {request.urgency.charAt(0).toUpperCase() +
                    request.urgency.slice(1)}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {request.title}
                </h3>
                <p className="text-sm text-green-200/70 mb-4 line-clamp-2">
                  {request.description}
                </p>

                {/* Pending Verification Notice */}
                {request.category === "Medical" && !request.isVerified && (
                  <div className="mb-4 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-200">
                    <i className="fas fa-info-circle mr-2"></i>
                    Pending admin verification - not yet visible to donors
                  </div>
                )}

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
                      {getProgressPercentage(
                        request.currentAmount || 0,
                        request.goalAmount || 1,
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                      style={{
                        width: `${getProgressPercentage(request.currentAmount || 0, request.goalAmount || 1)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Amount Info */}
                <div className="mb-4 p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-200/50 mb-1">Raised</p>
                      <p className="text-sm font-bold text-white">
                        LKR{" "}
                        {(request?.currentAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-200/50 mb-1">Target</p>
                      <p className="text-sm font-bold text-white">
                        LKR{" "}
                        {(request?.goalAmount || 0).toLocaleString()}
                      </p>
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
            <p className="text-green-200/60">
              No needs requests found matching your filters
            </p>
          </div>
        )}
      </main>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#0D2B3E] border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0D2B3E] border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                Create Need Request
              </h2>
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
                <label className="block text-sm font-medium text-white mb-2">
                  Request Title
                </label>
                <input
                  type="text"
                  required
                  value={newRequest.title}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-green-200/40 focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
                  placeholder="e.g., Food Assistance for Family"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={newRequest.description}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-green-200/40 focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300 resize-none h-24"
                  placeholder="Describe the need in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category
                  </label>
                  <select
                    value={newRequest.category}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
                  >
                    <option value="Food">Food</option>
                    <option value="Medical">Medical</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {newRequest.category === "Medical" && (
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-white mb-2">
                      Medical Prescription / Documentation (Required for
                      Verification)
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="w-full px-4 py-3 bg-white/5 border border-dashed border-white/20 rounded-xl text-green-200/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600 transition-all cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-yellow-400/70 mt-2">
                      * Medical requests require admin verification before
                      appearing for donations.
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Urgency
                  </label>
                  <select
                    value={newRequest.urgency}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, urgency: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={newRequest.location}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, location: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-green-200/40 focus:outline-none focus:border-green-400/30 focus:bg-white/10 transition-all duration-300"
                  placeholder="e.g., Colombo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Target Amount (LKR)
                </label>
                <input
                  type="number"
                  required
                  value={newRequest.targetAmount}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      targetAmount: parseFloat(e.target.value),
                    })
                  }
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
