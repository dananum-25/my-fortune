const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const bigCards = [...document.querySelectorAll(".big-card")];
const fxLayer = document.getElementById("fx-layer");

/* BGM */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = .15;
let soundOn = false;
soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  soundOn ? bgm.play().catch(()=>{}) : bgm.pause();
};

/* 채팅 */
function addMsg(t,w){const d=document.createElement("div");d.className=`msg ${w}`;d.textContent=t;chat.appendChild(d);}
sendBtn.onclick=()=>{if(input.value.trim()){addMsg(input.value,"user");input.value="";}};
addMsg("마음이 가는 카드 3장을 골라줘.","cat");

/* 카드 선택 */
let selected=[], fromRects=[], toRects=[];
for(let i=0;i<78;i++){
  const d=document.createElement("div");
  d.className="pick";
  d.onclick=()=>{
    if(d.classList.contains("sel")){
      d.classList.remove("sel");
      selected=selected.filter(x=>x!==d);
      return;
    }
    if(selected.length>=3)return;
    d.classList.add("sel");
    selected.push(d);
    if(selected.length===3){
      fromRects=selected.map(c=>c.getBoundingClientRect());
      toRects=bigCards.map(c=>c.getBoundingClientRect());
      modal.classList.remove("hidden");
    }
  };
  grid.appendChild(d);
}

btnGo.onclick=async()=>{
  modal.classList.add("hidden");
  document.querySelectorAll(".pick:not(.sel)").forEach(p=>p.classList.add("fade"));
  await wait(500);

  fromRects.forEach((from,i)=>{
    const to=toRects[i];
    const f=document.createElement("div");
    f.className="fireball";
    fxLayer.appendChild(f);
    f.animate([
      {transform:`translate(${from.left}px,${from.top}px)`},
      {transform:`translate(${(from.left+to.left)/2}px,${from.top-180}px)`},
      {transform:`translate(${to.left}px,${to.top}px)`}
    ],{duration:4000,easing:"ease-in-out",fill:"forwards"});
    setTimeout(()=>f.remove(),4100);
  });

  await wait(4200);
  bigCards.forEach(c=>c.classList.add("burning"));

  await wait(2000);
  bigCards.forEach((c)=>{
    const front=c.querySelector(".front");
    front.style.backgroundImage=`url('/assets/tarot/majors/00_the_fool.png')`;
    front.style.display="block";
  });

  spread.style.display="none";
};

const wait=ms=>new Promise(r=>setTimeout(r,ms));
