import { getAllSets } from "@/lib/api";
import Link from "next/link";

export default async function SetsPage() {
  const eras = await getAllSets();
  const sortedEras = Object.keys(eras).reverse(); // Newest eras at the top

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold">Pokémon TCG <span className="text-poke-yellow">Sets</span></h1>
        <p className="text-gray-400">Browse every English set, organized by release era.</p>
      </div>

      {/* AD SLOT */}
      <div className="w-full h-24 bg-gray-900 border border-dashed border-gray-700 flex items-center justify-center text-gray-500 text-xs">
        ADVERTISEMENT (Leaderboard)
      </div>

      <div className="space-y-12">
        {sortedEras.map((era) => (
          <div key={era} className="space-y-4">
            <h2 className="text-xl font-bold bg-gray-800 px-4 py-2 rounded-lg border-l-4 border-poke-red inline-block">
              {era} Era
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {eras[era].reverse().map((set) => (
                <Link 
                  key={set.id} 
                  href={`/sets/${set.id}`}
                  className="group bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-poke-yellow transition text-center"
                >
                  <img 
                    src={`${set.logo}.png`} 
                    alt={set.name} 
                    className="h-16 w-auto mx-auto object-contain group-hover:scale-110 transition p-2"
                  />
                  <p className="mt-3 text-sm font-bold truncate">{set.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{set.releaseDate}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
