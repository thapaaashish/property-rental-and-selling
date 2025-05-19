import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Popup = ({ message, type = "success", duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
    info: "bg-blue-100 border-blue-500 text-blue-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
  };

  const iconStyles = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  };

  const icons = {
    success: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    error: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    info: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  };

  return createPortal(
    <div className="fixed inset-0 flex items-start justify-center pt-4 px-4 pointer-events-none z-[9999]">
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }

          @keyframes fade-out {
            to { opacity: 0; transform: translateY(-20px); }
          }
          .animate-fade-out {
            animation: fade-out 0.3s ease-in forwards;
          }

          @keyframes timer-bar {
            from { width: 100%; }
            to { width: 0%; }
          }
          .animate-timer-bar {
            animation: timer-bar linear forwards;
          }
        `}
      </style>

      <div className="animate-fade-in">
        <div
          className={`relative p-4 rounded-lg shadow-md border-l-4 ${typeStyles[type]} max-w-md pointer-events-auto`}
        >
          <div className="flex items-start">
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button
              onClick={onClose}
              className={`ml-4 flex-shrink-0 ${iconStyles[type]} hover:opacity-70 transition-opacity`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {duration > 0 && (
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 rounded-b-lg animate-timer-bar"
              style={{ animationDuration: `${duration}ms` }}
            ></div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Popup;
