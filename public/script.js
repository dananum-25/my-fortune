let step = 0;
let selectedCards = [];
let soundOn = false;

const screens = document.querySelectorAll(".screen");
const questionText = document.getElementById("questionText");
const optionsDiv = document.getElementById("options");
const cardGrid = document.getElementById("cardGrid");
const selectedView = document.getElementById("selectedCards");
const readingText = document.getElementById("readingText");
const flipSound = document.getElementById("flipSound");

document.getElementById("soundToggle").onclick = () => {
  soundOn = !soundOn;
  document.getElementById("soundToggle").innerText =
    soundOn ? "Sound 🔊" : "Sound 🔇";
};

const questions = [
  {
    q: "어떤 주제의 고민인가요?",
    o: ["연애·관계", "일·진로", "돈·현실", "나 자신"]
  },
  {
    q: "이 고민은 언제부터였나요?",
    o: ["최근", "조금 전부터", "오래됨"]
  },
  {
    q: "지금 마음은 어떤가요?",
    o: ["불안", "혼란", "답답", "차분"]
  }
];

function show(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goToQuestions() {
  step = 0;
  show("questions");
  renderQuestion();
}

function renderQuestion() {
  const q = questions[step];
  questionText.innerText = q.q;
  optionsDiv.innerHTML = "";
  q.o.forEach(opt => {
    const b = document.createElement("button");
    b.innerText = opt;
    b.onclick = () => nextQuestion();
    optionsDiv.appendChild(b);
  });
}

function nextQuestion() {
  step++;
  if (step < questions.length) {
    renderQuestion();
  } else {
    show("midTrigger");
  }
}

function goToSpread() {
  show("spread");
  cardGrid.innerHTML = "";
  selectedCards = [];
  for (let i = 0; i < 78; i++) {
    const c = document.createElement("div");
    c.className = "card";
    c.onclick = () => {
      if (selectedCards.length < 3 && !selectedCards.includes(i)) {
        selectedCards.push(i);
        c.style.opacity = 0.5;
        if (selectedCards.length === 3) {
          show("confirm");
        }
      }
    };
    cardGrid.appendChild(c);
  }
}

function redoSelect() {
  show("spread");
}

function startReveal() {
  document.body.style.overflow = "hidden";
  show("reading");
  selectedView.innerHTML = "";
  selectedCards.forEach((c, i) => {
    setTimeout(() => {
      if (soundOn) flipSound.play();
      const card = document.createElement("div");
      card.className = "card";
      selectedView.appendChild(card);
    }, i * 800);
  });
  setTimeout(() => {
    readingText.innerText =
      "이 카드는 지금의 흐름을 비추는 상징이에요.\n천천히 자신의 마음과 연결해보세요.";
  }, 3000);
}

function resetAll() {
  location.reload();
}
