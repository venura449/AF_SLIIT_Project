import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logout } from "../../services/authService";
import * as needService from "../../services/needService";
import ReviewBubble from "./ReviewBubble";

const NeedRequest = () => {
  const navigate = useNavigate();
  // REMOVED: activeTab state
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [editRequest, setEditRequest] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Donations viewer state
  const [showDonationsModal, setShowDonationsModal] = useState(false);
  const [donationsTarget, setDonationsTarget] = useState(null);
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [donationsPage, setDonationsPage] = useState(1);
  const donationsPerPage = 5;

  // Updated to only fetch user-specific needs
  const fetchNeeds = async () => {
    setLoading(true);
    try {
      // Direct call to get My Requests
      const response = await needService.getMyRequests();
      setNeedRequests(response?.data || response || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setNeedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, []); // Runs once on mount

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (err) {
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  // ... (Keep handleLogout, getInitials, handleCreateRequest, and helper functions same as before) ...

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

    const amount = parseFloat(newRequest.targetAmount);
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
      if (selectedFile && newRequest.category === "Medical") {
        await needService.uploadNeedDocs(createdNeed._id, selectedFile);
      }

      // Refresh list
      fetchNeeds();
      alert("Request created successfully!");
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
      alert(err.response?.data?.message || "Failed to create need request.");
    }
  };

  const openEditModal = (request) => {
    setEditRequest({
      _id: request._id,
      title: request.title,
      description: request.description,
      category: request.category,
      urgency: request.urgency,
      location: request.location,
      targetAmount: request.goalAmount,
    });
    setShowEditModal(true);
  };

  const handleEditRequest = async (e) => {
    e.preventDefault();
    const needData = {
      title: editRequest.title.trim(),
      description: editRequest.description.trim(),
      category: editRequest.category,
      urgency: editRequest.urgency,
      location: editRequest.location.trim(),
      goalAmount: parseFloat(editRequest.targetAmount),
    };
    try {
      await needService.updateNeed(editRequest._id, needData);
      fetchNeeds();
      alert("Request updated successfully!");
      setShowEditModal(false);
      setEditRequest(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update request.");
    }
  };

  const handleDeleteRequest = async () => {
    if (!deleteTarget) return;
    try {
      await needService.deleteNeed(deleteTarget._id);
      fetchNeeds();
      alert("Request deleted successfully!");
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete request.");
    }
  };

  const openDonationsModal = async (request) => {
    setDonationsTarget(request);
    setShowDonationsModal(true);
    setDonationsLoading(true);
    setDonationsPage(1);
    try {
      const data = await needService.getDonationsByNeed(request._id);
      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching donations:", err);
      setDonations([]);
    } finally {
      setDonationsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const filteredRequests = needRequests.filter((request) => {
    const matchesSearch = request.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || request.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || request.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getProgressPercentage = (current, target) =>
    Math.round((current / (target || 1)) * 100);

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
      <div className="min-h-screen flex items-center justify-center bg-[#0A1A2F]">
        <i className="fas fa-spinner fa-spin text-4xl text-green-400"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
      {/* Top Navigation Bar */}
      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/30 flex items-center justify-center text-white">
                <i className="fas fa-hand-holding-heart text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-light text-white tracking-wider">
                  Bridge
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                    Connect
                  </span>
                </h1>
              </div>
            </div>

            {/* Center Nav Links */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-sm text-green-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-home mr-2"></i>Dashboard
              </button>
              <button className="px-4 py-2 text-sm bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white rounded-xl shadow-lg shadow-green-500/20">
                <i className="fas fa-hand-holding-heart mr-2"></i>My Requests
              </button>
              <button
                onClick={() => navigate("/browse-items")}
                className="px-4 py-2 text-sm text-green-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-gift mr-2"></i>Browse Items
              </button>
            </div>

            {/* Profile Section */}
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

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0D2B3E]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                  <div className="p-4 border-b border-white/15">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/30">
                        {getInitials(user?.username)}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {user?.username}
                        </p>
                        <p className="text-xs text-green-400">Recipient</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-green-200/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                    >
                      <i className="fas fa-home w-5"></i>
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-green-200/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                    >
                      <i className="fas fa-user-circle w-5"></i>
                      <span>My Profile</span>
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

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-light text-white">
              My{" "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                Requests
              </span>
            </h2>
            <p className="text-sm text-green-200/50 mt-1">
              Track and manage your help requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode("tile")}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${viewMode === "tile" ? "bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white shadow-lg shadow-green-500/20" : "text-green-200/50 hover:text-white hover:bg-white/10"}`}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${viewMode === "table" ? "bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white shadow-lg shadow-green-500/20" : "text-green-200/50 hover:text-white hover:bg-white/10"}`}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center space-x-2"
            >
              <i className="fas fa-plus text-xs"></i>
              <span>New Request</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300/40">
                <i className="fas fa-search text-sm"></i>
              </span>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-white/30 focus:border-green-400/40 focus:ring-1 focus:ring-green-400/20 transition-all outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:border-green-400/40 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0D2B3E]">
                All Categories
              </option>
              <option value="Food" className="bg-[#0D2B3E]">
                Food
              </option>
              <option value="Medical" className="bg-[#0D2B3E]">
                Medical
              </option>
              <option value="Education" className="bg-[#0D2B3E]">
                Education
              </option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:border-green-400/40 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0D2B3E]">
                All Statuses
              </option>
              <option value="Active" className="bg-[#0D2B3E]">
                Active
              </option>
              <option value="Fulfilled" className="bg-[#0D2B3E]">
                Fulfilled
              </option>
              <option value="Pending" className="bg-[#0D2B3E]">
                Pending
              </option>
            </select>
          </div>
          {(searchTerm ||
            selectedCategory !== "all" ||
            selectedStatus !== "all") && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-green-200/40">
                {filteredRequests.length} result
                {filteredRequests.length !== 1 ? "s" : ""} found
              </span>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
                className="text-xs text-red-400/70 hover:text-red-300 transition-colors"
              >
                <i className="fas fa-times mr-1"></i>Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Request Cards / Table */}
        {filteredRequests.length > 0 ? (
          viewMode === "tile" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-all duration-300 group"
                >
                  {/* Top badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getUrgencyBadgeColor(request.urgency)}`}
                      >
                        {request.urgency}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-green-200/70">
                        {request.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {request.category === "Medical" &&
                        !request.isVerified && (
                          <span className="bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            <i className="fas fa-clock mr-1"></i>Unverified
                          </span>
                        )}
                      <button
                        onClick={() => openEditModal(request)}
                        className="p-1.5 text-green-200/30 hover:text-green-400 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Edit"
                      >
                        <i className="fas fa-pen text-xs"></i>
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(request);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1.5 text-green-200/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                      <button
                        onClick={() => openDonationsModal(request)}
                        className="p-1.5 text-green-200/30 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="View Donations"
                      >
                        <i className="fas fa-hand-holding-usd text-xs"></i>
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-green-300 transition-colors line-clamp-1">
                    {request.title}
                  </h3>
                  <p className="text-xs text-green-200/50 mb-4 line-clamp-2 leading-relaxed">
                    {request.description}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] text-green-200/40 mb-1.5">
                      <span>
                        LKR {(request.currentAmount || 0).toLocaleString()}{" "}
                        raised
                      </span>
                      <span>
                        {getProgressPercentage(
                          request.currentAmount,
                          request.goalAmount,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(getProgressPercentage(request.currentAmount, request.goalAmount), 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-green-200/30 uppercase tracking-wider">
                        Goal
                      </p>
                      <p className="text-sm font-bold text-white">
                        LKR {request.goalAmount?.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        request.status === "Active"
                          ? "bg-green-500/15 text-green-400"
                          : request.status === "Fulfilled"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-yellow-500/15 text-yellow-400"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            (() => {
              const totalPages = Math.ceil(
                filteredRequests.length / rowsPerPage,
              );
              const paginatedRequests = filteredRequests.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage,
              );
              return (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-5 py-3">
                            Title
                          </th>
                          <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-5 py-3">
                            Category
                          </th>
                          <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-5 py-3">
                            Urgency
                          </th>
                          <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-5 py-3">
                            Progress
                          </th>
                          <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-5 py-3">
                            Goal
                          </th>
                          <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-5 py-3">
                            Status
                          </th>
                          <th className="text-right text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-5 py-3">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRequests.map((request) => (
                          <tr
                            key={request._id}
                            className="border-b border-white/5 hover:bg-white/[0.04] transition-colors"
                          >
                            <td className="px-5 py-3">
                              <div>
                                <p className="text-sm text-white font-medium truncate max-w-[200px]">
                                  {request.title}
                                </p>
                                <p className="text-[11px] text-green-200/40 truncate max-w-[200px]">
                                  {request.location}
                                </p>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-green-200/70">
                                {request.category}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getUrgencyBadgeColor(request.urgency)}`}
                              >
                                {request.urgency}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center space-x-2 min-w-[120px]">
                                <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                    style={{
                                      width: `${Math.min(getProgressPercentage(request.currentAmount, request.goalAmount), 100)}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-[11px] text-green-200/50 whitespace-nowrap">
                                  {getProgressPercentage(
                                    request.currentAmount,
                                    request.goalAmount,
                                  )}
                                  %
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-sm text-white font-medium whitespace-nowrap">
                                LKR {request.goalAmount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${request.status === "Active" ? "bg-green-500/15 text-green-400" : request.status === "Fulfilled" ? "bg-blue-500/15 text-blue-400" : "bg-yellow-500/15 text-yellow-400"}`}
                              >
                                {request.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => openEditModal(request)}
                                  className="p-2 text-green-200/40 hover:text-green-400 hover:bg-white/10 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <i className="fas fa-pen text-xs"></i>
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteTarget(request);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="p-2 text-green-200/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <i className="fas fa-trash text-xs"></i>
                                </button>
                                <button
                                  onClick={() => openDonationsModal(request)}
                                  className="p-2 text-green-200/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                  title="View Donations"
                                >
                                  <i className="fas fa-hand-holding-usd text-xs"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
                      <span className="text-xs text-green-200/40">
                        Showing {(currentPage - 1) * rowsPerPage + 1}–
                        {Math.min(
                          currentPage * rowsPerPage,
                          filteredRequests.length,
                        )}{" "}
                        of {filteredRequests.length}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-2.5 py-1.5 text-xs text-green-200/50 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-2.5 py-1.5 text-xs rounded-lg transition-all ${currentPage === page ? "bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white shadow-lg shadow-green-500/20" : "text-green-200/50 hover:text-white hover:bg-white/10"}`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1.5 text-xs text-green-200/50 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )
        ) : (
          <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <i className="fas fa-inbox text-2xl text-green-400/30"></i>
            </div>
            <p className="text-white font-medium mb-1">No requests yet</p>
            <p className="text-sm text-green-200/40 mb-4">
              Create your first help request to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600/80 hover:bg-green-500 text-white text-sm rounded-xl transition-all"
            >
              <i className="fas fa-plus mr-2"></i>New Request
            </button>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">
                New Help Request
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-green-200/40 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-green-200/60 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newRequest.title}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, title: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-white/25 focus:border-green-400/40 focus:outline-none transition-all"
                  placeholder="e.g., Emergency Medical Surgery"
                />
              </div>

              <div>
                <label className="block text-xs text-green-200/60 mb-1.5">
                  Description *
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-white/25 focus:border-green-400/40 focus:outline-none transition-all h-20 resize-none"
                  placeholder="Describe your need in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-green-200/60 mb-1.5">
                    Category *
                  </label>
                  <select
                    required
                    value={newRequest.category}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, category: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:border-green-400/40 focus:outline-none cursor-pointer"
                  >
                    <option value="Food" className="bg-[#0D2B3E]">
                      Food
                    </option>
                    <option value="Medical" className="bg-[#0D2B3E]">
                      Medical
                    </option>
                    <option value="Education" className="bg-[#0D2B3E]">
                      Education
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-green-200/60 mb-1.5">
                    Urgency *
                  </label>
                  <select
                    required
                    value={newRequest.urgency}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, urgency: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:border-green-400/40 focus:outline-none cursor-pointer"
                  >
                    <option value="Low" className="bg-[#0D2B3E]">
                      Low
                    </option>
                    <option value="Medium" className="bg-[#0D2B3E]">
                      Medium
                    </option>
                    <option value="High" className="bg-[#0D2B3E]">
                      High
                    </option>
                    <option value="Critical" className="bg-[#0D2B3E]">
                      Critical
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-green-200/60 mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRequest.location}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, location: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-white/25 focus:border-green-400/40 focus:outline-none transition-all"
                    placeholder="e.g., Colombo"
                  />
                </div>
                <div>
                  <label className="block text-xs text-green-200/60 mb-1.5">
                    Target Amount (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newRequest.targetAmount}
                    onChange={(e) =>
                      setNewRequest({
                        ...newRequest,
                        targetAmount: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-white/25 focus:border-green-400/40 focus:outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              {newRequest.category === "Medical" && (
                <div>
                  <label className="block text-xs text-green-200/60 mb-1.5">
                    Medical Documents *
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-green-600/30 file:text-green-300"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-[11px] text-green-200/30 mt-1">
                    PDF, JPG, PNG — Max 5MB
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 text-sm text-white rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-sm text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/20"
                >
                  <i className="fas fa-check mr-2"></i>Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Edit Request</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditRequest(null);
                }}
                className="text-green-200/40 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleEditRequest} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-green-200/60 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editRequest.title}
                  onChange={(e) =>
                    setEditRequest({ ...editRequest, title: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-white/25 focus:border-green-400/40 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs text-green-200/60 mb-1.5">
                  Description *
                </label>
                <textarea
                  required
                  value={editRequest.description}
                  onChange={(e) =>
                    setEditRequest({
                      ...editRequest,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-white/25 focus:border-green-400/40 focus:outline-none transition-all h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-green-200/60 mb-1.5">
                    Category *
                  </label>
                  <select
                    required
                    value={editRequest.category}
                    onChange={(e) =>
                      setEditRequest({
                        ...editRequest,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:border-green-400/40 focus:outline-none cursor-pointer"
                  >
                    <option value="Food" className="bg-[#0D2B3E]">
                      Food
                    </option>
                    <option value="Medical" className="bg-[#0D2B3E]">
                      Medical
                    </option>
                    <option value="Education" className="bg-[#0D2B3E]">
                      Education
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-green-200/60 mb-1.5">
                    Urgency *
                  </label>
                  <select
                    required
                    value={editRequest.urgency}
                    onChange={(e) =>
                      setEditRequest({
                        ...editRequest,
                        urgency: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:border-green-400/40 focus:outline-none cursor-pointer"
                  >
                    <option value="Low" className="bg-[#0D2B3E]">
                      Low
                    </option>
                    <option value="Medium" className="bg-[#0D2B3E]">
                      Medium
                    </option>
                    <option value="High" className="bg-[#0D2B3E]">
                      High
                    </option>
                    <option value="Critical" className="bg-[#0D2B3E]">
                      Critical
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-green-200/60 mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={editRequest.location}
                    onChange={(e) =>
                      setEditRequest({
                        ...editRequest,
                        location: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-white/25 focus:border-green-400/40 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-green-200/60 mb-1.5">
                    Target Amount (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editRequest.targetAmount}
                    onChange={(e) =>
                      setEditRequest({
                        ...editRequest,
                        targetAmount: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-white/25 focus:border-green-400/40 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditRequest(null);
                  }}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 text-sm text-white rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-sm text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/20"
                >
                  <i className="fas fa-check mr-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <i className="fas fa-trash-alt text-xl text-red-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Delete Request?
              </h3>
              <p className="text-sm text-green-200/50 mb-1">
                This will permanently delete
              </p>
              <p className="text-sm text-white font-medium mb-6 truncate px-4">
                "{deleteTarget.title}"
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                  }}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 text-sm text-white rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRequest}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-sm text-white font-medium rounded-xl transition-all shadow-lg shadow-red-500/20"
                >
                  <i className="fas fa-trash mr-2"></i>Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Donations Modal */}
      {showDonationsModal && donationsTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  <i className="fas fa-hand-holding-usd text-green-400 mr-2"></i>
                  Donations Received
                </h3>
                <p className="text-xs text-green-200/50 mt-0.5 truncate max-w-[350px]">
                  {donationsTarget.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDonationsModal(false);
                  setDonationsTarget(null);
                  setDonations([]);
                  setDonationsPage(1);
                }}
                className="text-green-200/40 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {donationsLoading ? (
                <div className="text-center py-10">
                  <i className="fas fa-spinner fa-spin text-2xl text-green-400"></i>
                  <p className="text-sm text-green-200/50 mt-2">
                    Loading donations...
                  </p>
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                    <i className="fas fa-inbox text-xl text-green-200/30"></i>
                  </div>
                  <p className="text-white font-medium">No donations yet</p>
                  <p className="text-xs text-green-200/40 mt-1">
                    Donations will appear here once donors contribute
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations
                    .slice(
                      (donationsPage - 1) * donationsPerPage,
                      donationsPage * donationsPerPage,
                    )
                    .map((donation) => (
                      <div
                        key={donation._id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold shadow-md">
                              {donation.donor?.username
                                ?.charAt(0)
                                ?.toUpperCase() || "D"}
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium">
                                {donation.donor?.username || "Anonymous"}
                              </p>
                              <p className="text-[11px] text-green-200/40">
                                {donation.donor?.email}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                donation.donationType === "Cash"
                                  ? "bg-green-500/15 text-green-400"
                                  : donation.donationType === "Card"
                                    ? "bg-blue-500/15 text-blue-400"
                                    : "bg-purple-500/15 text-purple-400"
                              }`}
                            >
                              <i
                                className={`fas ${donation.donationType === "Cash" ? "fa-money-bill-wave" : donation.donationType === "Card" ? "fa-credit-card" : "fa-box-open"} mr-1`}
                              ></i>
                              {donation.donationType}
                            </span>
                            <p className="text-[10px] text-green-200/30 mt-1">
                              {new Date(donation.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        {(donation.donationType === "Cash" ||
                          donation.donationType === "Card") && (
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="text-sm font-bold text-white">
                              LKR {donation.amount?.toLocaleString()}
                            </span>
                            {donation.phoneNumber && (
                              <span className="text-[11px] text-green-200/50">
                                <i className="fas fa-phone text-[10px] mr-1"></i>
                                {donation.phoneNumber}
                              </span>
                            )}
                          </div>
                        )}
                        {donation.donationType === "Goods" &&
                          donation.goodsDescription && (
                            <div className="mt-2">
                              <p className="text-xs text-green-200/50">
                                <i className="fas fa-box-open mr-1"></i>
                                {donation.goodsDescription}
                              </p>
                            </div>
                          )}
                        {donation.message && (
                          <div className="mt-2 bg-white/5 rounded-lg px-3 py-2 border-l-2 border-green-400/30">
                            <p className="text-xs text-green-200/60 italic">
                              "{donation.message}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-white/10 flex flex-col gap-2 shrink-0">
              {donations.length > donationsPerPage && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setDonationsPage((p) => Math.max(1, p - 1))}
                    disabled={donationsPage === 1}
                    className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-green-200/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-chevron-left mr-1"></i>Prev
                  </button>
                  {Array.from(
                    { length: Math.ceil(donations.length / donationsPerPage) },
                    (_, i) => i + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setDonationsPage(page)}
                      className={`w-7 h-7 text-xs rounded-lg border transition-all ${
                        donationsPage === page
                          ? "bg-gradient-to-r from-green-500 to-emerald-400 text-white border-transparent shadow-lg shadow-green-500/20"
                          : "bg-white/5 border-white/10 text-green-200/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setDonationsPage((p) =>
                        Math.min(
                          Math.ceil(donations.length / donationsPerPage),
                          p + 1,
                        ),
                      )
                    }
                    disabled={
                      donationsPage ===
                      Math.ceil(donations.length / donationsPerPage)
                    }
                    className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-green-200/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next<i className="fas fa-chevron-right ml-1"></i>
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-200/40">
                  {donations.length} donation{donations.length !== 1 ? "s" : ""}{" "}
                  total
                </span>
                <button
                  onClick={() => {
                    setShowDonationsModal(false);
                    setDonationsTarget(null);
                    setDonations([]);
                    setDonationsPage(1);
                  }}
                  className="px-4 py-2 text-sm text-green-200/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ReviewBubble />
    </div>
  );
};

export default NeedRequest;
