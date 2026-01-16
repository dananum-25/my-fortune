// ===============================
// SEO TITLE / META AUTO GENERATOR
// ===============================

// ⚠️ DOM 로딩 완료 후 실행 (defer 대응)
document.addEventListener("DOMContentLoaded", () => {

  // 1️⃣ 한글 매핑
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

  const CATEGORY_MAP = {
    love: {
      title: "연애운",
      desc: "연애·궁합·감정 흐름을 확인해보세요."
    },
    money: {
      title: "금전운",
      desc: "재물·돈·수입 흐름을 확인해보세요."
    },
    job: {
      title: "직업운",
      desc: "직장·커리어·이직 운세를 확인해보세요."
    }
  };

  // 2️⃣ URL 파싱
  const path = window.location.pathname
    .split("/")
    .filter(Boolean);

  // 기대 URL 구조:
  // /zodiac/rat/mbti/intj/love
  if (
    path.length === 5 &&
    path[0] === "zodiac" &&
    path[2] === "mbti"
  ) {
    const zodiacKey = path[1];
    const mbti = path[3]?.toUpperCase();
    const categoryKey = path[4];

    const zodiacKo = ZODIAC_MAP[zodiacKey];
    const category = CATEGORY_MAP[categoryKey];

    if (!zodiacKo || !category || !mbti) return;

    // 3️⃣ TITLE 생성
    const titleText = `${zodiacKo} ${mbti} ${category.title} | 성향별 운세`;
    document.title = titleText;

    // 4️⃣ META DESCRIPTION (없으면 생성, 있으면 덮어쓰기)
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }

    metaDesc.setAttribute(
      "content",
      `${zodiacKo} ${mbti} ${category.title}을 확인하세요. ${category.desc}`
    );

    // 5️⃣ SEO용 H1 (화면 비노출)
    if (!document.querySelector("h1[data-seo='auto']")) {
      const h1 = document.createElement("h1");
      h1.innerText = titleText;
      h1.setAttribute("data-seo", "auto");
      h1.style.position = "absolute";
      h1.style.left = "-9999px";
      document.body.prepend(h1);
    }
  }

});
