/* ===== 사운드 ===== */
const bgm = new Audio("/public/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.3;

const sOpen = new Audio("/public/sounds/tarot/spread_open.mp3");
const sPick = new Audio("/public/sounds/tarot/pick.mp3");

let soundOn = false;
const soundBtn = document.getElementById("soundToggle");

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  if (soundOn) bgm.play().catch(()=>{});
  else bgm.pause();
};

/* ===== 질문 → 스프레드 ===== */
const qSection = document.getElementById("questionSection");
const qCards = document.querySelectorAll(".q-card");
const spread = document.getElementById("spreadSection");
const grid = document.getElementById("grid78");

let chosenTopic = null;

qCards.forEach(card => {
  card.onclick = () => {
    if (!soundOn) {
      soundOn = true;
      soundBtn.textContent = "🔊";
      bgm.play().catch(()=>{});
    }
    sPick.currentTime = 0;
    sPick.play().catch(()=>{});

    chosenTopic = card.dataset.value;
    qSection.classList.add("hidden");
    showSpread();
  };
});

function showSpread() {
  sOpen.currentTime = 0;
  sOpen.play().catch(()=>{});
  spread.classList.remove("hidden");

  // 78장 생성 (연출 1단계: 선택만)
  grid.innerHTML = "";
  let selected = 0;

  for (let i = 0; i < 78; i++) {
    const d = document.createElement("div");
    d.className = "pick";
    d.onclick = () => {
      if (d.classList.contains("sel")) return;
      if (selected >= 3) return;
      d.classList.add("sel");
      selected++;
      sPick.currentTime = 0;
      sPick.play().catch(()=>{});
    };
    grid.appendChild(d);
  }
}
