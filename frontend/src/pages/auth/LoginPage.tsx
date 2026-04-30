import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/authApi';
import { isBackoffice } from '../../utils/roles';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, utilizador } = await authApi.login({ email, password });
      login(token, utilizador);
      const dest = from ?? (isBackoffice(utilizador.tipoConta) ? '/backoffice' : '/portal');
      navigate(dest, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-manrope">

      {/* Main area: bg image + card */}
      <div
        className="flex-1 flex items-center justify-center px-4 py-16 relative"
        style={{
          backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuC9CJ2zfMg84j_NJF8jisSs2iXpXPl-TLBVCIjXjKLcOwdIXRKAj0KFhT4U2Wys9E1br9ZG4_5A2yZa_6VLTbQ9O3xR5f0QeL3ynY21ph2czl1THPGa2hJU65UNNtp3bXGuaqyxk8LRp13kvuze4egZr8CohgjbqtEnBgq0EFTuceVbKMrjdINDEWQTPLttIt0MyhdgiFvSelJ_-A9FPWUIJAuVRD9K9gBz1IL4H0CugcEVOJYWleIVrNinQjdBA8AYP2NH0XlbOPHD")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-slate-200/60" />

        {/* card */}
        <div className="relative z-10 w-full max-w-md bg-white shadow-xl px-10 py-12">
          <div className="text-center mb-8">
            <h1 className="font-noto-serif text-3xl font-bold text-slate-900 mb-2">Bem-vindo</h1>
            <p className="text-sm text-slate-500">Aceda à sua conta Patudos &amp; Companhia</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="w-full border border-slate-300 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Palavra-passe</label>
                <button type="button" className="text-xs text-amber-700 hover:text-amber-900 transition-colors">
                  Esqueceu-se da palavra-passe?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="w-full border border-slate-300 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm uppercase tracking-widest py-3.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : (
                <> Entrar <ArrowRight size={16} /> </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">Novo por aqui?</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <Link
              to="/registar"
              className="block w-full border border-slate-300 text-slate-700 text-sm font-medium text-center py-3 hover:border-slate-400 hover:bg-slate-50 transition-colors"
            >
              Criar conta
            </Link>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-8">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-noto-serif italic text-white text-lg">Patudos &amp; Companhia</span>
          <div className="flex gap-6 text-sm">
            {['Privacy Policy', 'Terms of Service', 'Careers', 'Press Kit'].map((l) => (
              <a key={l} href="#" className="hover:text-white transition-colors text-xs uppercase tracking-wider">{l}</a>
            ))}
          </div>
          <span className="text-amber-500 text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} Elite Pet Hospitality.
          </span>
        </div>
      </footer>
    </div>
  );
}
