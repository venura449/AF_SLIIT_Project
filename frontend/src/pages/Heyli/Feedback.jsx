import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  logout,
  getDocumentStatus,
} from "../../services/authService";
import { getMyNeeds } from "../../services/needService";
import {
  deleteFeedback,
  editFeedback,
  getFeedbacks,
  submitFeedback,
} from "../../services/feedbackService";
import {
  deleteReview,
  editReview,
  getReviews,
  submitReview,
} from "../../services/reviewService";
import { getImageUrl } from "../../services/itemService";
import { toast } from "react-toastify";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const [feedbacks, setFeedbacks] = useState([]);
  const [user, setUser] = useState(null);
  const [userNeeds, setUserNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [documentStatus, setDocumentStatus] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [feedbackModalMode, setFeedbackModalMode] = useState("create");
  const [reviewModalMode, setReviewModalMode] = useState("create");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [feedbackImagePreview, setFeedbackImagePreview] = useState("");
  const [newFeedback, setNewFeedback] = useState({
    needId: "",
    description: "",
    image: null,
    existingImageUrl: "",
  });
  const [newReview, setNewReview] = useState({
    description: "",
    rating: 0,
  });

  const currentUserId = String(user?._id || user?.id || "");

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const resetFeedbackForm = () => {
    if (feedbackImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(feedbackImagePreview);
    }

    setNewFeedback({
      needId: "",
      description: "",
      image: null,
      existingImageUrl: "",
    });
    setFeedbackImagePreview("");
    setFeedbackError("");
    setEditingFeedbackId(null);
    setFeedbackModalMode("create");
  };

  const resetReviewForm = () => {
    setNewReview({
      description: "",
      rating: 0,
    });
    setReviewError("");
    setEditingReviewId(null);
    setReviewModalMode("create");
  };

  const loadFeedbackData = async () => {
    const [feedbackList, reviewList] = await Promise.all([
      getFeedbacks(),
      getReviews(),
    ]);

    const reviewsByFeedbackId = reviewList.reduce((acc, review) => {
      const key = String(review.feedback);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(review);
      return acc;
    }, {});

    const mergedFeedbacks = feedbackList.map((feedback) => ({
      ...feedback,
      reviews: reviewsByFeedbackId[String(feedback._id)] || [],
    }));

    setFeedbacks(mergedFeedbacks);
  };

  useEffect(() => {
    const initializePage = async () => {
      try {
        const [profile, docStatus, needs] = await Promise.all([
          getProfile(),
          getDocumentStatus(),
          getMyNeeds(),
        ]);

        setUser(profile);
        setDocumentStatus(docStatus);
        setUserNeeds(Array.isArray(needs) ? needs : []);
        await loadFeedbackData();
      } catch (err) {
        console.error("Error loading feedback page:", err);
        navigate("/login");
        return;
      } finally {
        setLoading(false);
      }
    };

    initializePage();
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

  const handleFeedbackImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (feedbackImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(feedbackImagePreview);
    }

    setNewFeedback((prev) => ({
      ...prev,
      image: file,
    }));

    setFeedbackImagePreview(
      file
        ? URL.createObjectURL(file)
        : newFeedback.existingImageUrl
          ? getImageUrl(newFeedback.existingImageUrl)
          : "",
    );
  };

  const openCreateFeedbackModal = () => {
    resetFeedbackForm();
    setShowFeedbackModal(true);
  };

  const openEditFeedbackModal = (feedback) => {
    resetFeedbackForm();
    setFeedbackModalMode("edit");
    setEditingFeedbackId(feedback._id);
    setNewFeedback({
      needId: feedback.need?._id || "",
      description: feedback.content || "",
      image: null,
      existingImageUrl: feedback.imageUrl || "",
    });
    setFeedbackImagePreview(
      feedback.imageUrl ? getImageUrl(feedback.imageUrl) : "",
    );
    setShowFeedbackModal(true);
  };

  const openCreateReviewModal = (feedbackId) => {
    resetReviewForm();
    setSelectedFeedbackId(feedbackId);
    setShowReviewModal(true);
  };

  const openEditReviewModal = (review) => {
    resetReviewForm();
    setReviewModalMode("edit");
    setEditingReviewId(review._id);
    setSelectedFeedbackId(review.feedback);
    setNewReview({
      description: review.description || "",
      rating: Number(review.rating) || 0,
    });
    setShowReviewModal(true);
  };

  const handleFeedbackSubmit = async () => {
    if (user?.role !== "Recipient") {
      setFeedbackError("Only recipients can add feedback.");
      return;
    }

    if (!newFeedback.needId) {
      setFeedbackError("Please select a need.");
      return;
    }

    if (!newFeedback.description.trim()) {
      setFeedbackError("Please enter feedback.");
      return;
    }

    try {
      setSubmittingFeedback(true);
      setFeedbackError("");

      const formData = new FormData();
      formData.append("needId", newFeedback.needId);
      formData.append("description", newFeedback.description.trim());
      formData.append("user", currentUserId);

      if (newFeedback.image) {
        formData.append("image", newFeedback.image);
      } else if (feedbackModalMode === "edit" && newFeedback.existingImageUrl) {
        formData.append("imageUrl", newFeedback.existingImageUrl);
      }

      if (feedbackModalMode === "edit" && editingFeedbackId) {
        await editFeedback(editingFeedbackId, formData);
        toast.success("Feedback updated successfully!");
      } else {
        await submitFeedback(formData);
        toast.success("Feedback submitted successfully!");
      }

      await loadFeedbackData();
      resetFeedbackForm();
      setShowFeedbackModal(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      const msg = error?.response?.data?.error || "Failed to submit feedback.";
      setFeedbackError(msg);
      toast.error(msg);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedFeedbackId) {
      setReviewError("No feedback selected.");
      return;
    }

    if (!newReview.description.trim()) {
      setReviewError("Please enter a review.");
      return;
    }

    if (!newReview.rating) {
      setReviewError("Please select a rating.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      if (reviewModalMode === "edit" && editingReviewId) {
        await editReview(editingReviewId, {
          description: newReview.description.trim(),
          rating: newReview.rating,
        });
        toast.success("Review updated successfully!");
      } else {
        await submitReview(selectedFeedbackId, {
          description: newReview.description.trim(),
          rating: newReview.rating,
        });
        toast.success("Review submitted successfully!");
      }

      await loadFeedbackData();
      resetReviewForm();
      setShowReviewModal(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      const msg = error?.response?.data?.error || "Failed to submit review.";
      setReviewError(msg);
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this feedback?",
    );

    if (!confirmed) return;

    try {
      await deleteFeedback(feedbackId);
      await loadFeedbackData();
      toast.success("Feedback deleted.");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      const msg = error?.response?.data?.error || "Failed to delete feedback.";
      setFeedbackError(msg);
      toast.error(msg);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) return;

    try {
      await deleteReview(reviewId);
      await loadFeedbackData();
      toast.success("Review deleted.");
    } catch (error) {
      console.error("Error deleting review:", error);
      const msg = error?.response?.data?.error || "Failed to delete review.";
      setReviewError(msg);
      toast.error(msg);
    }
  };

  const renderStars = (rating) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`fas fa-star ${
            star <= Number(rating) ? "text-yellow-400" : "text-gray-500"
          }`}
        ></i>
      ))}
    </div>
  );

  const fulfilledNeeds = useMemo(
    () => userNeeds.filter((need) => need.status === "Fulfilled"),
    [userNeeds],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-green-400 mb-4"></i>
          <p className="text-green-200/70">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
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
                  className={`fas fa-chevron-down text-xs text-green-300/50 transition-transform duration-300 ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                ></i>
              </button>

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

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl text-white font-semibold">Feedback</h2>
            <p className="text-green-200/60 text-sm mt-1">
              Reviews are shown only under their matching feedback entry.
            </p>
          </div>
          {user?.role === "Recipient" && (
            <button
              onClick={openCreateFeedbackModal}
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center space-x-2"
            >
              <i className="fas fa-plus text-xs"></i>
              <span>Add Feedback</span>
            </button>
          )}
        </div>

        <div className="space-y-6">
          {feedbacks.length === 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-green-200/70">
              No feedback found yet.
            </div>
          )}

          {feedbacks.map((fb) => (
            <div
              key={fb._id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white font-medium">
                    {fb.user?.username || "Unknown User"}
                  </p>
                  <p className="text-green-200/60 text-sm">
                    {fb.need?.title || "Untitled Need"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-gray-300 text-sm">
                    <i className="fas fa-star text-gray-400"></i>{" "}
                    {Number(fb.rating || 0).toFixed(1)}
                  </p>

                  {String(fb.user?._id) === currentUserId && (
                    <div className="flex gap-2 text-sm">
                      <button
                        className="text-blue-400"
                        onClick={() => openEditFeedbackModal(fb)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-400"
                        onClick={() => handleDeleteFeedback(fb._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-green-200/80 mb-3">{fb.content}</p>

              {fb.imageUrl && (
                <div className="w-full h-64 mb-3 rounded-xl overflow-hidden flex items-start justify-start">
                  <img
                    src={getImageUrl(fb.imageUrl)}
                    alt="Feedback"
                    className="max-w-full max-h-full object-contain object-left-top rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-3 mt-4">
                {fb.reviews.map((rv) => (
                  <div key={rv._id} className="bg-white/5 p-3 rounded-xl">
                    <div className="flex justify-between">
                      <p className="text-white text-sm">
                        {rv.user?.username || "Unknown User"}
                      </p>

                      {String(rv.user?._id) === currentUserId && (
                        <div className="flex gap-2 text-xs">
                          <button
                            className="text-blue-400"
                            onClick={() => openEditReviewModal(rv)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-400"
                            onClick={() => handleDeleteReview(rv._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-green-200/70 text-sm">
                      {rv.description}
                    </p>
                    {renderStars(rv.rating)}
                  </div>
                ))}
              </div>

              {user?.role === "Donor" && (
                <button
                  onClick={() => openCreateReviewModal(fb._id)}
                  className="mt-4 text-green-400 text-sm hover:cursor-pointer"
                >
                  Add Review
                </button>
              )}
            </div>
          ))}
        </div>

        {showFeedbackModal && user?.role === "Recipient" && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-30 px-4">
            <div className="bg-[#0D2B3E] p-6 rounded-2xl w-full max-w-md border border-white/10">
              <h3 className="text-white mb-4">
                {feedbackModalMode === "edit"
                  ? "Edit Feedback"
                  : "Add Feedback"}
              </h3>

              <select
                value={newFeedback.needId}
                className="w-full mb-3 p-2 bg-white/10 text-white rounded"
                onChange={(e) =>
                  setNewFeedback({ ...newFeedback, needId: e.target.value })
                }
              >
                <option value="" className="text-black">
                  Select Need
                </option>
                {fulfilledNeeds.map((need) => (
                  <option
                    key={need._id}
                    value={need._id}
                    className="text-black"
                  >
                    {need.title}
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Description"
                value={newFeedback.description}
                className="w-full mb-3 p-2 bg-white/10 text-white rounded"
                onChange={(e) =>
                  setNewFeedback({
                    ...newFeedback,
                    description: e.target.value,
                  })
                }
              />

              <input
                type="file"
                accept="image/*"
                className="mb-4 block w-fit text-sm text-green-100 file:mr-3 file:rounded-lg file:border-0 file:bg-green-500/20 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-green-100 hover:file:bg-green-500/30"
                onChange={handleFeedbackImageChange}
              />

              {feedbackImagePreview && (
                <div className="w-full h-56 mb-4 rounded-xl overflow-hidden flex items-start justify-start">
                  <img
                    src={feedbackImagePreview}
                    alt="Feedback preview"
                    className="max-w-full max-h-full object-contain object-left-top rounded-xl"
                  />
                </div>
              )}

              {feedbackError && (
                <p className="text-sm text-red-400 mb-3">{feedbackError}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    resetFeedbackForm();
                    setShowFeedbackModal(false);
                  }}
                  className="bg-white/10 px-4 py-2 rounded border border-white/20 hover:bg-white/20 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={submittingFeedback}
                  className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 text-white disabled:opacity-60"
                >
                  {submittingFeedback
                    ? "Saving..."
                    : feedbackModalMode === "edit"
                      ? "Save Changes"
                      : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showReviewModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-30 px-4">
            <div className="bg-[#0D2B3E] p-6 rounded-2xl w-full max-w-md border border-white/10">
              <h3 className="text-white mb-4">
                {reviewModalMode === "edit" ? "Edit Review" : "Add Review"}
              </h3>

              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`fas fa-star cursor-pointer ${
                      star <= newReview.rating
                        ? "text-yellow-400"
                        : "text-gray-500"
                    }`}
                  ></i>
                ))}
              </div>

              <textarea
                placeholder="Review description"
                value={newReview.description}
                className="w-full mb-4 p-2 bg-white/10 text-white rounded"
                onChange={(e) =>
                  setNewReview({
                    ...newReview,
                    description: e.target.value,
                  })
                }
              />

              {reviewError && (
                <p className="text-sm text-red-400 mb-3">{reviewError}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    resetReviewForm();
                    setShowReviewModal(false);
                  }}
                  className="bg-white/10 px-4 py-2 rounded border border-white/20 hover:bg-white/20 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={submittingReview}
                  className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 text-white disabled:opacity-60"
                >
                  {submittingReview
                    ? "Saving..."
                    : reviewModalMode === "edit"
                      ? "Save Changes"
                      : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedbackPage;
