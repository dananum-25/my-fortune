function startFortune() {
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("todayText").innerText =
    "오늘은 조급해하지 말고 흐름을 지켜보는 것이 좋습니다.";
  document.getElementById("tarotText").innerText =
    "지금은 준비의 카드가 나왔습니다.";
}

// ================= AI 상담 =================

async function askAI() {
  const q = document.getElementById("aiQuestion").value.trim();
  if (!q) return;

  document.getElementById("aiAnswer").innerText = "🤔 상담 중입니다...";

  const category = classifyCategory(q);
  const db = await loadDB(category);

  const matched = findAnswer(db, q);

  if (matched) {
    document.getElementById("aiAnswer").innerText = matched;
  } else {
    const temp = fallbackAnswer(q);
    document.getElementById("aiAnswer").innerText = temp;
    savePending(q, category);
  }
}

function classifyCategory(q) {
  if (q.match(/돈|재물|금전|월급|수입/)) return "money";
  if (q.match(/회사|직장|이직|상사/)) return "job";
  return "love";
}

async function loadDB(category) {
  try {
    const res = await fetch(`/data/${category}.json`);
    return await res.json();
  } catch {
    return [];
  }
}

function findAnswer(db, q) {
  for (const item of db) {
    for (const key of item.intent) {
      if (q.includes(key)) {
        return item.answers[Math.floor(Math.random() * item.answers.length)];
      }
    }
  }
  return null;
}

function fallbackAnswer() {
  return "아직 명확한 답이 없는 질문이에요. 지금은 상황을 조금 더 지켜보는 것이 좋아 보입니다.";
}

function savePending(question, category) {
  const pending = JSON.parse(localStorage.getItem("pending") || "[]");
  pending.push({ question, category, date: new Date().toISOString() });
  localStorage.setItem("pending", JSON.stringify(pending));
}
