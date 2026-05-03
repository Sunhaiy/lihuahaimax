export default function BlogLoading() {
  return (
    <div className="relative min-h-[70vh]">
      <div className="sticky top-16 z-20 h-1 overflow-hidden bg-transparent">
        <div className="route-progress-bar h-full w-1/3 rounded-full" />
      </div>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="space-y-4">
          <div className="h-4 w-28 animate-pulse rounded-full bg-white/8" />
          <div className="h-10 w-64 animate-pulse rounded-2xl bg-white/8" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-white/6" />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.03] backdrop-blur-xl"
            >
              <div className="aspect-[16/10] animate-pulse bg-white/[0.05]" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-24 animate-pulse rounded-full bg-white/[0.05]" />
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-4 w-full animate-pulse rounded-full bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
