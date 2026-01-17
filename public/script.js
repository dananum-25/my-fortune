// ✅ 새 배포 URL 반영
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
    if (!res.ok) throw new Error(`DB 로딩 실패: ${f}`);
    DB[f] = await res.json();
  }

  initSelectors();
})();

/* ===== selectors ===== */
function initSelectors() {
  // 띠
  ZODIAC_KO.forEach(z => {
    const o = document.createElement("option");
    o.textContent = z;
    zodiacSel.appendChild(o);
  });

  // ✅ mbti_traits_ko.json 구조: { meta, traits:{...} }
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
  const lunar = DB["lunar_new_year_1920_2026.json"][String(y)] || DB["lunar_new_year_1920_2026.json"][y];
  if (!lunar) return;

  const zodiacYear = d < new Date(lunar) ? y - 1 : y;
  zodiacSel.selectedIndex = (zodiacYear - 4 + 1200) % 12;
});

/* ===== 운세 ===== */
function startFortune() {
  try {
    document.getElementById("result").classList.remove("hidden");

    // 오늘 / 내일
    document.getElementById("todayText").innerText =
      pick(DB["fortunes_ko_today.json"].pools.today, "오늘(today)");

    document.getElementById("tomorrowText").innerText =
      pick(DB["fortunes_ko_tomorrow.json"].pools.tomorrow, "내일(tomorrow)");

    // ✅ 2026: pools.year_all
    document.getElementById("yearText").innerText =
      pick(DB["fortunes_ko_2026.json"].pools.year_all, "올해(year_all)");

    // ✅ 띠별: {rat:{today:[...], tomorrow:[...]}}
    const key = ZODIAC_KEY[zodiacSel.selectedIndex];
    const zObj = DB["zodiac_fortunes_ko_2026.json"][key];
    document.getElementById("zodiacText").innerText =
      pick(zObj.today, `띠별(${key}.today)`);

    // ✅ 타로
    drawTarot();
  } catch (e) {
    console.error(e);
    alert(e.message || "운세 데이터를 불러오는 중 오류가 발생했습니다.");
  }
}

/* ===== 타로 ===== */
function drawTarot() {
  const db = DB["tarot_db_ko.json"];
  const majors = db.majors; // ✅ 실제 키: majors

  if (!Array.isArray(majors) || majors.length === 0) {
    throw new Error("타로 DB(majors)가 비어 있습니다.");
  }

  const seed = Math.abs(hash(new Date().toDateString()));
  const idx = seed % majors.length;
  const card = majors[idx];

  // upright/reversed 선택(날짜 고정)
  const isUpright = (seed % 2 === 0);
  const summary = isUpright ? card.upright.summary : card.reversed.summary;

  // ✅ 이미지 경로: "assets/..." → "/assets/..."
  const imgPath = card.image.startsWith("/") ? card.image : `/${card.image}`;

  const imgEl = document.getElementById("tarotImg");
  imgEl.src = imgPath;

  document.getElementById("tarotText").innerText =
    `${card.name_ko} (${isUpright ? "정방향" : "역방향"}) — ${summary}`;
}

/* ===== AI 상담 ===== */
let aiSession = { id: Date.now() + "" };

async function askAI() {
  const q = document.getElementById("aiQuestion").value.trim();
  if (!q) return;

  appendChat(q, "user");
  document.getElementById("aiQuestion").value = "";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ question: q, session_id: aiSession.id })
    });

    // Apps Script가 JSON을 반환한다고 가정
    const data = await res.json();

    if (!data || data.ok === false) {
      appendChat(data?.message || "상담 응답이 올바르지 않습니다.", "ai");
      return;
    }

    appendChat(data.answer || data.message || "상담 응답이 비어 있습니다.", "ai");
  } catch (e) {
    console.error(e);
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
  aiSession = { id: Date.now() + "" };
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

/* ===== util ===== */
function pick(arr, label) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(`Error: 빈 배열 (${label})`);
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
