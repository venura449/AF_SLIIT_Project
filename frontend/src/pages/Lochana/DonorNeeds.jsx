import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logout } from "../../services/authService";
import * as needService from "../../services/needService";
import ChatBubble from "./ChatBubble";

const DonorNeeds = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [needs, setNeeds] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const profileMenuRef = useRef(null);

  // Donation modal state
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateTarget, setDonateTarget] = useState(null);
  const [donationType, setDonationType] = useState("Cash");
  const [donateAmount, setDonateAmount] = useState("");
  const [goodsDescription, setGoodsDescription] = useState("");
  const [donating, setDonating] = useState(false);
  const [donateError, setDonateError] = useState("");
  const [donateSuccess, setDonateSuccess] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [donateMessage, setDonateMessage] = useState("");

  const fetchNeeds = async () => {
    setLoading(true);
    try {
      const response = await needService.getAllNeeds(
        selectedCategory !== "all" ? selectedCategory : "all",
      );
      setNeeds(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setNeeds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile.role !== "Donor") {
          navigate("/dashboard");
          return;
        }
        setUser(profile);
      } catch {
        navigate("/login");
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedUrgency]);

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

  const filteredNeeds = needs.filter((need) => {
    const matchesSearch = need.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesUrgency =
      selectedUrgency === "all" || need.urgency === selectedUrgency;
    return matchesSearch && matchesUrgency;
  });

  const getProgressPercentage = (current, goal) => {
    const total = (current || 0) + (goal || 0);
    if (total === 0) return 0;
    return Math.round(((current || 0) / total) * 100);
  };

  const openDonateModal = (need) => {
    setDonateTarget(need);
    setDonationType("Cash");
    setDonateAmount("");
    setGoodsDescription("");
    setPhoneNumber("");
    setDonateMessage("");
    setDonateError("");
    setDonateSuccess("");
    setShowDonateModal(true);
  };

  const handleDonate = async () => {
    setDonateError("");
    setDonateSuccess("");

    if (
      (donationType === "Cash" || donationType === "Card") &&
      (!donateAmount || Number(donateAmount) <= 0)
    ) {
      setDonateError("Please enter a valid amount");
      return;
    }

    if (donationType === "Goods" && !goodsDescription.trim()) {
      setDonateError("Please describe the goods you want to donate");
      return;
    }

    const remaining = donateTarget.goalAmount;
    if (
      (donationType === "Cash" || donationType === "Card") &&
      Number(donateAmount) > remaining
    ) {
      setDonateError(
        `Amount exceeds remaining goal (LKR ${remaining.toLocaleString()})`,
      );
      return;
    }

    setDonating(true);
    try {
      await needService.createDonation({
        need: donateTarget._id,
        donationType,
        amount: donationType === "Goods" ? 0 : Number(donateAmount),
        goodsDescription:
          donationType === "Goods" ? goodsDescription : undefined,
        phoneNumber:
          donationType === "Cash" || donationType === "Card"
            ? phoneNumber
            : undefined,
        message:
          donationType === "Cash" || donationType === "Card"
            ? donateMessage
            : undefined,
      });
      setDonateSuccess(
        donationType === "Goods"
          ? "Goods donation submitted!"
          : "Donation successful!",
      );
      await fetchNeeds();
      setTimeout(() => setShowDonateModal(false), 1200);
    } catch (err) {
      setDonateError(err.response?.data?.message || "Donation failed");
    } finally {
      setDonating(false);
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

  const totalPages = Math.ceil(filteredNeeds.length / rowsPerPage);
  const paginatedNeeds = filteredNeeds.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
      {/* Top Navigation Bar */}
      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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

            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-sm text-green-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-home mr-2"></i>Dashboard
              </button>
              <button className="px-4 py-2 text-sm bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white rounded-xl shadow-lg shadow-green-500/20">
                <i className="fas fa-search-dollar mr-2"></i>Find Needs
              </button>
              <button
                onClick={() => navigate("/donor-items")}
                className="px-4 py-2 text-sm text-green-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-gift mr-2"></i>My Items
              </button>
            </div>

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
                        <p className="text-xs text-green-400">Donor</p>
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-light text-white">
              Approved{" "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                Needs
              </span>
            </h2>
            <p className="text-sm text-green-200/50 mt-1">
              Browse verified needs and make a difference
            </p>
          </div>
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
                placeholder="Search needs..."
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
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:border-green-400/40 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0D2B3E]">
                All Urgency
              </option>
              <option value="Critical" className="bg-[#0D2B3E]">
                Critical
              </option>
              <option value="High" className="bg-[#0D2B3E]">
                High
              </option>
              <option value="Medium" className="bg-[#0D2B3E]">
                Medium
              </option>
              <option value="Low" className="bg-[#0D2B3E]">
                Low
              </option>
            </select>
          </div>
        </div>

        {/* Content */}
        {filteredNeeds.length > 0 ? (
          viewMode === "tile" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredNeeds.map((need) => (
                <div
                  key={need._id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getUrgencyBadgeColor(need.urgency)}`}
                      >
                        {need.urgency}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-green-200/70">
                        {need.category}
                      </span>
                    </div>
                    <span className="bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      <i className="fas fa-check-circle mr-1"></i>Verified
                    </span>
                  </div>

                  <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-green-300 transition-colors line-clamp-1">
                    {need.title}
                  </h3>
                  <p className="text-xs text-green-200/50 mb-4 line-clamp-2 leading-relaxed">
                    {need.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] text-green-200/40 mb-1.5">
                      <span>
                        LKR {(need.currentAmount || 0).toLocaleString()} raised
                      </span>
                      <span>
                        {getProgressPercentage(
                          need.currentAmount,
                          need.goalAmount,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(getProgressPercentage(need.currentAmount, need.goalAmount), 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-green-200/30 uppercase tracking-wider">
                        Remaining
                      </p>
                      <p className="text-sm font-bold text-white">
                        LKR {need.goalAmount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-green-200/40 mr-2">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {need.location}
                      </span>
                      {need.status !== "Fulfilled" && (
                        <button
                          onClick={() => openDonateModal(need)}
                          className="px-3 py-1.5 text-[11px] font-semibold bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200"
                        >
                          <i className="fas fa-donate mr-1"></i>Donate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                        Location
                      </th>
                      <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-5 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedNeeds.map((need) => (
                      <tr
                        key={need._id}
                        className="border-b border-white/5 hover:bg-white/[0.04] transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="text-sm text-white font-medium truncate max-w-[200px]">
                            {need.title}
                          </p>
                          <p className="text-[11px] text-green-200/40 truncate max-w-[200px]">
                            {need.description}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-green-200/70">
                            {need.category}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getUrgencyBadgeColor(need.urgency)}`}
                          >
                            {need.urgency}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center space-x-2 min-w-[120px]">
                            <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                style={{
                                  width: `${Math.min(getProgressPercentage(need.currentAmount, need.goalAmount), 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-[11px] text-green-200/50 whitespace-nowrap">
                              {getProgressPercentage(
                                need.currentAmount,
                                need.goalAmount,
                              )}
                              %
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-white font-medium whitespace-nowrap">
                            LKR {need.goalAmount?.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs text-green-200/50">
                            {need.location}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {need.status !== "Fulfilled" ? (
                            <button
                              onClick={() => openDonateModal(need)}
                              className="px-3 py-1.5 text-[11px] font-semibold bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200"
                            >
                              <i className="fas fa-donate mr-1"></i>Donate
                            </button>
                          ) : (
                            <span className="text-[11px] text-green-400 font-semibold">
                              <i className="fas fa-check-circle mr-1"></i>
                              Fulfilled
                            </span>
                          )}
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
                    {Math.min(currentPage * rowsPerPage, filteredNeeds.length)}{" "}
                    of {filteredNeeds.length}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1.5 text-xs text-green-200/50 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2.5 py-1.5 text-xs rounded-lg transition-all ${currentPage === page ? "bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white shadow-lg shadow-green-500/20" : "text-green-200/50 hover:text-white hover:bg-white/10"}`}
                        >
                          {page}
                        </button>
                      ),
                    )}
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
          )
        ) : (
          <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <i className="fas fa-inbox text-2xl text-green-400/30"></i>
            </div>
            <p className="text-white font-medium mb-1">No needs available</p>
            <p className="text-sm text-green-200/40">
              Check back later for approved need requests
            </p>
          </div>
        )}
      </main>

      {/* Donate Modal */}
      {showDonateModal && donateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Donate to Need
                </h3>
                <p className="text-xs text-green-200/50 mt-0.5 truncate max-w-[280px]">
                  {donateTarget.title}
                </p>
              </div>
              <button
                onClick={() => setShowDonateModal(false)}
                className="text-green-200/40 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Progress Summary */}
            <div className="px-6 pt-4">
              <div className="flex justify-between text-xs text-green-200/50 mb-1.5">
                <span>
                  LKR {(donateTarget.currentAmount || 0).toLocaleString()}{" "}
                  raised
                </span>
                <span>
                  LKR{" "}
                  {(
                    (donateTarget.currentAmount || 0) +
                    (donateTarget.goalAmount || 0)
                  ).toLocaleString()}{" "}
                  total
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(getProgressPercentage(donateTarget.currentAmount, donateTarget.goalAmount), 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-[11px] text-green-200/40 mt-1">
                LKR {donateTarget.goalAmount?.toLocaleString()} remaining
              </p>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Donation Type */}
              <div>
                <label className="text-xs text-green-200/60 font-medium block mb-2">
                  Donation Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Cash", "Card", "Goods"].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setDonationType(type);
                        setDonateError("");
                      }}
                      className={`py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                        donationType === type
                          ? "bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white border-green-400/30 shadow-lg shadow-green-500/20"
                          : "bg-white/5 text-green-200/60 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <i
                        className={`fas ${type === "Cash" ? "fa-money-bill-wave" : type === "Card" ? "fa-credit-card" : "fa-box-open"} mr-1.5`}
                      ></i>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount (Cash/Card) */}
              {(donationType === "Cash" || donationType === "Card") && (
                <div>
                  <label className="text-xs text-green-200/60 font-medium block mb-2">
                    Amount (LKR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={donateTarget.goalAmount}
                    value={donateAmount}
                    onChange={(e) => {
                      setDonateAmount(e.target.value);
                      setDonateError("");
                    }}
                    placeholder={`Max LKR ${donateTarget.goalAmount?.toLocaleString()}`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder-white/30 focus:border-green-400/40 focus:ring-1 focus:ring-green-400/20 transition-all outline-none"
                  />
                </div>
              )}

              {/* Phone Number (Cash/Card) */}
              {(donationType === "Cash" || donationType === "Card") && (
                <div>
                  <label className="text-xs text-green-200/60 font-medium block mb-2">
                    Phone Number{" "}
                    <span className="text-green-200/30">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 077 123 4567"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder-white/30 focus:border-green-400/40 focus:ring-1 focus:ring-green-400/20 transition-all outline-none"
                  />
                </div>
              )}

              {/* Message (Cash/Card) */}
              {(donationType === "Cash" || donationType === "Card") && (
                <div>
                  <label className="text-xs text-green-200/60 font-medium block mb-2">
                    Message{" "}
                    <span className="text-green-200/30">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={donateMessage}
                    onChange={(e) => setDonateMessage(e.target.value)}
                    placeholder="Leave a message for the recipient..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder-white/30 focus:border-green-400/40 focus:ring-1 focus:ring-green-400/20 transition-all outline-none resize-none"
                  />
                </div>
              )}

              {/* Goods Description */}
              {donationType === "Goods" && (
                <div>
                  <label className="text-xs text-green-200/60 font-medium block mb-2">
                    Describe the Goods
                  </label>
                  <textarea
                    rows={3}
                    value={goodsDescription}
                    onChange={(e) => {
                      setGoodsDescription(e.target.value);
                      setDonateError("");
                    }}
                    placeholder="e.g. 10kg rice, 5 blankets, school supplies..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder-white/30 focus:border-green-400/40 focus:ring-1 focus:ring-green-400/20 transition-all outline-none resize-none"
                  />
                </div>
              )}

              {/* Error / Success */}
              {donateError && (
                <div className="flex items-center space-x-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{donateError}</span>
                </div>
              )}
              {donateSuccess && (
                <div className="flex items-center space-x-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                  <i className="fas fa-check-circle"></i>
                  <span>{donateSuccess}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end space-x-3">
              <button
                onClick={() => setShowDonateModal(false)}
                className="px-4 py-2 text-sm text-green-200/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDonate}
                disabled={donating}
                className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {donating ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-donate mr-2"></i>
                    {donationType === "Goods"
                      ? "Submit Goods"
                      : `Donate LKR ${donateAmount ? Number(donateAmount).toLocaleString() : "0"}`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
      <ChatBubble user={user} />
    </div>
  );
};

export default DonorNeeds;
