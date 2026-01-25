const questionArea = document.getElementById("questionArea");

/* STEP A 질문 */
const stepA = {
  question: "괜찮아, 지금 마음이 복잡한 건 자연스러운 일이야.\n먼저, 이 고민이 어떤 쪽에 더 가까운지 골라볼까? 🐾",
  options: [
    { key: "relation", label: "사람과의 관계 / 감정 문제" },
    { key: "decision", label: "중요한 선택이나 결정" },
    { key: "pattern", label: "계속 반복되는 고민" },
    { key: "self", label: "나 자신에 대한 혼란이나 방향성" }
  ]
};

/* STEP B 질문 세트 */
const stepB = {
  relation: [
    {
      q: "이 관계에서 가장 힘든 건 뭐에 가까워?",
      a: [
        "기대한 만큼 돌아오지 않는다",
        "상대의 말이나 행동이 자주 상처가 된다",
        "나만 더 애쓰는 것 같다",
        "정리해야 할 것 같지만 마음이 따라주지 않는다",
        "이 관계가 나를 불안하게 만든다"
      ]
    },
    {
      q: "지금 이 관계에서 네 마음에 더 가까운 건?",
      a: [
        "붙잡고 싶은 마음이 크다",
        "놓아야 할 것 같다",
        "아직 결정할 준비가 안 됐다",
        "상대의 진짜 마음을 알고 싶다"
      ]
    }
  ],

  decision: [
    {
      q: "이 선택을 어렵게 만드는 가장 큰 이유는?",
      a: [
        "결과가 두렵다",
        "어느 쪽도 완전히 마음에 들지 않는다",
        "잘못된 선택을 할까 봐 걱정된다",
        "주변의 시선이 신경 쓰인다"
      ]
    },
    {
      q: "선택을 미루고 있을 때 드는 감정은?",
      a: [
        "불안",
        "답답함",
        "회피하고 싶은 마음",
        "압박감"
      ]
    }
  ],

  pattern: [
    {
      q: "이 고민이 반복될 때마다 드는 생각은?",
      a: [
        "또 같은 상황이 왔다",
        "왜 항상 이런 선택을 할까",
        "바뀌지 않는 내가 답답하다",
        "언제까지 이럴지 모르겠다"
      ]
    },
    {
      q: "이 패턴에서 가장 벗어나고 싶은 건?",
      a: [
        "감정의 소모",
        "비슷한 관계",
        "같은 실패",
        "반복되는 후회"
      ]
    }
  ],

  self: [
    {
      q: "요즘 나 자신에게 가장 많이 드는 감정은?",
      a: [
        "자신 없음",
        "혼란",
        "조급함",
        "지침",
        "공허함"
      ]
    },
    {
      q: "지금 나에게 가장 필요한 건?",
      a: [
        "확신",
        "휴식",
        "방향",
        "용기",
        "정리"
      ]
    }
  ]
};

let currentStepB = [];
let stepBIndex = 0;

/* 화면 렌더 함수 */
function renderQuestion(question, options, onSelect) {
  questionArea.innerHTML = "";

  const title = document.createElement("div");
  title.className = "question-title";
  title.textContent = question;
  questionArea.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "card-grid";

  options.forEach(opt => {
    const card = document.createElement("div");
    card.className = "select-card";
    card.textContent = opt.label || opt;
    card.onclick = () => onSelect(opt.key || opt);
    grid.appendChild(card);
  });

  questionArea.appendChild(grid);
}

/* STEP A 시작 */
renderQuestion(
  stepA.question,
  stepA.options,
  (key) => {
    currentStepB = stepB[key];
    stepBIndex = 0;
    renderStepB();
  }
);

/* STEP B 진행 */
function renderStepB() {
  const step = currentStepB[stepBIndex];
  renderQuestion(
    step.q,
    step.a,
    () => {
      stepBIndex++;
      if (stepBIndex < currentStepB.length) {
        renderStepB();
      } else {
        renderQuestion(
          "고마워. 이제 고민의 중심이 충분히 드러났어.\n그럼 이 마음을 카드로 비춰볼까? 🐾",
          [{ label: "카드에게 물어보기", key: "go" }],
          () => {
            // 다음 단계에서 카드 등장
            alert("다음 단계: 카드 연출 진입");
          }
        );
      }
    }
  );
}
