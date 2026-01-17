/* =================================================
   GLOBAL INIT (defer 대응)
================================================= */

(function () {
  // -------------------------------
  // 1. 기본 데이터
  // -------------------------------
  const ZODIAC_MAP = {
    rat: "쥐띠",
    ox: "소띠",
    tiger: "호랑이띠",
    rabbit: "토끼띠",
    dragon: "용띠",
    snake: "뱀띠",
    horse: "말띠",
    goat: "양띠",
    monkey: "원숭이띠",
    rooster: "닭띠",
    dog: "개띠",
    pig: "돼지띠"
  };

  const MBTI_LIST = [
    "INTJ","INTP","ENTJ","ENTP",
    "INFJ","INFP","ENFJ","ENFP",
    "ISTJ","ISFJ","ESTJ","ESFJ",
    "ISTP","ISFP","ESTP","ESFP"
  ];

  const CATEGORY_MAP = {
    love: { title: "연애운", desc: "연애·궁합·감정 흐름을 확인해보세요." },
    money:{ title: "금전운", desc: "재물·돈·수입 흐름을 확인해보세요." },
    job:  { title: "직업운", desc: "직장·커리어·이직 운세를 확인해보세요." }
  };

  // -------------------------------
  // 2. SELECT 초기화
  // -------------------------------
  function initSelects() {
    const zodiacSelect = document.getElementById("zodiac");
    const mbtiSelect = document.getElementById("mbti");

    if (!zodiacSelect || !mbtiSelect) return;

    zodiacSelect.innerHTML = `<option value="">띠 선택</option>`;
    Object.entries(ZODIAC_MAP).forEach(([key, label]) => {
      zodiacSelect.innerHTML += `<option value="${key}">${label}</option>`;
    });

    mbtiSelect.innerHTML = `<option value="">MBTI 선택</option>`;
    MBTI_LIST.forEach(m => {
      mbtiSelect.innerHTML += `<option value="${m.toLowerCase()}">${m}</option>`;
    });
  }

  // -------------------------------
  // 3. SEO 자동 생성
  // -------------------------------
  function runSEO() {
    const path = location.pathname.split("/").filter(Boolean);

    // /zodiac/rat/mbti/intj/love
    if (path.length === 5 && path[0] === "zodiac" && path[2] === "mbti") {
      const zodiacKo = ZODIAC_MAP[path[1]];
      const mbti = path[3]?.toUpperCase();
      const category = CATEGORY_MAP[path[4]];
      if (!zodiacKo || !mbti || !category) return;

      const title = `${zodiacKo} ${mbti} ${category.title} | 성향별 운세`;
      document.title = title;

      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = `${zodiacKo} ${mbti} ${category.title}을 확인하세요. ${category.desc}`;

      if (!document.querySelector("h1[data-seo]")) {
        const h1 = document.createElement("h1");
        h1.dataset.seo = "auto";
        h1.textContent = title;
        h1.style.position = "absolute";
        h1.style.left = "-9999px";
        document.body.prepend(h1);
      }
    }
  }

  // -------------------------------
  // 4. 운세 실행
  // -------------------------------
  window.startFortune = function () {
    const name = document.getElementById("name")?.value.trim();
    const birth = document.getElementById("birth")?.value.trim();
    const zodiac = document.getElementById("zodiac")?.value;
    const mbti = document.getElementById("mbti")?.value;

    if (!name || !birth || !zodiac || !mbti) {
      alert("정보를 모두 입력해주세요.");
      return;
    }

    document.getElementById("result")?.classList.remove("hidden");

    document.getElementById("todayTitle").innerText =
      `${ZODIAC_MAP[zodiac]} ${mbti.toUpperCase()} 오늘의 운세`;

    document.getElementById("todayText").innerText =
      "오늘은 작은 선택이 큰 흐름을 바꿀 수 있는 날입니다.";

    document.getElementById("categoryTitle").innerText = "연애 · 금전 · 직업";
    document.getElementById("categoryText").innerText =
      "감정과 현실의 균형이 중요한 하루입니다.";

    document.getElementById("tarotText").innerText =
      "🃏 오늘의 카드는 새로운 시작을 의미합니다.";
  };

  // -------------------------------
  // 5. 공유
  // -------------------------------
  window.share = function () {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: location.href
      });
    } else {
      alert("공유가 지원되지 않는 기기입니다.");
    }
  };

  // -------------------------------
  // INIT
  // -------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initSelects();
    runSEO();
  });

})();
  function askAI() {
  const q = document.getElementById("aiQuestion").value.trim();
  if (!q) return;

  const answer = handleQuestion(q, "love"); // 처음엔 love로 고정
  document.getElementById("aiAnswer").innerText = answer;
}
