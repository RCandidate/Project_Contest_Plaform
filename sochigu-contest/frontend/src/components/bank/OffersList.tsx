import {
  BankOffer,
  BANK_OFFER_STATUS_LABELS,
  BANK_OFFER_STATUS_COLORS,
} from "@/types";
import { formatDate } from "@/utils/formatDate";

export function OffersList({ offers }: { offers: BankOffer[] }) {
  if (offers.length === 0) return null;
  return (
    <ul className="space-y-3">
      {offers.map((o) => (
        <li
          key={o.id}
          className="rounded-lg border border-gray-100 bg-gray-50 p-3"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs text-gray-400">
              {formatDate(o.createdAt)}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${BANK_OFFER_STATUS_COLORS[o.status]}`}
            >
              {BANK_OFFER_STATUS_LABELS[o.status]}
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-line break-words">
            {o.message}
          </p>
        </li>
      ))}
    </ul>
  );
}
