/* =====================================================
0. GLOBAL INIT
===================================================== */
let step = 0;
let selected = [];
let selectedDepth = null;
let readingVersion = "V3";
let maxPickCount = 3;

let selectedTime = null;
let selectedCategory = null;
let revealedCards = {};
/* =====================================================
1. SOUND
===================================================== */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15; 

const sPick   = new Audio("/sounds/tarot/card_pick.mp3");
const sFire   = new Audio("/sounds/tarot/fire.mp3");
const sReveal = new Audio("/sounds/tarot/reveal.mp3");

let muted = true;
const soundBtn = document.getElementById("soundToggle");

if(soundBtn){
  soundBtn.onclick = () => {
    muted = !muted;
    soundBtn.textContent = muted ? "사운드 🔇" : "사운드 🔊";
    muted ? bgm.pause() : bgm.play().catch(()=>{});
  };
}

function play(sound){
  if(!muted){
    sound.currentTime = 0;
    sound.play().catch(()=>{});
  }
}
/* =====================================================
2. QUESTION
===================================================== */
const catArea = document.getElementById("catArea");
const catTextEl = document.getElementById("catText");
const qArea = document.getElementById("questionArea");
const tArea = document.getElementById("transitionArea");

const LABELS = {
  love:"연애", career:"직업 / 진로", money:"금전", relationship:"관계",
  past:"과거", present:"현재", future:"미래",
  direction:"방향성", advice:"조언", feeling:"상대의 마음", result:"결과"
};

const QUESTIONS = [
  { text:"지금 가장 마음에 걸리는 고민이 어떤 분야인지 골라줘.", options:["love","career","money","relationship"] },
  { text:"이 고민은 언제쯤의 이야기인가요?", options:["past","present","future"] },
  { text:"지금 가장 알고 싶은 것은?", options:["direction","advice","feeling","result"] }
];

function applyReadingDepth(depth){
  const map = {
    direction:["V1",1],
    advice:["V3",3],
    feeling:["V5",5],
    result:["V7",7]
  };
  if(map[depth]){
    [readingVersion, maxPickCount] = map[depth];
  }
}

function renderQ(){
  console.log("[renderQ] step=", step, "QUESTIONS=", QUESTIONS?.length);
  catArea.classList.remove("hidden");
  qArea.classList.remove("hidden");
  tArea.classList.add("hidden");

  qArea.innerHTML = "";
  const q = QUESTIONS[step];
if(!q) return;
  catTextEl.textContent = q.text;

  q.options.forEach(o=>{
    const b = document.createElement("button");
    b.textContent = LABELS[o];
    b.onclick = ()=>{

  if(step === 0){
    selectedCategory = o;
  }

  if(step === 1){
    selectedTime = o;
  }

  if(step === 2){
    selectedDepth = o;
    applyReadingDepth(o);
  }
      step++;
      if(step < QUESTIONS.length){
        renderQ();
      }else{
        qArea.classList.add("hidden");
        tArea.classList.remove("hidden");
        tArea.querySelector("p").textContent = `카드 ${maxPickCount}장을 골라줘`;
      }
    };
    qArea.appendChild(b);
  });
}

/* =====================================================
3. SLOT
===================================================== */
const SLOT_SEQUENCE = {
  V1:[1],
  V3:[2,1,3],
  V5:[2,1,3,4,5],
  V7:[2,1,3,6,4,7,5]
};

function getActiveSlots(){
  if(readingVersion !== "V1") {
    return SLOT_SEQUENCE[readingVersion];
  }

  if(selectedTime === "past") return [2];
  if(selectedTime === "present") return [1];
  if(selectedTime === "future") return [3];

  return [1];
}

/* =====================================================
4. DOM
===================================================== */
const grid = document.getElementById("grid78");
const pickerTitle = document.getElementById("pickerTitle");
const spread = document.getElementById("spreadSection");
const bigStage = document.getElementById("bigCardStage");
const reorderStage = document.getElementById("reorderStage");
const modal = document.getElementById("confirmModal");
const chat = document.getElementById("chatContainer");

const bigCards = document.querySelectorAll(".big-card");
const reorderCards = document.querySelectorAll(".reorder-card");

/* =====================================================
5. START PICK
===================================================== */
document.getElementById("goCard").onclick = ()=>{
  // ✅ 상단 UI 숨김(좌표 안정)
  document.querySelector(".topbar").classList.add("hidden");

  catArea.classList.add("hidden");
  tArea.classList.add("hidden");

  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  pickerTitle.classList.remove("hidden");
  pickerTitle.textContent =
  `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  applySlotVisibility();
  initSpread();

  // ✅ “처음 온 사람도 알게” 스프레드로 자동 이동
  // (빅카드는 sticky라 화면 위에 계속 남아있음)
  setTimeout(()=>{
    spread.scrollIntoView({ behavior:"smooth", block:"start" });
  }, 120);
};

function applySlotVisibility(){
  const active = getActiveSlots();

  bigCards.forEach(c=>{
    const match = c.className.match(/slot-(\d)/);
    const s = match ? Number(match[1]) : null;

    c.classList.toggle("hidden", !active.includes(s));

if(revealedCards[String(s)]){
  c.style.backgroundImage = `url('${revealedCards[String(s)]}')`;
}else if(!c.dataset.opened){
  c.style.backgroundImage = "url('/assets/tarot/back.png')";
}

    c.classList.remove("burning","smoking");
  });
}

/* =====================================================
6. 78 SPREAD
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

function pick(c){
  if(c.classList.contains("sel")){
    c.classList.remove("sel");
    selected = selected.filter(x=>x!==c);
    return;
  }
  if(selected.length>=maxPickCount) return;

  c.classList.add("sel");
  selected.push(c);
  play(sPick);

  if(selected.length===maxPickCount){
    modal.classList.remove("hidden");
  }
}

/* =====================================================
7. CONFIRM FLOW
===================================================== */
const confirmBtn = document.getElementById("confirmPick");
const retryBtn   = document.getElementById("retryPick");

/* 1️⃣ 이대로 진행 */
confirmBtn.onclick = async ()=>{
  modal.classList.add("hidden");
  pickerTitle.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  const deck = build78Deck();
const pickedCards = selected.map(()=>{
  return deck.splice(Math.random()*deck.length|0,1)[0].replace(".png","");
});

const selectedCopy = [...selected];

  /* 광고 먼저 */
  await showAdOverlay();

  /* 선택 안 된 카드 제거 */
  document.querySelectorAll(".pick").forEach(p=>{
    if(!p.classList.contains("sel")){
      p.style.opacity="0";
      p.style.pointerEvents="none";
    }
  });

  /* 이후 기존 흐름 */
  await handleAfterConfirm(pickedCards, selectedCopy);
};


/* 2️⃣ 다시 선택하기 */
retryBtn.onclick = ()=>{
  modal.classList.add("hidden");

  selected.forEach(c=>c.classList.remove("sel"));
  selected = [];
};

/* =====================================================
7-1. REORDER → FIRE
===================================================== */


async function handleAfterConfirm(pickedCards, selectedCopy){
  const active = getActiveSlots();

  reorderCards.forEach(c=>{
    const s = Number(c.className.match(/slot-(\d)/)?.[1]);

    if(active.includes(s)){
      c.style.opacity = "1";
      c.style.backgroundImage = "url('/assets/tarot/back.png')";
    }else{
      c.style.opacity = "0";
    }
  });

  reorderStage.classList.remove("hidden");
  reorderStage.getBoundingClientRect();
  await wait(50);

  document.getElementById("stageWrapper")
    .scrollIntoView({ behavior:"smooth", block:"start" });

  await wait(500);
  await movePickedToReorderFixed(selectedCopy);
  await wait(800);

  await fireToBigCardsFromReorder(pickedCards);

  /* 선택 카드 제거 */
  selected.forEach(el=>el.remove());
  selected = [];

  reorderStage.classList.add("hidden");

  document.querySelector(".topbar")?.classList.remove("hidden");
  document.body.classList.remove("lock-scroll");

  chat.classList.remove("hidden");

  const readingHTML = await buildReadingHTML(pickedCards);

  const activeSlots = getActiveSlots();

activeSlots.forEach((slot,i)=>{
  const card = document.querySelector(`.big-card.slot-${slot}`);
  if(card && revealedCards[slot]){
    card.style.backgroundImage = `url('${revealedCards[slot]}')`;
  }
});
  
  chat.innerHTML = readingHTML;
}

/* =====================================================
8. FIRE: REORDER → BIG
===================================================== */
async function fireToBigCardsFromReorder(pickedCards){
  const active = getActiveSlots();
  await Promise.all(
    active.map((slot,i)=>{
      const startCard = reorderStage.querySelector(`.reorder-card.slot-${slot}`);
      const targetCard = document.querySelector(`.big-card.slot-${slot}`);
      play(sFire);
      return flyFireballBetween(startCard, targetCard, 1200);
    })
  );

  // ✅ 발사 후 빅카드 앞면 오픈 + 불타는 효과
active.forEach((slot,i)=>{
  const card = document.querySelector(`.big-card.slot-${slot}`);
  const img = pickedCards[i];

  if(!card || !img) return;

  const path = getCardImagePath(img);
revealedCards[String(slot)] = path;
card.style.backgroundImage = `url('${path}')`;
card.dataset.opened = "true";
});
  play(sReveal);
  await wait(1200);

  document.querySelectorAll(".big-card").forEach(c=>{
    c.classList.remove("burning","smoking");
  });
}
function getCardImagePath(card){
  return `/assets/tarot/${card}.png`;
}
/* =====================================================
UTIL
===================================================== */
const wait = ms=>new Promise(r=>setTimeout(r,ms));

function build78Deck(){
  const majors=[
    "00_the_fool","01_the_magician","02_the_high_priestess","03_the_empress",
    "04_the_emperor","05_the_hierophant","06_the_lovers","07_the_chariot",
    "08_strength","09_the_hermit","10_wheel_of_fortune","11_justice",
    "12_the_hanged_man","13_death","14_temperance","15_the_devil",
    "16_the_tower","17_the_star","18_the_moon","19_the_sun",
    "20_judgement","21_the_world"
  ];
  const suits=["cups","wands","swords","pentacles"];
  const nums=["01","02","03","04","05","06","07","08","09","10","11","12","13","14"];
  const names=["ace","two","three","four","five","six","seven","eight","nine","ten","page","knight","queen","king"];

  const d=[];
  majors.forEach(m=>d.push(`majors/${m}.png`));
  suits.forEach(s=>{
    nums.forEach((n,i)=>d.push(`minors/${s}/${n}_${names[i]}.png`));
  });
  return d;
}

function flyFireballBetween(startEl, targetEl, duration){
  return new Promise(resolve=>{
    const fire = document.createElement("div");
    fire.className = "fireball";

    const wrapper = document.getElementById("stageWrapper");
    wrapper.appendChild(fire);

    fire.style.left = "0px";
    fire.style.top  = "0px";

    const w = wrapper.getBoundingClientRect();
    const s = startEl.getBoundingClientRect();
    const e = targetEl.getBoundingClientRect();

    const sx = s.left - w.left + s.width/2;
    const sy = s.top  - w.top  + s.height/2;
    const ex = e.left - w.left + e.width/2;
    const ey = e.top  - w.top  + e.height*0.45;

    const start = performance.now();

    function anim(now){
      const t = Math.min((now - start) / duration, 1);
      const arc = 120 * Math.sin(Math.PI * t);

      fire.style.transform =
        `translate(${sx + (ex - sx) * t}px, ${sy + (ey - sy) * t - arc}px)`;

      if(t < 1){
        requestAnimationFrame(anim);
      }else{
        fire.remove();
        resolve();
      }
    }

    requestAnimationFrame(anim);
  });
}

function showAdOverlay(){
  return new Promise(resolve=>{
    const overlay = document.getElementById("adOverlay");
    const btn = document.getElementById("skipAd");

    overlay.classList.remove("hidden");
    btn.disabled = true;
    btn.textContent = "광고 시청 중...";

    setTimeout(()=>{
      btn.disabled = false;
      btn.textContent = "건너뛰기";
    },5000);

    btn.onclick = ()=>{
      overlay.classList.add("hidden");
      resolve();
    };
  });
}

async function movePickedToReorderFixed(pickedEls){
  const slots = getActiveSlots();   // ← 이름을 slots로 통일

  const wrapper = document.getElementById("stageWrapper");
  const w = wrapper.getBoundingClientRect();

  pickedEls.forEach((el,i)=>{
    const tEl = reorderStage.querySelector(`.reorder-card.slot-${slots[i]}`);
    if(!tEl) return;

    const s = el.getBoundingClientRect();
    const t = tEl.getBoundingClientRect();

    const fly = document.createElement("div");
    fly.className = "reorder-fly";

    fly.style.left = (s.left - w.left) + "px";
    fly.style.top  = (s.top  - w.top)  + "px";
    fly.style.width  = s.width  + "px";
    fly.style.height = s.height + "px";

    wrapper.appendChild(fly);

    requestAnimationFrame(()=>{
      const dx = (t.left - w.left) - (s.left - w.left);
      const dy = (t.top  - w.top)  - (s.top  - w.top);

      fly.style.transform =
        `translate(${dx}px, ${dy}px) scale(0.6)`;
    });

    setTimeout(()=>fly.remove(),2800);
  });

  await wait(3000);
}

/* =====================================================
INIT
===================================================== */
window.addEventListener("load", () => {
  try {
    document.body.classList.remove("lock-scroll");

    // 화면 초기화(혹시 이전 상태 남아있을 수 있으니)
    step = 0;
    selected = [];
    selectedDepth = null;
    readingVersion = "V3";
    maxPickCount = 3;

    // 필수 UI 복구
    document.querySelector(".topbar")?.classList.remove("hidden");
    catArea?.classList.remove("hidden");
    qArea?.classList.remove("hidden");
    tArea?.classList.add("hidden");
    bigStage?.classList.add("hidden");
    spread?.classList.add("hidden");
    chat?.classList.add("hidden");

    renderQ();
  } catch (e) {
    console.error("[INIT FAIL]", e);

    // 최후의 안전장치: 화면에 에러 표시
    const err = document.createElement("div");
    err.style.padding = "14px";
    err.style.fontSize = "14px";
    err.style.color = "tomato";
    err.textContent = "초기 로딩 에러가 발생했어요. 콘솔(F12) 에러를 확인해주세요.";
    document.body.prepend(err);
  }
});

/* =====================================================
READING ENGINE (FINAL STABLE)
===================================================== */

let tarotDB = {};

async function loadTarotDB(){
  if(Object.keys(tarotDB).length) return;

  const res = await fetch("/data/tarot_reading_db_ko.json");
  tarotDB = await res.json();
}

function getCardDisplayName(key){
  if(!key) return "";

  // Major
  if(key.startsWith("0") || key.startsWith("1") || key.startsWith("2")){
    return key
      .replace(/\d+_/, "")
      .replace(/_/g," ")
      .replace(/\b\w/g, m=>m.toUpperCase());
  }

  // Minor
  if(key.includes("_")){
    const [suit, name] = key.split("_");

    const suitMap = {
      cups:"Cups",
      wands:"Wands",
      swords:"Swords",
      pentacles:"Pentacles"
    };

    return `${suitMap[suit]} ${name.charAt(0).toUpperCase()+name.slice(1)}`;
  }

  return key;
}

/* 카드 키 정규화 (메이저 + 마이너 대응) */
function normalizeCardKey(cardId){
  if(cardId.includes("majors")){
    return cardId.split("/").pop().replace(".png","");
  }

  if(cardId.includes("minors")){
    const parts = cardId.split("/");
    const suit = parts[1];
    const name = parts[2].split("_")[1].replace(".png","");
    return `${suit}_${name}`;
  }

  return cardId;
}

/* 슬롯 의미 매핑 */
function getSlotMeaning(slot){
  if([2,4].includes(slot)) return "past";
  if([1,6].includes(slot)) return "present";
  if([3,7].includes(slot)) return "future";
  if(slot === 5) return "advice";
  return "present";
}

function formatCardName(key){
  if(!key) return "";

  return key
    .replace(/_/g," ")
    .replace(/\b\w/g, l=>l.toUpperCase());
}

async function buildReadingHTML(pickedCards){
  await loadTarotDB();

  const slots = getActiveSlots();

  const cards = pickedCards.map((id,i)=>{
  const key = normalizeCardKey(id);

  return {
    slot: slots[i] ?? slots[0],
    key,
    db: tarotDB[key]
  };
});

  const category = selectedCategory;
  const timeKey = selectedTime;

  let html = `<div class="reading">`;
  html += `<h3>🔮 AI 고양이 타로 리딩</h3>`;

  /* =====================
     전체 흐름 요약
  ===================== */
  const summary = cards
    .map(c=>c.db?.core)
    .filter(Boolean)
    .slice(0,3)
    .join(" ");

  html += `<p class="reading-core">${summary}</p>`;

  /* =====================
     과거
  ===================== */
  const pastCards = cards.filter(c=>getSlotMeaning(c.slot)==="past");
  if(pastCards.length){
    html += `<h4>과거의 흐름</h4>`;
    pastCards.forEach(c=>{
      html += `<p>🃏 ${formatCardName(c.key)}</p>`;
  html += `<p>${c.db?.past || c.db?.core}</p>`;
});
}

  /* =====================
     현재
  ===================== */
  const presentCards = cards.filter(c=>getSlotMeaning(c.slot)==="present");
  if(presentCards.length){
    html += `<h4>현재의 흐름</h4>`;
    presentCards.forEach(c=>{
  html += `<p>🃏 ${formatCardName(c.key)}</p>`;
  html += `<p>${c.db?.present || c.db?.core}</p>`;
});
  }

  /* =====================
     미래
  ===================== */
  const futureCards = cards.filter(c=>getSlotMeaning(c.slot)==="future");
  if(futureCards.length){
    html += `<h4>앞으로의 흐름</h4>`;
    futureCards.forEach(c=>{
  html += `<p>🃏 ${formatCardName(c.key)}</p>`;
  html += `<p>${c.db?.future || c.db?.core}</p>`;
});
  }

  /* =====================
     질문2 포커스 강조
  ===================== */
  if(timeKey){
    const focusText = cards
      .map(c=>c.db?.[timeKey])
      .filter(Boolean)
      .join(" ");

    if(focusText){
      html += `<div class="reading-focus">`;
      html += `<h4>🔎 집중 메시지</h4>`;
      html += `<p>${focusText}</p>`;
      html += `</div>`;
    }
  }

  /* =====================
     질문1 상담 메시지
  ===================== */
  if(category){
    const catText = cards
      .map(c=>c.db?.[category])
      .filter(Boolean)
      .slice(0,2)
      .join(" ");

    if(catText){
      html += `<div class="reading-category">`;
      html += `<h4>💬 상담 메시지</h4>`;
      html += `<p>${catText}</p>`;
      html += `</div>`;
    }
  }

  /* =====================
     조언 카드
  ===================== */
  const adviceCard = cards.find(c=>c.db?.advice);

if(adviceCard){
  html += `<div class="reading-advice">`;
  html += `<h4>💡 조언</h4>`;
  html += `<p>🃏 ${formatCardName(adviceCard.key)}</p>`;
  html += `<p>${adviceCard.db.advice}</p>`;
  html += `</div>`;
}

html += `</div>`;
return html;
  }
