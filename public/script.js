const grid = document.getElementById("grid78");
const spread = document.getElementById("spreadSection");
const modal = document.getElementById("confirmModal");
const btnGo = document.getElementById("btnGo");
const selectedRow = document.getElementById("selectedRow");
const bigCards = document.querySelectorAll(".big-card");
const soundBtn = document.getElementById("soundToggle");

/* 사운드 (버전1 유지) */
const bgm = new Audio("/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;
bgm.volume = 0.15;
let soundOn = false;

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊" : "🔇";
  if (soundOn) bgm.play().catch(()=>{});
  else bgm.pause();
};

/* 카드 DB */
const MAJORS = [
  "00_the_fool.png","01_the_magician.png","02_the_high_priestess.png",
  "03_the_empress.png","04_the_emperor.png","05_the_hierophant.png",
  "06_the_lovers.png","07_the_chariot.png","08_strength.png",
  "09_the_hermit.png","10_wheel_of_fortune.png","11_justice.png",
  "12_the_hanged_man.png","13_death.png","14_temperance.png",
  "15_the_devil.png","16_the_tower.png","17_the_star.png",
  "18_the_moon.png","19_the_sun.png","20_judgement.png","21_the_world.png"
];
const SUITS = ["cups","wands","swords","pentacles"];
const MINOR_NAMES = {
  "01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six",
  "07":"seven","08":"eight","09":"nine","10":"ten",
  "11":"page","12":"knight","13":"queen","14":"king"
};

let deck = [];
MAJORS.forEach(f => deck.push(`/assets/tarot/majors/${f}`));
SUITS.forEach(suit => {
  Object.keys(MINOR_NAMES).forEach(num => {
    deck.push(`/assets/tarot/minors/${suit}/${num}_${MINOR_NAMES[num]}.png`);
  });
});

/* 스프레드 생성 */
let selected = [];
for (let i = 0; i < 78; i++) {
  const c = document.createElement("div");
  c.className = "pick";
  c.onclick = () => {
    if (c.classList.contains("sel") || selected.length >= 3) return;
    c.classList.add("sel");
    selected.push(c);
    if (selected.length === 3) modal.classList.remove("hidden");
  };
  grid.appendChild(c);
}

/* 진행 */
btnGo.onclick = async () => {
  modal.classList.add("hidden");

  // 스프레드 제거
  spread.remove();

  // 선택 카드 재정렬
  selected.forEach(card => {
    card.classList.remove("sel");
    selectedRow.appendChild(card);
  });

  await wait(2000);

  // 파이어볼 이동
  const targets = [...bigCards].map(b => b.getBoundingClientRect());

  selected.forEach((card, i) => {
    const from = card.getBoundingClientRect();
    const to = targets[i];

    const fire = document.createElement("div");
    fire.className = "fireball";
    document.body.appendChild(fire);
    fire.style.left = from.left + "px";
    fire.style.top = from.top + "px";

    fire.animate([
      { transform: "translate(0,0)" },
      { transform: `translate(${to.left-from.left}px, ${to.top-from.top}px)` }
    ], { duration: 3000, easing: "ease-in-out" });

    setTimeout(() => fire.remove(), 3000);
  });

  await wait(3000);

  // 점화 → 연기
  bigCards.forEach(b => b.classList.add("burning"));
  await wait(2000);
  bigCards.forEach(b => b.classList.add("smoking"));
  await wait(2000);

  // 앞면 리빌 (중복 없음)
  bigCards.forEach((b) => {
    const idx = Math.floor(Math.random() * deck.length);
    const img = deck.splice(idx, 1)[0];
    const front = b.querySelector(".big-front");
    front.style.backgroundImage = `url('${img}')`;
    front.style.display = "block";
  });
};

const wait = ms => new Promise(r => setTimeout(r, ms));
