/*************************************************
 * TAROT ENGINE v1.2  (STEP 4)
 * - 카드 이동 / 불꽃 / 연기 / 리빌
 *************************************************/

/* ===== STATE ===== */
const STATE = { PICKING:"PICKING", CONFIRM:"CONFIRM", REVEAL:"REVEAL" };
let state = STATE.PICKING;

/* ===== DECK ===== */
function createDeck(){
  const d=[];
  for(let i=0;i<22;i++) d.push(`/assets/tarot/majors/${String(i).padStart(2,"0")}_the_fool.png`);
  const suits=["cups","wands","swords","pentacles"];
  suits.forEach(s=>{
    for(let i=1;i<=14;i++){
      d.push(`/assets/tarot/minors/${s}/${String(i).padStart(2,"0")}.png`);
    }
  });
  return d;
}
let deck=createDeck();

/* ===== DOM ===== */
const grid=document.getElementById("grid78");
const modal=document.getElementById("confirmModal");
const btnGo=document.getElementById("btnGo");
const btnKeep=document.getElementById("btnKeep");
const bigCards=document.querySelectorAll(".big-card");
const chat=document.getElementById("chatContainer");

/* ===== CHAT ===== */
function addMsg(t,w){
  const d=document.createElement("div");
  d.className=`msg ${w}`;
  d.textContent=t;
  chat.appendChild(d);
  chat.scrollTop=chat.scrollHeight;
}
addMsg("마음이 가는 카드 3장을 골라줘 🐾","cat");

/* ===== PICKS ===== */
let selected=[];
for(let i=0;i<78;i++){
  const c=document.createElement("div");
  c.className="pick";
  c.onclick=()=>{
    if(c.classList.contains("sel")){
      c.classList.remove("sel");
      selected=selected.filter(x=>x!==c);
      return;
    }
    if(selected.length>=3) return;
    c.classList.add("sel");
    selected.push(c);
    if(selected.length===3){
      state=STATE.CONFIRM;
      modal.classList.remove("hidden");
    }
  };
  grid.appendChild(c);
}

/* ===== CONFIRM ===== */
btnKeep.onclick=()=>modal.classList.add("hidden");
btnGo.onclick=()=>{
  modal.classList.add("hidden");
  reveal();
};

async function reveal(){
  // 75장 제거
  document.querySelectorAll(".pick:not(.sel)").forEach(p=>{
    p.classList.add("fade");
    setTimeout(()=>p.remove(),600);
  });

  const faces=deck.sort(()=>Math.random()-0.5).slice(0,3);

  for(let i=0;i<3;i++){
    bigCards[i].classList.add("ignite");
    await wait(600);
    bigCards[i].classList.add("smoke");
    await wait(400);
    bigCards[i].style.backgroundImage=`url('${faces[i]}')`;
  }
  addMsg("이 카드들 중 가장 먼저 눈에 들어온 건 뭐야?","cat");
}

const wait=ms=>new Promise(r=>setTimeout(r,ms));
