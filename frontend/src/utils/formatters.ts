export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('pt-PT');

export const formatDateTime = (date: string) =>
  new Date(date).toLocaleString('pt-PT');

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);

export const ESTADO_RESERVA_BADGE: Record<string, { label: string; color: string }> = {
  PENDENTE:    { label: 'Pendente',    color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMADA:  { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  EM_ESTADIA:  { label: 'Em estadia', color: 'bg-green-100 text-green-800' },
  CONCLUIDA:   { label: 'Concluída',  color: 'bg-gray-100 text-gray-600' },
  CANCELADA:   { label: 'Cancelada',  color: 'bg-red-100 text-red-800' },
};

export const ESPECIE_LABELS: Record<string, string> = {
  CAO: 'Cão',
  GATO: 'Gato',
};

export const PORTE_LABELS: Record<string, string> = {
  PEQUENO_MEDIO: 'Pequeno/Médio',
  GRANDE: 'Grande',
  NAO_APLICAVEL: 'N/A',
};
