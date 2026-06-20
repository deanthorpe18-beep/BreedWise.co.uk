export default function WarmHero({ eyebrow, title, description, children, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[#00BFA5]/10 bg-gradient-to-br from-[#E6FFFB] via-white to-[#FFF5F0] p-8 shadow-sm sm:p-10 ${className}`}
    >
      <div className="relative space-y-3">
        {eyebrow && (
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#00BFA5]">{eyebrow}</p>
        )}
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h1>
        {description && (
          <p className="max-w-2xl text-base leading-7 text-slate-600">{description}</p>
        )}
        {children}
      </div>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#00BFA5]/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#FF6B6B]/5 blur-3xl" />
    </div>
  );
}
