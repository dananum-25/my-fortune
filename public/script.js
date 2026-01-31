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
const play = s => { if(!muted){ s.currentTime=0; s.play().catch(()=>{}); } };

/* =====================================================
1. 질문
===================================================== */
const catTextEl = document.getElementById("catText");
const qArea = document.getElementById("questionArea");
const tArea = document.getElementById("transitionArea");

const LABELS = {
  love:"연애", career:"직업 / 진로", money:"금전", relationship:"관계",
  direction:"방향성", advice:"조언", feeling:"상대의 마음", result:"결과"
};
const CATEGORY_MAP = {
  love:"연애", career:"직업", money:"금전", relationship:"관계"
};

const QUESTIONS = [
  { text:"지금 가장 마음에 걸리는 고민이 어떤 분야인지 골라줘.", options:["love","career","money","relationship"] },
  { text:"지금 가장 알고 싶은 것은?", options:["direction","advice","feeling","result"] }
];

let step=0, selectedCategory=null;
let readingVersion="V3", maxPickCount=3;

function applyReadingDepth(d){
  if(d==="direction"){ readingVersion="V1"; maxPickCount=1; }
  if(d==="advice"){ readingVersion="V3"; maxPickCount=3; }
  if(d==="feeling"){ readingVersion="V5"; maxPickCount=5; }
  if(d==="result"){ readingVersion="V7"; maxPickCount=7; }
}

function renderQ(){
  qArea.innerHTML="";
  const q=QUESTIONS[step];
  catTextEl.textContent=q.text;
  q.options.forEach(o=>{
    const b=document.createElement("button");
    b.textContent=LABELS[o];
    b.onclick=()=>{
      if(step===0) selectedCategory=o;
      if(step===1) applyReadingDepth(o);
      nextQ();
    };
    qArea.appendChild(b);
  });
}
function nextQ(){
  step++;
  if(step<QUESTIONS.length) renderQ();
  else{
    qArea.classList.add("hidden");
    tArea.classList.remove("hidden");
    tArea.querySelector("p").textContent=
      `지금 선택을 생각하며 카드를 ${maxPickCount}장 골라줘.`;
  }
}
renderQ();

/* =====================================================
2. 슬롯
===================================================== */
const SLOT_SEQUENCE={
  V1:[1],
  V3:[2,1,3],
  V5:[2,1,3,4,5],
  V7:[2,1,3,6,4,7,5]
};

/* =====================================================
3. 카드 덱
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
5. 슬롯 초기화 (중요)
===================================================== */
function resetBigCards(){
  const active=SLOT_SEQUENCE[readingVersion];
  bigCards.forEach(c=>{
    const s=Number(c.className.match(/slot-(\d)/)[1]);
    if(!active.includes(s)){
      c.classList.add("hidden");
    }else{
      c.classList.remove("hidden","burning","smoking");
      c.style.opacity="0";
      c.style.transform="translate(-50%,-50%) scale(.92)";
      c.style.backgroundImage="url('/assets/tarot/back.png')";
    }
  });
}

/* =====================================================
6. 카드 선택
===================================================== */
document.getElementById("goCard").onclick=()=>{
  tArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");
  document.querySelector(".picker-title").textContent=
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;
  resetBigCards();
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
7. 확정
===================================================== */
document.getElementById("confirmPick").onclick=async()=>{
  modal.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  document.querySelectorAll(".pick:not(.sel)")
    .forEach(c=>c.classList.add("fade"));

  await wait(600);

  const deck=build78Deck();
  const picked=[];
  selected.forEach(()=>{
    picked.push(deck.splice(Math.random()*deck.length|0,1)[0].replace(".png",""));
  });

  await fireToBigCards(picked);

  chat.classList.remove("hidden");
  chat.innerHTML="<p>🔮 리딩 중입니다…</p>";
  await fetchReading(CATEGORY_MAP[selectedCategory],picked,readingVersion);
  document.body.classList.remove("lock-scroll");
};

/* =====================================================
8. 파이어볼 + 공개 (🔥 핵심)
===================================================== */
async function fireToBigCards(picked){
  const active=SLOT_SEQUENCE[readingVersion];

  selected.forEach((c,i)=>{
    const slot=active[i];
    const target=document.querySelector(`.slot-${slot}`);

    const fire=document.createElement("div");
    fire.className="fireball";
    document.body.appendChild(fire);

    const f=c.getBoundingClientRect();
    const t=target.getBoundingClientRect();

    fire.style.left=`${f.left+f.width/2}px`;
    fire.style.top=`${f.top+f.height/2}px`;
    play(sFire);

    fire.animate([
      {transform:"translate(0,0) scale(.6)"},
      {transform:`translate(${t.left-f.left}px,${t.top-f.top}px) scale(1)`}
    ],{duration:1600,easing:"cubic-bezier(.25,.8,.25,1)",fill:"forwards"});

    setTimeout(()=>fire.remove(),1600);
  });

  await wait(1700);
  play(sIgnite);

  active.forEach((s,i)=>{
    const b=document.querySelector(`.slot-${s}`);
    b.style.backgroundImage=`url('/assets/tarot/${picked[i]}.png')`;
    b.animate([
      {opacity:0, transform:"translate(-50%,-50%) scale(.92)"},
      {opacity:1, transform:"translate(-50%,-50%) scale(1)"}
    ],{duration:900,easing:"ease-out",fill:"forwards"});
  });

  play(sReveal);
}

/* =====================================================
9. API
===================================================== */
const READING_API="https://script.google.com/macros/s/AKfycbx_WT8AGg2sVcI1EPpqDHWNXsBUtlaTOPovbCTN1Is63n3cIC8zLo2w-efI5-gMLt-h/exec";
async function fetchReading(category,cards,version){
  const r=await fetch(READING_API,{
    method:"POST",
    body:new URLSearchParams({category,version,cards:JSON.stringify(cards)})
  });
  const d=await r.json();
  chat.innerHTML=`<h3>🔮 리딩 결과</h3>${d.html}`;
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
