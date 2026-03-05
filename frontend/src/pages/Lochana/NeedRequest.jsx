import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logout } from "../../services/authService";
import * as needService from "../../services/needService";

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
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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
      setNewRequest({ title: "", description: "", category: "Food", urgency: "Medium", location: "", targetAmount: "" });
      setSelectedFile(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create need request.");
    }
  };

  const filteredRequests = needRequests.filter((request) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || request.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getProgressPercentage = (current, target) => Math.round((current / (target || 1)) * 100);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Critical": return "from-red-500/20 to-red-600/20 border-red-500/30";
      case "High": return "from-orange-500/20 to-orange-600/20 border-orange-500/30";
      case "Medium": return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      default: return "from-green-500/20 to-green-600/20 border-green-500/30";
    }
  };

  const getUrgencyBadgeColor = (urgency) => {
    switch (urgency) {
      case "Critical": return "bg-red-500/20 text-red-400";
      case "High": return "bg-orange-500/20 text-orange-400";
      case "Medium": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-green-500/20 text-green-400";
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
      {/* Navigation (Same as your original) */}
      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
                <i className="fas fa-hand-holding-heart"></i>
              </div>
              <h1 className="text-xl font-light text-white">Bridge<span className="font-semibold text-green-400">Connect</span></h1>
            </div>
            {/* ... Profile Menu Trigger ... */}
            <div className="relative" ref={profileMenuRef}>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-full py-2 px-4">
                <span className="text-sm text-white hidden sm:block">{user?.username}</span>
                <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">{getInitials(user?.username)}</div>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0D2B3E] border border-white/20 rounded-2xl shadow-2xl p-2 z-50">
                   <button onClick={() => navigate("/profile")} className="w-full flex items-center space-x-3 px-3 py-2 text-green-200 hover:bg-white/10 rounded-xl transition-all">
                      <i className="fas fa-user-circle"></i><span>My Profile</span>
                   </button>
                   <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl mt-1">
                      <i className="fas fa-sign-out-alt"></i><span>Sign Out</span>
                   </button>
                </div>
              )}
            </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-light text-white mb-2">
              My <span className="font-semibold text-green-400">Requests</span>
            </h2>
            <p className="text-green-200/60">Manage and track your personal help requests</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/30 flex items-center justify-center space-x-2"
          >
            <i className="fas fa-plus"></i>
            <span>New Request</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search my requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-400/30"
            />
            <i className="fas fa-search absolute right-3 top-3.5 text-green-200/40"></i>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Food">Food</option>
            <option value="Medical">Medical</option>
            <option value="Education">Education</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className={`bg-gradient-to-br ${getUrgencyColor(request.urgency)} backdrop-blur-xl border border-white/10 rounded-2xl p-6 group transition-all hover:scale-[1.02]`}
            >
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyBadgeColor(request.urgency)}`}>
                        {request.urgency}
                    </span>
                    {request.category === "Medical" && !request.isVerified && (
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-[10px] uppercase font-bold">
                            Pending Verification
                        </span>
                    )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{request.title}</h3>
                <p className="text-sm text-green-200/70 mb-4 line-clamp-2">{request.description}</p>

                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-green-200/50">
                        <span>Progress</span>
                        <span>{getProgressPercentage(request.currentAmount, request.goalAmount)}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-green-400 transition-all duration-500" 
                            style={{ width: `${getProgressPercentage(request.currentAmount, request.goalAmount)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex justify-between items-center text-white pt-4 border-t border-white/10">
                    <div>
                        <p className="text-[10px] text-green-200/40 uppercase">Goal</p>
                        <p className="font-bold text-sm">LKR {request.goalAmount?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-green-200/40 uppercase">Status</p>
                        <p className="text-sm text-green-400">{request.status}</p>
                    </div>
                </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <i className="fas fa-file-invoice text-5xl text-green-400/20 mb-4"></i>
            <p className="text-green-200/60">You haven't made any help requests yet.</p>
          </div>
        )}
      </main>

      {/* Keep Create Modal as it was */}
      {/* ... (Create Modal Code) ... */}
    </div>
  );
};

export default NeedRequest;