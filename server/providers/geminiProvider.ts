/**
 * Google Gemini Provider Adapter
 * Uses official @google/genai TypeScript SDK with gemini-3.8-flash
 */

import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

function getClient(customKey?: string): GoogleGenAI | null {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function isGeminiConfigured(customKey?: string): boolean {
  return Boolean(customKey || process.env.GEMINI_API_KEY);
}

export interface GeminiCallOptions {
  prompt: string;
  systemInstruction?: string;
  customKey?: string;
  signal?: AbortSignal;
}

export interface GeminiCallResult {
  text: string;
  model: string;
  durationMs: number;
  tokensUsed?: { prompt: number; completion: number; total: number };
}

export async function callGemini(options: GeminiCallOptions): Promise<GeminiCallResult> {
  const startTime = Date.now();
  const client = getClient(options.customKey);

  if (!client) {
    throw new Error('Gemini API key is not configured (연결 필요).');
  }

  const model = 'gemini-3.8-flash';

  const response = await client.models.generateContent({
    model,
    contents: options.prompt,
    config: {
      systemInstruction: options.systemInstruction || '당신은 엄밀한 검증을 수행하는 AI 분석관입니다. 사실, 가정, 추론, 의견을 엄격히 구분하고 모르는 것은 지어내지 마십시오.',
    },
  });

  const text = response.text || '';
  const durationMs = Date.now() - startTime;

  return {
    text,
    model,
    durationMs,
    tokensUsed: {
      prompt: response.usageMetadata?.promptTokenCount || 0,
      completion: response.usageMetadata?.candidatesTokenCount || 0,
      total: response.usageMetadata?.totalTokenCount || 0,
    },
  };
}
