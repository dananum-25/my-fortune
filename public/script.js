/* ===============================
   GAS URL
================================ */
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwPAEMT74SQGF0H2aUymPWwslS-QNYe8jV_Sgp5n2dbyqVGGysLfbuK3Gdcpth_nsBQ/exec";

/* ===============================
   오늘 운세 DB
================================ */
let todayDB = [];

fetch("/data/fortunes_ko_today.json")
  .then((r) => r.json())
  .then((d) => {
    todayDB = d.pools?.today || [];
  });

/* ===============================
   오늘 운세 (하루 고정)
================================ */
function showTodayFortune() {
  const birth = document.getElementById("birth").value;
  if (!birth) {
    alert("생년월일을 입력해주세요");
    return;
  }

  if (!todayDB.length) {
    alert("운세 데이터를 불러오지 못했습니다.");
    return;
  }

  const seed = `${birth}_${new Date().toISOString().slice(0, 10)}`;
  const idx = Math.abs(hash(seed)) % todayDB.length;
  const fortune = todayDB[idx];

  document.getElementById("todayText").innerText = fortune;
  document.getElementById("todaySection").classList.remove("hidden");
}

/* ===============================
   AI 상담
================================ */
function askAI() {
  const q = document.getElementById("aiQuestion").value.trim();
  if (!q) return;

  const answer =
    "지금은 결과보다 과정이 중요해 보여. 마음이 흔들린다면 잠시 호흡을 고르고, 스스로에게 친절해져도 괜찮아.";
  document.getElementById("aiAnswer").innerText = answer;

  fetch(GAS_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({
      type: "ai",
      session_id: getSession(),
      user_question_raw: q,
      entry_point: "ai_chat_initial",
      device: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }),
  });
}

/* ===============================
   Utils
================================ */
function getSession() {
  let s = localStorage.getItem("session_id");
  if (!s) {
    s = crypto.randomUUID();
    localStorage.setItem("session_id", s);
  }
  return s;
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
