import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md">
                <h1 className="text-8xl font-bold mb-4 text-[#2e63a6]">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Página no encontrada
                </h2>
                <p className="text-gray-600 mb-6">
                    La página que estás buscando no existe o fue movida.
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-[#2e63a6] text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
