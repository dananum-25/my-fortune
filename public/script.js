/* ===============================
   사운드 (초기 뮤트)
================================ */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.3;

const sPick = new Audio("/sounds/tarot/pick.mp3");
const sOpen = new Audio("/sounds/tarot/spread_open.mp3");

let soundOn = false;
const soundBtn = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");

soundBtn.onclick = () => toggleSound();

function toggleSound() {
  soundOn = !soundOn;
  soundIcon.textContent = soundOn ? "🔊" : "🔇";
  if (soundOn) bgm.play().catch(()=>{});
  else bgm.pause();
}

/* ===============================
   질문 데이터 (기타 없음)
================================ */
const QUESTIONS = [
  {
    title: "어떤 주제에 대한 상담일까?",
    options: [
      { label: "연애 · 관계", next: 1 },
      { label: "직업 · 진로", next: 1 },
      { label: "금전 · 현실", next: 1 },
      { label: "나 자신 · 마음", next: 1 }
    ]
  },
  {
    title: "지금 상황은 어떤 상태에 가까울까?",
    options: [
      { label: "혼란스럽고 방향을 못 잡겠어", next: 2 },
      { label: "선택의 기로에 서 있어", next: 2 },
      { label: "이미 결정했지만 확신이 없어", next: 2 },
      { label: "감정이 흔들리고 있어", next: 2 }
    ]
  },
  {
    title: "카드에게 무엇을 묻고 싶을까?",
    options: [
      { label: "지금의 흐름을 알고 싶어", next: "done" },
      { label: "내 선택이 맞는지 묻고 싶어", next: "done" },
      { label: "조언이나 방향을 듣고 싶어", next: "done" },
      { label: "이 상황의 핵심을 알고 싶어", next: "done" }
    ]
  }
];

/* ===============================
   질문 렌더링
================================ */
const qTitle = document.getElementById("qTitle");
const qGrid = document.getElementById("qGrid");
const catMsg = document.getElementById("catMessage");

let step = 0;
renderStep(step);

function renderStep(idx) {
  qTitle.textContent = QUESTIONS[idx].title;
  qGrid.innerHTML = "";

  QUESTIONS[idx].options.forEach(opt => {
    const card = document.createElement("div");
    card.className = "q-card";
    card.textContent = opt.label;

    card.onclick = () => {
      // 첫 인터랙션에서만 배경음 시작
      if (!soundOn) {
        soundOn = true;
        soundIcon.textContent = "🔊";
        bgm.play().catch(()=>{});
      }

      sPick.currentTime = 0;
      sPick.play().catch(()=>{});

      if (opt.next === "done") {
        finishQuestions();
      } else {
        step = opt.next;
        sOpen.currentTime = 0;
        sOpen.play().catch(()=>{});
        renderStep(step);
      }
    };

    qGrid.appendChild(card);
  });
}

function finishQuestions() {
  qTitle.textContent = "좋아, 이 질문으로 카드를 뽑아볼게.";
  qGrid.innerHTML = "";
  catMsg.innerHTML = `
    이제 준비가 됐어.<br>
    <span>다음 단계에서 카드를 펼칠 거야 🐾</span>
  `;
}
