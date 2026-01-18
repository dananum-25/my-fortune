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

/* ===============================
   SOUNDS
================================ */
const sounds = {
  ambient: new Audio("/public/sounds/tarot/ambient_entry.mp3"),
  speak: new Audio("/public/sounds/tarot/cat_speak_chime.mp3"),
  reveal: new Audio("/public/sounds/tarot/tarot_reveal.mp3"),
  pick: new Audio("/public/sounds/tarot/card_pick.mp3"),
  spread: new Audio("/public/sounds/tarot/spread_open.mp3"),
  end: new Audio("/public/sounds/tarot/session_end.mp3"),
};

Object.values(sounds).forEach(s => {
  s.volume = VOLUME;
});

/* ===============================
   UTILS
================================ */
function play(name) {
  if (!soundOn || !sounds[name]) return;
  sounds[name].currentTime = 0;
  sounds[name].play();
}

function addMessage(text, who) {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  if (who === "cat") play("speak");
}

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
};

/* ===============================
   INIT
================================ */
play("ambient");
addMessage("오늘 무슨 일이 있었어? 천천히 말해도 돼 🐾", "cat");

/* ===============================
   CHAT FLOW
================================ */
sendBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";
  turn++;

  // 로그 전송 (질문)
  sendLog({
    type: "ai",
    session_id: SESSION_ID,
    turn_index: turn,
    user_question_raw: text
  });

  if (turn === 1) {
    addMessage("그 이야기에서 어떤 부분이 제일 마음에 걸려?", "cat");
  }

  else if (turn === 2) {
    addMessage("네 얘기를 이렇게 느꼈어. 상황이 꽤 너를 지치게 만드는 것 같아.", "cat");
  }

  else if (turn === 3) {
    play("reveal");
    addMessage("이건 카드로 한 번 비춰보는 게 좋겠어. 먼저 한 장 펼쳐볼게.", "cat");
    play("pick");

    sendLog({
      type: "ai",
      session_id: SESSION_ID,
      turn_index: turn,
      tarot_used: true,
      question_category: "tarot_entry"
    });
  }

  else {
    addMessage("이 카드는 결과라기보다, 지금 네 상태를 보여주는 그림이야.", "cat");
  }
};
