import React, { useState } from 'react';
import { Download, FolderArchive, FileCode, CheckCircle2, Terminal, ArrowRight, Shield, Copy } from 'lucide-react';
import JSZip from 'jszip';

export const ExtensionPackager: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('manifest.json');

  const files: Record<string, string> = {
    'manifest.json': `{
  "manifest_version": 3,
  "name": "QUICK 4AI — 다중 AI 교차 검증",
  "version": "1.0.0",
  "description": "GPT, Gemini, Perplexity, Claude 4대 AI가 질문을 독립 분석, 팩트체크, 상호 비판, 최종 종합하는 초경량 Chrome Side Panel 확장 프로그램",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_title": "QUICK 4AI 패널 열기"
  },
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "permissions": [
    "sidePanel",
    "storage"
  ],
  "host_permissions": [
    "http://localhost:*/*",
    "https://*/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';"
  }
}`,
    'background.js': `/**
 * QUICK 4AI - Background Service Worker
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('[QUICK 4AI] Extension installed.');
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.warn);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (chrome.sidePanel && chrome.sidePanel.open) {
    try {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    } catch (e) {
      console.error(e);
    }
  }
});`,
    'sidepanel.html': `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>QUICK 4AI Side Panel</title>
  <link rel="stylesheet" href="sidepanel.css">
</head>
<body>
  <header class="header">
    <div class="brand">
      <div class="brand-icon">4AI</div>
      <div class="brand-title">QUICK 4AI</div>
    </div>
    <div id="statusBadge" class="badge badge-demo">데모 · AI 호출 없음</div>
  </header>
  <!-- Main content and lightweight script -->
  <script src="sidepanel.js"></script>
</body>
</html>`,
    'sidepanel.css': `/* Pure CSS with system fonts, no external font requests */
:root {
  --bg-primary: #0f172a;
  --bg-card: #1e293b;
  --accent-blue: #3b82f6;
  --text-main: #f8fafc;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-main);
  padding: 12px;
  font-size: 13px;
}`,
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('quick4ai-chrome-extension');

      // Fetch or package extension files
      folder?.file('manifest.json', files['manifest.json']);
      folder?.file('background.js', files['background.js']);

      // Fetch real sidepanel files from server
      const [htmlRes, jsRes, cssRes] = await Promise.all([
        fetch('/extension-static/sidepanel.html').then((r) => r.text()),
        fetch('/extension-static/sidepanel.js').then((r) => r.text()),
        fetch('/extension-static/sidepanel.css').then((r) => r.text()),
      ]);

      folder?.file('sidepanel.html', htmlRes);
      folder?.file('sidepanel.js', jsRes);
      folder?.file('sidepanel.css', cssRes);

      const iconsFolder = folder?.folder('icons');
      const [icon16, icon48, icon128] = await Promise.all([
        fetch('/extension-static/icons/icon16.png').then((r) => r.blob()),
        fetch('/extension-static/icons/icon48.png').then((r) => r.blob()),
        fetch('/extension-static/icons/icon128.png').then((r) => r.blob()),
      ]);

      iconsFolder?.file('icon16.png', icon16);
      iconsFolder?.file('icon48.png', icon48);
      iconsFolder?.file('icon128.png', icon128);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quick4ai-chrome-extension.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`ZIP 생성 실패: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Download Action Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1.5">
            <FolderArchive className="w-5 h-5 text-blue-400" />
            Chrome Manifest V3 설치용 확장 프로그램 패키지
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            원격 코드 실행(eval) 없음, 외부 웹폰트 차단, 브라우저 메모리 부하 제로를 준수하는 순수 Manifest V3 확장 프로그램입니다.
            다운로드 후 Chrome 브라우저에 즉시 압축해제 설치할 수 있습니다.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloading}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'ZIP 압축 패키징 중...' : '확장 프로그램 다운로드 (.ZIP)'}</span>
        </button>
      </div>

      {/* Step by step installation guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center mb-2">
            1
          </div>
          <h3 className="font-bold text-slate-200 mb-1">ZIP 파일 다운로드 및 압축 해제</h3>
          <p className="text-slate-400 text-[11.5px] leading-relaxed">
            위의 [확장 프로그램 다운로드] 버튼을 눌러 ZIP 파일을 받은 뒤 원하는 로컬 폴더에 압축을 풉니다.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center mb-2">
            2
          </div>
          <h3 className="font-bold text-slate-200 mb-1">Chrome 확장 프로그램 관리자 열기</h3>
          <p className="text-slate-400 text-[11.5px] leading-relaxed">
            Chrome 주소창에 <code className="text-blue-300 font-mono">chrome://extensions</code>를 입력하고 우측 상단의 [개발자 모드]를 활성화합니다.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center mb-2">
            3
          </div>
          <h3 className="font-bold text-slate-200 mb-1">압축해제된 확장 프로그램 로드</h3>
          <p className="text-slate-400 text-[11.5px] leading-relaxed">
            [압축해제된 확장 프로그램을 로드합니다] 버튼을 누르고 압축을 푼 폴더를 선택하면 Side Panel 아이콘이 등록됩니다.
          </p>
        </div>
      </div>

      {/* Source Code Viewer */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200">확장 프로그램 파일 소스 뷰어</span>
          </div>

          <div className="flex items-center gap-1.5">
            {Object.keys(files).map((fileName) => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`text-xs px-2.5 py-1 rounded-md font-mono transition ${
                  selectedFile === fileName
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                {fileName}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-950/80">
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-3 rounded-lg bg-slate-900/60 border border-slate-800 max-h-[420px] custom-scrollbar">
            {files[selectedFile]}
          </pre>
        </div>
      </div>
    </div>
  );
};
