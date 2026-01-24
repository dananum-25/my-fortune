const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const chosenStage = document.getElementById("chosenStage");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const bigCards = document.querySelectorAll(".big-card");

/* 사운드 */
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
}

addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

/* 카드 생성 */
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

btnGo.onclick = async () => {
  modal.classList.add("hidden");
  await ritual();
};

/* 리추얼 */
async function ritual() {
  // 75장 제거
  document.querySelectorAll(".pick:not(.sel)").forEach(p => p.classList.add("fade"));
  await wait(700);
  spread.style.display = "none";

  // 선택 카드 재배치
  chosenStage.innerHTML = "";
  chosenStage.classList.remove("hidden");
  selected.forEach(c => {
    const clone = c.cloneNode(true);
    clone.classList.remove("sel");
    chosenStage.appendChild(clone);
  });
  await wait(600);

  // 파이어볼
  const targets = [...bigCards].map(b => b.getBoundingClientRect());
  const sources = [...chosenStage.children].map(c => c.getBoundingClientRect());

  sources.forEach((from, i) => {
    const to = targets[i];
    const fire = document.createElement("div");
    fire.className = "fireball";
    document.body.appendChild(fire);

    fire.animate([
      { transform:`translate(${from.left}px,${from.top}px)` },
      { transform:`translate(${(from.left+to.left)/2}px,${from.top-180}px)` },
      { transform:`translate(${to.left+to.width/2}px,${to.top+to.height/2}px)` }
    ], { duration:4200, easing:"ease-in-out", fill:"forwards" });

    setTimeout(()=>fire.remove(),4300);
  });

  await wait(4400);

  // 점화 → 연기
  bigCards.forEach(b => b.classList.add("burning"));
  await wait(3000);
  bigCards.forEach(b => b.classList.add("smoking"));
  await wait(3600);

  // 앞면 리빌
  bigCards.forEach(b => {
    b.classList.remove("burning","smoking");
    const f = b.querySelector(".big-front");
    f.style.backgroundImage = `url('${drawCard()}')`;
    f.style.display = "block";
  });

  chosenStage.classList.add("hidden");
  addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
}

/* 카드 드로우 (78 완전 랜덤) */
function drawCard() {
  const r = Math.floor(Math.random()*78);
  if (r < 22) {
    return `/assets/tarot/majors/${String(r).padStart(2,"0")}_the.png`.replace("_the.png","");
  } else {
    const suits = ["cups","wands","swords","pentacles"];
    const suit = suits[Math.floor(Math.random()*4)];
    const num = String((r-22)%14+1).padStart(2,"0");
    return `/assets/tarot/minors/${suit}/${num}.png`;
  }
}

const wait = ms => new Promise(r=>setTimeout(r,ms));
