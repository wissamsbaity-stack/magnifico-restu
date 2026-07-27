export function AdminHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-7 lg:mb-9">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-pink">
        Magnifico Admin
      </p>
      <h1 className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
          {description}
        </p>
      ) : null}
      <div className="mt-4 h-1 w-12 rounded-full bg-brand-pink" aria-hidden />
    </div>
  );
}
