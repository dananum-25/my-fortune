// ===============================
// 기본 데이터
// ===============================

const ZODIAC_LIST = [
  "rat","ox","tiger","rabbit","dragon","snake",
  "horse","goat","monkey","rooster","dog","pig"
];

const ZODIAC_KO = {
  rat:"쥐띠", ox:"소띠", tiger:"호랑이띠", rabbit:"토끼띠",
  dragon:"용띠", snake:"뱀띠", horse:"말띠", goat:"양띠",
  monkey:"원숭이띠", rooster:"닭띠", dog:"개띠", pig:"돼지띠"
};

const MBTI_LIST = [
  "INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"
];

// ===============================
// 초기 셀렉트 채우기
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const zodiacSel = document.getElementById("zodiac");
  const mbtiSel = document.getElementById("mbti");

  ZODIAC_LIST.forEach(z => {
    const opt = document.createElement("option");
    opt.value = z;
    opt.textContent = ZODIAC_KO[z];
    zodiacSel.appendChild(opt);
  });

  MBTI_LIST.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    mbtiSel.appendChild(opt);
  });
});

// ===============================
// 운세 보기
// ===============================

function startFortune() {
  const name = document.getElementById("name").value.trim();
  const birth = document.getElementById("birth").value.trim();
  const zodiac = document.getElementById("zodiac").value;
  const mbti = document.getElementById("mbti").value;

  if (!name || !birth || !zodiac || !mbti) {
    alert("정보를 모두 입력해주세요");
    return;
  }

  document.getElementById("result").classList.remove("hidden");

  // 오늘의 운세
  document.getElementById("todayTitle").innerText = "🌞 오늘의 운세";
  document.getElementById("todayText").innerText =
    "오늘은 흐름을 억지로 바꾸기보다 자연스럽게 흘려보내는 것이 좋습니다.";

  // 타로
  drawTarot();

  // SEO URL 반영
  history.replaceState(
    null,
    "",
    `/zodiac/${zodiac}/mbti/${mbti.toLowerCase()}/love`
  );
}

// ===============================
// 타로 카드
// ===============================

const TAROT_CARDS = [
  {
    name: "The Fool",
    img: "/assets/tarot/majors/00_the_fool.png",
    text: "새로운 시작과 자유로운 선택의 카드입니다."
  }
];

function drawTarot() {
  const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
  const tarotDiv = document.getElementById("tarotCard");

  tarotDiv.className = "tarot-front";
  tarotDiv.style.backgroundImage = `url('${card.img}')`;
  tarotDiv.style.backgroundSize = "contain";
  tarotDiv.style.backgroundRepeat = "no-repeat";
  tarotDiv.style.backgroundPosition = "center";

  document.getElementById("tarotText").innerText = card.text;
}

// ===============================
// AI 상담 (DB 기반)
// ===============================

let AI_DB = [];

fetch("/data/ai_qa.json")
  .then(res => res.json())
  .then(data => {
    AI_DB = data;
  });

function askAI() {
  const input = document.getElementById("aiQuestion");
  const question = input.value.trim();

  if (!question) {
    alert("질문을 입력해주세요");
    return;
  }

  const answerBox = document.getElementById("aiAnswer");
  answerBox.innerText = "🔮 상담 중입니다...";

  const found = AI_DB.find(item =>
    item.keywords.some(k => question.includes(k))
  );

  if (found) {
    found.count++;
    answerBox.innerText = found.answer;
  } else {
    const newItem = {
      id: AI_DB.length + 1,
      question,
      keywords: question.split(" ").slice(0, 3),
      category: "general",
      answer:
        "아직 명확한 답변 데이터가 없습니다. 이 질문은 저장되어 다음에 더 나은 답변으로 발전됩니다.",
      count: 1
    };

    AI_DB.push(newItem);
    answerBox.innerText = newItem.answer;
  }

  input.value = "";
}

// ===============================
// 공유
// ===============================

function share() {
  navigator.share?.({
    title: "오늘의 운세",
    url: location.href
  });
}
