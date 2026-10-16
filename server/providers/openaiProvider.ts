/**
 * OpenAI GPT Provider Adapter
 * Connects directly to OpenAI Chat Completions API
 */

export interface OpenAICallOptions {
  prompt: string;
  systemInstruction?: string;
  customKey?: string;
  model?: string;
  signal?: AbortSignal;
}

export interface OpenAICallResult {
  text: string;
  model: string;
  durationMs: number;
  tokensUsed?: { prompt: number; completion: number; total: number };
}

export function isOpenAIConfigured(customKey?: string): boolean {
  return Boolean(customKey || process.env.OPENAI_API_KEY);
}

export async function callOpenAI(options: OpenAICallOptions): Promise<OpenAICallResult> {
  const startTime = Date.now();
  const apiKey = options.customKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured (연결 필요).');
  }

  const model = options.model || 'gpt-4o';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            '당신은 엄밀한 다중 AI 검증 시스템의 GPT 분석관입니다. 사실, 가정, 추론, 의견을 구분하고 허위 정보를 생성하지 마십시오.',
        },
        {
          role: 'user',
          content: options.prompt,
        },
      ],
      temperature: 0.2,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`OpenAI API error [${response.status}]: ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const durationMs = Date.now() - startTime;

  return {
    text,
    model,
    durationMs,
    tokensUsed: {
      prompt: data.usage?.prompt_tokens || 0,
      completion: data.usage?.completion_tokens || 0,
      total: data.usage?.total_tokens || 0,
    },
  };
}
