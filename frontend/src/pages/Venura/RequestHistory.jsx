import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRequests } from "../../services/needService";

const RequestHistory = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await getMyRequests();
        setRequests(data || []);
      } catch (err) {
        setError("Failed to fetch request history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Fulfilled":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Partially Funded":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Pending":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Critical":
        return "bg-red-500/10 text-red-400";
      case "High":
        return "bg-orange-500/10 text-orange-400";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-400";
      case "Low":
        return "bg-green-500/10 text-green-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Food: "fas fa-utensils",
      Education: "fas fa-book",
      Medical: "fas fa-pills",
      Other: "fas fa-box",
    };
    return icons[category] || "fas fa-box";
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const filteredRequests =
    filterStatus === "All"
      ? requests
      : requests.filter((req) => req.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E] flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-green-400 mb-4"></i>
          <p className="text-green-200/70">Loading your requests...</p>
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
        </svg>
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-green-200/70 hover:text-white transition-colors"
              >
                <i className="fas fa-arrow-left text-lg"></i>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white">
                  <i className="fas fa-history text-lg"></i>
                </div>
                <h1 className="text-xl font-light text-white tracking-wider">
                  Request
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                    History
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-light text-white mb-2">
            Your Request
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              {" "}
              History
            </span>
          </h2>
          <p className="text-green-200/60">
            Track all your past requests and their current status
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["All", "Pending", "Partially Funded", "Fulfilled", "Cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/20"
                    : "bg-white/5 text-green-200/70 hover:bg-white/10 border border-white/10"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <i className="fas fa-inbox text-4xl text-green-400/50 mb-4"></i>
            <p className="text-lg text-green-200/70">No requests found</p>
            <p className="text-sm text-green-200/50 mt-2">
              {filterStatus === "All"
                ? "You haven't created any requests yet."
                : `No requests with status "${filterStatus}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left Section - Request Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Category Icon */}
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <i
                          className={`${getCategoryIcon(
                            request.category
                          )} text-purple-400 text-lg`}
                        ></i>
                      </div>

                      {/* Request Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {request.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">
                            {request.category}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs rounded-full ${getUrgencyColor(
                              request.urgency
                            )}`}
                          >
                            {request.urgency} Priority
                          </span>
                        </div>

                        <p className="text-sm text-green-200/60 line-clamp-2 mb-2">
                          {request.description}
                        </p>

                        <div className="flex flex-wrap gap-3 text-xs text-green-200/50">
                          <span>
                            <i className="fas fa-map-pin mr-1"></i>
                            {request.location}
                          </span>
                          <span>
                            <i className="fas fa-calendar mr-1"></i>
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Progress */}
                  <div className="flex flex-col items-end gap-3 md:border-l md:border-white/10 md:pl-6 md:min-w-max">
                    {/* Amount Progress */}
                    <div className="w-full md:w-48">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-green-200/70">Goal</span>
                        <span className="text-sm font-semibold text-white">
                          Rs.{request.currentAmount?.toLocaleString() || 0} / Rs.
                          {request.goalAmount?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r transition-all duration-500 ${
                            request.status === "Fulfilled"
                              ? "from-green-500 to-emerald-400"
                              : request.currentAmount > 0
                              ? "from-yellow-500 to-orange-400"
                              : "from-blue-500 to-cyan-400"
                          }`}
                          style={{
                            width: `${
                              (
                                ((request.currentAmount || 0) /
                                  (request.goalAmount || 1)) *
                                100
                              ).toFixed(0)
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-green-200/50 mt-1 block">
                        {(
                          (((request.currentAmount || 0) /
                            (request.goalAmount || 1)) *
                            100
                        ).toFixed(0)
                        )}% Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <p className="text-green-200/50 text-sm mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-white">{requests.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <p className="text-green-200/50 text-sm mb-1">Fulfilled</p>
              <p className="text-2xl font-bold text-green-400">
                {requests.filter((r) => r.status === "Fulfilled").length}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <p className="text-green-200/50 text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-blue-400">
                {requests.filter((r) => r.status === "Pending").length}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <p className="text-green-200/50 text-sm mb-1">Total Funded</p>
              <p className="text-2xl font-bold text-yellow-400">
                Rs.
                {requests
                  .reduce((sum, r) => sum + (r.currentAmount || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RequestHistory;
