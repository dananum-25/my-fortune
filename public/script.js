/* ===============================
   0. 사운드
================================ */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;
let muted = true;

document.getElementById("soundToggle").onclick = () => {
  muted = !muted;
  document.getElementById("soundToggle").textContent =
    muted ? "사운드 🔇" : "사운드 🔊";
  muted ? bgm.pause() : bgm.play().catch(()=>{});
};

/* ===============================
   1. 질문 데이터
================================ */
const QUESTIONS = [
  { text: "어떤 분야의 고민인가요?", options: ["연애", "직장/일", "금전", "관계"] },
  { text: "이 고민은 언제쯤의 이야기인가요?", options: ["과거", "현재", "미래"] },
  { text: "지금 가장 알고 싶은 것은?", options: ["방향성", "조언", "상대의 마음", "결과"] }
];

let step = 0;
const questionArea = document.getElementById("questionArea");
const transitionArea = document.getElementById("transitionArea");

/* ===============================
   2. 질문 렌더
================================ */
function renderQuestion() {
  questionArea.innerHTML = "";
  const q = QUESTIONS[step];
  const p = document.createElement("p");
  p.textContent = q.text;
  questionArea.appendChild(p);

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = nextStep;
    questionArea.appendChild(btn);
  });
}

function nextStep() {
  step++;
  if (step < QUESTIONS.length) {
    renderQuestion();
  } else {
    questionArea.classList.add("hidden");
    transitionArea.classList.remove("hidden");
  }
}

renderQuestion();

/* ===============================
   3. 카드 영역
================================ */
const goCardBtn = document.getElementById("goCard");
const resetBtn = document.getElementById("resetAll");
const bigStage = document.getElementById("bigCardStage");
const spread = document.getElementById("spreadSection");
const grid = document.getElementById("grid78");
const modal = document.getElementById("confirmModal");
const confirmPick = document.getElementById("confirmPick");

let selected = [];

goCardBtn.onclick = () => {
  transitionArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");
  initSpread();
};

resetBtn.onclick = () => location.reload();

/* ===============================
   4. 스프레드 생성
================================ */
function initSpread() {
  grid.innerHTML = "";
  selected = [];
  for (let i = 0; i < 78; i++) {
    const d = document.createElement("div");
    d.className = "pick";
    d.onclick = () => togglePick(d);
    grid.appendChild(d);
  }
}

function togglePick(card) {
  if (card.classList.contains("sel")) {
    card.classList.remove("sel");
    selected = selected.filter(c => c !== card);
    return;
  }
  if (selected.length >= 3) return;
  card.classList.add("sel");
  selected.push(card);
  if (selected.length === 3) modal.classList.remove("hidden");
}

/* ===============================
   5. 확정 → 앞면 공개 (연출 최소)
================================ */
confirmPick.onclick = () => {
  modal.classList.add("hidden");
  spread.classList.add("hidden");

  const cards = document.querySelectorAll(".big-card");
  cards.forEach((c, i) => {
    setTimeout(() => {
      c.style.backgroundImage =
        `url('/assets/tarot/majors/0${i}.png')`;
    }, i * 500);
  });
};
