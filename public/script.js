/* ===== 사운드 ===== */
const soundBtn=document.getElementById("soundToggle");
const bgm=new Audio("/public/sounds/tarot/ambient_entry.mp3");
bgm.loop=true; bgm.volume=.15; let soundOn=false;
soundBtn.onclick=()=>{
  soundOn=!soundOn;
  soundBtn.textContent=soundOn?"사운드 🔊":"사운드 🔇";
  soundOn?bgm.play().catch(()=>{}):bgm.pause();
};

/* ===== 채팅 ===== */
const chat=document.getElementById("chatContainer");
const input=document.getElementById("userInput");
const sendBtn=document.getElementById("sendBtn");
function addMsg(t,who){
  const d=document.createElement("div");
  d.className=`msg ${who}`; d.textContent=t;
  chat.appendChild(d); chat.scrollTop=chat.scrollHeight;
}
sendBtn.onclick=send; input.onkeydown=e=>e.key==="Enter"&&send();
function send(){ if(!input.value.trim())return; addMsg(input.value,"user"); input.value=""; }
addMsg("질문을 고른 뒤, 타로로 들어갈게요.", "cat");

/* ===== 질문 → 버튼 ===== */
const qStage=document.getElementById("questionStage");
const qOpts=[...document.querySelectorAll(".q-opt")];
const goTarot=document.getElementById("goTarot");
let pickedQ=false;
qOpts.forEach(b=>b.onclick=()=>{ pickedQ=true; goTarot.classList.remove("hidden"); });

/* ===== 카드 영역 ===== */
const tarotStage=document.getElementById("tarotStage");
const spread=document.getElementById("spreadSection");
const grid=document.getElementById("grid78");
const modal=document.getElementById("confirmModal");
const btnGo=document.getElementById("btnGo");
const btnKeep=document.getElementById("btnKeep");
const bigCards=[...document.querySelectorAll(".big-card")];

/* 78장 생성 */
let selected=[]; let revealDeck=[...Array(78)].map((_,i)=>i);
function build78(){
  grid.innerHTML="";
  for(let i=0;i<78;i++){
    const d=document.createElement("div");
    d.className="pick";
    d.onclick=()=>togglePick(d);
    grid.appendChild(d);
  }
}
function togglePick(el){
  if(el.classList.contains("sel")){
    el.classList.remove("sel");
    selected=selected.filter(x=>x!==el);
    return;
  }
  if(selected.length>=3)return;
  el.classList.add("sel"); selected.push(el);
  if(selected.length===3) modal.classList.remove("hidden");
}
btnKeep.onclick=()=>modal.classList.add("hidden");

/* 질문 → 타로 */
goTarot.onclick=()=>{
  qStage.classList.add("hidden");
  tarotStage.classList.remove("hidden");
  spread.classList.remove("hidden");
  build78();
  addMsg("마음이 가는 카드 3장을 골라줘.", "cat");
};

/* ===== 연출 ===== */
btnGo.onclick=async()=>{
  modal.classList.add("hidden");
  document.body.style.overflow="hidden";
  await ritual();
};

async function ritual(){
  // 75장 제거
  document.querySelectorAll(".pick:not(.sel)").forEach(p=>p.classList.add("fade"));
  await wait(800);

  // 파이어볼 이동 (선택카드 → 빅카드)
  const targets=bigCards.map(c=>c.getBoundingClientRect());
  selected.forEach((card,i)=>{
    const from=card.getBoundingClientRect();
    const to=targets[i];
    const fb=document.createElement("div");
    fb.className="fireball"; document.body.appendChild(fb);
    fb.animate([
      {transform:`translate(${from.left}px,${from.top}px)`},
      {transform:`translate(${(from.left+to.left)/2}px,${from.top-160}px)`},
      {transform:`translate(${to.left}px,${to.top}px)`}
    ],{duration:3000,easing:"ease-in-out",fill:"forwards"});
    setTimeout(()=>fb.remove(),3200);
  });

  await wait(3200);
  // 점화 → 연기
  bigCards.forEach(c=>c.classList.add("burning"));
  await wait(2000);
  bigCards.forEach(c=>c.classList.add("smoking"));
  await wait(2000);
  bigCards.forEach(c=>c.classList.remove("burning","smoking"));

  // 앞면 공개 (중복 없음)
  bigCards.forEach(c=>{
    const front=c.querySelector(".big-front");
    front.style.backgroundImage=`url('${draw78()}')`;
    front.style.display="block";
  });

  spread.classList.add("hidden");
  document.body.style.overflow="";
  addMsg("이제 이 카드들을 하나씩 읽어볼게.", "cat");
}

/* ===== 78장 랜덤 드로우 ===== */
const MAJORS=[
"00_the_fool.png","01_the_magician.png","02_the_high_priestess.png","03_the_empress.png",
"04_the_emperor.png","05_the_hierophant.png","06_the_lovers.png","07_the_chariot.png",
"08_strength.png","09_the_hermit.png","10_wheel_of_fortune.png","11_justice.png",
"12_the_hanged_man.png","13_death.png","14_temperance.png","15_the_devil.png",
"16_the_tower.png","17_the_star.png","18_the_moon.png","19_the_sun.png",
"20_judgement.png","21_the_world.png"
];
const MINOR_NAMES={"01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six",
"07":"seven","08":"eight","09":"nine","10":"ten","11":"page","12":"knight","13":"queen","14":"king"};
const SUITS=["cups","wands","swords","pentacles"];
function draw78(){
  const i=Math.floor(Math.random()*revealDeck.length);
  const n=revealDeck.splice(i,1)[0];
  const isMajor=Math.random()<22/78;
  if(isMajor){
    return `/public/assets/tarot/majors/${MAJORS[Math.floor(Math.random()*MAJORS.length)]}`;
  }else{
    const suit=SUITS[Math.floor(Math.random()*4)];
    const num=String(Math.floor(Math.random()*14)+1).padStart(2,"0");
    return `/public/assets/tarot/minors/${suit}/${num}_${MINOR_NAMES[num]}.png`;
  }
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
