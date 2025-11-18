// src/pages/admin/users/components/common/FormField.jsx
import React from 'react';

const FormField = ({ label, name, value, onChange, type = 'text', placeholder = '', required, errors, maxLength }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      className={`w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
        errors && errors[name] ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {errors && errors[name] && (
      <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
    )}
  </div>
);

export default FormField;