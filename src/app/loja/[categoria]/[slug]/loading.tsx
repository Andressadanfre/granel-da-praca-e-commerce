export default function Loading() {
  return (
    <main className="bg-cream min-h-screen">
      <div className="max-w-container mx-auto px-s5 xl:px-0 pt-8 pb-16">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
          <div className="rounded-card bg-skeleton-base animate-pulse h-96" />

          <div className="flex flex-col gap-4">
            <div className="animate-pulse bg-skeleton-base rounded-inner h-8" />
            <div className="animate-pulse bg-skeleton-base rounded-inner h-12" />
            <div className="animate-pulse bg-skeleton-base rounded-inner h-10" />
          </div>
        </div>
      </div>
    </main>
  )
}
