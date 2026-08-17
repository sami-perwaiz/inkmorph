/** Instant shell while the pack detail route loads — toolbar + icon grid layout. */
export default function PackDetailLoading() {
  return (
    <div className="min-h-screen w-full bg-white">
      <div
        className="fixed inset-x-0 top-[71px] z-40 bg-white desktop:top-[91px]"
        aria-hidden
      >
        <div className="flex w-full min-w-0 max-w-[1340px] overflow-x-hidden px-4 py-3 tablet:mx-auto tablet:px-[50px] tablet:py-5">
          <div className="flex min-h-[44px] w-full min-w-0 items-center justify-between gap-2">
            <div className="pack-icon-skeleton pack-icon-skeleton-shimmer h-[44px] w-[44px] shrink-0 rounded-[6px]" />
            <div className="pack-icon-skeleton pack-icon-skeleton-shimmer h-[44px] w-[min(42vw,140px)] shrink-0 rounded-[6px]" />
          </div>
        </div>
      </div>

      <main className="flex w-full flex-col pt-[169px] desktop:pt-[205px]">
        <section
          aria-hidden
          aria-busy="true"
          aria-label="Loading pack icons"
          className="mx-auto grid w-full max-w-[1340px] grid-cols-3 justify-items-center gap-5 px-4 tablet:grid-cols-4 tablet:px-[50px] desktop:grid-cols-6 wide:grid-cols-[repeat(8,150px)] wide:justify-center"
        >
          {Array.from({ length: 16 }, (_, index) => (
            <div
              key={index}
              className="pack-icon-cell pack-icon-skeleton pack-icon-skeleton-shimmer aspect-square w-full max-w-[150px] rounded-[16px] wide:size-[150px] wide:max-w-none"
            />
          ))}
        </section>
      </main>

      <div className="sr-only" aria-live="polite">
        Loading icon pack
      </div>
    </div>
  );
}
