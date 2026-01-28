/* =====================================================
   0. 사운드
===================================================== */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;

const sPick   = new Audio("/sounds/tarot/card_pick.mp3");
const sFire   = new Audio("/sounds/tarot/fire_whoosh.mp3");
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
   1. 카드 덱 (메이저 + 마이너 전체)
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

const SUITS = ["cups","wands","swords","pentacles"];
const RANKS = [
  "01_ace","02_two","03_three","04_four","05_five","06_six","07_seven",
  "08_eight","09_nine","10_ten","11_page","12_knight","13_queen","14_king"
];

const MINORS = [];
SUITS.forEach(s=>{
  RANKS.forEach(r=>{
    MINORS.push(`${s}/${r}`);
  });
});

let DECK = [...MAJORS, ...MINORS]; // 78장

/* =====================================================
   2. 질문 단계 (BASE 유지)
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
   4. 확정 → 연출
===================================================== */
confirmBtn.onclick = async ()=>{
  modal.classList.add("hidden");

  /* ① 스크롤 초기화 + 잠금 */
  window.scrollTo(0,0);
  document.body.style.overflow = "hidden";

  /* ② 75장 제거 */
  document.querySelectorAll(".pick:not(.sel)").forEach(c=>{
    c.style.transition="0.6s";
    c.style.opacity=0;
  });

  await wait(800);

  /* ③ 선택 3장 재정렬 (원래 카드 크기 유지) */
  const baseY = bigStage.getBoundingClientRect().bottom + 20;

  selected.forEach((c,i)=>{
    const r = c.getBoundingClientRect();
    c.style.position="fixed";
    c.style.width = `${r.width}px`;
    c.style.height = `${r.height}px`;
    c.style.left = `${window.innerWidth/2 - r.width*1.5 + i*(r.width+12)}px`;
    c.style.top = `${baseY}px`;
    c.style.zIndex = 1000;
  });

  await wait(2000);

  /* ④ 파이어볼 */
  const bigCards = document.querySelectorAll(".big-card");

  selected.forEach((c,i)=>{
    const fire = document.createElement("div");
    fire.className = "fireball";
    document.body.appendChild(fire);

    const from = c.getBoundingClientRect();
    const to = bigCards[i].getBoundingClientRect();

    fire.style.left = `${from.left + from.width/2}px`;
    fire.style.top  = `${from.top  + from.height/2}px`;

    play(sFire);

    fire.animate([
      { transform:"translate(0,0)" },
      { transform:`translate(${to.left-from.left}px, ${to.top-from.top}px)` }
    ],{ duration:3000, easing:"ease-in-out", fill:"forwards" });

    setTimeout(()=>{
      fire.remove();
      c.remove();
    },3000);
  });

  await wait(3200);
  play(sIgnite);

  /* ⑤ 빅카드 점화 */
  bigCards.forEach(b=>b.classList.add("burning"));
  await wait(2000);

  /* ⑥ 연기 */
  bigCards.forEach(b=>{
    b.classList.remove("burning");
    b.classList.add("smoking");
  });
  await wait(2000);

  /* ⑦ 앞면 공개 (마이너 포함, 중복 없음) */
  bigCards.forEach(b=>{
    const i = Math.floor(Math.random()*DECK.length);
    const card = DECK.splice(i,1)[0];
    b.style.backgroundImage = `url('/assets/tarot/${card}.png')`;
  });

  play(sReveal);

  /* ⑧ 채팅 활성화 */
  document.body.style.overflow="auto";
  const chat = document.getElementById("chatContainer");
  if(chat){
    chat.style.display = "block";
  }
};

/* util */
const wait = ms => new Promise(r=>setTimeout(r,ms));
