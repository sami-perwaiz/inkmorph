import { ContactEmail } from "@/components/ContactEmail/ContactEmail";
import type { LegalSection } from "@/components/LegalPage/legalPageTypes";

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="legal-page__list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

interface LegalSectionsProps {
  sections: readonly LegalSection[];
}

export function LegalSections({ sections }: LegalSectionsProps) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.title} className="legal-page__section">
          <h2 className="legal-page__h2">{section.title}</h2>

          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="legal-page__p">
              {paragraph}
            </p>
          ))}

          {section.list ? <BulletList items={section.list} /> : null}

          {section.secondaryHeading ? (
            <p className="legal-page__p">{section.secondaryHeading}</p>
          ) : null}

          {section.secondaryList ? (
            <BulletList items={section.secondaryList} />
          ) : null}

          {section.trailingParagraphs?.map((paragraph) => (
            <p key={paragraph} className="legal-page__p">
              {paragraph}
            </p>
          ))}

          {section.contactEmail ? (
            <>
              <p className="legal-page__p">
                <strong className="legal-page__strong">Email</strong>
              </p>
              <p className="legal-page__p">
                <ContactEmail />
              </p>
            </>
          ) : null}
        </section>
      ))}
    </>
  );
}
