import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, FileText, LogOut, Menu, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);
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
    setUser(null);
    window.location.href = "/";
  };

  const isActive = (path) => location.pathname === path;

  // No mostrar nav en login y home
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/registro" ||
    location.pathname === "/forgot-password"
  ) {
    return null;
  }

  return (
    <nav
      style={{ backgroundColor: "#2e63a6" }}
      className="shadow-lg sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3">
            <img
              src="/images/Logo CENATE Blanco.png"
              alt="CENATE"
              className="h-10 w-auto object-contain"
            />
            <div className="hidden md:block">
              <h1 className="text-white font-bold text-lg">CENATE</h1>
              <p className="text-blue-100 text-xs">Sistema de Gestión</p>
            </div>
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/pacientes"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive("/pacientes")
                  ? "bg-white shadow-md"
                  : "text-white hover:bg-white hover:bg-opacity-10"
              }`}
              style={isActive("/pacientes") ? { color: "#2e63a6" } : {}}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Pacientes</span>
            </Link>

            <Link
              to="/transferencia-examenes"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive("/transferencia-examenes")
                  ? "bg-white shadow-md"
                  : "text-white hover:bg-white hover:bg-opacity-10"
              }`}
              style={
                isActive("/transferencia-examenes") ? { color: "#2e63a6" } : {}
              }
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Transferencia Exámenes</span>
            </Link>
          </div>

          {/* Usuario y Logout */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="text-white">
                <p className="text-sm font-medium">{user.nombre}</p>
                <p className="text-xs text-blue-100">{user.rol}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Salir</span>
            </button>
          </div>

          {/* Menú Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
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
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive("/pacientes")
                  ? "bg-white"
                  : "text-white hover:bg-white hover:bg-opacity-10"
              }`}
              style={isActive("/pacientes") ? { color: "#2e63a6" } : {}}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Pacientes</span>
            </Link>

            <Link
              to="/transferencia-examenes"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive("/transferencia-examenes")
                  ? "bg-white"
                  : "text-white hover:bg-white hover:bg-opacity-10"
              }`}
              style={
                isActive("/transferencia-examenes") ? { color: "#2e63a6" } : {}
              }
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Transferencia Exámenes</span>
            </Link>

            {user && (
              <div className="px-4 py-3 bg-white bg-opacity-10 rounded-lg">
                <p className="text-white text-sm font-medium">{user.nombre}</p>
                <p className="text-blue-100 text-xs">{user.rol}</p>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
