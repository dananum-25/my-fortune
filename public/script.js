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

// 🔊 사운드
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
let soundOn = false;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundOn ? bgm.play().catch(()=>{}) : bgm.pause();
};

// 초기 메시지
addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

// 78장 생성
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
  reveal();
};

function reveal() {
  const targets = [...bigCards].map(c => c.getBoundingClientRect());

  document.querySelectorAll(".pick:not(.sel)").forEach(p => p.classList.add("fade"));

  selected.forEach((card, i) => {
    const r = card.getBoundingClientRect();
    const clone = card.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = r.left + "px";
    clone.style.top = r.top + "px";
    clone.style.width = r.width + "px";
    clone.style.height = r.height + "px";
    clone.style.zIndex = 999;
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.transition = "all .7s ease";
      clone.style.left = targets[i].left + "px";
      clone.style.top = targets[i].top + "px";
      clone.style.transform = "scale(1.1)";
    });

    setTimeout(() => {
      document.body.removeChild(clone);
      bigFronts[i].style.backgroundImage =
        `url('/assets/tarot/majors/${draw()}.png')`;
    }, 800);
  });

  setTimeout(() => {
    spread.style.display = "none";
    addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
  }, 1200);
}

function draw() {
  const i = Math.floor(Math.random() * deck.length);
  return String(deck.splice(i, 1)[0]).padStart(2, "0");
}

// 💬 채팅
sendBtn.onclick = send;
input.onkeydown = e => e.key === "Enter" && send();

function send() {
  if (!input.value.trim()) return;
  addMsg(input.value, "user");
  input.value = "";
}

function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = "msg " + who;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
