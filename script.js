function startFortune() {
  const name = document.getElementById("name").value.trim();
  const birth = document.getElementById("birth").value.trim();
  const zodiac = document.getElementById("zodiac").value;
  const mbti = document.getElementById("mbti").value;

  if (!name || !birth || !zodiac || !mbti) {
    alert("정보를 모두 입력하세요");
    return;
  }

  document.getElementById("result").classList.remove("hidden");

  // 오늘의 운세
  document.getElementById("todayText").innerText =
    "오늘은 조급해하지 말고 흐름을 지켜보는 것이 좋습니다.";

  // 타로 카드 (임시 1장 고정)
  const card = {
    name: "The Fool",
    img: "/assets/tarot/majors/00_the_fool.png",
    desc: "새로운 시작과 자유로운 선택을 의미하는 카드입니다."
  };

  const tarotImg = document.getElementById("tarotCardImg");
  tarotImg.src = card.img;
  tarotImg.alt = card.name;

  document.getElementById("tarotText").innerText = card.desc;
}

function askAI() {
  const q = document.getElementById("aiQuestion").value.trim();
  if (!q) return;

  document.getElementById("aiAnswer").innerText =
    "지금은 스스로의 선택을 믿는 것이 중요합니다.";
}
