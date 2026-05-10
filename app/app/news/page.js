import Link from "next/link";

const newsArticles = [
  {
    title: "Prismatic Evolutions Set List Leaked?",
    source: "PokeBeach",
    date: "2 hours ago",
    summary: "New leaks suggest several high-value Eeveelution cards are coming to the English set this June.",
    category: "Upcoming Set",
    link: "https://www.pokebeach.com"
  },
  {
    title: "SV09 Pre-Orders Now Live at Smyths",
    source: "Retail Update",
    date: "5 hours ago",
    summary: "Smyths Toys has officially listed pre-orders for the next main set Booster Bundles and ETBs.",
    category: "Restock",
    link: "#"
  },
  {
    title: "TCG Market Update: Rayquaza Cards See Price Hike",
    source: "Market Analytics",
    date: "1 day ago",
    summary: "Prices for older Rayquaza VMAX Alt-Arts have spiked by 15% this week across major UK platforms.",
    category: "Prices",
    link: "#"
  }
];

export default function NewsPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">DropDex <span className="text-poke-yellow">News</span></h1>
        <p className="text-gray-400">The latest UK Pokémon TCG stock updates, leaks, and market news.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN FEED (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {newsArticles.map((article, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition group cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase py-1 px-3 bg-poke-red text-white rounded-full tracking-widest">
                  {article.category}
                </span>
                <span className="text-xs text-gray-500">{article.date}</span>
              </div>
              <h2 className="text-xl font-bold group-hover:text-poke-yellow transition text-white">
                {article.title}
              </h2>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                {article.summary}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-poke-yellow font-bold uppercase tracking-tighter">
                  Source: {article.source}
                </span>
                <span className="text-xs text-white group-hover:translate-x-1 transition flex items-center gap-1">
                  Read More ➞
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* SIDEBAR (Right 1 column) */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 text-poke-yellow">Trending Stores</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between text-gray-300"><span>Argos</span> <span className="text-green-400 font-bold">Active</span></li>
              <li className="flex justify-between text-gray-300"><span>Smyths Toys</span> <span className="text-green-400 font-bold">Active</span></li>
              <li className="flex justify-between text-gray-300"><span>Magic Madhouse</span> <span className="text-gray-600">Quiet</span></li>
              <li className="flex justify-between text-gray-300"><span>Chaos Cards</span> <span className="text-gray-600">Quiet</span></li>
            </ul>
          </div>
          
          <div className="bg-poke-blue/20 border border-poke-blue/40 rounded-2xl p-6 text-center">
            <p className="text-sm font-bold text-white mb-2 italic">"Did you score a pull today?"</p>
            <p className="text-xs text-gray-400">Share your findings with the community on our socials.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
