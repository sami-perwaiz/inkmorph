import type { FilterValue } from "@/types/illustration";

/** SEO-friendly category URL segments (plural). */
export const CATEGORY_SLUG_BY_FILTER: Record<
  Exclude<FilterValue, "all">,
  string
> = {
  avatar: "avatars",
  character: "characters",
  object: "objects",
  abstract: "abstract",
};

const SLUG_TO_FILTER = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_BY_FILTER).map(([filter, slug]) => [
    slug,
    filter,
  ])
) as Record<string, Exclude<FilterValue, "all">>;

export const CATEGORY_SEO_SLUGS = Object.values(CATEGORY_SLUG_BY_FILTER);

export function getCategoryHref(filter: FilterValue): string {
  if (filter === "all") {
    return "/";
  }

  return `/categories/${CATEGORY_SLUG_BY_FILTER[filter]}`;
}

export function slugToCategoryFilter(
  slug: string
): Exclude<FilterValue, "all"> | null {
  return SLUG_TO_FILTER[slug] ?? null;
}

export function filterFromPathname(pathname: string): FilterValue {
  const match = pathname.match(/^\/categories\/([^/]+)\/?$/);
  if (!match) {
    return "all";
  }

  return slugToCategoryFilter(match[1]) ?? "all";
}

export function isCategorySlug(slug: string): boolean {
  return slug in SLUG_TO_FILTER;
}
