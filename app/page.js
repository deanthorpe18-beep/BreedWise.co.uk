import Link from "next/link";
import SearchForm from "@components/SearchForm";
import PageViewTracker from "@components/PageViewTracker";
import SocialProofBanner from "@components/SocialProofBanner";
import AdSensePlaceholder from "@components/AdSensePlaceholder";
import { getBreeds } from "@lib/breeders";
import { websiteSchema, organizationSchema } from "@/lib/seo/schema";
import { Search, Shield, Heart, MessageCircle, Award, Users, Dog, MapPin, Star, ArrowRight, Sparkles, TrendingUp } from "lucide-react";

export default function HomePage() {
  const breeds = getBreeds().slice(0, 6);
  const adSenseEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

  const structuredData = [
    websiteSchema(),
    organizationSchema(),
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PageViewTracker page="home" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#E6FFFB] via-white to-[#FFF5F0]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-8 sm:py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
            {/* Left: Copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#00BFA5]/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#00BFA5] animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#00BFA5]">
                  UK Dog Breeder Directory
                </span>
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Find your perfect <span className="text-[#00BFA5]">companion</span>
              </h1>
              
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                Compare dog breeder listings across the UK. Read reviews, filter by breed and location, and find the right breeder for your family.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00BFA5]/25 transition hover:bg-[#00a98e] hover:shadow-xl hover:shadow-[#00BFA5]/30"
                >
                  <Search className="h-4 w-4" />
                  Search breeders
                </Link>
                <Link
                  href="/education"
                  className="inline-flex items-center gap-2 rounded-3xl border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[#00BFA5] hover:text-[#00BFA5]"
                >
                  <Heart className="h-4 w-4" />
                  Buyer guides
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#00BFA5]" />
                  <span>1,632 breeder listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#00BFA5]" />
                  <span>Across the UK</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#FFB545]" />
                  <span>Real reviews</span>
                </div>
              </div>
            </div>

            {/* Right: Search form */}
            <div>
              <SearchForm variant="hero" />
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#00BFA5]/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#FF6B6B]/5 blur-3xl" />
      </section>

      {/* Mobile ad below hero */}
      {adSenseEnabled && (
        <div className="lg:hidden">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <AdSensePlaceholder mobileFormat="horizontal" desktopFormat="horizontal" />
          </div>
        </div>
      )}

      {/* Social Proof Banner */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 md:px-8">
        <SocialProofBanner />
      </section>

      {/* Benefits Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#00BFA5]">Why BreedWise</span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to find a breeder</h2>
          <p className="mt-4 max-w-2xl mx-auto text-slate-600">
            We make it easier to compare breeders, save your favourites, and make informed decisions.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Search, title: "Smart Search", desc: "Filter by breed, location, and distance to find breeders near you." },
            { icon: Heart, title: "Save Favourites", desc: "Create an account to save breeders and compare them later." },
            { icon: Star, title: "Real Reviews", desc: "See Google ratings and review counts for transparent comparison." },
            { icon: MessageCircle, title: "Message Breeders", desc: "Contact breeders directly through our secure messaging system." },
            { icon: Shield, title: "Claimed Profiles", desc: "Breeders can claim profiles with evidence for added transparency." },
            { icon: Award, title: "Buyer Guides", desc: "Learn what to ask, red flags to watch for, and how to stay safe." },
          ].map((benefit) => (
            <div key={benefit.title} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6FFFB] transition group-hover:bg-[#00BFA5]">
                <benefit.icon className="h-6 w-6 text-[#00BFA5] transition group-hover:text-white" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dual Journey Section */}
      <section className="bg-[#F1F4F6]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Two journeys, one platform</h2>
            <p className="mt-4 text-slate-600">Whether you are looking for a puppy or managing your breeding business, we have got you covered.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Buyer Journey */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6FFFB]">
                  <Users className="h-6 w-6 text-[#00BFA5]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Buyers</h3>
                  <p className="text-sm text-slate-500">Find your new family member</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { step: "1", title: "Search breeders", desc: "Filter by breed and location across the UK" },
                  { step: "2", title: "Compare listings", desc: "Read reviews, check licences, and view photos" },
                  { step: "3", title: "Save favourites", desc: "Create a free account to save and compare breeders" },
                  { step: "4", title: "Make contact", desc: "Message breeders directly through our secure system" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#00BFA5] text-xs font-bold text-white">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/search"
                className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#00BFA5]/20 transition hover:bg-[#00a98e]"
              >
                Start searching
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Breeder Journey */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF5F0]">
                  <Dog className="h-6 w-6 text-[#FF6B6B]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Breeders</h3>
                  <p className="text-sm text-slate-500">Grow your breeding business</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { step: "1", title: "Claim your profile", desc: "Submit evidence to verify your listing" },
                  { step: "2", title: "Update your details", desc: "Add photos, health testing info, and more" },
                  { step: "3", title: "Get discovered", desc: "Appear in search results for your breeds" },
                  { step: "4", title: "Receive enquiries", desc: "Get messages from potential buyers directly" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B6B] text-xs font-bold text-white">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/claim"
                className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-[#FF6B6B] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#FF6B6B]/20 transition hover:bg-[#e55a5a]"
              >
                Claim your profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Breeds + Locations */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Popular breeds</h3>
              <p className="mt-1 text-sm text-slate-500">Quick links to the most searched breeds</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {breeds.map((breedName) => (
                <Link
                  key={breedName}
                  href={`/search?breed=${encodeURIComponent(breedName)}`}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:bg-[#E6FFFB] hover:text-[#00BFA5]"
                >
                  <span className="flex items-center gap-2">
                    <Dog className="h-4 w-4 flex-shrink-0" />
                    {breedName}
                  </span>
                  <Sparkles className="h-3 w-3 text-slate-300 transition group-hover:text-[#00BFA5]" />
                </Link>
              ))}
            </div>
            <Link href="/search" className="inline-flex items-center gap-1 text-sm font-semibold text-[#00BFA5] hover:text-[#008f7a]">
              View all breeds <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Popular locations</h3>
              <p className="mt-1 text-sm text-slate-500">Search breeders in major UK cities</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { name: "London", count: "200+" },
                { name: "Birmingham", count: "80+" },
                { name: "Manchester", count: "70+" },
                { name: "Leeds", count: "50+" },
                { name: "Bristol", count: "40+" },
                { name: "Glasgow", count: "35+" },
                { name: "Cardiff", count: "25+" },
                { name: "Belfast", count: "20+" },
                { name: "Edinburgh", count: "30+" },
                { name: "Liverpool", count: "30+" },
                { name: "Sheffield", count: "25+" },
                { name: "Newcastle", count: "20+" },
              ].map((town) => (
                <Link
                  key={town.name}
                  href={`/search?q=${encodeURIComponent(town.name)}`}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#00BFA5] hover:bg-[#E6FFFB] hover:text-[#00BFA5]"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {town.name}
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-[#00BFA5]">{town.count}</span>
                </Link>
              ))}
            </div>
            <Link href="/search" className="inline-flex items-center gap-1 text-sm font-semibold text-[#00BFA5] hover:text-[#008f7a]">
              Explore all locations <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trending / Just Claimed Section */}
      <section className="bg-[#F1F4F6]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-5 w-5 text-[#00BFA5]" />
            <h2 className="text-2xl font-bold text-slate-900">Trending now</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { breed: "Labrador Retriever", reason: "Most searched this week", tag: "Popular" },
              { breed: "French Bulldog", reason: "Rising interest", tag: "Trending" },
              { breed: "Cocker Spaniel", reason: "High buyer activity", tag: "Active" },
            ].map((item) => (
              <Link
                key={item.breed}
                href={`/search?breed=${encodeURIComponent(item.breed)}`}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6FFFB]">
                      <Dog className="h-5 w-5 text-[#00BFA5]" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.breed}</p>
                      <p className="text-xs text-slate-500">{item.reason}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#00BFA5]/10 px-2.5 py-0.5 text-xs font-semibold text-[#00BFA5]">
                    {item.tag}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#00BFA5] opacity-0 transition group-hover:opacity-100">
                  Search breeders <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-[#00BFA5] flex-shrink-0" />
              <p>BreedWise is a directory only. We do not sell puppies or endorse breeders.</p>
            </div>
            <div className="flex items-start gap-3">
              <Search className="mt-0.5 h-5 w-5 text-[#00BFA5] flex-shrink-0" />
              <p>All listings are public information. Always do your own independent checks.</p>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-5 w-5 text-[#00BFA5] flex-shrink-0" />
              <p>Message breeders securely through our platform. Your email stays private.</p>
            </div>
            <div className="flex items-start gap-3">
              <Award className="mt-0.5 h-5 w-5 text-[#00BFA5] flex-shrink-0" />
              <p>Claimed profiles show transparency badges for added clarity.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function slugify(text) {
  return text.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
