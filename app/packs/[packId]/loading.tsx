/** Instant shell while the pack detail route loads — matches icon grid layout. */
export default function PackDetailLoading() {
  return (
    <div className="min-h-screen w-full bg-white">
      <div
        className="fixed inset-x-0 top-[71px] z-40 h-[68px] bg-white desktop:top-[91px] desktop:h-[84px]"
        aria-hidden
      />
      <main className="flex w-full flex-col pt-[169px] desktop:pt-[205px]">
        <section
          aria-hidden
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
    </div>
  );
}
