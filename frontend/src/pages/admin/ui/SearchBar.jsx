import React from "react";

export default function SearchBar({ value, onChange }) {
    return (
        <input
            type="text"
            placeholder="Buscar..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full max-w-md px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
    );
}
