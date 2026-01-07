// src/pages/admin/users/components/common/SelectField.jsx
import React from 'react';

const SelectField = ({ label, name, value, onChange, options = [], required, errors }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
        errors && errors[name] ? 'border-red-500' : 'border-gray-300'
      }`}
    >
      <option value="">Seleccione...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {errors && errors[name] && (
      <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
    )}
  </div>
);

export default SelectField;