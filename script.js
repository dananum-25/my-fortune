/* ====== 상수 ====== */
const API_URL = "https://script.google.com/macros/s/AKfycbxWOEtmQ-7we79MHtPtsRxE30Ckz5cmnuCY5CFi_Vd7Lq2Mub6bZoYIhAWJGKQRRhr8/exec";

const ZODIAC = ["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];
const ZODIAC_KO = ["쥐띠","소띠","호랑이띠","토끼띠","용띠","뱀띠","말띠","양띠","원숭이띠","닭띠","개띠","돼지띠"];
const MBTI = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];

/* ====== DOM ====== */
const zodiacSel = document.getElementById("zodiac");
const mbtiSel = document.getElementById("mbti");
const birthInput = document.getElementById("birth");

/* ====== DB ====== */
let lunarMap = {};
let todayDB = [];
let tomorrowDB = [];
let yearDB = [];
let zodiacDB = {};
let tarotDB = [];

/* ====== 초기 로드 ====== */
Promise.all([
  fetch("/data/lunar_new_year_1920_2026.json").then(r=>r.json()),
  fetch("/data/fortunes_ko_today.json").then(r=>r.json()),
  fetch("/data/fortunes_ko_tomorrow.json").then(r=>r.json()),
  fetch("/data/fortunes_ko_2026.json").then(r=>r.json()),
  fetch("/data/zodiac_fortunes_ko_2026.json").then(r=>r.json()),
  fetch("/data/tarot_db_ko.json").then(r=>r.json())
]).then(d=>{
  [lunarMap,todayDB,tomorrowDB,yearDB,zodiacDB,tarotDB]=d;
});

/* ====== Select 초기화 ====== */
ZODIAC_KO.forEach(z=>{
  const o=document.createElement("option");
  o.textContent=z;
  zodiacSel.appendChild(o);
});
MBTI.forEach(m=>{
  const o=document.createElement("option");
  o.textContent=m;
  o.value=m;
  mbtiSel.appendChild(o);
});

/* ====== 음력 띠 자동 ====== */
birthInput.addEventListener("change",()=>{
  const d=new Date(birthInput.value);
  const y=d.getFullYear();
  if(!lunarMap[y]) return;
  const lny=new Date(lunarMap[y]);
  const zy=d<lny?y-1:y;
  zodiacSel.selectedIndex=(zy-4)%12;
});

/* ====== 운세 시작 ====== */
function startFortune(){
  document.getElementById("result").classList.remove("hidden");

  document.getElementById("todayText").innerText = pick(todayDB);
  document.getElementById("tomorrowText").innerText = "🌙 내일: " + pick(tomorrowDB);
  document.getElementById("yearText").innerText = "📅 올해: " + pick(yearDB);

  const zKey = ZODIAC[zodiacSel.selectedIndex];
  document.getElementById("categoryTitle").innerText="띠별 운세";
  document.getElementById("categoryText").innerText=pick(zodiacDB[zKey]);

  drawTarot();
}

/* ====== 타로 (하루 고정) ====== */
function drawTarot(){
  const seed=new Date().toISOString().slice(0,10);
  const idx=Math.abs(hash(seed))%tarotDB.length;
  const card=tarotDB[idx];
  document.getElementById("tarotImg").src=card.image;
  document.getElementById("tarotText").innerText=card.meaning;
}

/* ====== AI 상담 ====== */
let aiSession={id:Date.now()+"",step:1};

function appendChat(text,who){
  const d=document.createElement("div");
  d.className=who==="ai"?"chat-ai":"chat-user";
  d.innerText=text;
  document.getElementById("chatLog").appendChild(d);
}

function resetAI(){
  aiSession={id:Date.now()+"",step:1};
  document.getElementById("chatLog").innerHTML="";
}

async function askAI(){
  const q=document.getElementById("aiQuestion").value.trim();
  if(!q) return;
  appendChat(q,"user");
  document.getElementById("aiQuestion").value="";

  const res=await fetch(API_URL,{method:"POST",body:JSON.stringify({
    question:q,session_id:aiSession.id,step:aiSession.step
  })}).then(r=>r.json());

  appendChat(res.message||res.answer||res.question,"ai");
  aiSession.step++;
}

/* ====== MBTI 검사 ====== */
function openMbtiTest(){
  alert("MBTI 간이 검사는 다음 단계에서 연결됩니다 🙂");
}

/* ====== Util ====== */
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function hash(s){let h=0;for(let i of s)h=(h<<5)-h+i.charCodeAt(0);return h;}
