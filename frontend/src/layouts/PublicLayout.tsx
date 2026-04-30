import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { isBackoffice } from '../utils/roles';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function PublicLayout() {
  const { isAuthenticated, utilizador } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardHref = isAuthenticated
    ? isBackoffice(utilizador?.tipoConta) ? '/backoffice' : '/portal'
    : '/login';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1 font-semibold transition-all'
        : 'text-slate-700 hover:text-[#D4AF37] transition-colors';
  return (
    <div className="min-h-screen flex flex-col font-manrope">

      {/* ── Navbar ───────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 shadow-sm bg-slate-50/95 backdrop-blur-md border-b border-slate-200">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-screen-2xl mx-auto">

          <Link to="/" className="text-2xl font-bold italic font-noto-serif text-slate-900 tracking-tight">
            Patudos &amp; Companhia
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex gap-8 items-center">
            <NavLink to="/" end className={navLinkClass}>Início</NavLink>
            <NavLink to="/servicos" className={navLinkClass}>Serviços</NavLink>
            <NavLink to="/contacto" className={navLinkClass}>Contacto</NavLink>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={dashboardHref}
                className="bg-[#041525] text-white text-xs font-bold uppercase tracking-widest px-6 py-2 hover:bg-slate-800 transition-colors"
              >
                {isBackoffice(utilizador?.tipoConta) ? 'Backoffice' : 'O Meu Portal'}
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-amber-700 transition-colors">
                  Entrar
                </Link>
                <Link
                  to="/registar"
                  className="bg-[#775A19] text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 hover:bg-[#5d4201] active:scale-95 transition-all"
                >
                  Reservar Agora
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-slate-700" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 flex flex-col gap-4">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>Início</NavLink>
            <NavLink to="/servicos" className={navLinkClass} onClick={() => setMenuOpen(false)}>Serviços</NavLink>
            <NavLink to="/contacto" className={navLinkClass} onClick={() => setMenuOpen(false)}>Contacto</NavLink>
            <Link
              to={isAuthenticated ? dashboardHref : '/registar'}
              className="bg-[#041525] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 text-center"
              onClick={() => setMenuOpen(false)}
            >
              {isAuthenticated ? 'Dashboard' : 'Reservar Agora'}
            </Link>
          </div>
        )}
      </nav>

      {/* ── Content ─────────────────────────────── */}
      <main className="flex-1 pt-[73px]">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────── */}
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
