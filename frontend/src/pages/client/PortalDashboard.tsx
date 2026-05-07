import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { reservaApi } from '../../api/reservaApi';
import { animalApi } from '../../api/animalApi';
import { formatDate, ESPECIE_LABELS } from '../../utils/formatters';
import { ArrowRight, CalendarDays, CalendarX, PlusCircle, Dog, Cat } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Animal } from '../../types/animal';
import type { Reserva } from '../../types/reserva';

function getReservaBadge(estado: Reserva['estado']) {
  switch (estado) {
    case 'PENDENTE':   return { label: 'PENDENTE',   className: 'bg-[#fdd587] text-[#785a19]' };
    case 'EM_ESTADIA': return { label: 'EM ESTADIA', className: 'bg-emerald-100 text-emerald-800' };
    case 'CONCLUIDA':  return { label: 'CONCLUÍDA',  className: 'bg-[#e7e8e9] text-[#44474c]' };
    case 'CANCELADA':  return { label: 'CANCELADA',  className: 'bg-red-100 text-red-700' };
    default:           return { label: String(estado), className: 'bg-gray-100 text-gray-600' };
  }
}

function AnimalIcon({ animal }: { animal: Animal }) {
  const isCao = animal.especie === 'CAO';
  return (
      <div className={`w-12 h-12 rounded-full flex items-center justify-center
      ${isCao ? 'bg-[#e8c176] text-[#5c4200]' : 'bg-[#cec5ba] text-[#4c463d]'}`}>
        {isCao ? <Dog size={22} /> : <Cat size={22} />}
      </div>
  );
}

function ReservaCard({ reserva }: { reserva: Reserva }) {
  const badge = getReservaBadge(reserva.estado);
  return (
      <article className="bg-white p-6 rounded-xl border border-[#c4c6cc] shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <AnimalIcon animal={{ especie: 'CAO' } as Animal} />
            <div>
              <h3 className="font-bold text-[#041525]">
                {reserva.animalNome ?? `Animal #${reserva.animalId}`}
              </h3>
              <p className="text-xs text-[#44474c] uppercase tracking-widest font-bold">
                Reserva #{reserva.id}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest ${badge.className}`}>
          {badge.label}
        </span>
        </div>

        <div className="border-t border-[#c4c6cc] pt-4 space-y-3">
          <div className="flex items-center gap-3 text-[#44474c]">
            <CalendarDays size={20} className="text-[#775a19]" />
            <div className="text-sm">
              <span className="block font-bold text-[#191c1d]">Check-in</span>
              {formatDate(reserva.dataInicio)}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[#44474c]">
            <ArrowRight size={20} className="text-[#775a19]" />
            <div className="text-sm">
              <span className="block font-bold text-[#191c1d]">Check-out</span>
              {formatDate(reserva.dataFim)}
            </div>
          </div>
        </div>
      </article>
  );
}

function AnimalCard({ animal }: { animal: Animal }) {
  return (
      <article className="group cursor-pointer">
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border border-[#c4c6cc] transition-all group-hover:shadow-lg">
          <div className="w-full h-full bg-[#edeeef] flex items-center justify-center">
            <AnimalIcon animal={animal} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#041525]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <span className="text-white text-xs font-bold uppercase tracking-widest">Ver perfil</span>
          </div>
        </div>
        <h4 className="font-bold text-[#041525] text-center text-sm">{animal.nome}</h4>
        <p className="text-xs text-[#44474c] text-center mt-0.5">
          {ESPECIE_LABELS[animal.especie]}{animal.raca ? ` · ${animal.raca}` : ''}
        </p>
      </article>
  );
}

export default function PortalDashboard() {
  const { utilizador } = useAuthStore();
  const navigate = useNavigate();
  const id = utilizador!.id;
  const primeiroNome = utilizador?.nome?.split(' ')[0] ?? 'Cliente';

  const { data: reservas = [] } = useQuery({
    queryKey: ['reservas', 'proprietario', id],
    queryFn: () => reservaApi.listarPorProprietario(id),
  });

  const { data: animais = [] } = useQuery({
    queryKey: ['animais', 'proprietario', id],
    queryFn: () => animalApi.listarPorProprietario(id),
  });

  const proximasEstadias = reservas.filter(
      (r) => r.estado === 'PENDENTE' || r.estado === 'EM_ESTADIA'
  );

  const semAnimais = animais.length === 0;

  return (
      <div className="space-y-12 pb-12">

        {/* Saudação */}
        <header>
          <h1 className="font-noto-serif text-5xl font-bold text-[#041525] leading-tight">
            Olá, {primeiroNome}! 👋
          </h1>
          <p className="text-lg text-[#44474c] mt-2">Bem-vindo ao portal Patudos & Cia.</p>
        </header>

        {/* Hero card escuro com fade */}
        <section>
          <div className="relative overflow-hidden rounded-xl bg-[#1a2a3b] p-12 flex flex-col md:flex-row items-center gap-12">
            {/* Fade decorativo */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#fdd587] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Texto */}
            <div className="relative z-10 flex-1">
              <h2 className="font-noto-serif text-3xl font-bold text-white leading-tight mb-4">
                {semAnimais
                    ? 'Ainda não tens animais registados — começa por adicionar o teu primeiro!'
                    : `Olá, ${primeiroNome} — bem-vindo ao teu portal!`}
              </h2>
              <p className="text-[#8191a6] text-base leading-relaxed mb-8 max-w-xl">
                {semAnimais
                    ? 'Oferecemos cuidados personalizados e alojamento premium para os seus companheiros. Registe-os agora para agendar serviços.'
                    : 'Consulta os próximos check-ins, adiciona serviços e mantém tudo organizado num só lugar.'}
              </p>
              <button
                  onClick={() => navigate(semAnimais ? '/portal/animais' : '/portal/reservas')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#775a19] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#5d4201] transition-colors"
              >
                <PlusCircle size={18} />
                {semAnimais ? 'Adicionar animal' : 'Nova reserva'}
              </button>
            </div>
            {/* Imagem */}
            <div className="relative z-10 hidden md:block w-[280px] lg:w-[320px] xl:w-[360px] shrink-0">
              <img
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&h=700&fit=crop&crop=center"
                  alt="Cão num ambiente acolhedor"
                  className="w-full aspect-square rounded-xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </section>

        {/* Próximas estadias */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-noto-serif text-2xl font-bold text-[#041525]">Próximas estadias</h2>
            <Link
                to="/portal/reservas"
                className="text-xs font-bold uppercase tracking-widest text-[#775a19] flex items-center gap-1 hover:gap-2 transition-all"
            >
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          {proximasEstadias.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#c4c6cc] bg-white p-12 flex flex-col items-center gap-4 text-center">
                <CalendarX size={40} className="text-[#c4c6cc]" />
                <p className="text-[#44474c] font-medium">Ainda não tens reservas ativas.</p>
                <p className="text-sm text-[#74777d]">Quando fizeres uma reserva, ela aparecerá aqui.</p>
                <button
                    onClick={() => navigate('/portal/reservas')}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#775a19] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#5d4201] transition-colors"
                >
                  <PlusCircle size={16} /> Fazer uma reserva
                </button>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proximasEstadias.map((r) => (
                    <ReservaCard key={r.id} reserva={r} />
                ))}
              </div>
          )}
        </section>

        {/* Os meus animais */}
        {animais.length > 0 && (
            <section>
              <div className="flex justify-between items-end mb-6">
                <h2 className="font-noto-serif text-2xl font-bold text-[#041525]">Os meus animais</h2>
                <button
                    onClick={() => navigate('/portal/animais')}
                    className="text-xs font-bold uppercase tracking-widest text-[#775a19] flex items-center gap-1 hover:underline"
                >
                  <PlusCircle size={14} /> Novo animal
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {animais.slice(0, 5).map((animal) => (
                    <div key={animal.id} onClick={() => navigate('/portal/animais')}>
                      <AnimalCard animal={animal} />
                    </div>
                ))}
                {animais.length > 5 && (
                    <div
                        onClick={() => navigate('/portal/animais')}
                        className="group cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 border border-dashed border-[#c4c6cc] bg-[#f3f4f5] flex flex-col items-center justify-center gap-1 hover:bg-[#edeeef] transition-colors">
                        <p className="text-2xl font-bold text-[#74777d]">+{animais.length - 5}</p>
                        <p className="text-xs text-[#74777d] uppercase tracking-widest font-bold">Ver todos</p>
                      </div>
                    </div>
                )}
              </div>
            </section>
        )}
      </div>
  );
}