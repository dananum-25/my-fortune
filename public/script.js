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

const CATEGORY_MAP = {
  love:"연애", career:"직업", money:"금전", relationship:"관계"
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
  catArea.classList.add("hidden");
  tArea.classList.add("hidden");

  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  applySlotVisibility();
  initSpread();
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
  document.body.style.overflow = "hidden";

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

  reorderCards.forEach(c=>{
    c.style.opacity="0";
    c.style.backgroundImage="url('/assets/tarot/back.png')";
  });
  reorderStage.classList.remove("hidden");
async function movePickedToReorder(pickedEls) {
  const slots = SLOT_SEQUENCE[readingVersion];

  pickedEls.forEach((el, i) => {
    const start = el.getBoundingClientRect();
    const targetEl = reorderStage.querySelector(
      `.reorder-card.slot-${slots[i]}`
    );
    if (!targetEl) return;

    const end = targetEl.getBoundingClientRect();

    const fly = document.createElement("div");
    fly.className = "reorder-fly";
    fly.style.position = "fixed";
    fly.style.left = start.left + "px";
    fly.style.top = start.top + "px";
    fly.style.width = start.width + "px";
    fly.style.height = start.height + "px";
    fly.style.background =
      "url('/assets/tarot/back.png') center / contain no-repeat";
    fly.style.zIndex = 9999;
    fly.style.transition = "transform 3s ease-in-out";

    document.body.appendChild(fly);

    const dx = end.left + end.width / 2 - (start.left + start.width / 2);
    const dy = end.top + end.height / 2 - (start.top + start.height / 2);

    requestAnimationFrame(() => {
      fly.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    setTimeout(() => fly.remove(), 3000);
  });

  await wait(3000);
}

  reorderStage.classList.add("hidden");
  await fireToBigCards(pickedCards);

  chat.classList.remove("hidden");
  chat.innerHTML="<p>🔮 리딩 결과를 불러왔습니다.</p>";
  await fetchReading(CATEGORY_MAP[selectedCategory], pickedCards, readingVersion);
};

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
      return flyFireball(center,card,3000);
    })
  );

  active.forEach((slot,i)=>{
    const card=document.querySelector(`.big-card.slot-${slot}`);
    card.classList.add("burning");
    card.style.backgroundImage=`url('/assets/tarot/${pickedCards[i]}.png')`;
  });

  play(sReveal);
  await wait(2000);

  document.querySelectorAll(".big-card").forEach(c=>{
    c.classList.remove("burning","smoking");
  });
}

/* =====================================================
UTIL
===================================================== */
const wait = ms=>new Promise(r=>setTimeout(r,ms));

function build78Deck(){
  const majors=[/* 생략 없음 */ 
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
    const ex = e.left + e.width / 2;
    const ey = e.top + e.height * 0.45; 
    // 🔥 살짝 위 (카드 중앙 보정)

    const start=performance.now();
    function anim(now){
      const t=Math.min((now-start)/duration,1);
      fire.style.transform=`translate(${sx+(ex-sx)*t}px,${sy+(ey-sy)*t-120*Math.sin(Math.PI*t)}px)`;
      t<1?requestAnimationFrame(anim):(fire.remove(),resolve());
    }
    requestAnimationFrame(anim);
  });
}

async function movePickedToReorder(pickedEls){
  const targets=SLOT_SEQUENCE[readingVersion];
  pickedEls.forEach((el,i)=>{
    const s=el.getBoundingClientRect();
    const tEl=reorderStage.querySelector(`.reorder-card.slot-${targets[i]}`);
    if(!tEl) return;
    const t=tEl.getBoundingClientRect();

    const fly=document.createElement("div");
    fly.className="reorder-fly";
    fly.style.position="fixed";
    fly.style.left=s.left+"px";
    fly.style.top=s.top+"px";
    fly.style.width=s.width+"px";
    fly.style.height=s.height+"px";
    fly.style.background="url('/assets/tarot/back.png') center/contain no-repeat";
    fly.style.transition="transform 3s ease";
    fly.style.zIndex=9999;

    document.body.appendChild(fly);
    requestAnimationFrame(()=>{
      fly.style.transform=`translate(${t.left-s.left}px,${t.top-s.top}px)`;
    });
    setTimeout(()=>fly.remove(),3000);
  });
  await wait(3000);
}

/* =====================================================
INIT
===================================================== */

window.addEventListener("load", () => {
  // 🔓 스크롤 초기화
  document.body.style.overflow = "";

  // 🔁 상태 초기화
  step = 0;
  selected = [];
  selectedCategory = null;
  selectedDepth = null;

  // 🧹 모든 스테이지 숨김
  bigStage.classList.add("hidden");
  spread.classList.add("hidden");
  reorderStage.classList.add("hidden");
  chat.classList.add("hidden");
  modal.classList.add("hidden");

  // 🧹 78장 카드 초기화
  document.querySelectorAll(".pick").forEach(p=>{
    p.style.opacity = "";
    p.style.pointerEvents = "";
    p.classList.remove("sel");
  });

  // ❓ 질문 렌더
  renderQ();
});
