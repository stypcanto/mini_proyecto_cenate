// src/pages/admin/users/components/common/StatCard.jsx
import React from 'react';

const colorClasses = {
  blue: 'bg-blue-50 border-blue-100',
  teal: 'bg-teal-50 border-teal-100',
  green: 'bg-emerald-50 border-emerald-100',
  red: 'bg-red-50 border-red-100',
  orange: 'bg-orange-50 border-orange-100',
  purple: 'bg-purple-50 border-purple-100',
};

const iconClasses = {
  blue: 'text-blue-600',
  teal: 'text-teal-600',
  green: 'text-emerald-600',
  red: 'text-red-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
};

const textClasses = {
  blue: 'text-blue-700',
  teal: 'text-teal-700',
  green: 'text-emerald-700',
  red: 'text-red-700',
  orange: 'text-orange-700',
  purple: 'text-purple-700',
};

const StatCard = ({ title, value, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`p-5 border-2 rounded-xl shadow-sm flex items-center justify-between transition-all hover:shadow-md ${colorClasses[color]} ${
      onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
    }`}
  >
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${textClasses[color]}`}>{value}</p>
    </div>
    <div className={`${iconClasses[color]}`}>
      {React.cloneElement(icon, { className: 'w-8 h-8', strokeWidth: 2 })}
    </div>
  </div>
);

export default StatCard;