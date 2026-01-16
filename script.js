const ZODIAC = ["rat","ox","tiger","rabbit","dragon","snake","horse","goat","monkey","rooster","dog","pig"];
const ZODIAC_KO = {
  rat:"쥐띠",ox:"소띠",tiger:"호랑이띠",rabbit:"토끼띠",
  dragon:"용띠",snake:"뱀띠",horse:"말띠",goat:"양띠",
  monkey:"원숭이띠",rooster:"닭띠",dog:"개띠",pig:"돼지띠"
};
const MBTI = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];
const CATEGORY_MAP = {
  love: "💖 연애운",
  money: "💰 금전운",
  job: "💼 직업운"
};

let tarotDB, yearDB;

fetch("/data/tarot_db_ko.json").then(r=>r.json()).then(d=>tarotDB=d);
fetch("/data/year_2026.json").then(r=>r.json()).then(d=>yearDB=d);

window.onload = () => {
  ZODIAC.forEach(z => {
    zodiac.innerHTML += `<option value="${z}">${ZODIAC_KO[z]}</option>`;
  });
  MBTI.forEach(m => {
    mbti.innerHTML += `<option value="${m}">${m}</option>`;
  });

  routeByURL();
};

function seed(str){
  let h=0; for(let c of str) h=(h*31+c.charCodeAt(0))|0;
  return Math.abs(Math.sin(h))*10000;
}

function routeByURL(){
  const path = location.pathname.split("/").filter(Boolean);
  const category = path[path.length-1];
  if(CATEGORY_MAP[category]){
    document.getElementById("categoryTitle").innerText = CATEGORY_MAP[category];
  }
}

function startFortune(){
  const nameVal=name.value, birthVal=birth.value;
  const zodiacVal=zodiac.value, mbtiVal=mbti.value;
  if(!nameVal||!birthVal) return alert("정보를 입력하세요");

  result.classList.remove("hidden");

  const today=new Date().toISOString().slice(0,10);
  const seedKey=nameVal+birthVal+zodiacVal+mbtiVal+today;

  todayTitle.innerText = `${nameVal}님의 오늘 운세`;
  todayText.innerText = "오늘은 작은 선택이 큰 변화를 만듭니다.";

  const categoryKey=location.pathname.split("/").pop();
  categoryText.innerText =
    categoryKey==="love" ? "솔직한 대화가 중요합니다." :
    categoryKey==="money" ? "지출 관리가 행운을 부릅니다." :
    categoryKey==="job" ? "노력한 만큼 기회가 옵니다." :
    "균형 잡힌 하루가 됩니다.";

  drawTarot(seedKey);
}

function drawTarot(seedKey){
  tarotText.innerText="카드를 뽑는 중...";
  tarotCard.className="tarot-back";

  setTimeout(()=>{
    const cards=[...tarotDB.majors,...Object.values(tarotDB.minors).flat()];
    const idx=Math.floor(seed(seedKey)%cards.length);
    const card=cards[idx];
    tarotCard.style.animation="none";
    tarotCard.style.backgroundImage=`url(${card.image})`;
    tarotText.innerText=`${card.name_ko} : ${card.upright.summary}`;
  },5000);
}

function share(){
  const url=location.href;
  navigator.share
    ? navigator.share({title:"오늘의 운세",url})
    : prompt("복사해서 공유하세요",url);
}

