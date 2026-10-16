/**
 * High-fidelity Demo / Simulation Provider
 * STRICTLY MARKED: '데모 · 실제 AI 호출 없음'
 * Allows testing the complete verification pipeline and Chrome sidepanel UI
 * without consuming external API credits or requiring all 4 paid API keys.
 */

import { ClaimItem, ReviewItem, SourceItem, QuestionType } from '../../src/types/quick4ai';

export interface MockAnalysisResult {
  text: string;
  claims: ClaimItem[];
  assumptions: string[];
  uncertainties: string[];
  verificationNeeded: string[];
}

export function generateMockIndependentAnalysis(
  provider: 'gpt' | 'gemini',
  query: string,
  questionType: QuestionType
): MockAnalysisResult {
  const isGpt = provider === 'gpt';
  const providerLabel = isGpt ? 'GPT-4o' : 'Gemini 3.8 Flash';

  const prefix = isGpt ? 'CLM_GPT' : 'CLM_GEM';

  const claim1: ClaimItem = {
    claimId: `${prefix}_1`,
    provider,
    content: isGpt
      ? `질문의 핵심 명제에 대해 기술적/사실적 관점에서 주요 해결책은 표준 프레임워크와 공식 스펙을 준수하는 것입니다.`
      : `요청하신 조건에 따라 핵심 원인을 분석한 결과, 경량화 및 검증 순환 구조를 적용하는 것이 가장 최적입니다.`,
    type: 'fact',
    sourceLocation: `${provider}_stage_a:paragraph_1`,
    evidenceStatus: 'unreviewed',
    linkedSourceIds: [],
    isUnresolved: false,
  };

  const claim2: ClaimItem = {
    claimId: `${prefix}_2`,
    provider,
    content: isGpt
      ? `외부 환경이나 브라우저 메모리 한계(V8 힙 제약) 하에서는 백엔드로 연산을 위임하는 아키텍처가 필수적입니다.`
      : `클라이언트 측에서는 렌더링 부하를 최소화하기 위해 DOM 가상화 및 필요 시점 로딩 방식을 권장합니다.`,
    type: 'inference',
    sourceLocation: `${provider}_stage_a:paragraph_2`,
    evidenceStatus: 'unreviewed',
    linkedSourceIds: [],
    isUnresolved: false,
  };

  const claim3: ClaimItem = {
    claimId: `${prefix}_3`,
    provider,
    content: isGpt
      ? `전체 4개 모델 동의가 반드시 사실의 절대적 보증을 의미하는 것은 아니므로 상호 비판 단계가 필요합니다.`
      : `초기 답변 중 일부 가정(예: 네트워크 지연 시간 및 API 재시도 정책)은 실제 환경에 따라 결과가 상이할 수 있습니다.`,
    type: 'assumption',
    sourceLocation: `${provider}_stage_a:paragraph_3`,
    evidenceStatus: 'unreviewed',
    linkedSourceIds: [],
    isUnresolved: false,
  };

  const text = `[데모 · 실제 AI 호출 없음 - ${providerLabel} 독립 분석]
질문: "${query.slice(0, 80)}..."

1. 핵심 답변 요약
${providerLabel}의 분석에 따르면, 제시된 조건 하에서 가장 안전하고 정확한 결론은 독립 검증과 엄격한 사실 분리입니다.

2. 사실과 가정의 구분
- 사실(Fact): [${claim1.claimId}] ${claim1.content}
- 추론(Inference): [${claim2.claimId}] ${claim2.content}
- 전제 가정(Assumption): [${claim3.claimId}] ${claim3.content}

3. 결론이 달라질 수 있는 불확실성 조건
- 입력 데이터의 최신성 및 출처 1차 원문 접근 가능 여부
- API 제공사별 동시성 제한 및 오류 시 재시도 전략`;

  return {
    text,
    claims: [claim1, claim2, claim3],
    assumptions: [claim3.content],
    uncertainties: ['네트워크 지연 및 타임아웃 발생 시 부분 실패 처리 조건'],
    verificationNeeded: [`${claim1.claimId}의 최신 공식 문서 적합성`, `${claim2.claimId}의 벤치마크 실측치`],
  };
}

export function generateMockPerplexityEvidence(
  claimsToVerify: ClaimItem[]
): {
  text: string;
  sources: SourceItem[];
  verifiedClaims: ClaimItem[];
} {
  const sources: SourceItem[] = [
    {
      sourceId: 'SRC_01',
      url: 'https://developer.chrome.com/docs/extensions/reference/manifest/',
      title: 'Chrome Extensions Manifest V3 Official Documentation',
      publishedDate: '2024-11-01',
      collectedAt: new Date().toISOString(),
      evidenceQuote: 'Manifest V3 side panel API allows persistent or contextual companion panels without content scripts.',
      captureLevel: 'excerpt',
      linkedClaimIds: claimsToVerify.slice(0, 2).map((c) => c.claimId),
      isFailedOrMissing: false,
      accessStatus: 'accessible',
    },
    {
      sourceId: 'SRC_02',
      url: 'https://ai.google.dev/gemini-api/docs',
      title: 'Google GenAI SDK Specifications & Rate Limits',
      publishedDate: '2025-01-15',
      collectedAt: new Date().toISOString(),
      evidenceQuote: 'Server-side integration requires explicit User-Agent telemetry and proper credential isolation.',
      captureLevel: 'excerpt',
      linkedClaimIds: claimsToVerify.slice(1, 3).map((c) => c.claimId),
      isFailedOrMissing: false,
      accessStatus: 'accessible',
    },
    {
      sourceId: 'SRC_03',
      url: 'https://tc39.es/ecma262/',
      title: 'ECMA-262 Unicode Character and String Specification',
      publishedDate: '2024-06-01',
      collectedAt: new Date().toISOString(),
      evidenceQuote: 'String code point length must consider surrogate pairs via Array.from or codePointAt.',
      captureLevel: 'excerpt',
      linkedClaimIds: [],
      isFailedOrMissing: false,
      accessStatus: 'accessible',
    },
  ];

  const verifiedClaims = claimsToVerify.map((c, i) => {
    let status: any = 'supported';
    if (i === 1) status = 'partially_supported';
    return {
      ...c,
      evidenceStatus: status,
      linkedSourceIds: [sources[i % sources.length].sourceId],
    };
  });

  const text = `[데모 · 실제 AI 호출 없음 - Perplexity 근거 확인]
총 ${claimsToVerify.length}개의 핵심 주장에 대해 1차 웹 출처 및 공식 기술 문서를 대조 조사하였습니다.

1. 선정한 주장 및 근거 판정:
${verifiedClaims
  .map(
    (c) => `- [${c.claimId}] 판정: ${c.evidenceStatus === 'supported' ? '근거 확인 완료' : '일부 근거 확보'} (출처: ${c.linkedSourceIds.join(', ')})
  내용: ${c.content}`
  )
  .join('\n')}

2. 확보된 근거 원문 발췌:
- SRC_01: "${sources[0].evidenceQuote}"
- SRC_02: "${sources[1].evidenceQuote}"

3. 확인 한계 및 제외 범위:
- 비공개 유료 DB 및 로그인 요구 문서는 인용에서 제외함.`;

  return { text, sources, verifiedClaims };
}

export function generateMockMutualCritique(
  reviewer: 'gpt' | 'gemini',
  targetProvider: 'gpt' | 'gemini',
  targetClaims: ClaimItem[]
): {
  text: string;
  critiques: ReviewItem[];
  selfCorrection: string;
} {
  const reviewerLabel = reviewer === 'gpt' ? 'GPT-4o' : 'Gemini 3.8 Flash';
  const targetLabel = targetProvider === 'gpt' ? 'GPT-4o' : 'Gemini 3.8 Flash';

  const targetClaim = targetClaims[0] || { claimId: 'CLM_TARGET_1', content: '샘플 주장' };

  const critique: ReviewItem = {
    reviewId: `REV_${reviewer.toUpperCase()}_1`,
    reviewer,
    targetArtifactId: `${targetProvider}_stage_a`,
    targetVersion: 1,
    targetClaimId: targetClaim.claimId,
    issueType: 'missing_condition',
    impactOnConclusion: 'moderate',
    evidenceOrCounterexample: `${targetLabel}의 초기 답변은 일반적인 조건에서는 성립하나, 사용자가 대규모 텍스트(예: 8,000자 초과)나 급격한 네트워크 단절 시나리오를 제시할 경우 예외 처리가 불충분합니다.`,
    suggestedRevision: `예외 상황 및 부분 검토(Partial review) 완료 상태를 명시적으로 구분하도록 보완할 것을 권고합니다.`,
    verificationLimits: `실제 브라우저 가비지 컬렉션(GC) 타이밍은 브라우저 엔진에 종속적이므로 정확한 바이트 단위를 단언할 수 없습니다.`,
  };

  const text = `[데모 · 실제 AI 호출 없음 - ${reviewerLabel}의 상호 비판 및 자기 수정]

1. 상대방(${targetLabel}) 답변에 대한 비판
- 대상 주장: [${critique.targetClaimId}]
- 문제 유형: ${critique.issueType}
- 지적 내용: ${critique.evidenceOrCounterexample}
- 수정 제안: ${critique.suggestedRevision}

2. ${reviewerLabel} 자신의 초기 답변 자체 수정 사항
- Perplexity가 확보한 공식 출처(SRC_01, SRC_02)를 반영하여, 단순 낙관적 추론 대신 타임아웃과 토큰 한도 초과 시의 graceful degradation 조항을 스스로 보강함.`;

  return {
    text,
    critiques: [critique],
    selfCorrection: `${reviewerLabel}는 확보된 공식 기술 스펙을 수용하여 불확실성 항목을 구체화함.`,
  };
}

export function generateMockClaudeSynthesis(
  query: string,
  mode: 'QUICK' | 'DEEP',
  claims: ClaimItem[],
  critiques: ReviewItem[],
  sources: SourceItem[]
): {
  answer: string;
  confidenceAssessment: string;
  evidenceSummary: string;
  critiqueSummary: string;
  unresolvedItems: string[];
} {
  const answer = `[데모 · 실제 AI 호출 없음 - Claude 3.5 Sonnet 최종 종합 답변]

질문 요약: ${query}

■ 1. 최종 결론 및 답변
QUICK 4AI 다중 검증 파이프라인(GPT-4o, Gemini 3.8 Flash, Perplexity, Claude 3.5 Sonnet)의 분석 및 교차 검토 결과, 본 사안에 대한 핵심 사실과 합의된 권장 사항은 다음과 같습니다.

1) 다중 모델 교차 검토를 통해 단일 LLM의 환각(Hallucination) 가능성을 차단하였습니다.
2) Perplexity를 통해 1차 기술 문서 및 표준 스펙(Manifest V3, ECMA-262 등)을 직접 확인하였으며, 모델 간 의견 불일치는 논리적 인과관계와 근거의 질을 기준으로 정리되었습니다.
3) 브라우저 Side Panel 환경의 경량성을 보장하기 위해 모든 고비용 API 호출과 상태 저장은 백엔드로 위임하고, 클라이언트는 최소한의 렌더링 상태만을 유지하는 것이 검증된 최적 설계입니다.

■ 2. 검토 근거 및 확인된 사실
- 확인된 주장: ${claims.filter((c) => c.evidenceStatus === 'supported').map((c) => c.claimId).join(', ') || '전체 주요 주장'}
- 인용된 1차 출처: ${sources.map((s) => `[${s.sourceId}] ${s.title}`).join(', ')}

■ 3. 상호 비판 및 수정 내역
- 제기된 지적: ${critiques.length}건의 상호 비판 중 조건 누락 지적 1건을 수용하여 예외 상황 처리 기준을 확립함.
- 다수결 배제: 모델 간 투표가 아닌 제공된 1차 출처의 부합 여부로만 판정함.

■ 4. 해결되지 않은 쟁점 (Unresolved Issues)
- 쟁점 1: 사용자 네트워크 환경에 따른 최대 허용 타임아웃 임계치(15초 vs 30초)에 대한 모델 간 실무적 이견 존재.
- 쟁점 2: 특정 브라우저 버전의 백그라운드 서비스 워커 절전 정책에 따른 즉각적인 메모리 해제 타이밍의 가변성.`;

  return {
    answer,
    confidenceAssessment: '근거 확보 수준: 양호 (공식 문서 3건 대조). 합의 강제 없이 미해결 쟁점을 보존함.',
    evidenceSummary: `Perplexity를 통한 ${sources.length}개 웹 출처 검증 완료.`,
    critiqueSummary: `GPT와 Gemini 간 ${critiques.length}건의 상호 비판 검토 및 Claude에 의한 논리적 종합 완료.`,
    unresolvedItems: [
      '네트워크 순단 시 재시도 전략에 대한 타임아웃 임계치 설정 이견',
      '브라우저 엔진별 백그라운드 워커의 V8 가비지 컬렉션 즉시성 차이',
    ],
  };
}
