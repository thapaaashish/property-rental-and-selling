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
  disabled = false,
  className = "",
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full p-3 border border-gray-200 rounded-lg text-gray-700 focus:border-gray-900 focus:outline-none disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        >
          <option value="">Select an option</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === "radio" ? (
        <div className="flex gap-6">
          {options.map((option, index) => (
            <label
              key={index}
              className="flex items-center gap-2 text-gray-700"
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={onChange}
                disabled={disabled}
                className="h-4 w-4 text-gray-900 border-gray-200 rounded-full focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed"
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
          disabled={disabled}
          className={`w-full p-3 border border-gray-200 rounded-lg text-gray-700 focus:border-gray-900 focus:outline-none disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormInput;
