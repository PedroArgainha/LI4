import { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
    icon?: string;
}

interface Props {
    label?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function Select({ label, options, value, onChange, placeholder = 'Selecione...' }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = options.find((o) => o.value === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="w-full" ref={ref}>
            {label && (
                <label className="block font-manrope text-xs font-bold uppercase tracking-[0.1em] text-[#44474C] mb-1 ml-1">
                    {label}
                </label>
            )}
            <div className="relative z-10">
                {/* Trigger */}
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className={`w-full bg-white text-left px-3 py-3 flex justify-between items-center outline-none transition-all duration-200 border ${
                        open
                            ? 'border-[#775A19] ring-2 ring-[#775A19]/20 rounded-t-[2px]'
                            : 'border-[#C4C6CC] rounded-[2px] hover:border-[#74777D]'
                    }`}
                >
          <span className={`block truncate text-sm ${selected ? 'text-[#041525]' : 'text-[#74777D]'}`}>
            {selected ? selected.label : placeholder}
          </span>
                    <span
                        className="material-symbols-outlined text-[#775A19] transition-transform duration-200"
                        style={{ fontSize: '20px', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
            expand_more
          </span>
                </button>

                {/* Options */}
                {open && (
                    <ul className="absolute z-20 w-full bg-white border-x border-b border-[#C4C6CC] shadow-lg max-h-60 rounded-b-[2px] py-1 overflow-auto">
                        {options.map((opt) => {
                            const isSelected = opt.value === value;
                            return (
                                <li
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className={`cursor-pointer select-none relative py-3 pl-3 pr-6 flex items-center justify-between transition-colors duration-150 ${
                                        isSelected
                                            ? 'bg-[#775A19]/10 border-l-2 border-[#775A19] text-[#041525]'
                                            : 'text-[#44474C] hover:bg-[#F3F4F5] border-l-2 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {opt.icon && (
                                            <span
                                                className="material-symbols-outlined"
                                                style={{
                                                    fontSize: '18px',
                                                    color: isSelected ? '#775A19' : '#74777D',
                                                    fontVariationSettings: isSelected ? '"FILL" 1' : '"FILL" 0',
                                                }}
                                            >
                        {opt.icon}
                      </span>
                                        )}
                                        <span className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>{opt.label}</span>
                                    </div>
                                    {isSelected && (
                                        <span className="material-symbols-outlined text-[#775A19]" style={{ fontSize: '16px' }}>
                      check
                    </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}