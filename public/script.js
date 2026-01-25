const grid = document.getElementById("grid78");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const soundBtn = document.getElementById("soundToggle");

let selected = [];

/* ===== 사운드 ===== */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;

const sfxSpread = new Audio("/sounds/tarot/spread_open.mp3");
const sfxPick = new Audio("/sounds/tarot/pick.mp3");

let soundOn = false;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";

  if (soundOn) {
    bgm.play();
    sfxSpread.play();
  } else {
    bgm.pause();
    bgm.currentTime = 0;
  }
};

/* ===== 78장 카드 생성 ===== */
for (let i = 0; i < 78; i++) {
  const card = document.createElement("div");
  card.className = "pick";
  card.onclick = () => togglePick(card);
  grid.appendChild(card);
}

function togglePick(card) {
  if (card.classList.contains("sel")) {
    card.classList.remove("sel");
    selected = selected.filter(c => c !== card);
    return;
  }

  if (selected.length >= 3) return;

  card.classList.add("sel");
  selected.push(card);

  if (soundOn) {
    sfxPick.currentTime = 0;
    sfxPick.play();
  }

  if (selected.length === 3) {
    modal.classList.remove("hidden");
  }
}

/* ===== 모달 진행 (연출 1단계 끝) ===== */
btnGo.onclick = () => {
  modal.classList.add("hidden");
  // ❗ 이후 연출은 다음 단계에서
};
