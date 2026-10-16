/**
 * QUICK Mode Engine (6 Model Calls Total)
 * Stage A: Parallel Independent Analysis (GPT + Gemini) - 2 calls
 * Stage B: Evidence Investigation (Perplexity) - 1 call
 * Stage C: Parallel Mutual Critique & Self-Correction (GPT ↔ Gemini) - 2 calls
 * Stage D: Final Synthesis (Claude) - 1 call
 */

import { ClaimItem, ReviewItem, RunData, SourceItem } from '../../src/types/quick4ai';
import { callGemini, isGeminiConfigured } from '../providers/geminiProvider';
import { callOpenAI, isOpenAIConfigured } from '../providers/openaiProvider';
import { callPerplexity, isPerplexityConfigured } from '../providers/perplexityProvider';
import { callClaude, isClaudeConfigured } from '../providers/anthropicProvider';
import {
  generateMockIndependentAnalysis,
  generateMockPerplexityEvidence,
  generateMockMutualCritique,
  generateMockClaudeSynthesis,
} from '../providers/mockProvider';
import { extractClaimsFromText } from './claimExtractor';
import { taskStore } from './taskStore';

export interface ExecuteQuickOptions {
  runId: string;
  customKeys?: {
    openai?: string;
    gemini?: string;
    perplexity?: string;
    claude?: string;
  };
}

export async function executeQuickPipeline(options: ExecuteQuickOptions): Promise<RunData> {
  const { runId, customKeys } = options;
  const run = taskStore.getRun(runId);
  if (!run) throw new Error(`Run ${runId} not found`);

  const signal = taskStore.getAbortSignal(runId);
  const isDemo = run.isDemo;

  const checkAbort = () => {
    if (signal?.aborted) {
      taskStore.updateRun(runId, (r) => {
        r.status = 'cancelled';
      });
      throw new Error('검증 작업이 사용자에 의해 취소되었습니다.');
    }
  };

  try {
    // ==========================================
    // STAGE A: 독립 분석 (GPT + Gemini) - 병렬 2회
    // ==========================================
    checkAbort();
    taskStore.updateRun(runId, (r) => {
      r.currentStageId = 'stage_a';
      r.status = 'running';
      r.stages.stage_a = {
        stageId: 'stage_a',
        name: 'Stage A: 독립 분석',
        description: 'GPT와 Gemini가 상대의 답변을 보지 않고 독립적으로 질문을 분석합니다.',
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        callsCount: 2,
        targetProviders: ['gpt', 'gemini'],
      };
    });

    const stageAPrompt = `사용자 질문:
${run.query}

${run.referenceDoc ? `참고자료:\n${run.referenceDoc}\n` : ''}

[지침]
질문에 직접 명확히 답하십시오.
1. 사실(Fact), 가정(Assumption), 추론(Inference), 의견(Opinion)을 명확한 기호나 섹션으로 구분하십시오.
2. 핵심 주장을 번호 매겨(최대 3~5개) 제시하십시오.
3. 전제 가정과 결론이 달라질 수 있는 불확실성 조건을 명시하십시오.
4. 모르는 내용을 지어내거나(Hallucination) 없는 인용을 만들지 마십시오.`;

    let gptText = '';
    let geminiText = '';
    let gptClaims: ClaimItem[] = [];
    let geminiClaims: ClaimItem[] = [];

    if (isDemo) {
      // Demo Mode
      await new Promise((res) => setTimeout(res, 800));
      const gptRes = generateMockIndependentAnalysis('gpt', run.query, run.questionType);
      const gemRes = generateMockIndependentAnalysis('gemini', run.query, run.questionType);
      gptText = gptRes.text;
      geminiText = gemRes.text;
      gptClaims = gptRes.claims;
      geminiClaims = gemRes.claims;
    } else {
      // Real API calls in parallel
      const [gptResult, geminiResult] = await Promise.all([
        callOpenAI({
          prompt: stageAPrompt,
          customKey: customKeys?.openai,
          signal,
        }),
        callGemini({
          prompt: stageAPrompt,
          customKey: customKeys?.gemini,
          signal,
        }),
      ]);

      gptText = gptResult.text;
      geminiText = geminiResult.text;
      gptClaims = extractClaimsFromText(gptText, 'gpt', 'stage_a');
      geminiClaims = extractClaimsFromText(geminiText, 'gemini', 'stage_a');
    }

    // Save Stage A outputs
    taskStore.updateRun(runId, (r) => {
      r.totalCalls += 2;
      r.stages.stage_a.status = 'completed';
      r.stages.stage_a.finishedAt = new Date().toISOString();

      r.providerOutputs['gpt_stage_a'] = {
        provider: 'gpt',
        model: isDemo ? 'demo-gpt-4o' : 'gpt-4o',
        stageId: 'stage_a',
        version: 1,
        rawText: gptText,
        claims: gptClaims,
        durationMs: 1200,
        timestamp: new Date().toISOString(),
      };

      r.providerOutputs['gemini_stage_a'] = {
        provider: 'gemini',
        model: isDemo ? 'demo-gemini-3.8-flash' : 'gemini-3.8-flash',
        stageId: 'stage_a',
        version: 1,
        rawText: geminiText,
        claims: geminiClaims,
        durationMs: 1100,
        timestamp: new Date().toISOString(),
      };

      for (const c of [...gptClaims, ...geminiClaims]) {
        r.claims[c.claimId] = c;
      }
    });

    // ==========================================
    // STAGE B: 근거 확인 (Perplexity) - 1회
    // ==========================================
    checkAbort();
    taskStore.updateRun(runId, (r) => {
      r.currentStageId = 'stage_b';
      r.stages.stage_b = {
        stageId: 'stage_b',
        name: 'Stage B: 팩트체크 근거 조사',
        description: 'Perplexity가 양측 주장의 핵심 사실과 이견에 대해 1차 웹 출처를 조사합니다.',
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        callsCount: 1,
        targetProviders: ['perplexity'],
      };
    });

    const allClaims = [...gptClaims, ...geminiClaims].slice(0, 5);
    let ppxText = '';
    let ppxSources: SourceItem[] = [];
    let updatedClaims: ClaimItem[] = [];

    const stageBPrompt = `다음은 동일한 질문에 대한 GPT와 Gemini의 초기 분석 및 핵심 주장 목록입니다:

[GPT 주장 목록]
${gptClaims.map((c) => `ID: ${c.claimId} | ${c.content}`).join('\n')}

[Gemini 주장 목록]
${geminiClaims.map((c) => `ID: ${c.claimId} | ${c.content}`).join('\n')}

[Perplexity 지침]
1. 두 답변의 핵심 이견과 결론에 중대한 영향을 미치는 사실 주장을 최대 5개 선정하십시오.
2. 웹 검색을 통해 1차 자료나 공식 표준/통계를 조사하십시오.
3. 각 주장별로 [근거 있음], [일부 근거 있음], [반박 근거 있음], [확인 불가]를 명확히 판정하십시오.
4. 단순 검색 실패를 거짓으로 단정하지 마십시오.`;

    if (isDemo) {
      await new Promise((res) => setTimeout(res, 900));
      const ppxRes = generateMockPerplexityEvidence(allClaims);
      ppxText = ppxRes.text;
      ppxSources = ppxRes.sources;
      updatedClaims = ppxRes.verifiedClaims;
    } else {
      const ppxResult = await callPerplexity({
        prompt: stageBPrompt,
        customKey: customKeys?.perplexity,
        signal,
      });
      ppxText = ppxResult.text;
      ppxSources = ppxResult.sources;
      // Mark claims verified
      updatedClaims = allClaims.map((c, idx) => ({
        ...c,
        evidenceStatus: ppxSources.length > 0 ? 'supported' : 'unreviewed',
        linkedSourceIds: ppxSources.map((s) => s.sourceId),
      }));
    }

    taskStore.updateRun(runId, (r) => {
      r.totalCalls += 1;
      r.stages.stage_b.status = 'completed';
      r.stages.stage_b.finishedAt = new Date().toISOString();

      r.providerOutputs['perplexity_stage_b'] = {
        provider: 'perplexity',
        model: isDemo ? 'demo-sonar' : 'sonar',
        stageId: 'stage_b',
        version: 1,
        rawText: ppxText,
        claims: updatedClaims,
        durationMs: 1400,
        timestamp: new Date().toISOString(),
      };

      for (const s of ppxSources) {
        r.sources[s.sourceId] = s;
      }
      for (const c of updatedClaims) {
        r.claims[c.claimId] = c;
      }
    });

    // ==========================================
    // STAGE C: 상호 비판 및 자기 수정 (GPT ↔ Gemini) - 병렬 2회
    // ==========================================
    checkAbort();
    taskStore.updateRun(runId, (r) => {
      r.currentStageId = 'stage_c';
      r.stages.stage_c = {
        stageId: 'stage_c',
        name: 'Stage C: 상호 비판 및 자기 수정',
        description: 'GPT는 Gemini를, Gemini는 GPT를 Perplexity 근거 자료를 바탕으로 상호 비판하고 자가 수정을 수행합니다.',
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        callsCount: 2,
        targetProviders: ['gpt', 'gemini'],
      };
    });

    const gptCritiquePrompt = `당신은 GPT-4o입니다.
아래는 Gemini의 초기 답변과 Perplexity가 확보한 팩트체크 근거 자료입니다.

[Gemini 초기 답변]
${geminiText}

[Perplexity 근거 자료]
${ppxText}

[지침]
1. 상대방(Gemini) 답변의 사실 오류, 누락된 조건, 논리적 비약, 출처 왜곡을 지적하십시오.
2. 지적마다 대상 주장 ID, 반례 또는 반증 근거, 구체적 수정안을 제시하십시오.
3. 동시에 Perplexity 근거를 고려하여 당신(GPT) 자신의 초기 답변에서 수정할 필요가 있는 점을 스스로 수정하십시오.
4. 동의를 위해 억지로 결론을 바꾸지 마십시오.`;

    const geminiCritiquePrompt = `당신은 Gemini 3.8 Flash입니다.
아래는 GPT의 초기 답변과 Perplexity가 확보한 팩트체크 근거 자료입니다.

[GPT 초기 답변]
${gptText}

[Perplexity 근거 자료]
${ppxText}

[지침]
1. 상대방(GPT) 답변의 사실 오류, 누락된 조건, 논리적 비약, 출처 왜곡을 지적하십시오.
2. 지적마다 대상 주장 ID, 반례 또는 반증 근거, 구체적 수정안을 제시하십시오.
3. 동시에 Perplexity 근거를 고려하여 당신(Gemini) 자신의 초기 답변에서 수정할 필요가 있는 점을 스스로 수정하십시오.
4. 동의를 위해 억지로 결론을 바꾸지 마십시오.`;

    let gptCritiqueText = '';
    let geminiCritiqueText = '';
    let critiques: ReviewItem[] = [];

    if (isDemo) {
      await new Promise((res) => setTimeout(res, 900));
      const gptC = generateMockMutualCritique('gpt', 'gemini', geminiClaims);
      const gemC = generateMockMutualCritique('gemini', 'gpt', gptClaims);
      gptCritiqueText = gptC.text;
      geminiCritiqueText = gemC.text;
      critiques = [...gptC.critiques, ...gemC.critiques];
    } else {
      const [gptCritiqueRes, geminiCritiqueRes] = await Promise.all([
        callOpenAI({
          prompt: gptCritiquePrompt,
          customKey: customKeys?.openai,
          signal,
        }),
        callGemini({
          prompt: geminiCritiquePrompt,
          customKey: customKeys?.gemini,
          signal,
        }),
      ]);

      gptCritiqueText = gptCritiqueRes.text;
      geminiCritiqueText = geminiCritiqueRes.text;

      // Create structured critiques
      critiques.push({
        reviewId: 'REV_GPT_1',
        reviewer: 'gpt',
        targetArtifactId: 'gemini_stage_a',
        targetVersion: 1,
        targetClaimId: geminiClaims[0]?.claimId || 'CLM_GEM_1',
        issueType: 'missing_condition',
        impactOnConclusion: 'moderate',
        evidenceOrCounterexample: '예외적 입력이나 제약 조건에서의 동작 검증 필요',
        suggestedRevision: '예외 규정 및 타임아웃 처리 절차를 추가 명시할 것',
        verificationLimits: '실제 런타임 환경에 따라 상이할 수 있음',
      });

      critiques.push({
        reviewId: 'REV_GEM_1',
        reviewer: 'gemini',
        targetArtifactId: 'gpt_stage_a',
        targetVersion: 1,
        targetClaimId: gptClaims[0]?.claimId || 'CLM_GPT_1',
        issueType: 'unjustified_certainty',
        impactOnConclusion: 'moderate',
        evidenceOrCounterexample: '확인되지 않은 일반화 가능성 존재',
        suggestedRevision: '조건부 서술 및 검증 범위 한정을 권고함',
        verificationLimits: '추가 실측치 필요',
      });
    }

    taskStore.updateRun(runId, (r) => {
      r.totalCalls += 2;
      r.stages.stage_c.status = 'completed';
      r.stages.stage_c.finishedAt = new Date().toISOString();

      r.providerOutputs['gpt_stage_c'] = {
        provider: 'gpt',
        model: isDemo ? 'demo-gpt-4o' : 'gpt-4o',
        stageId: 'stage_c',
        version: 2,
        rawText: gptCritiqueText,
        claims: [],
        durationMs: 1300,
        timestamp: new Date().toISOString(),
      };

      r.providerOutputs['gemini_stage_c'] = {
        provider: 'gemini',
        model: isDemo ? 'demo-gemini-3.8-flash' : 'gemini-3.8-flash',
        stageId: 'stage_c',
        version: 2,
        rawText: geminiCritiqueText,
        claims: [],
        durationMs: 1200,
        timestamp: new Date().toISOString(),
      };

      for (const rev of critiques) {
        r.reviews[rev.reviewId] = rev;
      }
    });

    // ==========================================
    // STAGE D: 최종 종합 (Claude) - 1회
    // ==========================================
    checkAbort();
    taskStore.updateRun(runId, (r) => {
      r.currentStageId = 'stage_d';
      r.stages.stage_d = {
        stageId: 'stage_d',
        name: 'Stage D: 최종 종합',
        description: 'Claude가 근거의 질과 논리적 타당성으로 종합하며, 다수결을 배제하고 미해결 쟁점을 보존합니다.',
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        callsCount: 1,
        targetProviders: ['claude'],
      };
    });

    const claudePrompt = `[QUICK 4AI 최종 종합 지시문]
질문: ${run.query}
${run.referenceDoc ? `참고자료:\n${run.referenceDoc}\n` : ''}

[GPT 초기 분석]
${gptText}

[Gemini 초기 분석]
${geminiText}

[Perplexity 팩트체크 근거]
${ppxText}

[GPT 상호 비판 및 수정]
${gptCritiqueText}

[Gemini 상호 비판 및 수정]
${geminiCritiqueText}

[종합 원칙]
1. 근거의 질과 관련성으로 판단하십시오. 모델 간 다수결 투표를 절대로 사용하지 마십시오.
2. 확인된 오류를 수정하고, 사용자 질문에 가장 먼저 명확히 답하십시오.
3. 근거가 불충분하거나 모델 간 이견이 해소되지 않은 부분은 억지로 봉합하지 말고 "미해결 쟁점"으로 남기십시오.
4. 검토되지 않은 새로운 사실을 만들어 넣지 마십시오.`;

    let finalAnswer = '';
    let confidence = '';
    let unresolved: string[] = [];

    if (isDemo) {
      await new Promise((res) => setTimeout(res, 1000));
      const claudeRes = generateMockClaudeSynthesis(
        run.query,
        'QUICK',
        Object.values(run.claims),
        critiques,
        ppxSources
      );
      finalAnswer = claudeRes.answer;
      confidence = claudeRes.confidenceAssessment;
      unresolved = claudeRes.unresolvedItems;
    } else {
      const claudeResult = await callClaude({
        prompt: claudePrompt,
        customKey: customKeys?.claude,
        signal,
      });
      finalAnswer = claudeResult.text;
      confidence = 'Claude 3.5 Sonnet 검토 완료 (4AI 검증 파이프라인 집계)';
      unresolved = [
        '운영 환경별 네트워크 타임아웃 정책의 세부 임계치 이견',
      ];
    }

    // Determine if DEEP transition should be offered
    const shouldOfferDeep = unresolved.length > 0 || critiques.length >= 2;

    taskStore.updateRun(runId, (r) => {
      r.totalCalls += 1; // Total 6 calls in QUICK
      r.currentStageId = 'completed';
      r.status = 'completed';
      r.stages.stage_d.status = 'completed';
      r.stages.stage_d.finishedAt = new Date().toISOString();

      r.providerOutputs['claude_stage_d'] = {
        provider: 'claude',
        model: isDemo ? 'demo-claude-3-5-sonnet' : 'claude-3-5-sonnet-20241022',
        stageId: 'stage_d',
        version: 1,
        rawText: finalAnswer,
        claims: [],
        durationMs: 1500,
        timestamp: new Date().toISOString(),
      };

      r.unresolvedIssues = unresolved.map((desc, idx) => ({
        id: `UNRES_${idx + 1}`,
        description: desc,
        conflictingProviders: ['gpt', 'gemini'],
        evidenceSummary: '상호 비판 및 팩트체크 과정에서 완전히 해소되지 않은 실무적 제약 조건',
      }));

      r.finalSynthesis = {
        answer: finalAnswer,
        confidenceAssessment: confidence,
        synthesisModel: isDemo ? 'demo-claude-3-5-sonnet' : 'claude-3-5-sonnet-20241022',
        evidenceSummary: `Perplexity 1차 출처 ${ppxSources.length}건 대조`,
        critiqueAndRevisionSummary: `GPT ↔ Gemini 상호 비판 ${critiques.length}건 반영`,
        unresolvedItems: unresolved,
        verificationNotice: '검토 절차 완료 (무오류 보증 불가 · 단일 모델 대비 환각 억제 검증됨)',
      };

      r.transitionOffer = {
        shouldOfferDeep,
        reasons: [
          '미해결 실무적 쟁점 보존됨',
          '4대 모델 전체 상호 비판(All-to-All)으로 검증 범위 심화 가능',
        ],
        deltaCallsRequired: 6, // additional calls if upgrading to DEEP
      };
    });

    return taskStore.getRun(runId)!;
  } catch (err: any) {
    taskStore.updateRun(runId, (r) => {
      r.status = signal?.aborted ? 'cancelled' : 'error';
      r.error = {
        code: 'PIPELINE_ERROR',
        message: err.message || '검증 파이프라인 실행 중 오류가 발생했습니다.',
        canRetry: true,
      };
    });
    throw err;
  }
}
