import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PawPrint, Home, Calendar, Dog, LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function ClientLayout() {
  const { utilizador, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/portal', label: 'Dashboard', icon: Home, end: true },
    { to: '/portal/animais', label: 'Os Meus Animais', icon: Dog },
    { to: '/portal/reservas', label: 'Reservas', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 fixed h-full">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-brand-500 text-white p-1.5 rounded-lg">
              <PawPrint size={18} />
            </div>
            <span className="font-bold text-sm text-gray-900">Patudos <span className="text-brand-500">&amp; Cia</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full transition-colors"
          >
            <LogOut size={16} />
            Terminar sessão
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-60">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6">
          <div className="md:hidden flex items-center gap-2">
            <div className="bg-brand-500 text-white p-1.5 rounded-lg">
              <PawPrint size={16} />
            </div>
          </div>
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-medium text-xs">
                {utilizador?.nome?.[0]?.toUpperCase()}
              </div>
              <span className="hidden md:block">{utilizador?.nome}</span>
              <ChevronDown size={14} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                <Link
                  to="/portal/perfil"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={14} /> Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut size={14} /> Sair
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40">
          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors ${
                  isActive ? 'text-brand-600' : 'text-gray-500'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
