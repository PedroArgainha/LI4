interface Props {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };

const COLORS = [
  'bg-[#041525] text-white',      // primary navy
  'bg-[#775A19] text-white',      // secondary gold
  'bg-[#D3E4FB] text-[#0C1D2D]', // primary-fixed
  'bg-[#E1E3E4] text-[#44474C]', // neutral
];

export function Avatar({ name, size = 'md', className = '' }: Props) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
      <div className={`${SIZE[size]} ${color} rounded-full flex items-center justify-center font-semibold flex-shrink-0 font-manrope ${className}`}>
        {initials}
      </div>
  );
}