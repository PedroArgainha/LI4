import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';

export default function ClientLayout() {
  const { utilizador, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
      `text-sm transition-colors pb-1 ${isActive ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold' : 'text-slate-700 hover:text-[#D4AF37]'}`;

  const links = [
    { to: '/portal', label: 'Início', end: true },
    { to: '/portal/animais', label: 'Os Meus Animais' },
    { to: '/portal/reservas', label: 'Reservas' },
    { to: '/portal/perfil', label: 'Perfil' },
  ];

  return (
      <div className="min-h-screen bg-[#f7f5f0] font-manrope">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="h-[74px] flex items-center justify-between px-6 md:px-12 max-w-screen-2xl mx-auto">
            <Link to="/" className="text-2xl font-bold font-noto-serif text-slate-900 tracking-tight">
              Patudos &amp; Companhia
            </Link>

            <nav className="hidden lg:flex gap-8 items-center">
              {links.map(({ to, label, end }) => (
                  <NavLink key={to} to={to} end={end} className={navLinkClass}>{label}</NavLink>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-700 mr-2">
                <div className="w-8 h-8 rounded-full bg-[#FDD587] text-[#775A19] flex items-center justify-center font-bold text-xs">
                  {utilizador?.nome?.[0]?.toUpperCase() ?? <UserRound size={16} />}
                </div>
                <span className="max-w-[160px] truncate">{utilizador?.nome}</span>
              </div>
              <Link
                  to="/portal/reservas"
                  className="bg-[#775A19] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#5d4201] active:scale-95 transition-all"
              >
                Reservar Agora
              </Link>
              <button
                  onClick={handleLogout}
                  className="border border-slate-300 bg-white text-slate-800 text-xs font-bold uppercase tracking-widest px-5 py-3 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
              >
                <LogOut size={14} /> Sair
              </button>
            </div>

            <button className="lg:hidden p-2 text-slate-700" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {menuOpen && (
              <div className="lg:hidden border-t border-slate-200 bg-white px-6 py-4 flex flex-col gap-4">
                {links.map(({ to, label, end }) => (
                    <NavLink key={to} to={to} end={end} className={navLinkClass} onClick={() => setMenuOpen(false)}>{label}</NavLink>
                ))}
                <button
                    onClick={handleLogout}
                    className="border border-slate-300 bg-white text-slate-800 text-xs font-bold uppercase tracking-widest px-6 py-3 text-center inline-flex justify-center items-center gap-2"
                >
                  <LogOut size={14} /> Sair
                </button>
              </div>
          )}
        </header>

        <main className="max-w-screen-xl mx-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
  );
}
