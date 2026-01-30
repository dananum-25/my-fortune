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
1. 질문 단계 (한글 표현 / 내부 키 분리)
- ✅ catText만 사용하도록: 질문 p를 별도 출력하지 않음
===================================================== */
const catTextEl = document.getElementById("catText");

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

/* 🔒 핵심 상태 */
let readingVersion = "V3";
let maxPickCount = 3;

function applyReadingDepth(depth){
  switch(depth){
    case "direction":
      readingVersion = "V1"; maxPickCount = 1; break;
    case "advice":
      readingVersion = "V3"; maxPickCount = 3; break;
    case "feeling":
      readingVersion = "V5"; maxPickCount = 5; break;
    case "result":
      readingVersion = "V7"; maxPickCount = 7; break;
  }
}

/* =====================================================
2. 슬롯 정의 (🔥 고정 락)
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

const qArea = document.getElementById("questionArea");
const tArea = document.getElementById("transitionArea");

function renderQ(){
  qArea.innerHTML = "";
  const q = QUESTIONS[step];

  // ✅ catText에만 질문 표시 (중복 제거)
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
  } else {
    qArea.classList.add("hidden");
    tArea.classList.remove("hidden");

    // ✅ n장 반영
    tArea.querySelector("p").textContent =
      `지금 선택을 생각하며 카드를 ${maxPickCount}장 골라줘.`;
  }
}

renderQ();

/* =====================================================
3. 카드 덱 (78장)
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
const bigCards = document.querySelectorAll(".big-card");
const modal    = document.getElementById("confirmModal");
const chat     = document.getElementById("chatContainer");

let selected = [];

/* ✅ 재정렬 영역 동적 생성 (HTML 수정 없이) */
let reorderArea = null;
function ensureReorderArea(){
  if(reorderArea) return reorderArea;
  reorderArea = document.createElement("div");
  reorderArea.className = "reorder-area hidden";
  reorderArea.innerHTML = `
    <div class="reorder-card"></div>
    <div class="reorder-card"></div>
    <div class="reorder-card"></div>
  `;
  // bigStage 바로 아래에 삽입 (v3에서 하던 위치 느낌)
  bigStage.insertAdjacentElement("afterend", reorderArea);
  return reorderArea;
}

/* =====================================================
5. go / reset
===================================================== */
document.getElementById("goCard").onclick = ()=>{
  tArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  // ✅ picker 타이틀 n장 반영
  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  // ✅ 활성 슬롯 외 히든 처리 + 좌표 초기화
  applySlotVisibility();

  initSpread();
};

document.getElementById("resetAll").onclick = ()=>location.reload();

/* =====================================================
6. 슬롯 표시/숨김
===================================================== */
function applySlotVisibility(){
  const activeSlots = SLOT_SEQUENCE[readingVersion];

  bigCards.forEach(card=>{
    const m = card.className.match(/slot-(\d)/);
    const slot = m ? Number(m[1]) : null;

    if(!slot || !activeSlots.includes(slot)){
      card.classList.add("hidden");
    } else {
      card.classList.remove("hidden");
      card.classList.remove("burning","smoking");
      card.style.backgroundImage = "url('/assets/tarot/back.png')";
    }
  });
}

/* =====================================================
7. 78 grid
===================================================== */
function initSpread(){
  grid.innerHTML = "";
  selected = [];

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
8. 확정 → (재정렬 → 파이어볼 → 점화/연기 → 리딩)
===================================================== */
document.getElementById("confirmPick").onclick = async ()=>{
  modal.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  // 선택 외 카드 흐리기
  document.querySelectorAll(".pick:not(.sel)").forEach(c=>c.classList.add("fade"));
  await wait(450);

  const deck = build78Deck();
  const pickedCards = [];

  // ✅ 선택한 카드들에 실제 랜덤 카드ID 부여
  selected.forEach(()=>{
    const cardId = deck.splice(Math.floor(Math.random()*deck.length),1)[0];
    pickedCards.push(cardId.replace(".png",""));
  });

  // ✅ 1) 재정렬 먼저 보여주기 (v3 느낌)
  const ra = ensureReorderArea();
  ra.classList.remove("hidden");
  const mini = ra.querySelectorAll(".reorder-card");
  mini.forEach((el, i)=>{
    el.style.backgroundImage = `url('/assets/tarot/${pickedCards[i]}.png')`;
  });

  // 재정렬 “보이는 시간”
  await wait(900);

  // ✅ 2) 재정렬 영역 제거하고 그 자리에 리딩 영역(=chat) 넣을 준비
  ra.classList.add("hidden");

  // ✅ 3) 파이어볼 + 빅카드 변환
  await fireToBigCards(pickedCards);

  // ✅ 4) 리딩 영역은 재정렬 영역 있던 위치로 이동
  chat.classList.remove("hidden");
  chat.innerHTML = "<p>🔮 리딩 중입니다…</p>";
  chat.scrollIntoView({behavior:"smooth"});

  await fetchReading(CATEGORY_MAP[selectedCategory], pickedCards, readingVersion);

  document.body.classList.remove("lock-scroll");
};

/* 파이어볼 + 빅카드 표시 */
async function fireToBigCards(pickedCards){
  const activeSlots = SLOT_SEQUENCE[readingVersion];

  // 빅카드: 활성 슬롯만 보이게 + back 초기화
  applySlotVisibility();

  // 파이어볼: 선택 순서 i -> activeSlots[i] 로 매핑
  selected.forEach((c,i)=>{
    const slotNum = activeSlots[i];
    const target = document.querySelector(`.slot-${slotNum}`);

    const fire = document.createElement("div");
    fire.className = "fireball";
    document.body.appendChild(fire);

    const from = c.getBoundingClientRect();
    const to   = target.getBoundingClientRect();

    fire.style.left = `${from.left + from.width/2}px`;
    fire.style.top  = `${from.top  + from.height/2}px`;

    play(sFire);

    fire.animate([
      { transform:"translate(0,0)" },
      { transform:`translate(${(to.left + to.width/2) - (from.left + from.width/2)}px,${(to.top + to.height/2) - (from.top + from.height/2)}px)` }
    ],{ duration:1100, easing:"ease-in-out", fill:"forwards" });

    setTimeout(()=>fire.remove(),1200);
  });

  await wait(1200);
  play(sIgnite);

  // 점화
  activeSlots.forEach(slot=>{
    document.querySelector(`.slot-${slot}`).classList.add("burning");
  });

  await wait(900);

  // 연기 + 최종 카드 표시
  activeSlots.forEach((slot,i)=>{
    const b = document.querySelector(`.slot-${slot}`);
    b.classList.remove("burning");
    b.classList.add("smoking");
    b.style.backgroundImage = `url('/assets/tarot/${pickedCards[i]}.png')`;
  });

  play(sReveal);
  await wait(700);
}

/* =====================================================
9. 리딩 API
===================================================== */
const READING_API =
"https://script.google.com/macros/s/AKfycbwLsinoFy1xUaTNNqqHKRTIUSA9sOb-xsHbOXBkoIkovfMmTDRDH57FYHr184a3tojx/exec";

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
    if(data.status !== "success") throw new Error(data.message);

    chat.innerHTML = `<h3>🔮 리딩 결과</h3>${data.html}`;
    chat.scrollIntoView({behavior:"smooth"});

  }catch(e){
    chat.innerHTML = "<p>⚠️ 리딩을 불러오지 못했습니다.</p>";
  }
}

/* util */
const wait = ms => new Promise(r=>setTimeout(r,ms));
