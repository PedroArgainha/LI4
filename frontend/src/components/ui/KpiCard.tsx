import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  icon: string; // Material Symbol name
  trend?: number; // % change, positive = up
  iconBg?: string;
  iconColor?: string;
}

export function KpiCard({ label, value, icon, trend, iconBg = 'bg-[#D3E4FA]', iconColor = 'text-[#041525]' }: Props) {
  return (
    <div className="bg-white border border-[#C4C6CC] p-6 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 ${iconBg} ${iconColor} flex items-center justify-center`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>{icon}</span>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="font-noto-serif text-3xl font-bold text-[#041525]">{value}</p>
        <p className="text-sm text-[#44474C] mt-1">{label}</p>
      </div>
    </div>
  );
}
