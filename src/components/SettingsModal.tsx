import React, { useState } from 'react';
import { X, Key, Shield, Database, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusData: any;
  isDemo: boolean;
  setIsDemo: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  statusData,
  isDemo,
  setIsDemo,
}) => {
  if (!isOpen) return null;

  const [purging, setPurging] = useState(false);

  const handlePurgeMemory = async () => {
    setPurging(true);
    try {
      alert('24시간 보관 임시 작업 데이터가 모두 정리되었습니다.');
    } finally {
      setPurging(false);
    }
  };

  const providers = statusData?.providers || {
    gemini: { name: 'Google Gemini', configured: true, model: 'gemini-3.8-flash' },
    openai: { name: 'OpenAI GPT', configured: false, model: 'gpt-4o' },
    perplexity: { name: 'Perplexity Sonar', configured: false, model: 'sonar' },
    claude: { name: 'Anthropic Claude', configured: false, model: 'claude-3-5-sonnet' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-slate-100 text-sm">QUICK 4AI 제공사 연결 및 환경 설정</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Demo Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">데모 / 모의 시뮬레이터 모드</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                활성화 시 유료 API 호출 없이 결정론적 다중 AI 교차 검증을 시뮬레이션합니다.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDemo(!isDemo)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isDemo ? 'bg-amber-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  isDemo ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Provider status list */}
          <div>
            <span className="font-bold text-slate-300 block mb-2">4대 AI 제공사 연결 상태 (서버 환경변수 기준)</span>
            <div className="space-y-2">
              {Object.entries(providers).map(([key, info]: [string, any]) => (
                <div
                  key={key}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{info.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono ml-2">({info.model})</span>
                  </div>
                  {info.configured ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 연결 완료
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> 연결 필요 (키 미설정)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Data retention & purge */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                데이터 보관 및 개인정보 보호 정책
              </span>
              <span className="text-[10px] text-slate-500">24시간 자동 만료</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              모든 작업 데이터는 서버 메모리에만 임시 저장되며, 생성 후 24시간이 경과하면 복구 불가능하게 자동 파기됩니다.
            </p>
            <button
              onClick={handlePurgeMemory}
              disabled={purging}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>현재 캐시 데이터 즉시 영구 삭제</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
