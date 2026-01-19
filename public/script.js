/* ===============================
   AUDIO PATHS (고정 선언)
================================ */
const SOUND = {
  bgm: "/sounds/tarot/ambient_entry.mp3",
  spread: "/sounds/tarot/spread_open.mp3",
  pick: "/sounds/tarot/card_pick.mp3",
  reveal: "/sounds/tarot/tarot_reveal.mp3",
  cat: "/sounds/tarot/cat_speak_chime.mp3",
  end: "/sounds/tarot/session_end.mp3"
};

/* ===============================
   AUDIO OBJECTS
================================ */
const bgm = new Audio(SOUND.bgm);
const spreadSound = new Audio(SOUND.spread);
const pickSound = new Audio(SOUND.pick);
const revealSound = new Audio(SOUND.reveal);
const catSound = new Audio(SOUND.cat);
const endSound = new Audio(SOUND.end);

/* ===============================
   AUDIO SETTINGS
================================ */
bgm.loop = true;
bgm.volume = 0.15;

[
  spreadSound,
  pickSound,
  revealSound,
  catSound,
  endSound
].forEach(a => a.volume = 0.2);

/* ===============================
   AUDIO DEBUG (절대 제거 금지)
================================ */
function debugAudio(audio, name) {
  audio.onplay = () => console.log("🔊 재생:", name);
  audio.onerror = () => console.error("❌ 사운드 로드 실패:", name, audio.src);
}

Object.entries({
  bgm,
  spreadSound,
  pickSound,
  revealSound,
  catSound,
  endSound
}).forEach(([k, v]) => debugAudio(v, k));

/* ===============================
   SOUND STATE
================================ */
let soundEnabled = false;

/* ===============================
   SOUND TOGGLE (초기 무음)
================================ */
const soundBtn = document.getElementById("soundToggle");
soundBtn.textContent = "🔇";

soundBtn.addEventListener("click", async () => {
  soundEnabled = !soundEnabled;

  if (soundEnabled) {
    soundBtn.textContent = "🔊";
    try {
      await bgm.play(); // 사용자 제스처 안
    } catch (e) {
      console.error("BGM 차단됨", e);
      soundEnabled = false;
      soundBtn.textContent = "🔇";
    }
  } else {
    soundBtn.textContent = "🔇";
    bgm.pause();
    bgm.currentTime = 0;
  }
});

/* ===============================
   SAFE PLAY
================================ */
function playSound(audio) {
  if (!soundEnabled) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

/* ===============================
   TAROT SPREAD (3장 고정)
================================ */
function showTarotSpread() {
  playSound(spreadSound);

  const spread = document.getElementById("tarotSpread");
  spread.innerHTML = "";

  // 뒷면
  for (let i = 0; i < 3; i++) {
    const back = document.createElement("div");
    back.className = "tarot-back";
    spread.appendChild(back);
  }

  setTimeout(() => {
    spread.innerHTML = "";
    playSound(revealSound);

    const cards = pickRandom(MAJORS, 3);
    cards.forEach(name => {
      const path = `/assets/tarot/majors/${name}.png`;

      const img = new Image();
      img.onload = () => console.log("🃏 카드 로드 성공:", img.src);
      img.onerror = () => console.error("❌ 카드 로드 실패:", img.src);
      img.src = path;

      img.className = "tarot-card";
      spread.appendChild(img);
    });
  }, 900);
}

/* ===============================
   SESSION END
================================ */
window.addEventListener("beforeunload", () => {
  if (!soundEnabled) return;
  bgm.pause();
  playSound(endSound);
});
