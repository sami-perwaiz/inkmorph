import { LAYOUT } from "@/lib/constants";

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentContainer({
  children,
  className = "",
}: ContentContainerProps) {
  return (
    <div
      className={["mx-auto w-full", className].join(" ")}
      style={{ maxWidth: LAYOUT.maxWidth }}
    >
      {children}
    </div>
  );
}
