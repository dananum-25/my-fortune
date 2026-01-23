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

/* 사운드 */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
let soundOn = false;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundOn ? bgm.play().catch(()=>{}) : bgm.pause();
};

/* 초기 멘트 */
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
  await ritualSequence();
};

async function ritualSequence() {

  await wait(600);        // ① 정적
  await wait(1800);       // ② 불씨 여운

  const targets = [...bigCards].map(c => c.getBoundingClientRect());

  selected.forEach((card, i) => {
    const from = card.getBoundingClientRect();
    const to = targets[i];

    const fireball = document.createElement("div");
    fireball.className = "fireball";
    fireball.style.left = from.left + from.width/2 + "px";
    fireball.style.top = from.top + from.height/2 + "px";
    document.body.appendChild(fireball);

    fireball.animate([
      { transform: "translate(0,0) scale(1)" },
      {
        transform:
          `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(1.3)`
      }
    ], {
      duration: 2800,
      easing: "cubic-bezier(.22,1,.36,1)",
      fill: "forwards"
    });

    setTimeout(() => fireball.remove(), 3000);
  });

  document.querySelectorAll(".pick:not(.sel)").forEach(p => p.remove());

  await wait(400);        // ④ 도착 정적

  bigCards.forEach(c => c.classList.add("burning"));
  await wait(2600);       // ⑤ 활활

  bigCards.forEach(c => c.classList.add("smoking"));
  await wait(1600);       // ⑥ 연기

  await wait(500);        // ⑦ 침묵

  selected.forEach((_, i) => {
    bigFronts[i].style.display = "block";
    bigFronts[i].style.backgroundImage =
      `url('/assets/tarot/majors/${draw()}.png')`;
  });

  spread.style.display = "none";
  addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
}

function draw() {
  const i = Math.floor(Math.random() * deck.length);
  return String(deck.splice(i, 1)[0]).padStart(2, "0");
}

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
