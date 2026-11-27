const STYLES: Record<number, string> = {
  1: "bg-amber-100 text-amber-800",
  2: "bg-gray-200 text-gray-700",
  3: "bg-orange-100 text-orange-800",
};

// Место, присвоенное админом по итогам очного этапа (диплом 1–3 степени)
export function PlaceBadge({ place }: { place: number }) {
  return (
    <span
      title={Присвоено место: ${place}}
      className={inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
        STYLES[place] ?? "bg-gray-100 text-gray-600"
      }}
    >
      {place} место
    </span>
  );
}
