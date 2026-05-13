export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Disclaimer</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">BreedWise is a directory</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
          <p>BreedWise is a directory. We do not sell puppies or guarantee breeder quality.</p>
          <p>All breeder listings are provided for informational purposes only. Users should contact breeders directly to verify availability, credentials, and health testing records.</p>
          <p>Any advice or statements on BreedWise do not replace independent research, veterinary consultation, or legal advice.</p>
        </div>
      </div>
    </div>
  );
}
