import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingMedicalNeeds, approveMedicalNeed } from '../../services/needService';
import { getProfile, logout } from '../../services/authService';

const AdminVerification = () => {
  const navigate = useNavigate();
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('urgency');
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNeeds = async () => {
    try {
      const data = await getPendingMedicalNeeds();
      setNeeds(data);
    } catch (err) {
      console.error('Failed to load needs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchNeeds(); 
  }, []);

  const handleApprove = async (id) => {
    if (window.confirm('Verify this medical request?')) {
      try {
        await approveMedicalNeed(id);
        alert('Verified successfully!');
        fetchNeeds();
      } catch (err) {
        alert('Failed to verify request');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'from-red-500/20 to-red-600/20 border-red-500/30';
      case 'High': return 'from-orange-500/20 to-orange-600/20 border-orange-500/30';
      case 'Medium': return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      default: return 'from-green-500/20 to-green-600/20 border-green-500/30';
    }
  };

  const getUrgencyBadgeColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-300 border border-green-500/30';
    }
  };

  const filteredAndSortedNeeds = needs
    .filter(need => need.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const urgencyOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      if (sortBy === 'urgency') {
        return (urgencyOrder[a.urgency] || 3) - (urgencyOrder[b.urgency] || 3);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-green-400 mb-4"></i>
          <p className="text-green-200/70">Loading medical requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
      {/* Navigation */}
      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
              <i className="fas fa-hand-holding-heart"></i>
            </div>
            <h1 className="text-xl font-light text-white">Bridge<span className="font-semibold text-green-400">Connect</span></h1>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 text-white hover:text-green-400 transition"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center font-semibold text-green-400">
                {getInitials(user?.username)}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0A1A2F]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-white text-sm font-medium">{user?.username}</p>
                  <p className="text-gray-400 text-xs">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition text-sm"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Medical Need Verification</h2>
          <p className="text-gray-400">Review and verify pending medical requests</p>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-3 text-gray-500"></i>
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400/50 transition"
            />
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400/50 transition"
            >
              <option value="urgency">Sort by Urgency</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredAndSortedNeeds.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-inbox text-5xl text-gray-600 mb-4 block"></i>
            <p className="text-gray-400 text-lg">No pending medical requests found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedNeeds.map((need) => (
              <div
                key={need._id}
                className={`bg-gradient-to-br ${getUrgencyColor(need.urgency)} border rounded-lg backdrop-blur-sm p-6 hover:border-green-400/50 transition group`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition">{need.title}</h3>
                    <p className="text-gray-300 text-sm">{need.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${getUrgencyBadgeColor(need.urgency)}`}>
                    {need.urgency}
                  </span>
                </div>

                {/* Medical Documents */}
                <div className="mb-4 bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-300 text-sm mb-3">Medical Documents</h4>
                  {need.verificationDocs && need.verificationDocs.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {need.verificationDocs.map((doc, i) => (
                        <a
                          key={i}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group/doc block"
                        >
                          <img
                            src={doc.url}
                            alt="Medical Document"
                            className="w-full h-20 object-cover rounded-lg border border-white/10 group-hover/doc:border-green-400/50 transition"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-400 text-xs italic">No documents uploaded</p>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Goal Amount</p>
                    <p className="text-green-400 font-semibold text-lg">${need.goalAmount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Location</p>
                    <p className="text-white font-medium">{need.location}</p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleApprove(need._id)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105 active:scale-95"
                >
                  <i className="fas fa-check mr-2"></i>Verify Request
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerification;