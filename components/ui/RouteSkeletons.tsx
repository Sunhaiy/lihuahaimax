import { Skeleton } from '@/components/ui/Skeleton'

export function WorksTicketSkeleton() {
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-[var(--works-stage)] px-4 py-12 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.88)_0%,transparent_48%)] dark:bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.06)_0%,transparent_44%)]" />

      <div className="relative flex w-full max-w-6xl flex-col items-center">
        <div className="relative w-full max-w-[19.6rem] sm:max-w-[20.2rem]">
          <div className="absolute inset-x-7 top-4 h-full rounded-[2rem] bg-black/10 blur-[18px] dark:bg-black/35" />
          <div className="relative overflow-hidden rounded-[1.85rem] border border-black/10 bg-[var(--works-ticket-bg)] p-[0.92rem] dark:border-white/10">
            <Skeleton className="aspect-[1.43/1] w-full rounded-[1.08rem] bg-black/8 dark:bg-black/12" />

            <div className="space-y-3 px-[0.35rem] pb-1 pt-[1.15rem]">
              <Skeleton className="h-3 w-14 rounded-full bg-black/8 dark:bg-black/12" />
              <Skeleton className="h-7 w-3/4 rounded-full bg-black/10 dark:bg-black/14" />
              <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12 rounded-full bg-black/8 dark:bg-black/12" />
                  <Skeleton className="h-5 w-24 rounded-full bg-black/10 dark:bg-black/14" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12 rounded-full bg-black/8 dark:bg-black/12" />
                  <Skeleton className="h-5 w-20 rounded-full bg-black/10 dark:bg-black/14" />
                </div>
              </div>
            </div>

            <div className="relative mt-[1.35rem]">
              <span className="absolute -left-[1.55rem] top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 rounded-full bg-[var(--works-stage)]" />
              <span className="absolute -right-[1.55rem] top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 rounded-full bg-[var(--works-stage)]" />
              <div className="h-px w-full bg-[radial-gradient(circle,rgba(255,255,255,0.42)_1px,transparent_1.2px)] bg-[length:10px_1px] bg-repeat-x bg-center dark:bg-[radial-gradient(circle,rgba(0,0,0,0.24)_1px,transparent_1.2px)]" />
            </div>

            <div className="px-[1rem] pb-[1rem] pt-[1.55rem]">
              <Skeleton className="h-[2.55rem] w-full rounded-[2px] bg-black/10 dark:bg-black/14" />
            </div>
          </div>
        </div>

        <div className="mt-9 flex items-center gap-3">
          <Skeleton className="h-[3.1rem] w-[3.1rem] rounded-full bg-black/8 dark:bg-white/6" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-2.5 w-7 rounded-full bg-black/14 dark:bg-white/10" />
            <Skeleton className="h-2.5 w-2.5 rounded-full bg-black/10 dark:bg-white/8" />
            <Skeleton className="h-2.5 w-2.5 rounded-full bg-black/10 dark:bg-white/8" />
          </div>
          <Skeleton className="h-[3.1rem] w-[3.1rem] rounded-full bg-black/8 dark:bg-white/6" />
        </div>

        <div className="mt-5 flex w-full max-w-xl flex-col items-center gap-3">
          <Skeleton className="h-3 w-24 rounded-full bg-black/10 dark:bg-white/8" />
          <Skeleton className="h-4 w-full rounded-full bg-black/8 dark:bg-white/6" />
        </div>
      </div>
    </section>
  )
}

export function WorkDetailSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-14 w-80 rounded-[20px]" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_360px]">
          <div className="space-y-7">
            <div className="rounded-[30px] border border-black/6 p-4 dark:border-white/8 sm:p-5">
              <Skeleton className="aspect-[16/10] w-full rounded-[24px]" />

              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square rounded-[18px]" />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-24 rounded-full" />
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-[28px] border border-black/6 p-6 dark:border-white/8">
                <Skeleton className="h-4 w-24 rounded-full" />
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-4 w-full rounded-full" />
                  <Skeleton className="h-4 w-[94%] rounded-full" />
                  <Skeleton className="h-4 w-[82%] rounded-full" />
                  <Skeleton className="h-4 w-[74%] rounded-full" />
                </div>
              </div>

              <div className="rounded-[28px] border border-black/6 p-6 dark:border-white/8">
                <Skeleton className="h-4 w-24 rounded-full" />
                <div className="mt-4 space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-3 w-20 rounded-full" />
                      <Skeleton className="h-6 w-40 rounded-full" />
                      <Skeleton className="h-4 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-black/6 p-6 dark:border-white/8">
              <Skeleton className="h-4 w-16 rounded-full" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-[22px] border border-black/6 p-4 dark:border-white/8">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24 rounded-full" />
                      <Skeleton className="h-3 w-20 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-black/6 p-6 dark:border-white/8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-10 w-24 rounded-[18px]" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <Skeleton className="mt-5 h-2 w-full rounded-full" />
              <div className="mt-6 grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-[18px]" />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-black/6 p-6 dark:border-white/8">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="mt-4 h-9 w-36 rounded-[18px]" />
              <Skeleton className="mt-3 h-4 w-full rounded-full" />
              <div className="mt-5 grid grid-cols-2 gap-4 rounded-[22px] border border-black/6 p-4 dark:border-white/8">
                <Skeleton className="h-14 rounded-[18px]" />
                <Skeleton className="h-14 rounded-[18px]" />
              </div>
              <Skeleton className="mt-5 h-11 w-full rounded-[18px]" />
              <Skeleton className="mt-3 h-11 w-full rounded-[18px]" />
            </div>

            <div className="rounded-[28px] border border-black/6 p-6 dark:border-white/8">
              <Skeleton className="h-3 w-24 rounded-full" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 rounded-[18px]" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <Skeleton className="h-16 rounded-[22px]" />
          <Skeleton className="h-12 rounded-full" />
          <Skeleton className="h-16 rounded-[22px]" />
        </div>
      </div>
    </section>
  )
}

export function PostsPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
      <div className="space-y-4">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-10 w-48 rounded-[20px]" />
        <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
      </div>

      <div className="mt-10 rounded-[28px] border border-black/6 p-6 dark:border-white/8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-4 w-52 rounded-full" />
          </div>
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <Skeleton className="aspect-[16/8] w-full rounded-[24px]" />
      </div>

      <div className="mt-8 space-y-5">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-[24px] border border-black/6 dark:border-white/8">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-4/5 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-5/6 rounded-full" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-3 w-14 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PostDetailSkeleton() {
  return (
    <div>
      <section className="relative overflow-hidden" style={{ minHeight: '420px' }}>
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="relative flex min-h-[420px] flex-col items-center justify-center px-6 pb-28 pt-16 text-center sm:px-20">
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            <Skeleton className="h-8 w-20 rounded-full bg-white/12" />
            <Skeleton className="h-8 w-16 rounded-full bg-white/12" />
          </div>
          <Skeleton className="h-12 w-full max-w-3xl rounded-[20px] bg-white/14" />
          <Skeleton className="mt-4 h-5 w-full max-w-xl rounded-full bg-white/10" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-6">
          <Skeleton className="h-11 w-[26rem] rounded-xl bg-white/12" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-3 py-10 sm:px-5">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_220px]">
          <article className="space-y-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-5 w-40 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-[94%] rounded-full" />
                <Skeleton className="h-4 w-[82%] rounded-full" />
              </div>
            ))}

            <div className="rounded-2xl border border-black/6 p-6 dark:border-white/8">
              <div className="flex items-center gap-5">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 rounded-full" />
                  <Skeleton className="h-3 w-24 rounded-full" />
                  <Skeleton className="h-4 w-full rounded-full" />
                </div>
              </div>
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="rounded-xl border border-black/6 p-4 dark:border-white/8">
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-full rounded-full" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export function GalleryPageSkeleton() {
  return (
    <section className="relative isolate overflow-hidden bg-black px-5 py-8 sm:px-8 md:h-[calc(100vh-4rem)] md:min-h-[780px] xl:px-12">
      <div className="mx-auto grid h-full max-w-[1520px] items-center gap-8 xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-10">
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="relative px-4 py-2">
              <div className="absolute inset-x-9 top-4 h-full rounded-[2rem] border border-white/8 bg-white/[0.03]" />
              <div className="absolute inset-x-8 top-3 h-full rounded-[2rem] border border-white/8 bg-white/[0.04]" />
              <div className="relative rounded-[2rem] border border-white/10 bg-[#f4efe6] p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-5 rounded-full bg-black/10" />
                  <Skeleton className="h-3 w-24 rounded-full bg-black/10" />
                  <Skeleton className="h-4 w-4 rounded-full bg-black/10" />
                </div>
                <Skeleton className="mt-3 aspect-[4/5] w-full rounded-[1.4rem] bg-black/10" />
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-7 w-32 rounded-full bg-black/12" />
                    <Skeleton className="h-4 w-16 rounded-full bg-black/10" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-4 rounded-full bg-black/10" />
                    <Skeleton className="h-4 w-4 rounded-full bg-black/10" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex min-w-0 items-center justify-center">
          <div className="w-full max-w-[980px]">
            <div className="relative flex h-[clamp(19rem,34vw,30rem)] items-center justify-center">
              <Skeleton className="absolute left-1/2 top-1/2 h-[clamp(20rem,38vw,33rem)] w-[clamp(14.5rem,27vw,26rem)] -translate-x-[110%] -translate-y-1/2 rounded-[2rem] bg-white/7" />
              <Skeleton className="absolute left-1/2 top-1/2 h-[clamp(20rem,38vw,33rem)] w-[clamp(14.5rem,27vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-white/10" />
              <Skeleton className="absolute left-1/2 top-1/2 h-[clamp(20rem,38vw,33rem)] w-[clamp(14.5rem,27vw,26rem)] translate-x-[10%] -translate-y-1/2 rounded-[2rem] bg-white/7" />
            </div>

            <div className="mt-5 flex flex-col items-center">
              <Skeleton className="h-4 w-56 rounded-full bg-white/8" />
              <Skeleton className="mt-3 h-4 w-full max-w-[32rem] rounded-full bg-white/8" />
              <div className="mt-6 h-[3.1rem] w-full max-w-[40rem] rounded-[2rem] bg-white/[0.03] px-8">
                <Skeleton className="mx-auto mt-5 h-[0.65rem] w-full rounded-full bg-white/8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function MomentsPageSkeleton() {
  return (
    <div className="mx-auto max-w-[760px] px-4 pb-16 pt-9 sm:px-5 sm:pt-12">
      <section className="mb-8 space-y-4 px-1">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-12 w-40 rounded-[20px]" />
        <Skeleton className="h-4 w-full max-w-xl rounded-full" />
      </section>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-[28px] border border-black/6 p-5 dark:border-white/8">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-24 w-px rounded-full" />
              </div>
              <div className="flex-1 space-y-3">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-32 w-full rounded-[22px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LinksPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
      <div className="grid items-start gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-white/10 bg-[rgba(20,20,22,0.58)] p-6">
          <Skeleton className="h-3 w-16 rounded-full bg-white/10" />
          <div className="mt-4 flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-[20px] bg-white/10" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-40 rounded-full bg-white/12" />
              <Skeleton className="h-4 w-28 rounded-full bg-white/8" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full bg-white/8" />
            <Skeleton className="h-8 w-20 rounded-full bg-white/8" />
            <Skeleton className="h-8 w-20 rounded-full bg-white/8" />
          </div>
          <div className="mt-6 rounded-[22px] border border-white/10 p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className={`rounded-[16px] border border-white/8 p-3 ${index === 4 ? 'sm:col-span-2' : ''}`}>
                  <Skeleton className="h-3 w-24 rounded-full bg-white/8" />
                  <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-[rgba(20,20,22,0.58)] p-6">
          <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
          <Skeleton className="mt-4 h-4 w-full rounded-full bg-white/8" />
          <div className="mt-5 rounded-[24px] border border-white/8 p-5">
            <Skeleton className="h-3 w-24 rounded-full bg-white/8" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full rounded-full bg-white/10" />
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-[22px] border border-white/8 p-4">
            <Skeleton className="h-3 w-20 rounded-full bg-white/8" />
            <Skeleton className="mt-3 h-10 w-40 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <div className="space-y-3">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-4 w-80 rounded-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <div key={cardIndex} className="rounded-[26px] border border-white/10 bg-[rgba(18,18,20,0.52)] p-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-2xl bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
                      <Skeleton className="h-3 w-24 rounded-full bg-white/8" />
                    </div>
                  </div>
                  <Skeleton className="mt-4 h-24 w-full rounded-[20px] bg-white/8" />
                  <div className="mt-4 flex items-center justify-between">
                    <Skeleton className="h-3 w-20 rounded-full bg-white/8" />
                    <Skeleton className="h-3 w-10 rounded-full bg-white/8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AboutPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-16 flex flex-col items-start gap-8 sm:flex-row sm:items-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-4 w-full max-w-lg rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]">
        <div className="space-y-12">
          {Array.from({ length: 2 }).map((_, index) => (
            <section key={index} className="space-y-4">
              <Skeleton className="h-6 w-28 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-[94%] rounded-full" />
                <Skeleton className="h-4 w-[82%] rounded-full" />
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-10">
          {Array.from({ length: 2 }).map((_, index) => (
            <section key={index} className="space-y-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((__, rowIndex) => (
                  <div key={rowIndex} className="flex gap-4">
                    <Skeleton className="h-4 w-10 rounded-full" />
                    <Skeleton className="h-4 flex-1 rounded-full" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
