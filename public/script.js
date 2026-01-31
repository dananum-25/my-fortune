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
document.getElementById("soundToggle").onclick = () => {
  muted = !muted;
  document.getElementById("soundToggle").textContent = muted ? "사운드 🔇" : "사운드 🔊";
  muted ? bgm.pause() : bgm.play().catch(()=>{});
};

const play = s => { if(!muted){ s.currentTime=0; s.play().catch(()=>{}); } };

/* =====================================================
1. 질문 로직
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

let step=0, selectedCategory=null;
let readingVersion="V3", maxPickCount=3;

function applyReadingDepth(d){
  ({direction:["V1",1], advice:["V3",3], feeling:["V5",5], result:["V7",7]}[d] || ["V3",3])
    .forEach((v,i)=> i===0?readingVersion=v:maxPickCount=v);
}

function renderQ(){
  qArea.innerHTML="";
  catTextEl.textContent = QUESTIONS[step].text;
  QUESTIONS[step].options.forEach(o=>{
    const b=document.createElement("button");
    b.textContent=LABELS[o];
    b.onclick=()=>{
      if(step===0) selectedCategory=o;
      if(step===2) applyReadingDepth(o);
      step++;
      step<QUESTIONS.length ? renderQ() : showTransition();
    };
    qArea.appendChild(b);
  });
}

function showTransition(){
  qArea.classList.add("hidden");
  tArea.classList.remove("hidden");
  tArea.querySelector("p").textContent = `지금 선택을 생각하며 카드를 ${maxPickCount}장 골라줘.`;
}

renderQ();

/* =====================================================
2. 슬롯 구조 (고정)
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
  const MAJORS=[...Array(22)].map((_,i)=>`majors/${String(i).padStart(2,"0")}_*.png`);
  const SUITS=["cups","wands","swords","pentacles"];
  const NAMES=["ace","two","three","four","five","six","seven","eight","nine","ten","page","knight","queen","king"];
  const d=[];
  MAJORS.forEach(f=>d.push(f));
  SUITS.forEach(s=>NAMES.forEach((n,i)=>d.push(`minors/${s}/${String(i+1).padStart(2,"0")}_${n}.png`)));
  return d;
}

/* =====================================================
4. DOM
===================================================== */
const grid=document.getElementById("grid78");
const spread=document.getElementById("spreadSection");
const bigStage=document.getElementById("bigCardStage");
const bigCards=[...document.querySelectorAll(".big-card")];
const modal=document.getElementById("confirmModal");
const chat=document.getElementById("chatContainer");

let selected=[];

/* =====================================================
5. 재정렬 영역 (빅카드 동일 구조)
===================================================== */
let reorderStage=null;
function ensureReorderStage(){
  if(reorderStage) return reorderStage;
  reorderStage=document.createElement("section");
  reorderStage.className="tarot-stage";
  reorderStage.innerHTML = `
    <div class="big-cards v7-layout reorder">
      ${[2,1,3,6,4,7,5].map(s=>`<div class="big-card slot-${s}"></div>`).join("")}
    </div>`;
  bigStage.after(reorderStage);
  return reorderStage;
}

/* =====================================================
6. 카드 선택
===================================================== */
document.getElementById("goCard").onclick=()=>{
  tArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");
  document.querySelector(".picker-title").textContent=`마음이 가는 카드 ${maxPickCount}장을 골라줘`;
  initSpread();
};

function initSpread(){
  grid.innerHTML=""; selected=[];
  for(let i=0;i<78;i++){
    const d=document.createElement("div");
    d.className="pick";
    d.onclick=()=>pick(d);
    grid.appendChild(d);
  }
}

function pick(c){
  if(c.classList.contains("sel")){
    c.classList.remove("sel");
    selected=selected.filter(x=>x!==c);
    return;
  }
  if(selected.length>=maxPickCount) return;
  c.classList.add("sel");
  selected.push(c);
  play(sPick);
  if(selected.length===maxPickCount) modal.classList.remove("hidden");
}

/* =====================================================
7. 확정 → 재정렬 → 파이어볼
===================================================== */
document.getElementById("confirmPick").onclick=async()=>{
  modal.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  const deck=build78Deck();
  const picked=selected.map(()=>deck.splice(Math.random()*deck.length|0,1)[0].replace(".png",""));

  // 재정렬
  const rs=ensureReorderStage();
  const rsCards=[...rs.querySelectorAll(".big-card")];
  rsCards.forEach(c=>c.style.backgroundImage="url('/assets/tarot/back.png')");
  SLOT_SEQUENCE[readingVersion].forEach((s,i)=>{
    rs.querySelector(`.slot-${s}`).style.backgroundImage=`url('/assets/tarot/${picked[i]}.png')`;
  });

  await wait(900);
  rs.remove();

  await fireToBigCards(picked);

  chat.classList.remove("hidden");
  chat.innerHTML="<p>🔮 리딩 중입니다…</p>";
  await fetchReading(CATEGORY_MAP[selectedCategory],picked,readingVersion);

  document.body.classList.remove("lock-scroll");
};

async function fireToBigCards(picked){
  bigCards.forEach(c=>{
    c.style.backgroundImage="url('/assets/tarot/back.png')";
    c.classList.remove("hidden","burning","smoking");
  });

  const active=SLOT_SEQUENCE[readingVersion];
  selected.forEach((c,i)=>{
    const t=document.querySelector(`.slot-${active[i]}`);
    const fire=document.createElement("div");
    fire.className="fireball";
    document.body.appendChild(fire);

    const f=c.getBoundingClientRect(), to=t.getBoundingClientRect();
    fire.style.left=`${f.left+f.width/2}px`;
    fire.style.top=`${f.top+f.height/2}px`;

    play(sFire);
    fire.animate([{transform:"translate(0,0)"},{
      transform:`translate(${to.left-f.left}px,${to.top-f.top}px)`
    }],{duration:1200,fill:"forwards"});

    setTimeout(()=>fire.remove(),1200);
  });

  await wait(1200); play(sIgnite);
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

const wait=ms=>new Promise(r=>setTimeout(r,ms));

/* =====================================================
8. 리딩 API
===================================================== */
const READING_API="https://script.google.com/macros/s/AKfycbx_WT8AGg2sVcI1EPpqDHWNXsBUtlaTOPovbCTN1Is63n3cIC8zLo2w-efI5-gMLt-h/exec";
async function fetchReading(category,cards,version){
  try{
    const r=await fetch(READING_API,{method:"POST",body:new URLSearchParams({category,version,cards:JSON.stringify(cards)})});
    const d=await r.json();
    chat.innerHTML=`<h3>🔮 리딩 결과</h3>${d.html}`;
  }catch{
    chat.innerHTML="<p>⚠️ 리딩 오류</p>";
  }
}
