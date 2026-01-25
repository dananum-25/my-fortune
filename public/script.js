/* ===============================
   1️⃣ 기본 DOM
================================ */
const soundBtn = document.getElementById("soundToggle");
const questionStep = document.getElementById("questionStep");
const tarotStage = document.getElementById("tarotStage");
const spreadSection = document.getElementById("spreadSection");
const grid78 = document.getElementById("grid78");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");

/* ===============================
   2️⃣ 사운드 (초기 뮤트)
================================ */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;
let muted = true;

soundBtn.onclick = () => {
  muted = !muted;
  soundBtn.textContent = muted ? "사운드 🔇" : "사운드 🔊";
  muted ? bgm.pause() : bgm.play().catch(()=>{});
};

/* ===============================
   3️⃣ 질문 선택
================================ */
document.querySelectorAll(".q-card").forEach(btn => {
  btn.onclick = () => {
    questionStep.classList.add("hidden");
    tarotStage.classList.remove("hidden");
    spreadSection.classList.remove("hidden");
    initSpread();
    addMsg("카드를 펼칠게. 마음이 가는 카드 3장을 골라줘.", "cat");
  };
});

/* ===============================
   4️⃣ 78장 스프레드 생성
================================ */
let selected = [];

function initSpread() {
  grid78.innerHTML = "";
  selected = [];

  for (let i = 0; i < 78; i++) {
    const d = document.createElement("div");
    d.className = "pick";
    d.onclick = () => togglePick(d);
    grid78.appendChild(d);
  }
}

function togglePick(el) {
  if (el.classList.contains("sel")) {
    el.classList.remove("sel");
    selected = selected.filter(x => x !== el);
    return;
  }
  if (selected.length >= 3) return;
  el.classList.add("sel");
  selected.push(el);
  if (selected.length === 3) modal.classList.remove("hidden");
}

/* ===============================
   5️⃣ 모달 진행
================================ */
btnGo.onclick = () => {
  modal.classList.add("hidden");
  prepareStage7();
};

/* ===============================
   6️⃣ 채팅
================================ */
function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = `msg ${who}`;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

/* ===============================
   7️⃣ 선택 후 재정렬 & 상태 고정
================================ */
function prepareStage7() {
  // 스프레드 제거
  spreadSection.classList.add("hidden");

  // 스크롤 고정
  document.body.style.overflow = "hidden";
  window.scrollTo(0, 0);

  addMsg("좋아. 이제 이 카드로 리딩을 시작할게.", "cat");
}
