/**
 * QUICK 4AI Benchmark Evaluation Suite (30 Cases)
 * As required by Section 22:
 * - 10 Fact & Source cases
 * - 10 Condition, Logic, Math cases
 * - 10 Code & Spec review cases
 */

import { BenchmarkCase } from '../types/quick4ai';

export const BENCHMARK_CASES: BenchmarkCase[] = [
  // ========================================================
  // Category 1: 사실·출처 (Fact & Sources) - 10 Cases
  // ========================================================
  {
    id: 'FACT_01',
    category: 'fact_check',
    title: 'LK-99 상온 초전도체 진위 판정',
    query: 'LK-99 논문이 2023년 네이처(Nature)에 게재되어 상온 상압 초전도체로 최종 공인되었는가?',
    questionType: 'fact_check',
    groundTruth: {
      correctFactOrSolution: 'LK-99는 Nature에 게재된 바 없으며(아카이브 프리프린트 공개), 전 세계 연구기관의 재현 검증 결과 황화구리 불순물 등에 기인한 강자성/반도체 현상으로 밝혀져 상온 초전도체가 아님이 확인됨.',
      commonTrapOrFabrication: 'Nature 게재 승인으로 오인하거나 현재 상용화 단계라고 날조하는 환각.',
      verificationCriteria: ['Nature 정식 논문 게재 여부 부정', '검증위 및 국제 재현 실패 보고서 인용', '황화구리 특성 언급'],
      mustDetectErrors: ['Nature 정식 게재 주장', '상온 초전도체 공인 주장'],
    },
  },
  {
    id: 'FACT_02',
    category: 'fact_check',
    title: 'Chrome Manifest V3 Web Request 차단 API 폐지 여부',
    query: 'Manifest V3에서 webRequestBlocking API를 사용해 광고 요청을 동기적으로 가로채고 수정할 수 있는가?',
    questionType: 'fact_check',
    groundTruth: {
      correctFactOrSolution: '일반 배포 확장 프로그램에서는 webRequestBlocking이 차단 정책(declarativeNetRequest)으로 대체되었음. 기업용 엔터프라이즈 정책 설치 확장에서만 제한적으로 허용됨.',
      commonTrapOrFabrication: 'MV3에서도 여전히 webRequestBlocking으로 네트워크 요청을 임의 차단할 수 있다고 설명하는 오류.',
      verificationCriteria: ['declarativeNetRequest 규칙 기반 대체 명시', '기업 정책 예외 언급'],
      mustDetectErrors: ['MV3 일반 확장의 webRequestBlocking 사용 가능 주장'],
    },
  },
  {
    id: 'FACT_03',
    category: 'fact_check',
    title: '바나나에 들어있는 칼륨과 방사선 피폭량',
    query: '바나나 1개를 먹으면 치사량에 가까운 칼륨-40 방사선 피폭을 겪어 즉시 위험해지는가?',
    questionType: 'fact_check',
    groundTruth: {
      correctFactOrSolution: '바나나에는 자연 방사성 동위원소인 K-40이 소량 함유되어 있으나(약 0.1μSv 수준), 체내 항상성으로 과잉 칼륨은 즉시 배출되므로 인체에 전혀 유해하지 않음.',
      commonTrapOrFabrication: '바나나 다량 섭취 시 급성 방사선 증후군 발생 주장.',
      verificationCriteria: ['항상성(Homeostasis) 유지 명시', '바나나 등가선량(BED)의 극소성 설명'],
      mustDetectErrors: ['바나나 섭취의 방사선 위험성 과장'],
    },
  },
  {
    id: 'FACT_04',
    category: 'fact_check',
    title: '대한민국 법정 정년 연령',
    query: '현재 대한민국 고용상 연령차별금지 및 고령자고용촉진에 관한 법률상 법정 정년은 65세인가?',
    questionType: 'fact_check',
    groundTruth: {
      correctFactOrSolution: '현행 고령자고용법 제19조에 따른 법정 정년은 "60세"임. 65세 연장 논의가 진행 중이나 법 개정은 이루어지지 않았음.',
      commonTrapOrFabrication: '국민연금 수급 개시 연령(65세)과 법정 정년을 혼동하여 이미 65세라고 답하는 오류.',
      verificationCriteria: ['현행 법정 정년 60세 명시', '국민연금 개시 연령과의 차이 구별'],
      mustDetectErrors: ['현행 법정 정년이 65세라는 주장'],
    },
  },
  {
    id: 'FACT_05',
    category: 'fact_check',
    title: '에펠탑 여름철 높이 팽창 현상',
    query: '에펠탑은 열팽창 때문에 여름에 겨울보다 최대 15cm 정도 높아지는 것이 사실인가?',
    questionType: 'fact_check',
    groundTruth: {
      correctFactOrSolution: '사실임. 에펠탑의 주재료인 연철(Puddle iron)의 열팽창으로 인해 여름 직사광선 하에서 최대 약 15cm 가량 키가 커지고 햇빛 반대쪽으로 미세하게 기움.',
      commonTrapOrFabrication: '가짜 뉴스나 도시전설로 치부하여 허위 사실로 잘못 반박하는 오판.',
      verificationCriteria: ['철의 열팽창 계수 및 15cm 신장 확인', '에펠탑 공식 운영사 기록 인용'],
      mustDetectErrors: ['열팽창 현상을 허위 사실로 판정'],
    },
  },
  {
    id: 'FACT_06',
    category: 'fact_check',
    title: '인간 뇌 사용량 10% 신화',
    query: '인간은 평소 뇌의 10%만 사용하며, 나머지 90%는 잠재력으로 잠들어 있다는 주장이 신경과학적 사실인가?',
    questionType: 'fact_check',
    groundTruth: {
      correctFactOrSolution: '완전한 대중적 오해(신화)임. fMRI 등 현대 뇌영상 연구에 따르면 인간은 뇌의 거의 모든 영역을 부위별 기능에 맞춰 지속적으로 활용함.',
      commonTrapOrFabrication: '영화나 자기계발서의 10% 신화를 과학적 근거가 있는 사실로 인용하는 오류.',
      verificationCriteria: ['fMRI 및 신경과학 연구 인용', '진화생물학적 자원 소모 관점 설명'],
      mustDetectErrors: ['10% 사용설을 과학적 정설로 인정'],
    },
  },
  {
    id: 'FACT_07',
    category: 'fact_check',
    title: '금문교(Golden Gate Bridge) 페인트 칠 작업 주기',
    query: '금문교는 한쪽 끝에서 반대편 끝까지 칠하고 나면 처음으로 돌아와 끊임없이 페인트를 칠하는가?',
    questionType: 'fact_check',
    groundTruth: {
      correctFactOrSolution: '신화임. 금문교 관리공단(Golden Gate Bridge District)에 따르면 다리 전체를 연속적으로 칠하는 것이 아니라 부식이 발생한 구역을 점검하여 우선 보수하는 방식으로 유지보수함.',
      commonTrapOrFabrication: '관용적 격언을 사실로 채택하는 오류.',
      verificationCriteria: ['공식 관리공단 방식 인용 (Spot painting)', '지속 순환 전면 도색설 부정'],
      mustDetectErrors: ['끝에서 끝으로 무한 반복 도색한다는 주장 사실로 인정'],
    },
  },
  {
    id: 'FACT_08',
    category: 'fact_check',
    title: '커피의 원산지와 발견 설화 (칼디의 염소)',
    query: '에티오피아 목동 칼디가 춤추는 염소를 보고 커피를 최초로 발견했다는 기록은 9세기 당대 문헌에 존재하는가?',
    questionType: 'fact_check',
    groundTruth: {
      correctFactOrSolution: '칼디의 염소 이야기는 9세기가 아니라 1671년 로마의 언어학자 안토니오 파우스타 나이론(Nairon)의 저서에 처음 등장한 구전 설화임.',
      commonTrapOrFabrication: '9세기 당대 역사적 기록물로 오인.',
      verificationCriteria: ['1671년 나이론 저서 언급', '역사적 1차 사료 부재 명시'],
      mustDetectErrors: ['9세기 실존 문헌 기록으로 인정'],
    },
  },
  {
    id: 'FACT_09',
    category: 'fact_check',
    title: '달에서 만리장성이 맨눈으로 보이는가',
    query: '우주비행사가 달 표면에서 맨눈으로 지구를 바라볼 때 만리장성이 뚜렷이 보이는가?',
    questionType: 'fact_check',
    groundTruth: {
      correctFactOrSolution: '보이지 않음. 만리장성의 폭은 수 미터에 불과하며 주변 흙/돌과 색상이 유사하여 달(약 38만 km 거리)은 물론 지구 저궤도(ISS)에서도 육안 식별이 불가능함.',
      commonTrapOrFabrication: '아폴로 우주비행사가 맨눈으로 확인했다는 루머 인정.',
      verificationCriteria: ['NASA 및 아폴로 승무원 증언 인용', '해상도 한계 및 거리(384,000km) 제시'],
      mustDetectErrors: ['달에서 육안 관측 가능하다는 주장 수용'],
    },
  },
  {
    id: 'FACT_10',
    category: 'fact_check',
    title: '글루텐프리 식품의 체중 감량 효과',
    query: '글루텐프리 식품은 셀리악병이 없는 일반인에게도 복부 비만을 즉각 감량시키는 다이어트 필수 식품인가?',
    questionType: 'fact_check',
    groundTruth: {
      correctFactOrSolution: '아님. 글루텐 자체는 체중 증가의 직접 원인이 아니며, 글루텐 프리 가공식품은 맛과 식감을 위해 지방과 당류 함량이 오히려 높은 경우가 많음.',
      commonTrapOrFabrication: '글루텐 배제가 일반인의 체중 감량을 보장한다는 마케팅 문구 무비판적 수용.',
      verificationCriteria: ['셀리악병/밀가루 알레르기 환자와 일반인 구분', '글루텐프리 가공식품의 고열량/당류 문제 지적'],
      mustDetectErrors: ['일반인 다이어트 특효약으로 판정'],
    },
  },

  // ========================================================
  // Category 2: 조건·논리·계산 (Condition, Logic, Math) - 10 Cases
  // ========================================================
  {
    id: 'LOGIC_01',
    category: 'logic_math',
    title: '몬티 홀 문제 (Monty Hall Problem)',
    query: '세 개의 문 중 하나에 차, 둘에 염소가 있다. 문 하나를 골랐을 때 사회자가 남은 두 문 중 염소가 있는 문을 열어 보여주었다. 선택을 바꾸는 것이 유리한가?',
    questionType: 'decision',
    groundTruth: {
      correctFactOrSolution: '선택을 바꾸면 차를 얻을 확률이 2/3로 증가하므로 바꾸는 것이 절대적으로 유리함. (처음 선택 유지 시 1/3)',
      commonTrapOrFabrication: '남은 문이 2개이므로 확률이 각각 1/2로 동일하여 바꿀 필요가 없다는 직관적 오류.',
      verificationCriteria: ['조건부 확률 또는 전체 경우의 수 제시', '선택 변경 시 승률 2/3 도출'],
      mustDetectErrors: ['확률이 50:50으로 동일하다는 결론'],
    },
  },
  {
    id: 'LOGIC_02',
    category: 'logic_math',
    title: '배열과 부분집합의 시간복잡도',
    query: '길이 N인 수열의 모든 가능한 부분집합(Power set)을 생성하는 알고리즘의 최적 시간복잡도는 O(N^2)인가?',
    questionType: 'decision',
    groundTruth: {
      correctFactOrSolution: '아님. 부분집합의 총 개수는 2^N개이므로 모든 부분집합을 출력하거나 생성하는 시간복잡도는 O(N * 2^N) 또는 최소 O(2^N)임.',
      commonTrapOrFabrication: '부분수열 쌍(N*(N-1)/2)과 부분집합(2^N)을 혼동하여 다항 시간 O(N^2)으로 오판.',
      verificationCriteria: ['부분집합 수 2^N 계산', '지수 시간 복잡도 설명'],
      mustDetectErrors: ['O(N^2) 시간복잡도 인정'],
    },
  },
  {
    id: 'LOGIC_03',
    category: 'logic_math',
    title: '생일 역설 (Birthday Paradox)',
    query: '한 방에 몇 명이 모여야 그중 두 명의 생일이 같을 확률이 50%를 넘는가? 183명(365의 절반)인가?',
    questionType: 'decision',
    groundTruth: {
      correctFactOrSolution: '단 23명만 모여도 두 명의 생일이 같을 확률은 약 50.7%로 절반을 넘음. 365의 절반인 183명이 필요하지 않음.',
      commonTrapOrFabrication: '특정 1명과 같은 생일(183명)과 임의의 2명이 같은 생일(쌍의 조합)을 혼동.',
      verificationCriteria: ['여사건 확률 계산 [1 - (365/365 * 364/365 ...)]', '정답 23명 제시'],
      mustDetectErrors: ['183명 또는 365/2명 제시'],
    },
  },
  {
    id: 'LOGIC_04',
    category: 'logic_math',
    title: '0.999... = 1 수학적 동치성',
    query: '순환소수 0.999...는 1에 무한히 가까워질 뿐 엄밀하게 1과 같지는 않은가?',
    questionType: 'decision',
    groundTruth: {
      correctFactOrSolution: '실수 체계에서 0.999...는 1과 엄밀하게 완전히 동일함 (0.999... = 1). 극한값의 정의 및 1/3 * 3 = 1 등으로 증명됨.',
      commonTrapOrFabrication: '"무한히 접근하지만 결코 도달할 수 없다"는 직관적 오개념 전개.',
      verificationCriteria: ['실수 해석학에서의 엄밀한 동치성 명시', '급수 합 또는 분수 유도(3 * 1/3) 제시'],
      mustDetectErrors: ['0.999... < 1 로 결론 도출'],
    },
  },
  {
    id: 'LOGIC_05',
    category: 'logic_math',
    title: '기저율 오류 (Base Rate Fallacy - 희귀 질환 검사)',
    query: '유병률 0.1%인 희귀병에 대해 정확도(민감도/특이도)가 99%인 검사에서 양성이 나왔다면 실제로 병에 걸렸을 확률은 99%인가?',
    questionType: 'decision',
    groundTruth: {
      correctFactOrSolution: '아님. 베이즈 정리에 따르면 1,000명 중 환자는 1명(양성 1명), 정상인 999명 중 위양성이 약 10명이 발생하므로, 양성자 중 실제 환자 비율은 약 9% (1/11)에 불과함.',
      commonTrapOrFabrication: '검사 정확도 99%를 사후 확률로 직결하는 기저율 무시 오류.',
      verificationCriteria: ['베이즈 정리 적용', '실제 발병 확률 약 9% 전후 도출'],
      mustDetectErrors: ['양성 판정 시 유병 확률 99%라고 답변'],
    },
  },
  {
    id: 'LOGIC_06',
    category: 'logic_math',
    title: '비행기와 컨베이어 벨트 이륙 역설',
    query: '비행기가 달리는 속도와 정확히 같은 속도로 반대 방향으로 회전하는 거대한 컨베이어 벨트 위에서 비행기는 이륙할 수 있는가?',
    questionType: 'decision',
    groundTruth: {
      correctFactOrSolution: '이륙할 수 있음. 비행기는 바퀴로 지면을 밀고 나가는 자동차와 달리 제트엔진/프로펠러로 공기를 밀어 추력을 얻으므로, 바퀴가 2배 빠르게 돌 뿐 기체는 전진하여 양력을 형성함.',
      commonTrapOrFabrication: '자동차처럼 바퀴 동력 전달로 생각하여 기체가 제자리에 머문다고 오판.',
      verificationCriteria: ['대기 상대 속도(Airspeed)와 양력 원리 설명', '바퀴의 프리휠링 및 엔진 추력 분리'],
      mustDetectErrors: ['양력을 얻지 못해 이륙 불가능하다고 단언'],
    },
  },
  {
    id: 'LOGIC_07',
    category: 'logic_math',
    title: '연속 할인율 복합 계산',
    query: '어떤 상품 가격이 50% 인상되었다가 다시 50% 할인되었다면 원래 가격으로 복원되는가?',
    questionType: 'decision',
    groundTruth: {
      correctFactOrSolution: '원래 가격의 75%가 됨 (25% 손실). 100원 → 150원 → 75원.',
      commonTrapOrFabrication: '+50%와 -50%가 상쇄되어 원점 복귀한다고 착각.',
      verificationCriteria: ['1 * 1.5 * 0.5 = 0.75 수식 도출', '25% 하락 명시'],
      mustDetectErrors: ['원래 가격과 동일하다는 판정'],
    },
  },
  {
    id: 'LOGIC_08',
    category: 'logic_math',
    title: '심슨의 역설 (Simpson\'s Paradox)',
    query: 'A 병원의 수술 성공률이 경증 환자와 중증 환자 각각에서 모두 B 병원보다 높다면, 전체 환자 통합 성공률도 반드시 A 병원이 높은가?',
    questionType: 'decision',
    groundTruth: {
      correctFactOrSolution: '반드시 높지는 않음 (심슨의 역설). A 병원에 사망 위험이 극도로 높은 중증 환자가 대거 몰리면 하위 집단별 성공률이 높아도 전체 집계 성공률은 더 낮아질 수 있음.',
      commonTrapOrFabrication: '가중 평균의 왜곡을 인지하지 못하고 수학적으로 무조건 높다고 단언.',
      verificationCriteria: ['심슨의 역설 메커니즘 설명', '환자 배분 비율(가중치) 영향 명시'],
      mustDetectErrors: ['전체 성공률도 무조건 A가 높아야 한다는 결론'],
    },
  },
  {
    id: 'LOGIC_09',
    category: 'logic_math',
    title: '동전 10번 연속 앞면 후 다음 확률 (도박사의 오류)',
    query: '공정한 동전을 던져 앞면이 10번 연속으로 나왔다면, 11번째 던졌을 때 뒷면이 나올 확률은 50%보다 높은가?',
    questionType: 'decision',
    groundTruth: {
      correctFactOrSolution: '여전히 정확히 50% (1/2)임. 각 동전 던지기는 독립 시행이므로 과거의 결과가 미래의 확률에 영향을 주지 않음 (도박사의 오류).',
      commonTrapOrFabrication: '대수의 법칙을 잘못 적용하여 "균형을 맞추기 위해 뒷면 확률이 올라간다"고 착각.',
      verificationCriteria: ['독립 사건(Independent Event) 명시', '11번째 시행 확률 0.5(50%) 유지'],
      mustDetectErrors: ['뒷면 확률이 50% 초과로 상승한다고 판정'],
    },
  },
  {
    id: 'LOGIC_10',
    category: 'logic_math',
    title: '두 자녀 문제 (Boy or Girl Paradox)',
    query: '어떤 부모에게 자녀가 2명 있으며, 그중 적어도 1명이 아들이라는 사실을 알았을 때, 다른 1명도 아들일 확률은 1/2인가?',
    questionType: 'decision',
    groundTruth: {
      correctFactOrSolution: '확률은 1/3임. 두 자녀의 전체 표본 공간 (아들,아들), (아들,딸), (딸,아들), (딸,딸) 중 적어도 1명이 아들이면 앞의 3가지 경우만 남고, 그중 둘 다 아들인 경우는 1가지뿐임.',
      commonTrapOrFabrication: '첫째/둘째 순서를 지정하지 않은 상태에서 독립적 1/2로 단정.',
      verificationCriteria: ['표본 공간 축소 (BB, BG, GB)', '정답 1/3 도출'],
      mustDetectErrors: ['단순 1/2로 확정'],
    },
  },

  // ========================================================
  // Category 3: 코드·요구사항 (Code & Spec Review) - 10 Cases
  // ========================================================
  {
    id: 'CODE_01',
    category: 'code_review',
    title: 'JavaScript 정수 부동소수점 오버플로우',
    query: 'JavaScript에서 9007199254740992 === 9007199254740993 의 비교 결과는 false인가?',
    questionType: 'code_review',
    groundTruth: {
      correctFactOrSolution: 'true임! IEEE-754 배정밀도 부동소수점 한계(Number.MAX_SAFE_INTEGER = 2^53 - 1 = 9007199254740991)를 초과하여 두 숫자가 동일한 비트 패턴으로 근사 처리됨. BigInt를 사용해야 구별 가능.',
      commonTrapOrFabrication: '단순히 숫자가 다르므로 false가 반환된다고 착각.',
      verificationCriteria: ['Number.MAX_SAFE_INTEGER 한계 언급', '동치 결과 true 명시', 'BigInt 해결책 제시'],
      mustDetectErrors: ['비교 결과 false 주장'],
    },
  },
  {
    id: 'CODE_02',
    category: 'code_review',
    title: 'React setState 비동기 배치와 이전 상태 참조',
    query: 'React 함수형 컴포넌트에서 setCount(count + 1)을 연속 3번 호출하면 count는 즉시 3 증가하는가?',
    questionType: 'code_review',
    groundTruth: {
      correctFactOrSolution: '1만 증가함. count 변수는 해당 렌더링 스냅샷의 값을 클로저로 캡처하고 있으므로 3번 모두 동일한 (0 + 1)을 예약함. 함수형 업데이트 setCount(prev => prev + 1)를 써야 3 증가함.',
      commonTrapOrFabrication: '3회 호출했으므로 3이 증가한다고 오답.',
      verificationCriteria: ['State Batching 및 렌더 큐 설명', '업데이터 함수 prev => prev + 1 솔루션 제시'],
      mustDetectErrors: ['3 증가한다고 답변'],
    },
  },
  {
    id: 'CODE_03',
    category: 'code_review',
    title: 'JavaScript Array.sort() 기본 정렬 방식',
    query: '[10, 5, 20, 1].sort() 를 실행하면 숫자의 오름차순인 [1, 5, 10, 20] 으로 정렬되는가?',
    questionType: 'code_review',
    groundTruth: {
      correctFactOrSolution: '[1, 10, 20, 5] 로 정렬됨. JS의 Array.prototype.sort()는 인자 없이 호출 시 요소를 문자열로 변환하여 UTF-16 코드 유닛 순서로 정렬하기 때문임. (a, b) => a - b 비교 함수 필수.',
      commonTrapOrFabrication: '숫자 배열이므로 기본적으로 수치 오름차순으로 정렬된다고 착각.',
      verificationCriteria: ['문자열 사전식 정렬(Lexicographical sort) 설명', '비교 콜백 (a, b) => a - b 제시'],
      mustDetectErrors: ['[1, 5, 10, 20] 으로 정렬된다고 답변'],
    },
  },
  {
    id: 'CODE_04',
    category: 'code_review',
    title: 'SQL 트랜잭션 Read Committed 격리 수준과 팬텀 리드',
    query: 'SQL 표준 Read Committed 격리 수준에서 트랜잭션 내 동일한 범위 조회 쿼리를 실행했을 때 다른 트랜잭션이 행을 추가해도 항상 동일한 결과 집합을 보장하는가?',
    questionType: 'code_review',
    groundTruth: {
      correctFactOrSolution: '보장하지 않음. Read Committed에서는 Non-Repeatable Read와 Phantom Read가 모두 발생할 수 있음. 범위 조회의 일관성을 위해서는 Serializable 수준이 요구됨.',
      commonTrapOrFabrication: '커밋된 데이터만 읽으므로 트랜잭션 내 결과가 완전히 고정된다고 오판.',
      verificationCriteria: ['팬텀 리드(Phantom Read) 발생 가능성 명시', 'Repeatable Read / Serializable 비교'],
      mustDetectErrors: ['동일한 결과 집합 영구 보장 주장'],
    },
  },
  {
    id: 'CODE_05',
    category: 'code_review',
    title: 'Python 기본 인자 가변 객체 참조 버그 (Mutable Default Argument)',
    query: 'def append_to(element, target_list=[]): target_list.append(element); return target_list 함수를 두 번 호출했을 때 결과는 독립적인 단일 원소 리스트인가?',
    questionType: 'code_review',
    groundTruth: {
      correctFactOrSolution: '독립적이지 않음. Python에서 함수의 기본 인자는 함수 정의 시점에 단 한 번 평가되어 모듈에 저장되므로, 가변 리스트가 호출 간에 공유되어 [1], [1, 2]로 누적됨.',
      commonTrapOrFabrication: '함수가 호출될 때마다 새로운 빈 리스트 []가 생성된다고 착각.',
      verificationCriteria: ['기본 인자의 함수 정의 시점 평가 메커니즘 설명', 'target_list=None 패턴 권장'],
      mustDetectErrors: ['호출마다 새로운 리스트가 생성되어 독립적이라고 주장'],
    },
  },
  {
    id: 'CODE_06',
    category: 'code_review',
    title: 'Git Merge 와 Git Rebase 의 브랜치 이력 불변성',
    query: 'git rebase 명령은 기존 커밋의 해시값(SHA-1)을 그대로 유지한 채 부모 커밋의 참조 포인터만 이동시키는가?',
    questionType: 'code_review',
    groundTruth: {
      correctFactOrSolution: '아님. Git에서 커밋 해시는 부모 커밋의 해시를 포함하여 계산되므로, 베이스가 변경되면 새로운 해시를 가진 완전히 새로운 커밋 객체들이 재생성됨.',
      commonTrapOrFabrication: '커밋 내용은 안 바뀌므로 커밋 ID도 유지된다고 오판.',
      verificationCriteria: ['Git DAG 구조 및 커밋 해시 계산 방식 설명', '새로운 커밋 객체 복제/생성 명시'],
      mustDetectErrors: ['기존 커밋 해시가 불변 유지된다고 답변'],
    },
  },
  {
    id: 'CODE_07',
    category: 'code_review',
    title: 'CSS flexbox 에서 align-items 와 justify-content 의 축 제어',
    query: 'flex-direction이 row일 때 align-items는 가로(수평) 축을 정렬하는 속성인가?',
    questionType: 'code_review',
    groundTruth: {
      correctFactOrSolution: '아님. flex-direction이 row일 때 주 축(main axis)은 수평선이며, justify-content가 주 축을 제어함. align-items는 교차 축(cross axis)인 세로(수직) 축을 정렬함.',
      commonTrapOrFabrication: 'align은 가로, justify는 세로라는 오해.',
      verificationCriteria: ['Main Axis(주 축)과 Cross Axis(교차 축) 구별', 'align-items는 교차 축 정렬 명시'],
      mustDetectErrors: ['align-items가 수평 축 정렬이라고 답변'],
    },
  },
  {
    id: 'CODE_08',
    category: 'code_review',
    title: 'Node.js 이벤트 루프와 process.nextTick 우선순위',
    query: 'Node.js에서 setTimeout(() => console.log(1), 0) 과 process.nextTick(() => console.log(2)) 가 동시에 등록되었을 때 1이 먼저 출력되는가?',
    questionType: 'code_review',
    groundTruth: {
      correctFactOrSolution: '2가 먼저 출력됨. process.nextTick은 이벤트 루프의 타이머 페이즈(Timers Phase)로 넘어가기 전 현재 작업 직후 즉시 마이크로태스크 큐와 함께 처리되므로 항상 우선순위가 높음.',
      commonTrapOrFabrication: 'setTimeout 0ms가 가장 빠르다고 착각하여 1이 먼저 나온다고 오답.',
      verificationCriteria: ['process.nextTick 큐의 우선순위 설명', '출력 순서 2 -> 1 도출'],
      mustDetectErrors: ['1이 먼저 출력된다고 판정'],
    },
  },
  {
    id: 'CODE_09',
    category: 'code_review',
    title: 'JWT (JSON Web Token) 페이로드의 자체 암호화 보장 여부',
    query: '표준 서명된 JWT(JWS) 토큰은 base64url로 인코딩되어 있으므로 클라이언트나 네트워크 공격자가 페이로드 내부의 사용자 정보를 절대로 읽을 수 없는가?',
    questionType: 'code_review',
    groundTruth: {
      correctFactOrSolution: '아님. 서명(JWS)은 위변조 방지일 뿐 암호화(JWE)가 아니므로 누구나 base64url 디코딩만으로 페이로드 원본 텍스트를 열람할 수 있음. 민감 정보 보관 금지.',
      commonTrapOrFabrication: '서명과 암호화를 혼동하여 JWT 내용이 비밀로 암호화되어 안전하다고 착각.',
      verificationCriteria: ['인코딩(Base64URL)과 암호화(Encryption) 구분', 'JWS 위변조 방지 vs JWE 기밀성 설명'],
      mustDetectErrors: ['JWT 서명만으로 페이로드 읽기가 불가능하다는 주장'],
    },
  },
  {
    id: 'CODE_10',
    category: 'code_review',
    title: 'HTTP POST 요청의 멱등성 (Idempotency)',
    query: 'RFC 9110 HTTP 명세상 POST 메서드는 GET이나 PUT처럼 멱등(Idempotent)하다고 규정되어 있는가?',
    questionType: 'code_review',
    groundTruth: {
      correctFactOrSolution: 'POST는 멱등하지 않음(Non-idempotent). 동일한 POST 요청을 여러 번 전송하면 매번 서버에 새 자원이 생성되거나 부수 효과가 누적될 수 있음. PUT/DELETE/GET은 멱등함.',
      commonTrapOrFabrication: 'HTTP 표준 메서드는 모두 멱등하다거나 POST도 멱등하다고 오판.',
      verificationCriteria: ['RFC 9110 명세 인용', 'POST의 비멱등성 vs PUT의 멱등성 대조'],
      mustDetectErrors: ['POST 메서드가 멱등하다고 판정'],
    },
  },
];
