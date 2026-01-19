/* ===============================
   🔊 BGM (처음엔 음소거)
================================ */
let bgm = null;
let soundEnabled = false;
let bgmInitialized = false;

const soundBtn = document.getElementById("soundToggle");

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  // 최초 클릭 시에만 오디오 생성 (브라우저 정책 대응)
  if (!bgmInitialized) {
    bgm = new Audio("/assets/sound/ambient_entry.mp3");
    bgm.loop = true;
    bgm.volume = 0.15;
    bgmInitialized = true;
  }

  if (soundEnabled) {
    bgm.play().catch(err => {
      console.error("🔇 BGM 재생 실패:", err);
    });
    soundBtn.textContent = "🔊";
  } else {
    bgm.pause();
    soundBtn.textContent = "🔇";
  }
});

/* ===============================
   🃏 타로 카드 (방어 로그 포함)
================================ */
let tarotShown = false; // ⭐ 핵심: 한 번만 펼치기

function loadTarotImage(path) {
  const img = new Image();
  img.onload = () => console.log("✅ 카드 로드 성공:", path);
  img.onerror = () => console.error("❌ 카드 로드 실패:", path);
  img.src = path;
  img.className = "tarot-card";
  return img;
}

function showTarotSpread() {
  if (tarotShown) return; // ❌ 중복 방지
  tarotShown = true;

  const area = document.getElementById("tarotArea");
  area.innerHTML = "";

  const cards = [
    "00_the_fool",
    "01_the_magician",
    "02_the_high_priestess"
  ];

  cards.forEach(name => {
    const path = `/assets/tarot/majors/${name}.png`;
    const img = loadTarotImage(path);
    area.appendChild(img);
  });
}

/* ===============================
   💬 채팅
================================ */
const chatArea = document.getElementById("chatArea");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function addChat(text, who) {
  const div = document.createElement("div");
  div.className = `chat-msg ${who}`;
  div.innerText = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

sendBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  addChat(text, "user");

  addChat("이건 타로로 보는 게 좋겠어. 카드를 펼쳐볼게.", "ai");
  showTarotSpread();

  input.value = "";
});
