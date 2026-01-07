// src/pages/admin/users/components/common/TabButton.jsx
import React from 'react';
import clsx from 'clsx';

const TabButton = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        active
          ? 'bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white shadow-md hover:shadow-lg hover:from-[#084682] hover:to-[#1e4ed8] transform hover:scale-[1.02]'
          : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm hover:text-gray-900'
      )}
    >
      <span className={clsx(
        'transition-transform duration-200',
        active ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
      )}>
        {icon}
      </span>
      <span className="relative z-10">{label}</span>
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50 rounded-full"></span>
      )}
    </button>
  );
};

export default TabButton;