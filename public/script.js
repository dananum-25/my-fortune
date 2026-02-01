/* =====================================================
0. 사운드
===================================================== */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;

const sPick   = new Audio("/sounds/tarot/card_pick.mp3");
const sFire   = new Audio("/sounds/tarot/fire.mp3");
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
1. 질문 단계
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
  catArea.classList.remove("hidden");   // ⭐ 반드시 보이게
  qArea.classList.remove("hidden");   // ⭐ 이거
  tArea.classList.add("hidden");      // 안전장치
  qArea.innerHTML = "";
  const q = QUESTIONS[step];
  catTextEl.textContent = q.text;

  q.options.forEach(o=>{
    const b = document.createElement("button");
    b.textContent = LABELS[o];
    b.onclick = ()=>{
      if(step===0) selectedCategory=o;
      if(step===2){
        selectedDepth=o;
        applyReadingDepth(o);
      }
      step++;
      if(step < QUESTIONS.length){
        renderQ();
      }else{
        qArea.classList.add("hidden");
        tArea.classList.remove("hidden");
        tArea.querySelector("p").textContent =
          `카드 ${maxPickCount}장을 골라줘`;
      }
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
  catArea.classList.add("hidden");

  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  applySlotVisibility();
  initSpread();
};

document.getElementById("resetAll").onclick = ()=>{
  location.reload();
};

/* =====================================================
5. 슬롯 표시
===================================================== */
function applySlotVisibility(){
  const layout = document.querySelector(".big-cards");
  layout.className = `big-cards ${readingVersion.toLowerCase()}-layout`;

  const active = SLOT_SEQUENCE[readingVersion];
  bigCards.forEach(c=>{
    const m = c.className.match(/slot-(\d)/);
    const s = m ? Number(m[1]) : null;
    c.classList.toggle("hidden", !active.includes(s));
    c.style.backgroundImage = "url('/assets/tarot/back.png')";
    c.classList.remove("burning","smoking");
  });
  bigStage.querySelector(".big-cards").className =
  `big-cards v7-layout ${readingVersion.toLowerCase()}-layout`;
}

/* =====================================================
6. 78장 카드
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
  if(selected.length===maxPickCount){
    modal.classList.remove("hidden");
  }
}

/* =====================================================
7. 확정 → 재정렬 → 파이어볼 → 빅카드 → 리딩
===================================================== */
document.getElementById("confirmPick").onclick = async ()=>{
  // 🔥 빅카드 상단으로 스크롤 이동
bigStage.scrollIntoView({ behavior:"smooth", block:"start" });
await wait(600);

// 이후부터 스크롤 잠금
document.body.style.overflow = "hidden";
  modal.classList.add("hidden");
  spread.classList.add("hidden");

  const deck = build78Deck();
  const pickedCards = selected.map(()=>{
    return deck.splice(Math.random()*deck.length|0,1)[0].replace(".png","");
  });

/* 🔒 재정렬 초기화 (이미지 절대 건드리지 않음) */
reorderCards.forEach(c=>{
  c.style.opacity = "0";
});

reorderStage.classList.remove("hidden");
await wait(2000);

/* 재정렬 카드 표시 (앞면 절대 넣지 않음) */
SLOT_SEQUENCE[readingVersion].forEach(slot=>{
  const card = reorderStage.querySelector(`.reorder-card.slot-${slot}`);
  card.style.opacity = "1";
});

  await wait(900);
  reorderStage.classList.add("hidden");

  /* 빅카드 연출 */
  await fireToBigCards(pickedCards);

  chat.classList.remove("hidden");
  chat.innerHTML="<p>🔮 리딩 중입니다…</p>";
  await fetchReading(CATEGORY_MAP[selectedCategory], pickedCards, readingVersion);
};

/* =====================================================
8. 빅카드 표시
===================================================== */

async function fireToBigCards(pickedCards){
  const active = SLOT_SEQUENCE[readingVersion];
  const center = document.querySelector(".big-cards");

  // 1️⃣ 파이어볼 전부 동시에 날리기
  await Promise.all(
    active.map((slot, i) => {
      const card = document.querySelector(`.big-card.slot-${slot}`);
      play(sFire);
      return flyFireball(center, card, 3000);
    })
  );

  // 2️⃣ 도착 후 카드 공개 + 불꽃
  active.forEach((slot, i) => {
    const card = document.querySelector(`.big-card.slot-${slot}`);
    card.classList.add("burning");
    card.style.backgroundImage =
      `url('/assets/tarot/${pickedCards[i]}.png')`;
  });

  play(sReveal);

  // 3️⃣ 불꽃 유지 시간 (2초)
  await wait(2000);

  // 4️⃣ 불꽃 제거 (정상 카드로 복귀)
  document.querySelectorAll(".big-card").forEach(c=>{
    c.classList.remove("burning","smoking");
  });
}


/* =====================================================
UTIL
===================================================== */
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
    nums.forEach((n,i)=>{
      d.push(`minors/${s}/${n}_${names[i]}.png`);
    });
  });
  return d;
}

async function fetchReading(category, cards, version){
  chat.innerHTML="<p>🔮 리딩 결과를 불러왔습니다.</p>";
}

const wait = ms => new Promise(r=>setTimeout(r,ms));

function flyFireball(startEl, targetEl, duration = 3000){
  return new Promise(resolve=>{
    const fire = document.createElement("div");
    fire.className = "fireball";
    document.body.appendChild(fire);

    const s = startEl.getBoundingClientRect();
    const e = targetEl.getBoundingClientRect();

    const sx = s.left + s.width/2;
    const sy = s.top + s.height/2;
    const ex = e.left + e.width/2;
    const ey = e.top + e.height/2;

    const curve = 120; // 🔥 포물선 높이
    const startTime = performance.now();

    function animate(now){
      const t = Math.min((now - startTime) / duration, 1);

      const x = sx + (ex - sx) * t;
      const y = sy + (ey - sy) * t - curve * Math.sin(Math.PI * t);

      fire.style.transform = `translate(${x}px, ${y}px)`;

      if(t < 1){
        requestAnimationFrame(animate);
      }else{
        fire.remove();
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}
async function movePickedToReorder(pickedEls) {
  const clones = [];

  pickedEls.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    const target = reorderStage.querySelector(
      `.reorder-card.slot-${SLOT_SEQUENCE[readingVersion][i]}`
    ).getBoundingClientRect();

    const clone = el.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";
    clone.style.transition = "transform 3s ease-in-out";
    clone.style.zIndex = 9999;

    document.body.appendChild(clone);
    clones.push(clone);

    const dx = target.left - rect.left;
    const dy = target.top - rect.top;

    requestAnimationFrame(() => {
      clone.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  });

  await wait(3000);
  clones.forEach(c => c.remove());
}
