const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const grid = document.getElementById("grid78");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const btnKeep = document.getElementById("btnKeep");
const soundBtn = document.getElementById("soundToggle");

let muted = true;
let selected = [];

const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;

soundBtn.onclick = () => {
  muted = !muted;
  soundBtn.textContent = muted ? "🔇" : "🔊";
  muted ? bgm.pause() : bgm.play().catch(()=>{});
};

function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = `msg ${who}`;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

addMsg("안녕 🐾 마음이 가는 카드 3장을 골라줘.", "cat");

// 78장 생성
for (let i = 0; i < 78; i++) {
  const c = document.createElement("div");
  c.className = "pick";
  c.onclick = () => {
    if (c.classList.contains("sel")) {
      c.classList.remove("sel");
      selected = selected.filter(x => x !== c);
      enableAll();
      return;
    }
    if (selected.length >= 3) return;
    c.classList.add("sel");
    selected.push(c);
    if (selected.length === 3) {
      disableOthers();
      modal.classList.remove("hidden");
    }
  };
  grid.appendChild(c);
}

function disableOthers() {
  document.querySelectorAll(".pick").forEach(p => {
    if (!p.classList.contains("sel")) p.classList.add("dis");
  });
}
function enableAll() {
  document.querySelectorAll(".pick").forEach(p => p.classList.remove("dis"));
}

btnKeep.onclick = () => {
  modal.classList.add("hidden");
  enableAll();
};

btnGo.onclick = async () => {
  modal.classList.add("hidden");
  await reveal();
};

async function reveal() {
  const backs = document.querySelectorAll(".big-back");
  for (let i = 0; i < 3; i++) {
    backs[i].style.animation = "pulse 0.8s";
    await wait(800);
    backs[i].style.backgroundImage =
      "url('/assets/tarot/majors/00_the_fool.png')";
  }
  addMsg("카드를 보고 가장 먼저 느껴지는 감정을 말해줘.", "cat");
}

sendBtn.onclick = () => {
  if (!input.value.trim()) return;
  addMsg(input.value, "user");
  input.value = "";
};

const wait = ms => new Promise(r => setTimeout(r, ms));
