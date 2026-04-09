import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  logout,
  getAllUsers,
  updateUserStatus,
  updateUser,
  deleteUser,
  getUnverifiedUsers,
  verifyUserDocument,
  getAdminDashStats,
} from "../../services/authService";
import * as needService from "../../services/needService";
import * as itemService from "../../services/itemService";
import { getFeedbacks } from "../../services/feedbackService";
import { getImageUrl } from "../../services/itemService";
import { getReviews } from "../../services/reviewService";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const isWithinDateRange = (dateValue, startDate, endDate) => {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);
    if (date < start) return false;
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`);
    if (date > end) return false;
  }

  return true;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const profileMenuRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sidebar navigation items
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: "fa-chart-pie" },
    { id: "users", label: "Users", icon: "fa-users" },
    {
      id: "needRequests",
      label: "Need Requests",
      icon: "fa-hand-holding-heart",
    },
    { id: "verifications", label: "Verifications", icon: "fa-user-check" },
    { id: "fulfilledNeeds", label: "Fulfilled Needs", icon: "fa-check-double" },
    { id: "itemListings", label: "Item Listings", icon: "fa-gift" },
    { id: "reviews", label: "Reviews", icon: "fa-comment-dots" },
    { id: "reports", label: "Reports", icon: "fa-file-alt" },
  ];

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    role: "",
    isVerified: false,
    isActive: true,
  });

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  // Unverified users state
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [unverifiedLoading, setUnverifiedLoading] = useState(false);

  // Document viewing modal
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingUser, setRejectingUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Pending need requests state
  const [pendingNeeds, setPendingNeeds] = useState([]);
  const [pendingNeedsLoading, setPendingNeedsLoading] = useState(false);
  const [needActionLoading, setNeedActionLoading] = useState(null);

  // Fulfilled needs state
  const [fulfilledNeeds, setFulfilledNeeds] = useState([]);
  const [fulfilledNeedsLoading, setFulfilledNeedsLoading] = useState(false);

  // Platform reviews state
  const [platformReviews, setPlatformReviews] = useState([]);
  const [platformReviewsLoading, setPlatformReviewsLoading] = useState(false);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [feedbackReviews, setFeedbackReviews] = useState([]);
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [interactionFilters, setInteractionFilters] = useState({
    userId: "all",
    startDate: "",
    endDate: "",
  });

  // Dashboard stats from backend
  const [dashStats, setDashStats] = useState(null);

  // Item Listings state (admin)
  const [allItems, setAllItems] = useState([]);
  const [allItemsLoading, setAllItemsLoading] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("all");
  const [itemStatusFilter, setItemStatusFilter] = useState("all");
  const [itemCurrentPage, setItemCurrentPage] = useState(1);
  const itemsPerPageListing = 10;

  // Search, Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter users based on search and filters
  const filteredUsers = users.filter((u) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive !== false) ||
      (statusFilter === "inactive" && u.isActive === false);

    // Verified filter
    const matchesVerified =
      verifiedFilter === "all" ||
      (verifiedFilter === "verified" && u.isVerified) ||
      (verifiedFilter === "pending" && !u.isVerified);

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
    totalDonors: users.filter((u) => u.role === "Donor").length,
    totalRecipients: users.filter((u) => u.role === "Recipient").length,
    totalAdmins: users.filter((u) => u.role === "Admin").length,
    activeUsers: users.filter((u) => u.isActive !== false).length,
    inactiveUsers: users.filter((u) => u.isActive === false).length,
    pendingVerifications: unverifiedUsers.filter(
      (u) => u.documentStatus === "pending",
    ).length,
  };

  const reviews = feedbackReviews;
  const needRequests = [...pendingNeeds, ...fulfilledNeeds];

  const reviewsByFeedbackId = feedbackReviews.reduce((acc, review) => {
    const key = String(review.feedback);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(review);
    return acc;
  }, {});

  const feedbackThreads = feedbackEntries.map((feedback) => ({
    ...feedback,
    reviews: reviewsByFeedbackId[String(feedback._id)] || [],
  }));

 const interactionUsers = Array.from(
    new Map(
      [...feedbackEntries, ...feedbackReviews]
        .map((entry) => entry.user)
        .filter(Boolean)
        .map((entryUser) => [String(entryUser._id), entryUser]),
    ).values(),
  ).sort((a, b) => (a.username || "").localeCompare(b.username || ""));

  const hasInteractionFilters =
    interactionFilters.userId !== "all" ||
    interactionFilters.startDate !== "" ||
    interactionFilters.endDate !== "";

  const filteredFeedbackThreads = hasInteractionFilters
    ? feedbackThreads
        .map((thread) => {
          const matchesSelectedUser =
            interactionFilters.userId === "all" ||
            String(thread.user?._id) === interactionFilters.userId;
          const matchesSelectedDate = isWithinDateRange(
            thread.createdAt,
            interactionFilters.startDate,
            interactionFilters.endDate,
          );

          const matchingReviews = thread.reviews.filter((review) => {
            const reviewMatchesUser =
              interactionFilters.userId === "all" ||
              String(review.user?._id) === interactionFilters.userId;
            const reviewMatchesDate = isWithinDateRange(
              review.createdAt,
              interactionFilters.startDate,
              interactionFilters.endDate,
            );

            return reviewMatchesUser && reviewMatchesDate;
          });

          if (matchesSelectedUser && matchesSelectedDate) {
            return {
              ...thread,
              reviews: matchingReviews,
              matchedBy: "feedback",
            };
          }

          if (matchingReviews.length > 0) {
            return {
              ...thread,
              reviews: matchingReviews,
              matchedBy: "review",
            };
          }

          return null;
        })
        .filter(Boolean)
    : [];

  const recentMonthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`,
    };
  });

  const monthlyInteractionData = recentMonthKeys.map(({ key, label }) => {
    const feedbackCount = feedbackEntries.filter((feedback) => {
      const date = new Date(feedback.createdAt);
      return (
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` ===
        key
      );
    }).length;

    const reviewCount = feedbackReviews.filter((review) => {
      const date = new Date(review.createdAt);
      return (
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` ===
        key
      );
    }).length;

    return {
      key,
      label,
      feedbackCount,
      reviewCount,
      totalInteractions: feedbackCount + reviewCount,
    };
  });

  const maxMonthlyInteractions = Math.max(
    ...monthlyInteractionData.map((entry) => entry.totalInteractions),
    1,
  );
  const currentMonthInteractions =
    monthlyInteractionData[monthlyInteractionData.length - 1] || null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        // Verify admin role
        if (profile.role !== "Admin") {
          navigate("/dashboard");
          return;
        }
        setUser(profile);
        // Fetch users after verifying admin
        fetchUsers();
        fetchUnverifiedUsers();
        fetchPendingNeeds();
        fetchFulfilledNeeds();
        fetchPlatformReviews();
        fetchFeedbackInteractions();
        fetchDashStats();
        fetchAllItems();
      } catch (err) {
        navigate("/login");
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
      console.error("Error fetching users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch unverified users
  const fetchUnverifiedUsers = async () => {
    setUnverifiedLoading(true);
    try {
      const unverified = await getUnverifiedUsers();
      setUnverifiedUsers(unverified);
    } catch (err) {
      console.error("Error fetching unverified users:", err);
    } finally {
      setUnverifiedLoading(false);
    }
  };

  // Fetch pending need requests
  const fetchPendingNeeds = async () => {
    setPendingNeedsLoading(true);
    try {
      const needs = await needService.getPendingNeeds();
      setPendingNeeds(Array.isArray(needs) ? needs : []);
    } catch (err) {
      console.error("Error fetching pending needs:", err);
    } finally {
      setPendingNeedsLoading(false);
    }
  };

  // Approve a need request
  const handleApproveNeed = async (needId) => {
    setNeedActionLoading(needId);
    try {
      await needService.approveNeed(needId);
      await fetchPendingNeeds();
    } catch (err) {
      console.error("Error approving need:", err);
    } finally {
      setNeedActionLoading(null);
    }
  };

  const fetchFulfilledNeeds = async () => {
    setFulfilledNeedsLoading(true);
    try {
      const needs = await needService.getFulfilledNeeds();
      setFulfilledNeeds(Array.isArray(needs) ? needs : []);
    } catch (err) {
      console.error("Error fetching fulfilled needs:", err);
    } finally {
      setFulfilledNeedsLoading(false);
    }
  };

  const fetchPlatformReviews = async () => {
    setPlatformReviewsLoading(true);
    try {
      const reviews = await needService.getPlatformReviews();
      setPlatformReviews(Array.isArray(reviews) ? reviews : []);
    } catch (err) {
      console.error("Error fetching platform reviews:", err);
    } finally {
      setPlatformReviewsLoading(false);
    }
  };

  const fetchFeedbackInteractions = async () => {
    setInteractionLoading(true);
    try {
      const [allFeedbacks, allReviews] = await Promise.all([
        getFeedbacks(),
        getReviews(),
      ]);
      setFeedbackEntries(Array.isArray(allFeedbacks) ? allFeedbacks : []);
      setFeedbackReviews(Array.isArray(allReviews) ? allReviews : []);
    } catch (err) {
      console.error("Error fetching feedback interactions:", err);
    } finally {
      setInteractionLoading(false);
    }
  };

  const fetchDashStats = async () => {
    try {
      const data = await getAdminDashStats();
      setDashStats(data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  const fetchAllItems = async () => {
    setAllItemsLoading(true);
    try {
      const data = await itemService.getAllItems();
      setAllItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching all items:", err);
    } finally {
      setAllItemsLoading(false);
    }
  };

  // Handle toggle user status (active/deactive)
  const handleToggleStatus = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      await updateUserStatus(userId, !currentStatus);
      // Refresh users list
      await fetchUsers();
      toast.success(
        `User ${currentStatus ? "deactivated" : "activated"} successfully.`,
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      toast.error(err.response?.data?.error || "Failed to update user status.");
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
      toast.success("User updated successfully.");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(err.response?.data?.error || "Failed to update user.");
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
      toast.success("User deleted successfully.");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.response?.data?.error || "Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  // View user document
  const handleViewDocument = (userToView) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const docUrl = `${API_URL}/documents/admin/document/${userToView._id}?token=${token}`;
    setViewingDocument(userToView);
    setDocumentUrl(docUrl);
    setShowDocumentModal(true);
  };

  // Approve user document
  const handleApproveDocument = async (userId) => {
    setActionLoading(userId);
    try {
      await verifyUserDocument(userId, true);
      await fetchUnverifiedUsers();
      await fetchUsers();
      setShowDocumentModal(false);
      setViewingDocument(null);
      toast.success("Document approved successfully.");
    } catch (err) {
      console.error("Error approving document:", err);
      toast.error(err.response?.data?.error || "Failed to approve document.");
    } finally {
      setActionLoading(null);
    }
  };

  // Open reject modal
  const handleRejectClick = (userToReject) => {
    setRejectingUser(userToReject);
    setRejectionReason("");
    setShowRejectModal(true);
    setShowDocumentModal(false);
  };

  // Confirm rejection
  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      return;
    }
    setActionLoading(rejectingUser._id);
    try {
      await verifyUserDocument(rejectingUser._id, false, rejectionReason);
      await fetchUnverifiedUsers();
      await fetchUsers();
      setShowRejectModal(false);
      setRejectingUser(null);
      setRejectionReason("");
      toast.success("Document rejected and user notified.");
    } catch (err) {
      console.error("Error rejecting document:", err);
      toast.error(err.response?.data?.error || "Failed to reject document.");
    } finally {
      setActionLoading(null);
    }
  };

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
    if (!name) return "A";
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

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-30 bg-[#0A1A2F]/95 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
        style={{ borderRadius: "0 1.5rem 1.5rem 0" }}
      >
        {/* Collapse Toggle - Top Right Edge */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-7 z-40 w-6 h-6 rounded-full bg-[#0A1A2F] border border-white/20 flex items-center justify-center text-green-300/70 hover:text-white hover:bg-green-600 transition-all duration-200 shadow-lg"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i
            className={`fas fa-chevron-${sidebarCollapsed ? "right" : "left"} text-[10px]`}
          ></i>
        </button>

        {/* Logo & Brand */}
        <div
          className={`flex items-center h-16 mt-3 border-b border-white/10 ${
            sidebarCollapsed ? "justify-center px-2" : "px-5"
          }`}
        >
          <div className="w-10 h-10 min-w-[2.5rem] rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/30 flex items-center justify-center text-white">
            <i className="fas fa-hand-holding-heart text-lg"></i>
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 overflow-hidden">
              <h1 className="text-lg font-light text-white tracking-wider whitespace-nowrap">
                Bridge
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                  Connect
                </span>
              </h1>
              <span className="text-[10px] text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-full font-medium">
                <i className="fas fa-shield-alt mr-1"></i>Admin
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center rounded-xl transition-all duration-200 group ${
                sidebarCollapsed ? "justify-center px-2 py-3" : "px-4 py-3"
              } ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white shadow-lg shadow-green-500/20"
                  : "text-green-200/60 hover:bg-white/10 hover:text-white"
              }`}
              title={sidebarCollapsed ? item.label : ""}
            >
              <i
                className={`fas ${item.icon} text-base ${
                  sidebarCollapsed ? "" : "w-6"
                } ${
                  activeTab === item.id
                    ? "text-white"
                    : "text-green-300/60 group-hover:text-white"
                }`}
              ></i>
              {!sidebarCollapsed && (
                <span className="ml-3 text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Bottom - Logout */}
        <div className="border-t border-white/10 p-3 mb-3 space-y-1">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 ${
              sidebarCollapsed ? "justify-center px-2 py-3" : "px-4 py-3"
            }`}
            title={sidebarCollapsed ? "Sign Out" : ""}
          >
            <i
              className={`fas fa-sign-out-alt text-base ${sidebarCollapsed ? "" : "w-6"}`}
            ></i>
            {!sidebarCollapsed && (
              <span className="ml-3 text-sm font-medium">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}
      >
        {/* Top Bar */}
        <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Page Title */}
              <div>
                <h2 className="text-xl font-light text-white">
                  {sidebarItems.find((i) => i.id === activeTab)?.label ||
                    "Dashboard"}
                </h2>
              </div>

              {/* Profile Section */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-2 px-4 transition-all duration-300 group"
                >
                  <span className="text-sm text-green-200/80 group-hover:text-white transition-colors hidden sm:block">
                    {user?.username || "Admin"}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-orange-500/30">
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
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/30">
                          {getInitials(user?.username)}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user?.username}
                          </p>
                          <p className="text-xs text-orange-400">
                            Administrator
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
        <main className="relative z-10 px-6 lg:px-8 py-8">
          {/* Tab Content */}
          <div className="w-full">
            {/* Main Content Area - Full Width */}
            <div className="w-full">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stat Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-200/50 mb-1">
                            Total Users
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {stats.totalUsers}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <i className="fas fa-users text-blue-400 text-xl"></i>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center space-x-4 text-[11px]">
                        <span className="text-blue-400">
                          <i className="fas fa-circle text-[6px] mr-1"></i>
                          {stats.totalDonors} Donors
                        </span>
                        <span className="text-purple-400">
                          <i className="fas fa-circle text-[6px] mr-1"></i>
                          {stats.totalRecipients} Recipients
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-200/50 mb-1">
                            Need Requests
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {dashStats?.totalNeeds || 0}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <i className="fas fa-hand-holding-heart text-green-400 text-xl"></i>
                        </div>
                      </div>
                      <div className="mt-3 text-[11px]">
                        <span className="text-orange-400">
                          <i className="fas fa-clock text-[10px] mr-1"></i>
                          {pendingNeeds.length} Pending
                        </span>
                        <span className="text-green-400 ml-3">
                          <i className="fas fa-check-circle text-[10px] mr-1"></i>
                          {fulfilledNeeds.length} Fulfilled
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-200/50 mb-1">
                            Item Listings
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {allItems.length}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                          <i className="fas fa-gift text-cyan-400 text-xl"></i>
                        </div>
                      </div>
                      <div className="mt-3 text-[11px]">
                        <span className="text-green-400">
                          <i className="fas fa-circle text-[6px] mr-1"></i>
                          {
                            allItems.filter((i) => i.status === "Available")
                              .length
                          }{" "}
                          Available
                        </span>
                        <span className="text-yellow-400 ml-3">
                          <i className="fas fa-circle text-[6px] mr-1"></i>
                          {
                            allItems.filter((i) => i.status === "Reserved")
                              .length
                          }{" "}
                          Reserved
                        </span>
                        <span className="text-purple-400 ml-3">
                          <i className="fas fa-circle text-[6px] mr-1"></i>
                          {
                            allItems.filter((i) => i.status === "Claimed")
                              .length
                          }{" "}
                          Claimed
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-200/50 mb-1">
                            Verifications
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {unverifiedUsers.length}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                          <i className="fas fa-user-check text-orange-400 text-xl"></i>
                        </div>
                      </div>
                      <div className="mt-3 text-[11px]">
                        <span className="text-orange-400">
                          <i className="fas fa-clock text-[10px] mr-1"></i>
                          {stats.pendingVerifications} Pending Review
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Reviews + Quick Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Platform Reviews Summary */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center">
                          <i className="fas fa-star text-yellow-400 mr-2"></i>
                          Recent Reviews
                          {platformReviews.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-[10px] bg-yellow-500/15 text-yellow-400 rounded-full">
                              {platformReviews.length}
                            </span>
                          )}
                        </h3>
                        <button
                          onClick={() => setActiveTab("reviews")}
                          className="text-[11px] text-green-400 hover:underline"
                        >
                          View All <i className="fas fa-arrow-right ml-1"></i>
                        </button>
                      </div>
                      {platformReviews.length === 0 ? (
                        <p className="text-sm text-green-200/40 text-center py-6">
                          No reviews yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {platformReviews.slice(0, 3).map((review) => (
                            <div
                              key={review._id}
                              className="flex items-start space-x-3 p-3 bg-white/5 rounded-xl"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {review.user?.username
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-white font-medium truncate">
                                    {review.user?.username}
                                  </p>
                                  <div className="flex items-center space-x-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <i
                                        key={s}
                                        className={`fas fa-star text-[8px] ${s <= review.rating ? "text-yellow-400" : "text-white/10"}`}
                                      ></i>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-[11px] text-green-200/50 mt-0.5 line-clamp-2">
                                  {review.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                      <h3 className="text-sm font-semibold text-white flex items-center mb-4">
                        <i className="fas fa-bolt text-yellow-400 mr-2"></i>
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setActiveTab("users")}
                          className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fas fa-users text-blue-400 text-sm"></i>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-white font-medium">
                              Manage Users
                            </p>
                            <p className="text-[10px] text-green-200/40">
                              {stats.totalUsers} total
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab("needRequests")}
                          className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fas fa-clock text-orange-400 text-sm"></i>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-white font-medium">
                              Pending Needs
                            </p>
                            <p className="text-[10px] text-green-200/40">
                              {pendingNeeds.length} to review
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab("verifications")}
                          className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fas fa-user-check text-green-400 text-sm"></i>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-white font-medium">
                              Verifications
                            </p>
                            <p className="text-[10px] text-green-200/40">
                              {stats.pendingVerifications} pending
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab("itemListings")}
                          className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fas fa-gift text-cyan-400 text-sm"></i>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-white font-medium">
                              Item Listings
                            </p>
                            <p className="text-[10px] text-green-200/40">
                              {allItems.length} items
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Third Row: Monthly Donations + User Growth */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Monthly Donations */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                      <h3 className="text-sm font-semibold text-white flex items-center mb-4">
                        <i className="fas fa-chart-bar text-green-400 mr-2"></i>
                        Monthly Donations
                      </h3>
                      {dashStats?.monthlyDonations?.length > 0 ? (
                        <div className="space-y-2">
                          {[
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ].map((month, idx) => {
                            const entry = dashStats.monthlyDonations.find(
                              (d) => d._id === idx + 1,
                            );
                            const amount = entry?.totalAmount || 0;
                            const max = Math.max(
                              ...dashStats.monthlyDonations.map(
                                (d) => d.totalAmount,
                              ),
                              1,
                            );
                            return (
                              <div
                                key={month}
                                className="flex items-center space-x-3"
                              >
                                <span className="text-[10px] text-green-200/50 w-7">
                                  {month}
                                </span>
                                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-600 to-emerald-400 rounded-full transition-all"
                                    style={{
                                      width: `${(amount / max) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-[10px] text-green-200/60 w-16 text-right">
                                  Rs. {amount.toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-green-200/40 text-center py-6">
                          No donation data yet
                        </p>
                      )}
                    </div>

                    {/* User Growth */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                      <h3 className="text-sm font-semibold text-white flex items-center mb-4">
                        <i className="fas fa-chart-line text-blue-400 mr-2"></i>
                        User Growth
                      </h3>
                      {dashStats?.monthlyGrowth?.length > 0 ? (
                        <div className="space-y-2">
                          {[
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ].map((month, idx) => {
                            const entry = dashStats.monthlyGrowth.find(
                              (d) => d._id === idx + 1,
                            );
                            const count = entry?.totalUsers || 0;
                            const max = Math.max(
                              ...dashStats.monthlyGrowth.map(
                                (d) => d.totalUsers,
                              ),
                              1,
                            );
                            return (
                              <div
                                key={month}
                                className="flex items-center space-x-3"
                              >
                                <span className="text-[10px] text-green-200/50 w-7">
                                  {month}
                                </span>
                                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all"
                                    style={{ width: `${(count / max) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-[10px] text-green-200/60 w-10 text-right">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-green-200/40 text-center py-6">
                          No user growth data yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
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
                          onClick={() => setSearchQuery("")}
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
                        <label className="text-xs text-green-200/50 whitespace-nowrap">
                          Role:
                        </label>
                        <select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:border-green-400 focus:outline-none cursor-pointer"
                        >
                          <option value="all" className="bg-[#0D2B3E]">
                            All Roles
                          </option>
                          <option value="Admin" className="bg-[#0D2B3E]">
                            Admin
                          </option>
                          <option value="Donor" className="bg-[#0D2B3E]">
                            Donor
                          </option>
                          <option value="Recipient" className="bg-[#0D2B3E]">
                            Recipient
                          </option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-green-200/50 whitespace-nowrap">
                          Status:
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:border-green-400 focus:outline-none cursor-pointer"
                        >
                          <option value="all" className="bg-[#0D2B3E]">
                            All Status
                          </option>
                          <option value="active" className="bg-[#0D2B3E]">
                            Active
                          </option>
                          <option value="inactive" className="bg-[#0D2B3E]">
                            Inactive
                          </option>
                        </select>
                      </div>

                      {/* Verified Filter */}
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-green-200/50 whitespace-nowrap">
                          Verified:
                        </label>
                        <select
                          value={verifiedFilter}
                          onChange={(e) => setVerifiedFilter(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:border-green-400 focus:outline-none cursor-pointer"
                        >
                          <option value="all" className="bg-[#0D2B3E]">
                            All
                          </option>
                          <option value="verified" className="bg-[#0D2B3E]">
                            Verified
                          </option>
                          <option value="pending" className="bg-[#0D2B3E]">
                            Pending
                          </option>
                        </select>
                      </div>

                      {/* Items Per Page */}
                      <div className="flex items-center space-x-2 ml-auto">
                        <label className="text-xs text-green-200/50 whitespace-nowrap">
                          Show:
                        </label>
                        <select
                          value={itemsPerPage}
                          onChange={(e) =>
                            setItemsPerPage(Number(e.target.value))
                          }
                          className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:border-green-400 focus:outline-none cursor-pointer"
                        >
                          <option value={5} className="bg-[#0D2B3E]">
                            5
                          </option>
                          <option value={10} className="bg-[#0D2B3E]">
                            10
                          </option>
                          <option value={25} className="bg-[#0D2B3E]">
                            25
                          </option>
                          <option value={50} className="bg-[#0D2B3E]">
                            50
                          </option>
                        </select>
                      </div>

                      {/* Clear Filters */}
                      {(searchQuery ||
                        roleFilter !== "all" ||
                        statusFilter !== "all" ||
                        verifiedFilter !== "all") && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setRoleFilter("all");
                            setStatusFilter("all");
                            setVerifiedFilter("all");
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
                        Showing{" "}
                        {filteredUsers.length === 0 ? 0 : startIndex + 1} -{" "}
                        {Math.min(endIndex, filteredUsers.length)} of{" "}
                        {filteredUsers.length} users
                        {filteredUsers.length !== users.length &&
                          ` (filtered from ${users.length} total)`}
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
                                <td
                                  colSpan="6"
                                  className="py-8 text-center text-green-200/50"
                                >
                                  {searchQuery ||
                                  roleFilter !== "all" ||
                                  statusFilter !== "all" ||
                                  verifiedFilter !== "all"
                                    ? "No users match your filters"
                                    : "No users found"}
                                </td>
                              </tr>
                            ) : (
                              paginatedUsers.map((u) => (
                                <tr
                                  key={u._id}
                                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                  <td className="py-3 pr-4">
                                    <div className="flex items-center space-x-3">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                          u.role === "Admin"
                                            ? "bg-gradient-to-br from-orange-500 to-amber-400"
                                            : "bg-gradient-to-br from-green-500 to-emerald-400"
                                        }`}
                                      >
                                        {u.username?.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-white text-sm font-medium">
                                          {u.username}
                                        </p>
                                        <p className="text-xs text-green-200/50">
                                          {u.email}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        u.role === "Admin"
                                          ? "text-orange-400 bg-orange-500/20"
                                          : u.role === "Donor"
                                            ? "text-green-400 bg-green-500/20"
                                            : "text-purple-400 bg-purple-500/20"
                                      }`}
                                    >
                                      {u.role}
                                    </span>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        u.isActive !== false
                                          ? "text-green-400 bg-green-500/20"
                                          : "text-red-400 bg-red-500/20"
                                      }`}
                                    >
                                      {u.isActive !== false
                                        ? "Active"
                                        : "Inactive"}
                                    </span>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        u.isVerified
                                          ? "text-blue-400 bg-blue-500/20"
                                          : "text-yellow-400 bg-yellow-500/20"
                                      }`}
                                    >
                                      {u.isVerified ? "Verified" : "Pending"}
                                    </span>
                                  </td>
                                  <td className="py-3 pr-4 text-sm text-green-200/70">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="py-3">
                                    <div className="flex items-center space-x-1">
                                      {/* Toggle Active/Inactive */}
                                      <button
                                        onClick={() =>
                                          handleToggleStatus(
                                            u._id,
                                            u.isActive !== false,
                                          )
                                        }
                                        disabled={actionLoading === u._id}
                                        className={`p-2 rounded-lg transition-colors ${
                                          u.isActive !== false
                                            ? "text-yellow-400 hover:bg-yellow-500/20"
                                            : "text-green-400 hover:bg-green-500/20"
                                        } disabled:opacity-50`}
                                        title={
                                          u.isActive !== false
                                            ? "Deactivate User"
                                            : "Activate User"
                                        }
                                      >
                                        {actionLoading === u._id ? (
                                          <i className="fas fa-spinner fa-spin text-xs"></i>
                                        ) : (
                                          <i
                                            className={`fas ${u.isActive !== false ? "fa-user-slash" : "fa-user-check"} text-xs`}
                                          ></i>
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
                                        title={
                                          u._id === user?._id
                                            ? "Cannot delete yourself"
                                            : "Delete User"
                                        }
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
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
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
                                {currentPage > 4 && (
                                  <span className="text-green-200/30 px-1">
                                    ...
                                  </span>
                                )}
                              </>
                            )}

                            {/* Page numbers around current */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(
                                (page) =>
                                  page >= currentPage - 2 &&
                                  page <= currentPage + 2,
                              )
                              .map((page) => (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`w-8 h-8 rounded-lg text-sm transition-all ${
                                    currentPage === page
                                      ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                                      : "text-green-200/70 hover:bg-white/10 hover:text-white"
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}

                            {/* Last page */}
                            {currentPage < totalPages - 2 && (
                              <>
                                {currentPage < totalPages - 3 && (
                                  <span className="text-green-200/30 px-1">
                                    ...
                                  </span>
                                )}
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
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages),
                              )
                            }
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

              {activeTab === "needRequests" && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <i className="fas fa-hand-holding-heart text-green-400 mr-2"></i>
                      Pending Need Requests
                      {pendingNeeds.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                          {pendingNeeds.length} Pending
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={fetchPendingNeeds}
                      className="px-4 py-2 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/10"
                    >
                      <i className="fas fa-refresh mr-2"></i>Refresh
                    </button>
                  </div>

                  {pendingNeedsLoading ? (
                    <div className="text-center py-12">
                      <i className="fas fa-spinner fa-spin text-3xl text-green-400 mb-3"></i>
                      <p className="text-green-200/70">
                        Loading pending requests...
                      </p>
                    </div>
                  ) : pendingNeeds.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <i className="fas fa-check-double text-4xl text-green-400"></i>
                      </div>
                      <p className="text-white font-medium">All caught up!</p>
                      <p className="text-green-200/50 text-sm mt-1">
                        No pending need requests to review.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Recipient
                            </th>
                            <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Title
                            </th>
                            <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Category
                            </th>
                            <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Urgency
                            </th>
                            <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Goal
                            </th>
                            <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Date
                            </th>
                            <th className="text-right text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingNeeds.map((need) => (
                            <tr
                              key={need._id}
                              className="border-b border-white/5 hover:bg-white/[0.04] transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center text-white text-xs font-bold">
                                    {need.recipient?.username
                                      ?.charAt(0)
                                      .toUpperCase() || "?"}
                                  </div>
                                  <div>
                                    <p className="text-sm text-white font-medium">
                                      {need.recipient?.username || "Unknown"}
                                    </p>
                                    <p className="text-[11px] text-green-200/40">
                                      {need.recipient?.email || ""}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-sm text-white truncate max-w-[180px]">
                                  {need.title}
                                </p>
                                <p className="text-[11px] text-green-200/40 truncate max-w-[180px]">
                                  {need.description}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-green-200/70">
                                  {need.category}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                    need.urgency === "Critical"
                                      ? "bg-red-500/20 text-red-400"
                                      : need.urgency === "High"
                                        ? "bg-orange-500/20 text-orange-400"
                                        : need.urgency === "Medium"
                                          ? "bg-yellow-500/20 text-yellow-400"
                                          : "bg-green-500/20 text-green-400"
                                  }`}
                                >
                                  {need.urgency}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-white font-medium whitespace-nowrap">
                                  LKR {need.goalAmount?.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-green-200/50">
                                  {new Date(
                                    need.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleApproveNeed(need._id)}
                                  disabled={needActionLoading === need._id}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {needActionLoading === need._id ? (
                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                  ) : (
                                    <i className="fas fa-check mr-1"></i>
                                  )}
                                  Approve
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "verifications" && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <i className="fas fa-user-check text-green-400 mr-2"></i>
                      User Verification
                      {stats.pendingVerifications > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                          {stats.pendingVerifications} Pending
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={fetchUnverifiedUsers}
                      className="px-4 py-2 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/10"
                    >
                      <i className="fas fa-refresh mr-2"></i>Refresh
                    </button>
                  </div>

                  {/* Status Filter Tabs */}
                  <div className="flex space-x-2 mb-6">
                    {["all", "pending", "not_uploaded", "rejected"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => {
                            /* Can add filter state if needed */
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : status === "not_uploaded"
                                ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                                : status === "rejected"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-white/10 text-white border border-white/10"
                          }`}
                        >
                          {status === "all"
                            ? "All"
                            : status === "pending"
                              ? `Pending (${unverifiedUsers.filter((u) => u.documentStatus === "pending").length})`
                              : status === "not_uploaded"
                                ? `Not Uploaded (${unverifiedUsers.filter((u) => u.documentStatus === "not_uploaded").length})`
                                : `Rejected (${unverifiedUsers.filter((u) => u.documentStatus === "rejected").length})`}
                        </button>
                      ),
                    )}
                  </div>

                  {unverifiedLoading ? (
                    <div className="text-center py-12">
                      <i className="fas fa-spinner fa-spin text-3xl text-green-400 mb-3"></i>
                      <p className="text-green-200/70">
                        Loading unverified users...
                      </p>
                    </div>
                  ) : unverifiedUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <i className="fas fa-check-double text-4xl text-green-400"></i>
                      </div>
                      <p className="text-white font-medium">
                        All users are verified!
                      </p>
                      <p className="text-green-200/50 text-sm mt-1">
                        No pending verifications at this time.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unverifiedUsers.map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                u.role === "Donor"
                                  ? "bg-gradient-to-br from-green-500 to-emerald-400"
                                  : "bg-gradient-to-br from-purple-500 to-violet-400"
                              }`}
                            >
                              {u.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="text-white font-medium">
                                  {u.username}
                                </p>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${
                                    u.role === "Donor"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-purple-500/20 text-purple-400"
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </div>
                              <p className="text-xs text-green-200/50">
                                {u.email}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${
                                    u.documentStatus === "pending"
                                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                      : u.documentStatus === "rejected"
                                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                                  }`}
                                >
                                  <i
                                    className={`fas ${
                                      u.documentStatus === "pending"
                                        ? "fa-clock"
                                        : u.documentStatus === "rejected"
                                          ? "fa-times-circle"
                                          : "fa-upload"
                                    } mr-1`}
                                  ></i>
                                  {u.documentStatus === "pending"
                                    ? "Document Pending Review"
                                    : u.documentStatus === "rejected"
                                      ? "Document Rejected"
                                      : "No Document Uploaded"}
                                </span>
                                {u.nicDocument?.uploadedAt && (
                                  <span className="text-xs text-green-200/40">
                                    Uploaded:{" "}
                                    {new Date(
                                      u.nicDocument.uploadedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {u.documentStatus === "pending" &&
                              u.nicDocument?.filename && (
                                <>
                                  <button
                                    onClick={() => handleViewDocument(u)}
                                    className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                                  >
                                    <i className="fas fa-eye mr-1"></i>View
                                    Document
                                  </button>
                                  <button
                                    onClick={() => handleApproveDocument(u._id)}
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
                                  <button
                                    onClick={() => handleRejectClick(u)}
                                    disabled={actionLoading === u._id}
                                    className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30 disabled:opacity-50"
                                  >
                                    <i className="fas fa-times mr-1"></i>Reject
                                  </button>
                                </>
                              )}
                            {u.documentStatus === "rejected" && (
                              <span className="text-xs text-red-400/70 max-w-xs truncate">
                                <i className="fas fa-info-circle mr-1"></i>
                                {u.documentRejectionReason ||
                                  "Document was rejected"}
                              </span>
                            )}
                            {u.documentStatus === "not_uploaded" && (
                              <span className="text-xs text-gray-400">
                                <i className="fas fa-hourglass-half mr-1"></i>
                                Waiting for document upload
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "fulfilledNeeds" && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <i className="fas fa-check-double text-green-400 mr-2"></i>
                      Fulfilled Needs Log
                      {fulfilledNeeds.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          {fulfilledNeeds.length}
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={fetchFulfilledNeeds}
                      className="px-4 py-2 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/10"
                    >
                      <i className="fas fa-refresh mr-2"></i>Refresh
                    </button>
                  </div>

                  {fulfilledNeedsLoading ? (
                    <div className="text-center py-10">
                      <i className="fas fa-spinner fa-spin text-2xl text-green-400"></i>
                      <p className="text-sm text-green-200/50 mt-2">
                        Loading fulfilled needs...
                      </p>
                    </div>
                  ) : fulfilledNeeds.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                        <i className="fas fa-inbox text-xl text-green-200/30"></i>
                      </div>
                      <p className="text-white font-medium">
                        No fulfilled needs yet
                      </p>
                      <p className="text-xs text-green-200/40 mt-1">
                        Needs that reach their goal amount will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Recipient
                            </th>
                            <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Need Title
                            </th>
                            <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Category
                            </th>
                            <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Amount Raised
                            </th>
                            <th className="text-left text-[11px] text-green-200/50 font-medium uppercase tracking-wider px-4 py-3">
                              Date Fulfilled
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {fulfilledNeeds.map((need) => (
                            <tr
                              key={need._id}
                              className="border-b border-white/5 hover:bg-white/[0.04] transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                                    {need.recipient?.username
                                      ?.charAt(0)
                                      ?.toUpperCase() || "U"}
                                  </div>
                                  <div>
                                    <p className="text-sm text-white font-medium">
                                      {need.recipient?.username || "Unknown"}
                                    </p>
                                    <p className="text-[10px] text-green-200/40">
                                      {need.recipient?.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-sm text-white font-medium truncate max-w-[200px]">
                                  {need.title}
                                </p>
                                <p className="text-[11px] text-green-200/40 truncate max-w-[200px]">
                                  {need.description}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-green-200/70">
                                  {need.category}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-green-400 font-bold">
                                  LKR {need.currentAmount?.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-green-200/50">
                                  {new Date(need.updatedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Item Listings Tab */}
              {activeTab === "itemListings" &&
                (() => {
                  const filteredItemsList = allItems.filter((item) => {
                    const matchSearch =
                      itemSearchQuery === "" ||
                      item.title
                        ?.toLowerCase()
                        .includes(itemSearchQuery.toLowerCase()) ||
                      item.donor?.username
                        ?.toLowerCase()
                        .includes(itemSearchQuery.toLowerCase());
                    const matchCat =
                      itemCategoryFilter === "all" ||
                      item.category === itemCategoryFilter;
                    const matchStatus =
                      itemStatusFilter === "all" ||
                      item.status === itemStatusFilter;
                    return matchSearch && matchCat && matchStatus;
                  });
                  const itemTotalPages = Math.ceil(
                    filteredItemsList.length / itemsPerPageListing,
                  );
                  const paginatedItemsList = filteredItemsList.slice(
                    (itemCurrentPage - 1) * itemsPerPageListing,
                    itemCurrentPage * itemsPerPageListing,
                  );

                  return (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <i className="fas fa-gift text-cyan-400 mr-2"></i>
                          All Item Listings
                          <span className="ml-2 px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">
                            {filteredItemsList.length}
                          </span>
                        </h3>
                        <button
                          onClick={fetchAllItems}
                          className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-green-200/60 hover:text-white transition-all"
                        >
                          <i className="fas fa-sync-alt mr-1"></i>Refresh
                        </button>
                      </div>

                      {/* Search & Filters */}
                      <div className="flex flex-col sm:flex-row gap-3 mb-5">
                        <div className="flex-1 relative">
                          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-green-300/40"></i>
                          <input
                            type="text"
                            placeholder="Search by title or donor..."
                            value={itemSearchQuery}
                            onChange={(e) => {
                              setItemSearchQuery(e.target.value);
                              setItemCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-cyan-400/40 outline-none text-sm"
                          />
                        </div>
                        <select
                          value={itemCategoryFilter}
                          onChange={(e) => {
                            setItemCategoryFilter(e.target.value);
                            setItemCurrentPage(1);
                          }}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none [&>option]:bg-[#0D2B3E]"
                        >
                          <option value="all">All Categories</option>
                          {[
                            "Electronics",
                            "Clothing",
                            "Furniture",
                            "Books",
                            "Kitchen",
                            "Toys",
                            "Sports",
                            "Other",
                          ].map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <select
                          value={itemStatusFilter}
                          onChange={(e) => {
                            setItemStatusFilter(e.target.value);
                            setItemCurrentPage(1);
                          }}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none [&>option]:bg-[#0D2B3E]"
                        >
                          <option value="all">All Status</option>
                          <option value="Available">Available</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Claimed">Claimed</option>
                        </select>
                      </div>

                      {allItemsLoading ? (
                        <div className="text-center py-10">
                          <i className="fas fa-spinner fa-spin text-2xl text-cyan-400"></i>
                          <p className="text-sm text-green-200/50 mt-2">
                            Loading items...
                          </p>
                        </div>
                      ) : paginatedItemsList.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                            <i className="fas fa-box-open text-xl text-green-200/30"></i>
                          </div>
                          <p className="text-white font-medium">
                            No items found
                          </p>
                          <p className="text-xs text-green-200/40 mt-1">
                            Try adjusting your filters
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-white/10">
                                  <th className="px-4 py-3 text-left text-xs text-green-200/60 font-medium">
                                    Item
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs text-green-200/60 font-medium">
                                    Donor
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs text-green-200/60 font-medium">
                                    Category
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs text-green-200/60 font-medium">
                                    Condition
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs text-green-200/60 font-medium">
                                    Status
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs text-green-200/60 font-medium">
                                    Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedItemsList.map((item) => (
                                  <tr
                                    key={item._id}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                  >
                                    <td className="px-4 py-3">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                                          {item.images &&
                                          item.images.length > 0 ? (
                                            <img
                                              src={getImageUrl(item.images[0])}
                                              alt=""
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <i className="fas fa-box text-green-200/20"></i>
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-sm text-white font-medium truncate max-w-[180px]">
                                            {item.title}
                                          </p>
                                          <p className="text-[10px] text-green-200/40 truncate max-w-[180px]">
                                            {item.description}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white text-[9px] font-bold">
                                          {item.donor?.username
                                            ?.charAt(0)
                                            ?.toUpperCase() || "D"}
                                        </div>
                                        <span className="text-xs text-green-200/60">
                                          {item.donor?.username || "—"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="px-2 py-0.5 bg-white/5 rounded text-[11px] text-green-200/60">
                                        {item.category}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-green-200/60">
                                      {item.condition}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                          item.status === "Available"
                                            ? "bg-green-500/15 text-green-400"
                                            : item.status === "Reserved"
                                              ? "bg-yellow-500/15 text-yellow-400"
                                              : "bg-purple-500/15 text-purple-400"
                                        }`}
                                      >
                                        {item.status}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-[11px] text-green-200/40">
                                      {new Date(
                                        item.createdAt,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination */}
                          {itemTotalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                              <button
                                onClick={() =>
                                  setItemCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={itemCurrentPage === 1}
                                className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-green-200/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                <i className="fas fa-chevron-left mr-1"></i>Prev
                              </button>
                              {Array.from(
                                { length: itemTotalPages },
                                (_, i) => i + 1,
                              ).map((page) => (
                                <button
                                  key={page}
                                  onClick={() => setItemCurrentPage(page)}
                                  className={`w-8 h-8 text-xs rounded-lg border transition-all ${
                                    itemCurrentPage === page
                                      ? "bg-gradient-to-r from-cyan-500 to-blue-400 text-white border-transparent shadow-lg shadow-cyan-500/20"
                                      : "bg-white/5 border-white/10 text-green-200/60 hover:bg-white/10"
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                              <button
                                onClick={() =>
                                  setItemCurrentPage((p) =>
                                    Math.min(itemTotalPages, p + 1),
                                  )
                                }
                                disabled={itemCurrentPage === itemTotalPages}
                                className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-green-200/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                Next
                                <i className="fas fa-chevron-right ml-1"></i>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <i className="fas fa-chart-line text-green-400 mr-2"></i>
                          Monthly Interaction Analysis
                        </h3>
                        <p className="text-xs text-green-200/50 mt-1">
                          Track how many feedbacks and reviews users add each
                          month.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          fetchFeedbackInteractions();
                          fetchPlatformReviews();
                        }}
                        className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-green-200/60 hover:text-white transition-all"
                      >
                        <i className="fas fa-sync-alt mr-1"></i>Refresh
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-green-200/50 mb-1">
                          Total Feedbacks
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {feedbackEntries.length}
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-green-200/50 mb-1">
                          Total Reviews
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {feedbackReviews.length}
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-green-200/50 mb-1">
                          This Month
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {currentMonthInteractions?.totalInteractions || 0}
                        </p>
                        <p className="text-[11px] text-green-200/40 mt-1">
                          {currentMonthInteractions?.feedbackCount || 0} feedbacks
                          {" · "}
                          {currentMonthInteractions?.reviewCount || 0} reviews
                        </p>
                      </div>
                    </div>

                    {interactionLoading ? (
                      <div className="text-center py-10">
                        <i className="fas fa-spinner fa-spin text-2xl text-green-400"></i>
                        <p className="text-sm text-green-200/50 mt-2">
                          Loading interaction analysis...
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
                        {monthlyInteractionData.map((entry) => (
                          <div
                            key={entry.key}
                            className="bg-white/5 border border-white/10 rounded-xl p-4"
                          >
                            <div className="flex items-end justify-between gap-3 h-28 mb-3">
                              <div className="flex items-end gap-2 h-full">
                                <div className="w-4 h-full bg-white/5 rounded-full overflow-hidden flex items-end">
                                  <div
                                    className="w-full bg-green-500 rounded-full"
                                    style={{
                                      height: `${(entry.feedbackCount / maxMonthlyInteractions) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="w-4 h-full bg-white/5 rounded-full overflow-hidden flex items-end">
                                  <div
                                    className="w-full bg-yellow-400 rounded-full"
                                    style={{
                                      height: `${(entry.reviewCount / maxMonthlyInteractions) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-semibold text-white">
                                  {entry.totalInteractions}
                                </p>
                                <p className="text-[10px] text-green-200/40">
                                  interactions
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-white font-medium">
                              {entry.label}
                            </p>
                            <p className="text-[11px] text-green-200/40 mt-1">
                              {entry.feedbackCount} feedbacks · {entry.reviewCount} reviews
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <i className="fas fa-filter text-green-400 mr-2"></i>
                          Filter Feedbacks And Reviews
                        </h3>
                        <p className="text-xs text-green-200/50 mt-1">
                          Feedback threads appear only after the admin selects a
                          user or date filter.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setInteractionFilters({
                            userId: "all",
                            startDate: "",
                            endDate: "",
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-green-200/60 hover:text-white transition-all"
                      >
                        <i className="fas fa-eraser mr-1"></i>Clear Filters
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-xs text-green-200/70 mb-2">
                          User
                        </label>
                        <select
                          value={interactionFilters.userId}
                          onChange={(e) =>
                            setInteractionFilters((prev) => ({
                              ...prev,
                              userId: e.target.value,
                            }))
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:border-green-400 focus:outline-none"
                        >
                          <option value="all" className="bg-[#0D2B3E]">
                            All users
                          </option>
                          {interactionUsers.map((entryUser) => (
                            <option
                              key={entryUser._id}
                              value={entryUser._id}
                              className="bg-[#0D2B3E]"
                            >
                              {entryUser.username} ({entryUser.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-green-200/70 mb-2">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={interactionFilters.startDate}
                          onChange={(e) =>
                            setInteractionFilters((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:border-green-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-green-200/70 mb-2">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={interactionFilters.endDate}
                          min={interactionFilters.startDate || undefined}
                          onChange={(e) =>
                            setInteractionFilters((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:border-green-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {!hasInteractionFilters ? (
                      <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.03]">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                          <i className="fas fa-sliders-h text-xl text-green-200/30"></i>
                        </div>
                        <p className="text-white font-medium">
                          Select at least one filter to view feedback threads
                        </p>
                        <p className="text-xs text-green-200/40 mt-1">
                          You can filter by user, start date, end date, or any
                          combination of them.
                        </p>
                      </div>
                    ) : filteredFeedbackThreads.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.03]">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                          <i className="fas fa-inbox text-xl text-green-200/30"></i>
                        </div>
                        <p className="text-white font-medium">
                          No feedbacks matched the selected filters
                        </p>
                        <p className="text-xs text-green-200/40 mt-1">
                          Try a wider date range or choose another user.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredFeedbackThreads.map((feedback) => (
                          <div
                            key={feedback._id}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-white font-medium">
                                    {feedback.user?.username || "Unknown User"}
                                  </p>
                                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/15 text-green-400">
                                    Feedback
                                  </span>
                                  {feedback.matchedBy === "review" && (
                                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-yellow-500/15 text-yellow-400">
                                      Matched by review
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-green-200/50 mt-1">
                                  {feedback.user?.email || "No email"} ·{" "}
                                  {feedback.need?.title || "Untitled Need"}
                                </p>
                              </div>
                              <div className="text-left lg:text-right">
                                <div className="flex items-center gap-1 lg:justify-end">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                      key={star}
                                      className={`fas fa-star text-xs ${
                                        star <= Number(feedback.rating || 0)
                                          ? "text-yellow-400"
                                          : "text-white/10"
                                      }`}
                                    ></i>
                                  ))}
                                </div>
                                <p className="text-[11px] text-green-200/40 mt-1">
                                  {new Date(feedback.createdAt).toLocaleDateString(
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

                            <div className="bg-white/5 rounded-xl px-4 py-3 border-l-2 border-green-400/30">
                              <p className="text-sm text-green-200/80">
                                {feedback.content}
                              </p>
                            </div>

                            {feedback.imageUrl && (
                              <div className="mt-4">
                                <img
                                  src={getImageUrl(feedback.imageUrl)}
                                  alt="Feedback"
                                  className="w-full max-w-sm rounded-xl border border-white/10"
                                />
                              </div>
                            )}

                            <div className="mt-5">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-white">
                                  Matching Reviews
                                </h4>
                                <span className="text-[11px] text-green-200/40">
                                  {feedback.reviews.length} shown
                                </span>
                              </div>

                              {feedback.reviews.length === 0 ? (
                                <div className="bg-white/[0.03] border border-dashed border-white/10 rounded-xl px-4 py-3">
                                  <p className="text-xs text-green-200/40">
                                    No reviews matched the current filters for
                                    this feedback.
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {feedback.reviews.map((review) => (
                                    <div
                                      key={review._id}
                                      className="bg-white/[0.04] border border-white/10 rounded-xl p-4"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div>
                                          <p className="text-sm text-white font-medium">
                                            {review.user?.username || "Unknown"}
                                          </p>
                                          <p className="text-[11px] text-green-200/40 mt-1">
                                            {review.user?.email || "No email"} ·{" "}
                                            {review.user?.role || "User"}
                                          </p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                          <div className="flex items-center gap-1 sm:justify-end">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <i
                                                key={star}
                                                className={`fas fa-star text-xs ${
                                                  star <= Number(review.rating || 0)
                                                    ? "text-yellow-400"
                                                    : "text-white/10"
                                                }`}
                                              ></i>
                                            ))}
                                          </div>
                                          <p className="text-[11px] text-green-200/40 mt-1">
                                            {new Date(review.createdAt).toLocaleDateString(
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
                                      <p className="text-sm text-green-200/70 mt-3">
                                        {review.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "reports" &&
                (() => {
                  const downloadCsv = (filename, headers, rows) => {
                    const escape = (v) =>
                      `"${String(v ?? "").replace(/"/g, '""')}"`;
                    const csv = [
                      headers.join(","),
                      ...rows.map((r) => r.map(escape).join(",")),
                    ].join("\n");
                    const blob = new Blob([csv], {
                      type: "text/csv;charset=utf-8;",
                    });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = filename;
                    link.click();
                    URL.revokeObjectURL(link.href);
                  };

                  const exportUsers = () => {
                    const headers = [
                      "Username",
                      "Email",
                      "Role",
                      "Phone",
                      "Verified",
                      "Created",
                    ];
                    const rows = users.map((u) => [
                      u.username,
                      u.email,
                      u.role,
                      u.phone || "",
                      u.isVerified ? "Yes" : "No",
                      new Date(u.createdAt).toLocaleDateString(),
                    ]);
                    downloadCsv(
                      `users_report_${Date.now()}.csv`,
                      headers,
                      rows,
                    );
                  };

                  const exportNeeds = () => {
                    const headers = [
                      "Title",
                      "Recipient",
                      "Category",
                      "Status",
                      "Urgency",
                      "Target Qty",
                      "Fulfilled Qty",
                      "Created",
                    ];
                    const rows = needRequests.map((n) => [
                      n.title,
                      n.recipient?.username || "",
                      n.category,
                      n.status,
                      n.urgencyLevel,
                      n.targetQuantity,
                      n.fulfilledQuantity,
                      new Date(n.createdAt).toLocaleDateString(),
                    ]);
                    downloadCsv(
                      `needs_report_${Date.now()}.csv`,
                      headers,
                      rows,
                    );
                  };

                  const exportItems = () => {
                    const headers = [
                      "Title",
                      "Donor",
                      "Category",
                      "Condition",
                      "Status",
                      "Created",
                    ];
                    const rows = allItems.map((i) => [
                      i.title,
                      i.donor?.username || "",
                      i.category,
                      i.condition,
                      i.status,
                      new Date(i.createdAt).toLocaleDateString(),
                    ]);
                    downloadCsv(
                      `items_report_${Date.now()}.csv`,
                      headers,
                      rows,
                    );
                  };

                  const exportReviews = () => {
                    const headers = [
                      "Reviewer",
                      "Rating",
                      "Comment",
                      "Created",
                    ];
                    const rows = reviews.map((r) => [
                      r.user?.username || "",
                      r.rating,
                      r.description || "",
                      new Date(r.createdAt).toLocaleDateString(),
                    ]);
                    downloadCsv(
                      `reviews_report_${Date.now()}.csv`,
                      headers,
                      rows,
                    );
                  };

                  return (
                    <div className="space-y-6">
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                          <i className="fas fa-file-alt text-green-400 mr-2"></i>
                          System Reports
                        </h3>
                        <p className="text-xs text-green-200/50 mb-6">
                          Export platform data as CSV files for analysis and
                          record keeping.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* User Report */}
                          <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <i className="fas fa-users text-blue-400"></i>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  User Report
                                </p>
                                <p className="text-[11px] text-green-200/50">
                                  {users.length} users
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-green-200/40 mb-4">
                              Usernames, emails, roles, verification status,
                              phone numbers and account creation dates.
                            </p>
                            <button
                              onClick={exportUsers}
                              disabled={users.length === 0}
                              className="w-full py-2 text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <i className="fas fa-download mr-1.5"></i>Download
                              CSV
                            </button>
                          </div>

                          {/* Need Requests Report */}
                          <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <i className="fas fa-hand-holding-heart text-green-400"></i>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  Need Requests Report
                                </p>
                                <p className="text-[11px] text-green-200/50">
                                  {needRequests.length} requests
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-green-200/40 mb-4">
                              Titles, recipients, categories, statuses, urgency
                              levels, target and fulfilled quantities.
                            </p>
                            <button
                              onClick={exportNeeds}
                              disabled={needRequests.length === 0}
                              className="w-full py-2 text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <i className="fas fa-download mr-1.5"></i>Download
                              CSV
                            </button>
                          </div>

                          {/* Item Listings Report */}
                          <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                <i className="fas fa-gift text-cyan-400"></i>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  Item Listings Report
                                </p>
                                <p className="text-[11px] text-green-200/50">
                                  {allItems.length} items
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-green-200/40 mb-4">
                              Titles, donors, categories, conditions,
                              availability statuses and listing dates.
                            </p>
                            <button
                              onClick={exportItems}
                              disabled={allItems.length === 0}
                              className="w-full py-2 text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-600 hover:to-blue-500 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <i className="fas fa-download mr-1.5"></i>Download
                              CSV
                            </button>
                          </div>

                          {/* Reviews Report */}
                          <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <i className="fas fa-star text-yellow-400"></i>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  Reviews Report
                                </p>
                                <p className="text-[11px] text-green-200/50">
                                  {reviews.length} reviews
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-green-200/40 mb-4">
                              Reviewer names, star ratings, comments, and
                              submission dates.
                            </p>
                            <button
                              onClick={exportReviews}
                              disabled={reviews.length === 0}
                              className="w-full py-2 text-xs font-medium bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-600 hover:to-amber-500 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <i className="fas fa-download mr-1.5"></i>Download
                              CSV
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>

          {/* Edit User Modal */}
          {showEditModal && editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-[#0D2B3E] border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    Edit User
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-green-200/50 hover:text-white transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-green-200/70 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editFormData.username}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          username: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-green-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-green-200/70 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-green-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-green-200/70 mb-1">
                      Role
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          role: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:border-green-400 focus:outline-none"
                    >
                      <option value="Donor" className="bg-[#0D2B3E]">
                        Donor
                      </option>
                      <option value="Recipient" className="bg-[#0D2B3E]">
                        Recipient
                      </option>
                      <option value="Admin" className="bg-[#0D2B3E]">
                        Admin
                      </option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.isVerified}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            isVerified: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500/20"
                      />
                      <span className="text-sm text-green-200/70">
                        Verified
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.isActive}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            isActive: e.target.checked,
                          })
                        }
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
                        "Save Changes"
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
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Delete User
                  </h3>
                  <p className="text-green-200/70 mb-6">
                    Are you sure you want to delete{" "}
                    <span className="text-white font-medium">
                      {deletingUser.username}
                    </span>
                    ? This action cannot be undone.
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
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Document Viewing Modal */}
          {showDocumentModal && viewingDocument && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-[#0D2B3E] border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        viewingDocument.role === "Donor"
                          ? "bg-gradient-to-br from-green-500 to-emerald-400"
                          : "bg-gradient-to-br from-purple-500 to-violet-400"
                      }`}
                    >
                      {viewingDocument.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {viewingDocument.username}'s ID Document
                      </h3>
                      <p className="text-xs text-green-200/50">
                        {viewingDocument.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDocumentModal(false);
                      setViewingDocument(null);
                      setDocumentUrl(null);
                    }}
                    className="text-green-200/50 hover:text-white transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                {/* Document Preview */}
                <div className="flex-1 overflow-auto p-6 bg-black/30">
                  {viewingDocument.nicDocument?.originalName
                    ?.toLowerCase()
                    .endsWith(".pdf") ? (
                    <div className="text-center">
                      <div className="mb-4">
                        <i className="fas fa-file-pdf text-6xl text-red-400"></i>
                      </div>
                      <p className="text-white mb-4">
                        PDF Document: {viewingDocument.nicDocument.originalName}
                      </p>
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-colors"
                      >
                        <i className="fas fa-external-link-alt mr-2"></i>
                        Open PDF in New Tab
                      </a>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <img
                        src={documentUrl}
                        alt="ID Document"
                        className="max-w-full max-h-[60vh] rounded-lg border border-white/10"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <div className="hidden text-center">
                        <i className="fas fa-exclamation-triangle text-4xl text-yellow-400 mb-4"></i>
                        <p className="text-white">
                          Unable to load document preview
                        </p>
                        <a
                          href={documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-colors"
                        >
                          <i className="fas fa-download mr-2"></i>
                          Download Document
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer - Actions */}
                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-sm text-green-200/50">
                    <i className="fas fa-info-circle mr-2"></i>
                    Uploaded:{" "}
                    {viewingDocument.nicDocument?.uploadedAt
                      ? new Date(
                          viewingDocument.nicDocument.uploadedAt,
                        ).toLocaleString()
                      : "Unknown"}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleRejectClick(viewingDocument)}
                      disabled={actionLoading === viewingDocument._id}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30 disabled:opacity-50"
                    >
                      <i className="fas fa-times mr-2"></i>Reject
                    </button>
                    <button
                      onClick={() => handleApproveDocument(viewingDocument._id)}
                      disabled={actionLoading === viewingDocument._id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors disabled:opacity-50"
                    >
                      {actionLoading === viewingDocument._id ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check mr-2"></i>Approve & Verify
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Reason Modal */}
          {showRejectModal && rejectingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-[#0D2B3E] border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <i className="fas fa-times-circle text-2xl text-red-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Reject Document
                  </h3>
                  <p className="text-sm text-green-200/50 mt-2">
                    Please provide a reason for rejecting{" "}
                    <span className="text-white font-medium">
                      {rejectingUser.username}
                    </span>
                    's document.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-green-200/70 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g., Document is blurry, NIC number not visible, etc."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-white/30 focus:border-red-400 focus:ring-1 focus:ring-red-400/30 transition-all duration-300 outline-none resize-none"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowRejectModal(false);
                        setRejectingUser(null);
                        setRejectionReason("");
                      }}
                      className="flex-1 py-2.5 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectConfirm}
                      disabled={
                        !rejectionReason.trim() ||
                        actionLoading === rejectingUser._id
                      }
                      className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === rejectingUser._id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <>
                          <i className="fas fa-times mr-2"></i>Reject Document
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
