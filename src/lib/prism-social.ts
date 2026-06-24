import { genderTypes, type GenderType } from "@/data/types";
import { getResultTypeCodeFromCode, type Scores } from "@/lib/scoring";

const COMPARE_CACHE_MS = 30 * 24 * 60 * 60 * 1000;

export type StoredFriend = {
  type: string;
  nickname: string;
  addedAt: string;
};

type CompareCacheEntry = {
  text: string;
  createdAt: string;
};

export function getGenderTypeByCode(code: string): GenderType | undefined {
  const canonicalCode = getResultTypeCodeFromCode(code);
  return genderTypes.find((item) => item.code === canonicalCode);
}

export function getDefaultScoresFromTypeCode(code: string): Scores {
  return {
    s: code[0] === code[0]?.toUpperCase() ? 80 : 20,
    r: code[1] === code[1]?.toUpperCase() ? 80 : 20,
    d: code[2] === code[2]?.toUpperCase() ? 80 : 20,
    c: code[3] === code[3]?.toUpperCase() ? 80 : 20,
  };
}

export function getDefaultScoresForGenderType(type: GenderType): Scores {
  if (type.code.length === 4 && !type.code.startsWith("HIDDEN_")) {
    return getDefaultScoresFromTypeCode(type.code);
  }

  return { s: 50, r: 50, d: 50, c: 50 };
}

export function getPresetScoresFromTypeCode(code: string): Scores {
  return {
    s: code[0] === code[0]?.toUpperCase() ? 75 : 25,
    r: code[1] === code[1]?.toUpperCase() ? 75 : 25,
    d: code[2] === code[2]?.toUpperCase() ? 75 : 25,
    c: code[3] === code[3]?.toUpperCase() ? 75 : 25,
  };
}

export function getPresetScoresForGenderType(type: GenderType): Scores {
  if (type.code.length === 4 && !type.code.startsWith("HIDDEN_")) {
    return getPresetScoresFromTypeCode(type.code);
  }

  return { s: 50, r: 50, d: 50, c: 50 };
}

export function readScoresApproximate(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem("myScoresApproximate") === "true";
}

function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

function getSearchableNameEn(nameEn: string): string {
  return nameEn.replace(/^The\s+/i, "").toLowerCase();
}

export function matchesGenderType(type: GenderType, query: string): boolean {
  const trimmed = query.trim();

  if (!trimmed) {
    return false;
  }

  const normalized = normalizeSearchQuery(trimmed);

  return (
    type.nameZh.includes(trimmed) ||
    type.code.toLowerCase().includes(normalized) ||
    type.nameEn.toLowerCase().includes(normalized) ||
    getSearchableNameEn(type.nameEn).includes(normalized)
  );
}

export function searchGenderTypes(query: string, limit = 5): GenderType[] {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  return genderTypes.filter((type) => matchesGenderType(type, trimmed)).slice(0, limit);
}

export function getCompareCacheKey(codeA: string, codeB: string): string {
  const [first, second] = [codeA, codeB].sort();
  return `compare_${first}_${second}`;
}

export function readCompareCache(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CompareCacheEntry;

    if (!parsed.text || !parsed.createdAt) {
      return null;
    }

    const age = Date.now() - new Date(parsed.createdAt).getTime();

    if (Number.isNaN(age) || age > COMPARE_CACHE_MS) {
      window.localStorage.removeItem(key);
      return null;
    }

    return parsed.text;
  } catch {
    return null;
  }
}

export function writeCompareCache(key: string, text: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const entry: CompareCacheEntry = {
    text,
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(key, JSON.stringify(entry));
}

export function readFriends(): StoredFriend[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem("friends") || "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is StoredFriend =>
        typeof item?.type === "string" &&
        typeof item?.nickname === "string" &&
        typeof item?.addedAt === "string",
    );
  } catch {
    return [];
  }
}

export function isFriendSaved(friendCode: string): boolean {
  return readFriends().some((friend) => friend.type === friendCode);
}

export function readStoredScores(): Scores | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem("myScores") || "null") as Partial<Scores>;

    if (
      typeof parsed?.s === "number" &&
      typeof parsed?.r === "number" &&
      typeof parsed?.d === "number" &&
      typeof parsed?.c === "number"
    ) {
      return {
        s: parsed.s,
        r: parsed.r,
        d: parsed.d,
        c: parsed.c,
      };
    }
  } catch {
    return null;
  }

  return null;
}
