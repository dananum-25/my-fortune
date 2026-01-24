const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const selectedStage = document.getElementById("selectedStage");
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
  soundOn ? bgm.play().catch(()=>{}) : bgm.pause();
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
  input.focus();
}

addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

/* 카드 생성 */
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

/* 확정 */
btnGo.onclick = async () => {
  modal.classList.add("hidden");

  /* 1️⃣ 스프레드 제거 */
  spread.remove();

  /* 2️⃣ 선택 카드 재배치 */
  selectedStage.classList.remove("hidden");
  selected.forEach(c => selectedStage.appendChild(c));

  await wait(800);

  /* 3️⃣ 점화 → 파이어볼 */
  const targets = [...bigCards].map(c => c.getBoundingClientRect());

  selected.forEach((card, i) => {
    const from = card.getBoundingClientRect();
    const to = targets[i];

    const fireball = document.createElement("div");
    fireball.className = "fireball";
    document.body.appendChild(fireball);

    fireball.animate([
      { transform:`translate(${from.left}px, ${from.top}px)` },
      { transform:`translate(${(from.left+to.left)/2}px, ${from.top-160}px)` },
      { transform:`translate(${to.left}px, ${to.top}px)` }
    ], { duration:5200, easing:"ease-in-out", fill:"forwards" });

    setTimeout(() => fireball.remove(), 5300);
  });

  await wait(5400);

  /* 4️⃣ 빅카드 점화 */
  bigCards.forEach(c => c.classList.add("burning"));
  await wait(3000);
  bigCards.forEach(c => c.classList.add("smoking"));
  await wait(3600);

  /* 5️⃣ 앞면 리빌 */
  bigCards.forEach((c) => {
    const front = c.querySelector(".big-front");
    front.style.backgroundImage =
      `url('/assets/tarot/majors/${drawReveal()}.png')`;
    front.style.display = "block";
  });

  addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
  input.focus();
};

function drawReveal() {
  const i = Math.floor(Math.random() * revealDeck.length);
  return String(revealDeck.splice(i, 1)[0]).padStart(2, "0");
}

const wait = ms => new Promise(r => setTimeout(r, ms));
