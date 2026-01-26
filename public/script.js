/* ===============================
   [1] 기본 DOM
================================ */
const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const bigCards = document.querySelectorAll(".big-card");

/* ===============================
   [2] 사운드 (BGM only)
================================ */
const bgm = new Audio("/public/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;
let muted = true;

soundBtn.onclick = () => {
  muted = !muted;
  soundBtn.textContent = muted ? "🔇 Sound" : "🔊 Sound";
  muted ? bgm.pause() : bgm.play().catch(()=>{});
};

/* ===============================
   [3] 채팅
================================ */
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

addMsg("지금 떠오르는 고민을 마음속으로 정리해보세요.", "cat");

/* ===============================
   [4] 카드 생성 (78)
================================ */
let selected = [];
let deck = [...Array(78)].map((_,i)=>i);

for(let i=0;i<78;i++){
  const c = document.createElement("div");
  c.className = "pick";
  c.onclick = ()=>togglePick(c);
  grid.appendChild(c);
}

function togglePick(el){
  if(el.classList.contains("sel")){
    el.classList.remove("sel");
    selected = selected.filter(x=>x!==el);
    return;
  }
  if(selected.length>=3) return;
  el.classList.add("sel");
  selected.push(el);
  if(selected.length===3) modal.classList.remove("hidden");
}

/* ===============================
   [5] 진행 트리거
================================ */
btnGo.onclick = async ()=>{
  modal.classList.add("hidden");
  await ritual();
};

async function ritual(){
  window.scrollTo(0,0);

  document.querySelectorAll(".pick:not(.sel)")
    .forEach(p=>p.classList.add("fade"));

  await wait(800);

  const targets = [...bigCards].map(c=>c.getBoundingClientRect());

  selected.forEach((card,i)=>{
    const from = card.getBoundingClientRect();
    const to = targets[i];

    const fb = document.createElement("div");
    fb.className = "fireball";
    document.body.appendChild(fb);

    fb.animate([
      { transform:`translate(${from.left}px,${from.top}px)` },
      { transform:`translate(${(from.left+to.left)/2}px,${from.top-160}px)` },
      { transform:`translate(${to.left}px,${to.top}px)` }
    ],{ duration:3000, easing:"ease-in-out", fill:"forwards" });

    setTimeout(()=>fb.remove(),3100);
  });

  await wait(3200);

  bigCards.forEach(c=>c.classList.add("burning"));
  await wait(2000);
  bigCards.forEach(c=>c.classList.add("smoking"));
  await wait(2000);

  bigCards.forEach((c,i)=>{
    const front = c.querySelector(".big-front");
    front.style.backgroundImage = `url('${drawCard()}')`;
    front.style.display = "block";
  });

  spread.style.display="none";
  addMsg("이제 이 카드들을 하나씩 읽어볼게요.", "cat");
}

/* ===============================
   [6] 카드 드로우 (78 랜덤)
================================ */
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
const NAMES = ["ace","two","three","four","five","six","seven",
               "eight","nine","ten","page","knight","queen","king"];

function drawCard(){
  const isMajor = Math.random() < 22/78;
  if(isMajor){
    const f = MAJORS.splice(Math.floor(Math.random()*MAJORS.length),1)[0];
    return `/public/assets/tarot/majors/${f}`;
  }else{
    const suit = SUITS[Math.floor(Math.random()*4)];
    const idx = Math.floor(Math.random()*14);
    return `/public/assets/tarot/minors/${suit}/${String(idx+1).padStart(2,"0")}_${NAMES[idx]}.png`;
  }
}

const wait = ms => new Promise(r=>setTimeout(r,ms));
