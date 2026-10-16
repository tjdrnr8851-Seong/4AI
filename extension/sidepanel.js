/**
 * QUICK 4AI - Ultra-lightweight Side Panel Client Script
 * Communicates with backend proxy, manages stages, parses responses,
 * and maintains zero unnecessary DOM overhead.
 */

(function () {
  'use strict';

  // Config: Defaults to current window origin (works seamlessly when hosted or localhost)
  let API_BASE = window.location.origin;
  if (!API_BASE || API_BASE === 'null' || API_BASE.startsWith('chrome-extension')) {
    API_BASE = 'http://localhost:3000';
  }

  let selectedMode = 'QUICK';
  let currentRunId = null;
  let timerInterval = null;
  let startTime = 0;
  let currentRunData = null;

  // DOM Elements
  const btnModeQuick = document.getElementById('btnModeQuick');
  const btnModeDeep = document.getElementById('btnModeDeep');
  const questionTypeSelect = document.getElementById('questionType');
  const queryInput = document.getElementById('queryInput');
  const refInput = document.getElementById('refInput');
  const queryCount = document.getElementById('queryCount');
  const refCount = document.getElementById('refCount');
  const btnStart = document.getElementById('btnStart');
  const btnCancel = document.getElementById('btnCancel');
  const btnCopy = document.getElementById('btnCopy');
  const btnDownloadMd = document.getElementById('btnDownloadMd');
  const btnReset = document.getElementById('btnReset');
  const btnUpgradeDeep = document.getElementById('btnUpgradeDeep');

  const inputSection = document.getElementById('inputSection');
  const progressSection = document.getElementById('progressSection');
  const resultSection = document.getElementById('resultSection');
  const deepOfferCard = document.getElementById('deepOfferCard');

  const timerDisplay = document.getElementById('timerDisplay');
  const callCountLabel = document.getElementById('callCountLabel');
  const currentStageTitle = document.getElementById('currentStageTitle');
  const statusBadge = document.getElementById('statusBadge');

  const stepA = document.getElementById('stepA');
  const stepB = document.getElementById('stepB');
  const stepC = document.getElementById('stepC');
  const stepD = document.getElementById('stepD');

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContentFinal = document.getElementById('tabContentFinal');
  const tabContentClaims = document.getElementById('tabContentClaims');
  const tabContentCritiques = document.getElementById('tabContentCritiques');
  const tabContentUnresolved = document.getElementById('tabContentUnresolved');
  const tabContentSources = document.getElementById('tabContentSources');

  // Unicode code points calculator
  function countUnicode(str) {
    if (!str) return 0;
    return Array.from(str).length;
  }

  function updateCharCounts() {
    const qLen = countUnicode(queryInput.value);
    const rLen = countUnicode(refInput.value);
    queryCount.textContent = `${qLen.toLocaleString()} / 8,000자`;
    refCount.textContent = `${rLen.toLocaleString()} / 20,000자`;

    if (qLen > 8000) queryCount.style.color = '#ef4444';
    else queryCount.style.color = '';

    if (rLen > 20000) refCount.style.color = '#ef4444';
    else refCount.style.color = '';
  }

  queryInput.addEventListener('input', updateCharCounts);
  refInput.addEventListener('input', updateCharCounts);

  // Mode buttons
  btnModeQuick.addEventListener('click', () => {
    selectedMode = 'QUICK';
    btnModeQuick.classList.add('active');
    btnModeDeep.classList.remove('active');
    btnStart.textContent = '원터치 4AI 검증 시작 (QUICK 6회)';
  });

  btnModeDeep.addEventListener('click', () => {
    selectedMode = 'DEEP';
    btnModeDeep.classList.add('active');
    btnModeQuick.classList.remove('active');
    btnStart.textContent = '원터치 4AI 검증 시작 (DEEP 12회)';
  });

  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;

      tabContentFinal.style.display = target === 'final' ? 'block' : 'none';
      tabContentClaims.style.display = target === 'claims' ? 'block' : 'none';
      tabContentCritiques.style.display = target === 'critiques' ? 'block' : 'none';
      tabContentUnresolved.style.display = target === 'unresolved' ? 'block' : 'none';
      tabContentSources.style.display = target === 'sources' ? 'block' : 'none';
    });
  });

  // Start validation
  btnStart.addEventListener('click', async () => {
    const query = queryInput.value.trim();
    if (!query) {
      alert('검증할 질문을 입력해주세요.');
      return;
    }

    const qLen = countUnicode(query);
    const rLen = countUnicode(refInput.value);
    if (qLen > 8000) {
      alert('질문은 최대 8,000자(유니코드 기준)까지 입력할 수 있습니다.');
      return;
    }
    if (rLen > 20000) {
      alert('참고자료는 최대 20,000자까지 입력할 수 있습니다.');
      return;
    }

    // Switch views
    inputSection.style.display = 'none';
    progressSection.style.display = 'block';
    resultSection.style.display = 'none';
    resetStepUI();

    startTime = Date.now();
    startTimer();

    try {
      // 1. Create run
      const createRes = await fetch(`${API_BASE}/api/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          referenceDoc: refInput.value.trim() || undefined,
          questionType: questionTypeSelect.value,
          mode: selectedMode,
        }),
      });

      if (!createRes.ok) {
        throw new Error(`서버 오류 (${createRes.status})`);
      }

      const run = await createRes.json();
      currentRunId = run.runId;

      // Update badge if demo
      if (run.isDemo) {
        statusBadge.className = 'badge badge-demo';
        statusBadge.textContent = '데모 · 실제 AI 호출 없음';
      } else {
        statusBadge.className = 'badge badge-live';
        statusBadge.textContent = '실제 4AI 검증';
      }

      // 2. Poll progress
      pollProgress(currentRunId);
    } catch (err) {
      stopTimer();
      alert(`검증 시작 실패: ${err.message}`);
      inputSection.style.display = 'block';
      progressSection.style.display = 'none';
    }
  });

  // Cancel validation
  btnCancel.addEventListener('click', async () => {
    if (!currentRunId) return;
    try {
      await fetch(`${API_BASE}/api/runs/${currentRunId}/cancel`, { method: 'POST' });
      stopTimer();
      alert('검증 작업이 취소되었습니다.');
      inputSection.style.display = 'block';
      progressSection.style.display = 'none';
    } catch (err) {
      console.error(err);
    }
  });

  // Polling helper
  async function pollProgress(runId) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/runs/${runId}`);
        if (!res.ok) return;

        const data = await res.json();
        currentRunData = data;
        updateProgressUI(data);

        if (data.status === 'completed' || data.status === 'error' || data.status === 'cancelled') {
          clearInterval(interval);
          stopTimer();

          if (data.status === 'completed') {
            showResults(data);
          } else if (data.status === 'error') {
            alert(`검증 오류: ${data.error?.message || '알 수 없는 오류'}`);
            inputSection.style.display = 'block';
            progressSection.style.display = 'none';
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 700);
  }

  function resetStepUI() {
    [stepA, stepB, stepC, stepD].forEach((step) => {
      step.className = 'stage-step';
    });
    callCountLabel.textContent = `호출 수: 0 / ${selectedMode === 'QUICK' ? 6 : 12}회`;
  }

  function updateProgressUI(data) {
    callCountLabel.textContent = `호출 수: ${data.totalCalls || 0} / ${data.mode === 'QUICK' ? 6 : 12}회`;

    const stages = data.stages || {};

    if (stages.stage_a?.status === 'in_progress') {
      stepA.className = 'stage-step active';
      currentStageTitle.textContent = 'Stage A: 독립 분석 진행 중...';
    } else if (stages.stage_a?.status === 'completed') {
      stepA.className = 'stage-step completed';
    }

    if (stages.stage_b?.status === 'in_progress') {
      stepB.className = 'stage-step active';
      currentStageTitle.textContent = 'Stage B: Perplexity 팩트체크 중...';
    } else if (stages.stage_b?.status === 'completed') {
      stepB.className = 'stage-step completed';
    }

    if (stages.stage_c?.status === 'in_progress') {
      stepC.className = 'stage-step active';
      currentStageTitle.textContent = 'Stage C: 상호 비판 및 수정 중...';
    } else if (stages.stage_c?.status === 'completed') {
      stepC.className = 'stage-step completed';
    }

    if (stages.stage_d?.status === 'in_progress') {
      stepD.className = 'stage-step active';
      currentStageTitle.textContent = 'Stage D: Claude 최종 종합 중...';
    } else if (stages.stage_d?.status === 'completed') {
      stepD.className = 'stage-step completed';
    }
  }

  function showResults(data) {
    progressSection.style.display = 'none';
    resultSection.style.display = 'block';

    const final = data.finalSynthesis;
    tabContentFinal.textContent = final ? final.answer : '결과가 없습니다.';

    // Claims Tab
    const claims = Object.values(data.claims || {});
    tabContentClaims.innerHTML = claims.length
      ? claims
          .map(
            (c) => `<div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <span style="font-weight: 700; color: #60a5fa;">[${c.claimId}] (${c.provider.toUpperCase()})</span>
              <span class="badge" style="background:#1e3a8a; color:#93c5fd; margin-left:4px;">${c.type}</span>
              <span class="badge" style="background:#065f46; color:#a7f3d0; margin-left:4px;">${c.evidenceStatus}</span>
              <div style="margin-top: 3px;">${escapeHtml(c.content)}</div>
            </div>`
          )
          .join('')
      : '<p style="color:var(--text-muted)">추출된 주장이 없습니다.</p>';

    // Critiques Tab
    const reviews = Object.values(data.reviews || {});
    tabContentCritiques.innerHTML = reviews.length
      ? reviews
          .map(
            (r) => `<div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <span style="font-weight: 700; color: #f472b6;">[${r.reviewId}] ${r.reviewer.toUpperCase()} → ${r.targetClaimId}</span>
              <div style="color: #cbd5e1; margin-top: 2px;"><strong>지적:</strong> ${escapeHtml(r.evidenceOrCounterexample)}</div>
              <div style="color: #93c5fd; margin-top: 2px;"><strong>수정안:</strong> ${escapeHtml(r.suggestedRevision)}</div>
            </div>`
          )
          .join('')
      : '<p style="color:var(--text-muted)">제기된 비판이 없습니다.</p>';

    // Unresolved Tab
    const unresolved = data.unresolvedIssues || [];
    tabContentUnresolved.innerHTML = unresolved.length
      ? unresolved
          .map(
            (u) => `<div style="margin-bottom: 8px; padding: 8px; background: rgba(239,68,68,0.1); border-left: 3px solid #ef4444; border-radius: 4px;">
              <strong style="color: #fca5a5;">${escapeHtml(u.id)}:</strong> ${escapeHtml(u.description)}
            </div>`
          )
          .join('')
      : '<p style="color: #34d399;">모든 핵심 이견이 논리적 근거로 해소되었습니다.</p>';

    // Sources Tab
    const sources = Object.values(data.sources || {});
    tabContentSources.innerHTML = sources.length
      ? sources
          .map(
            (s) => `<div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div style="font-weight: 700; color: #a78bfa;">[${s.sourceId}] ${escapeHtml(s.title)}</div>
              <div style="font-size: 11px; color: var(--text-muted); word-break: break-all;">${escapeHtml(s.url)}</div>
              <blockquote style="margin-top: 4px; padding-left: 8px; border-left: 2px solid #64748b; color: #cbd5e1; font-style: italic;">
                "${escapeHtml(s.evidenceQuote)}"
              </blockquote>
            </div>`
          )
          .join('')
      : '<p style="color:var(--text-muted)">인용된 1차 웹 출처가 없습니다.</p>';

    // Upgrade Offer
    if (data.transitionOffer?.shouldOfferDeep && data.mode === 'QUICK') {
      deepOfferCard.style.display = 'block';
    } else {
      deepOfferCard.style.display = 'none';
    }
  }

  // Upgrade to DEEP
  btnUpgradeDeep.addEventListener('click', async () => {
    if (!currentRunId) return;
    deepOfferCard.style.display = 'none';
    resultSection.style.display = 'none';
    progressSection.style.display = 'block';
    selectedMode = 'DEEP';
    btnModeDeep.classList.add('active');
    btnModeQuick.classList.remove('active');

    startTime = Date.now();
    startTimer();

    try {
      await fetch(`${API_BASE}/api/runs/${currentRunId}/upgrade-deep`, { method: 'POST' });
      pollProgress(currentRunId);
    } catch (err) {
      alert(`DEEP 전환 실패: ${err.message}`);
    }
  });

  // Action buttons
  btnCopy.addEventListener('click', () => {
    if (!currentRunData?.finalSynthesis?.answer) return;
    navigator.clipboard.writeText(currentRunData.finalSynthesis.answer);
    alert('최종 답변이 클립보드에 복사되었습니다.');
  });

  btnDownloadMd.addEventListener('click', () => {
    if (!currentRunData) return;
    const md = generateMarkdown(currentRunData);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QUICK4AI_Result_${currentRunData.runId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  });

  btnReset.addEventListener('click', () => {
    queryInput.value = '';
    refInput.value = '';
    updateCharCounts();
    resultSection.style.display = 'none';
    inputSection.style.display = 'block';
  });

  function startTimer() {
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      timerDisplay.textContent = `${m}:${s}`;
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  }

  function generateMarkdown(data) {
    return `# QUICK 4AI 다중 검증 리포트
- 작업 ID: ${data.runId}
- 검증 모드: ${data.mode}
- 총 호출 수: ${data.totalCalls}회
- 질문: ${data.query}

---

## 1. 최종 종합 답변
${data.finalSynthesis?.answer || '없음'}

---

## 2. 검증 통계 및 공지
- 상태: ${data.finalSynthesis?.verificationNotice || '완료'}
- 출처 대조: ${data.finalSynthesis?.evidenceSummary || '없음'}
- 상호 비판: ${data.finalSynthesis?.critiqueAndRevisionSummary || '없음'}

---

## 3. 미해결 쟁점
${(data.unresolvedIssues || []).map((u) => `- [${u.id}] ${u.description}`).join('\n') || '- 없음'}

---
*Generated by QUICK 4AI Chrome Extension*
`;
  }
})();
