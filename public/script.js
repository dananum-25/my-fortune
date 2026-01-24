/* ===== 카드 파일 테이블 ===== */

// 메이저 22장 (실제 파일명과 1:1 매칭)
const MAJORS = [
  "00_the_fool.png",
  "01_the_magician.png",
  "02_the_high_priestess.png",
  "03_the_empress.png",
  "04_the_emperor.png",
  "05_the_hierophant.png",
  "06_the_lovers.png",
  "07_the_chariot.png",
  "08_strength.png",
  "09_the_hermit.png",
  "10_wheel_of_fortune.png",
  "11_justice.png",
  "12_the_hanged_man.png",
  "13_death.png",
  "14_temperance.png",
  "15_the_devil.png",
  "16_the_tower.png",
  "17_the_star.png",
  "18_the_moon.png",
  "19_the_sun.png",
  "20_judgement.png",
  "21_the_world.png"
];

// 마이너 공통 파일명
const MINOR_NAMES = {
  "01":"ace","02":"two","03":"three","04":"four","05":"five","06":"six",
  "07":"seven","08":"eight","09":"nine","10":"ten",
  "11":"page","12":"knight","13":"queen","14":"king"
};

const SUITS = ["cups","wands","swords","pentacles"];

/* ===== 78장 랜덤 드로우 ===== */
function draw78() {
  const isMajor = Math.random() < (22 / 78);

  if (isMajor) {
    const file = MAJORS[Math.floor(Math.random() * MAJORS.length)];
    return `/assets/tarot/majors/${file}`;
  } else {
    const suit = SUITS[Math.floor(Math.random() * 4)];
    const num = String(Math.floor(Math.random() * 14) + 1).padStart(2, "0");
    const name = MINOR_NAMES[num];
    return `/assets/tarot/minors/${suit}/${num}_${name}.png`;
  }
}

/* ===== 리빌 ===== */
bigCards.forEach((card) => {
  const front = card.querySelector(".front");
  const img = draw78();
  front.style.backgroundImage = `url('${img}')`;
  front.style.display = "block";
});
