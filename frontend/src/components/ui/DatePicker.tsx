import { useState } from 'react';

interface Props {
    label?: string;
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    min?: string;
    placeholder?: string;
}

const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export function DatePicker({ label, value, onChange, min, placeholder = 'Selecione...' }: Props) {
    const today = new Date();
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const selected = value ? new Date(value + 'T00:00:00') : null;
    const minDate = min ? new Date(min + 'T00:00:00') : null;

    const displayValue = selected
        ? selected.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    // Days in month grid
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevDays = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; thisMonth: boolean; date: Date }[] = [];
    for (let i = firstDay - 1; i >= 0; i--)
        cells.push({ day: prevDays - i, thisMonth: false, date: new Date(viewYear, viewMonth - 1, prevDays - i) });
    for (let d = 1; d <= daysInMonth; d++)
        cells.push({ day: d, thisMonth: true, date: new Date(viewYear, viewMonth, d) });
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++)
        cells.push({ day: d, thisMonth: false, date: new Date(viewYear, viewMonth + 1, d) });

    const isSelected = (date: Date) => selected && date.toDateString() === selected.toDateString();
    const isToday = (date: Date) => date.toDateString() === today.toDateString();
    const isDisabled = (date: Date) => !!minDate && date < minDate;

    const select = (date: Date) => {
        if (isDisabled(date)) return;
        onChange(date.toISOString().split('T')[0]);
        setOpen(false);
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    return (
        <div className="relative w-full">
            {label && (
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-[#44474C] mb-1.5">
                    {label}
                </label>
            )}

            {/* Input trigger */}
            <div
                onClick={() => setOpen(!open)}
                className={`relative w-full bg-white border px-3 py-3 pr-10 cursor-pointer flex items-center transition-all ${
                    open ? 'border-[#775A19] ring-1 ring-[#775A19]' : 'border-[#C4C6CC] hover:border-[#74777D]'
                }`}
            >
        <span className={`text-sm flex-1 ${value ? 'text-[#041525]' : 'text-[#74777D]'}`}>
          {displayValue || placeholder}
        </span>
                <span className="material-symbols-outlined absolute right-3 text-[#041525]" style={{ fontSize: '18px' }}>
          calendar_month
        </span>
            </div>

            {/* Calendar dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 bg-white border border-[#C4C6CC] shadow-xl w-[320px] overflow-hidden rounded-[2px]">
                    {/* Header */}
                    <div className="bg-[#041525] text-white px-4 py-3 flex items-center justify-between">
                        <button onClick={prevMonth} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
                        </button>
                        <span className="font-noto-serif text-base font-semibold">
              {MONTHS[viewMonth]} {viewYear}
            </span>
                        <button onClick={nextMonth} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                        {/* Days of week */}
                        <div className="grid grid-cols-7 mb-2">
                            {DAYS.map((d, i) => (
                                <div key={i} className="text-center text-xs font-bold uppercase tracking-wider text-[#74777D] py-1">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Date cells */}
                        <div className="grid grid-cols-7">
                            {cells.map((cell, i) => {
                                const sel = isSelected(cell.date);
                                const tod = isToday(cell.date);
                                const dis = isDisabled(cell.date);
                                return (
                                    <div
                                        key={i}
                                        onClick={() => cell.thisMonth && select(cell.date)}
                                        className={`text-center py-2 text-sm rounded-full cursor-pointer transition-colors ${
                                            !cell.thisMonth
                                                ? 'text-[#C4C6CC]'
                                                : dis
                                                    ? 'text-[#C4C6CC] cursor-not-allowed'
                                                    : sel
                                                        ? 'bg-[#775A19] text-white font-bold shadow-sm'
                                                        : tod
                                                            ? 'border border-[#775A19] text-[#775A19] font-bold'
                                                            : 'text-[#041525] hover:bg-[#E1E3E4]'
                                        }`}
                                    >
                                        {cell.day}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-[#F3F4F5] border-t border-[#C4C6CC] flex justify-end gap-2">
                        <button
                            onClick={() => setOpen(false)}
                            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#041525] hover:bg-[#E1E3E4] rounded transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => setOpen(false)}
                            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#775A19] text-white hover:bg-[#5d4201] rounded transition-colors"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}