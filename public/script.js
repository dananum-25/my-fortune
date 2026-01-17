const API_URL = "https://script.google.com/macros/s/AKfycbxWOEtmQ-7we79MHtPtsRxE30Ckz5cmnuCY5CFi_Vd7Lq2Mub6bZoYIhAWJGKQRRhr8/exec";

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
    if (!res.ok) throw new Error(`DB 로딩 실패: ${f}`);
    DB[f] = await res.json();
  }

  initSelectors();
})();

/* ===== selectors ===== */
function initSelectors() {
  ZODIAC_KO.forEach(z => {
    const o = document.createElement("option");
    o.textContent = z;
    zodiacSel.appendChild(o);
  });

  // ✅ 실제 MBTI 위치: traits 하위
  const traits = DB["mbti_traits_ko.json"].traits;
  Object.keys(traits).forEach(m => {
    const o = document.createElement("option");
    o.value = m;
    o.textContent = m;
    mbtiSel.appendChild(o);
  });
}

/* ===== 음력 띠 자동 ===== */
birthInput.addEventListener("change", () => {
  const d = new Date(birthInput.value);
  const y = d.getFullYear();
  const lunar = DB["lunar_new_year_1920_2026.json"][y];
  if (!lunar) return;
  const zodiacYear = d < new Date(lunar) ? y - 1 : y;
  zodiacSel.selectedIndex = (zodiacYear - 4 + 1200) % 12;
});

/* ===== 운세 ===== */
function startFortune() {
  try {
    document.getElementById("result").classList.remove("hidden");

    document.getElementById("todayText").innerText =
      pick(DB["fortunes_ko_today.json"].pools.today);

    document.getElementById("tomorrowText").innerText =
      pick(DB["fortunes_ko_tomorrow.json"].pools.tomorrow);

    document.getElementById("yearText").innerText =
      pick(DB["fortunes_ko_2026.json"].pools.year);

    const key = ZODIAC_KEY[zodiacSel.selectedIndex];
    document.getElementById("zodiacText").innerText =
      pick(DB["zodiac_fortunes_ko_2026.json"][key]);

    drawTarot();
  } catch (e) {
    console.error(e);
    alert("운세 데이터를 불러오는 중 문제가 발생했습니다.");
  }
}

/* ===== 타로 ===== */
function drawTarot() {
  const cards = DB["tarot_db_ko.json"].cards;
  if (!Array.isArray(cards) || cards.length === 0) return;

  const idx = Math.abs(hash(new Date().toDateString())) % cards.length;
  const c = cards[idx];

  document.getElementById("tarotImg").src = c.image;
  document.getElementById("tarotText").innerText = c.meaning;
}

/* ===== AI 상담 ===== */
let aiSession = { id: Date.now()+"" };

async function askAI() {
  const q = document.getElementById("aiQuestion").value.trim();
  if (!q) return;

  appendChat(q, "user");
  document.getElementById("aiQuestion").value = "";

  try {
    const r = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ question: q, session_id: aiSession.id })
    }).then(r => r.json());

    appendChat(r.answer || r.message, "ai");
  } catch (e) {
    appendChat("현재 상담 서버와 연결할 수 없습니다.", "ai");
  }
}

function appendChat(t, who) {
  const d = document.createElement("div");
  d.className = who === "ai" ? "chat-ai" : "chat-user";
  d.innerText = t;
  document.getElementById("chatLog").appendChild(d);
}

function resetAI() {
  aiSession = { id: Date.now()+"" };
  document.getElementById("chatLog").innerHTML = "";
}

/* ===== 공유 ===== */
function shareApp() {
  if (navigator.share) {
    navigator.share({
      title: "오늘의 운세",
      text: "MBTI·띠·사주·타로 운세 보러가요!",
      url: location.href
    });
  } else {
    navigator.clipboard.writeText(location.href);
    alert("링크가 복사되었습니다!");
  }
}

/* util */
function pick(arr) {
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("빈 배열");
  return arr[Math.floor(Math.random() * arr.length)];
}
function hash(s) {
  let h = 0;
  for (let i of s) h = (h << 5) - h + i.charCodeAt(0);
  return h;
}
