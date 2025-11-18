// src/pages/admin/users/components/common/TabButton.jsx
import React from 'react';
import clsx from 'clsx';

const TabButton = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
        active
          ? 'bg-cenate-600 text-white shadow-sm hover:bg-cenate-700'
          : 'text-gray-600 hover:bg-gray-100'
      )}
    >
      {icon}
      {label}
    </button>
  );
};

export default TabButton;