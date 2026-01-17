const API_URL =
"https://script.google.com/macros/s/AKfycbxWOEtmQ-7we79MHtPtsRxE30Ckz5cmnuCY5CFi_Vd7Lq2Mub6bZoYIhAWJGKQRRhr8/exec";

const ZODIAC_KO = ["쥐띠","소띠","호랑이띠","토끼띠","용띠","뱀띠","말띠","양띠","원숭이띠","닭띠","개띠","돼지띠"];
const MBTI = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];

const zodiacSel = document.getElementById("zodiac");
const mbtiSel = document.getElementById("mbti");

ZODIAC_KO.forEach(z=>{
  const o=document.createElement("option");o.textContent=z;zodiacSel.appendChild(o);
});
MBTI.forEach(m=>{
  const o=document.createElement("option");o.textContent=m;mbtiSel.appendChild(o);
});

function startFortune(){
  document.getElementById("result").classList.remove("hidden");
}

let aiSession = {
  id: Date.now().toString(),
  step: 1,
  history: []
};

function appendChat(text, who){
  const log = document.getElementById("chatLog");
  const div = document.createElement("div");
  div.className = who === "ai" ? "chat-ai" : "chat-user";
  div.innerText = text;
  log.appendChild(div);
}

function resetAI(){
  aiSession = { id: Date.now().toString(), step: 1, history: [] };
  document.getElementById("chatLog").innerHTML = "";
}

async function askAI(){
  const qEl = document.getElementById("aiQuestion");
  const q = qEl.value.trim();
  if(!q) return;

  appendChat(q,"user");
  qEl.value = "";

  const res = await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      question:q,
      session_id:aiSession.id,
      step:aiSession.step
    })
  }).then(r=>r.json());

  if(res.type==="block"){
    appendChat(res.message,"ai");
    return;
  }

  if(res.type==="followup"){
    aiSession.step++;
    aiSession.history.push(q);
    appendChat(res.question,"ai");
    return;
  }

  if(res.type==="answer"){
    appendChat(res.answer,"ai");

    if(res.top_examples){
      appendChat("비슷한 고민 예시:\n- "+res.top_examples.join("\n- "),"ai");
    }

    appendChat("이 답변이 도움이 되었나요? 👍 / 👎","ai");
  }
}
