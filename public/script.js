/* ===============================
   STATE
================================ */
let soundEnabled = false;
let turn = 0;
let tarotLocked = false;

/* ===============================
   DOM
================================ */
const chatArea = document.getElementById("chatArea");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const tarotSpread = document.getElementById("tarotSpread");
const soundToggle = document.getElementById("soundToggle");

const bgmEntry = document.getElementById("bgmEntry");
const bgmEnd = document.getElementById("bgmEnd");

/* ===============================
   SOUND (유지)
================================ */
bgmEntry.loop = true;
bgmEntry.volume = 0.15;
bgmEnd.volume = 0.15;
soundToggle.textContent = "🔇";

soundToggle.addEventListener("click", async () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    soundToggle.textContent = "🔊";
    try { await bgmEntry.play(); }
    catch (e) {
      console.error("BGM 재생 차단:", e);
      soundEnabled = false;
      soundToggle.textContent = "🔇";
    }
  } else {
    soundToggle.textContent = "🔇";
    bgmEntry.pause();
    bgmEntry.currentTime = 0;
  }
});

/* ===============================
   CHAT UTIL
================================ */
function addBubble(text, who) {
  const div = document.createElement("div");
  div.className = `bubble ${who}`;
  div.textContent = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

/* ===============================
   IMAGE LOAD DEFENSE (필수)
================================ */
function loadCardImage(path) {
  const img = new Image();
  img.className = "tarot-card";

  img.onload = () => console.log("🃏 카드 로드 성공:", img.src);
  img.onerror = () => console.error("❌ 카드 로드 실패:", img.src);

  img.src = path;
  return img;
}

/* ===============================
   TAROT DATA (Majors 22)
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

function pickRandom(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

/* ===============================
   TAROT SPREAD (3 cards, timing)
================================ */
function showSpread3() {
  if (tarotLocked) return;
  tarotLocked = true;

  tarotSpread.innerHTML = "";

  // 1) 뒷면 3장
  for (let i = 0; i < 3; i++) {
    const back = document.createElement("div");
    back.className = "tarot-back";
    tarotSpread.appendChild(back);
  }

  // 2) 앞면 교체
  setTimeout(() => {
    tarotSpread.innerHTML = "";
    const chosen = pickRandom(MAJORS, 3);
    chosen.forEach(name => {
      // ⚠️ 경로 고정 (/assets …)
      const path = `/assets/tarot/majors/${name}.png`;
      tarotSpread.appendChild(loadCardImage(path));
    });
  }, 900);
}

/* ===============================
   INITIAL MESSAGES
================================ */
addBubble("안녕 🐾 나는 타로 상담사 고양이야.", "ai");
addBubble("지금 가장 신경 쓰이는 고민을 편하게 말해줘.", "ai");

/* ===============================
   SEND (안전)
================================ */
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addBubble(text, "user");
  input.value = "";
  turn++;

  if (turn === 1) {
    addBubble("고마워. 그 고민에서 가장 불안한 부분은 뭐야?", "ai");
  } else if (turn === 2) {
    addBubble("이건 타로로 보는 게 좋겠어… 카드를 펼쳐볼게.", "ai");
    showSpread3();              // ← 이 시점에만 카드 등장
    addBubble("카드를 보고 떠오르는 느낌을 말해줘.", "ai");
  } else {
    addBubble("좋아. 그 흐름을 더 깊게 읽어볼게.", "ai");
  }
}

/* ===============================
   END SOUND
================================ */
window.addEventListener("beforeunload", () => {
  if (!soundEnabled) return;
  bgmEntry.pause();
  bgmEnd.play().catch(() => {});
});
