/**************************************************
 * 1️⃣ 전역 상태
 **************************************************/
let questionStep = 0;
let selectedAnswers = [];
let selectedCards = [];
let soundEnabled = false;

/**************************************************
 * 2️⃣ DOM 참조
 **************************************************/
const questionTitle = document.getElementById("question-title");
const questionOptions = document.getElementById("question-options");
const triggerSection = document.getElementById("trigger-section");
const triggerYesBtn = document.getElementById("trigger-yes");
const triggerResetBtn = document.getElementById("trigger-reset");

const cardStage = document.getElementById("card-stage"); // 빅카드 + 스프레드 컨테이너
const bigCardContainer = document.getElementById("big-cards");
const spreadContainer = document.getElementById("spread-cards");

/**************************************************
 * 3️⃣ 사운드
 **************************************************/
const bgm = new Audio("/public/sounds/tarot/ambient_entry.mp3");
bgm.loop = true;

function toggleSound() {
  soundEnabled = !soundEnabled;
  if (soundEnabled) bgm.play();
  else bgm.pause();
}

/**************************************************
 * 4️⃣ 질문 데이터
 **************************************************/
const QUESTIONS = [
  {
    title: "어떤 주제에 대한 상담일까?",
    options: ["연애 · 관계", "직업 · 진로", "금전 · 현실", "나 자신 · 마음"]
  },
  {
    title: "이 고민은 언제부터였을까?",
    options: ["최근", "꽤 오래됨", "계속 반복됨"]
  },
  {
    title: "지금 가장 바라는 건?",
    options: ["명확한 방향", "위로", "결단의 힌트"]
  }
];

/**************************************************
 * 5️⃣ 질문 렌더링
 **************************************************/
function renderQuestion() {
  const q = QUESTIONS[questionStep];
  questionTitle.textContent = q.title;
  questionOptions.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-card";
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(opt);
    questionOptions.appendChild(btn);
  });
}

/**************************************************
 * 6️⃣ 질문 선택 처리
 **************************************************/
function selectAnswer(answer) {
  selectedAnswers.push(answer);
  questionStep++;

  if (questionStep < QUESTIONS.length) {
    renderQuestion();
  } else {
    finishQuestions();
  }
}

/**************************************************
 * 7️⃣ 질문 종료 → 중간 트리거
 **************************************************/
function finishQuestions() {
  questionTitle.textContent = "";
  questionOptions.innerHTML = "";

  triggerSection.classList.remove("hidden");
}

/**************************************************
 * 8️⃣ 트리거 버튼
 **************************************************/
triggerYesBtn.onclick = () => {
  triggerSection.classList.add("hidden");
  startCardStage();
};

triggerResetBtn.onclick = () => {
  resetAll();
};

/**************************************************
 * 9️⃣ 카드 스테이지 시작 (🔥 핵심)
 **************************************************/
function startCardStage() {
  cardStage.classList.remove("hidden");

  createBigCards();
  createSpread();
}

/**************************************************
 * 🔟 빅카드 3장 생성
 **************************************************/
function createBigCards() {
  bigCardContainer.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");
    card.className = "big-card back";
    bigCardContainer.appendChild(card);
  }
}

/**************************************************
 * 1️⃣1️⃣ 78장 스프레드 생성
 **************************************************/
function createSpread() {
  spreadContainer.innerHTML = "";

  for (let i = 0; i < 78; i++) {
    const card = document.createElement("div");
    card.className = "spread-card back";
    card.onclick = () => selectCard(card);
    spreadContainer.appendChild(card);
  }
}

/**************************************************
 * 1️⃣2️⃣ 카드 선택 (3장 제한)
 **************************************************/
function selectCard(card) {
  if (selectedCards.includes(card)) return;
  if (selectedCards.length >= 3) return;

  card.classList.add("selected");
  selectedCards.push(card);
}

/**************************************************
 * 1️⃣3️⃣ 전체 초기화
 **************************************************/
function resetAll() {
  questionStep = 0;
  selectedAnswers = [];
  selectedCards = [];

  triggerSection.classList.add("hidden");
  cardStage.classList.add("hidden");

  bigCardContainer.innerHTML = "";
  spreadContainer.innerHTML = "";

  renderQuestion();
}

/**************************************************
 * 1️⃣4️⃣ 최초 실행
 **************************************************/
renderQuestion();
