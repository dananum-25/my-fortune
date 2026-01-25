const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const bigCards = [...document.querySelectorAll(".big-card")];
const fxLayer = document.getElementById("fx-layer");

/* ===== 카드 덱 생성 (78장 고정, 중복 없음) ===== */
const MAJORS = [
  "00_the_fool.png","01_the_magician.png","02_the_high_priestess.png",
  "03_the_empress.png","04_the_emperor.png","05_the_hierophant.png",
  "06_the_lovers.png","07_the_chariot.png","08_strength.png",
  "09_the_hermit.png","10_wheel_of_fortune.png","11_justice.png",
  "12_the_hanged_man.png","13_death.png","14_temperance.png",
  "15_the_devil.png","16_the_tower.png","17_the_star.png",
  "18_the_moon.png","19_the_sun.png","20_judgement.png","21_the_world.png"
];
const MINOR_NAMES = {
  "01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six",
  "07":"seven","08":"eight","09":"nine","10":"ten",
  "11":"page","12":"knight","13":"queen","14":"king"
};
const SUITS = ["cups","wands","swords","pentacles"];

let deck = [];
MAJORS.forEach(f => deck.push(`/assets/tarot/majors/${f}`));
SUITS.forEach(s =>
  Object.keys(MINOR_NAMES).forEach(n =>
    deck.push(`/assets/tarot/minors/${s}/${n}_${MINOR_NAMES[n]}.png`)
  )
);

/* ===== 스프레드 생성 ===== */
let selected = [];
for (let i = 0; i < 78; i++) {
  const d = document.createElement("div");
  d.className = "pick";
  d.onclick = () => {
    if (d.classList.contains("sel")) {
      d.classList.remove("sel");
      selected = selected.filter(x => x !== d);
      return;
    }
    if (selected.length >= 3) return;
    d.classList.add("sel");
    selected.push(d);
    if (selected.length === 3) modal.classList.remove("hidden");
  };
  grid.appendChild(d);
}

/* ===== 진행 ===== */
btnGo.onclick = async () => {
  modal.classList.add("hidden");

  // 75장 제거
  document.querySelectorAll(".pick:not(.sel)")
    .forEach(p => p.remove());

  // 선택된 3장 재정렬 (빅카드 아래)
  const baseY = bigCards[0].getBoundingClientRect().bottom + 20;
  selected.forEach((card, i) => {
    const r = bigCards[i].getBoundingClientRect();
    card.style.position = "fixed";
    card.style.left = r.left + "px";
    card.style.top = baseY + "px";
  });

  await wait(600);

  // 파이어볼
  selected.forEach((card, i) => {
    const from = card.getBoundingClientRect();
    const to = bigCards[i].getBoundingClientRect();

    const f = document.createElement("div");
    f.className = "fireball";
    fxLayer.appendChild(f);

    f.animate([
      { transform:`translate(${from.left}px,${from.top}px)` },
      { transform:`translate(${(from.left+to.left)/2}px,${from.top-180}px)` },
      { transform:`translate(${to.left}px,${to.top}px)` }
    ], { duration: 4000, easing:"ease-in-out", fill:"forwards" });

    setTimeout(()=>f.remove(),4100);
  });

  await wait(4200);

  // 카드 리빌 (중복 없음)
  bigCards.forEach(c => {
    const idx = Math.floor(Math.random() * deck.length);
    const img = deck.splice(idx, 1)[0];
    const front = c.querySelector(".front");
    front.style.backgroundImage = `url('${img}')`;
    front.style.display = "block";
  });

  spread.style.display = "none";
};

const wait = ms => new Promise(r => setTimeout(r, ms));
