/* ===============================
   GLOBAL STATE
================================ */
let isMuted = true;
let bgmAudio = null;
let currentStep = 0;

/* ===============================
   SOUND SYSTEM
================================ */
function initBGM() {
  if (bgmAudio) return;
  bgmAudio = new Audio("/sounds/tarot/ambient_entry.mp3");
  bgmAudio.loop = true;
  bgmAudio.volume = 0.4;
}

function playBGM() {
  if (isMuted) return;
  initBGM();
  bgmAudio.play().catch(e => console.warn("BGM autoplay blocked", e));
}

function stopBGM() {
  if (bgmAudio) bgmAudio.pause();
}

function toggleSound() {
  isMuted = !isMuted;
  if (!isMuted) playBGM();
  else stopBGM();
}

/* ===============================
   CARD DATA
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
   IMAGE LOADER (DEFENSIVE)
================================ */
function loadCardImage(path) {
  const img = new Image();
  img.onload = () => console.log("카드 로드 성공:", path);
  img.onerror = () => console.error("카드 로드 실패:", path);
  img.src = path;
  img.className = "tarot-card";
  return img;
}

/* ===============================
   DRAW CARDS
================================ */
function drawThreeCards() {
  const container = document.getElementById("tarot-cards");
  if (!container) return;

  container.innerHTML = "";

  const cards = [];

  for (let i = 0; i < 3; i++) {
    if (Math.random() > 0.5) {
      const major = MAJORS[Math.floor(Math.random() * MAJORS.length)];
      cards.push(`/assets/tarot/majors/${major}.png`);
    } else {
      const suit = MINOR_SUITS[Math.floor(Math.random() * 4)];
      const value = MINOR_VALUES[Math.floor(Math.random() * MINOR_VALUES.length)];
      cards.push(`/assets/tarot/minors/${suit}/${value}.png`);
    }
  }

  cards.forEach(path => {
    const img = loadCardImage(path);
    container.appendChild(img);
  });
}

/* ===============================
   CHAT FLOW
================================ */
function nextStep() {
  currentStep++;

  if (currentStep === 1) {
    playBGM();
  }

  if (currentStep === 3) {
    drawThreeCards();
    new Audio("/sounds/tarot/card_pick.mp3").play();
  }
}

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const soundBtn = document.getElementById("sound-toggle");
  if (soundBtn) soundBtn.addEventListener("click", toggleSound);

  console.log("AI 타로 시스템 초기화 완료");
});
