interface Tab { id: string; label: string; count?: number }

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div className="flex border-b border-[#C4C6CC] gap-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            active === tab.id
              ? 'border-[#775A19] text-[#775A19]'
              : 'border-transparent text-[#44474C] hover:text-[#041525] hover:border-[#C4C6CC]'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              active === tab.id ? 'bg-[#775A19] text-white' : 'bg-[#E7E8E9] text-[#44474C]'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
