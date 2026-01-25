/* ===========================
   🔊 SOUND SYSTEM (STABLE)
=========================== */

const soundBtn = document.getElementById("soundToggle");

let audioCtx = null;
let bgm = null;
let soundEnabled = false;

function initAudio() {
  if (audioCtx) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
  bgm.loop = true;
  bgm.volume = 0.15;

  // 모바일 unlock
  const unlock = () => {
    audioCtx.resume().then(() => {
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    });
  };
  document.addEventListener("touchstart", unlock, { once: true });
  document.addEventListener("click", unlock, { once: true });
}

soundBtn.addEventListener("click", async () => {
  initAudio();

  if (!soundEnabled) {
    try {
      await bgm.play();
      soundEnabled = true;
      soundBtn.textContent = "🔊";
    } catch (e) {
      console.log("BGM play blocked:", e);
    }
  } else {
    bgm.pause();
    soundEnabled = false;
    soundBtn.textContent = "🔇";
  }
});

/* ===========================
   이하 기존 버전-1 로직
   (카드 / 연출 / 채팅)
   ⚠️ 변경 없음
=========================== */

// ⚠️ 여기 아래는 네가 업로드한 버전-1 script.js를 그대로 유지
// (카드 선택, 파이어볼, 점화, 연기, 리빌, 채팅 로직 전부 동일)
