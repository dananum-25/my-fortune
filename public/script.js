/* =====================================================
0. 사운드 (실제 mp3 파일명 기준 – FIX)
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
1. 질문 단계
===================================================== */

/* 🔑 화면 표시용 한글 */
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

/* 🔑 GAS 전달용 category (한글 고정) */
const CATEGORY_MAP = {
  love: "연애",
  career: "직업",
  money: "금전",
  relationship: "관계"
};

const QUESTIONS = [
  { text:"어떤 분야의 고민인가요?", options:["love","career","money","relationship"] },
  { text:"이 고민은 언제쯤의 이야기인가요?", options:["past","present","future"] },
  { text:"지금 가장 알고 싶은 것은?", options:["direction","advice","feeling","result"] }
];

let step = 0;
let selectedCategory = QUESTIONS[0].options[0];

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
    b.textContent = LABELS[o] || o;
    b.onclick = ()=>{
      if(step === 0) selectedCategory = o;
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
  }
}

renderQ();

/* =====================================================
2. 카드 덱 (78장 고정)
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
  MAJORS.forEach(f => d.push(`major_${f.slice(0,2)}`));
  SUITS.forEach(s=>{
    Object.keys(MINOR_NAMES).forEach(n=>{
      d.push(`${s}_${n}`);
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
    pickedCards.push(cardId);
  });

  bigCards.forEach((b,i)=>{
    b.style.backgroundImage = `url('/assets/tarot/${pickedCards[i]}.png')`;
  });

  play(sReveal);

  await fetchReading(
    CATEGORY_MAP[selectedCategory],
    pickedCards
  );

  document.body.classList.remove("lock-scroll");
};

/* =====================================================
5. 리딩 API 연동 (GAS)
===================================================== */
const READING_API =
"https://script.google.com/macros/s/AKfycbxcjMm_oEY1zqBadwZgLNY4cFaYDWkciUyIC8t3uBA9dCAe3iL9Ol6e0mBJAVXSB60L/exec";

async function fetchReading(category, cards){
  chat.classList.remove("hidden");
  chat.innerHTML = "<p>🔮 리딩 중입니다…</p>";

  try{
    const res = await fetch(READING_API,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        category,
        cards
      })
    });

    const data = await res.json();
    if(data.status !== "success") throw new Error(data.message);

    chat.innerHTML = `
      <h3>🔮 리딩 결과</h3>
      <p><strong>과거</strong><br>${data.reading.past}</p>
      <p><strong>현재</strong><br>${data.reading.present}</p>
      <p><strong>미래</strong><br>${data.reading.future}</p>
    `;
    chat.scrollIntoView({behavior:"smooth"});

  }catch(e){
    console.error(e);
    chat.innerHTML = `<p>⚠️ 리딩을 불러오지 못했습니다.</p>`;
  }
}

/* util */
const wait = ms => new Promise(r=>setTimeout(r,ms));
