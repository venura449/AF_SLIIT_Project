import { useState } from "react";
import {
  submitPlatformReview,
  getPlatformReviews,
} from "../../services/needService";

const ReviewBubble = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("write"); // "write" | "read"

  // Write review state
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error"

  // Read reviews state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    if (tab === "read") fetchReviews();
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === "read") fetchReviews();
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await getPlatformReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || rating === 0) return;
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      await submitPlatformReview({ content: content.trim(), rating });
      setSubmitStatus("success");
      setContent("");
      setRating(0);
    } catch {
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const renderStars = (count) =>
    Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star text-[11px] ${
          i < count ? "text-yellow-400" : "text-white/20"
        }`}
      ></i>
    ));

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Panel */}
      {open && (
        <div className="mb-3 w-[320px] bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[460px]">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <i className="fas fa-star text-white"></i>
              <span className="text-white font-semibold text-sm">
                Platform Reviews
              </span>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                setSubmitStatus(null);
              }}
              className="text-white/70 hover:text-white transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 shrink-0">
            <button
              onClick={() => handleTabChange("write")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === "write"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Write Review
            </button>
            <button
              onClick={() => handleTabChange("read")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === "read"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              All Reviews
            </button>
          </div>

          {/* Content */}
          {tab === "write" ? (
            <div className="p-4 flex flex-col space-y-3 flex-1">
              {submitStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                    <i className="fas fa-check text-green-400 text-xl"></i>
                  </div>
                  <p className="text-white font-medium text-sm">
                    Review submitted!
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Thank you for your feedback.
                  </p>
                  <button
                    onClick={() => setSubmitStatus(null)}
                    className="mt-4 text-xs text-purple-400 hover:text-purple-300"
                  >
                    Write another
                  </button>
                </div>
              ) : (
                <>
                  {/* Star rating selector */}
                  <div>
                    <p className="text-white/60 text-xs mb-2">Your rating</p>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          onMouseEnter={() => setHoverRating(i + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(i + 1)}
                          className="focus:outline-none"
                        >
                          <i
                            className={`fas fa-star text-xl transition-colors ${
                              i < (hoverRating || rating)
                                ? "text-yellow-400"
                                : "text-white/20"
                            }`}
                          ></i>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text area */}
                  <div>
                    <p className="text-white/60 text-xs mb-2">Your review</p>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your experience with the platform..."
                      rows={4}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-400/50 resize-none"
                    />
                  </div>

                  {submitStatus === "error" && (
                    <p className="text-red-400 text-xs">
                      Failed to submit. Please try again.
                    </p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || rating === 0 || submitting}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition-all"
                  >
                    {submitting ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {loadingReviews ? (
                <div className="text-center py-10">
                  <i className="fas fa-spinner fa-spin text-xl text-purple-400"></i>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                    <i className="fas fa-star text-lg text-white/10"></i>
                  </div>
                  <p className="text-sm text-white">No reviews yet</p>
                  <p className="text-xs text-white/30 mt-1">
                    Be the first to review!
                  </p>
                </div>
              ) : (
                reviews.map((review, idx) => (
                  <div
                    key={review._id || idx}
                    className="px-4 py-3 border-b border-white/5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">
                          {review.user?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="text-white text-xs font-medium">
                          {review.user?.username || "Anonymous"}
                        </span>
                      </div>
                      <span className="text-white/30 text-[10px]">
                        {review.createdAt ? timeAgo(review.createdAt) : ""}
                      </span>
                    </div>
                    <div className="flex space-x-0.5 mb-1.5">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed">
                      {review.description || review.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          open
            ? "bg-gradient-to-r from-purple-700 to-pink-600"
            : "bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-110"
        }`}
        style={{ boxShadow: "0 4px 24px rgba(168, 85, 247, 0.4)" }}
      >
        <i
          className={`fas ${open ? "fa-times" : "fa-star"} text-white text-xl`}
        ></i>
      </button>
    </div>
  );
};

export default ReviewBubble;
