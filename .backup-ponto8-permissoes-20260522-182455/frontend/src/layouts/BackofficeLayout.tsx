import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  PawPrint, Home, Calendar, Dog, CreditCard,
  BarChart2, Settings, LogOut, Users, Wrench,
  ChevronDown, Building2
} from 'lucide-react';
import { useState } from 'react';
import { isDirecao, isAdminOrDirecao, ROLE_LABELS } from '../utils/roles';

export default function BackofficeLayout() {
  const { utilizador, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const role = utilizador?.tipoConta;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/backoffice', label: 'Dashboard', icon: Home, end: true, show: true },
    { to: '/backoffice/reservas', label: 'Reservas', icon: Calendar, show: true },
    { to: '/backoffice/animais', label: 'Animais', icon: Dog, show: true },
    { to: '/backoffice/servicos-dia', label: 'Serviços do Dia', icon: Wrench, show: role === 'FUNC_OPERACIONAL' || role === 'FUNC_ADMINISTRATIVO' || role === 'ADMIN' },
    { to: '/backoffice/pagamentos', label: 'Pagamentos', icon: CreditCard, show: role === 'FUNC_ADMINISTRATIVO' || role === 'ADMIN' },
    { to: '/backoffice/utilizadores', label: 'Utilizadores', icon: Users, show: isAdminOrDirecao(role) },
    { to: '/backoffice/espacos', label: 'Espaços', icon: Building2, show: isDirecao(role) },
    { to: '/backoffice/servicos', label: 'Catálogo Serviços', icon: Settings, show: isDirecao(role) },
    { to: '/backoffice/relatorios', label: 'Relatórios', icon: BarChart2, show: isDirecao(role) },
  ].filter((l) => l.show);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-gray-900 fixed h-full">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-700">
          <div className="bg-brand-500 text-white p-1.5 rounded-lg">
            <PawPrint size={18} />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">Patudos &amp; Cia</p>
            <p className="text-gray-400 text-xs mt-0.5">Backoffice</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                          isActive
                              ? 'bg-white/10 text-[#D4AF37] border-l-4 border-[#D4AF37]'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                      }`
                  }
              >
                <Icon size={16} />
                {label}
              </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {utilizador?.nome?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{utilizador?.nome}</p>
              <p className="text-gray-400 text-xs truncate">{role ? ROLE_LABELS[role] : ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-colors"
          >
            <LogOut size={16} />
            Terminar sessão
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-60">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6">
          <h1 className="font-semibold text-gray-900 text-sm md:text-base">Backoffice</h1>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-medium text-xs">
                {utilizador?.nome?.[0]?.toUpperCase()}
              </div>
              <ChevronDown size={14} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
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

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
