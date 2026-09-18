import { llmKeyManager } from './KeyManager';

const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-2.5-flash-lite',
];

export async function callGeminiGenerate(params: {
  contents: any[];
  systemInstruction?: string;
  responseMimeType?: string;
}): Promise<string> {
  const currentKey = llmKeyManager.getCurrentKey() || process.env.GEMINI_API_KEY || '';

  if (!currentKey) {
    throw new Error('NO_API_KEY');
  }

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    // Pass API key via header 'x-goog-api-key' instead of URL query string to prevent leak in logs
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const bodyPayload: any = {
      contents: params.contents,
    };

    if (params.systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: params.systemInstruction }],
      };
    }

    if (params.responseMimeType === 'application/json') {
      bodyPayload.generationConfig = {
        responseMimeType: 'application/json',
      };
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': currentKey,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (res.status === 429 || res.status === 503) {
        llmKeyManager.reportError(currentKey, res.status);
        lastError = new Error(`Rate limit or unavailable: ${res.status}`);
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        lastError = new Error(`Gemini API error ${res.status}: ${errorText}`);
        continue;
      }

      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All models and keys exhausted');
}
