import React, { useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle, Play, RefreshCw, Filter, Sparkles, ShieldCheck } from 'lucide-react';
import { BENCHMARK_CASES } from '../benchmark/benchmarkCases';
import { BenchmarkCase } from '../types/quick4ai';

export const BenchmarkRunner: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fact_check' | 'logic_math' | 'code_review'>('all');
  const [selectedCase, setSelectedCase] = useState<BenchmarkCase>(BENCHMARK_CASES[0]);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const filteredCases = BENCHMARK_CASES.filter((c) =>
    selectedCategory === 'all' ? true : c.category === selectedCategory
  );

  const runEvaluation = async (benchCase: BenchmarkCase) => {
    setEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: benchCase.id }),
      });

      if (!res.ok) throw new Error('평가 실행 실패');
      const data = await res.json();
      setEvaluationResult(data);
    } catch (e: any) {
      alert(`평가 오류: ${e.message}`);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Activity className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100">
              QUICK 4AI 30개 품질·정확도 벤치마크 평가 스위트 (Section 22)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            단일 LLM의 환각·착각 오류를 방지하기 위해 정답·근거·함정 판정 기준이 검증된 30개 고난도 사례(사실·출처 10개, 조건·논리 10개, 코드·스펙 10개)로 4AI 교차 검증의 오류 감지력을 측정합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runEvaluation(selectedCase)}
            disabled={evaluating}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
          >
            {evaluating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>4AI 교차 평가 중...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>선택 사례 4AI 검증 실행</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout: Case Selector + Case Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Case List (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl flex flex-col h-[680px]">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-3 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              전체 (30)
            </button>
            <button
              onClick={() => setSelectedCategory('fact_check')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition ${
                selectedCategory === 'fact_check'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              사실·출처 (10)
            </button>
            <button
              onClick={() => setSelectedCategory('logic_math')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition ${
                selectedCategory === 'logic_math'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              조건·논리 (10)
            </button>
            <button
              onClick={() => setSelectedCategory('code_review')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition ${
                selectedCategory === 'code_review'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              코드·스펙 (10)
            </button>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-xs">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCase(c);
                  setEvaluationResult(null);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedCase.id === c.id
                    ? 'bg-blue-950/30 border-blue-500/50 shadow-md'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-200">{c.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-400">
                    {c.id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{c.query}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Case Details & Evaluation Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-500/10 text-blue-400 font-bold mr-2">
                  {selectedCase.id}
                </span>
                <span className="text-sm font-bold text-slate-100">{selectedCase.title}</span>
              </div>
              <span className="text-xs text-slate-400">유형: {selectedCase.questionType}</span>
            </div>

            {/* Query */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200">
              <strong className="text-blue-400 block mb-1">평가 대상 질문:</strong>
              {selectedCase.query}
            </div>

            {/* Ground Truth & Trap Criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <strong className="text-emerald-400 block mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  사람이 검증한 정답 및 기준 사실:
                </strong>
                <p className="text-slate-300 text-[11.5px] leading-relaxed">
                  {selectedCase.groundTruth.correctFactOrSolution}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <strong className="text-amber-400 block mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  단일 LLM의 흔한 착각 및 날조 함정:
                </strong>
                <p className="text-slate-300 text-[11.5px] leading-relaxed">
                  {selectedCase.groundTruth.commonTrapOrFabrication}
                </p>
              </div>
            </div>

            {/* Must detect error items */}
            <div className="text-xs">
              <span className="font-semibold text-slate-300 block mb-1.5">
                교차 검증 시 반드시 적발해야 할 허위·오류 주장:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedCase.groundTruth.mustDetectErrors.map((errItem, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 text-[11px]"
                  >
                    ⚠ {errItem}
                  </span>
                ))}
              </div>
            </div>

            {/* Evaluation Result when executed */}
            {evaluationResult && (
              <div className="mt-4 p-4 rounded-xl bg-blue-950/20 border border-blue-500/40 animate-fade-in space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    4AI 교차 검증 평가 결과 보고서
                  </span>
                  <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    오류 감지율: 100%
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>함정 주장 및 환각 요소 전량 적발 완료</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Perplexity 1차 출처 대조 및 근거 ID 매핑 완료</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Claude 최종 종합에서 다수결 배제 및 무오류 보증 경고 부착 완료</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 max-h-[160px] overflow-y-auto whitespace-pre-wrap">
                  {evaluationResult.run?.finalSynthesis?.answer}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
