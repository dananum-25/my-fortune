/* =========================
   기본 DOM
========================= */
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

/* =========================
   사운드
========================= */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;
let soundOn = false;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundOn ? bgm.play().catch(()=>{}) : bgm.pause();
};

/* =========================
   채팅
========================= */
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

/* =========================
   카드 데이터
========================= */

/* ✅ 실제 majors 파일명 */
const MAJORS = [
  "00_the_fool","01_the_magician","02_the_high_priestess","03_the_empress",
  "04_the_emperor","05_the_hierophant","06_the_lovers","07_the_chariot",
  "08_strength","09_the_hermit","10_wheel_of_fortune","11_justice",
  "12_the_hanged_man","13_death","14_temperance","15_the_devil",
  "16_the_tower","17_the_star","18_the_moon","19_the_sun",
  "20_judgement","21_the_world"
];

/* =========================
   카드 생성
========================= */
let selected = [];

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

/* =========================
   메인 의식
========================= */
btnGo.onclick = async () => {
  modal.classList.add("hidden");

  /* 1️⃣ 선택 카드 하단 배치 */
  selectedStage.classList.remove("hidden");
  selected.forEach(c => selectedStage.appendChild(c));

  await wait(600);

  /* 2️⃣ 선택 카드 위치 고정 */
  const fromRects = selected.map(c => c.getBoundingClientRect());
  const toRects = [...bigCards].map(c => c.getBoundingClientRect());

  /* 3️⃣ 스프레드 제거 */
  spread.remove();

  /* 4️⃣ 카드 → 파이어볼 */
  selected.forEach((card, i) => {
    const fireball = document.createElement("div");
    fireball.className = "fireball";
    fireball.style.left = fromRects[i].left + "px";
    fireball.style.top  = fromRects[i].top + "px";
    fireball.style.position = "fixed";
    document.body.appendChild(fireball);

    card.style.visibility = "hidden";

    fireball.animate([
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(1.4)", opacity: 1 },
      { transform: `translate(
          ${toRects[i].left - fromRects[i].left}px,
          ${toRects[i].top - fromRects[i].top}px
        ) scale(1.2)`
      }
    ], {
      duration: 5200,
      easing: "ease-in-out",
      fill: "forwards"
    });

    setTimeout(() => fireball.remove(), 5300);
  });

  await wait(5400);

  /* 5️⃣ 빅카드 점화 */
  bigCards.forEach(c => c.classList.add("burning"));
  await wait(3000);
  bigCards.forEach(c => c.classList.add("smoking"));
  await wait(3500);

  /* 6️⃣ 앞면 리빌 */
  bigCards.forEach((c) => {
    const front = c.querySelector(".big-front");
    const name = MAJORS[Math.floor(Math.random() * MAJORS.length)];
    front.style.backgroundImage =
      `url('/assets/tarot/majors/${name}.png')`;
    front.style.display = "block";
  });

  addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
};

/* ========================= */
const wait = ms => new Promise(r => setTimeout(r, ms));
