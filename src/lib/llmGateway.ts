// src/lib/llmGateway.ts
import { callGeminiGenerate } from './geminiClient';
import { callNvidiaChat, callNvidiaVision } from './nvidiaClient';
import { recordApiCall } from './apiUsageTracker';

export interface LlmRequestOptions {
  prompt?: string;
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  systemInstruction?: string;
  responseFormatJson?: boolean;
  temperature?: number;
  maxTokens?: number;
  providerPreference?: 'auto' | 'gemini' | 'nvidia';
}

export interface LlmResponse {
  text: string;
  provider: 'gemini' | 'nvidia';
  model: string;
  latencyMs: number;
}

/**
 * Unified LLM caller with Intelligent Auto-Failover:
 * Primary: Google Gemini (High speed & reasoning)
 * Secondary: NVIDIA NIM (Robust 70B models, 1000 free test credits)
 */
export async function callLlmUnified(options: LlmRequestOptions): Promise<LlmResponse> {
  const {
    prompt,
    messages = [],
    systemInstruction,
    responseFormatJson = false,
    providerPreference = 'auto',
  } = options;

  // Normalize prompt into message array
  const formattedMessages = [...messages];
  if (prompt && formattedMessages.length === 0) {
    formattedMessages.push({ role: 'user', content: prompt });
  }

  // 1. Direct NVIDIA preference
  if (providerPreference === 'nvidia') {
    const startTime = Date.now();
    try {
      const result = await callNvidiaChat({
        messages: formattedMessages,
        systemInstruction,
        responseFormatJson,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      });
      const latencyMs = Date.now() - startTime;
      await recordApiCall({
        provider: 'nvidia',
        model: result.model,
        status: 'success',
        statusCode: 200,
        durationMs: latencyMs,
      });
      return { text: result.text, provider: 'nvidia', model: result.model, latencyMs };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      await recordApiCall({
        provider: 'nvidia',
        status: 'failed',
        statusCode: 500,
        durationMs: latencyMs,
        errorMessage: err?.message || 'NVIDIA NIM error',
      });
      throw err;
    }
  }

  // 2. Primary: Try Gemini
  const startTime = Date.now();
  let geminiFailed = false;
  let geminiError: any = null;

  try {
    const contents = formattedMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const text = await callGeminiGenerate({
      contents,
      systemInstruction,
      responseMimeType: responseFormatJson ? 'application/json' : undefined,
    });

    const latencyMs = Date.now() - startTime;
    await recordApiCall({
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      status: 'success',
      statusCode: 200,
      durationMs: latencyMs,
    });

    return { text, provider: 'gemini', model: 'gemini-1.5-flash', latencyMs };
  } catch (err: any) {
    geminiFailed = true;
    geminiError = err;
    const latencyMs = Date.now() - startTime;

    const isRateLimit = err?.message?.includes('429') || err?.message?.includes('Rate limit');
    await recordApiCall({
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      status: isRateLimit ? 'rate_limited' : 'failed',
      statusCode: isRateLimit ? 429 : 500,
      durationMs: latencyMs,
      errorMessage: err?.message || 'Gemini error',
    });

    console.warn(`[LLM Gateway] Gemini failed (${err?.message}). Checking failover to NVIDIA NIM...`);
  }

  // 3. Failover: If Gemini failed and Auto-mode is active, failover to NVIDIA NIM
  if (geminiFailed) {
    const hasNvidiaKey = Boolean(process.env.NVIDIA_API_KEY);
    if (!hasNvidiaKey) {
      throw geminiError;
    }

    console.log('[LLM Gateway] 🚀 Auto-failing over to NVIDIA NIM (OpenAI-compatible)...');
    const nvStartTime = Date.now();
    try {
      const result = await callNvidiaChat({
        messages: formattedMessages,
        systemInstruction,
        responseFormatJson,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      });

      const nvLatency = Date.now() - nvStartTime;
      await recordApiCall({
        provider: 'nvidia',
        model: result.model,
        status: 'success',
        statusCode: 200,
        durationMs: nvLatency,
      });

      return { text: result.text, provider: 'nvidia', model: result.model, latencyMs: nvLatency };
    } catch (nvErr: any) {
      const nvLatency = Date.now() - nvStartTime;
      await recordApiCall({
        provider: 'nvidia',
        status: 'failed',
        statusCode: 500,
        durationMs: nvLatency,
        errorMessage: nvErr?.message || 'NVIDIA failover error',
      });
      // Throw combined error
      throw new Error(`Dual LLM failure: Gemini (${geminiError?.message}) | NVIDIA NIM (${nvErr?.message})`);
    }
  }

  throw new Error('LLM Gateway encountered an unexpected termination state');
}

/**
 * Multimodal Vision Unified OCR Caller
 */
export async function callLlmVisionUnified(params: {
  prompt: string;
  imageBase64: string;
  mimeType: string;
}): Promise<{ text: string; provider: 'gemini' | 'nvidia'; model: string }> {
  const startTime = Date.now();

  // Try Gemini Vision first
  try {
    const contents = [
      {
        role: 'user',
        parts: [
          { text: params.prompt },
          {
            inlineData: {
              mimeType: params.mimeType,
              data: params.imageBase64,
            },
          },
        ],
      },
    ];

    const text = await callGeminiGenerate({ contents });
    const latency = Date.now() - startTime;
    await recordApiCall({
      provider: 'gemini',
      model: 'gemini-1.5-flash-vision',
      status: 'success',
      statusCode: 200,
      durationMs: latency,
    });
    return { text, provider: 'gemini', model: 'gemini-1.5-flash' };
  } catch (geminiErr: any) {
    console.warn('[Vision Gateway] Gemini vision failed, falling over to NVIDIA Vision NIM...', geminiErr?.message);
    const latency = Date.now() - startTime;
    await recordApiCall({
      provider: 'gemini',
      model: 'gemini-1.5-flash-vision',
      status: geminiErr?.message?.includes('429') ? 'rate_limited' : 'failed',
      statusCode: 500,
      durationMs: latency,
      errorMessage: geminiErr?.message,
    });
  }

  // Failover to NVIDIA Vision
  const nvStart = Date.now();
  try {
    const nvResult = await callNvidiaVision(params);
    const nvLatency = Date.now() - nvStart;
    await recordApiCall({
      provider: 'nvidia',
      model: nvResult.model,
      status: 'success',
      statusCode: 200,
      durationMs: nvLatency,
    });
    return { text: nvResult.text, provider: 'nvidia', model: nvResult.model };
  } catch (nvErr: any) {
    const nvLatency = Date.now() - nvStart;
    await recordApiCall({
      provider: 'nvidia',
      status: 'failed',
      statusCode: 500,
      durationMs: nvLatency,
      errorMessage: nvErr?.message,
    });
    throw new Error(`Dual Vision OCR failed: ${nvErr?.message}`);
  }
}
