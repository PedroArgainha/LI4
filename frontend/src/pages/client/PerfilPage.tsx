import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { ROLE_LABELS } from '../../utils/roles';

export default function PerfilPage() {
  const { utilizador } = useAuthStore();
  if (!utilizador) return null;
  return (
    <div className="space-y-6">
      <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">O Meu Perfil</h1>
      <div className="bg-white border border-[#C4C6CC] p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#E7E8E9]">
          <Avatar name={utilizador.nome} size="lg" />
          <div>
            <p className="font-noto-serif text-xl font-bold text-[#041525]">{utilizador.nome}</p>
            <p className="text-sm text-[#74777D]">{ROLE_LABELS[utilizador.tipoConta]}</p>
          </div>
        </div>
        <div className="space-y-4">
          {[['Email', utilizador.email], ['Telefone', utilizador.telefone || '—'], ['Perfil', ROLE_LABELS[utilizador.tipoConta]]].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-[#E7E8E9] pb-3">
              <span className="text-sm text-[#44474C]">{k}</span>
              <span className="text-sm font-medium text-[#041525]">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
