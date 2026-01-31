/* =====================================================
0. SOUND
===================================================== */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;

const sPick   = new Audio("/sounds/tarot/card_pick.mp3");
const sFire   = new Audio("/sounds/tarot/fire.mp3");
const sIgnite = new Audio("/sounds/tarot/fire.mp3");
const sReveal = new Audio("/sounds/tarot/reveal.mp3");

let muted = true;
document.getElementById("soundToggle").onclick = () => {
  muted = !muted;
  muted ? bgm.pause() : bgm.play().catch(()=>{});
};

const play = s => !muted && (s.currentTime = 0, s.play().catch(()=>{}));

/* =====================================================
1. QUESTION FLOW
===================================================== */
const catText = document.getElementById("catText");
const qArea   = document.getElementById("questionArea");
const tArea   = document.getElementById("transitionArea");

const QUESTIONS = [
  { text:"지금 가장 마음에 걸리는 고민이 어떤 분야인지 골라줘.", opts:["연애","직업","금전","관계"] },
  { text:"이 고민은 언제쯤의 이야기인가요?", opts:["과거","현재","미래"] },
  { text:"지금 가장 알고 싶은 것은?", opts:["방향성","조언","상대의 마음","결과"] }
];

let step = 0;
let readingVersion = "V3";
let maxPick = 3;

function applyDepth(label){
  if(label==="방향성"){ readingVersion="V1"; maxPick=1; }
  if(label==="조언"){ readingVersion="V3"; maxPick=3; }
  if(label==="상대의 마음"){ readingVersion="V5"; maxPick=5; }
  if(label==="결과"){ readingVersion="V7"; maxPick=7; }
}

function renderQ(){
  qArea.innerHTML="";
  const q = QUESTIONS[step];
  catText.textContent = q.text;

  q.opts.forEach(o=>{
    const b=document.createElement("button");
    b.textContent=o;
    b.onclick=()=>{
      if(step===2) applyDepth(o);
      step++;
      step<QUESTIONS.length ? renderQ() : showTransition();
    };
    qArea.appendChild(b);
  });
}
renderQ();

function showTransition(){
  qArea.classList.add("hidden");
  tArea.classList.remove("hidden");
  tArea.querySelector("p").textContent =
    `지금 선택을 생각하며 카드를 ${maxPick}장 골라줘.`;
}

/* =====================================================
2. SLOT MAP
===================================================== */
const SLOT_MAP = {
  V1:[1],
  V3:[2,1,3],
  V5:[2,1,3,4,5],
  V7:[2,1,3,6,4,7,5]
};

/* =====================================================
3. DOM
===================================================== */
const bigStage = document.getElementById("bigCardStage");
const bigCards = [...document.querySelectorAll(".big-card")];
const spread   = document.getElementById("spreadSection");
const grid     = document.getElementById("grid78");
const modal    = document.getElementById("confirmModal");
const chat     = document.getElementById("chatContainer");

let selected = [];

/* =====================================================
4. GO CARD
===================================================== */
document.getElementById("goCard").onclick = ()=>{
  tArea.classList.add("hidden");

  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPick}장을 골라줘`;

  initBigCards();
  initSpread();
};

/* =====================================================
5. BIG CARD INIT (🔥 중요)
===================================================== */
function initBigCards(){
  const active = SLOT_MAP[readingVersion];

  bigCards.forEach(c=>{
    const s = Number(c.dataset.slot);
    if(active.includes(s)){
      c.classList.remove("hidden","burning","smoking");
      c.style.backgroundImage="url('/assets/tarot/back.png')";
    }else{
      c.classList.add("hidden");
    }
  });
}

/* =====================================================
6. 78 SPREAD
===================================================== */
function initSpread(){
  grid.innerHTML="";
  selected=[];
  for(let i=0;i<78;i++){
    const d=document.createElement("div");
    d.className="pick";
    d.onclick=()=>pick(d);
    grid.appendChild(d);
  }
}

function pick(el){
  if(el.classList.contains("sel")){
    el.classList.remove("sel");
    selected=selected.filter(x=>x!==el);
    return;
  }
  if(selected.length>=maxPick) return;
  el.classList.add("sel");
  selected.push(el);
  play(sPick);
  if(selected.length===maxPick) modal.classList.remove("hidden");
}

/* =====================================================
7. CONFIRM
===================================================== */
document.getElementById("confirmPick").onclick = async ()=>{
  modal.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  const deck = buildDeck();
  const picked = selected.map(()=>deck.splice(Math.random()*deck.length|0,1)[0]);

  await showReorder(picked);
  await fireSequence(picked);

  chat.classList.remove("hidden");
  chat.innerHTML="<p>🔮 리딩 중입니다…</p>";
  document.body.classList.remove("lock-scroll");
};

/* =====================================================
8. REORDER (v3 TIMING)
===================================================== */
async function showReorder(cards){
  const area=document.createElement("div");
  area.className="reorder-area";

  SLOT_MAP[readingVersion].forEach((s,i)=>{
    const d=document.createElement("div");
    d.className="reorder-card";
    if(i<cards.length)
      d.style.backgroundImage=`url('/assets/tarot/${cards[i]}.png')`;
    else d.classList.add("hidden");
    area.appendChild(d);
  });

  bigStage.after(area);
  await wait(1200);   // 🔥 느리게
  area.remove();
}

/* =====================================================
9. FIRE → BIG
===================================================== */
async function fireSequence(cards){
  const slots=SLOT_MAP[readingVersion];

  selected.forEach((c,i)=>{
    const fire=document.createElement("div");
    fire.className="fireball";
    document.body.appendChild(fire);

    const from=c.getBoundingClientRect();
    const to=document.querySelector(`.slot-${slots[i]}`).getBoundingClientRect();

    fire.style.left=from.left+from.width/2+"px";
    fire.style.top =from.top +from.height/2+"px";

    fire.animate([
      {transform:"translate(0,0)"},
      {transform:`translate(${to.left-from.left}px,${to.top-from.top}px)`}
    ],{duration:1500,easing:"ease-in-out",fill:"forwards"});

    setTimeout(()=>fire.remove(),1600);
  });

  play(sFire);
  await wait(1600);

  slots.forEach(s=>document.querySelector(`.slot-${s}`).classList.add("burning"));
  play(sIgnite);
  await wait(1200);

  slots.forEach((s,i)=>{
    const b=document.querySelector(`.slot-${s}`);
    b.classList.remove("burning");
    b.classList.add("smoking");
    b.style.backgroundImage=`url('/assets/tarot/${cards[i]}.png')`;
  });

  play(sReveal);
}

/* =====================================================
UTIL
===================================================== */
function buildDeck(){
  const majors=[...Array(22)].map((_,i)=>`majors/${String(i).padStart(2,"0")}`);
  const suits=["cups","wands","swords","pentacles"];
  const minors=[];
  suits.forEach(s=>{
    for(let i=1;i<=14;i++)
      minors.push(`minors/${s}/${String(i).padStart(2,"0")}`);
  });
  return [...majors,...minors];
}
const wait = ms => new Promise(r=>setTimeout(r,ms));
