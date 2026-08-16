import {
  getIllustrationContentCategory,
  type IllustrationContentCategory,
} from "@/lib/enrichIllustrationTags";
import {
  expandSearchToken,
  normalizeSearchTerm,
  tokenizeSearchQuery,
} from "@/lib/searchSynonyms";
import type { Illustration } from "@/types/illustration";

import { getSearchableGalleryIllustrations } from "@/lib/premiumFeatureAccess";

export interface AssetSearchMetaEntry {
  name: string;
  tags: string[];
}

export interface AssetSearchMetadata {
  version: 1;
  byFilename: Record<string, AssetSearchMetaEntry>;
}

interface SearchableIllustrationFields {
  id: string;
  filename: string;
  name?: string;
  tags?: string[];
  alt?: string;
}

interface RankedIllustration<T extends Illustration> {
  item: T;
  score: number;
}

const STYLE_TERMS = new Set([
  "3d",
  "3d icon",
  "3d illustration",
  "cartoon",
  "cute",
  "kawaii",
  "minimalist",
  "isometric",
  "render",
  "illustration",
  "ui icon",
  "icon",
  "design element",
  "abstract",
  "decorative",
]);

const USE_CASE_TERMS = new Set([
  "profile",
  "avatar",
  "social media",
  "account",
  "identity",
  "app",
  "website",
  "presentation",
  "marketing",
  "branding",
  "interface",
  "ui",
]);

const CATEGORY_TERMS: Record<IllustrationContentCategory, string[]> = {
  avatar: ["avatar", "profile", "user", "portrait", "headshot", "social media"],
  character: ["character", "mascot", "persona", "figure"],
  object: ["object", "icon", "item", "prop", "tool"],
  abstract: ["abstract", "decorative", "pattern", "shape"],
};

function splitWords(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);
}

function hasExactWord(words: string[], term: string): boolean {
  return words.includes(term);
}

function termMatchesText(text: string, term: string): boolean {
  const normalized = normalizeSearchTerm(text);
  if (!normalized) {
    return false;
  }

  if (term.includes(" ")) {
    return normalized.includes(term);
  }

  return splitWords(normalized).includes(term);
}

function scoreTokenMatch({
  item,
  term,
  rank,
  nameWords,
  normalizedName,
  normalizedTags,
  normalizedAlt,
  normalizedFilename,
  normalizedId,
  contentCategory,
}: {
  item: SearchableIllustrationFields;
  term: string;
  rank: number;
  nameWords: string[];
  normalizedName: string;
  normalizedTags: string[];
  normalizedAlt: string;
  normalizedFilename: string;
  normalizedId: string;
  contentCategory: IllustrationContentCategory;
}): number {
  const rankPenalty = rank * 4;
  let score = 0;

  if (hasExactWord(nameWords, term)) {
    score = Math.max(score, 120 - rankPenalty);
  } else if (termMatchesText(normalizedName, term)) {
    score = Math.max(score, 95 - rankPenalty);
  }

  for (const tag of normalizedTags) {
    if (tag === term) {
      score = Math.max(score, 90 - rankPenalty);
      continue;
    }

    const tagWords = splitWords(tag);
    if (hasExactWord(tagWords, term)) {
      score = Math.max(score, 75 - rankPenalty);
      continue;
    }

    if (term.includes(" ") && tag.includes(term)) {
      score = Math.max(score, 45 - rankPenalty);
    }
  }

  if (termMatchesText(normalizedAlt, term)) {
    score = Math.max(score, 35 - rankPenalty);
  }

  if (CATEGORY_TERMS[contentCategory].includes(term)) {
    score = Math.max(score, 30 - rankPenalty);
  }

  if (contentCategory === term) {
    score = Math.max(score, 40 - rankPenalty);
  }

  if (STYLE_TERMS.has(term)) {
    for (const tag of normalizedTags) {
      if (STYLE_TERMS.has(tag)) {
        score = Math.max(score, 18 - rankPenalty);
        break;
      }
    }
  }

  if (USE_CASE_TERMS.has(term)) {
    for (const tag of normalizedTags) {
      if (USE_CASE_TERMS.has(tag)) {
        score = Math.max(score, 14 - rankPenalty);
        break;
      }
    }
  }

  if (normalizedFilename.includes(term) && term.length >= 4) {
    score = Math.max(score, 10 - rankPenalty);
  }

  if (normalizedId.includes(term) && term.length >= 4) {
    score = Math.max(score, 8 - rankPenalty);
  }

  void item;

  return score;
}

function buildExpandedTokenGroups(tokens: string[]): Array<Array<{ term: string; rank: number }>> {
  return tokens.map((token) => {
    const seen = new Set<string>();
    const expanded: Array<{ term: string; rank: number }> = [];

    const add = (term: string, rank: number) => {
      const normalized = normalizeSearchTerm(term);
      if (!normalized || seen.has(normalized)) {
        return;
      }

      seen.add(normalized);
      expanded.push({ term: normalized, rank });
    };

    for (const entry of expandSearchToken(token)) {
      add(entry.term, entry.rank);
    }

    return expanded;
  });
}

/** Score one asset against a normalized query using semantic synonym expansion. */
export function scoreIllustrationSearch<T extends SearchableIllustrationFields>(
  item: T,
  query: string
): number {
  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) {
    return 0;
  }

  const normalizedName = normalizeSearchTerm(item.name ?? "");
  const nameWords = splitWords(normalizedName);
  const normalizedTags = (item.tags ?? []).map((tag) => normalizeSearchTerm(tag));
  const normalizedAlt = normalizeSearchTerm(item.alt ?? "");
  const normalizedFilename = normalizeSearchTerm(item.filename);
  const normalizedId = normalizeSearchTerm(item.id);
  const contentCategory = getIllustrationContentCategory(item.filename);
  const tokenGroups = buildExpandedTokenGroups(tokens);

  let totalScore = 0;

  for (const group of tokenGroups) {
    let bestForToken = 0;

    for (const { term, rank } of group) {
      bestForToken = Math.max(
        bestForToken,
        scoreTokenMatch({
          item,
          term,
          rank,
          nameWords,
          normalizedName,
          normalizedTags,
          normalizedAlt,
          normalizedFilename,
          normalizedId,
          contentCategory,
        })
      );
    }

    if (bestForToken === 0) {
      return 0;
    }

    totalScore += bestForToken;
  }

  return totalScore;
}

/** Case-insensitive semantic match against name, tags, filename, alt, and id. */
export function illustrationMatchesQuery(
  item: SearchableIllustrationFields,
  query: string
): boolean {
  return scoreIllustrationSearch(item, query) > 0;
}

export function filterIllustrationsBySearch<T extends Illustration>(
  items: T[],
  query: string
): T[] {
  const normalized = query.trim();
  if (!normalized) {
    return items;
  }

  const ranked: RankedIllustration<T>[] = [];

  for (const item of items) {
    const score = scoreIllustrationSearch(item, normalized);
    if (score > 0) {
      ranked.push({ item, score });
    }
  }

  ranked.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.item.src.localeCompare(b.item.src, undefined, { numeric: true });
  });

  return ranked.map(({ item }) => item);
}

/** Search within a scoped list after plan-based accessibility filtering. */
export function searchGalleryIllustrations<T extends Illustration>({
  items,
  query,
  hasPremiumAccess,
}: {
  items: T[];
  query: string;
  hasPremiumAccess: boolean;
}): T[] {
  const accessible = getSearchableGalleryIllustrations(items, hasPremiumAccess);
  return filterIllustrationsBySearch(accessible, query);
}
