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
  fetch("/data/ai_qa.json").then(r=>r.json()),
  fetch("/data/lunar_new_year_1920_2026.json").then(r=>r.json()),
  fetch("/data/zodiac_fortunes_ko_2026.json").then(r=>r.json()),
  fetch("/data/fortunes_ko_today.json").then(r=>r.json()),
  fetch("/data/fortunes_ko_tomorrow.json").then(r=>r.json()),
  fetch("/data/fortunes_ko_2026.json").then(r=>r.json()),
  fetch("/data/mbti_traits_ko.json").then(r=>r.json()),
  fetch("/data/saju_ko.json").then(r=>r.json()),
  fetch("/data/tarot_db_ko.json").then(r=>r.json())
]).then(d=>{
  [aiDB,lunarMap,zodiacDB,todayDB,tomorrowDB,yearDB,mbtiDB,sajuDB,tarotDB] = d;
});

/* ===============================
   CONSTANTS
================================ */
const ZODIAC = ["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];
const ZODIAC_KO = ["쥐띠","소띠","호랑이띠","토끼띠","용띠","뱀띠","말띠","양띠","원숭이띠","닭띠","개띠","돼지띠"];
const MBTI = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];

const zodiacSel = document.getElementById("zodiac");
const mbtiSel = document.getElementById("mbti");

ZODIAC_KO.forEach(z=>zodiacSel.innerHTML+=`<option>${z}</option>`);
MBTI.forEach(m=>mbtiSel.innerHTML+=`<option>${m}</option>`);

/* ===============================
   LUNAR ZODIAC AUTO
================================ */
document.getElementById("birth").addEventListener("change", e=>{
  const d = new Date(e.target.value);
  const y = d.getFullYear();
  if(!lunarMap[y]) return;
  const lny = new Date(lunarMap[y]);
  const zy = d < lny ? y-1 : y;
  zodiacSel.selectedIndex = (zy - 4) % 12;
});

/* ===============================
   URL CATEGORY (LOVE/MONEY/JOB)
================================ */
function getCategory(){
  const p = location.pathname.split("/");
  if(p.includes("money")) return "money";
  if(p.includes("job")) return "job";
  return "love";
}

/* ===============================
   MAIN START
================================ */
function startFortune(){
  document.getElementById("result").classList.remove("hidden");

  const zodiacKey = ZODIAC[zodiacSel.selectedIndex];
  const mbti = mbtiSel.value;
  const category = getCategory();

  // SEO
  const title = `${ZODIAC_KO[zodiacSel.selectedIndex]} ${mbti} ${category === "love" ? "연애운" : category === "money" ? "금전운" : "직업운"}`;
  document.title = title;
  document.getElementById("seoH1").innerText = title;

  // 오늘 / 내일 / 연간
  document.getElementById("todayTitle").innerText = "🌞 오늘의 운세";
  document.getElementById("todayText").innerText = pick(todayDB);
  document.getElementById("tomorrowText").innerText = "🌙 내일: " + pick(tomorrowDB);
  document.getElementById("yearText").innerText = "📅 올해: " + pick(yearDB);

  // 카테고리 운세
  const zList = zodiacDB[zodiacKey] || [];
  document.getElementById("categoryTitle").innerText = category === "love" ? "💖 연애운" : category === "money" ? "💰 금전운" : "💼 직업운";
  document.getElementById("categoryText").innerText = pick(zList);

  // 타로 하루 고정
  const seed = new Date().toISOString().slice(0,10);
  const idx = Math.abs(hash(seed)) % tarotDB.length;
  const card = tarotDB[idx];
  document.getElementById("tarotImg").src = card.image;
  document.getElementById("tarotText").innerText = card.meaning;
}

/* ===============================
   AI DB CONSULT
================================ */
function askAI(){
  const q = document.getElementById("aiQuestion").value;
  if(!q) return;

  const found = aiDB.find(x=>x.keywords.some(k=>q.includes(k)));
  if(found){
    found.count++;
    document.getElementById("aiAnswer").innerText = found.answer;
  }else{
    const ans = "지금은 기운의 흐름이 흔들리는 시기입니다. 조급해하지 말고 상황을 관찰하세요. 선택은 조금 뒤에 해도 늦지 않습니다.";
    aiDB.push({keywords:[q],answer:ans,count:1});
    document.getElementById("aiAnswer").innerText = ans;
  }
}

/* ===============================
   UTIL
================================ */
function pick(arr){
  if(!arr || !arr.length) return "";
  return arr[Math.floor(Math.random()*arr.length)];
}

function hash(s){
  let h=0; for(let i=0;i<s.length;i++) h=(h<<5)-h+s.charCodeAt(i);
  return h;
}
