const grid = document.getElementById("grid78");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const spread = document.getElementById("spreadSection");
const bigCards = document.querySelectorAll(".big-card");
const chat = document.getElementById("chatContainer");

let selected = [];
let deck = [...Array(78)].map((_, i) => i);

// 초기 메시지
addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

// 78장 생성
deck.forEach(i => {
  const d = document.createElement("div");
  d.className = "pick";
  d.onclick = () => togglePick(d);
  grid.appendChild(d);
});

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

btnGo.onclick = () => {
  modal.classList.add("hidden");
  startReveal();
};

function startReveal() {
  // 미선택 카드 제거
  document.querySelectorAll(".pick:not(.sel)")
    .forEach(p => p.classList.add("fadeout"));

  // 선택 카드 → 빅카드로 이동
  selected.forEach((card, i) => {
    const big = bigCards[i];
    big.classList.add("ignite");
    setTimeout(() => {
      big.style.backgroundImage =
        `url('/assets/tarot/majors/${randomCard()}.png')`;
    }, 900);
  });

  // 스프레드 제거
  setTimeout(() => {
    spread.style.display = "none";
    addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
  }, 1200);
}

function randomCard() {
  const idx = Math.floor(Math.random() * deck.length);
  return String(deck.splice(idx,1)[0]).padStart(2,"0");
}

function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = `msg ${who}`;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
