import Link from "next/link";

const stockItems = [
  { store: "Argos", product: "Prismatic Evolutions ETB", status: "In Stock", time: "12 mins ago", link: "https://www.argos.co.uk" },
  { store: "Smyths", product: "Surging Sparks Booster Bundle", status: "Recently Seen", time: "1 hr ago", link: "https://www.smythstoys.com" },
  { store: "Amazon UK", product: "Stellar Crown Display Box", status: "Low Stock", time: "34 mins ago", link: "https://www.amazon.co.uk" },
];

const upcomingDrops = [
  { name: "Destined Rivals", date: "May 30, 2026", confirmed: true },
  { name: "Scarlet & Violet Set 10", date: "August 2026", confirmed: false },
];

export default function Home() {
  return (
    <div className="space-y-14">

      {/* HERO */}
      <section className="text-center space-y-4 pt-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Never Miss a <span className="text-poke-yellow">Drop.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Real-time UK Pokémon TCG restocks, set releases, and chase card alerts.
        </p>
      </section>

      {/* LIVE TICKER */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-300">Live Retailer Stock</h2>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-poke-red text-white text-xs font-bold uppercase px-4 py-2 text-center tracking-widest">
            🔴 Live Ticker — UK Retailers
          </div>
          <div className="divide-y divide-gray-800">
            {stockItems.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                className="flex justify-between items-center px-6 py-4 hover:bg-gray-800/50 transition">
                <div>
                  <span className="text-poke-yellow font-bold text-sm block">{item.store}</span>
                  <span className="text-white text-sm">{item.product}</span>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    item.status === "In Stock" ? "bg-green-500/20 text-green-400" :
                    item.status === "Low Stock" ? "bg-orange-500/20 text-orange-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {item.status}
                  </span>
                  <span className="block text-[10px] text-gray-500 mt-1">{item.time}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ALERT SIGNUP */}
      <section className="bg-gradient-to-br from-poke-blue/30 to-poke-dark border border-poke-blue/40 rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">🔔 Get Instant Alerts</h2>
        <p className="text-gray-400">Be first to know when sets drop or restock at UK retailers.</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-grow bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-poke-yellow"
          />
          <button className="bg-poke-yellow text-black font-extrabold px-8 py-3 rounded-xl hover:bg-yellow-300 transition">
            Alert Me
          </button>
        </div>
        <p className="text-xs text-gray-600">No spam. Unsubscribe anytime.</p>
      </section>

      {/* UPCOMING DROPS */}
      <section>
        <h2 className="text-xl font-bold mb-4 uppercase tracking-widest text-gray-300">📅 Upcoming Set Releases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {upcomingDrops.map((drop, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{drop.name}</p>
                <p className="text-sm text-gray-400">{drop.date}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                drop.confirmed ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"
              }`}>
                {drop.confirmed ? "Confirmed" : "Expected"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/sets" className="group bg-gray-900 border border-gray-800 hover:border-poke-yellow rounded-xl p-6 transition">
          <p className="text-lg font-bold group-hover:text-poke-yellow">Browse All Sets →</p>
          <p className="text-gray-400 text-sm mt-1">Every English set from Base to latest.</p>
        </Link>
        <Link href="/chase-cards" className="group bg-gray-900 border border-gray-800 hover:border-poke-yellow rounded-xl p-6 transition">
          <p className="text-lg font-bold group-hover:text-poke-yellow">Top Chase Cards →</p>
          <p className="text-gray-400 text-sm mt-1">The most valuable cards from every set.</p>
        </Link>
      </section>

    </div>
  );
}
