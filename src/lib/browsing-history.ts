const STORAGE_KEY = "warmnest_browsing_history";
const MAX_ITEMS = 50;

export interface BrowsingEntry {
    productId: string;
    category: string;
    viewedAt: number;
}

function getHistory(): BrowsingEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveHistory(entries: BrowsingEntry[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ITEMS)));
    } catch {
        // Storage full or unavailable
    }
}

export function trackProductView(productId: string, category: string) {
    const history = getHistory().filter((e) => e.productId !== productId);
    history.unshift({ productId, category, viewedAt: Date.now() });
    saveHistory(history);
}

/** Get recently viewed product IDs (most recent first) */
export function getRecentlyViewedIds(limit = 10): string[] {
    return getHistory()
        .slice(0, limit)
        .map((e) => e.productId);
}

/** Get the user's most-browsed categories, ranked by frequency */
export function getTopCategories(limit = 3): string[] {
    const counts: Record<string, number> = {};
    for (const entry of getHistory()) {
        counts[entry.category] = (counts[entry.category] || 0) + 1;
    }
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([cat]) => cat);
}

/** Get the most recent category the user viewed */
export function getLastViewedCategory(): string | null {
    const history = getHistory();
    return history.length > 0 ? history[0].category : null;
}
