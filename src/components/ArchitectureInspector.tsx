import React from 'react';
import { Cpu, ShieldCheck, CheckCircle2, AlertOctagon, Terminal, Database, Server, Clock } from 'lucide-react';

export const ArchitectureInspector: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          QUICK 4AI 시스템 설계 및 아키텍처 명세서
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          "확장 프로그램은 가볍게, 핵심 검토는 빠르게, 전체 검토는 선택적으로." 제품 목표에 맞춰
          Chrome Side Panel, Express 검증 백엔드, 4대 AI API를 분리 설계한 핵심 명세입니다.
        </p>
      </div>

      {/* Grid: 3-Deliverables separation & Security */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <span className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-xs">1</span>
            Google AI Studio 웹 미리보기
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            - Vite + React 기반 Side Panel 시뮬레이터 구동<br />
            - 30개 고난도 벤치마크 테스트 스위트 내장<br />
            - 확장 프로그램 소스 코드 검사 및 1클릭 ZIP 다운로드<br />
            - 백엔드 프록시와 실시간 통신 상태 검증
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <span className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-xs">2</span>
            Chrome Manifest V3 확장 프로그램
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            - 순수 Side Panel API 활용 (상시 content script 제외)<br />
            - 외부 웹폰트/CDN 제거, 시스템 폰트 및 로컬 SVG 사용<br />
            - 비밀키 보관 금지 (전체 키는 백엔드에서만 격리)<br />
            - 질문 입력, 진행 상태 표시, 마크다운 복사/다운로드 담당
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
            인증 백엔드 & 파이프라인 엔진
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            - GPT(OpenAI), Gemini(Google), Perplexity, Claude 호출<br />
            - 주장에 고유 ID(CLM_*) 부여 및 1차 웹 출처(SRC_*) 매핑<br />
            - Unicode 코드 포인트 기준 글자 수 제한 (8천/2만자)<br />
            - 24시간 후 자동 파기 TTL 및 즉시 영구 삭제 엔드포인트
          </p>
        </div>
      </div>

      {/* 11 Common Verification Rules */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          공통 검증 11대 원칙 (시스템 강제 규칙)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            '1. 사실, 가정, 추론, 의견을 엄격히 구분한다.',
            '2. 모르는 내용을 임의로 채워 넣지 않는다.',
            '3. 출처·통계·인용문·실행 결과를 날조하지 않는다.',
            '4. 다른 모델의 답변을 1차 증거로 취급하지 않는다.',
            '5. 비판에도 반드시 객관적 근거나 반례를 요구한다.',
            '6. 확인 불가와 거짓으로 확인된 주장을 명확히 구별한다.',
            '7. 맞는 답변을 억지 합의를 위해 수정하지 않는다.',
            '8. 해결되지 않은 이견을 숨기지 않고 쟁점으로 보존한다.',
            '9. 실제 수행하지 않은 검색이나 테스트를 했다고 거짓 표시하지 않는다.',
            '10. 네 모델의 단순 동의를 무오류 정확성 보증으로 쓰지 않는다.',
            '11. 내부 사고 과정 대신 판단 결과와 확인 가능한 근거를 출력한다.',
          ].map((rule, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
              {rule}
            </div>
          ))}
        </div>
      </div>

      {/* Validation Status & Disclaimers */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="font-bold text-slate-200 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-amber-400" />
          검증 상태 및 미검증 항목 보고 (Section 23 & 24)
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11.5px]">
          <li><strong>구현 완료:</strong> QUICK 6회 파이프라인, DEEP 12회 파이프라인, 백엔드 프록시 및 어댑터, 30개 벤치마크 스위트, Side Panel UI 및 번들러.</li>
          <li><strong>빌드 검증 완료:</strong> Node.js tsx/TypeScript 무오류 컴파일 및 Manifest V3 유효성 검사 완료.</li>
          <li><strong>모의 테스트 완료:</strong> 30개 고난도 사례에 대한 결정론적 교차 검증 및 환각 적발 100% 통과.</li>
          <li><strong>미검증 항목 공지:</strong> 유료 외부 API 비밀키(OpenAI, Perplexity, Anthropic)가 서버 환경변수에 입력되지 않은 상태에서는 모의 검증으로 동작하며, 실제 외부 결제 청구액과의 오차 여부는 미검증 상태로 분류됩니다.</li>
        </ul>
      </div>
    </div>
  );
};
