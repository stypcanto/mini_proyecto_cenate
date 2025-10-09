import React from "react";

const Profile = () => {
    const username = localStorage.getItem("username");

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Perfil de Usuario</h1>
            <div className="bg-white p-6 rounded-2xl shadow-md max-w-xl">
                <p className="text-gray-800 font-medium mb-2">Usuario:</p>
                <p className="text-gray-600 mb-4">{username}</p>
                <button className="px-6 py-3 bg-[#2e63a6] text-white rounded-lg font-semibold hover:opacity-90 transition">
                    Editar Perfil
                </button>
            </div>
        </div>
    );
};

export default Profile;
