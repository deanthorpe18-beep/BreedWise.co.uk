import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import MainNav from "@components/MainNav";
import CookieConsent from "@components/CookieConsent";
import { websiteSchema, organizationSchema } from "@/lib/seo/schema";
import { generateMetadata as baseMetadata } from "@/lib/seo/metadata";

const inter = Inter({ subsets: ["latin"] });

export const metadata = baseMetadata({});

export default function RootLayout({ children }) {
  const structuredData = [websiteSchema(), organizationSchema()];

  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-white text-[#2D3436]`}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
            <div className="mx-auto relative flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 md:px-8">
              <Link href="/" className="inline-flex items-center gap-2.5 text-xl font-semibold tracking-tight text-[#2D3436]">
                <img src="/logo.svg" alt="BreedWise" className="h-10 w-10" />
                <span>BreedWise.co.uk</span>
              </Link>
              <MainNav />
            </div>
          </header>

          <main className="flex-grow">{children}</main>
          <CookieConsent />

          <footer className="border-t border-slate-200 bg-[#F1F4F6] px-4 py-10 sm:px-6 md:px-8">
            <div className="mx-auto max-w-6xl space-y-6 text-sm text-slate-600">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="font-semibold text-slate-900">BreedWise</p>
                  <p className="mt-2 text-sm leading-6">A UK dog breeder directory. We help you compare public breeder information before making contact. We do not sell puppies.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Directory</p>
                  <ul className="mt-2 space-y-2">
                    <li><Link href="/search" className="hover:text-[#00BFA5]">Search breeders</Link></li>
                    <li><Link href="/claim" className="hover:text-[#00BFA5]">Claim your profile</Link></li>
                    <li><Link href="/breeder-benefits" className="hover:text-[#00BFA5]">Breeder benefits</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Legal</p>
                  <ul className="mt-2 space-y-2">
                    <li><Link href="/privacy" className="hover:text-[#00BFA5]">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="hover:text-[#00BFA5]">Terms of Use</Link></li>
                    <li><Link href="/disclaimer" className="hover:text-[#00BFA5]">Disclaimer</Link></li>
                    <li><Link href="/editorial-policy" className="hover:text-[#00BFA5]">Editorial Policy</Link></li>
                    <li><Link href="/listing-policy" className="hover:text-[#00BFA5]">Listing Policy</Link></li>
                    <li><Link href="/data-sources" className="hover:text-[#00BFA5]">Data Sources</Link></li>
                    <li><Link href="/corrections-removals" className="hover:text-[#00BFA5]">Corrections & Removals</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Support</p>
                  <ul className="mt-2 space-y-2">
                    <li><Link href="/suggest-edit" className="hover:text-[#00BFA5]">Suggest an edit</Link></li>
                    <li><Link href="/request-removal" className="hover:text-[#00BFA5]">Request listing removal</Link></li>
                    <li><Link href="/education" className="hover:text-[#00BFA5]">Buyer guides</Link></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  © {new Date().getFullYear()} BreedWise. BreedWise is a directory only. We do not sell puppies or guarantee breeder quality. All listings are provided for information purposes.
                </p>
                <div className="flex gap-4 text-xs text-slate-500">
                  <Link href="/request-removal" className="hover:text-[#00BFA5]">Request removal</Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
