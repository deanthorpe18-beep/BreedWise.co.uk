import { Star, ExternalLink } from "lucide-react";

function StarRow({ rating, size = "md" }) {
  const sizeClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const value = Number(rating);
  if (!Number.isFinite(value) || value <= 0) return null;

  return (
    <div className="flex" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(value) ? "fill-[#FFB545] text-[#FFB545]" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function GoogleRatingSummary({ rating, reviewCount, breederName, googlePlaceId }) {
  const value = rating != null ? Number(rating) : null;
  if (value == null || value <= 0) return null;

  const googleMapsUrl = googlePlaceId
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(breederName || "")}&query_place_id=${googlePlaceId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(breederName || "")}`;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Google rating</h2>
        <StarRow rating={value} size="lg" />
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <p className="text-3xl font-semibold text-slate-900">{value.toFixed(1)}</p>
        <p className="text-sm text-slate-500">out of 5</p>
        {reviewCount > 0 && (
          <p className="text-sm text-slate-500">
            ({reviewCount} review{reviewCount === 1 ? "" : "s"})
          </p>
        )}
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Rating sourced from Google Places. BreedWise does not independently verify reviewer opinions.
      </p>

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-[#F1F4F6] px-5 py-3 text-sm font-semibold text-[#00BFA5] transition hover:border-[#00BFA5]/30 hover:bg-[#00BFA5]/5 hover:text-[#008f7a]"
      >
        View reviews on Google <ExternalLink className="h-4 w-4" />
      </a>
    </section>
  );
}
