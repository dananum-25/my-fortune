/* ===== DOM ===== */
const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const bigCards = [...document.querySelectorAll(".big-card")];

/* ===== 사운드 (BGM만) ===== */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;
let soundOn = false;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundOn ? bgm.play().catch(()=>{}) : bgm.pause();
};

/* ===== 채팅 ===== */
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

/* ===== 카드 데이터 ===== */
const MAJORS = [
  "00_the_fool.png","01_the_magician.png","02_the_high_priestess.png",
  "03_the_empress.png","04_the_emperor.png","05_the_hierophant.png",
  "06_the_lovers.png","07_the_chariot.png","08_strength.png",
  "09_the_hermit.png","10_wheel_of_fortune.png","11_justice.png",
  "12_the_hanged_man.png","13_death.png","14_temperance.png",
  "15_the_devil.png","16_the_tower.png","17_the_star.png",
  "18_the_moon.png","19_the_sun.png","20_judgement.png","21_the_world.png"
];

const MINOR_NAMES = {
  "01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six",
  "07":"seven","08":"eight","09":"nine","10":"ten",
  "11":"page","12":"knight","13":"queen","14":"king"
};
const SUITS = ["cups","wands","swords","pentacles"];

/* ===== 78장 생성 ===== */
let selected = [];
let fixedFrom = [];
let fixedTo = [];

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

  if (selected.length === 3) {
    // 🔒 좌표 고정 (여기서 단 한 번)
    fixedFrom = selected.map(c => c.getBoundingClientRect());
    fixedTo = bigCards.map(c => c.getBoundingClientRect());
    modal.classList.remove("hidden");
  }
}

btnGo.onclick = async () => {
  modal.classList.add("hidden");
  await ritual();
};

/* ===== 리추얼 ===== */
async function ritual() {
  // 75장 제거
  document.querySelectorAll(".pick:not(.sel)").forEach(p => p.classList.add("fade"));
  await wait(600);

  // 파이어볼
  fixedFrom.forEach((from, i) => {
    const to = fixedTo[i];
    const fire = document.createElement("div");
    fire.className = "fireball";
    document.body.appendChild(fire);

    fire.animate([
      { transform:`translate(${from.left}px, ${from.top}px)` },
      { transform:`translate(${(from.left+to.left)/2}px, ${from.top-180}px)` },
      { transform:`translate(${to.left}px, ${to.top}px)` }
    ], { duration:4200, easing:"ease-in-out", fill:"forwards" });

    setTimeout(()=>fire.remove(),4300);
  });

  await wait(4300);

  // 점화 → 연기
  bigCards.forEach(c => c.classList.add("burning"));
  await wait(3000);
  bigCards.forEach(c => c.classList.add("smoking"));
  await wait(3500);

  // 앞면 리빌
  bigCards.forEach(c => {
    const front = c.querySelector(".big-front");
    front.style.backgroundImage = `url('${draw78()}')`;
    front.style.display = "block";
  });

  spread.style.display = "none";
  addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
}

/* ===== 78장 랜덤 ===== */
function draw78() {
  if (Math.random() < (22/78)) {
    return `/assets/tarot/majors/${MAJORS.splice(Math.floor(Math.random()*MAJORS.length),1)[0]}`;
  } else {
    const suit = SUITS[Math.floor(Math.random()*4)];
    const num = String(Math.floor(Math.random()*14)+1).padStart(2,"0");
    return `/assets/tarot/minors/${suit}/${num}_${MINOR_NAMES[num]}.png`;
  }
}

const wait = ms => new Promise(r=>setTimeout(r,ms));
