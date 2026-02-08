import React from 'react';

/**
 * Tooltip component - displays on hover with pure CSS
 * @param {React.ReactNode} children - Element to show tooltip on
 * @param {string} text - Tooltip text content
 * @param {string} position - Tooltip position: 'top', 'bottom', 'left', 'right' (default: 'top')
 */
export default function Tooltip({ children, text, position = 'top' }) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={`absolute ${positionClasses[position]} px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-[9999] pointer-events-none`}
        role="tooltip"
      >
        {text}
        <div className={`absolute ${arrowClasses[position]}`}></div>
      </div>
    </div>
  );
}
