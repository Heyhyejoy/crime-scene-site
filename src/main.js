

const MAX_PLAYS = 12;

/** ✅ GitHub Pages base(/crime-scene-site/) 대응: public asset 경로에 BASE_URL 자동 붙이기 */
const BASE = import.meta.env.BASE_URL; // dev: "/" / build(GH pages): "/crime-scene-site/"
function withBase(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path; // 외부 URL이면 그대로
  // "./assets/..." or "/assets/..." or "assets/..." 어떤 형태든 정리
  const clean = path.replace(/^(\.\/)+/, "").replace(/^\/+/, "");
  return `${BASE}${clean}`;
}

const SUSPECTS = [
  {
    id: "pastor",
    role: "SUSPECT ①",
    name: "목사님",
    desc: "청년부 담당 교역자",
    img: "assets/images/pastor.jpg",
    questions: [
      { q: "Q1. 돈은 왜 필요하셨나요?", audio: "assets/audio/cho_1.m4a" },
      { q: "Q2. 정전 후 어디로 가셨고 왜 오래 걸렸나요?", audio: "assets/audio/cho_2.m4a" },
      { q: "Q3. 방에 가시는 동안 수상한걸 보진 않으셨나요?", audio: "assets/audio/cho_3.m4a" },
    ],
  },
  {
    id: "hwang",
    role: "SUSPECT ②",
    name: "황회장",
    desc: "현 청년부 회장 / 위러브 기획",
    img: "assets/images/hwang-president.jpg",
    questions: [
      {
        q: "Q1. 평소 민트 사탕을 좋아하신다고 들었습니다. 사건 현장 바닥에서 발견된 'Excel' 한 알이 회장님의 것은 아닌가요?",
        audio: "assets/audio/hwang_1.m4a",
      },
      {
        q: "Q2. 회계 때문에 야심 차게 준비했던 '위러브 초청'이 무산되었을 때 어떠셨나요?",
        audio: "assets/audio/hwang_2.m4a",
      },
      {
        q: "Q3. 최부회장님과 다음 회장 자리를 두고 라이벌 관계라고 하는데, 혹시 부회장님께 불리한 무언가를 아시는 게 있습니까?",
        audio: "assets/audio/hwang_3.m4a",
      },
    ],
  },
  {
    id: "choi",
    role: "SUSPECT ③",
    name: "최부회장",
    desc: "차기 회장 후보 / 트리 철거 담당",
    img: "assets/images/choi-vice.jpg",
    questions: [
      {
        q: "Q1. 정전이 일어나자마자 캠프파이어 준비를 위해 나갔다고 했는데, 정확히 무엇을 했나요?",
        audio: "assets/audio/choi_1.m4a",
      },
      {
        q: 'Q2. 회계에게 보낸 "제발 비밀로 해줘..."라는 카톡은 무슨 일이었나요?',
        audio: "assets/audio/choi_2.m4a",
      },
      {
        q: "Q3. 회계가 부회장님의 미납된 수련회비를 알고 있었던 것 같은데, 왜 회비를 아직 안 내신 건가요?",
        audio: "assets/audio/choi_3.m4a",
      },
    ],
  },
  {
    id: "hoon",
    role: "SUSPECT ④",
    name: "훈부회계",
    desc: "간식비·물품 구매 담당",
    img: "assets/images/hoon-vice-accountant.jpg",
    questions: [
      { q: "Q1. 다이닝홀에는 언제 도착하셨나요?", audio: "assets/audio/hoon_1.m4a" },
      { q: "Q2. 회계와 갈등이 있었나요?", audio: "assets/audio/hoon_2.m4a" },
      { q: "Q3. 정전 났을때 화장실에서 있다고 했는데, 당시에 뭔가 들은건 없나요?", audio: "assets/audio/hoon_3.m4a" },
    ],
  },
  {
    id: "lee",
    role: "SUSPECT ⑤",
    name: "이부서기",
    desc: "기록·음향 담당",
    img: "assets/images/lee-sub.jpg",
    questions: [
      { q: "Q1. 정전이 발생했을 때 어디서 무엇을 하고 있었나요?", audio: "assets/audio/lee_1.m4a" },
      { q: "Q2. 첫 목격자로서 사건 현장의 특이점을 말씀해 주시겠어요?", audio: "assets/audio/lee_2.m4a" },
      { q: "Q3. 누가 범인이라고 생각하나요?", audio: "assets/audio/lee_3.m4a" },
    ],
  },
  {
    id: "shin",
    role: "SUSPECT ⑥",
    name: "신서기",
    desc: "미디어팀",
    img: "assets/images/shin-sub.jpg",
    questions: [
      { q: "Q1. 정전 났을 때 어디 있었나요?", audio: "assets/audio/shin_1.m4a" },
      { q: "Q2. 정회계의 손에 평소 쓰시는 볼펜이 쥐어져 있는 이유는 무엇인가요?", audio: "assets/audio/shin_2.m4a" },
      { q: "Q3. 회계랑 왜 다투신 건가요? 사이가 안 좋나요?", audio: "assets/audio/shin_3.m4a" },
    ],
  },
];

const grid = document.getElementById("grid");
const audio = document.getElementById("audio");
const nowPlaying = document.getElementById("nowPlaying");
const toggleBtn = document.getElementById("toggleBtn");
const stopBtn = document.getElementById("stopBtn");
const quotaEl = document.getElementById("quota");
const alertBar = document.getElementById("alertBar");

const bgm = document.getElementById("bgm");

/* =========================
   SFX (WebAudio sequences)
   ========================= */
let AC = null;
function ensureAudioContext() {
  if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
  if (AC.state === "suspended") AC.resume();
  return AC;
}
function tone({ freq = 880, duration = 0.08, type = "square", gain = 0.06 } = {}) {
  try {
    const ctx = ensureAudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + duration);
  } catch {
    // ignore
  }
}
function sequence(steps) {
  let t = 0;
  steps.forEach((s) => {
    setTimeout(() => tone(s), t);
    t += Math.max(0, (s.waitMs ?? 0));
  });
}

const sfx = {
  stampPaper: () => {
    tone({ freq: 140, duration: 0.10, type: "square", gain: 0.09 });
    setTimeout(() => {
      sequence([
        { freq: 950, duration: 0.03, type: "sawtooth", gain: 0.03, waitMs: 40 },
        { freq: 620, duration: 0.04, type: "sawtooth", gain: 0.03, waitMs: 0 },
      ]);
    }, 90);
  },

  play: () => tone({ freq: 820, duration: 0.06, type: "sine", gain: 0.05 }),

  siren3: () => {
    sequence([
      { freq: 880, duration: 0.10, type: "sine", gain: 0.06, waitMs: 140 },
      { freq: 1040, duration: 0.10, type: "sine", gain: 0.06, waitMs: 140 },
      { freq: 740, duration: 0.12, type: "sine", gain: 0.06, waitMs: 0 },
    ]);
  },

  deny: () => {
    sfx.siren3();
  },
};

/* =========================
   ✅ BGM helpers (mp3)
   ========================= */
let bgmStarted = false;
let bgmTried = false;

async function startBgmOnce() {
  if (!bgm || bgmStarted) return;
  if (bgmTried) return;
  bgmTried = true;

  try {
    // ✅ 여기서 BASE 붙여서 세팅
    if (!bgm.src) bgm.src = withBase("assets/audio/bgm.mp3");

    bgm.volume = 0.18;
    bgm.loop = true;
    await bgm.play();
    bgmStarted = true;
  } catch (e) {
    bgmTried = false;
    console.warn("[BGM] play blocked or failed:", e?.name || e);
  }
}

window.addEventListener(
  "pointerdown",
  () => {
    startBgmOnce();
  },
  { once: true, capture: true }
);

function duckBgm(on) {
  if (!bgm) return;
  bgm.volume = on ? 0.06 : 0.18;
}

/* =========================
   State
   ========================= */
let currentKey = null;
let remaining = MAX_PLAYS;
let limitReached = false;
const heard = new Set();

function showAlertBar(on) {
  if (!alertBar) return;
  alertBar.classList.toggle("is-on", !!on);
  alertBar.textContent = on ? "INTERROGATION LIMIT REACHED" : "";
}

function updateQuotaUI() {
  if (quotaEl) {
    quotaEl.innerHTML = `
      <span class="quota-label">청문 기회</span>
      <span class="quota-num">${remaining}</span>
      <span class="quota-total">/ ${MAX_PLAYS}</span>
    `;
    quotaEl.classList.toggle("quota-empty", remaining <= 0);
  }

  document.querySelectorAll(".qbtn").forEach((b) => {
    const key = `${b.dataset.suspect}-${b.dataset.q}`;
    const canReplay = heard.has(key);
    const isSamePlaying = currentKey === key;
    const shouldDisable = remaining <= 0 && !canReplay && !isSamePlaying;

    b.disabled = shouldDisable;
    b.classList.toggle("is-disabled", shouldDisable);
  });
}

function setActiveButton(key) {
  document.querySelectorAll(".qbtn.is-active").forEach((b) => {
    b.classList.remove("is-active");
    b.setAttribute("aria-pressed", "false");
  });
  if (!key) return;

  const [id, idx] = key.split("-");
  const btn = document.querySelector(`.qbtn[data-suspect="${id}"][data-q="${idx}"]`);
  if (btn) {
    btn.classList.add("is-active");
    btn.setAttribute("aria-pressed", "true");
  }
}

function markHeard(key) {
  heard.add(key);
  const [id, idx] = key.split("-");
  const btn = document.querySelector(`.qbtn[data-suspect="${id}"][data-q="${idx}"]`);
  if (btn) btn.classList.add("is-heard");
}

function shakeQuota() {
  if (!quotaEl) return;
  quotaEl.classList.add("quota-shake");
  setTimeout(() => quotaEl.classList.remove("quota-shake"), 320);
}

function playOrToggle(suspect, idx) {
  const key = `${suspect.id}-${idx}`;
  const qText = suspect.questions[idx].q;

  if (currentKey === key) {
    audio.paused ? audio.play() : audio.pause();
    return;
  }

  const alreadyHeard = heard.has(key);

  if (remaining <= 0 && !alreadyHeard) {
    nowPlaying.textContent = "청문 기회가 소진되어 새로운 증언은 들을 수 없습니다.";
    sfx.deny();
    shakeQuota();
    return;
  }

  if (!alreadyHeard) {
    remaining -= 1;
    if (remaining <= 0) {
      remaining = 0;
      limitReached = true;
      showAlertBar(true);
      sfx.siren3();
    }
  }

  currentKey = key;
  setActiveButton(key);

  // ✅ 오디오도 BASE 붙여서 세팅
  audio.src = withBase(suspect.questions[idx].audio);
  nowPlaying.textContent = `${suspect.role} — ${suspect.name} / ${qText}`;

  markHeard(key);
  updateQuotaUI();

  sfx.play();

  audio.play().catch(() => {
    nowPlaying.textContent = `${suspect.name} (음성 재생 실패)`;
  });
}

function render() {
  grid.innerHTML = "";

  SUSPECTS.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";

    // ✅ 이미지도 BASE 붙여서 세팅
    const imgSrc = withBase(p.img);

    card.innerHTML = `
      <div class="stamp-pop">FILE</div>
      <img src="${imgSrc}" alt="${p.name}" />
      <div class="meta">
        <div class="badge">${p.role}</div>
        <div class="title">${p.name}</div>
        <div class="desc">${p.desc}</div>
      </div>
      <div class="questions">
        ${p.questions
          .map((q, i) => `
            <button class="qbtn" data-suspect="${p.id}" data-q="${i}" aria-pressed="false">
              ${q.q}
            </button>
          `)
          .join("")}
      </div>
    `;

    card.addEventListener("click", (e) => {
      const btn = e.target.closest(".qbtn");
      if (!btn) return;

      card.classList.remove("is-stamped");
      void card.offsetWidth;
      card.classList.add("is-stamped");
      setTimeout(() => card.classList.remove("is-stamped"), 520);

      sfx.stampPaper();
      playOrToggle(p, Number(btn.dataset.q));
    });

    grid.appendChild(card);
  });

  showAlertBar(false);
  updateQuotaUI();
}

audio.addEventListener("play", () => duckBgm(true));
audio.addEventListener("pause", () => duckBgm(false));

audio.addEventListener("ended", () => {
  currentKey = null;
  setActiveButton(null);
  nowPlaying.textContent = "—";
  updateQuotaUI();
  duckBgm(false);
});

toggleBtn.onclick = () => {
  if (!audio.src) return;
  audio.paused ? audio.play() : audio.pause();
};

stopBtn.onclick = () => {
  audio.pause();
  audio.currentTime = 0;
  currentKey = null;
  setActiveButton(null);
  nowPlaying.textContent = "—";
  updateQuotaUI();
  duckBgm(false);
};

render();
