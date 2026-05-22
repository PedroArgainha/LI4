import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { PawPrint, Loader2 } from 'lucide-react';

interface RegistoForm {
  nome: string;
  email: string;
  telefone: string;
  password: string;
  confirmar: string;
}

type RegistoField = keyof RegistoForm;

function getErrorMessage(err: unknown, fallback: string) {
  if (
      typeof err === 'object' &&
      err !== null &&
      'response' in err &&
      typeof (err as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
  ) {
    return (err as { response: { data: { message: string } } }).response.data.message;
  }

  return fallback;
}

export default function RegistarPage() {
  const [form, setForm] = useState<RegistoForm>({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmar: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k: RegistoField) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmar) {
      setError('As passwords não coincidem.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authApi.registar({
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        password: form.password,
      });

      setSuccess('Conta criada com sucesso. Pode iniciar sessão.');
      navigate('/login', {
        replace: true,
        state: { message: 'Conta criada com sucesso. Pode iniciar sessão.' },
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao criar conta. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="bg-brand-500 text-white p-2 rounded-xl">
                <PawPrint size={24} />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
            <p className="text-gray-500 mt-1 text-sm">Registe-se como proprietário</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                  {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg">
                  {success}
                </div>
            )}

            {[
              { label: 'Nome completo', key: 'nome' as const, type: 'text', placeholder: 'João Silva' },
              { label: 'Email', key: 'email' as const, type: 'email', placeholder: 'email@exemplo.pt' },
              { label: 'Telefone', key: 'telefone' as const, type: 'tel', placeholder: '912 345 678' },
              { label: 'Password', key: 'password' as const, type: 'password', placeholder: '••••••••' },
              { label: 'Confirmar password', key: 'confirmar' as const, type: 'password', placeholder: '••••••••' },
            ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input
                      type={type}
                      className="input"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={set(key)}
                      required
                  />
                </div>
            ))}

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              Criar conta
            </button>

            <p className="text-center text-sm text-gray-500">
              Já tem conta?{' '}
              <Link to="/login" className="text-brand-600 font-medium hover:underline">Entrar</Link>
            </p>
          </form>
        </div>
      </div>
  );
}
