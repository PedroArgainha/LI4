interface Props {
    checked: boolean;
    onChange: (v: boolean) => void;
    label?: string;
    description?: string;
    icon?: string;
    disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, icon, disabled }: Props) {
    return (
        <label
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${
                checked
                    ? 'bg-[#775A19]/5 border-[#775A19]/20'
                    : 'border-transparent hover:bg-[#F3F4F5] hover:border-[#E1E3E4]'
            }`}
        >
            <div className="flex items-center gap-4">
                {icon && (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        checked ? 'bg-[#775A19]/20 text-[#775A19]' : 'bg-[#EDEEEF] text-[#74777D]'
                    }`}>
            <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', fontVariationSettings: checked ? '"FILL" 1' : '"FILL" 0' }}
            >
              {icon}
            </span>
                    </div>
                )}
                {(label || description) && (
                    <div>
                        {label && <span className="block text-sm font-medium text-[#041525]">{label}</span>}
                        {description && <span className="block text-xs text-[#44474C]">{description}</span>}
                    </div>
                )}
            </div>

            {/* Switch */}
            <div
                onClick={() => !disabled && onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                    checked ? 'bg-[#775A19]' : 'bg-[#E1E3E4]'
                }`}
            >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
            </div>
        </label>
    );
}