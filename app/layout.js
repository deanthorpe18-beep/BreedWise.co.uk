import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import MainNav from "@components/MainNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BreedWise | UK Dog Breeder Directory",
  description: "Search trusted dog breeders across West Sussex and the UK. Find breeders by town, postcode, breed, and compare ratings, contact details, and kennel club info.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white text-[#2D3436]`}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
            <div className="mx-auto relative flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 md:px-8">
              <Link href="/" className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-[#2D3436]">
                <span className="h-10 w-10 rounded-2xl bg-[#00BFA5] text-white flex items-center justify-center font-black">BW</span>
                <span>BreedWise.co.uk</span>
              </Link>
              <MainNav />
            </div>
          </header>

          <main className="flex-grow">{children}</main>

          <footer className="border-t border-slate-200 bg-[#F1F4F6] px-4 py-8 sm:px-6 md:px-8">
            <div className="mx-auto max-w-6xl space-y-4 text-sm text-slate-600">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">BreedWise</p>
                  <p>Directory for UK dog breeders. Contact breeders directly.</p>
                </div>
                <div className="flex flex-wrap gap-3 text-slate-500">
                  <Link href="/privacy" className="hover:text-[#00BFA5]">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-[#00BFA5]">Terms</Link>
                  <Link href="/disclaimer" className="hover:text-[#00BFA5]">Disclaimer</Link>
                </div>
              </div>
              <p className="text-xs text-slate-500">© 2026 BreedWise. BreedWise is a directory. We do not sell puppies or guarantee breeder quality.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
