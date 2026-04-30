import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export default function EspacosPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: 'Backoffice', to: '/backoffice' }, { label: 'Espaços de Alojamento' }]} />
      <div>
        <h1 className="font-noto-serif text-2xl font-bold text-[#041525]">Espaços de Alojamento</h1>
        <p className="text-sm text-[#44474C] mt-1">Nota: o backend ainda não tem controller de espaços exposto. Esta página será activada quando o endpoint <code className="bg-[#F3F4F5] px-1">/api/espacos</code> estiver disponível.</p>
      </div>
      <div className="border border-dashed border-[#C4C6CC] p-12 text-center bg-white">
        <span className="material-symbols-outlined text-5xl text-[#C4C6CC] block mb-3">meeting_room</span>
        <p className="text-[#44474C] font-medium">Gestão de espaços em breve</p>
        <p className="text-sm text-[#74777D] mt-1">Aguarda implementação do endpoint no backend.</p>
      </div>
    </div>
  );
}
