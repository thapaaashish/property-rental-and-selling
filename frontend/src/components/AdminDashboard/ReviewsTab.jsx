import React from "react";
import { Star } from "lucide-react";

const ReviewsTab = ({
  reviews,
  actionLoading,
  handleApproveReview,
  handleRejectReview,
  handleDeleteReview,
  navigate,
}) => {
  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Manage Reviews
      </h2>
      {reviews.length === 0 ? (
        <p className="text-gray-600">No reviews available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review._id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={review.avatar || "/default-avatar.png"}
                        alt={review.fullname}
                        className="h-8 w-8 rounded-full mr-2"
                      />
                      <div className="text-sm text-gray-900">
                        {review.fullname}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div
                      className="text-sm text-teal-600 cursor-pointer hover:underline"
                      onClick={() =>
                        navigate(`/listings/${review.propertyId._id}`)
                      }
                    >
                      {review.propertyId?.title || "Unknown"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-400 fill-current"
                        />
                      ))}
                      <span className="ml-1 text-sm text-gray-900">
                        ({review.rating}/5)
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {review.comment || "No comment"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        review.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : review.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {review.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {review.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApproveReview(review._id)}
                          disabled={actionLoading}
                          className={`text-green-600 hover:text-green-900 mr-4 ${
                            actionLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectReview(review._id)}
                          disabled={actionLoading}
                          className={`text-red-600 hover:text-red-900 mr-4 ${
                            actionLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      disabled={actionLoading}
                      className={`text-red-600 hover:text-red-900 ${
                        actionLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;
