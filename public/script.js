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
bgm.volume = 0.15;
let soundOn = false;
let soundUnlocked = false;

soundBtn.onclick = () => {
  if (!soundUnlocked) {
    bgm.load();
    soundUnlocked = true;
  }
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  if (soundOn) bgm.play().catch(()=>{});
  else bgm.pause();
};

// 빅카드 초기화 보장
bigCards.forEach(card => {
  card.style.backgroundImage = "url('/assets/tarot/back.png')";
});

// 초기 메시지
addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

// 카드 생성 (78장)
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
  // 🔥 중요 수정: 스프레드 내부 카드만 fade
  spread.querySelectorAll(".pick:not(.sel)")
    .forEach(p => p.classList.add("fade"));

  // 선택된 3장은 유지
  selected.forEach((_, i) => {
    setTimeout(() => {
      bigCards[i].style.backgroundImage =
        `url('/assets/tarot/majors/${rand()}.png')`;
    }, 800 + i * 300);
  });

  // 스프레드 영역 제거
  setTimeout(() => {
    spread.style.display = "none";
    addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
  }, 1500);
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
