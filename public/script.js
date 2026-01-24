const bigCards = document.querySelectorAll(".big-card");
const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");

/* 🔑 드로우 전용 덱 (중요) */
let revealDeck = [...Array(78)].map((_, i) => i);

let selected = [];

/* 78장 생성 */
for (let i = 0; i < 78; i++) {
  const d = document.createElement("div");
  d.className = "pick";
  d.onclick = () => togglePick(d);
  grid.appendChild(d);
}

function togglePick(el) {
  if (el.classList.contains("sel")) {
    el.classList.remove("sel");
    selected = selected.filter(x => x !== el);
    return;
  }
  if (selected.length >= 3) return;
  el.classList.add("sel");
  selected.push(el);
  if (selected.length === 3) modal.classList.remove("hidden");
}

btnGo.onclick = async () => {
  modal.classList.add("hidden");
  await ritual();
};

async function ritual() {
  document.querySelectorAll(".pick:not(.sel)").forEach(p => p.remove());

  const targets = [...bigCards].map(c => c.getBoundingClientRect());

  selected.forEach((card, i) => {
    const from = card.getBoundingClientRect();
    const to = targets[i];

    const fireball = document.createElement("div");
    fireball.className = "fireball";
    document.body.appendChild(fireball);

    const arc = -120; // 🔥 포물선 높이

    fireball.animate([
      { transform: `translate(${from.left}px, ${from.top}px)` },
      { transform: `translate(${(from.left + to.left)/2}px, ${from.top + arc}px)` },
      { transform: `translate(${to.left}px, ${to.top}px)` }
    ], {
      duration: 3600,
      easing: "ease-in-out",
      fill: "forwards"
    });

    setTimeout(() => fireball.remove(), 3800);
  });

  await wait(4200);

  bigCards.forEach(c => c.classList.add("burning"));
  await wait(2600);

  bigCards.forEach(c => c.classList.add("smoking"));
  await wait(3200);

  bigCards.forEach(c => c.classList.remove("burning", "smoking"));
  await wait(600);

  /* ✅ 앞면 리빌 – 반드시 나옴 */
  bigCards.forEach((c, i) => {
    const front = c.querySelector(".big-front");
    front.style.backgroundImage =
      `url('/assets/tarot/majors/${drawReveal()}.png')`;
    front.style.display = "block";
  });

  spread.style.display = "none";
}

function drawReveal() {
  const i = Math.floor(Math.random() * revealDeck.length);
  return String(revealDeck.splice(i, 1)[0]).padStart(2, "0");
}

const wait = ms => new Promise(r => setTimeout(r, ms));
