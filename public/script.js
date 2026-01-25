/* =========================
   SOUND SYSTEM
========================= */
let soundEnabled = false;
let soundUnlocked = false;

const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.18;

const FX = {
  pick: "/sounds/tarot/card_pick.mp3",
  spread: "/sounds/tarot/spread_open.mp3",
  fire: "/sounds/tarot/fire.mp3",
  reveal: "/sounds/tarot/tarot_reveal.mp3"
};

function unlockSound() {
  if (soundUnlocked) return;
  const silent = new Audio("data:audio/mp3;base64,//uQxAAAA");
  silent.play().catch(()=>{});
  soundUnlocked = true;
}

function playFX(type) {
  if (!soundEnabled || !soundUnlocked) return;
  const a = new Audio(FX[type]);
  a.volume = .8;
  a.play().catch(()=>{});
}

/* =========================
   ELEMENTS
========================= */
const grid = document.getElementById("grid78");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const bigCards = document.querySelectorAll(".big-card");
const soundBtn = document.getElementById("soundToggle");

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
  if (Math.random() < 22/78) {
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
    if (d.classList.contains("sel")) return;
    if (selected.length>=3) return;
    d.classList.add("sel");
    selected.push(d);
    playFX("pick");
    if (selected.length===3) modal.classList.remove("hidden");
  };
  grid.appendChild(d);
}

btnGo.onclick = async () => {
  modal.classList.add("hidden");
  playFX("spread");

  document.querySelectorAll(".pick:not(.sel)").forEach(p=>p.classList.add("fade"));
  await wait(600);

  selected.forEach((card,i)=>{
    const from = card.getBoundingClientRect();
    const to = bigCards[i].getBoundingClientRect();

    const fb = document.createElement("div");
    fb.className="fireball";
    document.body.appendChild(fb);

    playFX("fire");

    fb.animate([
      {transform:`translate(${from.left}px,${from.top}px)`},
      {transform:`translate(${(from.left+to.left)/2}px,${from.top-160}px)`},
      {transform:`translate(${to.left}px,${to.top}px)`}
    ],{duration:3000,easing:"ease-in-out",fill:"forwards"});

    setTimeout(()=>fb.remove(),3100);
  });

  await wait(3200);

  bigCards.forEach(c=>{
    const front=c.querySelector(".front");
    front.style.backgroundImage=`url('${draw78()}')`;
    front.style.display="block";
  });

  playFX("reveal");
};

/* ========================= */
const wait = ms => new Promise(r=>setTimeout(r,ms));

soundBtn.onclick = () => {
  unlockSound();
  soundEnabled=!soundEnabled;
  soundBtn.textContent=soundEnabled?"🔊":"🔇";
  if (soundEnabled) bgm.play().catch(()=>{});
  else bgm.pause();
};

document.addEventListener("pointerdown",unlockSound,{once:true});
