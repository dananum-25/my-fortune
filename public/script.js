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
1. 질문
===================================================== */
const catTextEl = document.getElementById("catText");

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

const qArea = document.getElementById("questionArea");
const tArea = document.getElementById("transitionArea");

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
      step < QUESTIONS.length ? renderQ() : finishQuestions();
    };
    qArea.appendChild(b);
  });
}

function finishQuestions(){
  qArea.classList.add("hidden");
  tArea.classList.remove("hidden");
  tArea.querySelector("p").textContent =
    `지금 선택을 생각하며 카드를 ${maxPickCount}장 골라줘.`;
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
3. 덱
===================================================== */
function build78Deck(){
  const d=[];
  [
    "00_the_fool","01_the_magician","02_the_high_priestess","03_the_empress",
    "04_the_emperor","05_the_hierophant","06_the_lovers","07_the_chariot",
    "08_strength","09_the_hermit","10_wheel_of_fortune","11_justice",
    "12_the_hanged_man","13_death","14_temperance","15_the_devil",
    "16_the_tower","17_the_star","18_the_moon","19_the_sun",
    "20_judgement","21_the_world"
  ].forEach(n=>d.push(`majors/${n}.png`));

  ["cups","wands","swords","pentacles"].forEach(s=>{
    for(let i=1;i<=14;i++){
      d.push(`minors/${s}/${String(i).padStart(2,"0")}.png`);
    }
  });
  return d;
}

/* =====================================================
4. DOM
===================================================== */
const grid=document.getElementById("grid78");
const spread=document.getElementById("spreadSection");
const bigStage=document.getElementById("bigCardStage");
const bigCards=document.querySelectorAll(".big-card");
const modal=document.getElementById("confirmModal");
const chat=document.getElementById("chatContainer");

let selected=[];

/* =====================================================
5. 재정렬
===================================================== */
let reorderArea=null;
function showReorder(cards){
  if(reorderArea) reorderArea.remove();

  reorderArea=document.createElement("div");
  reorderArea.className="reorder-area";

  cards.forEach(c=>{
    const d=document.createElement("div");
    d.className="reorder-card";
    d.style.backgroundImage=`url('/assets/tarot/${c}.png')`;
    reorderArea.appendChild(d);
  });

  bigStage.insertAdjacentElement("afterend",reorderArea);
}

/* =====================================================
6. 카드 선택
===================================================== */
document.getElementById("goCard").onclick=()=>{
  tArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");
  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;
  initSpread();
};

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
7. 확정 → 연출
===================================================== */
document.getElementById("confirmPick").onclick=async()=>{
  modal.classList.add("hidden");

  document.querySelectorAll(".pick:not(.sel)").forEach(c=>c.classList.add("fade"));
  await wait(450);

  const deck=build78Deck();
  const picked=selected.map(()=>deck.splice(Math.random()*deck.length|0,1)[0].replace(".png",""));

  showReorder(picked);
  await wait(900);
  reorderArea.remove();

  await fireToBigCards(picked);

  chat.classList.remove("hidden");
  chat.innerHTML="<p>🔮 리딩 중입니다…</p>";

  await fetchReading(CATEGORY_MAP[selectedCategory],picked,readingVersion);
};

/* =====================================================
8. 파이어볼 → 빅카드
===================================================== */
async function fireToBigCards(cards){
  const slots=SLOT_SEQUENCE[readingVersion];

  bigCards.forEach(b=>{
    b.classList.remove("hidden","burning","smoking");
    b.style.backgroundImage="url('/assets/tarot/back.png')";
  });

  selected.forEach((c,i)=>{
    const slot=document.querySelector(`.slot-${slots[i]}`);
    const fire=document.createElement("div");
    fire.className="fireball";
    document.body.appendChild(fire);

    const a=c.getBoundingClientRect();
    const b=slot.getBoundingClientRect();

    fire.style.left=`${a.left+a.width/2}px`;
    fire.style.top=`${a.top+a.height/2}px`;

    play(sFire);

    fire.animate([
      {transform:"translate(0,0)"},
      {transform:`translate(${b.left-a.left}px,${b.top-a.top}px)`}
    ],{duration:1100,easing:"ease-in-out",fill:"forwards"});

    setTimeout(()=>fire.remove(),1200);
  });

  await wait(1100);
  play(sIgnite);

  slots.forEach(s=>document.querySelector(`.slot-${s}`).classList.add("burning"));
  await wait(900);

  slots.forEach((s,i)=>{
    const b=document.querySelector(`.slot-${s}`);
    b.classList.remove("burning");
    b.classList.add("smoking");
    b.style.backgroundImage=`url('/assets/tarot/${cards[i]}.png')`;
  });

  play(sReveal);
}

/* =====================================================
9. API
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
    chat.innerHTML="<p>⚠️ 리딩 실패</p>";
  }
}

const wait=ms=>new Promise(r=>setTimeout(r,ms));
