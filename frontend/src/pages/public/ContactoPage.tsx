import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Contacto</h1>
        <p className="text-gray-500">Estamos aqui para ajudar.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {[
            { icon: Phone, label: 'Telefone', value: '+351 253 000 000' },
            { icon: Mail, label: 'Email', value: 'info@patudos.pt' },
            { icon: MapPin, label: 'Morada', value: 'Rua dos Animais, 1 — Braga' },
            { icon: Clock, label: 'Horário', value: 'Seg–Dom: 08h–20h' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-gray-700 font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Envie-nos uma mensagem</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" placeholder="O seu nome" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="email@exemplo.pt" />
            </div>
            <div>
              <label className="label">Mensagem</label>
              <textarea className="input" rows={4} placeholder="Como podemos ajudar?" />
            </div>
            <button className="btn-primary w-full">Enviar mensagem</button>
          </div>
        </div>
      </div>
    </div>
  );
}
