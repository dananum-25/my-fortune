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
const bigCards = document.querySelectorAll(".big-card");

let selected = [];

/* ===============================
   4. 카드 파일 테이블 (실제 경로 기준)
================================ */
const MAJORS = [
  "00_the_fool.png","01_the_magician.png","02_the_high_priestess.png",
  "03_the_empress.png","04_the_emperor.png","05_the_hierophant.png",
  "06_the_lovers.png","07_the_chariot.png","08_strength.png",
  "09_the_hermit.png","10_wheel_of_fortune.png","11_justice.png",
  "12_the_hanged_man.png","13_death.png","14_temperance.png",
  "15_the_devil.png","16_the_tower.png","17_the_star.png",
  "18_the_moon.png","19_the_sun.png","20_judgement.png",
  "21_the_world.png"
];

const SUITS = ["cups","wands","swords","pentacles"];
const MINOR_NAMES = {
  "01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six",
  "07":"seven","08":"eight","09":"nine","10":"ten",
  "11":"page","12":"knight","13":"queen","14":"king"
};

/* ===============================
   5. 카드 선택 시작
================================ */
goCardBtn.onclick = () => {
  transitionArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");
  initSpread();
};

resetBtn.onclick = () => location.reload();

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
   6. 확정 → 카드 앞면 공개
================================ */
confirmPick.onclick = () => {
  modal.classList.add("hidden");
  spread.classList.add("hidden");

  const deck = build78Deck();

  bigCards.forEach((card, i) => {
    const img = deck.splice(Math.floor(Math.random()*deck.length),1)[0];
    setTimeout(() => {
      card.style.backgroundImage = `url('${img}')`;
    }, i * 500);
  });
};

/* ===============================
   7. 78장 덱 생성 (중복 없음)
================================ */
function build78Deck() {
  const deck = [];

  MAJORS.forEach(f =>
    deck.push(`/assets/tarot/majors/${f}`)
  );

  SUITS.forEach(suit => {
    Object.keys(MINOR_NAMES).forEach(num => {
      deck.push(
        `/assets/tarot/minors/${suit}/${num}_${MINOR_NAMES[num]}.png`
      );
    });
  });

  return deck;
}
