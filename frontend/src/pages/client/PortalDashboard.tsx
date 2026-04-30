import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { reservaApi } from '../../api/reservaApi';
import { animalApi } from '../../api/animalApi';
import { formatDate, formatMoney, ESTADO_RESERVA_BADGE } from '../../utils/formatters';
import { Calendar, Dog, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PortalDashboard() {
  const { utilizador } = useAuthStore();
  const id = utilizador!.id;

  const { data: reservas } = useQuery({
    queryKey: ['reservas', 'proprietario', id],
    queryFn: () => reservaApi.listarPorProprietario(id),
  });

  const { data: animais } = useQuery({
    queryKey: ['animais', 'proprietario', id],
    queryFn: () => animalApi.listarPorProprietario(id),
  });

  const ativas = reservas?.filter((r) => r.estado === 'PENDENTE' || r.estado === 'CONFIRMADA' || r.estado === 'EM_ESTADIA') ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Olá, {utilizador?.nome?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Bem-vindo ao seu portal.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
              <Dog size={18} />
            </div>
            <span className="text-sm text-gray-500">Animais</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{animais?.length ?? 0}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <span className="text-sm text-gray-500">Reservas ativas</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{ativas.length}</p>
        </div>
      </div>

      {/* Reservas ativas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Reservas ativas</h2>
          <Link to="/portal/reservas" className="text-brand-600 text-sm flex items-center gap-1 hover:underline">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
        {ativas.length === 0 ? (
          <div className="card text-center py-8">
            <Calendar size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Sem reservas ativas</p>
            <Link to="/portal/reservas" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              <Plus size={14} /> Nova reserva
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {ativas.slice(0, 3).map((r) => {
              const badge = ESTADO_RESERVA_BADGE[r.estado];
              return (
                <div key={r.id} className="card flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.animalNome ?? `Animal #${r.animalId}`}</p>
                    <p className="text-xs text-gray-500">{formatDate(r.dataInicio)} → {formatDate(r.dataFim)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${badge.color}`}>{badge.label}</span>
                    <p className="text-sm font-semibold text-gray-900">{formatMoney(r.precoBase)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Ações rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/portal/reservas" className="card flex items-center gap-3 hover:border-brand-300 transition-all group">
            <div className="w-9 h-9 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
              <Plus size={18} />
            </div>
            <span className="text-sm font-medium text-gray-700">Nova reserva</span>
          </Link>
          <Link to="/portal/animais" className="card flex items-center gap-3 hover:border-brand-300 transition-all group">
            <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Dog size={18} />
            </div>
            <span className="text-sm font-medium text-gray-700">Os meus animais</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
