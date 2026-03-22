import { fetchWithAuth } from "../lib/fetchWithAuth";
import { AnalysisRequest, AnalysisResult } from "../types/analysis";

export async function runAnalysis(req: AnalysisRequest): Promise<{message: string, analysisResult: AnalysisResult}> {
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