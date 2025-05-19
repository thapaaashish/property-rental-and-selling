import React, { useEffect, useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";

const ImageModal = ({
  isOpen,
  imageUrl,
  onClose,
  altText = "Enlarged view",
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "+":
          setZoom((prev) => Math.min(prev + 0.25, 3));
          break;
        case "-":
          setZoom((prev) => Math.max(prev - 0.25, 0.5));
          break;
        case "r":
          setRotation((prev) => (prev + 90) % 360);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setIsLoading(true);
    }
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageUrl.split("/").pop() || "image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageLoad = () => setIsLoading(false);

  // Prevent modal from closing when clicking inside the modal
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm p-4 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative max-w-5xl w-full rounded-2xl overflow-hidden transform transition-all duration-300 ease-out"
        style={{
          background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
          boxShadow:
            "0 20px 60px -15px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1)",
        }}
        onClick={handleModalClick}
      >
        {/* Header with title and close button */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2
            id="modal-title"
            className="text-lg font-medium text-gray-800 truncate flex items-center"
          >
            <span className="inline-block w-1 h-5 bg-blue-500 rounded-full mr-3"></span>
            {altText}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main image container */}
        <div
          className="relative flex items-center justify-center h-96 md:h-screen max-h-[60vh]"
          style={{
            background: "linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%)",
            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.8)",
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 relative">
                <div className="absolute inset-0 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-2 border-4 border-transparent border-t-blue-300 rounded-full animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "0.8s",
                  }}
                ></div>
              </div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={altText}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              opacity: isLoading ? 0 : 1,
              transition: "transform 0.3s ease, opacity 0.3s ease",
            }}
            className="max-w-full max-h-full object-contain drop-shadow-lg"
            onLoad={handleImageLoad}
          />
        </div>

        {/* Controls toolbar */}
        <div
          className="p-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(to top, #f1f3f5, #ffffff)",
            borderTop: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex items-center space-x-2">
            <div className="bg-white rounded-lg shadow-sm p-1 flex items-center border border-gray-100">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <div className="px-3 text-gray-700 font-medium text-sm border-l border-r border-gray-100">
                {Math.round(zoom * 100)}%
              </div>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleRotate}
              className="p-2 rounded-lg bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm border border-gray-100"
              aria-label="Rotate image"
              title="Rotate image"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleDownload}
            className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 flex items-center shadow-sm"
            style={{
              background: "linear-gradient(to bottom, #3b82f6, #2563eb)",
            }}
            aria-label="Download image"
            title="Download image"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
