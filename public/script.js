const spread = document.getElementById("spread");
const confirmBtn = document.getElementById("confirmBtn");
const selectedRow = document.getElementById("selectedRow");
const bigCards = document.querySelectorAll(".big-card");

const bgm = document.getElementById("bgm");
const sPick = document.getElementById("pickSound");
const sFire = document.getElementById("fireSound");
const sReveal = document.getElementById("revealSound");

let soundOn = true;
let selected = [];

/* ===== 카드 DB ===== */

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
const MINOR_NAMES = {
  "01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six",
  "07":"seven","08":"eight","09":"nine","10":"ten",
  "11":"page","12":"knight","13":"queen","14":"king"
};

function draw78() {
  if (Math.random() < 22/78) {
    const f = MAJORS[Math.floor(Math.random()*22)];
    return `/assets/tarot/majors/${f}`;
  } else {
    const suit = SUITS[Math.floor(Math.random()*4)];
    const num = String(Math.floor(Math.random()*14)+1).padStart(2,"0");
    return `/assets/tarot/minors/${suit}/${num}_${MINOR_NAMES[num]}.png`;
  }
}

/* ===== 스프레드 생성 ===== */

for(let i=0;i<78;i++){
  const c = document.createElement("div");
  c.className = "card";
  c.onclick = () => pickCard(c);
  spread.appendChild(c);
}

/* ===== 카드 선택 ===== */

function pickCard(card){
  if(card.classList.contains("sel")) return;
  if(selected.length>=3) return;

  card.classList.add("sel");
  selected.push(card);

  if(soundOn){
    sPick.currentTime=0;
    sPick.play();
    setTimeout(()=>sPick.pause(),120);
  }

  if(selected.length===3){
    confirmBtn.disabled=false;
  }
}

/* ===== 선택 확정 ===== */

confirmBtn.onclick = async ()=>{
  spread.style.display="none";

  selectedRow.innerHTML="";
  selected.forEach(c=>{
    c.classList.remove("sel");
    selectedRow.appendChild(c);
  });

  await wait(400);

  ritual();
};

/* ===== 파이어볼 + 빅카드 ===== */

function ritual(){
  bigCards.forEach(card=>{
    const img = draw78();
    const front = card.querySelector(".front");
    front.style.backgroundImage = `url('${img}')`;
    front.style.display="block";
  });

  const targets = [...bigCards].map(b=>b.getBoundingClientRect());

  selected.forEach((card,i)=>{
    const from = card.getBoundingClientRect();
    const to = targets[i];
    fireball(from,to);
  });
}

function fireball(from,to){
  const f = document.createElement("div");
  f.className="fireball";
  document.body.appendChild(f);

  f.style.left = from.left+"px";
  f.style.top = from.top+"px";

  if(soundOn){
    sFire.currentTime=0;
    sFire.play();
  }

  f.animate([
    {transform:"translate(0,0) scale(1)"},
    {transform:`translate(${to.left-from.left}px, ${to.top-from.top}px) scale(1.8)`}
  ],{
    duration:1200,
    easing:"ease-in-out"
  }).onfinish=()=>{
    f.remove();
    if(soundOn){
      sReveal.currentTime=0;
      sReveal.play();
    }
  };
}

/* ===== 유틸 ===== */

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

/* ===== 사운드 ===== */

document.getElementById("soundToggle").onclick=()=>{
  soundOn=!soundOn;
  if(soundOn) bgm.play(); else bgm.pause();
};

bgm.volume=0.4;
bgm.play();
