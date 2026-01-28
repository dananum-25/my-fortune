/* =====================================================
   0. 사운드 (LOCK)
===================================================== */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;

const sPick = new Audio("/sounds/tarot/card_pick.mp3");
const sFire = new Audio("/sounds/tarot/fire_whoosh.mp3");
const sIgnite = new Audio("/sounds/tarot/fire_ignite.mp3");
const sReveal = new Audio("/sounds/tarot/reveal_soft.mp3");

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
   1. 카드 덱 (LOCK · 절대 수정 금지)
===================================================== */
const MAJORS = [
  "majors/00_the_fool","majors/01_the_magician","majors/02_the_high_priestess",
  "majors/03_the_empress","majors/04_the_emperor","majors/05_the_hierophant",
  "majors/06_the_lovers","majors/07_the_chariot","majors/08_strength",
  "majors/09_the_hermit","majors/10_wheel_of_fortune","majors/11_justice",
  "majors/12_the_hanged_man","majors/13_death","majors/14_temperance",
  "majors/15_the_devil","majors/16_the_tower","majors/17_the_star",
  "majors/18_the_moon","majors/19_the_sun","majors/20_judgement",
  "majors/21_the_world"
];

const MINORS = [
  // cups
  "cups/01_ace","cups/02_two","cups/03_three","cups/04_four",
  "cups/05_five","cups/06_six","cups/07_seven","cups/08_eight",
  "cups/09_nine","cups/10_ten","cups/11_page","cups/12_knight",
  "cups/13_queen","cups/14_king",
  // wands
  "wands/01_ace","wands/02_two","wands/03_three","wands/04_four",
  "wands/05_five","wands/06_six","wands/07_seven","wands/08_eight",
  "wands/09_nine","wands/10_ten","wands/11_page","wands/12_knight",
  "wands/13_queen","wands/14_king",
  // swords
  "swords/01_ace","swords/02_two","swords/03_three","swords/04_four",
  "swords/05_five","swords/06_six","swords/07_seven","swords/08_eight",
  "swords/09_nine","swords/10_ten","swords/11_page","swords/12_knight",
  "swords/13_queen","swords/14_king",
  // pentacles
  "pentacles/01_ace","pentacles/02_two","pentacles/03_three","pentacles/04_four",
  "pentacles/05_five","pentacles/06_six","pentacles/07_seven","pentacles/08_eight",
  "pentacles/09_nine","pentacles/10_ten","pentacles/11_page","pentacles/12_knight",
  "pentacles/13_queen","pentacles/14_king"
];

let DECK = [...MAJORS, ...MINORS];

/* =====================================================
   2. 질문 단계 (BASE 그대로)
===================================================== */
const QUESTIONS = [
  { text:"어떤 분야의 고민인가요?", options:["연애","직장/일","금전","관계"] },
  { text:"이 고민은 언제쯤의 이야기인가요?", options:["과거","현재","미래"] },
  { text:"지금 가장 알고 싶은 것은?", options:["방향성","조언","상대의 마음","결과"] }
];

let step = 0;
const qArea = document.getElementById("questionArea");
const tArea = document.getElementById("transitionArea");

function renderQ(){
  qArea.innerHTML = "";
  const q = QUESTIONS[step];
  const p = document.createElement("p");
  p.textContent = q.text;
  qArea.appendChild(p);

  q.options.forEach(o=>{
    const b = document.createElement("button");
    b.textContent = o;
    b.onclick = ()=>nextQ();
    qArea.appendChild(b);
  });
}
function nextQ(){
  step++;
  if(step < QUESTIONS.length) renderQ();
  else{
    qArea.classList.add("hidden");
    tArea.classList.remove("hidden");
  }
}
renderQ();

/* =====================================================
   3. 카드 스프레드
===================================================== */
const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const bigStage = document.getElementById("bigCardStage");
const modal = document.getElementById("confirmModal");
const confirmBtn = document.getElementById("confirmPick");

let selected = [];

document.getElementById("goCard").onclick = ()=>{
  tArea.classList.add("hidden");
  bigStage.classList.remove("hidden");
  spread.classList.remove("hidden");
  initSpread();
};

document.getElementById("resetAll").onclick = ()=>location.reload();

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

function pick(card){
  if(card.classList.contains("sel")){
    card.classList.remove("sel");
    selected = selected.filter(c=>c!==card);
    return;
  }
  if(selected.length>=3) return;
  card.classList.add("sel");
  selected.push(card);
  play(sPick);
  if(selected.length===3) modal.classList.remove("hidden");
}

/* =====================================================
   4. 확정 → 연출 전체
===================================================== */
confirmBtn.onclick = async ()=>{
  modal.classList.add("hidden");

  // 75장 제거
  document.querySelectorAll(".pick:not(.sel)").forEach(c=>{
    c.style.transition="0.8s";
    c.style.opacity=0;
  });

  await wait(1000);

  // 선택 3장 재정렬 (빅카드 하단)
  const baseY = bigStage.getBoundingClientRect().bottom + 20;
  selected.forEach((c,i)=>{
    const r=c.getBoundingClientRect();
    c.style.position="fixed";
    c.style.left = `${window.innerWidth/2 - 90 + i*90}px`;
    c.style.top = `${baseY}px`;
    c.style.zIndex=999;
  });

  // 스크롤 잠금
  document.body.style.overflow="hidden";

  await wait(2000);

  // 파이어볼 생성 & 이동
  const bigCards = document.querySelectorAll(".big-card");
  selected.forEach((c,i)=>{
    const fire=document.createElement("div");
    fire.className="fireball";
    document.body.appendChild(fire);

    const from=c.getBoundingClientRect();
    const to=bigCards[i].getBoundingClientRect();

    fire.style.left=`${from.left+40}px`;
    fire.style.top=`${from.top+40}px`;

    play(sFire);

    fire.animate([
      { transform:`translate(0,0)` },
      { transform:`translate(${to.left-from.left}px, ${to.top-from.top}px)` }
    ],{ duration:3000, easing:"ease-in-out", fill:"forwards" });

    setTimeout(()=>{
      fire.remove();
      c.remove();
    },3000);
  });

  await wait(3200);
  play(sIgnite);

  // 빅카드 점화
  bigCards.forEach(b=>{
    b.classList.add("burning");
  });

  await wait(2000);

  // 연기
  bigCards.forEach(b=>{
    b.classList.remove("burning");
    b.classList.add("smoking");
  });

  await wait(2000);

  // 앞면 공개 (중복 없음)
  bigCards.forEach(b=>{
    const i = Math.floor(Math.random()*DECK.length);
    const card = DECK.splice(i,1)[0];
    b.style.backgroundImage = `url('/assets/tarot/${card}.png')`;
  });

  play(sReveal);
};

/* =====================================================
   util
===================================================== */
const wait = ms => new Promise(r=>setTimeout(r,ms));
