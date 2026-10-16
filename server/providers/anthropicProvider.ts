/**
 * Anthropic Claude Provider Adapter
 * Connects directly to Anthropic Messages API for Final Synthesis
 */

export interface ClaudeCallOptions {
  prompt: string;
  systemInstruction?: string;
  customKey?: string;
  model?: string;
  signal?: AbortSignal;
}

export interface ClaudeCallResult {
  text: string;
  model: string;
  durationMs: number;
  tokensUsed?: { prompt: number; completion: number; total: number };
}

export function isClaudeConfigured(customKey?: string): boolean {
  return Boolean(customKey || process.env.ANTHROPIC_API_KEY);
}

export async function callClaude(options: ClaudeCallOptions): Promise<ClaudeCallResult> {
  const startTime = Date.now();
  const apiKey = options.customKey || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('Claude (Anthropic) API key is not configured (연결 필요).');
  }

  const model = options.model || 'claude-3-5-sonnet-20241022';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system:
        options.systemInstruction ||
        '당신은 QUICK 4AI의 최종 종합관 Claude입니다. 모델 다수결을 배제하고 오직 사실 근거와 논리의 타당성으로 판정하여 질문에 대한 정밀한 종합 답변을 작성하십시오.',
      messages: [
        {
          role: 'user',
          content: options.prompt,
        },
      ],
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Anthropic Claude API error [${response.status}]: ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const text =
    data.content
      ?.filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n') || '';

  const durationMs = Date.now() - startTime;

  return {
    text,
    model,
    durationMs,
    tokensUsed: {
      prompt: data.usage?.input_tokens || 0,
      completion: data.usage?.output_tokens || 0,
      total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
  };
}
