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
const soundBtn = document.getElementById("soundToggle");

soundBtn.onclick = () => {
  muted = !muted;
  soundBtn.textContent = muted ? "사운드 🔇" : "사운드 🔊";
  muted ? bgm.pause() : bgm.play().catch(()=>{});
};

function play(sound){
  if(!muted){
    sound.currentTime = 0;
    sound.play().catch(()=>{});
  }
}

/* =====================================================
1. QUESTION FLOW (카드형 유지 / catText 단일)
===================================================== */
const catTextEl = document.getElementById("catText");
const qArea = document.getElementById("questionArea");
const tArea = document.getElementById("transitionArea");

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

let step = 0;
let selectedCategory = null;
let readingVersion = "V3";
let maxPickCount = 3;

function applyReadingDepth(depth){
  if(depth==="direction"){ readingVersion="V1"; maxPickCount=1; }
  if(depth==="advice"){ readingVersion="V3"; maxPickCount=3; }
  if(depth==="feeling"){ readingVersion="V5"; maxPickCount=5; }
  if(depth==="result"){ readingVersion="V7"; maxPickCount=7; }
}

function renderQ(){
  qArea.innerHTML = "";
  const q = QUESTIONS[step];
  catTextEl.textContent = q.text;

  q.options.forEach(o=>{
    const b = document.createElement("button");
    b.textContent = LABELS[o];
    b.onclick = ()=>{
      if(step===0) selectedCategory=o;
      if(step===2) applyReadingDepth(o);
      step++;
      step < QUESTIONS.length ? renderQ() : showTransition();
    };
    qArea.appendChild(b);
  });
}

function showTransition(){
  qArea.classList.add("hidden");
  tArea.classList.remove("hidden");
  tArea.querySelector("p").textContent =
    `지금 선택을 생각하며 카드를 ${maxPickCount}장 골라줘.`;
}

renderQ();

/* =====================================================
2. SLOT MAP (LOCK)
===================================================== */
const SLOT_SEQUENCE = {
  V1:[1],
  V3:[2,1,3],
  V5:[2,1,3,4,5],
  V7:[2,1,3,6,4,7,5]
};

/* =====================================================
3. CARD DECK (78)
===================================================== */
const MAJORS = [
  "00_the_fool.png","01_the_magician.png","02_the_high_priestess.png",
  "03_the_empress.png","04_the_emperor.png","05_the_hierophant.png",
  "06_the_lovers.png","07_the_chariot.png","08_strength.png",
  "09_the_hermit.png","10_wheel_of_fortune.png","11_justice.png",
  "12_the_hanged_man.png","13_death.png","14_temperance.png",
  "15_the_devil.png","16_the_tower.png","17_the_star.png",
  "18_the_moon.png","19_the_sun.png","20_judgement.png","21_the_world.png"
];

const SUITS=["cups","wands","swords","pentacles"];
const MINORS={
  "01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six",
  "07":"seven","08":"eight","09":"nine","10":"ten",
  "11":"page","12":"knight","13":"queen","14":"king"
};

function build78Deck(){
  const d=[];
  MAJORS.forEach(f=>d.push(`majors/${f}`));
  SUITS.forEach(s=>{
    Object.keys(MINORS).forEach(n=>{
      d.push(`minors/${s}/${n}_${MINORS[n]}.png`);
    });
  });
  return d;
}

/* =====================================================
4. DOM
===================================================== */
const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const bigStage = document.getElementById("bigCardStage");
const bigCards = document.querySelectorAll(".big-card");
const modal = document.getElementById("confirmModal");
const chat = document.getElementById("chatContainer");

let selected = [];

/* =====================================================
5. GO / RESET
===================================================== */
document.getElementById("goCard").onclick=()=>{
  tArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  initBigCards();
  initSpread();
};

document.getElementById("resetAll").onclick=()=>location.reload();

/* =====================================================
6. BIG CARD INIT (겹침 방지 / 동일 크기)
===================================================== */
function initBigCards(){
  const active = SLOT_SEQUENCE[readingVersion];
  bigCards.forEach(c=>{
    const s = Number(c.className.match(/slot-(\d)/)[1]);
    if(active.includes(s)){
      c.classList.remove("hidden","burning","smoking");
      c.style.backgroundImage = "url('/assets/tarot/back.png')";
    }else{
      c.classList.add("hidden");
    }
  });
}

/* =====================================================
7. 78 SPREAD
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

function pick(card){
  if(card.classList.contains("sel")){
    card.classList.remove("sel");
    selected=selected.filter(c=>c!==card);
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
8. CONFIRM → FIRE → READING
===================================================== */
document.getElementById("confirmPick").onclick=async()=>{
  modal.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  document.querySelectorAll(".pick:not(.sel)").forEach(c=>c.classList.add("fade"));
  await wait(500);

  const deck=build78Deck();
  const picked=[];
  selected.forEach(()=>{
    const id=deck.splice(Math.random()*deck.length|0,1)[0];
    picked.push(id.replace(".png",""));
  });

  await fireToBigCards(picked);

  chat.classList.remove("hidden");
  chat.innerHTML="<p>🔮 리딩 중입니다…</p>";
  await fetchReading(CATEGORY_MAP[selectedCategory],picked,readingVersion);

  document.body.classList.remove("lock-scroll");
};

/* =====================================================
9. FIREBALL + REVEAL
===================================================== */
async function fireToBigCards(picked){
  const active=SLOT_SEQUENCE[readingVersion];

  selected.forEach((c,i)=>{
    const target=document.querySelector(`.slot-${active[i]}`);
    const fire=document.createElement("div");
    fire.className="fireball";
    document.body.appendChild(fire);

    const f=c.getBoundingClientRect();
    const t=target.getBoundingClientRect();

    fire.style.left=`${f.left+f.width/2}px`;
    fire.style.top=`${f.top+f.height/2}px`;
    play(sFire);

    fire.animate([
      {transform:"translate(0,0)"},
      {transform:`translate(${t.left-f.left}px,${t.top-f.top}px)`}
    ],{duration:1200,easing:"ease-in-out",fill:"forwards"});

    setTimeout(()=>fire.remove(),1200);
  });

  await wait(1200);
  play(sIgnite);

  active.forEach(s=>document.querySelector(`.slot-${s}`).classList.add("burning"));
  await wait(900);

  active.forEach((s,i)=>{
    const b=document.querySelector(`.slot-${s}`);
    b.classList.remove("burning");
    b.classList.add("smoking");
    b.style.backgroundImage=`url('/assets/tarot/${picked[i]}.png')`;
  });

  play(sReveal);
}

/* =====================================================
10. READING API
===================================================== */
const READING_API =
"https://script.google.com/macros/s/AKfycbx_WT8AGg2sVcI1EPpqDHWNXsBUtlaTOPovbCTN1Is63n3cIC8zLo2w-efI5-gMLt-h/exec";

async function fetchReading(category,cards,version){
  try{
    const r=await fetch(READING_API,{
      method:"POST",
      body:new URLSearchParams({category,version,cards:JSON.stringify(cards)})
    });
    const d=await r.json();
    chat.innerHTML=`<h3>🔮 리딩 결과</h3>${d.html}`;
  }catch(e){
    chat.innerHTML="<p>⚠️ 리딩 오류</p>";
  }
}

const wait=ms=>new Promise(r=>setTimeout(r,ms));
