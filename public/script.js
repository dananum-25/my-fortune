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
1. 질문 단계
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
    b.onclick = nextQ;
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
  }
}

renderQ();

/* =====================================================
2. 카드 덱 (락)
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
  MAJORS.forEach(f => d.push(`/assets/tarot/majors/${f}`));
  SUITS.forEach(s =>
    Object.keys(MINOR_NAMES).forEach(n=>{
      d.push(`/assets/tarot/minors/${s}/${n}_${MINOR_NAMES[n]}.png`);
    })
  );
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
  if(selected.length >= 3) return;
  card.classList.add("sel");
  selected.push(card);
  play(sPick);
  if(selected.length === 3) modal.classList.remove("hidden");
}

/* =====================================================
4. 확정 → 전체 연출
===================================================== */
document.getElementById("confirmPick").onclick = async ()=>{
  modal.classList.add("hidden");

  window.scrollTo(0,0);
  document.body.classList.add("lock-scroll");

  // 75장 제거
  document.querySelectorAll(".pick:not(.sel)").forEach(c=>{
    c.classList.add("fade");
  });

  await wait(800);

  // 3장 재정렬 (크기 고정)
  const CARD_W = 90;
  const CARD_H = 135;
  const baseY = bigStage.getBoundingClientRect().bottom + 20;

  selected.forEach((c,i)=>{
    c.style.position = "fixed";
    c.style.width  = `${CARD_W}px`;
    c.style.height = `${CARD_H}px`;
    c.style.left = `${
      window.innerWidth/2 - CARD_W*1.5 + i*(CARD_W+16)
    }px`;
    c.style.top = `${baseY}px`;
    c.style.zIndex = 1000;
  });

  await wait(2000);

  // 파이어볼
  const deck = build78Deck();

  selected.forEach((c,i)=>{
    const fire = document.createElement("div");
    fire.className = "fireball";
    document.body.appendChild(fire);

    const from = c.getBoundingClientRect();
    const to   = bigCards[i].getBoundingClientRect();

    fire.style.left = `${from.left + from.width/2}px`;
    fire.style.top  = `${from.top  + from.height/2}px`;

    play(sFire);

    fire.animate([
      { transform:"translate(0,0)" },
      { transform:`translate(${to.left-from.left}px,${to.top-from.top}px)` }
    ],{ duration:3000, easing:"ease-in-out", fill:"forwards" });

    setTimeout(()=>{
      fire.remove();
      c.remove();
    },3000);
  });

  await wait(3200);
  play(sIgnite);

  // 점화
  bigCards.forEach(b=>b.classList.add("burning"));
  await wait(2000);

  // 연기
  bigCards.forEach(b=>{
    b.classList.remove("burning");
    b.classList.add("smoking");
  });
  await wait(2000);

  // 앞면 공개 (메이저 + 마이너)
  bigCards.forEach(b=>{
    const i = Math.floor(Math.random()*deck.length);
    const img = deck.splice(i,1)[0];
    b.style.backgroundImage = `url('${img}')`;
  });

  play(sReveal);

  // 채팅 활성화
  chat.classList.remove("hidden");
  chat.scrollIntoView({behavior:"smooth", block:"center"});
  chat.style.opacity = 0;
  requestAnimationFrame(()=>chat.style.opacity = 1);

  document.body.classList.remove("lock-scroll");
};

/* util */
const wait = ms => new Promise(r=>setTimeout(r,ms));
