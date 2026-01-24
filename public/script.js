const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const bigCards = document.querySelectorAll(".big-card");

let selected = [];
let deck = [...Array(78)].map((_, i) => i);

// 🔊 사운드
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
let soundOn = false;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  if (soundOn) bgm.play().catch(()=>{});
  else bgm.pause();
};

// 메시지
addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

// 카드 생성
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

btnGo.onclick = async () => {
  modal.classList.add("hidden");
  await reveal();
};

async function reveal() {
  document.querySelectorAll(".pick:not(.sel)")
    .forEach(p => p.classList.add("fade"));

  // 🔥 천천히 점화
  await wait(1200);

  bigCards.forEach(c => c.classList.add("burning"));
  await wait(2400);

  bigCards.forEach(c => c.classList.add("smoking"));
  await wait(3000);

  bigCards.forEach((c, i) => {
    const front = c.querySelector(".big-front");
    front.style.backgroundImage =
      `url('/assets/tarot/majors/${rand()}.png')`;
    front.style.display = "block";
  });

  spread.style.display = "none";
  addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
}

function rand() {
  const i = Math.floor(Math.random() * deck.length);
  return String(deck.splice(i, 1)[0]).padStart(2, "0");
}

// 채팅
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

const wait = ms => new Promise(r => setTimeout(r, ms));
