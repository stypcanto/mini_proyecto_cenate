import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  FileText, 
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState('');

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
    },
    {
      title: 'Usuarios',
      icon: Users,
      submenu: [
        { title: 'Lista de Usuarios', path: '/admin/users' },
        { title: 'Crear Usuario', path: '/admin/users/create' },
      ],
    },
    {
      title: 'Roles y Permisos',
      icon: Shield,
      path: '/admin/roles',
    },
    {
      title: 'Logs del Sistema',
      icon: FileText,
      path: '/admin/logs',
    },
    {
      title: 'Reportes',
      icon: FileText,
      path: '/admin/reports',
    },
  ];

  const toggleSubmenu = (title) => {
    setOpenMenu(openMenu === title ? '' : title);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white flex flex-col shadow-2xl">
      {/* Header con usuario */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center font-bold text-lg shadow-lg">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm truncate">
              {user?.nombreCompleto || user?.username}
            </h3>
            <p className="text-xs text-slate-400">{user?.roles?.[0]}</p>
          </div>
        </div>
      </div>

      {/* Menú */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isMenuOpen = openMenu === item.title;

            return (
              <li key={idx}>
                {hasSubmenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.title)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      {isMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {isMenuOpen && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.submenu.map((sub, subIdx) => (
                          <li key={subIdx}>
                            <Link
                              to={sub.path}
                              className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                                isActive(sub.path)
                                  ? 'bg-teal-500 text-white font-medium'
                                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                              }`}
                            >
                              {sub.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-teal-500 text-white font-medium shadow-lg'
                        : 'hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer con logout */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
