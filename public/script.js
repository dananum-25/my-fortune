/* ===============================
   GLOBAL DB LOAD (구조 맞춤)
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

  todayDB = (_todayJSON?.pools?.today) || [];
  tomorrowDB = (_tomorrowJSON?.pools?.tomorrow) || [];
  yearDB = (_yearJSON?.pools?.year_all) || [];

  mbtiDB = (_mbtiJSON?.traits) || {};
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
   DOM ELEMENTS
================================ */
const zodiacSel = document.getElementById("zodiac");
const mbtiSel = document.getElementById("mbti");
const birthInput = document.getElementById("birth");

/* ===============================
   SELECT INIT (DB 로딩 후 1회)
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

  const keys = Object.keys(mbtiDB);
  const list = keys.length ? keys : MBTI_ORDER;
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
  birthInput.addEventListener("change", () => autoSetZodiacFromBirth());
}

function autoSetZodiacFromBirth() {
  if (!birthInput || !birthInput.value) return;
  const d = new Date(birthInput.value);
  if (isNaN(d)) return;

  const y = d.getFullYear();
  const lnyStr = lunarMap[String(y)] || lunarMap[y];
  if (!lnyStr) return;

  const lny = new Date(lnyStr);
  const zodiacYear = d < lny ? y - 1 : y;
  const idx = ((zodiacYear - 4) % 12 + 12) % 12;
  zodiacSel.selectedIndex = idx;
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
  if (!DB_READY) {
    alert("데이터 로딩 중입니다. 1~2초 후 다시 눌러주세요.");
    return;
  }

  const result = document.getElementById("result");
  if (result) result.classList.remove("hidden");

  const zodiacIndex = zodiacSel.selectedIndex;
  const zodiacKey = ZODIAC[zodiacIndex];
  const zodiacKo = ZODIAC_KO[zodiacIndex];
  const mbti = mbtiSel.value;
  const category = getCategory();

  const catKo = (category === "love" ? "연애운" : category === "money" ? "금전운" : "직업운");
  document.title = `${zodiacKo} ${mbti !== "UNKNOWN" ? mbti : ""} ${catKo} | 오늘의 운세`.replace(/\s+/g, " ").trim();

  setText("todayTitle", "🌞 오늘의 운세");
  setText("todayText", pick(todayDB));
  setText("tomorrowText", "🌙 내일의 운세: " + pick(tomorrowDB));
  setText("yearText", "📅 올해의 운세: " + pick(yearDB));

  const zObj = zodiacDB[zodiacKey];
  const zToday = (zObj && Array.isArray(zObj.today)) ? zObj.today : [];
  setText("categoryTitle", catKo);
  setText("categoryText", pick(zToday));

  drawTarot();
}

/* ===============================
   TAROT (FINAL / majors + minors)
================================ */
function drawTarot() {
  if (!DB_READY) return;

  const majors = Array.isArray(tarotDB.majors) ? tarotDB.majors : [];
  const minors = Array.isArray(tarotDB.minors) ? tarotDB.minors : [];
  const allCards = [...majors, ...minors];
  if (!allCards.length) return;

  const seed = new Date().toISOString().slice(0,10);
  const idx = Math.abs(hash(seed)) % allCards.length;
  const card = allCards[idx];

  const upright = Math.abs(hash(seed + "_u")) % 2 === 0;

  const imgEl = document.getElementById("tarotImg");
  const textEl = document.getElementById("tarotText");
  if (!imgEl || !textEl) return;

  imgEl.src = card.image;
  imgEl.alt = card.name_ko || "Tarot Card";
  imgEl.onerror = () => console.error("Tarot image 404:", card.image);

  if (card.type === "major") {
    const summary = upright ? card.upright?.summary : card.reversed?.summary;
    textEl.innerText =
      `${card.name_ko} (${upright ? "정방향" : "역방향"})\n` +
      (summary || "");
  } else {
    const suitKo = { cups:"컵", wands:"완드", swords:"소드", pentacles:"펜타클" }[card.suit] || card.suit;
    textEl.innerText =
      `${suitKo} ${card.number}\n` +
      (Array.isArray(card.keywords) ? card.keywords.join(", ") : "");
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
    words.forEach(w => { if (q.includes(w)) score[cat]++; });
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
    Array.isArray(x.keywords) &&
    x.keywords.some(k => q.includes(k))
  );

  let selected;
  if (matched.length) {
    matched.sort((a,b)=>(b.count||0) - (a.count||0));
    selected = matched[0];
    selected.count = (selected.count||0) + 1;
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
  if (!Array.isArray(arr) || arr.length === 0) return "";
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
    h |= 0;
  }
  return h;
}
