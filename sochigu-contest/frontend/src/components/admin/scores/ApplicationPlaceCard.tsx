import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { applicationsApi } from "@/api/applications";
import { ApplicationStatus } from "@/types";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/utils/apiError";

interface Props {
  applicationId: string;
  status: ApplicationStatus;
  place: number | null | undefined;
  onSaved: (place: number | null) => void;
}

// Присвоить место можно только проекту очного этапа
const PLACE_STATUSES: ApplicationStatus[] = ["admitted", "winner", "runner_up"];

export function ApplicationPlaceCard({
  applicationId,
  status,
  place,
  onSaved,
}: Props) {
  const { showToast } = useToast();
  const [value, setValue] = useState(place ? String(place) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(place ? String(place) : "");
  }, [place, applicationId]);

  const canAssign = PLACE_STATUSES.includes(status);
  const changed = value !== (place ? String(place) : "");
  // снять уже присвоенное место можно в любом статусе
  const disabled = saving || (!canAssign && !place);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const next = value === "" ? null : Number(value);
      await applicationsApi.setPlace(applicationId, next);
      onSaved(next);
      showToast(next ? `Место ${next} присвоено` : "Место снято", "success");
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось сохранить место"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-semibold text-gray-900 mb-1">
        Место по итогам очного этапа
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Диплом 1–3 степени. Ставится вручную и со статусом «Победитель» или
        «Призёр» не связано.
      </p>
      {error && (
        <div className="mb-3">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      {!canAssign && !place && (
        <div className="mb-3">
          <Alert variant="info">
            Место можно присвоить проекту со статусом «Допущена к очному этапу»,
            «Победитель» или «Призёр».
          </Alert>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          aria-label="Место"
          className="select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-50"
        >
          <option value="">Не присвоено</option>
          <option value="1">1 место</option>
          <option value="2">2 место</option>
          <option value="3">3 место</option>
        </select>
        <button
          onClick={save}
          disabled={disabled || !changed}
          className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-accent-foreground text-sm font-semibold rounded-lg transition-colors"
        >
          {saving ? "Сохраняем..." : "Сохранить место"}
        </button>
      </div>
    </div>
  );
}
