import { useQuery } from '@tanstack/react-query';
import { servicoApi } from '../../api/servicoApi';
import { formatMoney } from '../../utils/formatters';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServicosPage() {
  const { data: servicos, isLoading } = useQuery({
    queryKey: ['servicos', 'disponiveis'],
    queryFn: servicoApi.listarDisponiveis,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Os nossos serviços</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Serviços adicionais que pode associar à estadia do seu animal.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-brand-500" size={32} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {servicos?.map((s) => (
            <div key={s.id} className="card hover:border-brand-200 hover:shadow-md transition-all">
              <h3 className="font-semibold text-gray-900 mb-1">{s.nome}</h3>
              <p className="text-sm text-gray-500 mb-4">{s.descricao}</p>
              <p className="text-2xl font-bold text-brand-600">{formatMoney(s.preco)}</p>
              <p className="text-xs text-gray-400 mt-1">por execução</p>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <p className="text-gray-500 mb-4">Pode selecionar serviços ao fazer a sua reserva.</p>
        <Link to="/registar" className="btn-primary">Fazer reserva</Link>
      </div>
    </div>
  );
}
