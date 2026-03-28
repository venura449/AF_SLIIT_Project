import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getProfile,
  logout,
  getDocumentStatus,
} from "../../services/authService";
import * as needService from "../../services/needService";
import * as itemService from "../../services/itemService";
import { getImageUrl } from "../../services/itemService";
import ReviewBubble from "./ReviewBubble";
import ChatBubble from "./ChatBubble";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [documentStatus, setDocumentStatus] = useState(null);
  const [showUploadBanner, setShowUploadBanner] = useState(false);
  const profileMenuRef = useRef(null);

  // Dashboard data
  const [myDonations, setMyDonations] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [approvedNeeds, setApprovedNeeds] = useState([]);
  const [platformReviews, setPlatformReviews] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalDonated: 0,
    donationCount: 0,
    itemsListed: 0,
    needsHelped: 0,
    pendingDonations: 0,
    confirmedDonations: 0,
    itemsClaimed: 0,
    avgRating: 0,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profile, docStatus] = await Promise.all([
          getProfile(),
          getDocumentStatus(),
        ]);

        if (profile.role !== "Donor") {
          navigate("/dashboard");
          return;
        }

        setUser(profile);
        setDocumentStatus(docStatus);

        if (
          docStatus?.documentStatus === "not_uploaded" ||
          docStatus?.documentStatus === "rejected"
        ) {
          setShowUploadBanner(true);
        }

        // Fetch donor-specific data in parallel
        const [donations, items, needs, reviews] = await Promise.all([
          needService.getMyDonations().catch(() => []),
          itemService.getMyItems().catch(() => []),
          needService.getAllNeeds().catch(() => []),
          needService.getPlatformReviews().catch(() => []),
        ]);

        const donationsList = Array.isArray(donations) ? donations : [];
        const itemsList = Array.isArray(items) ? items : [];
        const needsList = Array.isArray(needs) ? needs : [];
        const reviewsList = Array.isArray(reviews) ? reviews : [];

        setMyDonations(donationsList);
        setMyItems(itemsList);
        setApprovedNeeds(needsList);
        setPlatformReviews(reviewsList);

        // Calculate stats
        const totalDonated = donationsList.reduce(
          (sum, d) => sum + (d.amount || 0),
          0,
        );
        const uniqueNeeds = new Set(
          donationsList.map((d) => d.need?._id || d.need),
        );
        const confirmedCount = donationsList.filter(
          (d) => d.paymentStatus === "Completed",
        ).length;
        const pendingCount = donationsList.filter(
          (d) => d.paymentStatus === "Pending",
        ).length;
        const claimedItems = itemsList.filter(
          (i) => i.status === "Claimed",
        ).length;

        setStats({
          totalDonated,
          donationCount: donationsList.length,
          itemsListed: itemsList.length,
          needsHelped: uniqueNeeds.size,
          pendingDonations: pendingCount,
          confirmedDonations: confirmedCount,
          itemsClaimed: claimedItems,
          avgRating: 0,
        });
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
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

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getUrgencyColor = (urgency) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-400";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "Failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-blue-500/20 text-blue-400";
    }
  };

  // Navigation items for donor
  const navItems = [
    {
      path: "/donor-dashboard",
      label: "Dashboard",
      icon: "fa-home",
    },
    {
      path: "/donor-needs",
      label: "Find Needs",
      icon: "fa-search-dollar",
    },
    {
      path: "/donor-items",
      label: "My Items",
      icon: "fa-gift",
    },
    {
      path: "/browse-items",
      label: "Browse Items",
      icon: "fa-store",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
            <i className="fas fa-hand-holding-heart text-2xl text-green-400"></i>
          </div>
          <p className="text-green-200/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
      {/* Background */}
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
          <circle cx="50%" cy="50%" r="2" fill="#4ADE80" opacity="0.3" />
        </svg>
      </div>

      {/* ===== TOP NAVIGATION BAR ===== */}
      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate("/donor-dashboard")}
            >
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

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white shadow-lg shadow-green-500/20"
                        : "text-green-200/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <i className={`fas ${item.icon} mr-2`}></i>
                    {item.label}
                  </button>
                );
              })}
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

              {/* Profile Dropdown */}
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
                        <p className="text-xs text-green-400">Donor</p>
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
                      onClick={() => navigate("/upload-id")}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-green-200/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                    >
                      <i className="fas fa-id-card w-5"></i>
                      <span>Upload ID</span>
                      {documentStatus?.documentStatus === "not_uploaded" && (
                        <span className="ml-auto px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                          Required
                        </span>
                      )}
                      {documentStatus?.documentStatus === "pending" && (
                        <span className="ml-auto px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                      {documentStatus?.documentStatus === "verified" && (
                        <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Verified
                        </span>
                      )}
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

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/5">
          <div className="flex overflow-x-auto px-4 py-2 space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white"
                      : "text-green-200/50 hover:bg-white/10"
                  }`}
                >
                  <i className={`fas ${item.icon} mr-1`}></i>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ID Upload Banner */}
        {showUploadBanner && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <i className="fas fa-id-card text-orange-400"></i>
              </div>
              <div>
                <p className="text-white font-medium">
                  {documentStatus?.documentStatus === "rejected"
                    ? "Your ID verification was rejected"
                    : "Verify your identity to unlock all features"}
                </p>
                <p className="text-sm text-orange-200/70">
                  {documentStatus?.documentStatus === "rejected"
                    ? "Please upload a clearer document to complete verification."
                    : "Upload your National Identity Card (NIC) to get verified."}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUploadBanner(false)}
                className="text-orange-200/50 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
              <button
                onClick={() => navigate("/upload-id")}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-medium rounded-xl transition-colors text-sm"
              >
                <i className="fas fa-upload mr-2"></i>Upload ID
              </button>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <p className="text-green-200/50 text-sm mb-1">
              Welcome back, Donor
            </p>
            <h2 className="text-3xl font-light text-white">
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                {user?.username}
              </span>
              's Dashboard
            </h2>
            <p className="text-green-200/50 mt-1">
              Track your donations, items, and impact on the community.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => navigate("/donor-needs")}
              className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-green-500/20"
            >
              <i className="fas fa-donate mr-2"></i>Donate Now
            </button>
            <button
              onClick={() => navigate("/donor-items")}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition-all"
            >
              <i className="fas fa-plus mr-2"></i>List Item
            </button>
          </div>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-hand-holding-usd text-lg text-green-400"></i>
              </div>
              <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
                {stats.donationCount} total
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">
              LKR {stats.totalDonated.toLocaleString()}
            </h3>
            <p className="text-sm text-green-200/50">Total Donated</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-heart text-lg text-blue-400"></i>
              </div>
              <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
                Needs
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">
              {stats.needsHelped}
            </h3>
            <p className="text-sm text-green-200/50">Needs Helped</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-gift text-lg text-purple-400"></i>
              </div>
              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                {stats.itemsClaimed} claimed
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">
              {stats.itemsListed}
            </h3>
            <p className="text-sm text-green-200/50">Items Listed</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-clock text-lg text-yellow-400"></i>
              </div>
              <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                Pending
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">
              {stats.pendingDonations}
            </h3>
            <p className="text-sm text-green-200/50">Pending Donations</p>
          </div>
        </div>

        {/* ===== DASHBOARD CONTENT ===== */}
          <div className="space-y-6">
            {/* Quick Actions + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fas fa-bolt text-yellow-400 mr-2"></i>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => navigate("/donor-needs")}
                    className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <i className="fas fa-donate text-green-400"></i>
                    </div>
                    <span className="text-sm text-green-200/80">
                      Find Needs
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/donor-items")}
                    className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <i className="fas fa-plus-circle text-purple-400"></i>
                    </div>
                    <span className="text-sm text-green-200/80">List Item</span>
                  </button>

                  <button
                    onClick={() => navigate("/browse-items")}
                    className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <i className="fas fa-store text-blue-400"></i>
                    </div>
                    <span className="text-sm text-green-200/80">
                      Browse Items
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/profile")}
                    className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <i className="fas fa-user-edit text-orange-400"></i>
                    </div>
                    <span className="text-sm text-green-200/80">Profile</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <i className="fas fa-clock text-green-400 mr-2"></i>
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {myDonations.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                        <i className="fas fa-inbox text-green-200/20 text-lg"></i>
                      </div>
                      <p className="text-sm text-green-200/40">
                        No activity yet
                      </p>
                      <p className="text-xs text-green-200/30 mt-1">
                        Start by making a donation or listing an item
                      </p>
                    </div>
                  ) : (
                    <>
                      {myDonations.slice(0, 4).map((donation) => (
                        <div
                          key={donation._id}
                          className="flex items-start space-x-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-hand-holding-usd text-green-400 text-xs"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              Donated{" "}
                              {donation.donationType === "Goods"
                                ? "Goods"
                                : `LKR ${donation.amount?.toLocaleString()}`}
                            </p>
                            <p className="text-xs text-green-200/40">
                              {donation.need?.title || "Need"} &middot;{" "}
                              {timeAgo(donation.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusColor(donation.paymentStatus)}`}
                          >
                            {donation.paymentStatus}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Donations Summary + Top Needs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Donations */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <i className="fas fa-hand-holding-heart text-green-400 mr-2"></i>
                    Recent Donations
                  </h3>
                  <button
                    onClick={() => navigate("/donor-needs")}
                    className="text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    View All <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
                {myDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                      <i className="fas fa-donate text-green-200/15 text-xl"></i>
                    </div>
                    <p className="text-sm text-green-200/40">
                      No donations yet
                    </p>
                    <button
                      onClick={() => navigate("/donor-needs")}
                      className="mt-3 text-xs text-green-400 hover:text-green-300"
                    >
                      Find needs to support{" "}
                      <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myDonations.slice(0, 5).map((donation) => (
                      <div
                        key={donation._id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/[0.08] transition-colors"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              donation.donationType === "Cash"
                                ? "bg-green-500/20"
                                : donation.donationType === "Card"
                                  ? "bg-blue-500/20"
                                  : "bg-purple-500/20"
                            }`}
                          >
                            <i
                              className={`fas ${
                                donation.donationType === "Cash"
                                  ? "fa-money-bill text-green-400"
                                  : donation.donationType === "Card"
                                    ? "fa-credit-card text-blue-400"
                                    : "fa-box text-purple-400"
                              } text-sm`}
                            ></i>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">
                              {donation.need?.title || "Donation"}
                            </p>
                            <p className="text-[11px] text-green-200/40">
                              {donation.donationType} &middot;{" "}
                              {timeAgo(donation.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-sm font-semibold text-white">
                            {donation.donationType === "Goods"
                              ? "Goods"
                              : `LKR ${donation.amount?.toLocaleString()}`}
                          </p>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(donation.paymentStatus)}`}
                          >
                            {donation.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Active Needs */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <i className="fas fa-fire text-orange-400 mr-2"></i>
                    Active Needs
                  </h3>
                  <button
                    onClick={() => navigate("/donor-needs")}
                    className="text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    View All <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
                {approvedNeeds.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                      <i className="fas fa-search text-green-200/15 text-xl"></i>
                    </div>
                    <p className="text-sm text-green-200/40">
                      No active needs right now
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvedNeeds
                      .filter((n) => n.status !== "Fulfilled")
                      .slice(0, 4)
                      .map((need) => {
                        const progress =
                          need.currentAmount && need.goalAmount
                            ? Math.round(
                                (need.currentAmount /
                                  (need.currentAmount + need.goalAmount)) *
                                  100,
                              )
                            : 0;
                        return (
                          <div
                            key={need._id}
                            className="p-3 bg-white/5 rounded-xl hover:bg-white/[0.08] transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2 min-w-0">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${getUrgencyColor(need.urgency)}`}
                                >
                                  {need.urgency}
                                </span>
                                <p className="text-sm text-white font-medium truncate">
                                  {need.title}
                                </p>
                              </div>
                              <span className="text-[10px] text-green-200/30 flex-shrink-0 ml-2">
                                {need.category}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(progress, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-[11px] text-green-200/50 flex-shrink-0">
                                {progress}%
                              </span>
                            </div>
                            <div className="flex justify-between mt-1.5 text-[11px] text-green-200/30">
                              <span>
                                LKR {(need.currentAmount || 0).toLocaleString()}{" "}
                                raised
                              </span>
                              <span>
                                LKR {need.goalAmount?.toLocaleString()}{" "}
                                remaining
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* My Items Preview */}
            {myItems.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <i className="fas fa-gift text-purple-400 mr-2"></i>
                    My Listed Items
                  </h3>
                  <button
                    onClick={() => navigate("/donor-items")}
                    className="text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    Manage Items <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {myItems.slice(0, 4).map((item) => (
                    <div
                      key={item._id}
                      className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/[0.08] transition-all group cursor-pointer"
                      onClick={() => navigate("/donor-items")}
                    >
                      <div className="h-32 bg-white/5 overflow-hidden">
                        {item.images?.[0] ? (
                          <img
                            src={getImageUrl(item.images[0])}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="fas fa-box text-green-200/15 text-3xl"></i>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-white font-medium truncate">
                          {item.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[11px] text-green-200/40">
                            {item.category}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              item.status === "Available"
                                ? "bg-green-500/20 text-green-400"
                                : item.status === "Reserved"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
      </main>

      {/* Floating Bubbles */}
      <ChatBubble user={user} />
      <ReviewBubble />
    </div>
  );
};

export default DonorDashboard;
