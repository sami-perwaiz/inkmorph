import { LegalPageShell } from "@/components/LegalPage/LegalPageShell";
import { LegalPageTransition } from "@/components/LegalPage/LegalPageTransition";

export default function LegalRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LegalPageShell>
      <LegalPageTransition>{children}</LegalPageTransition>
    </LegalPageShell>
  );
}
