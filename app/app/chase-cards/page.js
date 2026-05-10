import { getAllSets, getSetCards, getEbayLink, getTCGPlayerLink } from "@/lib/api";

export default async function ChaseCardsPage() {
  const eras = await getAllSets();
  const newestEraName = Object.keys(eras).reverse()[0]; // Get the very newest era (e.g., Scarlet & Violet)
  const newestSets = eras[newestEraName].reverse().slice(0, 3); // Get the 3 most recent sets

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold uppercase">Top <span className="text-poke-yellow">Chase Cards</span></h1>
        <p className="text-gray-400">The 8 most valuable/rare cards from the most recent releases.</p>
      </div>

      <div className="space-y-16">
        {newestSets.map(async (set) => {
          const cards = await getSetCards(set.id);
          return (
            <div key={set.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <img src={`${set.logo}.png`} alt={set.name} className="h-12 w-auto object-contain" />
                <h2 className="text-2xl font-bold">{set.name} Hits</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {cards.map((card) => (
                  <div key={card.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4 hover:shadow-xl transition">
                    <img 
                      src={`${card.image}/high.png`} 
                      alt={card.name} 
                      className="w-full h-auto rounded-lg shadow-inner shadow-black"
                    />
                    <div className="text-center">
                      <p className="font-bold text-sm truncate">{card.name}</p>
                      <p className="text-xs text-poke-yellow font-medium mt-1 uppercase tracking-tighter">{card.rarity}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <a 
                        href={getEbayLink(card.name, set.name)} 
                        target="_blank" 
                        className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2 rounded-md text-center transition"
                      >
                        BUY ON EBAY
                      </a>
                      <a 
                        href={getTCGPlayerLink(card.name)} 
                        target="_blank" 
                        className="bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold py-2 rounded-md text-center transition"
                      >
                        VIEW TCGPLAYER
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
