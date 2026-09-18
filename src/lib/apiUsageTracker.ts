import { query } from './db';

interface RecordApiCallParams {
  provider: 'gemini' | 'groq' | 'deepseek' | 'ocr' | 'nvidia';
  model?: string;
  status: 'success' | 'rate_limited' | 'failed';
  statusCode?: number;
  durationMs?: number;
  errorMessage?: string;
}

export async function recordApiCall(params: RecordApiCallParams): Promise<void> {
  const { provider, model, status, statusCode, durationMs, errorMessage } = params;

  try {
    await query(
      `INSERT INTO api_usage_logs (provider, model, status, status_code, duration_ms, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        provider,
        model || null,
        status,
        statusCode || null,
        durationMs || null,
        errorMessage || null,
      ]
    );
  } catch (err) {
    console.error('[ApiUsageTracker] Failed to record API call:', err);
  }
}

export async function getApiUsageStats(hours: number = 24) {
  try {
    const result = await query(
      `SELECT 
        provider,
        model,
        status,
        COUNT(*)::int as count,
        AVG(duration_ms)::int as avg_duration_ms,
        MIN(created_at) as first_call,
        MAX(created_at) as last_call
       FROM api_usage_logs
       WHERE created_at >= NOW() - INTERVAL '${hours} hours'
       GROUP BY provider, model, status
       ORDER BY count DESC`,
      []
    );
    return result.rows;
  } catch (err) {
    console.error('[ApiUsageTracker] Failed to get stats:', err);
    return [];
  }
}
