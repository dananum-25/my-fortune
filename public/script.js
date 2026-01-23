const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const bigCards = document.querySelectorAll(".big-card");
const stage = document.getElementById("stage");

let selected = [];
let deck = [...Array(78)].map((_, i) => i);

/* 🔊 사운드 */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;
let soundOn = false;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundOn ? bgm.play().catch(()=>{}) : bgm.pause();
};

/* 초기 메시지 */
addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

/* 카드 생성 */
deck.forEach(() => {
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
  startAnimation();
};

function startAnimation() {
  if (soundOn) bgm.play().catch(()=>{});

  spread.querySelectorAll(".pick:not(.sel)")
    .forEach(p => p.classList.add("fade"));

  const stageRect = stage.getBoundingClientRect();

  const flyingCards = selected.map(card => {
    const r = card.getBoundingClientRect();
    const fc = document.createElement("div");
    fc.className = "flying-card";
    fc.style.left = (r.left - stageRect.left) + "px";
    fc.style.top  = (r.top  - stageRect.top)  + "px";
    stage.appendChild(fc);
    return fc;
  });

  flyingCards.forEach((fc, i) => {
    const tr = bigCards[i].getBoundingClientRect();
    setTimeout(() => {
      fc.style.left = (tr.left - stageRect.left) + "px";
      fc.style.top  = (tr.top  - stageRect.top)  + "px";
      fc.style.transform = "scale(1.2)";
    }, 300 + i * 200);
  });

  setTimeout(() => {
    flyingCards.forEach(fc => fc.remove());

    selected.forEach((_, i) => {
      bigCards[i].style.backgroundImage =
        `url('/assets/tarot/majors/${rand()}.png')`;
    });

    /* 🔒 spread는 레이아웃에서 제거 */
    spread.style.position = "absolute";
    spread.style.height = "0";
    spread.style.overflow = "hidden";

    addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
  }, 1600);
}

function rand() {
  const i = Math.floor(Math.random() * deck.length);
  return String(deck.splice(i, 1)[0]).padStart(2, "0");
}

/* 채팅 */
sendBtn.onclick = send;
input.onkeydown = e => e.key === "Enter" && send();

function send() {
  if (!input.value.trim()) return;
  addMsg(input.value, "user");
  input.value = "";
}

function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = `msg ${who}`;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
