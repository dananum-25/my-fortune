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
const play = s => !muted && (s.currentTime=0, s.play().catch(()=>{}));

/* =====================================================
1. QUESTION FLOW
===================================================== */
const catText = document.getElementById("catText");
const qArea   = document.getElementById("questionArea");
const tArea   = document.getElementById("transitionArea");

const QUESTIONS = [
  { text:"지금 가장 마음에 걸리는 고민은?", options:["연애","직업","금전","관계"] },
  { text:"이 고민은 언제의 이야기야?", options:["과거","현재","미래"] },
  { text:"지금 가장 알고 싶은 건?", options:["방향","조언","상대마음","결과"] }
];

let step = 0;
let readingVersion = "V3";
let maxPick = 3;

function applyDepth(t){
  if(t==="방향"){ readingVersion="V1"; maxPick=1; }
  if(t==="조언"){ readingVersion="V3"; maxPick=3; }
  if(t==="상대마음"){ readingVersion="V5"; maxPick=5; }
  if(t==="결과"){ readingVersion="V7"; maxPick=7; }
}

function renderQ(){
  qArea.innerHTML="";
  catText.textContent = QUESTIONS[step].text;
  QUESTIONS[step].options.forEach(o=>{
    const b=document.createElement("button");
    b.textContent=o;
    b.onclick=()=>{
      if(step===2) applyDepth(o);
      step++;
      step<3 ? renderQ() : showTransition();
    };
    qArea.appendChild(b);
  });
}
function showTransition(){
  qArea.classList.add("hidden");
  tArea.classList.remove("hidden");
  tArea.querySelector("p").textContent =
    `마음이 가는 카드 ${maxPick}장을 골라줘`;
}
renderQ();

/* =====================================================
2. SLOT MAP (LOCK)
===================================================== */
const SLOT_SEQ = {
  V1:[1],
  V3:[2,1,3],
  V5:[2,1,3,4,5],
  V7:[2,1,3,6,4,7,5]
};

/* =====================================================
3. DECK
===================================================== */
const buildDeck=()=>{
  const d=[];
  for(let i=0;i<22;i++) d.push(`majors/${String(i).padStart(2,"0")}.png`);
  ["cups","wands","swords","pentacles"].forEach(s=>{
    for(let i=1;i<=14;i++) d.push(`minors/${s}/${String(i).padStart(2,"0")}.png`);
  });
  return d;
};

/* =====================================================
4. DOM
===================================================== */
const bigCards = document.querySelectorAll(".big-card");
const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const chat  = document.getElementById("chatContainer");

let pickedEls=[], pickedImgs=[];

/* =====================================================
5. START PICK
===================================================== */
document.getElementById("goCard").onclick=()=>{
  tArea.classList.add("hidden");
  spread.classList.remove("hidden");
  initGrid();
  resetBigCards();
};

function initGrid(){
  grid.innerHTML="";
  pickedEls=[];
  for(let i=0;i<78;i++){
    const d=document.createElement("div");
    d.className="pick";
    d.onclick=()=>pick(d);
    grid.appendChild(d);
  }
}
function pick(el){
  if(el.classList.contains("sel")){
    el.classList.remove("sel");
    pickedEls=pickedEls.filter(x=>x!==el);
    return;
  }
  if(pickedEls.length>=maxPick) return;
  el.classList.add("sel");
  pickedEls.push(el);
  play(sPick);
  if(pickedEls.length===maxPick) modal.classList.remove("hidden");
}

/* =====================================================
6. CONFIRM
===================================================== */
document.getElementById("confirmPick").onclick=async()=>{
  modal.classList.add("hidden");

  const deck=buildDeck();
  pickedImgs=[];
  for(let i=0;i<maxPick;i++){
    pickedImgs.push(deck.splice(Math.random()*deck.length|0,1)[0]);
  }

  await showReorder();
  await fireToBig();
  showReading();
};

/* =====================================================
7. REORDER (SAME SLOT / BACK)
===================================================== */
async function showReorder(){
  const slots=SLOT_SEQ[readingVersion];
  bigCards.forEach(c=>{
    c.classList.remove("front");
    c.classList.add("back");
    c.style.backgroundImage="url('/assets/tarot/back.png')";
  });
  await wait(800);
}

/* =====================================================
8. FIREBALL → BIG CARD
===================================================== */
async function fireToBig(){
  const slots=SLOT_SEQ[readingVersion];

  for(let i=0;i<slots.length;i++){
    const card=document.querySelector(`.slot-${slots[i]}`);
    play(sFire);
    await wait(200);
    card.classList.add("burning");
  }

  await wait(1000);

  slots.forEach((s,i)=>{
    const c=document.querySelector(`.slot-${s}`);
    c.classList.remove("back","burning");
    c.classList.add("front","smoking");
    c.style.backgroundImage=`url('/assets/tarot/${pickedImgs[i]}')`;
  });

  play(sReveal);
  await wait(1200);
}

/* =====================================================
9. READING
===================================================== */
function showReading(){
  chat.classList.remove("hidden");
  chat.innerHTML="<h3>🔮 리딩 결과</h3><p>카드가 당신의 이야기를 전하고 있어요.</p>";
}

const wait = ms => new Promise(r=>setTimeout(r,ms));

function resetBigCards(){
  bigCards.forEach(c=>{
    c.className=c.className.replace(/front|back|burning|smoking/g,"");
    c.style.backgroundImage="url('/assets/tarot/back.png')";
  });
}
