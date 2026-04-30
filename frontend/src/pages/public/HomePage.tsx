import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { servicoApi } from '../../api/servicoApi';
import { formatMoney } from '../../utils/formatters';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { data: servicos } = useQuery({
    queryKey: ['servicos', 'disponiveis'],
    queryFn: servicoApi.listarDisponiveis,
  });

  return (
    <div className="font-manrope">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative w-full min-h-[819px] flex items-center justify-center overflow-hidden bg-[#041525]">
        {/* bg image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCi5oqe3FxLXAmGMJOyFHlX6LWvcYIVXRrSA2olxP-RJ1HoD5iKHhV7nNJw_srN8PUYSd8YY0a7qMMdaXcmYm85JICzVoa1tisfVReCRK7lxmVeu6BFj4eC7z9R7Kxc_PPu_BMfhnYQayAiHz7pGJWdNasNI7kjyZQuJ7w86Qjx5gv5BVOmCSd1bKSJSNeohGd3JdURy2ylJv_RtfIJy9dee6WRPqRRaEk4a_bqTKrMeerkM7NcE7lowXiSkU1VuoMJIld67NBAtWEF")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#041525]/90 via-[#041525]/50 to-transparent" />

        <div className="relative z-10 max-w-3xl px-8 text-center text-white">
          <span className="block text-xs font-bold tracking-[0.2em] uppercase text-amber-400 mb-6">
            Elite Compassion
          </span>
          <h1 className="font-noto-serif text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            O retiro perfeito para<br />o seu melhor amigo
          </h1>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
            Cuidados de excelência, instalações de luxo e atenção personalizada num ambiente tranquilo e seguro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/registar"
              className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold uppercase tracking-widest px-10 py-4 transition-colors flex items-center justify-center gap-2"
            >
              Fazer Reserva
            </Link>
            <Link
              to="/servicos"
              className="w-full sm:w-auto border border-white/30 text-white text-xs font-bold uppercase tracking-widest px-10 py-4 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Ver Instalações <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA O PROCESSO ──────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-noto-serif text-4xl font-semibold text-slate-900 mb-4">
              Como funciona o processo
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Desenhámos uma experiência fluida e transparente para garantir a sua paz de espírito desde o primeiro contacto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-slate-200 z-0" />

            {[
              {
                n: '1',
                title: 'Reserva',
                desc: 'Agende as datas pretendidas através da nossa plataforma, garantindo o espaço ideal para o seu animal.',
                active: false,
              },
              {
                n: '2',
                title: 'Check-in & Avaliação',
                desc: 'Recebemos o seu animal com um processo de adaptação e registo das suas necessidades específicas.',
                active: false,
              },
              {
                n: '3',
                title: 'Estadia Premium',
                desc: 'Acompanhamento diário, atividades recreativas e momentos de relaxamento nas nossas instalações.',
                active: true,
              },
            ].map(({ n, title, desc, active }) => (
              <div key={n} className="relative z-10 flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold mb-6 border ${
                    active
                      ? 'bg-[#041525] text-white border-[#041525]'
                      : 'bg-white text-amber-700 border-slate-200 shadow-sm'
                  }`}
                >
                  {n}
                </div>
                <h3 className="font-noto-serif text-xl font-semibold text-slate-900 mb-3">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVIÇOS ─────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
            <div>
              <h2 className="font-noto-serif text-4xl font-semibold text-slate-900 mb-3">
                Os Nossos Serviços
              </h2>
              <p className="text-slate-500 max-w-xl leading-relaxed">
                Oferecemos um leque completo de comodidades para assegurar o bem-estar físico e emocional do seu companheiro.
              </p>
            </div>
            <Link
              to="/servicos"
              className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:text-amber-900 flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              Ver todos os serviços <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicos && servicos.length > 0
              ? servicos.slice(0, 4).map((s) => (
                  <ServiceCard
                    key={s.id}
                    icon="pets"
                    title={s.nome}
                    desc={s.descricao}
                    price={formatMoney(s.preco)}
                    iconBg="bg-[#d3e4fa]"
                    iconColor="text-[#0c1d2c]"
                  />
                ))
              : FALLBACK_SERVICES.map((s) => (
                  <ServiceCard key={s.title} {...s} />
                ))}
          </div>
        </div>
      </section>

      {/* ── GALERIA ──────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="font-noto-serif text-4xl font-semibold text-slate-900 mb-3">Galeria</h2>
              <p className="text-slate-500 max-w-xl leading-relaxed">
                Um vislumbre das nossas instalações e dos hóspedes felizes que nos visitam.
              </p>
            </div>
            <button className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:text-amber-900 flex items-center gap-2 transition-colors">
              Ver portfólio completo <ArrowRight size={14} />
            </button>
          </div>

          {/* Bento / asymmetric grid (variante 2 do Stitch) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ gridTemplateRows: 'auto auto' }}>
            {/* large — 2 cols, 2 rows */}
            <GalleryItem
              cls="md:col-span-2 md:row-span-2 min-h-[400px]"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuBG_TAARkmt8GLAvtl4cnxL5OWZ-y2Z7FvVExK6bHvYlrnQ3h9-r3ZG-SDX6IlxY8vQdqAaFaXuFcGye2L2j-SgZrE-peBjPv40Lhd6ZwBRK33pXr_xoo-F-sptTataIj-WYdavIsgqB1Jg2GQ2IQU4l0lI8s4wCT3f6jmyxQ8HfbebSj1KnKNj_K9fzphCub0UPi1BvXuYUebuZEqX5yZrxK-8LogmaPteiFpOawoZs1MDxilJRVi4ZC174iq5mmXA7UXzViHXcJXg"
              label="Passeios Premium"
            />
            {/* wide — 2 cols */}
            <GalleryItem
              cls="md:col-span-2 aspect-video"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuBZvulm-duedKmJelI7xZFkAHwj0ocZruGiLtwwF9wXHaRO8SNGa61Qbe0zZRIWz4OZs2euKorBxzjcUInA-zkZlRFi7HZxqAe-CPiPZt686sphoBi-Ezq8HhgjF-NuAB0byetsrA5byO2S_WnSJxh5pK8JG4HEWfaT4RYY7ctNq5HOM183eNU5RKjwq6lt5Aza-EQDVTWOx944mVa3MvsujdYC1uc7bx3lCwuBUJ62aGhmkKBjD6IqYyS_xrbRTJTpZU7N3zE2MKKO"
              label="Estadias VIP"
            />
            {/* small square */}
            <GalleryItem
              cls="md:col-span-1 aspect-square"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuC9CJ2zfMg84j_NJF8jisSs2iXpXPl-TLBVCIjXjKLcOwdIXRKAj0KFhT4U2Wys9E1br9ZG4_5A2yZa_6VLTbQ9O3xR5f0QeL3ynY21ph2czl1THPGa2hJU65UNNtp3bXGuaqyxk8LRp13kvuze4egZr8CohgjbqtEnBgq0EFTuceVbKMrjdINDEWQTPLttIt0MyhdgiFvSelJ_-A9FPWUIJAuVRD9K9gBz1IL4H0CugcEVOJYWleIVrNinQjdBA8AYP2NH0XlbOPHD"
              label="Gatos"
            />
            {/* small square */}
            <GalleryItem
              cls="md:col-span-1 aspect-square"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuA1fTZUssMBOBvA6fe3_9UyWYivZih5chljK7z4c1GFYy7nlgUO3qhNmUz6pQd8zzFZqAD-QcxUzbNslmQKifcveQDx_bayCN0hjqDsvOiQlPas_2vVXmaxELODa-AC-p9QYZhTZQGKNf5MWfUgCfs_8OUim0LtXbUz9El3N_JBMnSw6ZhI-CfnuTLTNsEBItI3NdBKtRhciE0ALc8pbzCMC8hxwXtwWyhyeXFn6gkAASYSDD_vnbfodmmWmFWCsZCUn0L0aXnsGo3X"
              label="Spa & Grooming"
            />
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────── */}
      <section className="py-20 bg-[#041525] text-white text-center">
        <div className="max-w-xl mx-auto px-8">
          <h2 className="font-noto-serif text-4xl font-bold mb-4">Pronto para reservar?</h2>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Crie uma conta gratuita e faça a sua primeira reserva em minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/registar"
              className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold uppercase tracking-widest px-10 py-4 transition-colors flex items-center justify-center gap-2"
            >
              Criar conta gratuita <ArrowRight size={14} />
            </Link>
            <Link
              to="/login"
              className="border border-white/30 text-white text-xs font-bold uppercase tracking-widest px-10 py-4 hover:bg-white/10 transition-colors"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── sub-components ── */

function ServiceCard({
  icon, title, desc, price, iconBg, iconColor,
}: {
  icon: string; title: string; desc: string;
  price?: string; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white border border-slate-200 p-8 hover:border-amber-400 hover:shadow-md transition-all group cursor-default">
      <div className={`w-12 h-12 ${iconBg} flex items-center justify-center ${iconColor} mb-6 group-hover:bg-[#041525] group-hover:text-white transition-colors`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>{icon}</span>
      </div>
      <h3 className="font-noto-serif text-xl font-semibold text-slate-900 mb-3">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      {price && <p className="mt-4 text-amber-700 font-bold text-lg">{price}</p>}
    </div>
  );
}

function GalleryItem({ cls, img, label }: { cls: string; img: string; label: string }) {
  return (
    <div className={`relative rounded-xl overflow-hidden group ${cls}`}>
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url("${img}")` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#041525]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
        <span className="text-white text-xs font-bold uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}

const FALLBACK_SERVICES = [
  { icon: 'hotel',      title: 'Estadia',          desc: 'Espaços individuais climatizados com acompanhamento 24h.',             iconBg: 'bg-[#d3e4fa]', iconColor: 'text-[#0c1d2c]' },
  { icon: 'spa',        title: 'Spa & Grooming',   desc: 'Banhos, tosquias e tratamentos de hidratação profissionais.',          iconBg: 'bg-[#ffdea3]', iconColor: 'text-[#261900]' },
  { icon: 'sprint',     title: 'Atividades',       desc: 'Parques exteriores seguros para exercício e socialização monitorizada.', iconBg: 'bg-[#d3e4fa]', iconColor: 'text-[#0c1d2c]' },
  { icon: 'visibility', title: 'Supervisão 24/7',  desc: 'Equipa profissional no local e assistência veterinária de chamada.',   iconBg: 'bg-[#ebe1d5]', iconColor: 'text-[#1f1b14]' },
];
