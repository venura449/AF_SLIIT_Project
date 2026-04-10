import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  logout,
  getDocumentStatus,
} from "../../services/authService";
import { getMyRequests } from "../../services/needService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [documentStatus, setDocumentStatus] = useState(null);
  const [showUploadBanner, setShowUploadBanner] = useState(false);
  const [myNeeds, setMyNeeds] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    totalRaised: 0,
    fulfilled: 0,
  });
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profile, docStatus, needs] = await Promise.all([
          getProfile(),
          getDocumentStatus(),
          getMyRequests(),
        ]);

        // Redirect Donor users to the dedicated donor dashboard
        if (profile.role === "Donor") {
          navigate("/donor-dashboard", { replace: true });
          return;
        }

        setUser(profile);
        setDocumentStatus(docStatus);
        setMyNeeds(needs || []);

        // Compute stats from real data
        const needsList = needs || [];
        setStats({
          totalRequests: needsList.length,
          activeRequests: needsList.filter(
            (n) => n.status === "Pending" || n.status === "Partially Funded",
          ).length,
          totalRaised: needsList.reduce(
            (sum, n) => sum + (n.currentAmount || 0),
            0,
          ),
          fulfilled: needsList.filter((n) => n.status === "Fulfilled").length,
        });

        if (
          docStatus?.documentStatus === "not_uploaded" ||
          docStatus?.documentStatus === "rejected"
        ) {
          setShowUploadBanner(true);
        }
      } catch (err) {
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
              <button className="px-4 py-2 text-sm bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white rounded-xl shadow-lg shadow-green-500/20">
                <i className="fas fa-home mr-2"></i>Dashboard
              </button>
              {user?.role === "Recipient" && (
                <button
                  onClick={() => navigate("/needs")}
                  className="px-4 py-2 text-sm text-green-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  <i className="fas fa-hand-holding-heart mr-2"></i>My Requests
                </button>
              )}
              {user?.role === "Recipient" && (
                <button
                  onClick={() => navigate("/browse-items")}
                  className="px-4 py-2 text-sm text-green-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  <i className="fas fa-gift mr-2"></i>Browse Items
                </button>
              )}
              {user?.role === "Donor" && (
                <button
                  onClick={() => navigate("/donor-needs")}
                  className="px-4 py-2 text-sm text-green-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  <i className="fas fa-search-dollar mr-2"></i>Find Needs
                </button>
              )}
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
                        <p className="text-xs text-green-400">{user?.role}</p>
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
        {/* ID Upload Notification Banner */}
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
                <i className="fas fa-upload mr-2"></i>
                Upload ID
              </button>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-light text-white mb-2">
            Welcome back,{" "}
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              {user?.username}
            </span>
          </h2>
          <p className="text-green-200/60">
            Here's what's happening in your community today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-list-alt text-xl text-green-400"></i>
              </div>
              <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {stats.totalRequests}
            </h3>
            <p className="text-sm text-green-200/50">My Requests</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-hourglass-half text-xl text-blue-400"></i>
              </div>
              <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {stats.activeRequests}
            </h3>
            <p className="text-sm text-green-200/50">Pending / In Progress</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-coins text-xl text-emerald-400"></i>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                LKR
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {stats.totalRaised.toLocaleString()}
            </h3>
            <p className="text-sm text-green-200/50">Total Raised</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-check-circle text-xl text-purple-400"></i>
              </div>
              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                Done
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {stats.fulfilled}
            </h3>
            <p className="text-sm text-green-200/50">Fulfilled</p>
          </div>
        </div>

        {/* Quick Actions + Recent Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-bolt text-yellow-400 mr-2"></i>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/needs")}
                className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-list-check text-emerald-400"></i>
                </div>
                <span className="text-xs text-green-200/80 text-center">
                  My Requests
                </span>
              </button>

              <button
                onClick={() =>
                  navigate("/needs", { state: { openCreateModal: true } })
                }
                className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-full bg-blue-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-plus text-blue-400"></i>
                </div>
                <span className="text-xs text-green-200/80 text-center">
                  New Request
                </span>
              </button>

              <button
                onClick={() => navigate("/browse-items")}
                className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-full bg-green-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-store text-green-400"></i>
                </div>
                <span className="text-xs text-green-200/80 text-center">
                  Browse Items
                </span>
              </button>

              <button
                onClick={() => navigate("/feedback")}
                className="flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-full bg-orange-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-comment-dots text-orange-400"></i>
                </div>
                <span className="text-xs text-green-200/80 text-center">
                  Feedback
                </span>
              </button>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <i className="fas fa-clock text-green-400 mr-2"></i>
                Recent Requests
              </h3>
              <button
                onClick={() => navigate("/needs")}
                className="text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                View all <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>

            {myNeeds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <i className="fas fa-inbox text-2xl text-green-200/30"></i>
                </div>
                <p className="text-green-200/50 text-sm">No requests yet</p>
                <button
                  onClick={() =>
                    navigate("/needs", { state: { openCreateModal: true } })
                  }
                  className="mt-3 px-4 py-2 bg-green-600/80 hover:bg-green-500/80 text-white text-sm rounded-xl transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>Create your first request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myNeeds.slice(0, 4).map((need) => {
                  const progress =
                    need.goalAmount > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (need.currentAmount / need.goalAmount) * 100,
                          ),
                        )
                      : 0;
                  const statusColor =
                    {
                      Pending: "bg-yellow-500/20 text-yellow-400",
                      "Partially Funded": "bg-blue-500/20 text-blue-400",
                      Fulfilled: "bg-green-500/20 text-green-400",
                      Cancelled: "bg-red-500/20 text-red-400",
                    }[need.status] || "bg-white/10 text-white/50";

                  return (
                    <div
                      key={need._id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.08] transition-all cursor-pointer"
                      onClick={() => navigate("/needs")}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm text-white font-medium truncate">
                            {need.title}
                          </p>
                          <p className="text-xs text-green-200/40 mt-0.5">
                            <i className="fas fa-tag mr-1"></i>
                            {need.category} ·{" "}
                            <i className="fas fa-map-marker-alt mr-1 ml-1"></i>
                            {need.location}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColor}`}
                        >
                          {need.status}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-green-200/50">
                            LKR {(need.currentAmount || 0).toLocaleString()}{" "}
                            raised
                          </span>
                          <span className="text-xs text-green-400 font-medium">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Feedback Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => navigate("/feedback")}
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-green-500/30"
          aria-label="Go to feedback page"
          title="Feedback"
        >
          <i className="fas fa-comment-dots text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
