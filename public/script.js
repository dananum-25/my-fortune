const GAS_URL = "https://script.google.com/macros/s/AKfycbwPAEMT74SQGF0H2aUymPWwslS-QNYe8jV_Sgp5n2dbyqVGGysLfbuK3Gdcpth_nsBQ/exec";
const SESSION_ID = crypto.randomUUID();
const VOLUME = 0.15;

/* DOM */
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const tarotStage = document.getElementById("tarotStage");

/* BGM */
let bgmStarted = false;
let soundOn = true;
const bgm = new Audio("/assets/sound/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = VOLUME;

function startBGM() {
  if (bgmStarted || !soundOn) return;
  bgm.play().then(() => bgmStarted = true).catch(()=>{});
}

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  if (!soundOn) bgm.pause();
  else if (bgmStarted) bgm.play().catch(()=>{});
};

/* 메시지 */
function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/* 카드 방어 로딩 */
function loadCard(path) {
  const img = new Image();
  img.onload = () => console.log("카드 로드 성공:", img.src);
  img.onerror = () => console.error("카드 로드 실패:", img.src);
  img.src = path;
  img.className = "tarot-card";
  tarotStage.appendChild(img);
}

/* 초기 메시지 */
addMsg("천천히 이야기해도 돼. 내가 여기 있어 🐾", "cat");

/* 전송 */
sendBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;

  startBGM();

  addMsg(text, "user");
  input.value = "";

  fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "ai",
      session_id: SESSION_ID,
      user_question_raw: text
    })
  }).catch(()=>{});

  addMsg("이건 타로로 보는 게 좋겠어. 카드를 펼쳐볼게.", "cat");
  tarotStage.innerHTML = "";

  loadCard("/assets/tarot/majors/00_the_fool.png");
};
