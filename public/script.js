/*************************************************
 * TAROT ENGINE v1.1  (STEP 3)
 * - STEP2 엔진 유지
 * - UI(DOM) 연결
 *************************************************/

/* ===== STATE ===== */
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

/* ===== DECK ===== */
function createDeck() {
  const deck = [];
  for (let i = 0; i < 22; i++) {
    deck.push({ type: "major", id: i });
  }
  const suits = ["cups", "wands", "swords", "pentacles"];
  suits.forEach(suit => {
    for (let i = 1; i <= 14; i++) {
      deck.push({ type: "minor", suit, id: i });
    }
  });
  return deck;
}
let deck = createDeck();

/* ===== SELECTION ===== */
let selectedIndexes = [];
let revealedCards = [];

/* ===== DOM ===== */
const grid = document.getElementById("grid78");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const btnKeep = document.getElementById("btnKeep");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

/* ===== CHAT ===== */
function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = `msg ${who}`;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

/* ===== INIT ===== */
function init() {
  setState(STATE.PICKING);
  addMsg("안녕 🐾 마음이 가는 카드 3장을 골라줘.", "cat");

  // 78장 생성
  for (let i = 0; i < 78; i++) {
    const c = document.createElement("div");
    c.className = "pick";
    c.dataset.index = i;
    c.onclick = () => pickCard(i, c);
    grid.appendChild(c);
  }
}

/* ===== PICK ===== */
function pickCard(index, el) {
  if (currentState !== STATE.PICKING) return;

  if (selectedIndexes.includes(index)) {
    selectedIndexes = selectedIndexes.filter(i => i !== index);
    el.classList.remove("sel");
    return;
  }

  if (selectedIndexes.length >= 3) return;

  selectedIndexes.push(index);
  el.classList.add("sel");

  if (selectedIndexes.length === 3) {
    setState(STATE.CONFIRM);
    modal.classList.remove("hidden");
  }
}

/* ===== CONFIRM ===== */
btnKeep.onclick = () => {
  modal.classList.add("hidden");
  setState(STATE.PICKING);
};

btnGo.onclick = () => {
  modal.classList.add("hidden");
  confirmSelection();
};

function confirmSelection() {
  if (currentState !== STATE.CONFIRM) return;

  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  revealedCards = shuffled.slice(0, 3);

  console.log("🔮 배정된 카드:", revealedCards);
  setState(STATE.REVEAL);

  addMsg("좋아. 이제 이 카드들이 전하는 메시지를 볼게.", "cat");
}

/* ===== CHAT INPUT ===== */
sendBtn.onclick = () => {
  if (!input.value.trim()) return;
  addMsg(input.value, "user");
  input.value = "";
};

/* ===== START ===== */
init();
