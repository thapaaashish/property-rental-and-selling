import React from "react";

const Messages = ({ messages, formatDate, navigate }) => {
  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Messages</h2>
      {messages.length === 0 ? (
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No messages yet
          </h3>
          <p className="text-gray-600">
            You haven't made any inquiries on properties yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((inquiry) => (
            <div
              key={inquiry._id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-800">
                  Inquiry for: {inquiry.listingTitle}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatDate(inquiry.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{inquiry.message}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/listing/${inquiry.listingId}`)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Listing
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
