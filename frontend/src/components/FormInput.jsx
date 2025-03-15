import React from "react";

const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false, // Add disabled prop
  className = "", // Add className prop
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled} // Add disabled prop
          className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""
          } ${className}`} // Add className and disabled styles
        >
          <option value="">Select an option</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === "radio" ? (
        <div className="flex space-x-4">
          {options.map((option, index) => (
            <label key={index} className="flex items-center">
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={onChange}
                disabled={disabled} // Add disabled prop
                className={`mr-2 ${
                  disabled ? "opacity-60 cursor-not-allowed" : ""
                }`} // Add disabled styles
              />
              {option}
            </label>
          ))}
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled} // Add disabled prop
          className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""
          } ${className}`} // Add className and disabled styles
        />
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;