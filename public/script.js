/* ===============================
   GAS WEB APP URL (🔥 이것만 관리)
================================ */
const GAS_URL = "https://script.google.com/macros/s/AKfycbwPAEMT74SQGF0H2aUymPWwslS-QNYe8jV_Sgp5n2dbyqVGGysLfbuK3Gdcpth_nsBQ/exec";

/* ===============================
   GLOBAL DB LOAD
================================ */
let aiDB = [];
let lunarMap = {};
let zodiacDB = {};
let todayDB = [];
let tomorrowDB = [];
let yearDB = [];
let mbtiDB = {};
let sajuDB = {};
let tarotDB = {};

let DB_READY = false;

Promise.all([
  fetch("/data/ai_qa.json").then(r => r.json()),
  fetch("/data/lunar_new_year_1920_2026.json").then(r => r.json()),
  fetch("/data/zodiac_fortunes_ko_2026.json").then(r => r.json()),
  fetch("/data/fortunes_ko_today.json").then(r => r.json()),
  fetch("/data/fortunes_ko_tomorrow.json").then(r => r.json()),
  fetch("/data/fortunes_ko_2026.json").then(r => r.json()),
  fetch("/data/mbti_traits_ko.json").then(r => r.json()),
  fetch("/data/saju_ko.json").then(r => r.json()),
  fetch("/data/tarot_db_ko.json").then(r => r.json())
]).then(d => {
  const [
    _aiDB,
    _lunarMap,
    _zodiacDB,
    _todayJSON,
    _tomorrowJSON,
    _yearJSON,
    _mbtiJSON,
    _sajuDB,
    _tarotDB
  ] = d;

  aiDB = Array.isArray(_aiDB) ? _aiDB : [];
  lunarMap = _lunarMap || {};
  zodiacDB = _zodiacDB || {};

  todayDB = _todayJSON?.pools?.today || [];
  tomorrowDB = _tomorrowJSON?.pools?.tomorrow || [];
  yearDB = _yearJSON?.pools?.year_all || [];

  mbtiDB = _mbtiJSON?.traits || {};
  sajuDB = _sajuDB || {};
  tarotDB = _tarotDB || {};

  initSelectsOnce();
  autoSetZodiacFromBirth();
  DB_READY = true;
}).catch(err => {
  console.error("DB load failed:", err);
});

/* ===============================
   CONSTANTS
================================ */
const ZODIAC = ["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];
const ZODIAC_KO = ["쥐띠","소띠","호랑이띠","토끼띠","용띠","뱀띠","말띠","양띠","원숭이띠","닭띠","개띠","돼지띠"];
const MBTI_ORDER = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP"
];

/* ===============================
   DOM
================================ */
const zodiacSel = document.getElementById("zodiac");
const mbtiSel = document.getElementById("mbti");
const birthInput = document.getElementById("birth");

/* ===============================
   SELECT INIT
================================ */
let SELECT_INIT_DONE = false;
function initSelectsOnce() {
  if (SELECT_INIT_DONE) return;
  SELECT_INIT_DONE = true;

  zodiacSel.innerHTML = "";
  ZODIAC_KO.forEach(z => {
    const opt = document.createElement("option");
    opt.textContent = z;
    zodiacSel.appendChild(opt);
  });

  mbtiSel.innerHTML = "";
  const unknown = document.createElement("option");
  unknown.value = "UNKNOWN";
  unknown.textContent = "모르겠어요";
  mbtiSel.appendChild(unknown);

  const list = Object.keys(mbtiDB).length ? Object.keys(mbtiDB) : MBTI_ORDER;
  list.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    mbtiSel.appendChild(opt);
  });
}

/* ===============================
   LUNAR ZODIAC AUTO
================================ */
if (birthInput) {
  birthInput.addEventListener("change", autoSetZodiacFromBirth);
}

function autoSetZodiacFromBirth() {
  if (!birthInput?.value) return;
  const d = new Date(birthInput.value);
  if (isNaN(d)) return;

  const y = d.getFullYear();
  const lnyStr = lunarMap[String(y)] || lunarMap[y];
  if (!lnyStr) return;

  const lny = new Date(lnyStr);
  const zodiacYear = d < lny ? y - 1 : y;
  zodiacSel.selectedIndex = ((zodiacYear - 4) % 12 + 12) % 12;
}

/* ===============================
   AI 상담 (🔥 여기서 GAS로 저장됨)
================================ */
const CATEGORY_KEYWORDS = {
  love: ["연애","사랑","재회","썸","이별","연락"],
  money: ["돈","금전","재물","수입","투자","사업"],
  job: ["직업","회사","이직","취업","퇴사","직장"]
};

function askAI(){
  const q = document.getElementById("aiQuestion")?.value.trim();
  const out = document.getElementById("aiAnswer");
  if (!q || !out) return;

  /* 1️⃣ 기존 AI 답변 로직 (유지) */
  const cat = Object.entries(CATEGORY_KEYWORDS)
    .map(([k,v])=>[k,v.filter(w=>q.includes(w)).length])
    .sort((a,b)=>b[1]-a[1])[0][0];

  const pool = aiDB.filter(x=>x.category===cat && x.keywords?.some(k=>q.includes(k)));
  const sel = pool.sort((a,b)=>(b.count||0)-(a.count||0))[0] ||
    { answer:"지금은 흐름을 지켜보는 것이 좋아 보입니다." };

  out.innerText = sel.answer;

  /* 2️⃣ GAS로 상담 로그 전송 (저장 전용) */
  fetch(GAS_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({
      type: "ai",
      session_id: localStorage.getItem("session_id") || (() => {
        const s = crypto.randomUUID();
        localStorage.setItem("session_id", s);
        return s;
      })(),
      question: q,
      category: cat,
      device: /Mobi/i.test(navigator.userAgent) ? "mobile" : "desktop",
      entry_point: "ai_consult"
    })
  });
}

/* ===============================
   UTIL
================================ */
function pick(arr){
  return Array.isArray(arr) && arr.length ? arr[Math.floor(Math.random()*arr.length)] : "";
}

function setText(id, text){
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function hash(s){
  let h=0; for(let i=0;i<s.length;i++){ h=(h<<5)-h+s.charCodeAt(i); h|=0; } return h;
}
