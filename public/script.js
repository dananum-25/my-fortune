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
1. QUESTION FLOW
===================================================== */
const catTextEl = document.getElementById("catText");
const qArea = document.getElementById("questionArea");
const tArea = document.getElementById("transitionArea");

const QUESTIONS = [
  { text:"지금 가장 마음에 걸리는 고민이 어떤 분야인지 골라줘.", options:["연애","직업","금전","관계"] },
  { text:"이 고민은 언제쯤의 이야기인가요?", options:["과거","현재","미래"] },
  { text:"지금 가장 알고 싶은 것은?", options:["방향성","조언","상대의 마음","결과"] }
];

let step = 0;
let readingVersion = "V3";
let maxPickCount = 3;

let selectedCategory = "";
let selectedTime = "";
let selectedDepth = "";

function applyDepth(text){
  selectedDepth = text;
  if(text==="방향성"){ readingVersion="V1"; maxPickCount=1; }
  if(text==="조언"){ readingVersion="V3"; maxPickCount=3; }
  if(text==="상대의 마음"){ readingVersion="V5"; maxPickCount=5; }
  if(text==="결과"){ readingVersion="V7"; maxPickCount=7; }
}

function renderQuestion(){
  qArea.innerHTML = "";
  catTextEl.textContent = QUESTIONS[step].text;

  QUESTIONS[step].options.forEach(opt=>{
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = ()=>{
      if(step===0) selectedCategory = opt;
      if(step===1) selectedTime = opt;
      if(step===2) applyDepth(opt);

      step++;
      step < QUESTIONS.length ? renderQuestion() : showTransition();
    };
    qArea.appendChild(btn);
  });
}

function showTransition(){
  qArea.classList.add("hidden");
  tArea.classList.remove("hidden");
  tArea.querySelector("p").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘.`;
}

renderQuestion();

/* =====================================================
2. SLOT MAP (LOCKED)
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
const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const bigStage = document.getElementById("bigCardStage");
const modal = document.getElementById("confirmModal");
const chat = document.getElementById("chatContainer");

let selected = [];

/* =====================================================
4. START PICK
===================================================== */
document.getElementById("goCard").onclick = ()=>{
  tArea.classList.add("hidden");
  spread.classList.remove("hidden");
  bigStage.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  initGrid();
};

/* =====================================================
5. 78 CARD GRID
===================================================== */
function initGrid(){
  grid.innerHTML = "";
  selected = [];

  for(let i=0;i<78;i++){
    const card = document.createElement("div");
    card.className = "pick";
    card.onclick = ()=>pick(card);
    grid.appendChild(card);
  }
}

function pick(card){
  if(card.classList.contains("sel")){
    card.classList.remove("sel");
    selected = selected.filter(c=>c!==card);
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
6. CONFIRM → FIRE → READING
===================================================== */
document.getElementById("confirmPick").onclick = async ()=>{
  modal.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  const deck = buildDeck();
  const pickedCards = selected.map(()=>{
    return deck.splice(Math.floor(Math.random()*deck.length),1)[0];
  });

  // 선택 카드 제거 (앞면 노출 방지)
  selected.forEach(c=>c.remove());
  selected = [];

  await fireToBigCards(pickedCards);

  chat.classList.remove("hidden");
  chat.innerHTML = "<p>🔮 리딩 중입니다…</p>";

  await fetchReading(pickedCards);

  document.body.classList.remove("lock-scroll");
};

/* =====================================================
7. DECK (NORMALIZED SIZE)
===================================================== */
function buildDeck(){
  const deck = [];

  for(let i=0;i<=21;i++){
    deck.push(`majors/${String(i).padStart(2,"0")}`);
  }

  ["cups","wands","swords","pentacles"].forEach(suit=>{
    for(let i=1;i<=14;i++){
      deck.push(`minors/${suit}/${String(i).padStart(2,"0")}`);
    }
  });

  return deck;
}

/* =====================================================
8. FIREBALL → BIG CARD
===================================================== */
async function fireToBigCards(cards){
  const slots = SLOT_MAP[readingVersion];
  const wrap = document.querySelector(".big-cards");

  wrap.innerHTML = "";

  slots.forEach(slot=>{
    const el = document.createElement("div");
    el.className = `big-card slot-${slot}`;
    el.style.backgroundImage = "url('/assets/tarot/back.png')";
    wrap.appendChild(el);
  });

  await wait(700);
  play(sFire);

  await wait(900);
  play(sIgnite);

  slots.forEach(slot=>{
    document.querySelector(`.slot-${slot}`).classList.add("burning");
  });

  await wait(1100);

  slots.forEach((slot,i)=>{
    const el = document.querySelector(`.slot-${slot}`);
    el.classList.remove("burning");
    el.classList.add("smoking");
    el.style.backgroundImage =
      `url('/assets/tarot/${cards[i]}.png')`;
  });

  play(sReveal);
}

/* =====================================================
9. READING API (🔥 누락됐던 부분)
===================================================== */
const READING_API =
"https://script.google.com/macros/s/AKfycbx_WT8AGg2sVcI1EPpqDHWNXsBUtlaTOPovbCTN1Is63n3cIC8zLo2w-efI5-gMLt-h/exec";

async function fetchReading(cards){
  try{
    const res = await fetch(READING_API,{
      method:"POST",
      body:new URLSearchParams({
        category: selectedCategory,
        time: selectedTime,
        depth: selectedDepth,
        version: readingVersion,
        cards: JSON.stringify(cards)
      })
    });

    const data = await res.json();
    if(data.status !== "success") throw new Error();

    chat.innerHTML = `<h3>🔮 리딩 결과</h3>${data.html}`;
    chat.scrollIntoView({behavior:"smooth"});

  }catch(e){
    chat.innerHTML = "<p>⚠️ 리딩 오류가 발생했습니다.</p>";
  }
}

/* =====================================================
UTIL
===================================================== */
const wait = ms => new Promise(r=>setTimeout(r,ms));
