import {
  BankOffer,
  BankOfferStatus,
  BANK_OFFER_STATUS_LABELS,
  BANK_OFFER_STATUS_COLORS,
} from "@/types";
import { formatDate } from "@/utils/formatDate";

interface Props {
  offer: BankOffer;
  // owner — автор проекта, staff — admin и moderator
  mode: "owner" | "staff";
  busy?: boolean;
  onChangeStatus: (id: string, status: BankOfferStatus) => void;
}

const STATUSES = Object.keys(BANK_OFFER_STATUS_LABELS) as BankOfferStatus[];

export function OfferCard({
  offer,
  mode,
  busy = false,
  onChangeStatus,
}: Props) {
  const hasContacts = Boolean(offer.contactEmail || offer.contactPhone);
  const employerName = offer.employer
    ? `${offer.employer.lastName} ${offer.employer.firstName}`.trim()
    : "Работодатель";

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 break-words">
            {employerName}
          </p>
          {mode === "staff" && offer.employer?.email && (
            <p className="text-xs text-gray-400 break-all">
              {offer.employer.email}
            </p>
          )}
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${BANK_OFFER_STATUS_COLORS[offer.status]}`}
        >
          {BANK_OFFER_STATUS_LABELS[offer.status]}
        </span>
      </div>

      <p className="text-sm text-gray-700 whitespace-pre-line break-words mb-2">
        {offer.message}
      </p>

      {hasContacts ? (
        <p className="text-sm text-gray-700 mb-2 break-words">
          <span className="text-gray-500">Контакты: </span>
          {[offer.contactEmail, offer.contactPhone].filter(Boolean).join(" · ")}
        </p>
      ) : (
        mode === "owner" &&
        offer.status !== "accepted" && (
          <p className="text-xs italic text-gray-400 mb-2">
            Контакты будут доступны после принятия предложения.
          </p>
        )
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <span className="text-xs text-gray-400">
          {formatDate(offer.createdAt)}
        </span>

        {mode === "owner" ? (
          <div className="flex gap-2">
            {offer.status !== "accepted" && (
              <button
                disabled={busy}
                onClick={() => onChangeStatus(offer.id, "accepted")}
                className="px-3 py-1.5 rounded-lg bg-primary-700 text-white text-xs font-semibold hover:bg-primary-800 transition-colors disabled:opacity-60"
              >
                Принять
              </button>
            )}
            {offer.status !== "declined" && (
              <button
                disabled={busy}
                onClick={() => onChangeStatus(offer.id, "declined")}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-60"
              >
                Отклонить
              </button>
            )}
          </div>
        ) : (
          <select
            value={offer.status}
            disabled={busy}
            onChange={(e) =>
              onChangeStatus(offer.id, e.target.value as BankOfferStatus)
            }
            aria-label="Статус предложения"
            className="select-custom pl-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {BANK_OFFER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
