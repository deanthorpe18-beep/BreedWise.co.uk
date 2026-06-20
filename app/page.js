import Link from "next/link";
import SearchForm from "@components/SearchForm";
import PageViewTracker from "@components/PageViewTracker";
import FeaturedBreeders from "@components/FeaturedBreeders";
import HomeDynamicContent from "@components/HomeDynamicContent";
import NewsletterSignup from "@components/NewsletterSignup";

import { websiteSchema, organizationSchema } from "@/lib/seo/schema";
import { Search, Shield, Heart, MessageCircle, Award, Users, MapPin, Star, ArrowRight, PawPrint } from "lucide-react";

export default function HomePage() {
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
                  UK Pet Breeder Directory
                </span>
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Find your perfect <span className="text-[#00BFA5]">companion</span>
              </h1>
              
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                Whether you&apos;re looking for a puppy, kitten, or something more exotic — compare UK breeder listings in one place. Take your time, read reviews, and find someone who feels right for your family.
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
                  <span>UK-wide pet breeder directory</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#00BFA5]" />
                  <span>Dogs, cats, birds &amp; more</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#FFB545]" />
                  <span>Real Google reviews</span>
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


      {/* Social proof + trending + locations (live from DB) */}
      <HomeDynamicContent />

      {/* Personal story */}
      <section className="border-y border-[#00BFA5]/10 bg-gradient-to-r from-[#FFF9F6] via-white to-[#E6FFFB]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FF6B6B]">Built in the UK, for UK pet lovers</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">Finding a breeder shouldn&apos;t feel overwhelming</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              We started BreedWise because searching for a pet often means jumping between Facebook groups,
              classified sites, and half-finished listings with no easy way to compare. We bring public breeder
              information into one calm, searchable place — so you can take your time, ask good questions,
              and feel confident before you reach out. We&apos;re an independent directory — not a marketplace — and we never sell animals ourselves.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
        <div className="mb-4 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">Gold members</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Featured breeders this week</h2>
          <p className="mt-1 text-sm text-slate-500">Verified Gold-tier breeders recommended for buyers</p>
        </div>
        <FeaturedBreeders />
      </section>

      {/* Benefits Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#00BFA5]">Why BreedWise</span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to find the right breeder</h2>
          <p className="mt-4 max-w-2xl mx-auto text-slate-600">
            No pressure, no sales pitch — just tools to help you compare, save favourites, and make a decision you feel good about.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Search, title: "Smart Search", desc: "Filter by breed, location, and distance to find breeders near you." },
            { icon: Heart, title: "Save Favourites", desc: "Create an account to save breeders and compare them later." },
            { icon: Star, title: "Real Reviews", desc: "See Google ratings and review counts for transparent comparison." },
            { icon: MessageCircle, title: "Message Breeders", desc: "Contact breeders directly through our secure messaging system." },
            { icon: Shield, title: "Verified Listings", desc: "Look for verified badges, licence info, and health testing details on breeder profiles." },
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
      <section className="bg-gradient-to-b from-[#F1F4F6] to-[#FFF9F6]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Two journeys, one platform</h2>
            <p className="mt-4 text-slate-600">Whether you&apos;re welcoming a new pet or growing your breeding business — we&apos;re here to help both sides connect with clarity.</p>
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
                  <PawPrint className="h-6 w-6 text-[#FF6B6B]" />
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

      {/* Newsletter */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 md:px-8">
        <NewsletterSignup variant="footer" />
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-[#00BFA5] flex-shrink-0" />
              <p>BreedWise is a directory only. We do not sell animals or endorse breeders.</p>
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
              <p>Verified breeders can display transparency badges, licence info, and health testing details.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
