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
let state = "idle"; // idle | listening | speaking | tarot

/* ===============================
   AUDIO
================================ */
// BGM
const bgmIdle = new Audio("/public/sounds/tarot/ambient_entry.mp3");
bgmIdle.loop = true;
bgmIdle.volume = VOLUME;

const bgmEnd = new Audio("/public/sounds/tarot/session_end.mp3");
bgmEnd.loop = false;
bgmEnd.volume = VOLUME;

// SFX
const sfx = {
  speak: new Audio("/public/sounds/tarot/cat_speak_chime.mp3"),
  reveal: new Audio("/public/sounds/tarot/tarot_reveal.mp3"),
  pick: new Audio("/public/sounds/tarot/card_pick.mp3"),
  spread: new Audio("/public/sounds/tarot/spread_open.mp3"),
};

Object.values(sfx).forEach(a => a.volume = VOLUME);

/* ===============================
   AUDIO HELPERS
================================ */
function stopAllBgm() {
  bgmIdle.pause(); bgmIdle.currentTime = 0;
  bgmEnd.pause(); bgmEnd.currentTime = 0;
}

function playBgmIdle() {
  if (!soundOn) return;
  stopAllBgm();
  bgmIdle.play().catch(()=>{});
}

function playBgmEnd() {
  if (!soundOn) return;
  stopAllBgm();
  bgmEnd.play().catch(()=>{});
}

function playSfx(name) {
  if (!soundOn || !sfx[name]) return;
  // SFX 우선: BGM 중단
  stopAllBgm();
  sfx[name].currentTime = 0;
  sfx[name].play().catch(()=>{});
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
  avatar.innerHTML = `<img src="/assets/cat_ai.webp" alt="cat" />`;

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
  }).catch(()=>{});
}

/* ===============================
   SOUND TOGGLE
================================ */
soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  if (!soundOn) stopAllBgm();
  if (soundOn && state === "idle") playBgmIdle();
};

/* ===============================
   INIT
================================ */
state = "idle";
playBgmIdle();
addCatMsg("오늘 무슨 일이 있었어? 천천히 말해도 돼 🐾");

/* ===============================
   CHAT FLOW
================================ */
sendBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;

  // User action unlock (first action)
  if (turn === 0) stopAllBgm();

  addUserMsg(text);
  input.value = "";
  turn++;
  state = turn <= 2 ? "listening" : "speaking";

  sendLog({
    type: "ai",
    session_id: SESSION_ID,
    user_question_raw: text,
    turn_index: turn
  });

  if (turn === 1) {
    addCatMsg("그 이야기에서 어떤 부분이 제일 마음에 걸려?");
  } else if (turn === 2) {
    addCatMsg("네 얘기를 이렇게 느꼈어. 상황이 꽤 너를 지치게 만드는 것 같아.");
  } else if (turn === 3) {
    state = "tarot";
    playSfx("reveal");
    addCatMsg("이건 카드로 한 번 비춰보는 게 좋겠어. 한 장 펼쳐볼게.");
    playSfx("pick");

    sendLog({
      type: "ai",
      session_id: SESSION_ID,
      turn_index: turn,
      tarot_used: true,
      question_category: "tarot_entry"
    });
  } else {
    addCatMsg("이 카드는 결과라기보다, 지금 네 상태를 보여주는 그림이야.");
  }
};

/* ===============================
   ENDING (example hook)
================================ */
// 필요 시 외부 조건으로 상담 종료를 판단해 호출
function endSession() {
  state = "idle";
  playBgmEnd();
}
