import React, { useCallback } from "react";
import { Upload, X } from "lucide-react";

const ImagesStep = ({
  files,
  setFiles,
  formData,
  handleRemoveImage,
  uploading,
  imageUploadError,
  handleImageSubmit,
}) => {
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );
    if (selectedFiles.length > 0)
      setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );
    if (droppedFiles.length > 0) setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleDragOver = useCallback((e) => e.preventDefault(), []);

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <label className="flex items-center justify-center gap-2 text-gray-600 cursor-pointer">
          <Upload size={20} />
          <span>
            Drop images or <span className="text-gray-900">browse</span>
          </span>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            multiple
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-400 mt-1">Max 5MB, JPG/PNG</p>
      </div>
      {(files.length > 0 || formData.imageUrls.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {files.map((file, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden"
            >
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() =>
                  setFiles((prev) => prev.filter((_, index) => index !== i))
                }
                className="absolute top-1 right-1 bg-gray-900 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {formData.imageUrls.map((url, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemoveImage(i)}
                className="absolute top-1 right-1 bg-gray-900 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={handleImageSubmit}
        disabled={uploading || files.length === 0}
        className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {imageUploadError && (
        <p className="text-sm text-red-500">{imageUploadError}</p>
      )}
    </div>
  );
};

export default ImagesStep;