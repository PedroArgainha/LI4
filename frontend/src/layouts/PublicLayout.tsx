import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { isBackoffice } from '../utils/roles';
import { useState } from 'react';
import { Menu, X, UserRound } from 'lucide-react';

export default function PublicLayout() {
  const { isAuthenticated, utilizador } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardHref = isAuthenticated
      ? isBackoffice(utilizador?.tipoConta) ? '/backoffice' : '/portal'
      : '/login';

  const reservasHref = isAuthenticated
      ? isBackoffice(utilizador?.tipoConta) ? '/backoffice/reservas' : '/portal/reservas'
      : '/registar';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
      `text-sm transition-colors pb-1 ${isActive ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold' : 'text-slate-700 hover:text-[#D4AF37]'}`;

  const plainLinkClass = 'text-sm text-slate-700 hover:text-[#D4AF37] transition-colors pb-1';

  return (
      <div className="min-h-screen flex flex-col font-manrope bg-[#fbfaf7]">
        <nav className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="h-[74px] flex justify-between items-center px-6 md:px-12 max-w-screen-2xl mx-auto">
            <Link to="/" className="text-2xl font-bold font-noto-serif text-slate-900 tracking-tight">
              Patudos &amp; Companhia
            </Link>

            <div className="hidden lg:flex gap-8 items-center">
              <NavLink to="/servicos" className={navLinkClass}>Serviços</NavLink>
              <Link to="/#suites" className={plainLinkClass}>Suítes</Link>
              <Link to={reservasHref} className={plainLinkClass}>Reservas</Link>
              <Link to="/#sobre" className={plainLinkClass}>Sobre Nós</Link>
              <NavLink to="/contacto" className={navLinkClass}>Contacto</NavLink>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                  <Link
                      to={dashboardHref}
                      className="border border-slate-300 bg-white text-slate-800 text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-slate-50 transition-colors"
                  >
                    {isBackoffice(utilizador?.tipoConta) ? 'Backoffice' : 'Portal'}
                  </Link>
              ) : (
                  <Link to="/login" className="border border-slate-300 bg-white text-slate-800 text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-slate-50 transition-colors">
                    Entrar
                  </Link>
              )}
              <Link
                  to={reservasHref}
                  className="bg-[#775A19] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#5d4201] active:scale-95 transition-all"
              >
                Reservar Agora
              </Link>
              <Link to={isAuthenticated ? dashboardHref : '/login'} className="p-2 text-slate-700 hover:text-[#775A19] transition-colors" aria-label="Conta">
                <UserRound size={22} />
              </Link>
            </div>

            <button className="lg:hidden p-2 text-slate-700" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {menuOpen && (
              <div className="lg:hidden border-t border-slate-200 bg-white px-6 py-4 flex flex-col gap-4">
                <NavLink to="/servicos" className={navLinkClass} onClick={() => setMenuOpen(false)}>Serviços</NavLink>
                <Link to="/#suites" className={plainLinkClass} onClick={() => setMenuOpen(false)}>Suítes</Link>
                <Link to={reservasHref} className={plainLinkClass} onClick={() => setMenuOpen(false)}>Reservas</Link>
                <Link to="/#sobre" className={plainLinkClass} onClick={() => setMenuOpen(false)}>Sobre Nós</Link>
                <NavLink to="/contacto" className={navLinkClass} onClick={() => setMenuOpen(false)}>Contacto</NavLink>
                <Link
                    to={isAuthenticated ? dashboardHref : '/login'}
                    className="border border-slate-300 bg-white text-slate-800 text-xs font-bold uppercase tracking-widest px-6 py-3 text-center"
                    onClick={() => setMenuOpen(false)}
                >
                  {isAuthenticated ? 'Portal' : 'Entrar'}
                </Link>
                <Link
                    to={reservasHref}
                    className="bg-[#775A19] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 text-center"
                    onClick={() => setMenuOpen(false)}
                >
                  Reservar Agora
                </Link>
              </div>
          )}
        </nav>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="bg-slate-900 text-slate-100 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 gap-6 max-w-screen-2xl mx-auto">
            <div className="text-xl font-bold font-noto-serif text-white italic">
              Patudos &amp; Companhia
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {['Privacidade', 'Termos', 'Localização', 'FAQ'].map((l) => (
                  <a key={l} href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                    {l}
                  </a>
              ))}
            </div>
            <p className="text-slate-400 text-sm text-center md:text-right">
              © {new Date().getFullYear()} Patudos &amp; Companhia. Elite Pet Hospitality.
            </p>
          </div>
        </footer>
      </div>
  );
}
