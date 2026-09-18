// src/lib/nvidiaClient.ts

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

// Priority models for text and vision
export const NVIDIA_TEXT_MODELS = [
  'mistralai/mistral-large-2-instruct',
  'nvidia/llama-3.1-nemotron-70b-instruct',
  'deepseek-ai/deepseek-v4-flash-0731',
];

export const NVIDIA_VISION_MODELS = [
  'meta/llama-3.2-11b-vision-instruct',
  'meta/llama-3.2-90b-vision-instruct',
];

export interface NvidiaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export interface NvidiaGenerateParams {
  messages: NvidiaChatMessage[];
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
  preferredModel?: string;
}

export async function callNvidiaChat(params: NvidiaGenerateParams): Promise<{ text: string; model: string }> {
  const apiKey = process.env.NVIDIA_API_KEY || '';
  if (!apiKey) {
    throw new Error('NO_NVIDIA_API_KEY');
  }

  const messages: NvidiaChatMessage[] = [];
  if (params.systemInstruction) {
    messages.push({ role: 'system', content: params.systemInstruction });
  }
  messages.push(...params.messages);

  const candidateModels = params.preferredModel 
    ? [params.preferredModel, ...NVIDIA_TEXT_MODELS.filter(m => m !== params.preferredModel)]
    : NVIDIA_TEXT_MODELS;

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const payload: any = {
        model,
        messages,
        temperature: params.temperature ?? 0.3,
        max_tokens: params.maxTokens ?? 4096,
      };

      if (params.responseFormatJson) {
        payload.response_format = { type: 'json_object' };
      }

      const res = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        lastError = new Error(`NVIDIA API [${model}] status ${res.status}: ${errorText}`);
        console.warn(`⚠️ NVIDIA NIM call failed with model ${model}:`, res.status);
        continue; // Try next fallback model
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      return { text: content, model };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('NVIDIA NIM API call failed across all candidate models');
}

export async function callNvidiaVision(params: {
  prompt: string;
  imageBase64: string;
  mimeType: string;
}): Promise<{ text: string; model: string }> {
  const apiKey = process.env.NVIDIA_API_KEY || '';
  if (!apiKey) {
    throw new Error('NO_NVIDIA_API_KEY');
  }

  const imageUrl = `data:${params.mimeType};base64,${params.imageBase64}`;
  const messages: NvidiaChatMessage[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: params.prompt },
        { type: 'image_url', image_url: { url: imageUrl } },
      ],
    },
  ];

  let lastError: any = null;

  for (const model of NVIDIA_VISION_MODELS) {
    try {
      const res = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 4096,
          temperature: 0.1,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = new Error(`NVIDIA Vision [${model}] status ${res.status}: ${errText}`);
        continue;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      return { text: content, model };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('NVIDIA Vision call failed');
}
