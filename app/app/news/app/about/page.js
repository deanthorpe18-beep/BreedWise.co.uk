export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 py-10">
      
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight">About <span className="text-poke-yellow">DropDexUK</span></h1>
        <p className="text-gray-400 text-lg">Your ultimate destination for tracking Pokémon TCG drops across the United Kingdom.</p>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6 shadow-xl">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-poke-yellow">Our Mission</h2>
          <p className="text-gray-300 text-sm leading-loose">
            Finding Pokémon cards in the UK shouldn't be a gamble. DropDexUK was built to solve a simple problem: knowing when products are in-stock and where to find the best value for your collection. We track major retailers, monitor release dates, and highlight the biggest hits from every set.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-poke-yellow">How It Works</h2>
          <p className="text-gray-300 text-sm leading-loose">
            Our platform uses a combination of API data, stock tracking tools, and community reports to keep our live ticker updated. We gather data daily to ensure you have the latest info on upcoming sets and current market trends.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-poke-yellow">Affiliate & Ad Disclosure</h2>
          <p className="text-gray-300 text-sm leading-loose">
            To keep DropDexUK free for everyone, we use advertisements and participate in affiliate marketing programs. This means we may earn a small commission when you click on certain links (like eBay) and make a purchase. This comes at absolutely no extra cost to you and helps us pay the server bills!
          </p>
        </div>
      </section>

      <section className="text-center space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-500">Contact Us</h2>
        <p className="text-gray-400 text-sm">Have a restock tip or found a bug? Let us know!</p>
        <p className="text-poke-yellow font-mono text-lg">hello@dropdexuk.com</p>
      </section>

    </div>
  );
}
