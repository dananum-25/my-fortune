/* ===============================
   0. 사운드
================================ */
const SFX = {
  bgm: new Audio("/sounds/tarot/ambient_entry.mp3"),
  pick: new Audio("/sounds/tarot/pick.mp3"),
  fire: new Audio("/sounds/tarot/fire.mp3"),
  reveal: new Audio("/sounds/tarot/reveal.mp3")
};
SFX.bgm.loop = true;
SFX.bgm.volume = 0.15;
let muted = true;

soundToggle.onclick = () => {
  muted = !muted;
  soundToggle.textContent = muted ? "사운드 🔇" : "사운드 🔊";
  muted ? SFX.bgm.pause() : SFX.bgm.play().catch(()=>{});
};

/* ===============================
   1. 질문 단계 (BASE 유지)
================================ */
const QUESTIONS = [
  { text:"어떤 분야의 고민인가요?", options:["연애","직장","금전","관계"] },
  { text:"언제쯤의 이야기인가요?", options:["과거","현재","미래"] },
  { text:"가장 알고 싶은 것은?", options:["방향","조언","상대 마음","결과"] }
];

let step = 0;
function renderQuestion(){
  questionArea.innerHTML="";
  const q=QUESTIONS[step];
  questionArea.innerHTML=`<p>${q.text}</p>`;
  q.options.forEach(opt=>{
    const b=document.createElement("button");
    b.textContent=opt;
    b.onclick=()=>{
      step++;
      step<QUESTIONS.length
        ? renderQuestion()
        : (questionArea.classList.add("hidden"),
           transitionArea.classList.remove("hidden"));
    };
    questionArea.appendChild(b);
  });
}
renderQuestion();

/* ===============================
   2. 카드 테이블 (락)
================================ */
const MAJORS = [
 "00_the_fool.png","01_the_magician.png","02_the_high_priestess.png",
 "03_the_empress.png","04_the_emperor.png","05_the_hierophant.png",
 "06_the_lovers.png","07_the_chariot.png","08_strength.png",
 "09_the_hermit.png","10_wheel_of_fortune.png","11_justice.png",
 "12_the_hanged_man.png","13_death.png","14_temperance.png",
 "15_the_devil.png","16_the_tower.png","17_the_star.png",
 "18_the_moon.png","19_the_sun.png","20_judgement.png",
 "21_the_world.png"
];
const SUITS=["cups","wands","swords","pentacles"];
const MINOR_NAMES={
 "01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six",
 "07":"seven","08":"eight","09":"nine","10":"ten",
 "11":"page","12":"knight","13":"queen","14":"king"
};

/* ===============================
   3. 스프레드
================================ */
let selected=[];
goCard.onclick=()=>{
  transitionArea.classList.add("hidden");
  spreadSection.classList.remove("hidden");
  initSpread();
};

function initSpread(){
  grid78.innerHTML="";
  selected=[];
  for(let i=0;i<78;i++){
    const d=document.createElement("div");
    d.className="pick";
    d.onclick=()=>pickCard(d);
    grid78.appendChild(d);
  }
}

function pickCard(card){
  if(card.classList.contains("sel")) return;
  if(selected.length>=3) return;
  card.classList.add("sel");
  selected.push(card);
  SFX.pick.play().catch(()=>{});
  if(selected.length===3) confirmModal.classList.remove("hidden");
}

/* ===============================
   4. C 단계 연출 (핵심)
================================ */
confirmPick.onclick=async()=>{
  confirmModal.classList.add("hidden");
  document.body.classList.add("lock");

  // 75장 제거
  grid78.innerHTML="";
  selected.forEach(c=>grid78.appendChild(c));

  // 재정렬
  grid78.style.display="flex";
  grid78.style.justifyContent="center";
  grid78.style.gap="14px";

  await wait(1000);

  // 파이어볼 → 빅카드 이동
  for(let i=0;i<3;i++){
    await fireToBig(selected[i], document.querySelectorAll(".big-card")[i]);
  }

  // 빅카드 점화 & 앞면
  const deck=build78Deck();
  document.querySelectorAll(".big-card").forEach((c,i)=>{
    setTimeout(()=>{
      c.classList.add("ignite");
      c.style.backgroundImage=`url('${deck[i]}')`;
      SFX.reveal.play().catch(()=>{});
      if(i===2) activateChat();
    }, i*1200);
  });
};

/* ===============================
   5. 파이어볼 함수
================================ */
async function fireToBig(from,to){
  const r1=from.getBoundingClientRect();
  const r2=to.getBoundingClientRect();

  const fire=document.createElement("div");
  fire.className="fireball";
  fire.style.left=r1.left+"px";
  fire.style.top=r1.top+"px";
  document.body.appendChild(fire);
  SFX.fire.play().catch(()=>{});

  await animateFire(fire,r1,r2);
  fire.remove();
}

function animateFire(el,a,b){
  return new Promise(res=>{
    el.animate([
      { transform:`translate(0,0)` },
      { transform:`translate(${b.left-a.left}px, ${b.top-a.top}px)` }
    ],{ duration:1400, easing:"cubic-bezier(.2,.8,.2,1)" })
    .onfinish=res;
  });
}

/* ===============================
   6. 덱 생성
================================ */
function build78Deck(){
  const deck=[];
  MAJORS.forEach(f=>deck.push(`/assets/tarot/majors/${f}`));
  SUITS.forEach(s=>{
    Object.keys(MINOR_NAMES).forEach(n=>{
      deck.push(`/assets/tarot/minors/${s}/${n}_${MINOR_NAMES[n]}.png`);
    });
  });
  return deck.sort(()=>Math.random()-0.5);
}

/* ===============================
   7. 채팅
================================ */
function activateChat(){
  chatContainer.classList.remove("hidden");
  chatLog.innerHTML="🐾 카드가 모두 열렸어요. 이제 이야기해볼까요?";
}

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
