/*************************************************
 * TAROT ENGINE v1.4  (STEP 6)
 * - 카드 의미 + 상담 엔진 + 시트 기록
 *************************************************/

const GAS_URL = "https://script.google.com/macros/s/AKfycbwPAEMT74SQGF0H2aUymPWwslS-QNYe8jV_Sgp5n2dbyqVGGysLfbuK3Gdcpth_nsBQ/exec";
const sessionId = crypto.randomUUID();
let turnIndex = 0;

/* ===== 카드 의미 (요약) ===== */
const CARD_MEANINGS = {
  major: "지금 삶의 큰 테마가 작동 중이야.",
  cups: "감정과 마음의 흐름이 중요해.",
  wands: "의지와 방향성이 핵심이야.",
  swords: "생각과 판단이 관건이야.",
  pentacles: "현실적 안정과 선택을 봐야 해."
};

/* ===== 리딩 생성 ===== */
function generateReading(cards){
  return [
    `첫 번째 카드는 이 고민의 본질을 보여줘. ${getMeaning(cards[0])}`,
    `두 번째 카드는 네가 지금 상황을 어떻게 느끼는지 말해줘. ${getMeaning(cards[1])}`,
    `세 번째 카드는 앞으로의 흐름과 조언이야. ${getMeaning(cards[2])}`
  ];
}

function getMeaning(card){
  if(card.type === "major") return CARD_MEANINGS.major;
  return CARD_MEANINGS[card.suit];
}

/* ===== 상담 질문 유도 ===== */
function followUpQuestion(){
  return "이 카드 중에서 특히 마음이 움직인 장면이나 단어가 있었어?";
}

/* ===== 시트 기록 ===== */
function logToSheet(payload){
  fetch(GAS_URL,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(payload)
  }).catch(()=>{});
}

/* ===== STEP 5 reveal() 이후에 이어서 실행 ===== */
function afterReveal(cards){
  const readings = generateReading(cards);
  readings.forEach(r=>addMsg(r,"cat"));

  const q = followUpQuestion();
  addMsg(q,"cat");

  logToSheet({
    session_id: sessionId,
    turn_index: turnIndex++,
    card_positions: "1-2-3",
    card_ids: cards.map(c=>c.img).join(","),
    card_names: cards.map(c=>c.name).join(","),
    question_category: "tarot_core",
    user_input: "",
    ai_message: readings.join(" | "),
    tone: "empathetic",
    next_action: "user_reflection"
  });
}

/* ===== 기존 reveal() 마지막에 이 줄 추가 ===== */
// afterReveal(faces);
