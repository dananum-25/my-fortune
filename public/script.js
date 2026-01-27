/* =================================================
   0. 사운드 관리 (지정된 mp3만 사용)
================================================= */
const SFX = {
  ambient: new Audio("/sounds/tarot/ambient_entry.mp3"),
  pick: new Audio("/sounds/tarot/pick.mp3"),
  fire: new Audio("/sounds/tarot/fire.mp3"),
  reveal: new Audio("/sounds/tarot/reveal.mp3"),
  tarotReveal: new Audio("/sounds/tarot/tarot_reveal.mp3")
};

SFX.ambient.loop = true;
SFX.ambient.volume = 0.15;

let muted = true;

document.getElementById("soundToggle").onclick = () => {
  muted = !muted;
  document.getElementById("soundToggle").textContent =
    muted ? "사운드 🔇" : "사운드 🔊";

  muted ? SFX.ambient.pause() : SFX.ambient.play().catch(()=>{});
};

function play(name) {
  if (muted || !SFX[name]) return;
  const a = SFX[name].cloneNode();
  a.volume = 0.6;
  a.play().catch(()=>{});
}

/* =================================================
   1. 질문 3단계 (BASE 유지)
================================================= */
const QUESTIONS = [
  {
    text: "어떤 분야의 고민인가요?",
    options: ["연애", "직장/일", "금전", "관계"]
  },
  {
    text: "이 고민은 언제쯤의 이야기인가요?",
    options: ["과거", "현재", "미래"]
  },
  {
    text: "지금 가장 알고 싶은 것은?",
    options: ["방향성", "조언", "상대의 마음", "결과"]
  }
];

let step = 0;
const questionArea = document.getElementById("questionArea");
const transitionArea = document.getElementById("transitionArea");
const catText = document.getElementById("catText");

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
  play("pick");

  if (step < QUESTIONS.length) {
    renderQuestion();
  } else {
    questionArea.classList.add("hidden");
    transitionArea.classList.remove("hidden");
    catText.textContent =
      "좋아. 이제 마음을 가볍게 하고 카드를 골라보자.";
  }
}

renderQuestion();

/* =================================================
   2. 카드 선택 BASE
================================================= */
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
  play("ambient");
  initSpread();
};

resetBtn.onclick = () => location.reload();

function initSpread() {
  grid.innerHTML = "";
  selected = [];

  for (let i = 0; i < 78; i++) {
    const d = document.createElement("div");
    d.className = "pick";
    d.dataset.card = TAROT_DECK[i]; // 🔒 카드 이름 직접 매핑
    d.onclick = () => togglePick(d);
    grid.appendChild(d);
  }
}

function togglePick(card) {
  if (card.classList.contains("sel")) return;
  if (selected.length >= 3) return;

  card.classList.add("sel");
  selected.push(card);
  play("pick");

  if (selected.length === 3) {
    setTimeout(() => modal.classList.remove("hidden"), 600);
  }
}

/* =================================================
   3. 🔒 카드 이름 DB (직접 지정)
================================================= */
const TAROT_DECK = [
  "The Fool","The Magician","The High Priestess","The Empress","The Emperor",
  "The Hierophant","The Lovers","The Chariot","Strength","The Hermit",
  "Wheel of Fortune","Justice","The Hanged Man","Death","Temperance",
  "The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World",
  // (마이너 생략 없이 실제론 78장 모두 채워야 함)
  ...Array.from({length:56},(_,i)=>`Minor-${i+1}`)
];

/* =================================================
   4. C 단계 – 초단위 연출 시퀀스 (핵심)
================================================= */
confirmPick.onclick = () => {
  modal.classList.add("hidden");
  catText.textContent =
    "이제 카드들이 스스로 자리를 찾아갑니다.";

  play("fire");

  /* C-1 (1.5초) : 75장 제거 */
  setTimeout(() => {
    document.querySelectorAll(".pick:not(.sel)").forEach(p => {
      p.style.transition = "opacity 1.5s";
      p.style.opacity = 0;
      setTimeout(() => p.remove(), 1500);
    });
  }, 1000);

  /* C-2 (3초) : 선택된 3장 중앙 재정렬 */
  setTimeout(() => {
    const rects = selected.map(c => c.getBoundingClientRect());
    const centerX = window.innerWidth / 2;

    selected.forEach((card, i) => {
      card.style.position = "fixed";
      card.style.zIndex = 999;
      card.style.transition = "all 2.5s ease-in-out";
      card.style.left =
        centerX - 60 + (i - 1) * 130 + "px";
      card.style.top = "45%";
    });
  }, 3000);

  /* C-3 (3초) : 파이어볼 → 빅카드 */
  setTimeout(() => {
    selected.forEach(card => {
      card.style.transition = "transform 2.8s ease-in, opacity 2.8s";
      card.style.transform = "translateY(-180px) scale(1.2)";
      card.style.opacity = 0;
    });
  }, 6500);

  /* C-4 (2초) : 빅카드 점화 */
  setTimeout(() => {
    document.querySelectorAll(".big-card").forEach(b => {
      b.classList.add("ignite");
    });
    play("tarotReveal");
  }, 9000);

  /* C-5 (3초) : 앞면 공개 */
  setTimeout(() => {
    document.querySelectorAll(".big-card").forEach((b,i) => {
      b.style.backgroundImage =
        `url("/assets/tarot/front/${selected[i].dataset.card}.png")`;
    });
    play("reveal");
    catText.textContent =
      "이제 하나씩, 카드를 읽어볼게요.";
  }, 12000);
};
