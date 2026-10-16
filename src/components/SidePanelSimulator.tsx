import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Copy,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Search,
  MessageSquareCode,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { QuestionType, VerificationMode, RunData } from '../types/quick4ai';

interface SidePanelSimulatorProps {
  isDemo: boolean;
  onOpenSettings: () => void;
}

export const SidePanelSimulator: React.FC<SidePanelSimulatorProps> = ({ isDemo, onOpenSettings }) => {
  const [query, setQuery] = useState('0.999... 는 수학적으로 1과 엄밀하게 완전히 동일한가, 아니면 무한히 가까워질 뿐인가?');
  const [referenceDoc, setReferenceDoc] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('decision');
  const [mode, setMode] = useState<VerificationMode>('QUICK');
  const [activeResultTab, setActiveResultTab] = useState<'final' | 'claims' | 'critiques' | 'unresolved' | 'sources'>('final');

  const [loading, setLoading] = useState(false);
  const [currentRun, setCurrentRun] = useState<RunData | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Unicode counting
  const queryCount = Array.from(query).length;
  const refCount = Array.from(referenceDoc).length;

  useEffect(() => {
    let interval: any = null;
    if (loading) {
      interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleStart = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimerSeconds(0);
    setActiveResultTab('final');

    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          referenceDoc: referenceDoc.trim() || undefined,
          questionType,
          mode,
          forceDemo: isDemo,
        }),
      });

      if (!res.ok) throw new Error(`실행 실패 (${res.status})`);
      const initialRun = await res.json();
      setCurrentRun(initialRun);

      // Start polling
      pollRun(initialRun.runId);
    } catch (err: any) {
      alert(`오류: ${err.message}`);
      setLoading(false);
    }
  };

  const pollRun = (runId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/runs/${runId}`);
        if (!res.ok) return;
        const data: RunData = await res.json();
        setCurrentRun(data);

        if (data.status === 'completed' || data.status === 'error' || data.status === 'cancelled') {
          clearInterval(pollInterval);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
      }
    }, 700);
  };

  const handleCancel = async () => {
    if (!currentRun) return;
    try {
      await fetch(`/api/runs/${currentRun.runId}/cancel`, { method: 'POST' });
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpgradeDeep = async () => {
    if (!currentRun) return;
    setLoading(true);
    setMode('DEEP');
    try {
      await fetch(`/api/runs/${currentRun.runId}/upgrade-deep`, { method: 'POST' });
      pollRun(currentRun.runId);
    } catch (e) {
      alert('DEEP 전환 실패');
      setLoading(false);
    }
  };

  const copyAnswer = () => {
    if (currentRun?.finalSynthesis?.answer) {
      navigator.clipboard.writeText(currentRun.finalSynthesis.answer);
      alert('최종 답변이 복사되었습니다.');
    }
  };

  const downloadMarkdown = () => {
    if (!currentRun) return;
    const text = `# QUICK 4AI 검증 결과 리포트\n작업 ID: ${currentRun.runId}\n모드: ${currentRun.mode}\n\n질문: ${currentRun.query}\n\n---\n\n## 최종 종합 답변\n${currentRun.finalSynthesis?.answer}\n\n---\n## 미해결 쟁점\n${currentRun.unresolvedIssues.map((u) => `- [${u.id}] ${u.description}`).join('\n')}\n`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QUICK4AI_${currentRun.runId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const presets = [
    {
      title: '0.999... = 1 수학적 동치성',
      q: '0.999... 는 수학적으로 1과 엄밀하게 완전히 동일한가, 아니면 무한히 가까워질 뿐인가?',
      type: 'decision' as QuestionType,
    },
    {
      title: 'Chrome Manifest V3 network blocking',
      q: 'Chrome Manifest V3에서 webRequestBlocking API를 사용해 광고 요청을 동기적으로 가로채고 차단할 수 있는가?',
      type: 'fact_check' as QuestionType,
    },
    {
      title: 'LK-99 초전도체 Nature 승인 여부',
      q: 'LK-99 논문이 2023년 네이처(Nature)에 게재되어 상온 상압 초전도체로 최종 공인되었는가?',
      type: 'fact_check' as QuestionType,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner */}
      <div className="mb-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            Chrome Side Panel 확장 프로그램 인터랙티브 시뮬레이터
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            실제 Chrome 브라우저의 사이드 패널(380px 너비)과 100% 동일한 경량 DOM·CSS 구조로 렌더링됩니다.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">검증 예제 질문:</span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(preset.q);
                setQuestionType(preset.type);
              }}
              className="text-xs px-2.5 py-1 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600 transition truncate max-w-[200px]"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* Left Column: Chrome Side Panel Device Frame (380px ~ 410px) */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[420px] rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[760px]">
            {/* Chrome Browser Side Panel Bar Mock */}
            <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 ml-2">Chrome Side Panel</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">390 × 760</span>
            </div>

            {/* Sidepanel Inner Body */}
            <div className="flex-1 overflow-y-auto p-3 text-slate-200 text-xs custom-scrollbar">
              {/* Header inside Panel */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-[10px] text-white">
                    4AI
                  </div>
                  <span className="font-bold text-sm text-slate-100">QUICK 4AI</span>
                </div>
                {isDemo ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    데모 · AI 호출 없음
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    실제 4AI 검증
                  </span>
                )}
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 mb-3">
                <button
                  type="button"
                  onClick={() => setMode('QUICK')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition ${
                    mode === 'QUICK'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚡ QUICK (기본 6회)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('DEEP')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition ${
                    mode === 'DEEP'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔬 DEEP (심층 12회)
                </button>
              </div>

              {/* Form Input Section */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">질문 유형</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="general">일반 질문</option>
                    <option value="fact_check">사실 조사 / 팩트체크</option>
                    <option value="decision">비교 / 의사결정</option>
                    <option value="code_review">코드 검토 / 스펙</option>
                    <option value="writing">글쓰기 / 정합성</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-[11px]">
                    <label className="font-medium text-slate-400">질문 입력</label>
                    <span className={`text-[10px] ${queryCount > 8000 ? 'text-red-400' : 'text-slate-500'}`}>
                      {queryCount.toLocaleString()} / 8,000자
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="교차 검증할 질문을 입력하세요..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-[11px]">
                    <label className="font-medium text-slate-400">참고자료 (직접 붙여넣기, 선택)</label>
                    <span className={`text-[10px] ${refCount > 20000 ? 'text-red-400' : 'text-slate-500'}`}>
                      {refCount.toLocaleString()} / 20,000자
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={referenceDoc}
                    onChange={(e) => setReferenceDoc(e.target.value)}
                    placeholder="검토에 반영할 텍스트를 붙여넣으세요..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={loading || !query.trim()}
                  onClick={handleStart}
                  className="w-full py-2.5 rounded-lg font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>원터치 4AI 검증 시작 ({mode === 'QUICK' ? '6회' : '12회'})</span>
                </button>
              </div>

              {/* Progress Tracker Card */}
              {loading && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mb-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                      검증 파이프라인 가동 중
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Stage A: 독립 분석 (GPT + Gemini)</span>
                      <span className="text-emerald-400 font-medium">
                        {currentRun?.stages?.stage_a?.status === 'completed' ? '✓ 완료 (2회)' : '진행 중...'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Stage B: 팩트체크 (Perplexity)</span>
                      <span className="text-emerald-400 font-medium">
                        {currentRun?.stages?.stage_b?.status === 'completed'
                          ? '✓ 완료 (1회)'
                          : currentRun?.stages?.stage_b?.status === 'in_progress'
                          ? '조사 중...'
                          : '대기'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Stage C: 상호 비판 (GPT ↔ Gemini)</span>
                      <span className="text-emerald-400 font-medium">
                        {currentRun?.stages?.stage_c?.status === 'completed'
                          ? '✓ 완료 (2회)'
                          : currentRun?.stages?.stage_c?.status === 'in_progress'
                          ? '교차 검토...'
                          : '대기'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-300">Stage D: 최종 종합 (Claude)</span>
                      <span className="text-emerald-400 font-medium">
                        {currentRun?.stages?.stage_d?.status === 'completed'
                          ? '✓ 완료 (1회)'
                          : currentRun?.stages?.stage_d?.status === 'in_progress'
                          ? '종합 중...'
                          : '대기'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">
                      호출 수: {currentRun?.totalCalls || 0} / {mode === 'QUICK' ? 6 : 12}회
                    </span>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
                    >
                      중단
                    </button>
                  </div>
                </div>
              )}

              {/* Result View Inside Sidepanel */}
              {currentRun && currentRun.status === 'completed' && (
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 mb-3">
                  {/* Tabs */}
                  <div className="flex items-center gap-1 border-b border-slate-800 pb-2 mb-2.5 overflow-x-auto text-[11px]">
                    <button
                      onClick={() => setActiveResultTab('final')}
                      className={`px-2 py-1 rounded whitespace-nowrap font-medium transition ${
                        activeResultTab === 'final'
                          ? 'bg-blue-600/20 text-blue-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      최종 답변
                    </button>
                    <button
                      onClick={() => setActiveResultTab('claims')}
                      className={`px-2 py-1 rounded whitespace-nowrap font-medium transition ${
                        activeResultTab === 'claims'
                          ? 'bg-blue-600/20 text-blue-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      주장 근거 ({Object.keys(currentRun.claims || {}).length})
                    </button>
                    <button
                      onClick={() => setActiveResultTab('critiques')}
                      className={`px-2 py-1 rounded whitespace-nowrap font-medium transition ${
                        activeResultTab === 'critiques'
                          ? 'bg-blue-600/20 text-blue-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      비판 내역 ({Object.keys(currentRun.reviews || {}).length})
                    </button>
                    <button
                      onClick={() => setActiveResultTab('unresolved')}
                      className={`px-2 py-1 rounded whitespace-nowrap font-medium transition ${
                        activeResultTab === 'unresolved'
                          ? 'bg-blue-600/20 text-blue-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      미해결 ({currentRun.unresolvedIssues?.length || 0})
                    </button>
                  </div>

                  {/* Tab 1: Final synthesis */}
                  {activeResultTab === 'final' && (
                    <div className="space-y-2">
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                        {currentRun.finalSynthesis?.answer}
                      </div>

                      <div className="text-[10px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/80">
                        <span className="font-semibold text-slate-300">검토 공지: </span>
                        {currentRun.finalSynthesis?.verificationNotice}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Claims */}
                  {activeResultTab === 'claims' && (
                    <div className="space-y-2 max-h-[320px] overflow-y-auto">
                      {Object.values(currentRun.claims || {}).map((c) => (
                        <div key={c.claimId} className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[11px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-blue-400">[{c.claimId}] {c.provider.toUpperCase()}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                              {c.type}
                            </span>
                          </div>
                          <p className="text-slate-300 mb-1">{c.content}</p>
                          <div className="text-[10px] text-emerald-400">
                            근거 판정: {c.evidenceStatus}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab 3: Critiques */}
                  {activeResultTab === 'critiques' && (
                    <div className="space-y-2 max-h-[320px] overflow-y-auto">
                      {Object.values(currentRun.reviews || {}).map((rev) => (
                        <div key={rev.reviewId} className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[11px]">
                          <div className="flex items-center justify-between mb-1 font-bold text-pink-400">
                            <span>[{rev.reviewId}] {rev.reviewer.toUpperCase()} → {rev.targetClaimId}</span>
                            <span className="text-[10px] text-slate-400">{rev.issueType}</span>
                          </div>
                          <p className="text-slate-300 text-[11px] mb-1">
                            <span className="font-semibold text-slate-400">지적: </span>
                            {rev.evidenceOrCounterexample}
                          </p>
                          <p className="text-blue-300 text-[11px]">
                            <span className="font-semibold text-slate-400">수정안: </span>
                            {rev.suggestedRevision}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab 4: Unresolved */}
                  {activeResultTab === 'unresolved' && (
                    <div className="space-y-2">
                      {currentRun.unresolvedIssues?.map((u) => (
                        <div key={u.id} className="p-2.5 rounded bg-red-950/20 border border-red-500/30 text-[11px]">
                          <span className="font-bold text-red-400 block mb-0.5">[{u.id}] 보존된 미해결 쟁점</span>
                          <p className="text-slate-300">{u.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* DEEP Upgrade Card if available */}
                  {currentRun.transitionOffer?.shouldOfferDeep && currentRun.mode === 'QUICK' && (
                    <div className="mt-3 p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/40">
                      <div className="text-[11px] font-bold text-purple-300 mb-1">
                        🔬 DEEP 심층 검증 전환 추천
                      </div>
                      <p className="text-[10px] text-purple-200/80 mb-2">
                        미해결 이견이 발견되었습니다. 기존 분석 결과를 재사용하고 All-to-All 4AI 전방위 교차 검증을 시작할 수 있습니다.
                      </p>
                      <button
                        onClick={handleUpgradeDeep}
                        disabled={loading}
                        className="w-full py-1.5 rounded font-bold text-[11px] text-white bg-purple-600 hover:bg-purple-500 transition shadow"
                      >
                        기존 결과 유지하고 DEEP 전환 (+6회 추가)
                      </button>
                    </div>
                  )}

                  {/* Footer Action Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 border-t border-slate-800">
                    <button
                      onClick={copyAnswer}
                      className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> 복사
                    </button>
                    <button
                      onClick={downloadMarkdown}
                      className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" /> 마크다운
                    </button>
                    <button
                      onClick={() => {
                        setCurrentRun(null);
                        setQuery('');
                      }}
                      className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> 새 질문
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Right Column: Multi-AI Pipeline Inspector & Live Architecture */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 space-y-5">
          {/* 4AI Pipeline Flowcard */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-blue-400" />
              QUICK 4AI 다중 검증 파이프라인 아키텍처 (6회 기준)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              {/* Step A */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-blue-400">Stage A</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300">
                      병렬 2회
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200 mb-1">독립 분석</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    GPT와 Gemini에 사용자 질문 전달. 상호 답변 비공개 상태로 사실/가정/추론 분리.
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  산출물: 주장 ID 고유 부여
                </div>
              </div>

              {/* Step B */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-emerald-400">Stage B</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300">
                      1회
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200 mb-1">근거 조사</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Perplexity가 양측 주장의 핵심 쟁점 5개를 선정하여 1차 웹 공식 출처 대조.
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  산출물: 인용구 및 출처 ID
                </div>
              </div>

              {/* Step C */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-pink-400">Stage C</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-pink-500/10 text-pink-300">
                      병렬 2회
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200 mb-1">상호 비판</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    GPT ↔ Gemini가 Perplexity 근거를 토대로 상대 답변 비판 및 자기 수정 수행.
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  산출물: 비판 매트릭스
                </div>
              </div>

              {/* Step D */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-purple-400">Stage D</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300">
                      1회
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200 mb-1">최종 종합</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Claude가 다수결 없이 오직 근거의 질로 판정. 미해결 쟁점을 보존하며 질문에 직접 답변.
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  산출물: 최종 검증 답변서
                </div>
              </div>
            </div>
          </div>

          {/* Model Responsibilities & Key Isolation Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              4대 제공사 역할 분담 및 비밀키 격리 원칙
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                  <span>GPT (OpenAI)</span>
                  <span className="text-[10px] text-slate-500 font-mono">gpt-4o</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  엄밀한 논리 전개 및 기술 스펙 기반 1차 독립 분석 / Gemini 답변 교차 비판
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                  <span>Gemini (Google)</span>
                  <span className="text-[10px] text-slate-500 font-mono">gemini-3.8-flash</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  대규모 컨텍스트 및 시스템 지침 준수 기반 1차 독립 분석 / GPT 답변 교차 비판
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                  <span>Perplexity (Perplexity AI)</span>
                  <span className="text-[10px] text-slate-500 font-mono">sonar</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  실시간 웹 그라운딩, 1차 사료 검색, 인용문 발췌 및 출처 메타데이터 검증
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                  <span>Claude (Anthropic)</span>
                  <span className="text-[10px] text-slate-500 font-mono">claude-3-5-sonnet</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  모델 간 다수결 배제, 상충된 비판의 인과 검토, 미해결 쟁점 보존 및 최종 종합
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-slate-300">
              <strong className="text-blue-300">보안 및 브라우저 메모리 관리:</strong> Chrome 확장 프로그램
              번들 및 브라우저 클라이언트에는 어떠한 외부 AI API 키도 보관되지 않으며, 모든 고비용 연산과
              데이터 정리는 백엔드에서 24시간 TTL 자동 삭제 정책으로 안전하게 관리됩니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
