/* ===============================
   CONFIG
================================ */
const GAS_URL = "https://script.google.com/macros/s/AKfycbwPAEMT74SQGF0H2aUymPWwslS-QNYe8jV_Sgp5n2dbyqVGGysLfbuK3Gdcpth_nsBQ/exec";
const SESSION_ID = crypto.randomUUID();
const BGM_VOLUME = 0.15;

/* ===============================
   DOM
================================ */
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const tarotStage = document.getElementById("tarotStage");

/* ===============================
   STATE
================================ */
let soundEnabled = false;
let bgmStarted = false;
let conversationTurn = 0;
let tarotInProgress = false;

/* ===============================
   AUDIO (BGM only)
================================ */
const bgm = new Audio("/assets/sound/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = BGM_VOLUME;

/* ===============================
   SOUND TOGGLE (user gesture only)
================================ */
soundBtn.onclick = () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? "🔊" : "🔇";

  if (soundEnabled && !bgmStarted) {
    bgm.play()
      .then(() => {
        bgmStarted = true;
        console.log("BGM started");
      })
      .catch(err => console.warn("BGM play blocked:", err));
  }

  if (!soundEnabled && bgmStarted) {
    bgm.pause();
  }
};

/* ===============================
   CHAT HELPERS
================================ */
function addMessage(text, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/* ===============================
   IMAGE LOAD DEFENSE (필수)
================================ */
function createCardImage(path) {
  const img = new Image();
  img.className = "tarot-card";

  img.onload = () => console.log("카드 로드 성공:", img.src);
  img.onerror = () => console.error("카드 로드 실패:", img.src);

  img.src = path;
  return img;
}

/* ===============================
   TAROT DATA (majors only, v1)
================================ */
const MAJOR_NAMES = [
  "the_fool","the_magician","the_high_priestess","the_empress","the_emperor",
  "the_hierophant","the_lovers","the_chariot","strength","the_hermit",
  "wheel_of_fortune","justice","the_hanged_man","death","temperance",
  "the_devil","the_tower","the_star","the_moon","the_sun",
  "judgement","the_world"
];

function randomMajorCard() {
  const index = Math.floor(Math.random() * 22);
  const num = String(index).padStart(2, "0");
  return `/assets/tarot/majors/${num}_${MAJOR_NAMES[index]}.png`;
}

/* ===============================
   TAROT SPREAD (1-card v1)
================================ */
function showTarotSpread() {
  if (tarotInProgress) return;
  tarotInProgress = true;

  tarotStage.innerHTML = "";
  tarotStage.style.display = "flex";

  addMessage("카드를 펼쳐볼게… 잠시만 기다려 🐾", "cat");

  // 카드 뒷면 연출 (가짜 카드)
  for (let i = 0; i < 3; i++) {
    const back = document.createElement("div");
    back.className = "tarot-back";
    tarotStage.appendChild(back);
  }

  // 실제 카드 선택 (약간의 딜레이 후)
  setTimeout(() => {
    tarotStage.innerHTML = "";

    const cardPath = randomMajorCard();
    const cardImg = createCardImage(cardPath);

    tarotStage.appendChild(cardImg);

    addMessage("이 카드는 지금 너의 흐름을 보여줘.", "cat");
    tarotInProgress = false;
  }, 1200);
}

/* ===============================
   LOGGING (AI 성장용)
================================ */
function logAI(rawText) {
  fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "ai",
      session_id: SESSION_ID,
      user_question_raw: rawText
    })
  }).catch(() => {});
}

/* ===============================
   INITIAL MESSAGE
================================ */
addMessage("괜찮아. 천천히 말해도 돼. 내가 여기 있어 🐱", "cat");

/* ===============================
   SEND FLOW
================================ */
sendBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";
  conversationTurn++;

  logAI(text);

  // 질문 유도 단계 (아직 카드 X)
  if (conversationTurn === 1) {
    addMessage(
      "조금 더 알고 싶어. 이 고민에서 가장 불안한 게 뭐야?",
      "cat"
    );
    return;
  }

  // 카드 트리거 (v1: 2턴 이후)
  if (conversationTurn >= 2 && !tarotInProgress) {
    showTarotSpread();
    return;
  }
};
