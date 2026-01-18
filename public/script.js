/* ===============================
   GAS URL (🔥 이것만 관리)
================================ */
const GAS_URL = "https://script.google.com/macros/s/AKfycbwPAEMT74SQGF0H2aUymPWwslS-QNYe8jV_Sgp5n2dbyqVGGysLfbuK3Gdcpth_nsBQ/exec";

/* ===============================
   DB
================================ */
let todayDB = [];

fetch("/data/fortunes_ko_today.json")
  .then(r => r.json())
  .then(d => {
    todayDB = d.pools.today || [];
  });

/* ===============================
   오늘 운세 (생년월일 해시 고정)
================================ */
function showTodayFortune() {
  const birth = document.getElementById("birth").value;
  if (!birth) {
    alert("생년월일을 입력해주세요");
    return;
  }

  const idx = Math.abs(hash(birth)) % todayDB.length;
  const fortune = todayDB[idx];

  document.getElementById("todayText").innerText = fortune;
  document.getElementById("todaySection").classList.remove("hidden");
  document.getElementById("aiSection").classList.remove("hidden");
}

/* ===============================
   AI 상담
================================ */
function askAI() {
  const q = document.getElementById("aiQuestion").value.trim();
  if (!q) return;

  const answer = "지금은 조급해하지 말고, 자신의 감정을 먼저 정리해보세요.";
  document.getElementById("aiAnswer").innerText = answer;

  fetch(GAS_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({
      type: "ai",
      session_id: getSession(),
      question: q,
      entry_point: "ai_chat"
    })
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
