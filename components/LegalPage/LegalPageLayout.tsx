import "./legal-page.css";

import { BackButton } from "@/components/BackButton/BackButton";
import { LegalSections } from "@/components/LegalPage/LegalSections";
import type { LegalSection } from "@/components/LegalPage/legalPageTypes";

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  sections: readonly LegalSection[];
}

export function LegalPageLayout({
  title,
  subtitle,
  sections,
}: LegalPageLayoutProps) {
  return (
    <main>
      <article className="legal-page" aria-label={title}>
        <div className="legal-page__inner">
          <div className="legal-page__toolbar">
            <BackButton ariaLabel="Back" useHistoryBack fallbackHref="/" />
          </div>

          <header className="legal-page__intro">
            <h1 className="legal-page__title">{title}</h1>
            <p className="legal-page__subtitle">{subtitle}</p>
            <p className="legal-page__updated">
              <span className="legal-page__strong">Last Updated:</span>{" "}
              August 17, 2026
            </p>
          </header>

          <LegalSections sections={sections} />
        </div>
      </article>
    </main>
  );
}
