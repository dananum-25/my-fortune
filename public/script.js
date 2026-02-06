/* =====================================================
0. GLOBAL INIT
===================================================== */
let step = 0;
let selected = [];
let selectedDepth = null;
let readingVersion = "V3";
let maxPickCount = 3;

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
  catTextEl.textContent = q.text;

  q.options.forEach(o=>{
    const b = document.createElement("button");
    b.textContent = LABELS[o];
    b.onclick = ()=>{
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

/* =====================================================
4. DOM
===================================================== */
const grid = document.getElementById("grid78");
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

  document.querySelector(".picker-title").textContent =
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
  const active = SLOT_SEQUENCE[readingVersion];
  bigCards.forEach(c=>{
    const s = Number(c.className.match(/slot-(\d)/)?.[1]);
    c.classList.toggle("hidden", !active.includes(s));
    c.style.backgroundImage = "url('/assets/tarot/back.png')";
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
document.getElementById("confirmPick").onclick = async ()=>{
  modal.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  // ✅ 선택 안 된 카드들은 사라지게
  document.querySelectorAll(".pick").forEach(p=>{
    if(!p.classList.contains("sel")){
      p.style.opacity="0";
      p.style.pointerEvents="none";
    }
  });

  const deck = build78Deck();
  const pickedCards = selected.map(()=>{
    return deck.splice(Math.random()*deck.length|0,1)[0].replace(".png","");
  });

  await handleAfterConfirm(pickedCards);
};

/* =====================================================
7-1. REORDER → FIRE
===================================================== */


async function handleAfterConfirm(pickedCards){
  // ✅ 재정렬 카드 보이기
  reorderCards.forEach(c=>{
    c.style.opacity = "1";
    c.style.backgroundImage = "url('/assets/tarot/back.png')";
  });
  reorderStage.classList.remove("hidden");

  // ✅ layout 확정
  reorderStage.getBoundingClientRect();
  await wait(50);
 /* 🔥 화면 맨 위로 이동 */
  document.getElementById("stageWrapper")
  .scrollIntoView({ behavior:"smooth", block:"start" });

await wait(500);
  // ✅ 선택 카드 -> 재정렬로 이동
  await movePickedToReorderFixed(selected);

  // ✅ 재정렬에서 0.8초 멈춤
  await wait(800);

  // ✅ 파이어볼: “재정렬 카드 → 빅카드” 로 동시에 발사 (핵심)
  await fireToBigCardsFromReorder(pickedCards);

  // ✅ 발사 직후 재정렬 숨김
  reorderStage.classList.add("hidden");

  // ✅ 선택된 스프레드 카드 “완전 제거”
  selected.forEach(el=>el.remove());
  selected = [];

  chat.classList.remove("hidden");
  chat.innerHTML = "<p>🔮 리딩을 시작합니다…</p>";

  document.body.classList.remove("lock-scroll");
}

/* =====================================================
8. FIRE: REORDER → BIG
===================================================== */
async function fireToBigCardsFromReorder(pickedCards){
  const active = SLOT_SEQUENCE[readingVersion];

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
    card.classList.add("burning");
    card.style.backgroundImage = `url('/assets/tarot/${pickedCards[i]}.png')`;
  });

  play(sReveal);
  await wait(1200);

  document.querySelectorAll(".big-card").forEach(c=>{
    c.classList.remove("burning","smoking");
  });
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

async function movePickedToReorderFixed(pickedEls){
  const slots = SLOT_SEQUENCE[readingVersion];
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
