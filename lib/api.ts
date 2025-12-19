/**
 * Data fetcher with automatic fallback
 * Tries API first, falls back to GitHub static data
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FALLBACK_URL = process.env.NEXT_PUBLIC_DATA_REPO_URL;
const API_TIMEOUT = 10000; // 10 seconds

interface FetchResult<T> {
    data: T | null;
    source: 'api' | 'fallback' | 'error';
    error?: string;
}

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

export async function fetchServerData<T>(
    apiEndpoint: string,
    fallbackFile: string
): Promise<FetchResult<T>> {
    // Try API first
    if (API_URL) {
        try {
            const response = await fetchWithTimeout(
                `${API_URL}${apiEndpoint}`,
                API_TIMEOUT
            );

            if (response.ok) {
                const data = await response.json();
                return { data, source: 'api' };
            }
        } catch (error) {
            console.warn(`API fetch failed for ${apiEndpoint}, falling back to static data`);
        }
    }

    // Fallback to GitHub static data
    if (FALLBACK_URL) {
        try {
            const response = await fetch(`${FALLBACK_URL}/${fallbackFile}`);

            if (response.ok) {
                const data = await response.json();
                return { data, source: 'fallback' };
            }
        } catch (error) {
            console.error(`Fallback fetch failed for ${fallbackFile}:`, error);
        }
    }

    return {
        data: null,
        source: 'error',
        error: 'Failed to fetch data from both API and fallback'
    };
}

// Specific fetch functions
export const fetchServerStatus = () =>
    fetchServerData('/api/server/status', 'server_status.json');

export const fetchOnlinePlayers = () =>
    fetchServerData('/api/players/online', 'online_players.json');

export const fetchPlayerStats = () =>
    fetchServerData('/api/players/stats', 'player_stats.json');

export const fetchLeaderboards = () =>
    fetchServerData('/api/leaderboards/hours', 'leaderboards.json');

export const fetchRecentActivity = () =>
    fetchServerData('/api/activity/recent', 'recent_activity.json');
