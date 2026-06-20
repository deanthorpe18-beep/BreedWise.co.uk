import { Baby, Calendar } from "lucide-react";

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function BreederPublicLitters({ litters, breederName }) {
  if (!litters?.length) return null;

  return (
    <section className="rounded-3xl border border-[#00BFA5]/30 bg-gradient-to-br from-[#E6FFFB] to-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Baby className="h-5 w-5 text-[#00BFA5]" />
        <h2 className="text-xl font-bold text-slate-900">Available litters</h2>
      </div>
      <p className="mt-1 text-sm text-slate-600">Announced by {breederName} on BreedWise</p>
      <div className="mt-4 space-y-3">
        {litters.map((litter) => {
          const available = (litter.pups || []).filter((p) => p.status === "available").length;
          return (
            <div key={litter.id} className="rounded-2xl border border-white bg-white/90 p-4">
              <p className="font-semibold text-slate-900">{litter.litter_name || litter.breed}</p>
              <p className="text-sm text-slate-600">{litter.breed} · {litter.animal_type === "cat" ? "Cats" : "Dogs"}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {litter.birth_date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Born {formatDate(litter.birth_date)}
                  </span>
                )}
                {litter.expected_go_home_date && (
                  <span>Can leave {formatDate(litter.expected_go_home_date)}</span>
                )}
                {(available > 0 || litter.total_born) && (
                  <span className="font-semibold text-[#00BFA5]">
                    {available > 0 ? `${available} available` : `${litter.total_born} in litter`}
                  </span>
                )}
              </div>
              {litter.announcement_text && (
                <p className="mt-2 text-sm text-slate-700">{litter.announcement_text}</p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Contact the breeder directly to enquire. BreedWise does not sell animals.
      </p>
    </section>
  );
}
