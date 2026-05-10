import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DropDexUK | Pokémon TCG Stock & Price Tracker",
  description: "Live UK Pokémon card restocks, set drops, and chase card values.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-poke-dark text-white min-h-screen flex flex-col`}>

        {/* TOP AD SLOT */}
        <div className="w-full bg-black py-2 flex justify-center border-b border-gray-800">
          <div className="w-[728px] h-[90px] bg-gray-900 border border-dashed border-gray-700 flex items-center justify-center text-gray-500 text-xs">
            ADVERTISEMENT (728x90)
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

            {/* LOGO */}
            <Link href="/" className="text-2xl font-bold">
              <span className="text-poke-yellow">Drop</span>
              <span className="text-white">Dex</span>
              <span className="text-poke-red">UK</span>
            </Link>

            {/* NAV LINKS */}
            <div className="hidden md:flex gap-8 text-sm font-medium">
              <Link href="/" className="hover:text-poke-yellow transition-colors">Home</Link>
              <Link href="/sets" className="hover:text-poke-yellow transition-colors">Sets</Link>
              <Link href="/chase-cards" className="hover:text-poke-yellow transition-colors">Chase Cards</Link>
              <Link href="/news" className="hover:text-poke-yellow transition-colors">News</Link>
              <Link href="/about" className="hover:text-poke-yellow transition-colors">About</Link>
            </div>

            {/* DARK/LIGHT TOGGLE PLACEHOLDER */}
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition text-lg">
              🌙
            </button>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-black border-t border-gray-800 py-10 mt-10">
          <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm space-y-2">
            <p className="text-poke-yellow font-bold text-lg">DropDexUK</p>
            <p>© 2026 DropDexUK. Prices & stock updated daily.</p>
            <p className="text-xs">Not affiliated with Nintendo or The Pokémon Company.</p>
            <div className="flex justify-center gap-6 pt-2 text-xs">
              <Link href="/about" className="hover:text-white transition">About</Link>
              <Link href="/about" className="hover:text-white transition">Affiliate Disclosure</Link>
              <Link href="/about" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
