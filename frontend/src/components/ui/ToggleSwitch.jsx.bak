// ========================================================================
// 🎚️ ToggleSwitch.jsx - Toggle estilo iOS/Apple
// ========================================================================

import React from "react";

export default function ToggleSwitch({ 
  enabled, 
  onChange, 
  disabled = false,
  size = "md" // "sm" | "md" | "lg"
}) {
  const sizes = {
    sm: "w-9 h-5",
    md: "w-11 h-6",
    lg: "w-14 h-7"
  };

  const dotSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const translateX = {
    sm: "translate-x-5",
    md: "translate-x-6",
    lg: "translate-x-8"
  };

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        ${sizes[size]} rounded-full p-0.5 transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${enabled 
          ? 'bg-blue-500 hover:bg-blue-600' 
          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          ${dotSizes[size]} block rounded-full bg-white shadow-md transform transition-transform duration-200
          ${enabled ? translateX[size] : 'translate-x-0'}
        `}
      />
    </button>
  );
}
