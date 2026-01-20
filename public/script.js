const GAS_URL="https://script.google.com/macros/s/AKfycbwPAEMT74SQGF0H2aUymPWwslS-QNYe8jV_Sgp5n2dbyqVGGysLfbuK3Gdcpth_nsBQ/exec";
const VOLUME=.15;
const chat=document.getElementById("chatContainer");
const input=document.getElementById("userInput");
const sendBtn=document.getElementById("sendBtn");
const soundBtn=document.getElementById("soundToggle");
const grid=document.getElementById("grid78");
const modal=document.getElementById("confirmModal");
const btnGo=document.getElementById("btnGo");
const btnKeep=document.getElementById("btnKeep");
const bigBacks=[...document.querySelectorAll(".big-back")];

let muted=true; let selected=[];

const bgm=new Audio("/sounds/tarot/ambient_entry.mp3"); bgm.loop=true; bgm.volume=VOLUME;
function playBgm(){ if(!muted){ bgm.play().catch(()=>{})}}
soundBtn.onclick=()=>{muted=!muted; soundBtn.textContent=muted?"🔇":"🔊"; if(!muted)playBgm(); else bgm.pause()}

function addMsg(t,who){const d=document.createElement("div");d.className=`msg ${who}`;d.textContent=t;chat.appendChild(d);chat.scrollTop=chat.scrollHeight}
addMsg("안녕. 마음이 가는 카드 3장을 골라줘.","cat")

// 78장 생성
for(let i=0;i<78;i++){
  const c=document.createElement("div");
  c.className="pick";
  c.onclick=()=>{
    if(c.classList.contains("sel")){
      c.classList.remove("sel");
      selected=selected.filter(x=>x!==c);
      enableAll();
      return;
    }
    if(selected.length>=3) return;
    c.classList.add("sel"); selected.push(c);
    if(selected.length===3){
      disableOthers();
      modal.classList.remove("hidden");
    }
  };
  grid.appendChild(c);
}
function disableOthers(){[...document.querySelectorAll(".pick")].forEach(p=>!p.classList.contains("sel")&&p.classList.add("dis"))}
function enableAll(){[...document.querySelectorAll(".pick")].forEach(p=>p.classList.remove("dis"))}

btnKeep.onclick=()=>{ modal.classList.add("hidden") }
btnGo.onclick=async()=>{
  modal.classList.add("hidden");
  await reveal();
};

async function reveal(){
  for(let i=0;i<3;i++){
    bigBacks[i].style.animation="ignite 1s";
    await wait(900);
    bigBacks[i].style.animation="smoke .4s forwards";
    await wait(400);
    bigBacks[i].style.backgroundImage="url('/assets/tarot/majors/00_the_fool.png')";
    await wait(300);
  }
  addMsg("이 카드들 중에서 제일 먼저 눈에 들어온 건 뭐야?","cat")
}
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));

sendBtn.onclick=()=>{ if(!input.value.trim())return; addMsg(input.value,"user"); input.value="" };
