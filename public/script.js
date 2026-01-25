const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const bigCards = document.querySelectorAll(".big-card");

/* ===== 사운드 ===== */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true; bgm.volume = 0.15;
const sPick = new Audio("/sounds/tarot/pick.mp3");
const sFire = new Audio("/sounds/tarot/fire.mp3");
const sReveal = new Audio("/sounds/tarot/reveal.mp3");

let soundOn = false;
soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundOn ? bgm.play() : bgm.pause();
};

/* ===== 채팅 ===== */
function addMsg(t,w){const d=document.createElement("div");d.className=`msg ${w}`;d.textContent=t;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;}
sendBtn.onclick=send;
input.onkeydown=e=>e.key==="Enter"&&send();
function send(){ if(!input.value.trim())return; addMsg(input.value,"user"); input.value=""; }
addMsg("마음이 가는 카드 3장을 골라줘.","cat");

/* ===== 카드 생성 ===== */
let selected=[];
for(let i=0;i<78;i++){
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
  if(soundOn) sPick.play();
  if(selected.length===3) modal.classList.remove("hidden");
}

/* ===== 진행 ===== */
btnGo.onclick=async()=>{
  modal.classList.add("hidden");
  await ritual();
};

async function ritual(){
  document.querySelectorAll(".pick:not(.sel)").forEach(p=>p.classList.add("fade"));
  await wait(600);

  const targets=[...bigCards].map(c=>c.getBoundingClientRect());

  selected.forEach((card,i)=>{
    const from=card.getBoundingClientRect();
    const to=targets[i];
    const f=document.createElement("div");
    f.className="fireball";
    document.body.appendChild(f);
    f.style.left=from.left+"px";
    f.style.top=from.top+"px";
    f.animate([
      { transform:`translate(0,0)` },
      { transform:`translate(${(to.left-from.left)/2}px,-180px)` },
      { transform:`translate(${to.left-from.left}px,${to.top-from.top}px)` }
    ],{duration:4200,easing:"ease-in-out",fill:"forwards"});
    setTimeout(()=>f.remove(),4300);
  });

  if(soundOn) sFire.play();
  await wait(4300);

  bigCards.forEach(c=>c.classList.add("burning"));
  await wait(2500);
  bigCards.forEach(c=>c.classList.add("smoking"));
  await wait(3000);

  bigCards.forEach(c=>{
    const front=c.querySelector(".front");
    front.style.backgroundImage=`url('/assets/tarot/majors/00_the_fool.png')`;
    front.style.display="block";
  });
  if(soundOn) sReveal.play();
  spread.style.display="none";
  addMsg("이제 이 카드들을 하나씩 읽어볼게.","cat");
}

const wait=ms=>new Promise(r=>setTimeout(r,ms));
