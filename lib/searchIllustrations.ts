import { getStorageFilename } from "@/lib/canonicalAsset";
import {
  getIllustrationContentCategory,
  type IllustrationContentCategory,
} from "@/lib/enrichIllustrationTags";
import {
  expandSearchToken,
  normalizeSearchTerm,
  tokenizeSearchQuery,
} from "@/lib/searchSynonyms";
import type { FilterValue, Illustration } from "@/types/illustration";

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
  filename?: string;
  storageFilename?: string;
  name?: string;
  tags?: string[];
  alt?: string;
}

interface RankedIllustration<T extends Illustration> {
  item: T;
  score: number;
}

interface SearchOptions {
  categoryFilter?: FilterValue;
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

const SEARCH_RESULT_CACHE = new Map<string, Illustration[]>();
const SEARCH_CACHE_LIMIT = 96;

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

/** Higher scores when the prefix covers more of the target word (cur → cursor). */
function scorePrefixOnWord(word: string, prefix: string): number {
  if (!word.startsWith(prefix)) {
    return 0;
  }

  const ratio = prefix.length / word.length;
  return Math.floor(40 + ratio * 48);
}

function scorePrefixOnWords(words: string[], prefix: string): number {
  if (prefix.length === 0) {
    return 0;
  }

  let best = 0;
  for (const word of words) {
    best = Math.max(best, scorePrefixOnWord(word, prefix));
  }

  return best;
}

function applyRankPenalty(score: number, rank: number): number {
  if (score === 0) {
    return 0;
  }

  const penalty = rank * 6;
  const capped =
    rank >= 2 ? Math.min(score, 80 - Math.max(0, rank - 2) * 8) : score;
  return Math.max(0, capped - penalty);
}

function scoreTokenMatch({
  term,
  rank,
  allowPrefix,
  nameWords,
  normalizedName,
  normalizedTags,
  normalizedAlt,
  normalizedFilename,
  normalizedId,
  contentCategory,
}: {
  term: string;
  rank: number;
  allowPrefix: boolean;
  nameWords: string[];
  normalizedName: string;
  normalizedTags: string[];
  normalizedAlt: string;
  normalizedFilename: string;
  normalizedId: string;
  contentCategory: IllustrationContentCategory;
}): number {
  let score = 0;

  if (hasExactWord(nameWords, term)) {
    score = Math.max(score, 120);
  } else if (termMatchesText(normalizedName, term)) {
    score = Math.max(score, 95);
  } else if (allowPrefix) {
    const prefixScore = scorePrefixOnWords(nameWords, term);
    score = Math.max(score, prefixScore);
    if (prefixScore >= 58 && normalizedName.startsWith(term)) {
      score = Math.max(score, prefixScore + 6);
    }
  }

  for (const tag of normalizedTags) {
    if (tag === term) {
      score = Math.max(score, 90);
      continue;
    }

    const tagWords = splitWords(tag);
    if (hasExactWord(tagWords, term)) {
      score = Math.max(score, 75);
      continue;
    }

    if (allowPrefix) {
      score = Math.max(score, scorePrefixOnWords(tagWords, term));
    }

    if (term.includes(" ") && tag.includes(term)) {
      score = Math.max(score, 45);
    }
  }

  if (termMatchesText(normalizedAlt, term)) {
    score = Math.max(score, 35);
  } else if (allowPrefix && term.length >= 2 && normalizedAlt.startsWith(term)) {
    score = Math.max(score, 22);
  }

  if (CATEGORY_TERMS[contentCategory].includes(term)) {
    score = Math.max(score, 30);
  }

  if (contentCategory === term) {
    score = Math.max(score, 40);
  }

  if (STYLE_TERMS.has(term)) {
    for (const tag of normalizedTags) {
      if (STYLE_TERMS.has(tag)) {
        score = Math.max(score, 18);
        break;
      }
    }
  }

  if (USE_CASE_TERMS.has(term)) {
    for (const tag of normalizedTags) {
      if (USE_CASE_TERMS.has(tag)) {
        score = Math.max(score, 14);
        break;
      }
    }
  }

  const minLen = allowPrefix ? 2 : 4;
  if (term.length >= minLen) {
    if (normalizedFilename.includes(term)) {
      score = Math.max(score, allowPrefix ? 32 : 10);
    }

    if (normalizedId.includes(term)) {
      score = Math.max(score, allowPrefix ? 28 : 8);
    }
  }

  return applyRankPenalty(score, rank);
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

function categoryBoost(
  item: SearchableIllustrationFields,
  categoryFilter?: FilterValue
): number {
  if (!categoryFilter || categoryFilter === "all") {
    return 0;
  }

  const storageFilename = getStorageFilename(item);
  const contentCategory = getIllustrationContentCategory(storageFilename);
  return contentCategory === categoryFilter ? 30 : 0;
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
  const storageFilename = getStorageFilename(item);
  const normalizedFilename = normalizeSearchTerm(storageFilename);
  const normalizedId = normalizeSearchTerm(item.id);
  const contentCategory = getIllustrationContentCategory(storageFilename);
  const tokenGroups = buildExpandedTokenGroups(tokens);

  let totalScore = 0;

  for (let groupIndex = 0; groupIndex < tokenGroups.length; groupIndex += 1) {
    const group = tokenGroups[groupIndex];
    const rawToken = tokens[groupIndex];
    let bestForToken = 0;

    for (const { term, rank } of group) {
      const allowPrefix = rank === 0 && term === rawToken;

      bestForToken = Math.max(
        bestForToken,
        scoreTokenMatch({
          term,
          rank,
          allowPrefix,
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

  const normalizedQuery = normalizeSearchTerm(query);
  if (normalizedQuery) {
    if (normalizedName === normalizedQuery) {
      totalScore += 30;
    } else if (normalizedName.includes(normalizedQuery)) {
      totalScore += 18;
    }

    if (normalizedTags.includes(normalizedQuery)) {
      totalScore += 24;
    }
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
  query: string,
  options?: SearchOptions
): T[] {
  const normalized = query.trim();
  if (!normalized) {
    return items;
  }

  const ranked: RankedIllustration<T>[] = [];

  for (const item of items) {
    const baseScore = scoreIllustrationSearch(item, normalized);
    if (baseScore === 0) {
      continue;
    }

    const score = baseScore + categoryBoost(item, options?.categoryFilter);
    ranked.push({ item, score });
  }

  ranked.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.item.src.localeCompare(b.item.src, undefined, { numeric: true });
  });

  return ranked.map(({ item }) => item);
}

function getSearchCacheKey(
  query: string,
  categoryFilter: FilterValue | undefined,
  hasPremiumAccess: boolean
): string {
  return `${categoryFilter ?? "all"}|${hasPremiumAccess ? "pro" : "free"}|${normalizeSearchTerm(query)}`;
}

function readSearchCache(key: string): Illustration[] | undefined {
  return SEARCH_RESULT_CACHE.get(key);
}

function writeSearchCache(key: string, results: Illustration[]): void {
  if (SEARCH_RESULT_CACHE.size >= SEARCH_CACHE_LIMIT) {
    const oldestKey = SEARCH_RESULT_CACHE.keys().next().value;
    if (oldestKey) {
      SEARCH_RESULT_CACHE.delete(oldestKey);
    }
  }

  SEARCH_RESULT_CACHE.set(key, results);
}

/** Search within a scoped list after plan-based accessibility filtering. */
export function searchGalleryIllustrations<T extends Illustration>({
  items,
  query,
  hasPremiumAccess,
  categoryFilter,
}: {
  items: T[];
  query: string;
  hasPremiumAccess: boolean;
  categoryFilter?: FilterValue;
}): T[] {
  const normalized = query.trim();
  if (!normalized) {
    return items;
  }

  const cacheKey = getSearchCacheKey(normalized, categoryFilter, hasPremiumAccess);
  const cached = readSearchCache(cacheKey);
  if (cached) {
    return cached as T[];
  }

  const accessible = getSearchableGalleryIllustrations(items, hasPremiumAccess);
  const results = filterIllustrationsBySearch(accessible, normalized, {
    categoryFilter,
  });

  writeSearchCache(cacheKey, results);
  return results;
}
