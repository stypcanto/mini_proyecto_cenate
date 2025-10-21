import React from "react";

const UserDashboard = () => {
    const username = localStorage.getItem("username");
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-3">
                    Bienvenido, {username}
                </h1>
                <p className="text-gray-600 mb-6">
                    Este es tu portal de usuario del sistema CENATE.
                </p>
            </div>
        </div>
    );
};

export default UserDashboard;
