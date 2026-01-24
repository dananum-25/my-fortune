const grid = document.getElementById("grid78");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const bigCards = document.querySelectorAll(".big-card");

/* 🔊 사운드 */
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
addMsg("마음이 가는 카드 3장을 골라줘.", "cat");

/* 카드 데이터 */
const majors = [
  "00_the_fool.png","01_the_magician.png","02_the_high_priestess.png",
  "03_the_empress.png","04_the_emperor.png","05_the_hierophant.png",
  "06_the_lovers.png","07_the_chariot.png","08_strength.png",
  "09_the_hermit.png","10_wheel_of_fortune.png","11_justice.png",
  "12_the_hanged_man.png","13_death.png","14_temperance.png",
  "15_the_devil.png","16_the_tower.png","17_the_star.png",
  "18_the_moon.png","19_the_sun.png","20_judgement.png","21_the_world.png"
];

const suits = ["cups","wands","swords","pentacles"];
const minors = [
  "01_ace.png","02_two.png","03_three.png","04_four.png","05_five.png",
  "06_six.png","07_seven.png","08_eight.png","09_nine.png","10_ten.png",
  "11_page.png","12_knight.png","13_queen.png","14_king.png"
];

let deck = [];
majors.forEach(m => deck.push({type:"major", path:`/assets/tarot/majors/${m}`}));
suits.forEach(s =>
  minors.forEach(m =>
    deck.push({type:"minor", path:`/assets/tarot/minors/${s}/${m}`})
  )
);

/* 카드 뿌리기 */
let selected = [];
for (let i=0;i<78;i++){
  const d=document.createElement("div");
  d.className="pick";
  d.onclick=()=>togglePick(d);
  grid.appendChild(d);
}

function togglePick(el){
  if(el.classList.contains("sel")){
    el.classList.remove("sel");
    selected=selected.filter(x=>x!==el);
    return;
  }
  if(selected.length>=3)return;
  el.classList.add("sel");
  selected.push(el);
  if(selected.length===3)modal.classList.remove("hidden");
}

btnGo.onclick=async()=>{
  modal.classList.add("hidden");
  await ritual();
};

async function ritual(){
  document.querySelectorAll(".pick:not(.sel)").forEach(p=>p.classList.add("fade"));
  await wait(800);

  const targets=[...bigCards].map(c=>c.getBoundingClientRect());

  selected.forEach((card,i)=>{
    const from=card.getBoundingClientRect();
    const to=targets[i];

    const fire=document.createElement("div");
    fire.className="fireball";
    document.body.appendChild(fire);

    fire.animate([
      {transform:`translate(${from.left}px,${from.top}px)`},
      {transform:`translate(${(from.left+to.left)/2}px,${from.top-160}px)`},
      {transform:`translate(${to.left}px,${to.top}px)`}
    ],{duration:4200,easing:"ease-in-out",fill:"forwards"});

    setTimeout(()=>fire.remove(),4300);
  });

  await wait(4400);

  bigCards.forEach(c=>c.classList.add("burning"));
  await wait(2800);
  bigCards.forEach(c=>c.classList.add("smoking"));
  await wait(3400);

  bigCards.forEach((c)=>{
    const card=deck.splice(Math.floor(Math.random()*deck.length),1)[0];
    const front=c.querySelector(".big-front");
    front.style.backgroundImage=`url('${card.path}')`;
    front.style.display="block";
  });

  addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
}

const wait=ms=>new Promise(r=>setTimeout(r,ms));
