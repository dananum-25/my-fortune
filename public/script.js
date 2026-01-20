/* ===============================
   STATE
================================ */
let soundOn = false;
let phase = "chat"; // chat → spread → reveal
let selectedCards = [];

/* ===============================
   DOM
================================ */
const chatArea = document.getElementById("chatArea");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const spreadArea = document.getElementById("spreadArea");
const soundToggle = document.getElementById("soundToggle");

const bgm = document.getElementById("bgm");
const cardSound = document.getElementById("cardSound");

/* ===============================
   SOUND
================================ */
bgm.loop = true;
bgm.volume = 0.15;
cardSound.volume = 0.3;

soundToggle.onclick = async () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "🔊" : "🔇";
  if (soundOn) {
    try { await bgm.play(); } catch(e){}
  } else {
    bgm.pause(); bgm.currentTime = 0;
  }
};

/* ===============================
   CHAT
================================ */
function addBubble(text, who) {
  const div = document.createElement("div");
  div.className = `bubble ${who}`;
  div.textContent = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

addBubble("안녕 🐱 나는 타로 상담사야.", "ai");
addBubble("지금 가장 신경 쓰이는 고민을 말해줘.", "ai");

sendBtn.onclick = send;
input.onkeydown = e => e.key === "Enter" && send();

function send() {
  const text = input.value.trim();
  if (!text) return;
  addBubble(text, "user");
  input.value = "";

  if (phase === "chat") {
    addBubble("좋아. 카드를 섞고 있어… 끌리는 카드 3장을 골라줘.", "ai");
    showSpread();
    phase = "spread";
  }
}

/* ===============================
   TAROT DATA (78)
================================ */
const majors = Array.from({length:22},(_,i)=>`/assets/tarot/majors/${String(i).padStart(2,"0")}_${[
"the_fool","the_magician","the_high_priestess","the_empress","the_emperor","the_hierophant",
"the_lovers","the_chariot","strength","the_hermit","wheel_of_fortune","justice",
"the_hanged_man","death","temperance","the_devil","the_tower","the_star",
"the_moon","the_sun","judgement","the_world"][i]}.png`);

const suits = ["cups","pentacles","swords","wands"];
const minors = [];
suits.forEach(s=>{
  for(let i=1;i<=14;i++){
    minors.push(`/assets/tarot/minors/${s}/${String(i).padStart(2,"0")}.png`);
  }
});

const ALL_CARDS = [...majors, ...minors];

/* ===============================
   SPREAD
================================ */
function showSpread() {
  spreadArea.innerHTML = "";
  selectedCards = [];

  const pool = [...ALL_CARDS].sort(()=>Math.random()-0.5).slice(0,12);

  pool.forEach(path=>{
    const card = document.createElement("div");
    card.className = "card-back";

    card.onclick = ()=>{
      if (selectedCards.includes(path) || selectedCards.length >= 3) return;
      card.classList.add("selected");
      selectedCards.push(path);
      if (soundOn) cardSound.play();

      if (selectedCards.length === 3) reveal();
    };

    spreadArea.appendChild(card);
  });
}

function reveal() {
  spreadArea.innerHTML = "";
  addBubble("선택한 카드들을 펼쳐볼게.", "ai");

  selectedCards.forEach(path=>{
    const img = new Image();
    img.className = "card-front";

    img.onload = ()=>console.log("카드 로드 성공:", img.src);
    img.onerror = ()=>console.error("카드 로드 실패:", img.src);

    img.src = path;
    spreadArea.appendChild(img);
  });

  phase = "reveal";
}
