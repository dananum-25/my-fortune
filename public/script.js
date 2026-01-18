// ===============================
// GLOBAL STATE
// ===============================
const GAS_URL = "https://script.google.com/macros/s/AKfycbwPAEMT74SQGF0H2aUymPWwslS-QNYe8jV_Sgp5n2dbyqVGGysLfbuK3Gdcpth_nsBQ/exec";
let soundEnabled = false;
let bgm = null;
let sessionStarted = false;

// ===============================
// AUDIO SETUP
// ===============================
const AUDIO = {
  entry: new Audio('/sounds/ambient_entry.mp3'),
  end: new Audio('/sounds/session_end.mp3')
};

AUDIO.entry.loop = true;
AUDIO.entry.volume = 0.15;
AUDIO.end.volume = 0.15;

function toggleSound() {
  soundEnabled = !soundEnabled;

  const btn = document.getElementById('soundToggle');
  if (soundEnabled) {
    btn.innerText = '🔊';
    AUDIO.entry.play().catch(() => {});
  } else {
    btn.innerText = '🔇';
    AUDIO.entry.pause();
    AUDIO.entry.currentTime = 0;
  }
}

// ===============================
// CHAT
// ===============================
const chatBox = document.getElementById('chatMessages');
const input = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

function addMessage(text, from = 'ai') {
  const msg = document.createElement('div');
  msg.className = `msg ${from}`;
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  if (!sessionStarted && soundEnabled) {
    AUDIO.entry.play().catch(() => {});
    sessionStarted = true;
  }

  addMessage(text, 'user');
  input.value = '';

  if (text.includes('카드')) {
    showTarotSpread();
    return;
  }

  addMessage('잠깐만… 고양이가 생각 중이야 🐾', 'ai');

  await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'ai',
      user_question_raw: text,
      session_id: getSessionId()
    })
  });
};

// ===============================
// TAROT SPREAD
// ===============================
const MAJOR_CARDS = Array.from({ length: 22 }, (_, i) =>
  `/assets/tarot/majors/${String(i).padStart(2, '0')}_${getMajorName(i)}.png`
);

function getMajorName(i) {
  return [
    'the_fool','the_magician','the_high_priestess','the_empress','the_emperor','the_hierophant',
    'the_lovers','the_chariot','strength','the_hermit','wheel_of_fortune','justice',
    'the_hanged_man','death','temperance','the_devil','the_tower','the_star','the_moon',
    'the_sun','judgement','the_world'
  ][i];
}

function showTarotSpread() {
  const spread = document.getElementById('tarotSpread');
  spread.innerHTML = '';
  spread.style.display = 'flex';

  addMessage('카드를 펼칠게… 마음으로 한 장 골라봐 ✨', 'ai');

  MAJOR_CARDS.slice(0, 7).forEach(path => {
    const img = new Image();
    img.className = 'tarot-card';

    img.onload = () => console.log('카드 로드 성공:', img.src);
    img.onerror = () => console.error('카드 로드 실패:', img.src);

    img.src = path;

    img.onclick = () => {
      spread.innerHTML = '';
      spread.appendChild(img);
      addMessage('이 카드가 너를 부르고 있었어…', 'ai');
    };

    spread.appendChild(img);
  });
}

// ===============================
// SESSION
// ===============================
function getSessionId() {
  let id = localStorage.getItem('session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('session_id', id);
  }
  return id;
}

window.addEventListener('beforeunload', () => {
  if (soundEnabled) {
    AUDIO.entry.pause();
    AUDIO.end.play().catch(() => {});
  }
});