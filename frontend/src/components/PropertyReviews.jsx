import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Star, Trash2, X } from "lucide-react";

// Sub-component: Average Rating
const AverageRating = ({ reviews }) => {
  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      ).toFixed(1)
    : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            className={
              i < Math.round(averageRating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-900">
        {averageRating} ({reviews.length} reviews)
      </span>
    </div>
  );
};

// Sub-component: Review List
const ReviewList = ({ reviews, currentUser, onDelete }) => {
  if (!reviews.length) {
    return (
      <p className="text-sm text-gray-600">
        No reviews yet. Be the first to share your experience!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article
          key={review._id}
          className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:bg-gray-50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {review.avatar ? (
                <img
                  src={review.avatar}
                  alt={`${review.fullname || "Anonymous"}'s avatar`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium border border-gray-200"
                style={{ display: review.avatar ? "none" : "flex" }}
              >
                {review.fullname ? review.fullname[0].toUpperCase() : "?"}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {review.fullname || "Anonymous"}
                </span>
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }
                    aria-hidden="true"
                  />
                ))}
              </div>
              {currentUser && currentUser._id === review.userId && (
                <button
                  onClick={() => onDelete(review._id)}
                  className="p-1.5 rounded-full text-red-600 hover:bg-red-100 hover:text-red-700 focus:outline-none transition-colors"
                  aria-label="Delete review"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {review.comment || "No comment provided."}
          </p>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-sm"
        role="dialog"
        aria-labelledby="delete-modal-title"
        tabIndex="-1"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3
            id="delete-modal-title"
            className="text-lg font-medium text-gray-900"
          >
            Delete Review
          </h3>
          <button
            onClick={onCancel}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete this review? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Delete
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
      {successMessage && (
        <p className="text-sm text-green-500 mb-4">{successMessage}</p>
      )}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  aria-label={`Rate ${i + 1} out of 5 stars`}
                  className="focus:outline-none"
                >
                  <Star
                    size={22}
                    className={
                      i < rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Comment (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full p-3 border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
              placeholder="Share your experience..."
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-600">
          Please{" "}
          <a
            href="/sign-in"
            className="text-gray-900 underline hover:text-gray-700"
          >
            sign in
          </a>{" "}
          to write a review.
        </p>
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

  const { currentUser } = useSelector((state) => state.user);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/${propertyId}`);
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
      setReviews(data.reviews || []);
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
      const response = await fetch("/api/reviews", {
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
      const newReview = await response.json();
      setReviews((prev) => [...prev, newReview.review]);
      setSuccessMessage("Review submitted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
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
      const response = await fetch(`/api/reviews/${showDeleteModal}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            currentUser?.refreshToken || localStorage.getItem("refreshToken")
          }`,
        },
      });
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

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm text-center border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
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
      className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm ${className}`}
    >
      <h2 id="reviews-heading" className="text-xl font-bold text-gray-800 mb-4">
        Reviews & Ratings
      </h2>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <AverageRating reviews={reviews} />
          <ReviewList
            reviews={reviews}
            currentUser={currentUser}
            onDelete={handleDeleteReview}
          />
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
