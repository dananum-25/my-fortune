/* =====================================================
0. 사운드
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
1. 질문 단계
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
let selectedDepth = null;

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
      if(step===2){ selectedDepth=o; applyReadingDepth(o); }
      nextQ();
    };
    qArea.appendChild(b);
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
2. 슬롯 정의
===================================================== */
const SLOT_SEQUENCE = {
  V1:[1],
  V3:[2,1,3],
  V5:[2,1,3,4,5],
  V7:[2,1,3,6,4,7,5]
};

/* =====================================================
3. 카드 덱
===================================================== */
function build78Deck(){
  const d=[];
  for(let i=0;i<78;i++) d.push(`card_${i}`);
  return d;
}

/* =====================================================
4. DOM refs
===================================================== */
const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const bigStage = document.getElementById("bigCardStage");
const bigCards = document.querySelectorAll(".big-card");
const modal = document.getElementById("confirmModal");
const chat = document.getElementById("chatContainer");

let selected=[];

/* =====================================================
5. 슬롯 표시
===================================================== */
function applySlotVisibility(cardList){
  const active = SLOT_SEQUENCE[readingVersion];
  cardList.forEach(c=>{
    const m = c.className.match(/slot-(\d)/);
    if(!m) return;
    const slot = Number(m[1]);
    if(!active.includes(slot)){
      c.classList.add("hidden");
    }else{
      c.classList.remove("hidden","burning","smoking");
      c.style.opacity = "0";
      c.style.backgroundImage = "url('/assets/tarot/back.png')";
    }
  });
}

/* =====================================================
6. 카드 선택
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
  if(selected.length===maxPickCount) modal.classList.remove("hidden");
}

/* =====================================================
7. 시작
===================================================== */
document.getElementById("goCard").onclick=()=>{
  tArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  applySlotVisibility(bigCards);
  initSpread();
};

document.getElementById("resetAll").onclick=()=>location.reload();

/* =====================================================
8. 확정 → 빅카드 표시
===================================================== */
document.getElementById("confirmPick").onclick=async()=>{
  modal.classList.add("hidden");

  const deck = build78Deck();
  const picked=[];
  selected.forEach(()=>{
    picked.push(deck.splice(Math.random()*deck.length|0,1)[0]);
  });

  applySlotVisibility(bigCards);
  await wait(500);

  const active = SLOT_SEQUENCE[readingVersion];
  active.forEach((slot,i)=>{
    const b=document.querySelector(`.slot-${slot}`);
    b.style.backgroundImage=`url('/assets/tarot/${picked[i]}.png')`;
    b.style.opacity="1";
    b.classList.add("smoking");
  });

  play(sReveal);
};

const wait = ms => new Promise(r=>setTimeout(r,ms));
