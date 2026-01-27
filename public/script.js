const startPick = document.getElementById("startPick");
const questionStage = document.getElementById("questionStage");
const pickGuide = document.getElementById("pickGuide");
const spreadStage = document.getElementById("spreadStage");
const spread = document.getElementById("spread");
const fireball = document.getElementById("fireball");

const bgm = document.getElementById("bgm");
const soundToggle = document.getElementById("soundToggle");

let soundOn = false;
let selected = [];

soundToggle.onclick = () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "Sound 🔊" : "Sound 🔇";
  if (soundOn) bgm.play();
  else bgm.pause();
};

startPick.onclick = () => {
  questionStage.classList.add("hidden");
  pickGuide.classList.remove("hidden");
  createSpread();
};

function createSpread() {
  spread.innerHTML = "";
  spreadStage.classList.remove("hidden");

  for (let i = 0; i < 9; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => pickCard(card);
    spread.appendChild(card);
  }
}

function pickCard(card) {
  if (selected.includes(card)) return;
  if (selected.length >= 3) return;

  selected.push(card);
  card.style.outline = "3px solid gold";

  if (selected.length === 3) {
    lockScroll();
    launchFireball(card);
  }
}

function lockScroll() {
  document.body.style.overflow = "hidden";
  window.scrollTo({ top: 0, behavior: "instant" });
}

function launchFireball(card) {
  const rect = card.getBoundingClientRect();
  const startX = rect.left + rect.width / 2 + window.scrollX;
  const startY = rect.top + rect.height / 2 + window.scrollY;

  fireball.style.left = `${startX}px`;
  fireball.style.top = `${startY}px`;
  fireball.style.opacity = 1;

  fireball.animate([
    { transform: "translate(0,0)" },
    { transform: "translate(0,-200px)" }
  ], {
    duration: 1200,
    easing: "ease-out"
  }).onfinish = () => {
    fireball.style.opacity = 0;
  };
}
