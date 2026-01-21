/*************************************************
 * TAROT ENGINE v1.0  (STEP 2)
 * - 78장 완전 랜덤
 * - 상태 머신 기반
 * - UI 독립
 *************************************************/

/* =========================
   STATE MACHINE
========================= */
const STATE = {
  INIT: "INIT",
  PICKING: "PICKING",
  CONFIRM: "CONFIRM",
  TRANSITION: "TRANSITION",
  REVEAL: "REVEAL",
  CHAT: "CHAT",
};

let currentState = STATE.INIT;

function setState(next) {
  console.log(`STATE: ${currentState} → ${next}`);
  currentState = next;
}

/* =========================
   CARD DECK (78)
========================= */
function createDeck() {
  const deck = [];

  // majors 0~21
  for (let i = 0; i < 22; i++) {
    deck.push({
      type: "major",
      id: i,
      key: `major_${String(i).padStart(2, "0")}`,
    });
  }

  // minors
  const suits = ["cups", "wands", "swords", "pentacles"];
  suits.forEach((suit) => {
    for (let i = 1; i <= 14; i++) {
      deck.push({
        type: "minor",
        suit,
        id: i,
        key: `${suit}_${String(i).padStart(2, "0")}`,
      });
    }
  });

  return deck;
}

let deck = createDeck();

/* =========================
   SELECTION ENGINE
========================= */
let selectedIndexes = []; // 0~77 중 선택
let revealedCards = [];   // 실제 배정된 카드 객체

function resetSelection() {
  selectedIndexes = [];
  revealedCards = [];
  deck = createDeck();
  setState(STATE.PICKING);
}

function pickCard(index) {
  if (currentState !== STATE.PICKING) {
    console.warn("픽킹 상태 아님");
    return;
  }

  if (selectedIndexes.includes(index)) {
    // 선택 해제
    selectedIndexes = selectedIndexes.filter((i) => i !== index);
    console.log("선택 해제:", index);
    return;
  }

  if (selectedIndexes.length >= 3) {
    console.warn("이미 3장 선택됨");
    return;
  }

  selectedIndexes.push(index);
  console.log("선택:", index);

  if (selectedIndexes.length === 3) {
    setState(STATE.CONFIRM);
  }
}

/* =========================
   CONFIRM → ASSIGN
========================= */
function confirmSelection() {
  if (currentState !== STATE.CONFIRM) {
    console.warn("확정 단계 아님");
    return;
  }

  // 78장 중에서 완전 랜덤 3장 추출 (중복 없음)
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  revealedCards = shuffled.slice(0, 3);

  console.log("🔮 배정된 카드:", revealedCards);

  setState(STATE.TRANSITION);
}

/* =========================
   TRANSITION → REVEAL
========================= */
function finishTransition() {
  if (currentState !== STATE.TRANSITION) return;
  setState(STATE.REVEAL);
}

function revealDone() {
  if (currentState !== STATE.REVEAL) return;
  setState(STATE.CHAT);
}

/* =========================
   CHAT ENGINE (기본)
========================= */
let chatLog = [];

function addChat(role, text) {
  chatLog.push({
    role,
    text,
    time: new Date().toISOString(),
  });
  console.log(`[CHAT][${role}]`, text);
}

/* =========================
   INIT
========================= */
function initTarotEngine() {
  console.log("타로 엔진 초기화");
  setState(STATE.PICKING);
}

/* =========================
   DEBUG HELPERS
========================= */
window.TAROT_ENGINE = {
  STATE,
  initTarotEngine,
  pickCard,
  confirmSelection,
  finishTransition,
  revealDone,
  getState: () => currentState,
  getSelected: () => selectedIndexes,
  getRevealed: () => revealedCards,
  getChatLog: () => chatLog,
};
