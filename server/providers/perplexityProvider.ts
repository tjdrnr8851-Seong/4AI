/**
 * Perplexity Provider Adapter
 * Connects directly to Perplexity Sonar API for grounding & source search
 */

import { SourceItem } from '../../src/types/quick4ai';

export interface PerplexityCallOptions {
  prompt: string;
  systemInstruction?: string;
  customKey?: string;
  model?: string;
  signal?: AbortSignal;
}

export interface PerplexityCallResult {
  text: string;
  model: string;
  durationMs: number;
  sources: SourceItem[];
  tokensUsed?: { prompt: number; completion: number; total: number };
}

export function isPerplexityConfigured(customKey?: string): boolean {
  return Boolean(customKey || process.env.PERPLEXITY_API_KEY);
}

export async function callPerplexity(options: PerplexityCallOptions): Promise<PerplexityCallResult> {
  const startTime = Date.now();
  const apiKey = options.customKey || process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error('Perplexity API key is not configured (연결 필요).');
  }

  const model = options.model || 'sonar';

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            options.systemInstruction ||
            '당신은 엄밀한 팩트체크 및 1차 출처 검증관 Perplexity입니다. 두 모델의 주장을 웹 검색과 객관적 근거로 엄밀히 조사하고 출처와 인용문을 제시하십시오.',
        },
        {
          role: 'user',
          content: options.prompt,
        },
      ],
      temperature: 0.1,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Perplexity API error [${response.status}]: ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const citations: string[] = data.citations || [];
  const durationMs = Date.now() - startTime;

  const sources: SourceItem[] = citations.map((url, idx) => {
    let hostname = 'source';
    try {
      hostname = new URL(url).hostname;
    } catch {
      // ignore
    }

    return {
      sourceId: `src_ppx_${idx + 1}`,
      url,
      title: `${hostname} 웹 출처`,
      collectedAt: new Date().toISOString(),
      evidenceQuote: 'Perplexity 검색 기반 인용 구절',
      captureLevel: 'excerpt',
      linkedClaimIds: [],
      isFailedOrMissing: false,
      accessStatus: 'accessible',
    };
  });

  return {
    text,
    model,
    durationMs,
    sources,
    tokensUsed: {
      prompt: data.usage?.prompt_tokens || 0,
      completion: data.usage?.completion_tokens || 0,
      total: data.usage?.total_tokens || 0,
    },
  };
}
