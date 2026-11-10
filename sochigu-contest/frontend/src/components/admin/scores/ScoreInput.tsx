interface Props {
  // null — баллы ещё не выставлены
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

const MIN = 0;
const MAX = 100;

// Баллы 0–100: ползунок и числовое поле синхронизированы
export function ScoreInput({ value, onChange, disabled = false }: Props) {
  const handleNumber = (raw: string) => {
    if (raw === "") {
      onChange(null);
      return;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    onChange(Math.min(MAX, Math.max(MIN, Math.round(parsed))));
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={value ?? MIN}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Баллы"
          className={`w-full accent-primary-600 ${value === null ? "opacity-50" : ""}`}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>{MIN}</span>
          <span>{MAX}</span>
        </div>
      </div>
      <input
        type="number"
        min={MIN}
        max={MAX}
        step={1}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => handleNumber(e.target.value)}
        placeholder="—"
        aria-label="Баллы числом"
        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary-500 outline-none"
      />
    </div>
  );
}
