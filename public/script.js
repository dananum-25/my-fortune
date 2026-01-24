const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const bigCards = document.querySelectorAll(".big-card");

/* 🔊 사운드 */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;
let soundOn = false;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  if (soundOn) bgm.play().catch(()=>{});
  else bgm.pause();
};

/* 채팅 */
function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = `msg ${who}`;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

sendBtn.onclick = send;
input.onkeydown = e => e.key === "Enter" && send();
function send() {
  if (!input.value.trim()) return;
  addMsg(input.value, "user");
  input.value = "";
}

addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

/* 카드 선택 */
let selected = [];
let revealDeck = [...Array(78)].map((_, i) => i);

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

btnGo.onclick = async () => {
  modal.classList.add("hidden");
  await ritual();
};

async function ritual() {
  /* 75장 제거 */
  document.querySelectorAll(".pick:not(.sel)").forEach(p => p.classList.add("fade"));
  await wait(800);

  /* 파이어볼 포물선 */
  const targets = [...bigCards].map(c => c.getBoundingClientRect());

  selected.forEach((card, i) => {
    const from = card.getBoundingClientRect();
    const to = targets[i];

    const fireball = document.createElement("div");
    fireball.className = "fireball";
    document.body.appendChild(fireball);

    const arc = -160;
    fireball.animate([
      { transform:`translate(${from.left}px, ${from.top}px)` },
      { transform:`translate(${(from.left+to.left)/2}px, ${from.top+arc}px)` },
      { transform:`translate(${to.left}px, ${to.top}px)` }
    ], { duration:4200, easing:"ease-in-out", fill:"forwards" });

    setTimeout(() => fireball.remove(), 4300);
  });

  await wait(4400);

  /* 점화 → 연기 */
  bigCards.forEach(c => c.classList.add("burning"));
  await wait(2800);
  bigCards.forEach(c => c.classList.add("smoking"));
  await wait(3400);

  /* 🔑 정리 */
  bigCards.forEach(c => c.classList.remove("burning","smoking"));
  await wait(600);

  /* 앞면 리빌 */
  bigCards.forEach((c, i) => {
    const front = c.querySelector(".big-front");
    front.style.backgroundImage =
      `url('/assets/tarot/majors/${drawReveal()}.png')`;
    front.style.display = "block";
  });

  spread.style.display = "none";
  addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
}

function drawReveal() {
  const i = Math.floor(Math.random() * revealDeck.length);
  return String(revealDeck.splice(i, 1)[0]).padStart(2, "0");
}

const wait = ms => new Promise(r => setTimeout(r, ms));
