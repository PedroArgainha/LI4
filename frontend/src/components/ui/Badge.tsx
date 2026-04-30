import type { EstadoReserva } from '../../types/reserva';
import type { Especie, Porte } from '../../types/animal';

const ESTADO_CONFIG: Record<EstadoReserva, { label: string; bg: string; text: string; dot: string }> = {
  PENDENTE:   { label: 'Pendente',   bg: 'bg-[#FDD587]', text: 'text-[#785A19]', dot: 'bg-[#775A19]' },
  CONFIRMADA: { label: 'Confirmada', bg: 'bg-[#D3E4FB]', text: 'text-[#0C1D2D]', dot: 'bg-[#041525]' },
  EM_ESTADIA: { label: 'Em Estadia', bg: 'bg-green-100',  text: 'text-green-900',  dot: 'bg-green-700' },
  CONCLUIDA:  { label: 'Concluída',  bg: 'bg-[#E1E3E4]', text: 'text-[#44474C]', dot: 'bg-[#74777D]' },
  CANCELADA:  { label: 'Cancelada',  bg: 'bg-[#FFDAD6]', text: 'text-[#93000A]', dot: 'bg-[#BA1A1A]' },
};

export function EstadoBadge({ estado }: { estado: EstadoReserva }) {
  const c = ESTADO_CONFIG[estado] ?? { label: estado, bg: 'bg-[#E1E3E4]', text: 'text-[#44474C]', dot: 'bg-[#74777D]' };
  return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        {c.label}
    </span>
  );
}

export function EspecieBadge({ especie }: { especie: Especie }) {
  const icon = especie === 'CAO' ? 'pets' : 'cruelty_free';
  const label = especie === 'CAO' ? 'Cão' : 'Gato';
  return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDEEEF] text-[#191C1D] text-xs border border-[#C4C6CC]/30">
      <span className="material-symbols-outlined text-[#44474C]" style={{ fontSize: '16px' }}>{icon}</span>
        {label}
    </span>
  );
} 

const PORTE_CONFIG: Record<Porte, { label: string; icon: string }> = {
  PEQUENO_MEDIO: { label: 'Pequeno/Médio', icon: 'straighten' },
  GRANDE:        { label: 'Grande',        icon: 'open_in_full' },
  NAO_APLICAVEL: { label: 'N/A',           icon: 'remove' },
};

export function PorteBadge({ porte }: { porte: Porte }) {
  const c = PORTE_CONFIG[porte];
  return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDEEEF] text-[#191C1D] text-xs border border-[#C4C6CC]/30">
      <span className="material-symbols-outlined text-[#44474C]" style={{ fontSize: '16px' }}>{c.icon}</span>
        {c.label}
    </span>
  );
}