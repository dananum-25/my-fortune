/* ===============================
0. SOUND
=============================== */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;

const sPick = new Audio("/sounds/tarot/card_pick.mp3");
const sFire = new Audio("/sounds/tarot/fire.mp3");
const sReveal = new Audio("/sounds/tarot/reveal.mp3");

let muted = true;
soundToggle.onclick = () => {
  muted = !muted;
  soundToggle.textContent = muted ? "사운드 🔇" : "사운드 🔊";
  if (!muted) bgm.play().catch(()=>{});
  else bgm.pause();
};
const play = s => { if (!muted) { s.currentTime = 0; s.play().catch(()=>{}); } };

/* ===============================
1. STATE
=============================== */
let step = 0;
let selectedDepth = null;
let readingVersion = "V3";
let maxPickCount = 3;
let selected = [];

/* ===============================
2. QUESTIONS
=============================== */
const QUESTIONS = [
  { text:"지금 가장 마음에 걸리는 고민이 어떤 분야인지 골라줘.", options:["연애","직업 / 진로","금전","관계"] },
  { text:"이 고민은 언제쯤의 이야기인가요?", options:["과거","현재","미래"] },
  { text:"지금 가장 알고 싶은 것은?", options:["방향성","조언","상대의 마음","결과"] }
];

const qArea = document.getElementById("questionArea");
const catText = document.getElementById("catText");
const tArea = document.getElementById("transitionArea");

/* ===============================
3. QUESTION RENDER
=============================== */
function renderQ(){
  qArea.innerHTML = "";
  catText.textContent = QUESTIONS[step].text;

  QUESTIONS[step].options.forEach(opt=>{
    const b = document.createElement("button");
    b.className = "q-card";
    b.textContent = opt;
    b.onclick = () => {
      if (step === 2) {
        if (opt === "방향성") { readingVersion="V1"; maxPickCount=1; }
        if (opt === "조언")   { readingVersion="V3"; maxPickCount=3; }
        if (opt === "상대의 마음") { readingVersion="V5"; maxPickCount=5; }
        if (opt === "결과")   { readingVersion="V7"; maxPickCount=7; }
      }
      step++;
      step < 3 ? renderQ() : finishQuestions();
    };
    qArea.appendChild(b);
  });
}
renderQ();

function finishQuestions(){
  qArea.classList.add("hidden");
  tArea.classList.remove("hidden");
  tArea.querySelector("p").textContent =
    `카드를 ${maxPickCount}장 선택하게 됩니다.`;
}

/* ===============================
4. CARD FLOW
=============================== */
goCard.onclick = () => {
  tArea.classList.add("hidden");
  catArea.classList.add("hidden");

  bigCardStage.classList.remove("hidden");
  spreadSection.classList.remove("hidden");

  document.querySelector(".picker-title").textContent =
    `마음이 가는 카드 ${maxPickCount}장을 골라줘`;

  initSpread();
};

function initSpread(){
  grid78.innerHTML = "";
  selected = [];
  for(let i=0;i<78;i++){
    const d = document.createElement("div");
    d.className = "pick";
    d.onclick = () => pick(d);
    grid78.appendChild(d);
  }
}

function pick(card){
  if(card.classList.contains("sel")) return;
  if(selected.length >= maxPickCount) return;

  card.classList.add("sel");
  selected.push(card);
  play(sPick);

  if(selected.length === maxPickCount){
    confirmModal.classList.remove("hidden");
  }
}

/* ===============================
5. CONFIRM → FIRE → REVEAL
=============================== */
confirmPick.onclick = async ()=>{
  confirmModal.classList.add("hidden");
  document.body.classList.add("lock-scroll");

  const slots = [...document.querySelectorAll(".big-card")].filter(c=>!c.classList.contains("hidden"));
  selected.forEach((c,i)=>{
    const fire = document.createElement("div");
    fire.className = "fireball";
    document.body.appendChild(fire);

    const f = c.getBoundingClientRect();
    const t = slots[i].getBoundingClientRect();

    fire.style.left = f.left+"px";
    fire.style.top  = f.top+"px";

    play(sFire);

    fire.animate([
      { transform:"translate(0,0)" },
      { transform:`translate(${t.left-f.left}px,${t.top-f.top}px)` }
    ],{ duration:1200, easing:"ease-in-out", fill:"forwards" });

    setTimeout(()=>fire.remove(),1200);
  });

  await wait(1200);

  slots.forEach((s,i)=>{
    s.style.backgroundImage = `url('/assets/tarot/sample_${i+1}.png')`;
  });

  play(sReveal);

  spreadSection.classList.add("hidden");
  selected.forEach(c=>c.remove());

  chatContainer.classList.remove("hidden");
  chatContainer.innerHTML = "<h3>🔮 리딩 결과</h3><p>리딩이 여기에 표시됩니다.</p>";

  document.body.classList.remove("lock-scroll");
};

const wait = ms => new Promise(r=>setTimeout(r,ms));
