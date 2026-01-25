/* =========================
   ELEMENTS
========================= */
const grid = document.getElementById("grid78");
const spreadSection = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const bigCards = document.querySelectorAll(".big-card");
const soundBtn = document.getElementById("soundToggle");

const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

/* =========================
   CHAT (복구)
========================= */
function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = `msg ${who}`;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

function send() {
  if (!input.value.trim()) return;
  addMsg(input.value, "user");
  input.value = "";
}

sendBtn.onclick = send;
input.addEventListener("keydown", e => {
  if (e.key === "Enter") send();
});

addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

/* =========================
   SOUND
========================= */
let soundEnabled = false;
let unlocked = false;

const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.2;

function unlockSound() {
  if (unlocked) return;
  const s = new Audio("data:audio/mp3;base64,//uQxAAAA");
  s.play().catch(()=>{});
  unlocked = true;
}

soundBtn.onclick = () => {
  unlockSound();
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
  soundEnabled ? bgm.play().catch(()=>{}) : bgm.pause();
};

document.addEventListener("pointerdown", unlockSound, { once:true });

/* =========================
   CARD TABLE
========================= */
const MAJORS = [
  "00_the_fool.png","01_the_magician.png","02_the_high_priestess.png",
  "03_the_empress.png","04_the_emperor.png","05_the_hierophant.png",
  "06_the_lovers.png","07_the_chariot.png","08_strength.png",
  "09_the_hermit.png","10_wheel_of_fortune.png","11_justice.png",
  "12_the_hanged_man.png","13_death.png","14_temperance.png",
  "15_the_devil.png","16_the_tower.png","17_the_star.png",
  "18_the_moon.png","19_the_sun.png","20_judgement.png","21_the_world.png"
];

const SUITS = ["cups","wands","swords","pentacles"];
const MINORS = ["01_ace","02_two","03_three","04_four","05_five","06_six",
  "07_seven","08_eight","09_nine","10_ten","11_page","12_knight","13_queen","14_king"];

function draw78() {
  if (Math.random() < 22/78 && MAJORS.length) {
    return `/assets/tarot/majors/${MAJORS.splice(Math.floor(Math.random()*MAJORS.length),1)[0]}`;
  }
  const suit = SUITS[Math.floor(Math.random()*4)];
  const card = MINORS.splice(Math.floor(Math.random()*MINORS.length),1)[0];
  return `/assets/tarot/minors/${suit}/${card}.png`;
}

/* =========================
   SPREAD
========================= */
let selected = [];

for (let i=0;i<78;i++) {
  const d = document.createElement("div");
  d.className = "pick";
  d.onclick = () => {
    if (selected.includes(d)) return;
    if (selected.length >= 3) return;
    d.classList.add("sel");
    selected.push(d);
    if (selected.length === 3) modal.classList.remove("hidden");
  };
  grid.appendChild(d);
}

btnGo.onclick = async () => {
  modal.classList.add("hidden");

  // 75장 제거
  document.querySelectorAll(".pick:not(.sel)").forEach(p => p.classList.add("fade"));
  await wait(600);

  // 🔥 선택 카드 → 파이어볼
  selected.forEach((card, i) => {
    const from = card.getBoundingClientRect();
    const to = bigCards[i].getBoundingClientRect();

    const fb = document.createElement("div");
    fb.className = "fireball";
    document.body.appendChild(fb);

    fb.style.left = from.left + from.width/2 - 22 + "px";
    fb.style.top  = from.top  + from.height/2 - 22 + "px";

    fb.animate([
      { transform:"translate(0,0)" },
      { transform:`translate(${(to.left-from.left)}px,${(to.top-from.top)}px)` }
    ],{
      duration:2600,
      easing:"cubic-bezier(.3,.7,.4,1)",
      fill:"forwards"
    });

    setTimeout(()=>fb.remove(),2700);
  });

  await wait(2800);

  // 스프레드 완전 제거
  spreadSection.style.display = "none";

  // 카드 리빌
  bigCards.forEach((c,i)=>{
    const f = c.querySelector(".front");
    f.style.backgroundImage = `url('${draw78()}')`;
    f.style.display = "block";
  });

  addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
};

const wait = ms => new Promise(r=>setTimeout(r,ms));
