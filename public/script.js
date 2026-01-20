/* ===============================
   CONFIG
================================ */
const GAS_URL = "https://script.google.com/macros/s/AKfycbwPAEMT74SQGF0H2aUymPWwslS-QNYe8jV_Sgp5n2dbyqVGGysLfbuK3Gdcpth_nsBQ/exec";
const VOLUME = 0.15;

/* ===============================
   DOM
================================ */
const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const soundBtn = document.getElementById("soundToggle");
const tarotCards = document.getElementById("tarotCards");

/* ===============================
   STATE
================================ */
let turn = 0;
let isMuted = true; // ✅ 초기 무음 고정
const SESSION_ID = getOrCreateSessionId();

/* ===============================
   AUDIO (정적 경로: /public 금지)
================================ */
const bgmIdle = createAudio("/sounds/tarot/ambient_entry.mp3", true);
const bgmEnd  = createAudio("/sounds/tarot/session_end.mp3", false);

const sfx = {
  spread: createAudio("/sounds/tarot/spread_open.mp3", false),
  pick:   createAudio("/sounds/tarot/card_pick.mp3", false),
  reveal: createAudio("/sounds/tarot/tarot_reveal.mp3", false),
};

function createAudio(src, loop){
  const a = new Audio(src);
  a.loop = !!loop;
  a.volume = VOLUME;
  return a;
}

function stopAllAudio(){
  [bgmIdle, bgmEnd, ...Object.values(sfx)].forEach(a => {
    try { a.pause(); a.currentTime = 0; } catch (_) {}
  });
}

function playAudio(a){
  if (isMuted) return;
  try { a.currentTime = 0; } catch (_) {}
  a.play().catch(() => {
    // 모바일/브라우저 정책상 실패할 수 있음 (사용자 클릭 후에는 정상)
  });
}

function playBgmIdle(){
  if (isMuted) return;
  stopAllAudio();
  playAudio(bgmIdle);
}

function playBgmEndOnce(){
  if (isMuted) return;
  stopAllAudio();
  playAudio(bgmEnd);
}

/* ===============================
   MESSAGES
================================ */
function addMessage(text, who){
  const bubble = document.createElement("div");
  bubble.className = `msg ${who}`;

  if (who === "cat") {
    bubble.innerHTML = `
      <div class="avatar">🐱</div>
      <div class="text">${escapeHtml(text)}</div>
    `;
  } else {
    bubble.textContent = text;
  }

  chat.appendChild(bubble);
  scrollToBottom();
}

function scrollToBottom(){
  // 새 메시지 추가 시 자동 스크롤
  chat.scrollTop = chat.scrollHeight;
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll("\"","&quot;")
    .replaceAll("'","&#039;");
}

/* ===============================
   TAROT DATA (파일명 매핑: 04.png 같은 오류 방지)
================================ */
const MAJORS = [
  "00_the_fool","01_the_magician","02_the_high_priestess",
  "03_the_empress","04_the_emperor","05_the_hierophant",
  "06_the_lovers","07_the_chariot","08_strength",
  "09_the_hermit","10_wheel_of_fortune","11_justice",
  "12_the_hanged_man","13_death","14_temperance",
  "15_the_devil","16_the_tower","17_the_star",
  "18_the_moon","19_the_sun","20_judgement","21_the_world"
];

const MINOR_SUITS = ["cups","swords","wands","pentacles"];
const MINOR_VALUES = [
  "01_ace","02_two","03_three","04_four","05_five",
  "06_six","07_seven","08_eight","09_nine","10_ten",
  "11_page","12_knight","13_queen","14_king"
];

/* ===============================
   IMAGE DEFENSE (요구한 방어 코드 그대로)
================================ */
function createCardImg(path){
  const img = new Image();
  img.className = "tarot-card";

  img.onload = () => console.log("카드 로드 성공:", img.src);
  img.onerror = () => console.error("카드 로드 실패:", img.src);

  img.src = path;
  return img;
}

function clearTarot(){
  tarotCards.innerHTML = "";
}

function drawThreeCards(){
  clearTarot();

  const paths = [];
  for (let i = 0; i < 3; i++) {
    const isMajor = Math.random() < 0.55;
    if (isMajor) {
      const major = MAJORS[Math.floor(Math.random() * MAJORS.length)];
      paths.push(`/assets/tarot/majors/${major}.png`);
    } else {
      const suit = MINOR_SUITS[Math.floor(Math.random() * MINOR_SUITS.length)];
      const val  = MINOR_VALUES[Math.floor(Math.random() * MINOR_VALUES.length)];
      paths.push(`/assets/tarot/minors/${suit}/${val}.png`);
    }
  }

  paths.forEach(p => tarotCards.appendChild(createCardImg(p)));
  return paths;
}

/* ===============================
   LOG SENDER (CORS 회피: no-cors)
================================ */
function sendLog(payload){
  fetch(GAS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

/* ===============================
   EVENTS
================================ */
soundBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  soundBtn.textContent = isMuted ? "🔇" : "🔊";

  // ✅ 사용자 클릭으로 트리거되므로 모바일에서도 재생 가능
  if (!isMuted) {
    playBgmIdle();
  } else {
    stopAllAudio();
  }
});

sendBtn.addEventListener("click", onSend);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onSend();
});

function onSend(){
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";
  turn++;

  // 질문 로그 저장
  sendLog({
    type: "ai",
    timestamp: new Date().toISOString(),
    session_id: SESSION_ID,
    turn_index: turn,
    user_question_raw: text,
    entry_point: "chat"
  });

  // 상담 흐름 (기능 정상화 우선: 간단하지만 끊기지 않게)
  if (turn === 1) {
    addMessage("좋아. 그 얘기에서 제일 마음에 걸리는 지점이 뭐야?", "cat");
    return;
  }

  if (turn === 2) {
    addMessage("고마워. 조금 더 구체적으로 말해줄래? 상황/사람/시간 중 어디가 가장 힘들어?", "cat");
    return;
  }

  if (turn === 3) {
    addMessage("이건 카드로 한 번 비춰보는 게 좋겠어. 3장 스프레드를 펼칠게.", "cat");
    playAudio(sfx.spread);

    const paths = drawThreeCards();
    playAudio(sfx.pick);

    // 카드 로그
    sendLog({
      type: "ai",
      timestamp: new Date().toISOString(),
      session_id: SESSION_ID,
      turn_index: turn,
      tarot_used: true,
      tarot_mode: "3",
      ad_watched: false,
      tarot_card_1: paths[0],
      tarot_card_2: paths[1],
      tarot_card_3: paths[2]
    });

    setTimeout(() => {
      playAudio(sfx.reveal);
      addMessage("카드가 말하는 건 '예언'이 아니라, 지금 마음의 흐름이야. 첫 느낌이 어땠어?", "cat");
    }, 600);
    return;
  }

  addMessage("좋아. 그 느낌을 기준으로, 하나씩 더 또렷하게 정리해보자. 지금 가장 원하는 건 '안정'이야, '변화'야?", "cat");
}

/* ===============================
   SESSION
================================ */
function getOrCreateSessionId(){
  const KEY = "mf_session_id";
  let s = localStorage.getItem(KEY);
  if (!s) {
    s = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
    localStorage.setItem(KEY, s);
  }
  return s;
}

/* ===============================
   INIT
================================ */
(function init(){
  // ✅ 초기 무음 상태 표시
  soundBtn.textContent = "🔇";

  // 첫 진입 메시지
  addMessage("안녕 🐾 나는 타로 상담사 고양이야.", "cat");
  addMessage("지금 가장 마음에 걸리는 고민 한 가지만 적어줘.", "cat");

  // 초기엔 카드 영역 비워둠 (대화 진행 후 등장)
  clearTarot();
})();
