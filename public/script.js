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
1. 질문 단계 (프론트 한글 고정)
===================================================== */

/* 🔹 프론트 표시용 */
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

/* 🔹 GAS 전달용 한글 */
const CATEGORY_MAP = {
  love: "연애",
  career: "직업",
  money: "금전",
  relationship: "관계"
};

const DEPTH_KR = {
  direction: "방향성",
  advice: "조언",
  feeling: "상대의 마음",
  result: "결과"
};

const QUESTIONS = [
  { text:"어떤 분야의 고민인가요?", options:["love","career","money","relationship"] },
  { text:"이 고민은 언제쯤의 이야기인가요?", options:["past","present","future"] },
  { text:"지금 가장 알고 싶은 것은?", options:["direction","advice","feeling","result"] }
];

let step = 0;
let selectedCategory = null;
let selectedDepthKey = null;
let selectedDepthKR  = null;

/* 🔥 리딩 버전 상태 */
let readingVersion = "V3";
let maxPickCount = 3;

function applyReadingDepth(depthKey){
  switch(depthKey){
    case "direction":
      readingVersion = "V1";
      maxPickCount = 1;
      break;
    case "advice":
      readingVersion = "V3";
      maxPickCount = 3;
      break;
    case "feeling":
      readingVersion = "V5";
      maxPickCount = 5;
      break;
    case "result":
      readingVersion = "V7";
      maxPickCount = 7;
      break;
  }
}

const qArea = document.getElementById("questionArea");
const tArea = document.getElementById("transitionArea");

function renderQ(){
  qArea.innerHTML = "";
  const q = QUESTIONS[step];

  const p = document.createElement("p");
  p.textContent = q.text;
  qArea.appendChild(p);

  q.options.forEach(key=>{
    const b = document.createElement("button");
    b.textContent = LABELS[key]; // ✅ 항상 한글
    b.onclick = ()=>{
      if(step === 0) selectedCategory = key;
      if(step === 2){
        selectedDepthKey = key;
        selectedDepthKR  = DEPTH_KR[key];
        applyReadingDepth(key);
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

    tArea.querySelector("p").textContent =
      `지금 선택을 생각하며 카드를 ${maxPickCount}장 골라볼까요?`;
  }
}

renderQ();

/* =====================================================
2. 카드 덱
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
3. 스프레드
===================================================== */
const grid     = document.getElementById("grid78");
const spread   = document.getElementById("spreadSection");
const bigStage = document.getElementById("bigCardStage");
const bigCards = document.querySelectorAll(".big-card");
const modal    = document.getElementById("confirmModal");
const chat     = document.getElementById("chatContainer");

let selected = [];

document.getElementById("goCard").onclick = ()=>{
  tArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  initSpread();
};

document.getElementById("resetAll").onclick = ()=>location.reload();

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
4. 확정 → 연출
===================================================== */
document.getElementById("confirmPick").onclick = async ()=>{
  modal.classList.add("hidden");
  window.scrollTo(0,0);
  document.body.classList.add("lock-scroll");

  document.querySelectorAll(".pick:not(.sel)").forEach(c=>{
    c.classList.add("fade");
  });

  await wait(800);

  const deck = build78Deck();
  const pickedCards = [];

  selected.forEach((c,i)=>{
    const cardId = deck.splice(Math.floor(Math.random()*deck.length),1)[0];
    pickedCards.push(cardId.replace(".png",""));
  });

  bigCards.forEach((b,i)=>{
    if(i < maxPickCount){
      b.style.backgroundImage =
        `url('/assets/tarot/${pickedCards[i]}.png')`;
    } else {
      b.classList.add("hidden");
    }
  });

  play(sReveal);

  await fetchReading(
    CATEGORY_MAP[selectedCategory],
    readingVersion,
    selectedDepthKR,
    pickedCards
  );

  document.body.classList.remove("lock-scroll");
};

/* =====================================================
5. 리딩 API
===================================================== */
const READING_API =
"https://script.google.com/macros/s/AKfycbxRMEg6K8_s-oz-7S24qYWjes9gtkrprJEBurP_JWLWcUhjdzshg-tvQOoec77dsoRN/exec";

async function fetchReading(category, version, depthKR, cards){
  chat.classList.remove("hidden");
  chat.innerHTML = "<p>🔮 리딩 중입니다…</p>";

  const payload = {
    category,
    version,
    depth_type: depthKR,
    cards
  };

  try{
    const res = await fetch(READING_API,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if(data.status !== "success") throw new Error(data.message);

    chat.innerHTML = `
      <h3>🔮 리딩 결과</h3>
      ${data.output.map(t=>`<p>${t}</p>`).join("")}
    `;
    chat.scrollIntoView({behavior:"smooth"});

  }catch(e){
    chat.innerHTML = `<p>⚠️ 리딩을 불러오지 못했습니다.</p>`;
  }
}

/* util */
const wait = ms => new Promise(r=>setTimeout(r,ms));
