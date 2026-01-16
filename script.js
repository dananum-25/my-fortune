// ===============================
// SEO TITLE / META AUTO GENERATOR
// ===============================

// 1. 한글 매핑
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

// 2. URL 파싱
const path = window.location.pathname.split("/").filter(Boolean);

// 기대 구조:
// zodiac / rat / mbti / intj / love
if (path.length === 5 && path[0] === "zodiac" && path[2] === "mbti") {
  const zodiacKey = path[1];
  const mbti = path[3].toUpperCase();
  const categoryKey = path[4];

  const zodiacKo = ZODIAC_MAP[zodiacKey];
  const category = CATEGORY_MAP[categoryKey];

  if (zodiacKo && category) {
    // 3. TITLE 생성
    const title = `${zodiacKo} ${mbti} ${category.title} | 성향별 운세`;
    document.title = title;

    // 4. META DESCRIPTION
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

    // 5. H1 자동 삽입 (없을 때만)
    if (!document.querySelector("h1")) {
      const h1 = document.createElement("h1");
      h1.innerText = title;
      h1.style.display = "none"; // SEO용, 화면에는 숨김
      document.body.prepend(h1);
    }
  }
}
