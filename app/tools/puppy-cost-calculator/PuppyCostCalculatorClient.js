"use client";

import { useState, useMemo } from "react";
import { PoundSterling, Dog, Heart } from "lucide-react";

const BREED_COSTS = {
  "Labrador Retriever": { purchase: 1200, food: 70, insurance: 35, grooming: 30 },
  "Golden Retriever": { purchase: 1300, food: 75, insurance: 35, grooming: 40 },
  "French Bulldog": { purchase: 2000, food: 50, insurance: 55, grooming: 20 },
  "Cocker Spaniel": { purchase: 1000, food: 60, insurance: 30, grooming: 50 },
  "German Shepherd": { purchase: 1100, food: 80, insurance: 40, grooming: 35 },
  "Border Collie": { purchase: 700, food: 65, insurance: 28, grooming: 25 },
  "Dachshund": { purchase: 1500, food: 45, insurance: 40, grooming: 25 },
  "Pug": { purchase: 1200, food: 40, insurance: 45, grooming: 20 },
  "Cockapoo": { purchase: 1800, food: 55, insurance: 32, grooming: 55 },
  "Other / Mixed": { purchase: 800, food: 60, insurance: 30, grooming: 30 },
};

export default function PuppyCostCalculatorClient() {
  const [breed, setBreed] = useState("Labrador Retriever");
  const [years, setYears] = useState(12);
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [includeGrooming, setIncludeGrooming] = useState(true);
  const [includeDaycare, setIncludeDaycare] = useState(false);

  const costs = BREED_COSTS[breed] || BREED_COSTS["Other / Mixed"];

  const results = useMemo(() => {
    const initial = costs.purchase + 200 + 80 + 50; // purchase + initial supplies + vet check + microchip
    const yearlyFood = costs.food * 12;
    const yearlyInsurance = includeInsurance ? costs.insurance * 12 : 0;
    const yearlyGrooming = includeGrooming ? costs.grooming * 12 : 0;
    const yearlyDaycare = includeDaycare ? 600 : 0;
    const yearlyVet = 150;
    const yearlyMisc = 100;

    const yearly = yearlyFood + yearlyInsurance + yearlyGrooming + yearlyDaycare + yearlyVet + yearlyMisc;
    const lifetime = initial + yearly * years;

    return { initial, yearly, lifetime, breakdown: { food: yearlyFood, insurance: yearlyInsurance, grooming: yearlyGrooming, daycare: yearlyDaycare, vet: yearlyVet, misc: yearlyMisc } };
  }, [breed, years, includeInsurance, includeGrooming, includeDaycare, costs]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700">Breed</label>
          <select value={breed} onChange={(e) => setBreed(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#00BFA5]">
            {Object.keys(BREED_COSTS).map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">Ownership years</label>
          <input type="range" min="1" max="18" value={years} onChange={(e) => setYears(Number(e.target.value))} className="mt-3 w-full accent-[#00BFA5]" />
          <p className="mt-1 text-sm text-slate-500">{years} years</p>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={includeInsurance} onChange={(e) => setIncludeInsurance(e.target.checked)} className="h-4 w-4 accent-[#00BFA5]" />
          Pet insurance
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={includeGrooming} onChange={(e) => setIncludeGrooming(e.target.checked)} className="h-4 w-4 accent-[#00BFA5]" />
          Professional grooming
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={includeDaycare} onChange={(e) => setIncludeDaycare(e.target.checked)} className="h-4 w-4 accent-[#00BFA5]" />
          Daycare/boarding (£50/mo)
        </label>
      </div>

      {/* Results */}
      <div className="rounded-2xl bg-[#F1F4F6] p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">First year</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">£{results.initial.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Per year</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">£{results.yearly.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lifetime ({years} yrs)</p>
            <p className="mt-1 text-2xl font-bold text-[#00BFA5]">£{results.lifetime.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
