/* =====================================================
0. GLOBAL INIT
===================================================== */
let step = 0;
let selected = [];
let selectedCategory = null;
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
 // ✅ 질문 끝나면 상단 UI 잠시 숨김
  document.querySelector(".topbar").classList.add("hidden");
  catArea.classList.add("hidden");
  tArea.classList.add("hidden");

  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  applySlotVisibility();
  initSpread();

  // ✅ 시작 시 상단 정렬 (좌표 안정)
  window.scrollTo({ top: 0, behavior: "instant" });
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
  // ✅ reorderStage는 bigStage 내부 absolute라 좌표가 항상 안정적
  reorderCards.forEach(c=>{
    c.style.opacity = "1";
    c.style.backgroundImage = "url('/assets/tarot/back.png')";
  });
  reorderStage.classList.remove("hidden");

  // ✅ 레이아웃 확정(좌표 튐 방지)
  reorderStage.getBoundingClientRect();
  await wait(50);

  // ✅ 선택 카드 -> 재정렬 위치로 2.8초 이동 + 0.2초 여유
  await movePickedToReorderFixed(selected);

  // ✅ 재정렬 위치에서 0.8초 멈춤(요구사항)
  await wait(800);

  // ✅ 재정렬 카드들 -> 동시에 파이어볼 발사(요구사항)
  await fireToBigCards(pickedCards);

  // ✅ 발사 직후 재정렬 숨김(요구사항)
  reorderStage.classList.add("hidden");

  // ✅ 다음
  chat.classList.remove("hidden");
  chat.innerHTML = "<p>🔮 리딩을 시작합니다…</p>";

  document.body.classList.remove("lock-scroll");
}

/* =====================================================
8. BIG CARD FIRE
===================================================== */
async function fireToBigCards(pickedCards){
  const active = SLOT_SEQUENCE[readingVersion];
  const center = document.querySelector(".big-cards");

  await Promise.all(
    active.map((slot,i)=>{
      const card=document.querySelector(`.big-card.slot-${slot}`);
      play(sFire);
      return flyFireball(center,card,1600); // ✅ 너무 길면 답답해서 1.6s
    })
  );

  active.forEach((slot,i)=>{
    const card=document.querySelector(`.big-card.slot-${slot}`);
    card.classList.add("burning");
    card.style.backgroundImage = `url('/assets/tarot/${pickedCards[i]}.png')`;
  });

  play(sReveal);
  await wait(1400);

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

function flyFireball(startEl,targetEl,duration){
  return new Promise(resolve=>{
    const fire=document.createElement("div");
    fire.className="fireball";
    document.body.appendChild(fire);

    const s=startEl.getBoundingClientRect();
    const e=targetEl.getBoundingClientRect();
    const sx=s.left+s.width/2, sy=s.top+s.height/2;
    const ex=e.left+e.width/2;
    const ey=e.top+e.height*0.45;

    const start=performance.now();
    function anim(now){
      const t=Math.min((now-start)/duration,1);
      fire.style.transform=
        `translate(${sx+(ex-sx)*t}px,${sy+(ey-sy)*t-120*Math.sin(Math.PI*t)}px)`;
      t<1?requestAnimationFrame(anim):(fire.remove(),resolve());
    }
    requestAnimationFrame(anim);
  });
}

async function movePickedToReorderFixed(pickedEls){
  const slots = SLOT_SEQUENCE[readingVersion];

  pickedEls.forEach((el,i)=>{
    const s = el.getBoundingClientRect();

    const tEl = reorderStage.querySelector(`.reorder-card.slot-${slots[i]}`);
    if(!tEl) return;

    const t = tEl.getBoundingClientRect();

    const fly=document.createElement("div");
    fly.className="reorder-fly";
    fly.style.left=s.left+"px";
    fly.style.top=s.top+"px";
    fly.style.width=s.width+"px";
    fly.style.height=s.height+"px";

    document.body.appendChild(fly);

    requestAnimationFrame(()=>{
    fly.style.transform =
    `translate(${t.left-s.left}px,${t.top-s.top + 12}px) scale(0.6)`;
  });

    setTimeout(()=>fly.remove(),2800);
  });

  await wait(3000);
}

/* =====================================================
INIT
===================================================== */
window.addEventListener("load",()=>{
  document.body.classList.remove("lock-scroll");
  step = 0;
  selected = [];
  renderQ();
});
