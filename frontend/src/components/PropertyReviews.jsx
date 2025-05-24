import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Star,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  TrendingUp,
  User,
  Award,
  Calendar,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

// Sub-component: Enhanced Average Rating with visual improvements
const AverageRating = ({ reviews }) => {
  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      ).toFixed(1)
    : 0;

  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });

  return (
    <div className="bg-gradient-to-r from-teal-50 to-teal-50 rounded-lg p-6 border border-teal-100 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        {/* Main Rating Display */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-6 h-6 text-teal-600" />
            <span className="text-3xl font-bold text-teal-800">
              {averageRating}
            </span>
          </div>
          <div className="flex mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={
                  i < Math.round(averageRating)
                    ? "text-teal-500 fill-teal-500"
                    : "text-gray-300"
                }
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Based on {reviews.length}{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="flex-1 w-full">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Rating Breakdown
          </h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-3">{rating}</span>
                <Star size={14} className="text-teal-500 fill-teal-500" />
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width:
                        reviews.length > 0
                          ? `${
                              (ratingCounts[rating - 1] / reviews.length) * 100
                            }%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">
                  {ratingCounts[rating - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Review List
const ReviewList = ({ reviews, currentUser, onDelete, showAll }) => {
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (!displayedReviews.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-base font-medium text-gray-600 mb-2">
          No reviews yet
        </h3>
        <p className="text-gray-500">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedReviews.map((review, index) => (
        <article
          key={review._id}
          className="group relative bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all"
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt={`${review.fullname || "Anonymous"}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-medium shadow-sm"
                    style={{ display: review.avatar ? "none" : "flex" }}
                  >
                    {review.fullname ? (
                      review.fullname[0].toUpperCase()
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-medium text-gray-900">
                    {review.fullname || "Anonymous User"}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={12} />
                    <span>
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < review.rating
                          ? "text-teal-500 fill-teal-500"
                          : "text-gray-300"
                      }
                      aria-hidden="true"
                    />
                  ))}
                  <span className="ml-1 text-sm font-medium text-teal-700">
                    {review.rating}
                  </span>
                </div>
                {currentUser && currentUser._id === review.userId && (
                  <button
                    onClick={() => onDelete(review._id)}
                    className="p-1.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 focus:outline-none transition-colors"
                    aria-label="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-teal-400">
              <p className="text-gray-700 text-sm">
                {review.comment || "No detailed comment provided."}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

// Sub-component: Delete Modal
const DeleteModal = ({ onConfirm, onCancel }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    modalRef.current?.querySelector("button:not([type='submit'])")?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-lg"
        role="dialog"
        aria-labelledby="delete-modal-title"
        tabIndex="-1"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-600" />
            </div>
            <h3
              id="delete-modal-title"
              className="text-base font-medium text-gray-900"
            >
              Delete Review
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-600 mb-4 text-sm">
            Are you sure you want to delete this review? This action cannot be
            undone and will permanently remove your feedback.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium text-sm"
            >
              Delete Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Review Form
const ReviewForm = ({ propertyId, onSubmit, submitting, successMessage }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating.");
      return;
    }
    if (!currentUser) {
      setError("Please sign in to submit a review.");
      return;
    }

    try {
      await onSubmit({
        rating,
        comment,
        propertyId,
        avatar: currentUser.avatar,
        status: "pending",
      });
      setRating(0);
      setComment("");
      setError("");
    } catch (err) {
      const [status, message] = err.message.split(": ");
      if (status === "403") {
        setError(
          "You must have stayed at or purchased this property to review."
        );
      } else if (status === "400") {
        setError(message || "Invalid review data. Please try again.");
      } else if (status === "401") {
        setError("Your session has expired. Please sign in again.");
      } else {
        setError("Failed to submit review. Please try again.");
      }
    }
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          Share Your Experience
        </h3>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
          <p className="text-teal-700 text-sm">{successMessage}</p>
        </div>
      )}

      {currentUser ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How was your experience? <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`Rate ${i + 1} out of 5 stars`}
                  className="focus:outline-none"
                >
                  <Star
                    size={24}
                    className={
                      i < (hoveredRating || rating)
                        ? "text-teal-500 fill-teal-500"
                        : "text-gray-300 hover:text-teal-300"
                    }
                  />
                </button>
              ))}
            </div>
            {(hoveredRating || rating) > 0 && (
              <p className="text-sm text-gray-600">
                {ratingLabels[hoveredRating || rating]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tell us more about your experience
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-all resize-none"
              placeholder="What did you love about this property? Any tips for future guests?"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Publishing Review...
              </span>
            ) : (
              "Publish Review"
            )}
          </button>
        </div>
      ) : (
        <div className="text-center py-6">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-base font-medium text-gray-700 mb-1">
            Sign in to share your review
          </h4>
          <p className="text-gray-600 mb-3 text-sm">
            Help others make informed decisions by sharing your experience
          </p>
          <a
            href="/sign-in"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm"
          >
            Sign In to Review
          </a>
        </div>
      )}
    </div>
  );
};

// Main Component
const PropertyReviews = ({ propertyId, className }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/review/property/${propertyId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          setReviews([]);
          return;
        }
        throw new Error(
          `${response.status}: ${
            errorData.message || "Failed to fetch reviews"
          }`
        );
      }
      const data = await response.json();
      setReviews(data || []);
    } catch (error) {
      setError("Failed to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const handleReviewSubmit = async (reviewData) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            currentUser?.refreshToken || localStorage.getItem("refreshToken")
          }`,
        },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `${response.status}: ${
            errorData.message || "Failed to submit review"
          }`
        );
      }
      const data = await response.json();
      setSuccessMessage(
        "Review submitted successfully! Awaiting admin approval."
      );
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setShowDeleteModal(reviewId);
  };

  const confirmDeleteReview = async () => {
    if (!showDeleteModal) return;
    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/review/${showDeleteModal}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              currentUser?.refreshToken || localStorage.getItem("refreshToken")
            }`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `${response.status}: ${
            errorData.message || "Failed to delete review"
          }`
        );
      }
      setReviews((prev) =>
        prev.filter((review) => review._id !== showDeleteModal)
      );
      setSuccessMessage("Review deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const [status, message] = error.message.split(": ");
      if (status === "403") {
        setError("You are not authorized to delete this review.");
      } else if (status === "401") {
        setError("Your session has expired. Please sign in again.");
      } else {
        setError("Failed to delete review. Please try again.");
      }
    } finally {
      setSubmitting(false);
      setShowDeleteModal(null);
    }
  };

  const cancelDeleteReview = () => {
    setShowDeleteModal(null);
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm text-center border border-red-200">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <X className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-base font-medium text-gray-900 mb-1">
          Something went wrong
        </h3>
        <p className="text-gray-600 mb-4 text-sm">{error}</p>
        <button
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm"
          onClick={fetchReviews}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="reviews-heading"
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2
            id="reviews-heading"
            className="text-xl font-medium text-gray-900"
          >
            Guest Reviews & Ratings
          </h2>
          <p className="text-gray-600 text-sm">
            See what others are saying about this property
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] bg-gray-50 rounded-lg">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-3 text-gray-600 text-sm">Loading reviews...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AverageRating reviews={reviews} />
          <ReviewList
            reviews={reviews}
            currentUser={currentUser}
            onDelete={handleDeleteReview}
            showAll={showAll}
          />

          {reviews.length > 3 && (
            <div className="text-center">
              <button
                onClick={toggleShowAll}
                className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-teal-300 transition-colors font-medium text-sm"
              >
                {showAll ? (
                  <>
                    Show Less Reviews
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    Show All {reviews.length} Reviews
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            </div>
          )}

          <ReviewForm
            propertyId={propertyId}
            onSubmit={handleReviewSubmit}
            submitting={submitting}
            successMessage={successMessage}
          />

          {showDeleteModal && (
            <DeleteModal
              onConfirm={confirmDeleteReview}
              onCancel={cancelDeleteReview}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default PropertyReviews;
