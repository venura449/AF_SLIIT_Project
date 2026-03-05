import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logout } from "../../services/authService";
import * as itemService from "../../services/itemService";
import { getImageUrl } from "../../services/itemService";
import ReviewBubble from "./ReviewBubble";
import ChatBubble from "./ChatBubble";

const DonorItems = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("tile");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const profileMenuRef = useRef(null);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "Other",
    condition: "Good",
    location: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({});
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Chat modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatItem, setChatItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const categories = [
    "Electronics",
    "Clothing",
    "Furniture",
    "Books",
    "Kitchen",
    "Toys",
    "Sports",
    "Other",
  ];
  const conditions = ["New", "Like New", "Good", "Fair"];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile.role !== "Donor") {
          navigate("/dashboard");
          return;
        }
        setUser(profile);
        fetchItems();
      } catch {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const fetchItems = async () => {
    try {
      const data = await itemService.getMyItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

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

  // File handling
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setSelectedFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  // Create item
  const handleCreate = async () => {
    if (!newItem.title.trim() || !newItem.description.trim()) {
      setCreateError("Title and description are required");
      return;
    }
    setCreateError("");
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("title", newItem.title);
      formData.append("description", newItem.description);
      formData.append("category", newItem.category);
      formData.append("condition", newItem.condition);
      formData.append("location", newItem.location);
      selectedFiles.forEach((file) => formData.append("images", file));
      await itemService.createItem(formData);
      setShowCreateModal(false);
      setNewItem({
        title: "",
        description: "",
        category: "Other",
        condition: "Good",
        location: "",
      });
      setSelectedFiles([]);
      setPreviews([]);
      fetchItems();
    } catch (err) {
      setCreateError(err.response?.data?.error || "Failed to create item");
    } finally {
      setCreating(false);
    }
  };

  // Edit item
  const openEditModal = (item) => {
    setEditItem(item);
    setEditData({
      title: item.title,
      description: item.description,
      category: item.category,
      condition: item.condition,
      location: item.location || "",
      status: item.status,
    });
    setEditError("");
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editData.title.trim() || !editData.description.trim()) {
      setEditError("Title and description are required");
      return;
    }
    setEditError("");
    setEditing(true);
    try {
      await itemService.updateItem(editItem._id, editData);
      setShowEditModal(false);
      fetchItems();
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to update item");
    } finally {
      setEditing(false);
    }
  };

  // Delete item
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await itemService.deleteItem(deleteTarget._id);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Chat
  const openChat = async (item) => {
    setChatItem(item);
    setShowChatModal(true);
    setChatLoading(true);
    try {
      const data = await itemService.getConversation(item._id);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async (receiverId) => {
    if (!newMessage.trim() || !receiverId) return;
    setSending(true);
    try {
      const msg = await itemService.sendMessage({
        itemListingId: chatItem._id,
        receiverId,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSending(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCat =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const getCategoryIcon = (cat) => {
    const icons = {
      Electronics: "fa-laptop",
      Clothing: "fa-tshirt",
      Furniture: "fa-couch",
      Books: "fa-book",
      Kitchen: "fa-utensils",
      Toys: "fa-gamepad",
      Sports: "fa-futbol",
      Other: "fa-box",
    };
    return icons[cat] || "fa-box";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-500/20 text-green-400";
      case "Reserved":
        return "bg-yellow-500/20 text-yellow-400";
      case "Claimed":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-white/10 text-white/50";
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
              <button
                onClick={() => navigate("/donor-needs")}
                className="px-4 py-2 text-sm text-green-200/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-search-dollar mr-2"></i>Find Needs
              </button>
              <button className="px-4 py-2 text-sm bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white rounded-xl shadow-lg shadow-green-500/20">
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
            <h2 className="text-2xl font-bold text-white flex items-center">
              <i className="fas fa-gift text-green-400 mr-3"></i>
              My Item Listings
            </h2>
            <p className="text-sm text-green-200/50 mt-1">
              Share your extra items with those in need
            </p>
          </div>
          <button
            onClick={() => {
              setShowCreateModal(true);
              setCreateError("");
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 transition-all duration-300 text-sm"
          >
            <i className="fas fa-plus mr-2"></i>Add Item
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-green-300/40"></i>
              <input
                type="text"
                placeholder="Search your items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-green-200/30 focus:outline-none focus:border-green-400/40 text-sm"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-400/40 [&>option]:bg-[#0D2B3E]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("tile")}
                className={`p-2.5 rounded-xl border transition-all ${viewMode === "tile" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-white/5 border-white/10 text-white/40 hover:text-white"}`}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2.5 rounded-xl border transition-all ${viewMode === "table" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-white/5 border-white/10 text-white/40 hover:text-white"}`}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Items Grid (Tile) */}
        {viewMode === "tile" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {paginatedItems.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <i className="fas fa-box-open text-2xl text-green-200/30"></i>
                </div>
                <p className="text-white font-medium">No items found</p>
                <p className="text-xs text-green-200/40 mt-1">
                  Click "Add Item" to share something
                </p>
              </div>
            ) : (
              paginatedItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all group"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-white/5 overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={getImageUrl(item.images[0])}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i
                          className={`fas ${getCategoryIcon(item.category)} text-4xl text-green-200/15`}
                        ></i>
                      </div>
                    )}
                    {item.images && item.images.length > 1 && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[10px] rounded-full">
                        <i className="fas fa-images mr-1"></i>
                        {item.images.length}
                      </span>
                    )}
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-green-200/40 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-green-200/50">
                        <i
                          className={`fas ${getCategoryIcon(item.category)} mr-1`}
                        ></i>
                        {item.category}
                      </span>
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-green-200/50">
                        {item.condition}
                      </span>
                    </div>
                    {item.location && (
                      <p className="text-[10px] text-green-200/30 mt-2">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {item.location}
                      </p>
                    )}
                    {/* Actions */}
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-white/5">
                      <button
                        onClick={() => openChat(item)}
                        className="flex-1 px-3 py-1.5 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                      >
                        <i className="fas fa-comments mr-1"></i>Chat
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-3 py-1.5 text-xs bg-white/5 text-green-200/60 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                      >
                        <i className="fas fa-pen"></i>
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(item);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Items Table */}
        {viewMode === "table" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-xs text-green-200/60 font-medium">
                      Item
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
                    <th className="px-4 py-3 text-center text-xs text-green-200/60 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-12 text-green-200/40 text-sm"
                      >
                        No items found
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={getImageUrl(item.images[0])}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i
                                    className={`fas ${getCategoryIcon(item.category)} text-green-200/20`}
                                  ></i>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium truncate max-w-[200px]">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-green-200/40 truncate max-w-[200px]">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-green-200/60">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-green-200/60">
                            {item.condition}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-green-200/40">
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => openChat(item)}
                              title="View Messages"
                              className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                            >
                              <i className="fas fa-comments text-xs"></i>
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              title="Edit"
                              className="p-1.5 text-green-200/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                              <i className="fas fa-pen text-xs"></i>
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(item);
                                setShowDeleteModal(true);
                              }}
                              title="Delete"
                              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
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
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-green-200/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <i className="fas fa-chevron-left mr-1"></i>Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 text-xs rounded-lg border transition-all ${
                  currentPage === page
                    ? "bg-gradient-to-r from-green-500 to-emerald-400 text-white border-transparent shadow-lg shadow-green-500/20"
                    : "bg-white/5 border-white/10 text-green-200/60 hover:bg-white/10"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-green-200/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next<i className="fas fa-chevron-right ml-1"></i>
            </button>
          </div>
        )}
      </main>

      {/* Create Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                <i className="fas fa-plus-circle text-green-400 mr-2"></i>
                Add New Item
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-green-200/40 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-green-200/70 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                  placeholder="e.g., Old Laptop in working condition"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-green-200/30 focus:outline-none focus:border-green-400/40"
                />
              </div>
              <div>
                <label className="block text-xs text-green-200/70 mb-1">
                  Description *
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe the item, its condition, and why you're giving it away..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-green-200/30 focus:outline-none focus:border-green-400/40 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-green-200/70 mb-1">
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-400/40 [&>option]:bg-[#0D2B3E]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-green-200/70 mb-1">
                    Condition
                  </label>
                  <select
                    value={newItem.condition}
                    onChange={(e) =>
                      setNewItem({ ...newItem, condition: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-400/40 [&>option]:bg-[#0D2B3E]"
                  >
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-green-200/70 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) =>
                    setNewItem({ ...newItem, location: e.target.value })
                  }
                  placeholder="e.g., Colombo, Sri Lanka"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-green-200/30 focus:outline-none focus:border-green-400/40"
                />
              </div>
              <div>
                <label className="block text-xs text-green-200/70 mb-1">
                  Photos (up to 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-sm text-green-200/50 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-green-500/20 file:text-green-400 hover:file:bg-green-500/30 file:cursor-pointer file:transition-all"
                />
                {previews.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {previews.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg border border-white/10"
                      />
                    ))}
                  </div>
                )}
              </div>
              {createError && (
                <p className="text-xs text-red-400">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {createError}
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-green-200/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-5 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 disabled:opacity-50 transition-all"
              >
                {creating ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                <i className="fas fa-edit text-green-400 mr-2"></i>
                Edit Item
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-green-200/40 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-green-200/70 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-400/40"
                />
              </div>
              <div>
                <label className="block text-xs text-green-200/70 mb-1">
                  Description *
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-400/40 resize-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-green-200/70 mb-1">
                    Category
                  </label>
                  <select
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-400/40 [&>option]:bg-[#0D2B3E]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-green-200/70 mb-1">
                    Condition
                  </label>
                  <select
                    value={editData.condition}
                    onChange={(e) =>
                      setEditData({ ...editData, condition: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-400/40 [&>option]:bg-[#0D2B3E]"
                  >
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-green-200/70 mb-1">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-400/40 [&>option]:bg-[#0D2B3E]"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Claimed">Claimed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-green-200/70 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) =>
                    setEditData({ ...editData, location: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-400/40"
                />
              </div>
              {editError && (
                <p className="text-xs text-red-400">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {editError}
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm text-green-200/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={editing}
                className="px-5 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 disabled:opacity-50 transition-all"
              >
                {editing ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <i className="fas fa-trash-alt text-xl text-red-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Item?
            </h3>
            <p className="text-sm text-green-200/50 mb-6">
              "{deleteTarget.title}" will be permanently removed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 text-sm text-green-200/60 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all"
              >
                {deleting ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && chatItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  <i className="fas fa-comments text-blue-400 mr-2"></i>
                  Messages — {chatItem.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowChatModal(false);
                  setChatItem(null);
                  setMessages([]);
                  setNewMessage("");
                }}
                className="text-green-200/40 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {chatLoading ? (
                <div className="text-center py-10">
                  <i className="fas fa-spinner fa-spin text-xl text-green-400"></i>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                    <i className="fas fa-comment-slash text-lg text-green-200/20"></i>
                  </div>
                  <p className="text-sm text-white">No messages yet</p>
                  <p className="text-xs text-green-200/40 mt-1">
                    Messages from interested users will appear here
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender?._id === user?._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-3.5 py-2 rounded-2xl ${
                          isMe
                            ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-br-md"
                            : "bg-white/10 text-white rounded-bl-md"
                        }`}
                      >
                        {!isMe && (
                          <p className="text-[10px] text-green-300/60 font-medium mb-0.5">
                            {msg.sender?.username}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-[9px] mt-1 ${isMe ? "text-white/50" : "text-green-200/30"}`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Input — only show if there are messages (donor replies to conversations) */}
            {messages.length > 0 && (
              <div className="px-5 py-3 border-t border-white/10 shrink-0">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        // Reply to the other party
                        const otherUser = messages.find(
                          (m) => m.sender?._id !== user?._id,
                        );
                        if (otherUser) handleSendMessage(otherUser.sender._id);
                      }
                    }}
                    placeholder="Type a reply..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-green-200/30 focus:outline-none focus:border-green-400/40"
                  />
                  <button
                    onClick={() => {
                      const otherUser = messages.find(
                        (m) => m.sender?._id !== user?._id,
                      );
                      if (otherUser) handleSendMessage(otherUser.sender._id);
                    }}
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl disabled:opacity-40 transition-all"
                  >
                    {sending ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ReviewBubble />
      <ChatBubble user={user} />
    </div>
  );
};

export default DonorItems;
