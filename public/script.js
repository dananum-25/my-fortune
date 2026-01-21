const grid = document.getElementById("grid78");
const modal = document.getElementById("modal");
const confirmBtn = document.getElementById("confirm");
const cancelBtn = document.getElementById("cancel");
const bigCards = document.querySelectorAll(".big-card");

let selected = [];

/* 78장 생성 */
for (let i = 0; i < 78; i++) {
  const d = document.createElement("div");
  d.className = "pick";
  d.onclick = () => togglePick(d);
  grid.appendChild(d);
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
  if (selected.length === 3) modal.classList.remove("hidden");
}

cancelBtn.onclick = () => modal.classList.add("hidden");

confirmBtn.onclick = async () => {
  modal.classList.add("hidden");

  document.querySelectorAll(".pick:not(.sel)").forEach(c=>{
    c.classList.add("fade");
    setTimeout(()=>c.remove(),600);
  });

  await animateToBigCards();
};

/* 카드 이동 + 점화 */
async function animateToBigCards() {
  const faces = getRandomCards();

  for (let i=0;i<3;i++) {
    const rectFrom = selected[i].getBoundingClientRect();
    const rectTo = bigCards[i].getBoundingClientRect();

    const clone = selected[i].cloneNode();
    document.body.appendChild(clone);
    clone.style.position="fixed";
    clone.style.left=rectFrom.left+"px";
    clone.style.top=rectFrom.top+"px";
    clone.style.transition="all .8s cubic-bezier(.2,.8,.2,1)";

    await sleep(50);
    clone.style.left=rectTo.left+"px";
    clone.style.top=rectTo.top+"px";

    await sleep(900);
    bigCards[i].classList.add("ignite");
    await sleep(600);
    bigCards[i].style.backgroundImage=`url(${faces[i]})`;
    clone.remove();
  }
}

/* 중복 없는 랜덤 */
function getRandomCards() {
  const pool = [
    "/assets/tarot/majors/00_the_fool.png",
    "/assets/tarot/minors/cups/01_ace.png"
    // 실제론 78장 전부 넣어야 함
  ];
  return pool.sort(()=>Math.random()-0.5).slice(0,3);
}

const sleep = ms => new Promise(r=>setTimeout(r,ms));
