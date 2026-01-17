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
let tarotDB = [];

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
  [
    aiDB,
    lunarMap,
    zodiacDB,
    todayDB,
    tomorrowDB,
    yearDB,
    mbtiDB,
    sajuDB,
    tarotDB
  ] = d;
});

/* ===============================
   CONSTANTS
================================ */
const ZODIAC = ["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];
const ZODIAC_KO = ["쥐띠","소띠","호랑이띠","토끼띠","용띠","뱀띠","말띠","양띠","원숭이띠","닭띠","개띠","돼지띠"];
const MBTI = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP"
];

/* ===============================
   DOM ELEMENTS
================================ */
const zodiacSel = document.getElementById("zodiac");
const mbtiSel = document.getElementById("mbti");

/* ===============================
   SELECT INIT
================================ */
ZODIAC_KO.forEach(z => {
  const opt = document.createElement("option");
  opt.textContent = z;
  zodiacSel.appendChild(opt);
});

MBTI.forEach(m => {
  const opt = document.createElement("option");
  opt.textContent = m;
  mbtiSel.appendChild(opt);
});

/* ===============================
   LUNAR ZODIAC AUTO
================================ */
const birthInput = document.getElementById("birth");
if (birthInput) {
  birthInput.addEventListener("change", e => {
    const d = new Date(e.target.value);
    if (isNaN(d)) return;

    const y = d.getFullYear();
    if (!lunarMap[y]) return;

    const lny = new Date(lunarMap[y]);
    const zodiacYear = d < lny ? y - 1 : y;
    zodiacSel.selectedIndex = (zodiacYear - 4) % 12;
  });
}

/* ===============================
   URL CATEGORY
================================ */
function getCategory(){
  const p = location.pathname;
  if (p.includes("money")) return "money";
  if (p.includes("job")) return "job";
  return "love";
}

/* ===============================
   MAIN START
================================ */
function startFortune(){
  const result = document.getElementById("result");
  if (result) result.classList.remove("hidden");

  const zodiacIndex = zodiacSel.selectedIndex;
  const zodiacKey = ZODIAC[zodiacIndex];
  const zodiacKo = ZODIAC_KO[zodiacIndex];
  const mbti = mbtiSel.value;
  const category = getCategory();

  // SEO
  document.title = `${zodiacKo} ${mbti} ${
    category === "love" ? "연애운" :
    category === "money" ? "금전운" : "직업운"
  }`;

  // 오늘 / 내일 / 올해
  setText("todayTitle", "🌞 오늘의 운세");
  setText("todayText", pick(todayDB));
  setText("tomorrowText", "🌙 내일: " + pick(tomorrowDB));
  setText("yearText", "📅 올해: " + pick(yearDB));

  // 띠별 운세
  const zList = zodiacDB[zodiacKey] || [];
  setText(
    "categoryTitle",
    category === "love" ? "💖 연애운" :
    category === "money" ? "💰 금전운" : "💼 직업운"
  );
  setText("categoryText", pick(zList));

  // 타로 (하루 고정)
  if (tarotDB.length) {
    const seed = new Date().toISOString().slice(0,10);
    const idx = Math.abs(hash(seed)) % tarotDB.length;
    const card = tarotDB[idx];

    const tarotDiv = document.getElementById("tarotCard");
    if (tarotDiv) {
      tarotDiv.className = "tarot-front";
      tarotDiv.style.backgroundImage = `url('${card.image}')`;
    }

    setText("tarotText", card.meaning);
  }
}

/* ===============================
   AI QUESTION ENGINE
================================ */
const CATEGORY_KEYWORDS = {
  love: ["연애","사랑","재회","썸","이별","연락"],
  money: ["돈","금전","재물","수입","투자","사업"],
  job: ["직업","회사","이직","취업","퇴사","직장"]
};

function detectCategory(q){
  let score = { love:0, money:0, job:0 };
  Object.entries(CATEGORY_KEYWORDS).forEach(([cat, words])=>{
    words.forEach(w => {
      if (q.includes(w)) score[cat]++;
    });
  });
  return Object.entries(score).sort((a,b)=>b[1]-a[1])[0][0];
}

function askAI(){
  const qInput = document.getElementById("aiQuestion");
  const aBox = document.getElementById("aiAnswer");
  if (!qInput || !aBox) return;

  const q = qInput.value.trim();
  if (!q) return;

  const category = detectCategory(q);
  let matched = aiDB.filter(
    x => x.category === category &&
    x.keywords.some(k => q.includes(k))
  );

  let selected;
  if (matched.length) {
    matched.sort((a,b)=>b.count - a.count);
    selected = matched[0];
    selected.count++;
  } else {
    selected = {
      id: Date.now(),
      category,
      keywords: [q],
      answer: "지금은 흐름을 지켜보는 것이 가장 좋아 보입니다.",
      count: 1
    };
    aiDB.push(selected);
  }

  aBox.innerText = selected.answer;
  qInput.value = "";
}

/* ===============================
   UTIL
================================ */
function pick(arr){
  if (!arr || !arr.length) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

function setText(id, text){
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function hash(s){
  let h = 0;
  for (let i=0;i<s.length;i++){
    h = (h<<5) - h + s.charCodeAt(i);
  }
  return h;
}
