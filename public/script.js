const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const selectedArea = document.getElementById("selectedArea");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

/* 채팅 */
function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = `msg ${who}`;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

sendBtn.onclick = send;
input.onkeydown = e => e.key === "Enter" && send();
function send() {
  if (!input.value.trim()) return;
  addMsg(input.value, "user");
  input.value = "";
}

/* 카드 선택 */
let selected = [];

for (let i = 0; i < 78; i++) {
  const d = document.createElement("div");
  d.className = "pick";
  d.onclick = () => togglePick(d);
  grid.appendChild(d);
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

/* 이대로 진행 */
btnGo.onclick = () => {
  modal.classList.add("hidden");

  /* 🔒 스크롤 완전 차단 + 맨 위 */
  document.body.style.overflow = "hidden";
  window.scrollTo({ top: 0, behavior: "instant" });

  /* 스프레드 제거 */
  spread.style.display = "none";

  /* 선택 카드 재정렬 */
  selectedArea.innerHTML = "";
  selectedArea.classList.remove("hidden");

  selected.forEach(() => {
    const c = document.createElement("div");
    c.className = "selected-card";
    selectedArea.appendChild(c);
  });

  addMsg("좋아. 이제 이 카드들로 리딩을 시작할게.", "cat");
};
