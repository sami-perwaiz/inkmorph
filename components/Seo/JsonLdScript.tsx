interface JsonLdScriptProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/** Embeds JSON-LD structured data for search engines. */
export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
