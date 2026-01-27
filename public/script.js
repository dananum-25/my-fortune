// ============================
// 1) CONFIG
// ============================
const ASSETS = {
  back: "/assets/tarot/back.png",
  // front cards will be resolved later: /assets/tarot/front/{id}.png (placeholder)
};

const SOUND = {
  ambient: "/sounds/tarot/ambient_entry.mp3",
  pick: "/sounds/tarot/pick.mp3",
  card_pick: "/sounds/tarot/card_pick.mp3",
  spread_open: "/sounds/tarot/spread_open.mp3",
  reveal: "/sounds/tarot/reveal.mp3",
  tarot_reveal: "/sounds/tarot/tarot_reveal.mp3",
  fire: "/sounds/tarot/fire.mp3",
  session_end: "/sounds/tarot/session_end.mp3",
};

// ============================
// 2) STATE
// ============================
let soundOn = false;
let ambientAudio = null;

let stage = 1; // 1: 질문, 2: 스프레드 선택, 3: 모달, 4: 리딩
let selected = []; // store picked card indices

// ============================
// 3) DOM
// ============================
const elQna = document.getElementById("qna");
const elSpreadSection = document.getElementById("spreadSection");
const elSpread = document.getElementById("spread");
const elModal = document.getElementById("modal");
const elResetBtn = document.getElementById("resetBtn");
const elConfirmBtn = document.getElementById("confirmBtn");

const elSelectedSection = document.getElementById("selectedSection");
const elSelectedRow = document.getElementById("selectedRow");
const elBigCardSection = document.getElementById("bigCardSection");
const elBigCard = document.getElementById("bigCard");
const elReadingBox = document.getElementById("readingBox");

const elSoundToggle = document.getElementById("soundToggle");

// ============================
// 4) SOUND HELPERS
// ============================
function playOnce(src, vol = 0.9) {
  if (!soundOn) return;
  const a = new Audio(src);
  a.volume = vol;
  a.play().catch(() => {});
}

function setAmbient(on) {
  if (!ambientAudio) {
    ambientAudio = new Audio(SOUND.ambient);
    ambientAudio.loop = true;
    ambientAudio.volume = 0.5;
  }
  if (on) {
    ambientAudio.play().catch(() => {});
  } else {
    try { ambientAudio.pause(); } catch(e){}
  }
}

// ============================
// 5) QUESTIONS (3-stage narrowing) - already implemented in your base
// ============================
const FLOW = {
  step1: {
    title: "어떤 주제에 대한 상담일까?",
    options: [
      { key: "love", label: "연애 · 관계" },
      { key: "career", label: "직업 · 진로" },
      { key: "money", label: "금전 · 현실" },
      { key: "self", label: "나 자신 · 마음" },
    ],
  },
  step2: {
    love: {
      title: "관계 중에서도 어떤 흐름이 가장 궁금해?",
      options: [
        { key: "reconnect", label: "상대의 마음 / 다시 이어질까" },
        { key: "conflict", label: "갈등 / 오해 / 거리감" },
        { key: "future", label: "앞으로의 관계 방향" },
        { key: "choice", label: "계속 갈지 / 멈출지 결정" },
      ],
    },
    career: {
      title: "일/진로는 어떤 고민이야?",
      options: [
        { key: "change", label: "이직/전직/커리어 전환" },
        { key: "growth", label: "성과/평가/승진" },
        { key: "worklife", label: "번아웃/스트레스/균형" },
        { key: "choice", label: "결정(해야 하는 선택)" },
      ],
    },
    money: {
      title: "금전/현실은 어디에 초점이 있어?",
      options: [
        { key: "income", label: "수입/매출/기회" },
        { key: "debt", label: "지출/부채/정리" },
        { key: "investment", label: "투자/리스크/판단" },
        { key: "plan", label: "현실 계획/우선순위" },
      ],
    },
    self: {
      title: "나 자신/마음은 어떤 상태야?",
      options: [
        { key: "emotion", label: "감정 기복/불안" },
        { key: "confidence", label: "자존감/확신" },
        { key: "healing", label: "회복/치유/휴식" },
        { key: "direction", label: "방향/의미/정체성" },
      ],
    },
  },
  step3: {
    title: "가장 가까운 질문을 고르면, 카드가 더 정확해져.",
    options: [
      { key: "what", label: "지금 이 상황의 본질은?" },
      { key: "why", label: "왜 반복될까 / 원인은?" },
      { key: "how", label: "어떻게 풀어가면 좋을까?" },
      { key: "timing", label: "언제쯤 변화가 올까?" },
      { key: "action", label: "지금 당장 할 1가지 행동은?" },
      { key: "outcome", label: "이대로 가면 결과는?" },
    ],
  },
};

let selectedTopic = null;
let selectedDetail = null;
let selectedQuestionType = null;

function renderStep1() {
  elQna.innerHTML = "";
  const card = makeQCard(FLOW.step1.title, FLOW.step1.options, (opt) => {
    selectedTopic = opt.key;
    playOnce(SOUND.spread_open, 0.8);
    renderStep2(selectedTopic);
  });
  elQna.appendChild(card);
}

function renderStep2(topicKey) {
  elQna.innerHTML = "";
  const data = FLOW.step2[topicKey];
  const card = makeQCard(data.title, data.options, (opt) => {
    selectedDetail = opt.key;
    playOnce(SOUND.spread_open, 0.8);
    renderStep3();
  });
  elQna.appendChild(card);
}

function renderStep3() {
  elQna.innerHTML = "";
  const card = makeQCard(FLOW.step3.title, FLOW.step3.options, (opt) => {
    selectedQuestionType = opt.key;
    playOnce(SOUND.spread_open, 0.8);
    // now move to spread
    stage = 2;
    document.getElementById("spreadTitle").textContent =
      "좋아. 이제 준비가 됐어. 마음이 가는 카드 3장을 골라줘 🐾";
    ensureSpread();
    window.scrollTo({ top: elSpreadSection.offsetTop - 8, behavior: "smooth" });
  });
  elQna.appendChild(card);
}

function makeQCard(title, options, onPick) {
  const wrap = document.createElement("div");
  wrap.className = "q-card";
  const h = document.createElement("h2");
  h.className = "q-title";
  h.textContent = title;
  wrap.appendChild(h);

  const grid = document.createElement("div");
  grid.className = "q-grid";

  options.forEach((o) => {
    const btn = document.createElement("button");
    btn.className = "q-option";
    btn.type = "button";
    btn.textContent = o.label;
    btn.addEventListener("click", () => onPick(o));
    grid.appendChild(btn);
  });

  wrap.appendChild(grid);
  return wrap;
}

// ============================
// 6) SPREAD (78 placeholders)
// ============================
function ensureSpread() {
  if (elSpread.childElementCount > 0) return;

  for (let i = 0; i < 78; i++) {
    const card = document.createElement("button");
    card.className = "tarot-card";
    card.type = "button";
    card.dataset.idx = String(i);

    const img = document.createElement("img");
    img.src = ASSETS.back;
    img.alt = "tarot back";
    img.loading = "lazy";

    card.appendChild(img);
    card.addEventListener("click", onPickCard);
    elSpread.appendChild(card);
  }
}

function onPickCard(e) {
  if (stage !== 2) return;
  const btn = e.currentTarget;
  const idx = Number(btn.dataset.idx);

  if (selected.includes(idx)) return;
  if (selected.length >= 3) return;

  selected.push(idx);
  btn.classList.add("picked");

  playOnce(SOUND.card_pick, 0.9);

  if (selected.length === 3) {
    stage = 3;
    openModal();
  }
}

// ============================
// 7) MODAL
// ============================
function openModal() {
  elModal.classList.remove("hidden");
  playOnce(SOUND.reveal, 0.8);
}

function closeModal() {
  elModal.classList.add("hidden");
}

elResetBtn.addEventListener("click", () => {
  // reset spread selection
  selected = [];
  stage = 2;
  closeModal();
  [...elSpread.querySelectorAll(".tarot-card.picked")].forEach((c) => c.classList.remove("picked"));
});

elConfirmBtn.addEventListener("click", () => {
  closeModal();
  stage = 4;
  // For this base: show placeholder selected area + reading start
  showSelectedAndReadingStart();
});

// ============================
// 8) READING START (placeholder visuals)
// ============================
function showSelectedAndReadingStart() {
  // Hide spread section title but keep spread (base behavior)
  elSelectedSection.classList.remove("hidden");
  elSelectedRow.innerHTML = "";

  // create 3 selected "glow" placeholders
  for (let i = 0; i < 3; i++) {
    const div = document.createElement("div");
    div.className = "selected-glow";
    elSelectedRow.appendChild(div);
  }

  playOnce(SOUND.tarot_reveal, 0.9);

  // Big card placeholder
  elBigCardSection.classList.remove("hidden");
  elBigCard.src = ASSETS.back;
  elReadingBox.textContent = "다음 단계에서 카드 연출 시작";
  window.scrollTo({ top: elSelectedSection.offsetTop - 8, behavior: "smooth" });
}

// ============================
// 9) SOUND TOGGLE
// ============================
function setSoundUI() {
  elSoundToggle.classList.toggle("on", soundOn);
  elSoundToggle.textContent = soundOn ? "Sound 🔊" : "Sound 🔇";
}

elSoundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  setSoundUI();
  setAmbient(soundOn);
  if (soundOn) playOnce(SOUND.pick, 0.9);
});

// ============================
// 10) INIT
// ============================
function init() {
  soundOn = false; // start muted
  setSoundUI();
  setAmbient(false);

  renderStep1();
  ensureSpread(); // keep spread ready (base)
}
init();
