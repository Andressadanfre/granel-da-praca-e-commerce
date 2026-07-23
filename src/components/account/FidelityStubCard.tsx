export function FidelityStubCard() {
  return (
    <section
      className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-card bg-gradient-to-br from-gdeep to-gd px-7 py-6 opacity-[0.92] sm:flex-row sm:items-center"
      aria-label="Programa de fidelidade — em breve"
    >
      <div
        className="pointer-events-none absolute -right-[10%] -top-[40%] h-[200px] w-[200px] rounded-full bg-white/5"
        aria-hidden
      />
      <div className="relative z-10 text-white">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white/70">
          Programa de fidelidade
        </p>
        <p className="mb-1 text-lg font-semibold">Acumule pontos a cada compra</p>
        <p className="text-[12.5px] text-white/75">
          Troque por descontos e produtos exclusivos.
        </p>
        <span className="mt-2.5 inline-block rounded-pill bg-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.04em] text-white">
          Em breve
        </span>
      </div>
      <div className="relative z-10 text-left sm:text-right">
        <p className="text-[32px] font-bold leading-none text-white">0</p>
        <p className="mt-1 text-[11px] text-white/65">pontos</p>
      </div>
    </section>
  )
}
