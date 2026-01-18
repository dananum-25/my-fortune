const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwPAEMT74SQGF0H2aUymPWwslS-QNYe8jV_Sgp5n2dbyqVGGysLfbuK3Gdcpth_nsBQ/exec";

/* ===============================
   오늘 운세 DB
================================ */
let todayDB = [];

fetch("/data/fortunes_ko_today.json")
  .then(r => r.json())
  .then(d => {
    todayDB = d.pools?.today || [];
  });

/* ===============================
   오늘의 운세 (하루 고정)
================================ */
function showTodayFortune() {
  const birth = document.getElementById("birth").value;
  if (!birth || !todayDB.length) return;

  const seed = `${birth}_${new Date().toISOString().slice(0, 10)}`;
  const idx = Math.abs(hash(seed)) % todayDB.length;
  document.getElementById("todayText").innerText = todayDB[idx];
  document.getElementById("todaySection").classList.remove("hidden");
}

/* ===============================
   AI 상담
================================ */
function askAI() {
  const q = document.getElementById("aiQuestion").value.trim();
  if (!q) return;

  const answer =
    "지금 이 질문은 결과보다는 마음의 흐름을 먼저 살펴보는 게 좋아 보여.";

  document.getElementById("aiAnswer").innerText = answer;

  fetch(GAS_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({
      type: "ai",
      session_id: getSession(),
      user_question_raw: q,
      ai_answer_text: answer,
      question_category: "general",
      tarot_used: false,
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
