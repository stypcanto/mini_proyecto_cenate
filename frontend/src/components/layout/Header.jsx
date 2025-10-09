import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, FileText, LogOut, Menu, X, User, Bell } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    setUser(null);
    window.location.href = "/";
  };

  const isActive = (path) => location.pathname === path;

  // No mostrar nav en páginas públicas
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/registro" ||
    location.pathname === "/forgot-password"
  ) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-[#2e63a6] via-[#2456a0] to-[#1d4f8a] shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logos compactos */}
          <div className="flex items-center gap-4">
            <img
              src="/images/Logo ESSALUD Blanco.png"
              alt="EsSalud"
              className="h-10 object-contain"
            />
            <div className="border-l border-white/30 h-10"></div>
            <img
              src="/images/Logo CENATE Blanco.png"
              alt="CENATE"
              className="h-10 object-contain"
            />
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/pacientes"
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all duration-300 ${
                isActive("/pacientes")
                  ? "bg-white shadow-lg text-[#2e63a6]"
                  : "text-white hover:bg-white/20"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-semibold">Pacientes</span>
            </Link>

            <Link
              to="/transferencia-examenes"
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all duration-300 ${
                isActive("/transferencia-examenes")
                  ? "bg-white shadow-lg text-[#2e63a6]"
                  : "text-white hover:bg-white/20"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-semibold">Exámenes</span>
            </Link>
          </div>

          {/* Usuario y acciones */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-300"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#2e63a6] to-[#1d4f8a] px-4 py-3">
                    <h3 className="text-white font-bold text-sm">Notificaciones</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                      <p className="text-sm text-gray-900 font-semibold">Sistema actualizado</p>
                      <p className="text-xs text-gray-600 mt-1">Nuevas funcionalidades disponibles</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Usuario */}
            {user && (
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#2e63a6]" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-white text-sm font-bold leading-tight">{user.nombre}</p>
                  <p className="text-blue-100 text-xs">{user.rol || 'Usuario'}</p>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-red-500 text-white rounded-lg transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Salir</span>
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Mobile */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/pacientes"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/pacientes")
                  ? "bg-white text-[#2e63a6]"
                  : "text-white hover:bg-white/20"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-semibold">Pacientes</span>
            </Link>

            <Link
              to="/transferencia-examenes"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/transferencia-examenes")
                  ? "bg-white text-[#2e63a6]"
                  : "text-white hover:bg-white/20"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-semibold">Exámenes</span>
            </Link>

            {user && (
              <div className="px-4 py-3 bg-white/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#2e63a6]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{user.nombre}</p>
                    <p className="text-blue-100 text-xs">{user.rol || 'Usuario'}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 bg-red-500/20 hover:bg-red-500 text-white rounded-lg transition-all font-semibold"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;