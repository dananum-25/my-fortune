const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");

const bigCards = document.querySelectorAll(".big-card");
const bigFronts = document.querySelectorAll(".big-front");

let selected = [];
let deck = [...Array(78)].map((_, i) => i);

/* 🔊 사운드 */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
let soundOn = false;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundOn ? bgm.play().catch(()=>{}) : bgm.pause();
};

/* 💬 채팅 */
addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

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

/* 🃏 카드 생성 */
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

/* 🔮 리빌 */
btnGo.onclick = () => {
  modal.classList.add("hidden");
  reveal();
};

function reveal() {
  const targets = [...bigCards].map(c => c.getBoundingClientRect());

  selected.forEach((card, i) => {
    const from = card.getBoundingClientRect();
    const to = targets[i];

    const ghost = card.cloneNode(true);
    document.body.appendChild(ghost);

    Object.assign(ghost.style, {
      position: "fixed",
      left: from.left + "px",
      top: from.top + "px",
      width: from.width + "px",
      height: from.height + "px",
      zIndex: 9999,
      transition: "all .9s ease"
    });

    card.classList.add("fire");

    requestAnimationFrame(() => {
      ghost.style.left = to.left + "px";
      ghost.style.top = to.top + "px";
      ghost.style.transform = "scale(1.1)";
    });

    setTimeout(() => ghost.classList.add("smoke"), 600);
    setTimeout(() => ghost.remove(), 1200);
  });

  document.querySelectorAll(".pick:not(.sel)").forEach(p => p.remove());

  setTimeout(() => {
    selected.forEach((_, i) => {
      const idx = rand();
      bigFronts[i].style.backgroundImage =
        `url('/assets/tarot/majors/${idx}.png')`;
      bigCards[i].classList.add("flip");
    });
    spread.style.display = "none";
    addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
  }, 1200);
}

function rand() {
  const i = Math.floor(Math.random() * deck.length);
  return String(deck.splice(i, 1)[0]).padStart(2, "0");
}
