/* =====================================================
0. GLOBAL / SOUND
===================================================== */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;

const sPick   = new Audio("/sounds/tarot/card_pick.mp3");
const sFire   = new Audio("/sounds/tarot/fire.mp3");
const sIgnite = new Audio("/sounds/tarot/fire.mp3");
const sReveal = new Audio("/sounds/tarot/reveal.mp3");

let muted = true;
const soundBtn = document.getElementById("soundToggle");
soundBtn.onclick = () => {
  muted = !muted;
  soundBtn.textContent = muted ? "사운드 🔇" : "사운드 🔊";
  muted ? bgm.pause() : bgm.play().catch(()=>{});
};
const play = (s)=>{ if(!muted){ s.currentTime=0; s.play().catch(()=>{});} };

/* =====================================================
1. DOM REFS
===================================================== */
const catArea   = document.querySelector(".cat-area");
const catText   = document.getElementById("catText");
const qArea     = document.getElementById("questionArea");
const tArea     = document.getElementById("transitionArea");

const bigStage  = document.getElementById("bigCardStage");
const bigWrap   = bigStage.querySelector(".big-cards");
const bigCards  = bigStage.querySelectorAll(".big-card");

const spread    = document.getElementById("spreadSection");
const grid78    = document.getElementById("grid78");

const modal     = document.getElementById("confirmModal");
const chat      = document.getElementById("chatContainer");

/* =====================================================
2. STATE
===================================================== */
let step = 0;
let selectedCategory = null;
let selectedTime = null;
let selectedDepth = null;

let readingVersion = "V3";
let maxPickCount = 3;

let selected = [];
let rearranged = [];

/* =====================================================
3. QUESTION
===================================================== */
const LABELS = {
  love:"연애", career:"직업 / 진로", money:"금전", relationship:"관계",
  past:"과거", present:"현재", future:"미래",
  direction:"방향성", advice:"조언", feeling:"상대의 마음", result:"결과"
};

const CATEGORY_MAP = {
  love:"연애", career:"직업", money:"금전", relationship:"관계"
};

const QUESTIONS = [
  { text:"지금 가장 마음에 걸리는 고민이 어떤 분야인지 골라줘.", options:["love","career","money","relationship"] },
  { text:"이 고민은 언제쯤의 이야기인가요?", options:["past","present","future"] },
  { text:"지금 가장 알고 싶은 것은?", options:["direction","advice","feeling","result"] }
];

function applyReadingDepth(d){
  if(d==="direction"){ readingVersion="V1"; maxPickCount=1; }
  if(d==="advice"){    readingVersion="V3"; maxPickCount=3; }
  if(d==="feeling"){   readingVersion="V5"; maxPickCount=5; }
  if(d==="result"){    readingVersion="V7"; maxPickCount=7; }
}

function renderQ(){
  qArea.innerHTML = "";
  const q = QUESTIONS[step];
  catText.textContent = q.text;

  q.options.forEach(o=>{
    const btn = document.createElement("button");
    btn.className = "q-card";
    btn.textContent = LABELS[o];
    btn.onclick = ()=>{
      if(step===0) selectedCategory=o;
      if(step===1) selectedTime=o;
      if(step===2){ selectedDepth=o; applyReadingDepth(o); }
      nextQ();
    };
    qArea.appendChild(btn);
  });
}

function nextQ(){
  step++;
  if(step < QUESTIONS.length){
    renderQ();
  }else{
    qArea.classList.add("hidden");
    tArea.classList.remove("hidden");
    tArea.querySelector("p").textContent =
      `지금 선택을 생각하며 카드를 ${maxPickCount}장 골라줘.`;
  }
}
renderQ();

/* =====================================================
4. SLOT SEQUENCE
===================================================== */
const SLOT_SEQUENCE = {
  V1:[1],
  V3:[2,1,3],
  V5:[2,1,3,4,5],
  V7:[2,1,3,6,4,7,5]
};

/* =====================================================
5. DECK
===================================================== */
const MAJORS=[/* 동일 */];
const SUITS=["cups","wands","swords","pentacles"];
const MINOR_NAMES={/* 동일 */};

function build78Deck(){
  const d=[];
  MAJORS.forEach(f=>d.push(`majors/${f}`));
  SUITS.forEach(s=>{
    Object.keys(MINOR_NAMES).forEach(n=>{
      d.push(`minors/${s}/${n}_${MINOR_NAMES[n]}.png`);
    });
  });
  return d;
}

/* =====================================================
6. GO
===================================================== */
document.getElementById("goCard").onclick = ()=>{
  tArea.classList.add("hidden");
  catArea.classList.add("hidden");

  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  applySlotVisibility();
  initSpread();
};

/* =====================================================
7. SLOT VISIBILITY
===================================================== */
function applySlotVisibility(){
  const active = SLOT_SEQUENCE[readingVersion];
  bigCards.forEach(c=>{
    const slot = Number(c.className.match(/slot-(\d)/)[1]);
    if(!active.includes(slot)){
      c.classList.add("hidden");
    }else{
      c.classList.remove("hidden","burning","smoking");
      c.style.backgroundImage = "url('/assets/tarot/back.png')";
    }
  });
}

/* =====================================================
8. 78 GRID
===================================================== */
function initSpread(){
  grid78.innerHTML="";
  selected=[];
  for(let i=0;i<78;i++){
    const d=document.createElement("div");
    d.className="pick";
    d.onclick=()=>pick(d);
    grid78.appendChild(d);
  }
}

function pick(card){
  if(card.classList.contains("sel")){
    card.classList.remove("sel");
    selected = selected.filter(x=>x!==card);
    return;
  }
  if(selected.length>=maxPickCount) return;

  card.classList.add("sel");
  selected.push(card);
  play(sPick);

  if(selected.length===maxPickCount){
    modal.classList.remove("hidden");
  }
}

/* =====================================================
9. CONFIRM
===================================================== */
document.getElementById("confirmPick").onclick = async ()=>{
  modal.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  document.querySelectorAll(".pick:not(.sel)").forEach(c=>c.classList.add("fade"));
  await wait(400);

  const deck = build78Deck();
  const picked=[];
  selected.forEach(()=>{
    const id = deck.splice(Math.random()*deck.length|0,1)[0];
    picked.push(id.replace(".png",""));
  });

  await fireToBigCards(picked);

  // 🔥 재정렬 후 선택 카드 완전 제거
  grid78.innerHTML="";
  selected=[];

  chat.classList.remove("hidden");
  chat.innerHTML="<p>🔮 리딩 중입니다…</p>";

  await fetchReading(CATEGORY_MAP[selectedCategory], picked, readingVersion);

  catArea.classList.remove("hidden");
  document.body.classList.remove("lock-scroll");
};

/* =====================================================
10. FIREBALL → BIG CARD
===================================================== */
async function fireToBigCards(picked){
  const active = SLOT_SEQUENCE[readingVersion];
  applySlotVisibility();

  selected.forEach((c,i)=>{
    const slot = active[i];
    const target = document.querySelector(`.slot-${slot}`);

    const fire=document.createElement("div");
    fire.className="fireball";
    document.body.appendChild(fire);

    const f=c.getBoundingClientRect();
    const t=target.getBoundingClientRect();

    fire.style.left=`${f.left+f.width/2}px`;
    fire.style.top =`${f.top+f.height/2}px`;

    play(sFire);

    fire.animate([
      {transform:"translate(0,0)"},
      {transform:`translate(${(t.left+t.width/2)-(f.left+f.width/2)}px,${(t.top+t.height/2)-(f.top+f.height/2)}px)`}
    ],{duration:1400,easing:"ease-in-out",fill:"forwards"});

    setTimeout(()=>fire.remove(),1400);
  });

  await wait(1400);
  play(sIgnite);

  active.forEach(s=>document.querySelector(`.slot-${s}`).classList.add("burning"));
  await wait(1000);

  active.forEach((s,i)=>{
    const b=document.querySelector(`.slot-${s}`);
    b.classList.remove("burning");
    b.classList.add("smoking");
    b.style.backgroundImage=`url('/assets/tarot/${picked[i]}.png')`;
  });

  play(sReveal);
  await wait(800);
}

/* =====================================================
11. READING API
===================================================== */
const READING_API="https://script.google.com/macros/s/AKfycbx_WT8AGg2sVcI1EPpqDHWNXsBUtlaTOPovbCTN1Is63n3cIC8zLo2w-efI5-gMLt-h/exec";

async function fetchReading(category,cards,version){
  try{
    const r=await fetch(READING_API,{
      method:"POST",
      body:new URLSearchParams({
        category, version, cards:JSON.stringify(cards)
      })
    });
    const d=await r.json();
    chat.innerHTML=`<h3>🔮 리딩 결과</h3>${d.html}`;
  }catch(e){
    chat.innerHTML="<p>⚠️ 리딩 오류</p>";
  }
}

const wait = ms => new Promise(r=>setTimeout(r,ms));
