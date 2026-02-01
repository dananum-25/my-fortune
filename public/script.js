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
const catTextEl = document.getElementById("catText");
const qArea     = document.getElementById("questionArea");
const tArea     = document.getElementById("transitionArea");

const bigStage  = document.getElementById("bigCardStage");
const bigCards  = bigStage.querySelectorAll(".big-card");

const spread    = document.getElementById("spreadSection");
const grid78    = document.getElementById("grid78");

const modal     = document.getElementById("confirmModal");
const chat      = document.getElementById("chatContainer");

const goBtn     = document.getElementById("goCard");
const resetBtn  = document.getElementById("resetAll");
const confirmBtn= document.getElementById("confirmPick");

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

/* =====================================================
3. QUESTION DATA (카드형 큰 버튼 유지)
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
  switch(d){
    case "direction": readingVersion="V1"; maxPickCount=1; break;
    case "advice":    readingVersion="V3"; maxPickCount=3; break;
    case "feeling":   readingVersion="V5"; maxPickCount=5; break;
    case "result":    readingVersion="V7"; maxPickCount=7; break;
  }
}

/* =====================================================
4. STAGE VISIBILITY LOCK (질문 단계 강제)
===================================================== */
function enterQuestionPhase(){
  document.body.classList.add("phase-question");

  // 질문 단계에서만 보여야 하는 것
  qArea.classList.remove("hidden");
  tArea.classList.add("hidden");

  // 질문 단계에서는 절대 노출되면 안 되는 것
  bigStage.classList.add("hidden");
  spread.classList.add("hidden");
  modal.classList.add("hidden");
  chat.classList.add("hidden");
}

function enterTransitionPhase(){
  document.body.classList.add("phase-question");

  qArea.classList.add("hidden");
  tArea.classList.remove("hidden");

  // 카드 영역은 여전히 숨김 (YES 누르기 전까지)
  bigStage.classList.add("hidden");
  spread.classList.add("hidden");
  modal.classList.add("hidden");
  chat.classList.add("hidden");
}

function enterCardPhase(){
  document.body.classList.remove("phase-question");

  tArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  // 리딩 영역/모달은 상황에 따라
  chat.classList.add("hidden");
  modal.classList.add("hidden");
}

/* =====================================================
5. RENDER QUESTIONS (catText 단일 출력)
===================================================== */
function renderQ(){
  qArea.innerHTML = "";
  const q = QUESTIONS[step];
  catTextEl.textContent = q.text;

  q.options.forEach(o=>{
    const btn = document.createElement("button");
    btn.className = "q-card";               // ✅ 카드형 큰 버튼
    btn.textContent = LABELS[o];
    btn.onclick = ()=>{
      if(step===0) selectedCategory = o;
      if(step===1) selectedTime = o;
      if(step===2){ selectedDepth = o; applyReadingDepth(o); }
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
    // 질문 끝 → 전환 화면(YES/처음으로)
    enterTransitionPhase();
    tArea.querySelector("p").textContent =
      `지금 선택을 생각하며 카드를 ${maxPickCount}장 골라줘.`;
  }
}

/* =====================================================
6. SLOT SEQUENCE (LOCK)
213
..6
475
===================================================== */
const SLOT_SEQUENCE = {
  V1:[1],
  V3:[2,1,3],
  V5:[2,1,3,4,5],
  V7:[2,1,3,6,4,7,5]
};

/* =====================================================
7. DECK
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
const MINOR_NAMES={
  "01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six",
  "07":"seven","08":"eight","09":"nine","10":"ten",
  "11":"page","12":"knight","13":"queen","14":"king"
};

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
8. BIG SLOT VISIBILITY (뒷면 고정, n장만 노출)
===================================================== */
function applySlotVisibility(){
  const active = SLOT_SEQUENCE[readingVersion];
  bigCards.forEach(c=>{
    const m = c.className.match(/slot-(\d)/);
    const slot = m ? Number(m[1]) : -1;

    if(!active.includes(slot)){
      c.classList.add("hidden");
    }else{
      c.classList.remove("hidden","burning","smoking");
      c.style.backgroundImage = "url('/assets/tarot/back.png')";
    }
  });
}

/* =====================================================
9. 78 GRID
===================================================== */
function initSpread(){
  grid78.innerHTML = "";
  selected = [];

  for(let i=0;i<78;i++){
    const d = document.createElement("div");
    d.className = "pick";
    d.onclick = ()=>pick(d);
    grid78.appendChild(d);
  }
}

function pick(card){
  if(card.classList.contains("sel")){
    card.classList.remove("sel");
    selected = selected.filter(x=>x!==card);
    return;
  }
  if(selected.length >= maxPickCount) return;

  card.classList.add("sel");
  selected.push(card);
  play(sPick);

  if(selected.length === maxPickCount){
    modal.classList.remove("hidden");
  }
}

/* =====================================================
10. FLOW BUTTONS
===================================================== */
goBtn.onclick = ()=>{
  // ✅ 질문 3개 끝난 다음에만 진입
  if(step < QUESTIONS.length){
    // (혹시 이상 상태로 눌려도 무시)
    return;
  }

  enterCardPhase();

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  // ✅ 카드 영역 초기화
  applySlotVisibility();
  initSpread();

  // ✅ 화면 포커스
  bigStage.scrollIntoView({ behavior:"smooth", block:"start" });
};

resetBtn.onclick = ()=>location.reload();

/* =====================================================
11. CONFIRM → (재정렬은 다음 단계에서 붙일 것)
- 지금은 "질문 단계에서 카드 영역이 나오지 않게" + "YES 누르면 정상 등장"
- 앞면 공개는 BIGCARD에서만
===================================================== */
confirmBtn.onclick = async ()=>{
  modal.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  // 선택 외 카드 흐리기
  document.querySelectorAll(".pick:not(.sel)").forEach(c=>c.classList.add("fade"));
  await wait(650);

  const deck = build78Deck();
  const picked = [];
  selected.forEach(()=>{
    const id = deck.splice(Math.random()*deck.length|0, 1)[0];
    picked.push(id.replace(".png",""));
  });

  // ✅ 앞면 공개는 여기서만 (빅카드)
  await fireToBigCards(picked);

  // 리딩 영역 표시
  chat.classList.remove("hidden");
  chat.innerHTML = "<p>🔮 리딩 중입니다…</p>";
  chat.scrollIntoView({behavior:"smooth", block:"start"});

  await fetchReading(CATEGORY_MAP[selectedCategory], picked, readingVersion);

  document.body.classList.remove("lock-scroll");
};

/* =====================================================
12. FIREBALL → BIG CARD (느린 연출 복구)
===================================================== */
async function fireToBigCards(picked){
  const active = SLOT_SEQUENCE[readingVersion];
  applySlotVisibility();

  // fireball
  selected.forEach((c,i)=>{
    const slot = active[i];
    const target = document.querySelector(`.slot-${slot}`);

    const fire = document.createElement("div");
    fire.className = "fireball";
    document.body.appendChild(fire);

    const f = c.getBoundingClientRect();
    const t = target.getBoundingClientRect();

    fire.style.left = `${f.left + f.width/2}px`;
    fire.style.top  = `${f.top  + f.height/2}px`;

    play(sFire);

    fire.animate([
      { transform:"translate(0,0)" },
      { transform:`translate(${(t.left+t.width/2)-(f.left+f.width/2)}px,${(t.top+t.height/2)-(f.top+f.height/2)}px)` }
    ], { duration:1500, easing:"ease-in-out", fill:"forwards" });

    setTimeout(()=>fire.remove(),1500);
  });

  await wait(1500);
  play(sIgnite);

  // burning
  active.forEach(s=>{
    const el = document.querySelector(`.slot-${s}`);
    if(el) el.classList.add("burning");
  });

  await wait(1200);

  // reveal
  active.forEach((s,i)=>{
    const b = document.querySelector(`.slot-${s}`);
    if(!b) return;
    b.classList.remove("burning");
    b.classList.add("smoking");
    b.style.backgroundImage = `url('/assets/tarot/${picked[i]}.png')`;
  });

  play(sReveal);
  await wait(900);
}

/* =====================================================
13. READING API
===================================================== */
const READING_API =
"https://script.google.com/macros/s/AKfycbx_WT8AGg2sVcI1EPpqDHWNXsBUtlaTOPovbCTN1Is63n3cIC8zLo2w-efI5-gMLt-h/exec";

async function fetchReading(category, cards, version){
  try{
    const r = await fetch(READING_API,{
      method:"POST",
      body:new URLSearchParams({
        category,
        version,
        cards: JSON.stringify(cards)
      })
    });
    const d = await r.json();
    chat.innerHTML = `<h3>🔮 리딩 결과</h3>${d.html}`;
  }catch(e){
    chat.innerHTML = "<p>⚠️ 리딩 오류</p>";
  }
}

/* util */
const wait = (ms)=>new Promise(r=>setTimeout(r,ms));

/* =====================================================
14. INIT (절대 카드영역 선노출 금지)
===================================================== */
enterQuestionPhase();
renderQ();
