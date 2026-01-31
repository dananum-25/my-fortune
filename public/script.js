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
    try{
      sound.currentTime = 0;
      sound.play().catch(()=>{});
    }catch(_){}
  }
}

/* =====================================================
(설정) 연출 타이밍
===================================================== */
const TIMING = {
  fadeOthers: 450,
  fireTravel: 1100,
  igniteHold: 900,
  revealHold: 650
};

/* =====================================================
1. 질문 단계 (catText 단일 사용)
===================================================== */
const catTextEl = document.getElementById("catText");
const qArea = document.getElementById("questionArea");
const tArea = document.getElementById("transitionArea");

const LABELS = {
  love: "연애",
  career: "직업 / 진로",
  money: "금전",
  relationship: "관계",
  past: "과거",
  present: "현재",
  future: "미래",
  direction: "방향성",
  advice: "조언",
  feeling: "상대의 마음",
  result: "결과"
};

const CATEGORY_MAP = {
  love: "연애",
  career: "직업",
  money: "금전",
  relationship: "관계"
};

const QUESTIONS = [
  { text:"지금 가장 마음에 걸리는 고민이 어떤 분야인지 골라줘.", options:["love","career","money","relationship"] },
  { text:"이 고민은 언제쯤의 이야기인가요?", options:["past","present","future"] },
  { text:"지금 가장 알고 싶은 것은?", options:["direction","advice","feeling","result"] }
];

let step = 0;
let selectedCategory = null;
let selectedTime = null;
let selectedDepth = null;

let readingVersion = "V3";
let maxPickCount = 3;

function applyReadingDepth(depth){
  switch(depth){
    case "direction": readingVersion="V1"; maxPickCount=1; break;
    case "advice":    readingVersion="V3"; maxPickCount=3; break;
    case "feeling":   readingVersion="V5"; maxPickCount=5; break;
    case "result":    readingVersion="V7"; maxPickCount=7; break;
  }
}

function renderQ(){
  qArea.innerHTML = "";
  const q = QUESTIONS[step];
  catTextEl.textContent = q.text;

  q.options.forEach(o=>{
    const b = document.createElement("button");
    b.textContent = LABELS[o];
    b.onclick = ()=>{
      if(step === 0) selectedCategory = o;
      if(step === 1) selectedTime = o;
      if(step === 2){
        selectedDepth = o;
        applyReadingDepth(o);
      }
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
2. 슬롯 정의 (LOCK)
V7:
2 1 3
. 6 .
4 7 5
===================================================== */
const SLOT_SEQUENCE = {
  V1: [1],
  V3: [2,1,3],
  V5: [2,1,3,4,5],
  V7: [2,1,3,6,4,7,5]
};

/* =====================================================
3. 카드 덱 (78)
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
const SUITS = ["cups","wands","swords","pentacles"];
const MINOR_NAMES = {
  "01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six",
  "07":"seven","08":"eight","09":"nine","10":"ten",
  "11":"page","12":"knight","13":"queen","14":"king"
};

function build78Deck(){
  const d = [];
  MAJORS.forEach(f => d.push(`majors/${f}`));
  SUITS.forEach(s=>{
    Object.keys(MINOR_NAMES).forEach(n=>{
      d.push(`minors/${s}/${n}_${MINOR_NAMES[n]}.png`);
    });
  });
  return d;
}

/* =====================================================
4. DOM refs
===================================================== */
const grid     = document.getElementById("grid78");
const spread   = document.getElementById("spreadSection");
const bigStage = document.getElementById("bigCardStage");
const bigCards = Array.from(document.querySelectorAll("#bigCardStage .big-card"));
const modal    = document.getElementById("confirmModal");
const chat     = document.getElementById("chatContainer");

let selected = [];           // grid pick DOM들
let pickedCards = [];        // 실제 뽑힌 카드 id (majors/xx... 형태, .png 제거)

/* =====================================================
5. 상태 리셋/슬롯 표시 (절대: 앞면 미리 세팅 금지)
===================================================== */
function resetBigCardsToBack(){
  bigCards.forEach(c=>{
    c.classList.remove("burning","smoking","hidden");
    c.style.backgroundImage = "url('/assets/tarot/back.png')";
    c.style.opacity = "1";
  });
}

function applySlotVisibilityToStage(){
  const active = SLOT_SEQUENCE[readingVersion];
  bigCards.forEach(card=>{
    const m = card.className.match(/slot-(\d)/);
    const slot = m ? Number(m[1]) : null;

    if(!slot || !active.includes(slot)){
      card.classList.add("hidden");
    }else{
      card.classList.remove("hidden","burning","smoking");
      // ✅ 항상 back으로 초기화 (앞면 깜빡임 원천 차단)
      card.style.backgroundImage = "url('/assets/tarot/back.png')";
      card.style.opacity = "1";
    }
  });
}

/* =====================================================
6. go / reset
===================================================== */
document.getElementById("goCard").onclick = ()=>{
  tArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  // ✅ 빅카드: back + 슬롯 n장만 표시
  resetBigCardsToBack();
  applySlotVisibilityToStage();

  initSpread();
};

document.getElementById("resetAll").onclick = ()=>location.reload();

/* =====================================================
7. 78 grid
===================================================== */
function initSpread(){
  grid.innerHTML = "";
  selected = [];
  pickedCards = [];

  for(let i=0;i<78;i++){
    const d = document.createElement("div");
    d.className = "pick";
    d.onclick = ()=>pick(d);
    grid.appendChild(d);
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
8. 확정 → 파이어볼 → 점화/연기 → 앞면 reveal → 리딩
(재정렬 영역 제거: 깜빡임/겹침 원인 컷)
===================================================== */
document.getElementById("confirmPick").onclick = async ()=>{
  modal.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  // 선택 외 카드 흐리기
  document.querySelectorAll(".pick:not(.sel)").forEach(c=>c.classList.add("fade"));
  await wait(TIMING.fadeOthers);

  // 실제 카드 id 뽑기
  const deck = build78Deck();
  pickedCards = [];
  selected.forEach(()=>{
    const cardId = deck.splice((Math.random()*deck.length)|0, 1)[0];
    pickedCards.push(cardId.replace(".png",""));
  });

  // ✅ 빅카드는 무조건 back 상태로 다시 강제
  resetBigCardsToBack();
  applySlotVisibilityToStage();

  // 파이어볼 + 연출 + 마지막에만 앞면 세팅
  await fireToBigCards(pickedCards);

  // 리딩
  chat.classList.remove("hidden");
  chat.innerHTML = "<p>🔮 리딩 중입니다…</p>";
  chat.scrollIntoView({behavior:"smooth"});

  await fetchReading(CATEGORY_MAP[selectedCategory], pickedCards, readingVersion);
  document.body.classList.remove("lock-scroll");
};

/* =====================================================
9. 파이어볼 → 점화 → 연기 → 앞면 공개(딱 한번)
===================================================== */
async function fireToBigCards(picked){
  const activeSlots = SLOT_SEQUENCE[readingVersion];

  // 1) 파이어볼 이동 (슬롯 목표는 activeSlots[i])
  const fires = [];
  selected.forEach((pickEl, i)=>{
    const slotNum = activeSlots[i];
    const target = document.querySelector(`#bigCardStage .slot-${slotNum}`);
    if(!target) return;

    const fire = document.createElement("div");
    fire.className = "fireball";
    document.body.appendChild(fire);
    fires.push(fire);

    const from = pickEl.getBoundingClientRect();
    const to   = target.getBoundingClientRect();

    const fromX = from.left + from.width/2;
    const fromY = from.top  + from.height/2;
    const toX   = to.left   + to.width/2;
    const toY   = to.top    + to.height/2;

    fire.style.left = `${fromX}px`;
    fire.style.top  = `${fromY}px`;

    play(sFire);

    fire.animate([
      { transform:"translate(0,0)" },
      { transform:`translate(${toX-fromX}px,${toY-fromY}px)` }
    ],{
      duration: TIMING.fireTravel,
      easing:"ease-in-out",
      fill:"forwards"
    });
  });

  await wait(TIMING.fireTravel);
  fires.forEach(f=>f.remove());

  // 2) 점화
  play(sIgnite);
  activeSlots.forEach(slot=>{
    const el = document.querySelector(`#bigCardStage .slot-${slot}`);
    if(el) el.classList.add("burning");
  });

  await wait(TIMING.igniteHold);

  // 3) 연기 + (여기서만) 앞면 공개
  activeSlots.forEach((slot, i)=>{
    const el = document.querySelector(`#bigCardStage .slot-${slot}`);
    if(!el) return;

    el.classList.remove("burning");
    el.classList.add("smoking");

    // ✅ 앞면은 이 순간 단 한번만 세팅
    el.style.backgroundImage = `url('/assets/tarot/${picked[i]}.png')`;
    el.style.opacity = "1";
  });

  play(sReveal);
  await wait(TIMING.revealHold);
}

/* =====================================================
10. 리딩 API
===================================================== */
const READING_API =
"https://script.google.com/macros/s/AKfycbx_WT8AGg2sVcI1EPpqDHWNXsBUtlaTOPovbCTN1Is63n3cIC8zLo2w-efI5-gMLt-h/exec";

async function fetchReading(category, cards, version){
  try{
    const res = await fetch(READING_API,{
      method:"POST",
      body:new URLSearchParams({
        category,
        version,
        cards: JSON.stringify(cards)
      })
    });

    const data = await res.json();
    if(data.status !== "success") throw new Error(data.message || "status not success");

    chat.innerHTML = `<h3>🔮 리딩 결과</h3>${data.html}`;
    chat.scrollIntoView({behavior:"smooth"});
  }catch(e){
    chat.innerHTML = "<p>⚠️ 리딩을 불러오지 못했습니다.</p>";
  }
}

/* util */
const wait = ms => new Promise(r=>setTimeout(r,ms));
