/* ===============================
   CONFIG
================================ */
const GAS_URL = "https://script.google.com/macros/s/AKfycbwPAEMT74SQGF0H2aUymPWwslS-QNYe8jV_Sgp5n2dbyqVGGysLfbuK3Gdcpth_nsBQ/exec";
const SESSION_ID = crypto.randomUUID();
const VOLUME = 0.15;

/* ===============================
   DOM
================================ */
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");

/* ===============================
   STATE
================================ */
let turn = 0;
let soundOn = true;
let bgmStarted = false;
let state = "idle";

/* ===============================
   AUDIO
================================ */
const bgmIdle = new Audio("/sounds/tarot/ambient_entry.mp3");
bgmIdle.loop = true;
bgmIdle.volume = VOLUME;

const bgmEnd = new Audio("/sounds/tarot/session_end.mp3");
bgmEnd.loop = false;
bgmEnd.volume = VOLUME;

const sfx = {
  speak: new Audio("/sounds/tarot/cat_speak_chime.mp3"),
  spread: new Audio("/sounds/tarot/spread_open.mp3"),
  pick: new Audio("/sounds/tarot/card_pick.mp3"),
  reveal: new Audio("/sounds/tarot/tarot_reveal.mp3"),
};

Object.values(sfx).forEach(a => a.volume = VOLUME);

/* ===============================
   AUDIO HELPERS
================================ */
function stopAllBgm() {
  bgmIdle.pause(); bgmIdle.currentTime = 0;
  bgmEnd.pause(); bgmEnd.currentTime = 0;
}

function playIdleBgmByUserAction() {
  if (!soundOn || bgmStarted) return;
  bgmStarted = true;
  bgmIdle.play().catch(() => {});
}

function playSfx(name) {
  if (!soundOn || !sfx[name]) return;
  bgmIdle.pause();
  sfx[name].currentTime = 0;
  sfx[name].play().catch(() => {});
}

/* ===============================
   IMAGE DEFENSE (필수)
================================ */
function preloadImage(path) {
  const img = new Image();
  img.onload = () => console.log("카드 로드 성공:", path);
  img.onerror = () => console.error("카드 로드 실패:", path);
  img.src = path;
  return img;
}

/* ===============================
   UI HELPERS
================================ */
function addUserMsg(text) {
  const div = document.createElement("div");
  div.className = "msg user";
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function addCatMsg(text) {
  const wrap = document.createElement("div");
  wrap.className = "msg cat";

  const avatar = document.createElement("div");
  avatar.className = "cat-avatar";
  avatar.innerHTML = `<img src="/assets/cat_ai.webp" alt="AI 고양이 상담사" />`;

  const bubble = document.createElement("div");
  bubble.textContent = text;

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;

  playSfx("speak");
}

/* ===============================
   LOGGING
================================ */
function sendLog(payload) {
  fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

/* ===============================
   SOUND TOGGLE
================================ */
soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  if (!soundOn) stopAllBgm();
};

/* ===============================
   INIT MESSAGE
================================ */
addCatMsg("오늘 무슨 일이 있었어? 천천히 말해도 돼 🐾");

/* ===============================
   CHAT FLOW
================================ */
sendBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;

  playIdleBgmByUserAction(); // 🔥 최초 사용자 액션에서만 BGM 시작

  addUserMsg(text);
  input.value = "";
  turn++;

  sendLog({
    type: "ai",
    session_id: SESSION_ID,
    user_question_raw: text,
    turn_index: turn
  });

  if (turn === 2) {
    addCatMsg("그 상황에서 제일 마음에 걸리는 장면이 있어?");
  }

  if (turn === 3) {
    state = "tarot";
    playSfx("spread");

    const path = "/assets/tarot/majors/00_the_fool.png";
    preloadImage(path);

    addCatMsg("카드를 한 장 펼쳐볼게. 이건 지금 너의 흐름이야.");
    playSfx("pick");
  }
};
