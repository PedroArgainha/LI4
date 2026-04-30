import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { servicoApi } from '../../api/servicoApi';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { formatDate } from '../../utils/formatters';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';

export default function ServicosDiaPage() {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  const { data: servicos = [], isLoading } = useQuery({
    queryKey: ['servicos', 'dia', data],
    queryFn: () => servicoApi.dodia(data),
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Serviços do Dia' }]} />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Serviços do Dia</h1>
          <p className="text-sm text-[#44474C] mt-1">{servicos.length} serviço{servicos.length !== 1 ? 's' : ''} agendado{servicos.length !== 1 ? 's' : ''}</p>
        </div>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)}
          className="border border-[#C4C6CC] px-3 py-2 text-sm focus:outline-none focus:border-[#775A19]" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#775A19]" size={28} /></div>
      ) : servicos.length === 0 ? (
        <div className="border border-dashed border-[#C4C6CC] p-12 text-center bg-white">
          <Clock size={40} className="text-[#C4C6CC] mx-auto mb-3" />
          <p className="text-[#44474C] font-medium">Sem serviços agendados para este dia</p>
        </div>
      ) : (
        <div className="bg-white border border-[#C4C6CC] divide-y divide-[#E7E8E9]">
          {servicos.map((s: any, i: number) => (
            <ServicoItem key={i} servico={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function ServicoItem({ servico }: { servico: any }) {
  
  const [done, setDone] = useState(servico.estado === 'REALIZADO');

  return (
    <div className={`flex items-center justify-between px-5 py-4 transition-colors ${done ? 'bg-green-50' : 'hover:bg-[#F3F4F5]'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 flex items-center justify-center ${done ? 'text-green-600' : 'text-[#C4C6CC]'}`}>
          <CheckCircle2 size={20} className={done ? 'fill-green-100' : ''} />
        </div>
        <div>
          <p className={`font-medium text-sm ${done ? 'line-through text-[#74777D]' : 'text-[#041525]'}`}>
            {servico.servicoNome ?? servico.nome}
          </p>
          <p className="text-xs text-[#74777D]">
            {servico.animalNome ?? 'Animal'} · {servico.dataExecucao ? formatDate(servico.dataExecucao) : ''}
          </p>
        </div>
      </div>
      {!done && (
        <button
          onClick={() => setDone(true)}
          className="text-xs font-bold uppercase tracking-widest text-green-700 border border-green-300 px-3 py-1.5 hover:bg-green-50 transition-colors"
        >
          Marcar como feito
        </button>
      )}
      {done && <span className="text-xs text-green-600 font-semibold uppercase tracking-wider">Realizado</span>}
    </div>
  );
}
