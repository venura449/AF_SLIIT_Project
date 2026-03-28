import { useState } from "react";
import * as needService from "../../services/needService";

const ReviewBubble = () => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Please write a review message.");
      return;
    }
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await needService.submitPlatformReview({
        content: content.trim(),
        rating,
      });
      setSuccess(true);
      setContent("");
      setRating(0);
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat panel */}
      {open && (
        <div className="mb-3 w-80 bg-[#0D2B3E] border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-comment-dots text-white"></i>
              <span className="text-white font-semibold text-sm">
                Submit a Review
              </span>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                setError("");
                setSuccess(false);
              }}
              className="text-white/70 hover:text-white transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {success ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                  <i className="fas fa-check-circle text-2xl text-green-400"></i>
                </div>
                <p className="text-white font-medium">Thank you!</p>
                <p className="text-xs text-green-200/50 mt-1">
                  Your review has been submitted
                </p>
              </div>
            ) : (
              <>
                {/* Rating stars */}
                <div>
                  <p className="text-xs text-green-200/60 mb-1.5">
                    How was your experience?
                  </p>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <i
                          className={`fas fa-star text-lg ${
                            star <= (hoverRating || rating)
                              ? "text-yellow-400"
                              : "text-white/15"
                          } transition-colors`}
                        ></i>
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="text-xs text-green-200/40 ml-2">
                        {rating}/5
                      </span>
                    )}
                  </div>
                </div>

                {/* Message area styled as chat */}
                <div>
                  <p className="text-xs text-green-200/60 mb-1.5">
                    Your message
                  </p>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts about the platform..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-green-200/30 focus:outline-none focus:border-green-400/40 focus:ring-1 focus:ring-green-400/20 resize-none transition-all"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {error}
                  </p>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
                >
                  {submitting ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Submit Review
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating bubble button */}
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          setError("");
        }}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          open
            ? "bg-white/10 border border-white/20 text-green-400"
            : "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-green-500/30"
        }`}
      >
        <i
          className={`fas ${open ? "fa-times" : "fa-comment-dots"} text-xl`}
        ></i>
      </button>
    </div>
  );
};

export default ReviewBubble;
