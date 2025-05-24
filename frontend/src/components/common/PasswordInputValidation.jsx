import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({
  value,
  onChange,
  onValidationChange,
  placeholder = "Password",
  className = "",
  required = false,
  disabled = false,
  showValidation = true,
  id = "password",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Validate password and update state
  useEffect(() => {
    const newValidation = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    };

    setValidation(newValidation);

    // Call parent callback with validation status
    if (onValidationChange) {
      const isValid =
        Object.values(newValidation).every(Boolean) && value.length > 0;
      const validCount = Object.values(newValidation).filter(Boolean).length;
      onValidationChange({
        isValid,
        validation: newValidation,
        validCount,
        hasError: value.length > 0 && !isValid,
      });
    }
  }, [value, onValidationChange]);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const getStrengthWidth = () => {
    const validCount = Object.values(validation).filter(Boolean).length;
    if (validCount >= 5) return "w-full";
    if (validCount >= 4) return "w-4/5";
    if (validCount >= 3) return "w-3/5";
    if (validCount >= 2) return "w-2/5";
    if (validCount >= 1) return "w-1/5";
    return "w-0";
  };

  const getStrengthColor = () => {
    const validCount = Object.values(validation).filter(Boolean).length;
    if (validCount >= 4) return "bg-green-500";
    if (validCount >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={`w-full border rounded-md p-2 pr-10 focus:outline-sky-500 transition-colors duration-200 ${className}`}
          id={id}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
          disabled={disabled}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* Compact Password Validation */}
      {showValidation && value && (
        <div className="mt-2">
          {/* Strength Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
            />
          </div>

          {/* Inline Requirements */}
          <div className="flex flex-wrap gap-1 text-xs">
            <span
              className={`px-2 py-1 rounded-full transition-all duration-200 ${
                validation.length
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              8+ chars
            </span>
            <span
              className={`px-2 py-1 rounded-full transition-all duration-200 ${
                validation.uppercase
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              A-Z
            </span>
            <span
              className={`px-2 py-1 rounded-full transition-all duration-200 ${
                validation.lowercase
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              a-z
            </span>
            <span
              className={`px-2 py-1 rounded-full transition-all duration-200 ${
                validation.number
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              0-9
            </span>
            <span
              className={`px-2 py-1 rounded-full transition-all duration-200 ${
                validation.special
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              !@#
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
