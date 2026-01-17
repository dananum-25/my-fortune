const API_URL = "https://script.google.com/macros/s/AKfycbxNCHMfA6MXRb5EpRHpy43JLc1Cym7aTLUIw_Aij9QXtglIUApoaX7KvF2eRWciYRGu/exec";

const DB = {};
const ZODIAC_KO = ["쥐띠","소띠","호랑이띠","토끼띠","용띠","뱀띠","말띠","양띠","원숭이띠","닭띠","개띠","돼지띠"];
const ZODIAC_KEY = ["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];

const zodiacSel = document.getElementById("zodiac");
const mbtiSel = document.getElementById("mbti");
const birthInput = document.getElementById("birth");

(async function loadDB() {
  const files = [
    "fortunes_ko_today.json",
    "fortunes_ko_tomorrow.json",
    "fortunes_ko_2026.json",
    "zodiac_fortunes_ko_2026.json",
    "lunar_new_year_1920_2026.json",
    "tarot_db_ko.json",
    "mbti_traits_ko.json"
  ];

  for (const f of files) {
    const res = await fetch(`/data/${f}`);
    DB[f] = await res.json();
  }

  initSelectors();
})();

/* selectors */
function initSelectors() {
  ZODIAC_KO.forEach(z => zodiacSel.add(new Option(z, z)));

  mbtiSel.add(new Option("모르겠어요", "UNKNOWN"));

  Object.keys(DB["mbti_traits_ko.json"].traits)
    .forEach(m => mbtiSel.add(new Option(m, m)));
}

/* 운세 */
function startFortune() {
  document.getElementById("result").classList.remove("hidden");

  document.getElementById("todayText").innerText =
    pick(DB["fortunes_ko_today.json"].pools.today);

  document.getElementById("tomorrowText").innerText =
    pick(DB["fortunes_ko_tomorrow.json"].pools.tomorrow);

  document.getElementById("yearText").innerText =
    pick(DB["fortunes_ko_2026.json"].pools.year_all);

  const key = ZODIAC_KEY[zodiacSel.selectedIndex];
  document.getElementById("zodiacText").innerText =
    pick(DB["zodiac_fortunes_ko_2026.json"][key].today);

  drawTarot();
}

/* 타로 – 이미지 경로 절대 수정 안 함 */
function drawTarot() {
  const majors = DB["tarot_db_ko.json"].majors;
  const card = majors[Math.floor(Math.random() * majors.length)];

  const upright = Math.random() > 0.5;
  const text = upright ? card.upright.summary : card.reversed.summary;

  const img = card.image.startsWith("/")
    ? card.image
    : "/" + card.image;

  document.getElementById("tarotImg").src = img;
  document.getElementById("tarotText").innerText =
    `${card.name_ko} (${upright ? "정방향" : "역방향"}) – ${text}`;
}

/* AI 상담 */
async function askAI() {
  const q = document.getElementById("aiQuestion").value.trim();
  if (!q) return;

  appendChat(q, "user");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ question: q }),
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    });

    const data = await res.json();
    appendChat(data.answer, "ai");

  } catch {
    appendChat("현재 상담 서버와 연결할 수 없습니다.", "ai");
  }
}

/* utils */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function appendChat(t, who) {
  const d = document.createElement("div");
  d.className = who;
  d.innerText = t;
  document.getElementById("chatLog").appendChild(d);
}
