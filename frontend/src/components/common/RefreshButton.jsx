import { useState } from "react";
import { RefreshCw } from "lucide-react";

const RefreshButton = ({ onRefresh, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsLoading(false), 500); // Ensure loading state is visible for at least 500ms
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-200 ${
        isLoading || disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title="Refresh data"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
    </button>
  );
};

export default RefreshButton;
