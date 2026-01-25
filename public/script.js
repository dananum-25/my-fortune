const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const bigCards = document.querySelectorAll(".big-card");

/* 사운드 */
let bgm = null;
let soundOn = false;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  if (soundOn) {
    bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
    bgm.loop = true;
    bgm.volume = 0.15;
    bgm.play().catch(()=>{});
  } else {
    if (bgm) bgm.pause();
    bgm = null;
  }
};

/* 채팅 */
function addMsg(t,w){
  const d=document.createElement("div");
  d.className=`msg ${w}`;
  d.textContent=t;
  chat.appendChild(d);
  chat.scrollTop=chat.scrollHeight;
}
sendBtn.onclick=send;
input.onkeydown=e=>e.key==="Enter"&&send();
function send(){
  if(!input.value.trim())return;
  addMsg(input.value,"user");
  input.value="";
}
addMsg("마음이 가는 카드 3장을 골라줘.","cat");

/* 카드 */
let selected=[];
for(let i=0;i<78;i++){
  const d=document.createElement("div");
  d.className="pick";
  d.onclick=()=>pick(d);
  grid.appendChild(d);
}
function pick(el){
  if(el.classList.contains("sel")){
    el.classList.remove("sel");
    selected=selected.filter(x=>x!==el);
    return;
  }
  if(selected.length>=3)return;
  el.classList.add("sel");
  selected.push(el);
  if(selected.length===3) modal.classList.remove("hidden");
}

btnGo.onclick=async()=>{
  modal.classList.add("hidden");
  await ritual();
};

async function ritual(){
  document.querySelectorAll(".pick:not(.sel)").forEach(p=>p.classList.add("fade"));
  await wait(700);

  const targets=[...bigCards].map(c=>c.getBoundingClientRect());

  selected.forEach((card,i)=>{
    const from=card.getBoundingClientRect();
    const to=targets[i];
    const fb=document.createElement("div");
    fb.className="fireball";
    document.body.appendChild(fb);

    fb.animate([
      { transform:`translate(${from.left}px,${from.top}px)` },
      { transform:`translate(${(from.left+to.left)/2}px,${from.top-180}px)` },
      { transform:`translate(${to.left}px,${to.top}px)` }
    ],{duration:5000,easing:"ease-in-out",fill:"forwards"});

    setTimeout(()=>fb.remove(),5100);
  });

  await wait(5200);

  bigCards.forEach(c=>c.classList.add("burning"));
  await wait(3000);
  bigCards.forEach(c=>c.classList.add("smoking"));
  await wait(3500);

  bigCards.forEach((c,i)=>{
    const front=c.querySelector(".big-front");
    front.style.backgroundImage=`url('/assets/tarot/majors/00_the_fool.png')`;
    front.style.display="block";
  });

  spread.style.display="none";
  addMsg("이제 이 카드들을 하나씩 읽어볼게.","cat");
}

const wait=ms=>new Promise(r=>setTimeout(r,ms));
