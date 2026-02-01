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
const catArea   = document.getElementById("catArea");
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
  ({direction:["V1",1], advice:["V3",3], feeling:["V5",5], result:["V7",7]})
    [depth] && ([readingVersion, maxPickCount] =
      {direction:["V1",1], advice:["V3",3], feeling:["V5",5], result:["V7",7]}[depth]);
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
      step++;
      step<QUESTIONS.length ? renderQ() : (qArea.classList.add("hidden"), tArea.classList.remove("hidden"),
        tArea.querySelector("p").textContent=`카드 ${maxPickCount}장을 골라줘`);
    };
    qArea.appendChild(b);
  });
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
3. DOM
===================================================== */
const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const bigStage = document.getElementById("bigCardStage");
const reorderStage = document.getElementById("reorderStage");
const modal = document.getElementById("confirmModal");
const chat = document.getElementById("chatContainer");

const bigCards = document.querySelectorAll(".big-card");
const reorderCards = document.querySelectorAll(".reorder-card");

let selected = [];

/* =====================================================
4. 카드 선택 시작
===================================================== */
document.getElementById("goCard").onclick = ()=>{
  tArea.classList.add("hidden");
  catArea.classList.add("hidden"); // ✅ cat 숨김
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  applySlotVisibility();
  initSpread();
};

/* =====================================================
5. 슬롯 표시
===================================================== */
function applySlotVisibility(){
  const active = SLOT_SEQUENCE[readingVersion];
  bigCards.forEach(c=>{
    const s = +c.className.match(/slot-(\d)/)?.[1];
    c.classList.toggle("hidden", !active.includes(s));
    c.style.backgroundImage = "url('/assets/tarot/back.png')";
    c.classList.remove("burning","smoking");
  });
}

/* =====================================================
6. 78장
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
7. 확정 → 재정렬 → 파이어볼 → 리딩
===================================================== */
document.getElementById("confirmPick").onclick = async ()=>{
  modal.classList.add("hidden");

  const deck = build78Deck();
  const pickedCards = selected.map(()=>deck.splice(Math.random()*deck.length|0,1)[0].replace(".png",""));

  /* 🔒 재정렬 초기화 (이미지 주입 X) */
  reorderCards.forEach(c=>{
    c.style.backgroundImage = "url('/assets/tarot/back.png')";
  });

  reorderStage.classList.remove("hidden");
  await wait(500);

  /* ✅ 재정렬 카드 이미지 주입 */
  SLOT_SEQUENCE[readingVersion].forEach((slot,i)=>{
    const card = document.querySelector(`.reorder-card.slot-${slot}`);
    card.style.backgroundImage = `url('/assets/tarot/${pickedCards[i]}.png')`;
  });

  await wait(800);
  reorderStage.classList.add("hidden");

  await fireToBigCards(pickedCards);

  chat.classList.remove("hidden");
  chat.innerHTML="<p>🔮 리딩 중입니다…</p>";
  await fetchReading(CATEGORY_MAP[selectedCategory], pickedCards, readingVersion);
};

/* =====================================================
8. 파이어볼
===================================================== */
async function fireToBigCards(pickedCards){
  const active = SLOT_SEQUENCE[readingVersion];
  active.forEach((slot,i)=>{
    const b=document.querySelector(`.slot-${slot}`);
    b.classList.add("burning");
    b.style.backgroundImage=`url('/assets/tarot/${pickedCards[i]}.png')`;
  });
  play(sReveal);
}

/* =====================================================
UTIL
===================================================== */
const wait = ms => new Promise(r=>setTimeout(r,ms));
