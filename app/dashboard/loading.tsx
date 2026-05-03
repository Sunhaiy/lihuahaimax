export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 h-1 overflow-hidden rounded-full">
        <div className="route-progress-bar h-full w-1/3 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded-full bg-white/8" />
        <div className="h-10 w-56 animate-pulse rounded-2xl bg-white/8" />
        <div className="h-4 w-full max-w-3xl animate-pulse rounded-full bg-white/6" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3 rounded-[28px] border border-white/8 bg-white/[0.03] p-6 backdrop-blur-xl">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-[20px] bg-white/[0.05]" />
          ))}
        </div>
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[20px] bg-white/[0.05]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
