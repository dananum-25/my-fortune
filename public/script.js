/* ===============================
   🔊 사운드
================================ */
let bgm;
let soundOn = false;

function initSound() {
  bgm = new Audio("/assets/sound/ambient_entry.mp3");
  bgm.loop = true;
  bgm.volume = 0.15;
}

document.getElementById("soundToggle").onclick = () => {
  soundOn = !soundOn;
  if (soundOn) {
    bgm.play().catch(() => {});
  } else {
    bgm.pause();
  }
};

/* ===============================
   🃏 타로 이미지 로더 (필수 방어)
================================ */
function loadTarotImage(path) {
  const img = new Image();
  img.onload = () => console.log("✅ 카드 로드 성공:", path);
  img.onerror = () => console.error("❌ 카드 로드 실패:", path);
  img.src = path;
  return img;
}

function showTarotSpread() {
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
function addChat(text, who) {
  const div = document.createElement("div");
  div.className = `chat-msg ${who}`;
  div.innerText = text;
  document.getElementById("chatArea").appendChild(div);
}

document.getElementById("sendBtn").onclick = () => {
  const input = document.getElementById("userInput");
  if (!input.value) return;

  addChat(input.value, "user");
  addChat("이건 타로로 보는 게 좋겠어. 카드를 펼쳐볼게.", "ai");

  showTarotSpread();
  input.value = "";
};

window.onload = () => {
  initSound();
};
