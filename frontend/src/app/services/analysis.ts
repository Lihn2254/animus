import { fetchWithAuth } from "../lib/fetchWithAuth";
import { AnalysisOverview, AnalysisRequest, AnalysisHistoryResponse, AnalysisHistoryItem } from "../types/analysis";

export async function runAnalysis(req: AnalysisRequest): Promise<AnalysisOverview> {
    const res = await fetchWithAuth('/analysis/run', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
    })

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "Analysis execution failed.");
    }

    return res.json();
}

export async function getAnalysisHistory(params?: {
    sentiment?: string;
    date_from?: string;
    date_to?: string;
    keywords?: string;
}): Promise<AnalysisHistoryResponse> {
    const url = new URL('/analysis', window.location.origin);
    if (params) {
        if (params.sentiment) url.searchParams.set('sentiment', params.sentiment);
        if (params.date_from) url.searchParams.set('date_from', params.date_from);
        if (params.date_to) url.searchParams.set('date_to', params.date_to);
        if (params.keywords) url.searchParams.set('keywords', params.keywords);
    }

    const res = await fetchWithAuth(url.pathname + url.search);

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "Failed to fetch analysis history.");
    }

    return res.json();
}

export async function getAnalysisById(id: number): Promise<AnalysisHistoryItem> {
    const res = await fetchWithAuth(`/analysis/${id}`);

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "Failed to fetch analysis.");
    }

    return res.json();
}