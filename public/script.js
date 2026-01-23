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

btnGo.onclick = async () => {
  modal.classList.add("hidden");
  await revealSequence();
};

/* 🔮 연출 시퀀스 */
async function revealSequence() {

  // ① 정적
  await wait(600);

  // ② 불씨 생성
  selected.forEach(c => c.classList.add("sel"));
  await wait(1800);

  const targets = [...bigCards].map(c => c.getBoundingClientRect());

  // ③ 느린 이동
  selected.forEach((card, i) => {
    const from = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    document.body.appendChild(ghost);

    Object.assign(ghost.style, {
      position: "fixed",
      left: from.left + "px",
      top: from.top + "px",
      width: from.width + "px",
      height: from.height + "px",
      zIndex: 9999,
      transition: "all 2.8s cubic-bezier(.22,1,.36,1)"
    });

    requestAnimationFrame(() => {
      ghost.style.left = targets[i].left + "px";
      ghost.style.top = targets[i].top + "px";
      ghost.style.transform = "scale(1.15)";
    });

    setTimeout(() => ghost.remove(), 3000);
  });

  // 미선택 카드 제거
  document.querySelectorAll(".pick:not(.sel)")
    .forEach(p => p.remove());

  // ④ 도착 후 정적
  await wait(400);

  // ⑤ 빅카드 점화
  bigCards.forEach(c => c.classList.add("ignite"));
  await wait(2600);

  // ⑥ 연기
  bigCards.forEach(c => c.classList.add("smoke"));
  await wait(1600);

  // ⑦ 침묵
  await wait(500);

  // ⑧ 카드 리빌
  selected.forEach((_, i) => {
    bigFronts[i].style.backgroundImage =
      `url('/assets/tarot/majors/${draw()}.png')`;
    bigCards[i].classList.add("flip");
  });

  spread.style.display = "none";
  addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
}

/* 카드 드로우 */
function draw() {
  const i = Math.floor(Math.random() * deck.length);
  return String(deck.splice(i, 1)[0]).padStart(2, "0");
}

/* 유틸 */
const wait = ms => new Promise(r => setTimeout(r, ms));

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
  d.className = "msg " + who;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
