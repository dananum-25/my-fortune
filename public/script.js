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
   CATEGORY
================================ */
function getCategory(){
  const p = location.pathname;
  if (p.includes("money")) return "money";
  if (p.includes("job")) return "job";
  return "love";
}

/* ===============================
   MAIN
================================ */
function startFortune(){
  if (!DB_READY) {
    alert("데이터 로딩 중입니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  document.getElementById("result")?.classList.remove("hidden");

  const zodiacIndex = zodiacSel.selectedIndex;
  const zodiacKey = ZODIAC[zodiacIndex];
  const zodiacKo = ZODIAC_KO[zodiacIndex];
  const mbti = mbtiSel.value;
  const category = getCategory();

  const catKo = category === "love" ? "연애운" : category === "money" ? "금전운" : "직업운";
  document.title = `${zodiacKo} ${mbti !== "UNKNOWN" ? mbti : ""} ${catKo} | 오늘의 운세`.trim();

  setText("todayText", pick(todayDB));
  setText("tomorrowText", pick(tomorrowDB));
  setText("yearText", pick(yearDB));

  const zObj = zodiacDB[zodiacKey];
  const zList = Array.isArray(zObj?.today) ? zObj.today : [];
  setText("categoryTitle", `🐲 ${catKo}`);
  setText("categoryText", pick(zList));

  drawTarot();
}

/* ===============================
   TAROT (FINAL)
================================ */
function drawTarot() {
  const majors = Array.isArray(tarotDB.majors) ? tarotDB.majors : [];
  const minors = Array.isArray(tarotDB.minors) ? tarotDB.minors : [];
  const all = [...majors, ...minors];
  if (!all.length) return;

  const seed = new Date().toISOString().slice(0,10);
  const card = all[Math.abs(hash(seed)) % all.length];
  const upright = Math.abs(hash(seed + "u")) % 2 === 0;

  const imgEl = document.getElementById("tarotImg");
  const txtEl = document.getElementById("tarotText");
  if (!imgEl || !txtEl) return;

  const imgPath = card.image?.startsWith("/") ? card.image : "/" + card.image;
  imgEl.src = imgPath;
  imgEl.onerror = () => console.error("Tarot image 404:", imgPath);

  if (card.type === "major") {
    const summary = upright ? card.upright?.summary : card.reversed?.summary;
    txtEl.innerText = `${card.name_ko} (${upright ? "정방향" : "역방향"})\n${summary || ""}`;
  } else {
    const suitMap = { cups:"컵", wands:"완드", swords:"소드", pentacles:"펜타클" };
    txtEl.innerText = `${suitMap[card.suit] || card.suit} ${card.number}\n${(card.keywords||[]).join(", ")}`;
  }
}

/* ===============================
   AI 상담
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

  const cat = Object.entries(CATEGORY_KEYWORDS)
    .map(([k,v])=>[k,v.filter(w=>q.includes(w)).length])
    .sort((a,b)=>b[1]-a[1])[0][0];

  const pool = aiDB.filter(x=>x.category===cat && x.keywords?.some(k=>q.includes(k)));
  const sel = pool.sort((a,b)=>(b.count||0)-(a.count||0))[0] ||
    { answer:"지금은 흐름을 지켜보는 것이 좋아 보입니다." };

  out.innerText = sel.answer;
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
