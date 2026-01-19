/* ===============================
   DOM
================================ */
const chatArea = document.getElementById("chatArea");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const tarotSpread = document.getElementById("tarotSpread");
const stageHint = document.getElementById("stageHint");

const soundToggle = document.getElementById("soundToggle");
const bgmEntry = document.getElementById("bgmEntry");
const bgmEnd = document.getElementById("bgmEnd");

/* ===============================
   STATE
================================ */
let soundEnabled = false;     // 🔇 초기 무음
let bgmReady = false;         // 사용자 제스처 이후 true
let turn = 0;
let tarotLocked = false;

/* ===============================
   AUDIO DEBUG (필수)
================================ */
function debugAudio(audio, name) {
  audio.addEventListener("play", () => console.log(`🔊 ${name} play`));
  audio.addEventListener("pause", () => console.log(`🔇 ${name} pause`));
  audio.addEventListener("error", () => console.error(`❌ ${name} load error`, audio.src));
}

debugAudio(bgmEntry, "BGM_ENTRY");
debugAudio(bgmEnd, "BGM_END");

bgmEntry.loop = true;
bgmEntry.volume = 0.15;
bgmEnd.volume = 0.15;

/* ===============================
   🔊 SOUND TOGGLE (유저 제스처)
================================ */
soundToggle.textContent = "🔇";

soundToggle.addEventListener("click", async () => {
  soundEnabled = !soundEnabled;

  if (soundEnabled) {
    soundToggle.textContent = "🔊";
    try {
      // ✅ 최초 사용자 클릭 안에서만 play
      await bgmEntry.play();
      bgmReady = true;
    } catch (e) {
      console.error("❌ BGM 재생 차단:", e);
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
   CHAT
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
   TAROT DATA (majors 22)
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
   TAROT SPREAD (3 cards, 1 time)
================================ */
function showSpread3() {
  if (tarotLocked) return;
  tarotLocked = true;

  tarotSpread.innerHTML = "";

  // 1️⃣ 뒷면 3장
  for (let i = 0; i < 3; i++) {
    const back = document.createElement("div");
    back.className = "tarot-back";
    tarotSpread.appendChild(back);
  }

  // 2️⃣ 앞면으로 교체
  setTimeout(() => {
    tarotSpread.innerHTML = "";

    const chosen = pickRandom(MAJORS, 3);
    chosen.forEach(name => {
      const path = `/assets/tarot/majors/${name}.png`;
      const img = loadCardImage(path);
      tarotSpread.appendChild(img);
    });

  }, 900);
}

/* ===============================
   INITIAL UX
================================ */
addBubble("안녕 🐾 나는 타로 상담사 고양이야.", "ai");
addBubble("처음이면 이렇게 말해줘도 돼.", "ai");
addBubble("“요즘 일이 불안해”, “이 직장 계속 다녀도 될까?”", "ai");

/* ===============================
   SEND FLOW
================================ */
function handleSend() {
  const text = input.value.trim();
  if (!text) return;

  if (stageHint) stageHint.style.display = "none";

  addBubble(text, "user");
  input.value = "";
  turn++;

  if (turn === 1) {
    addBubble("좋아. 그럼 조금만 더 알려줘 🐾", "ai");
    addBubble("이 고민에서 가장 불안한 건 뭐야?", "ai");
    return;
  }

  if (turn === 2) {
    addBubble("이제 충분히 보였어. 타로를 펼쳐볼게…", "ai");
    showSpread3();
    addBubble("카드를 보고 떠오르는 감정을 말해줘.", "ai");
    return;
  }

  addBubble("좋아. 그 흐름을 더 깊게 볼게.", "ai");
}

sendBtn.addEventListener("click", handleSend);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") handleSend();
});

/* ===============================
   SESSION END (선택)
================================ */
window.addEventListener("beforeunload", () => {
  if (!soundEnabled || !bgmReady) return;
  try {
    bgmEntry.pause();
    bgmEnd.currentTime = 0;
    bgmEnd.play().catch(() => {});
  } catch (_) {}
});
