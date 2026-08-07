/** Google "G" mark from Figma Social Icon (40002606:3413). */
export function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <span
      className={["relative block size-6 shrink-0 overflow-hidden", className].join(
        " "
      )}
      aria-hidden
    >
      {/* Blue */}
      <span
        className="absolute"
        style={{
          top: "40.99%",
          right: "0.97%",
          bottom: "12.07%",
          left: "51%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/google-g-1.svg"
          alt=""
          className="absolute inset-0 size-full max-w-none"
        />
      </span>
      {/* Green */}
      <span
        className="absolute"
        style={{
          top: "59.58%",
          right: "15.86%",
          bottom: "0%",
          left: "6.32%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/google-g-2.svg"
          alt=""
          className="absolute inset-0 size-full max-w-none"
        />
      </span>
      {/* Yellow */}
      <span
        className="absolute"
        style={{
          top: "27.56%",
          right: "77.07%",
          bottom: "27.54%",
          left: "1%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/google-g-3.svg"
          alt=""
          className="absolute inset-0 size-full max-w-none"
        />
      </span>
      {/* Red */}
      <span
        className="absolute"
        style={{
          top: "0%",
          right: "15.54%",
          bottom: "59.56%",
          left: "6.32%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/google-g-4.svg"
          alt=""
          className="absolute inset-0 size-full max-w-none"
        />
      </span>
    </span>
  );
}
