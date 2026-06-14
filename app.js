/* CONFIG */
const HARDCODED_ANTHROPIC_KEY = "";
const HARDCODED_FOUNDRY_KEY = "";
const DEFAULT_FOUNDRY_ENDPOINT = "https://res-jsaibuildathon.openai.azure.com/openai/v1/";
const DEFAULT_FOUNDRY_DEPLOYMENT = "gpt-4.1-mini";
const SAVE_KEY = "copilot-rank-ladder-progress-v1";
const AUDIO_FILES = {
  ambience: ["audio/mus_questionBed_1_5.webm", "audio/ambience-loop.mp3"],
  menuAmbience: ["audio/mus_mainMenu.webm"],
  start: ["audio/final_answer.ogg", "audio/start.mp3"],
  lifeline: ["audio/final_answer.ogg", "audio/lifeline.mp3"],
  lockin: ["audio/final_answer.ogg", "audio/lockin.mp3"],
  correct: ["audio/win.ogg", "audio/correct.mp3"],
  wrong: ["audio/lose.ogg", "audio/wrong.mp3"],
  walkaway: ["audio/mus_end.webm", "audio/walkaway.mp3"],
  win: ["audio/win.ogg", "audio/win.mp3"],
  fail: ["audio/lose.ogg", "audio/fail.mp3"],
};

/* CONSTANTS */
const QUESTIONS_PER_STAGE = 15;
const LETTERS = ["A", "B", "C", "D"];

const LESSON_URLS = {
  "Recruit: Course Setup": "https://microsoft.github.io/agent-academy/recruit/00-course-setup/",
  "Recruit: Introduction to Agents": "https://microsoft.github.io/agent-academy/recruit/01-introduction-to-agents/",
  "Recruit: Copilot Studio Fundamentals": "https://microsoft.github.io/agent-academy/recruit/02-copilot-studio-fundamentals/",
  "Recruit: Create a Declarative Agent for Microsoft 365 Copilot": "https://microsoft.github.io/agent-academy/recruit/03-create-a-declarative-agent-for-M365Copilot/",
  "Recruit: Creating a Solution": "https://microsoft.github.io/agent-academy/recruit/04-create-a-solution/",
  "Recruit: Get Started with Pre-Built Agents": "https://microsoft.github.io/agent-academy/recruit/05-using-prebuilt-agents/",
  "Recruit: Build a Custom Agent": "https://microsoft.github.io/agent-academy/recruit/06-create-agent-from-conversation/",
  "Recruit: Add a Topic with Triggers": "https://microsoft.github.io/agent-academy/recruit/07-add-new-topic-with-trigger/",
  "Recruit: Enhance with Adaptive Cards": "https://microsoft.github.io/agent-academy/recruit/08-adaptive-card/",
  "Recruit: Automate with Agent Flows": "https://microsoft.github.io/agent-academy/recruit/09-agent-flows/",
  "Recruit: Add Event Triggers": "https://microsoft.github.io/agent-academy/recruit/10-event-trigger/",
  "Recruit: Publish Your Agent": "https://microsoft.github.io/agent-academy/recruit/11-publish-to-teams-and-M365/",
  "Recruit: Understanding Licensing": "https://microsoft.github.io/agent-academy/recruit/12-licensing/",
  "Operative: Get started with the Hiring Agent": "https://microsoft.github.io/agent-academy/operative/01-get-started-with-the-hiring-agent/",
  "Operative: Authoring Agent Instructions": "https://microsoft.github.io/agent-academy/operative/02-authoring-agent-instructions/",
  "Operative: Make your agent multi-agent ready with connected agents": "https://microsoft.github.io/agent-academy/operative/03-connected-agents/",
  "Operative: Automate your agent with Triggers": "https://microsoft.github.io/agent-academy/operative/04-triggers/",
  "Operative: Understanding Agent Models and Response Formatting": "https://microsoft.github.io/agent-academy/operative/05-understanding-agent-models/",
  "Operative: Content Moderation and AI Safety Essentials": "https://microsoft.github.io/agent-academy/operative/06-content-moderation/",
  "Operative: Extracting Resume Contents with Multi-Modal Prompts": "https://microsoft.github.io/agent-academy/operative/07-multimodal-resume-extraction/",
  "Operative: Prompts - Dataverse Grounding": "https://microsoft.github.io/agent-academy/operative/08-dataverse-grounding/",
  "Operative: Generating an Interview Prep Document": "https://microsoft.github.io/agent-academy/operative/09-interview-prep-document/",
  "Operative: Integrate with MCP Servers": "https://microsoft.github.io/agent-academy/operative/10-mcp/",
  "Operative: Obtain User Feedback with Adaptive Cards": "https://microsoft.github.io/agent-academy/operative/11-user-feedback-with-adaptive-cards/",
  "Special Ops: MCS MCP": "https://microsoft.github.io/agent-academy/special-ops/mcs-mcp/",
  "Special Ops: Microsoft Learn Docs MCP": "https://microsoft.github.io/agent-academy/special-ops/ms-learn-mcp/",
  "Special Ops: Power Platform CLI MCP": "https://microsoft.github.io/agent-academy/special-ops/power-platform-cli-mcp/",
  "Special Ops: YAML Specialist": "https://microsoft.github.io/agent-academy/special-ops/yaml-specialist/",
};

const academyTopic = (label, fallbackUrl) => ({ label, url: LESSON_URLS[label] || fallbackUrl });
const RECRUIT_URL = "https://microsoft.github.io/agent-academy/recruit/";
const OPERATIVE_URL = "https://microsoft.github.io/agent-academy/operative/";
const SPECIAL_OPS_URL = "https://microsoft.github.io/agent-academy/special-ops/";

const TOPICS = [
  academyTopic("Recruit: Course Setup", RECRUIT_URL),
  academyTopic("Recruit: Introduction to Agents", RECRUIT_URL),
  academyTopic("Recruit: Copilot Studio Fundamentals", RECRUIT_URL),
  academyTopic("Recruit: Create a Declarative Agent for Microsoft 365 Copilot", RECRUIT_URL),
  academyTopic("Recruit: Creating a Solution", RECRUIT_URL),
  academyTopic("Recruit: Get Started with Pre-Built Agents", RECRUIT_URL),
  academyTopic("Recruit: Build a Custom Agent", RECRUIT_URL),
  academyTopic("Recruit: Add a Topic with Triggers", RECRUIT_URL),
  academyTopic("Recruit: Enhance with Adaptive Cards", RECRUIT_URL),
  academyTopic("Recruit: Automate with Agent Flows", RECRUIT_URL),
  academyTopic("Recruit: Add Event Triggers", RECRUIT_URL),
  academyTopic("Recruit: Publish Your Agent", RECRUIT_URL),
  academyTopic("Recruit: Understanding Licensing", RECRUIT_URL),
  academyTopic("Operative: Get started with the Hiring Agent", OPERATIVE_URL),
  academyTopic("Operative: Authoring Agent Instructions", OPERATIVE_URL),
  academyTopic("Operative: Make your agent multi-agent ready with connected agents", OPERATIVE_URL),
  academyTopic("Operative: Automate your agent with Triggers", OPERATIVE_URL),
  academyTopic("Operative: Understanding Agent Models and Response Formatting", OPERATIVE_URL),
  academyTopic("Operative: Content Moderation and AI Safety Essentials", OPERATIVE_URL),
  academyTopic("Operative: Extracting Resume Contents with Multi-Modal Prompts", OPERATIVE_URL),
  academyTopic("Operative: Prompts - Dataverse Grounding", OPERATIVE_URL),
  academyTopic("Operative: Generating an Interview Prep Document", OPERATIVE_URL),
  academyTopic("Operative: Integrate with MCP Servers", OPERATIVE_URL),
  academyTopic("Operative: Obtain User Feedback with Adaptive Cards", OPERATIVE_URL),
  academyTopic("Special Ops: MCS MCP", SPECIAL_OPS_URL),
  academyTopic("Special Ops: Microsoft Learn Docs MCP", SPECIAL_OPS_URL),
  academyTopic("Special Ops: Power Platform CLI MCP", SPECIAL_OPS_URL),
  academyTopic("Special Ops: YAML Specialist", SPECIAL_OPS_URL),
];

const STAGES = [
  {
    key: "recruit",
    title: "Recruit",
    shortTitle: "Recruit",
    intro: "Clear 15 core missions to unlock your promotion options.",
    topicFilter: (topic) => topic.label.startsWith("Recruit:"),
    nextChoices: ["operative", "specialops-mcs", "specialops-learn", "specialops-cli", "specialops-yaml"],
  },
  {
    key: "operative",
    title: "Operative",
    shortTitle: "Operative",
    intro: "Advanced missions focused on agent design, safety, grounding, and orchestration.",
    topicFilter: (topic) => topic.label.startsWith("Operative:"),
    nextChoices: [],
  },
  {
    key: "specialops-mcs",
    title: "Special Ops: MCS MCP",
    shortTitle: "Spec Ops MCS",
    intro: "Deep-dive missions for the MCS MCP track.",
    topicFilter: (topic) => topic.label === "Special Ops: MCS MCP",
    nextChoices: [],
  },
  {
    key: "specialops-learn",
    title: "Special Ops: Learn Docs MCP",
    shortTitle: "Spec Ops Learn",
    intro: "Deep-dive missions for the Microsoft Learn Docs MCP track.",
    topicFilter: (topic) => topic.label === "Special Ops: Microsoft Learn Docs MCP",
    nextChoices: [],
  },
  {
    key: "specialops-cli",
    title: "Special Ops: Power Platform CLI MCP",
    shortTitle: "Spec Ops CLI",
    intro: "Deep-dive missions for the Power Platform CLI MCP track.",
    topicFilter: (topic) => topic.label === "Special Ops: Power Platform CLI MCP",
    nextChoices: [],
  },
  {
    key: "specialops-yaml",
    title: "Special Ops: YAML Specialist",
    shortTitle: "Spec Ops YAML",
    intro: "Deep-dive missions for the YAML Specialist track.",
    topicFilter: (topic) => topic.label === "Special Ops: YAML Specialist",
    nextChoices: [],
  },
];

const STAGE_MAP = Object.fromEntries(STAGES.map((stage) => [stage.key, stage]));

/* STATE */
let state = {
  screen: "splash",
  provider: "foundry",
  apiKey: HARDCODED_ANTHROPIC_KEY,
  foundryKey: HARDCODED_FOUNDRY_KEY,
  foundryEndpoint: DEFAULT_FOUNDRY_ENDPOINT,
  foundryDeployment: DEFAULT_FOUNDRY_DEPLOYMENT,
  model: "claude-sonnet-4-20250514",
  soundEnabled: true,
  currentStageKey: "recruit",
  unlockedStages: ["recruit"],
  completedStages: [],
  bestStageProgress: {},
  checkpoint: null,
  qNum: 0,
  currentQ: null,
  currentTopic: null,
  selectedAnswer: null,
  revealedCorrect: false,
  usedLifelines: { fifty: false, audience: false, phone: false },
  settingsOpen: false,
  status: "",
  feedbackType: "",
  feedbackMsg: "",
  eliminated: [],
  hintText: "",
  loading: false,
  answering: false,
  errorMsg: "",
};

let audioCtx = null;
let ambienceTimer = null;
let ambienceStarting = false;
let endSoundPlayedForScreen = "";
const audioTracks = {};
let audioAssetsReady = false;
let activeBackgroundTrack = "";

const usedTopicIdxs = new Set();

function getCurrentStage() {
  return STAGE_MAP[state.currentStageKey] || STAGE_MAP.recruit;
}

function getStageTopics(stageKey = state.currentStageKey) {
  return TOPICS.filter((topic) => {
    const stage = STAGE_MAP[stageKey] || STAGE_MAP.recruit;
    return stage.topicFilter(topic);
  });
}

function getSourceMeta() {
  if (!state.currentTopic) return "";
  return `Source lesson: <a href="${state.currentTopic.url}" target="_blank" rel="noopener noreferrer">${state.currentTopic.label}</a>`;
}

function getDifficulty() {
  if (state.qNum < 5) return "beginner";
  if (state.qNum < 10) return "intermediate";
  if (state.qNum < 13) return "advanced";
  return "expert";
}

function hasSavedProgress() {
  return Boolean(state.checkpoint) || state.completedStages.length > 0 || state.unlockedStages.length > 1;
}

function getCareerSummary() {
  const unlocked = state.unlockedStages.length;
  const completed = state.completedStages.length;
  const checkpoint = state.checkpoint;
  if (!hasSavedProgress()) return "";

  const checkpointText = checkpoint && checkpoint.type === "stage"
    ? `${STAGE_MAP[checkpoint.stageKey]?.title || "Stage"} at mission ${checkpoint.qNum + 1}`
    : checkpoint && checkpoint.type === "promotion"
      ? "promotion selection ready"
      : "no active checkpoint";

  return `Unlocked tracks: ${unlocked} - Completed tracks: ${completed} - Resume point: ${checkpointText}`;
}

function normalizeStageList(list, fallback = ["recruit"]) {
  const valid = Array.isArray(list) ? list.filter((key) => STAGE_MAP[key]) : [];
  return valid.length ? Array.from(new Set(valid)) : fallback;
}

function normalizeBestProgress(best) {
  const result = {};
  if (!best || typeof best !== "object") return result;
  for (const [stageKey, value] of Object.entries(best)) {
    if (STAGE_MAP[stageKey] && Number.isFinite(value)) {
      result[stageKey] = Math.max(0, Math.min(QUESTIONS_PER_STAGE, Math.floor(value)));
    }
  }
  return result;
}

function normalizeCheckpoint(checkpoint) {
  if (!checkpoint || typeof checkpoint !== "object") return null;
  if (!STAGE_MAP[checkpoint.stageKey]) return null;
  if (checkpoint.type === "promotion") return { type: "promotion", stageKey: checkpoint.stageKey, qNum: QUESTIONS_PER_STAGE };
  const qNum = Number.isFinite(checkpoint.qNum) ? Math.max(0, Math.min(QUESTIONS_PER_STAGE - 1, Math.floor(checkpoint.qNum))) : 0;
  return { type: "stage", stageKey: checkpoint.stageKey, qNum };
}

function saveProgress() {
  try {
    const payload = {
      provider: state.provider,
      model: state.model,
      soundEnabled: state.soundEnabled,
      foundryEndpoint: state.foundryEndpoint,
      foundryDeployment: state.foundryDeployment,
      currentStageKey: state.currentStageKey,
      unlockedStages: normalizeStageList(state.unlockedStages),
      completedStages: normalizeStageList(state.completedStages, []),
      bestStageProgress: normalizeBestProgress(state.bestStageProgress),
      checkpoint: normalizeCheckpoint(state.checkpoint),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {}
}

function loadSavedProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    state.provider = saved.provider === "foundry" ? "foundry" : "anthropic";
    if (typeof saved.model === "string") state.model = saved.model;
    if (typeof saved.soundEnabled === "boolean") state.soundEnabled = saved.soundEnabled;
    if (typeof saved.foundryEndpoint === "string") state.foundryEndpoint = saved.foundryEndpoint;
    if (typeof saved.foundryDeployment === "string") state.foundryDeployment = saved.foundryDeployment;
    state.currentStageKey = STAGE_MAP[saved.currentStageKey] ? saved.currentStageKey : "recruit";
    state.unlockedStages = normalizeStageList(saved.unlockedStages);
    state.completedStages = normalizeStageList(saved.completedStages, []);
    state.bestStageProgress = normalizeBestProgress(saved.bestStageProgress);
    state.checkpoint = normalizeCheckpoint(saved.checkpoint);
  } catch {}
}

function clearSavedProgress() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
}

function updateBestProgress(stageKey = state.currentStageKey, qNum = state.qNum) {
  state.bestStageProgress[stageKey] = Math.max(state.bestStageProgress[stageKey] || 0, qNum);
}

function setCheckpoint(type = "stage", stageKey = state.currentStageKey, qNum = state.qNum) {
  state.checkpoint = type ? { type, stageKey, qNum } : null;
}

function setProvider(provider) {
  state.provider = provider;
  saveProgress();
  render();
}

function createTrackWithFallback(sources) {
  const list = Array.isArray(sources) ? sources : [sources];
  const track = new Audio();
  track.preload = "auto";
  track.dataset.ready = "0";
  track.dataset.index = "0";

  const loadAtIndex = (index) => {
    if (index >= list.length) {
      track.dataset.ready = "0";
      return;
    }
    track.dataset.index = String(index);
    track.src = list[index];
    track.load();
  };

  track.addEventListener("canplaythrough", () => {
    track.dataset.ready = "1";
  });
  track.addEventListener("error", () => {
    const next = Number(track.dataset.index || "0") + 1;
    track.dataset.ready = "0";
    loadAtIndex(next);
  });

  loadAtIndex(0);
  return track;
}

function initAudioAssets() {
  if (audioAssetsReady) return;
  audioAssetsReady = true;
  Object.entries(AUDIO_FILES).forEach(([key, sources]) => {
    audioTracks[key] = createTrackWithFallback(sources);
  });
}

function stopTrack(name) {
  const track = audioTracks[name];
  if (!track) return;
  track.pause();
  track.currentTime = 0;
}

function stopAllBackgroundTracks() {
  stopTrack("ambience");
  stopTrack("menuAmbience");
  activeBackgroundTrack = "";
}

function setBackgroundTrack(name) {
  if (!state.soundEnabled || !name) {
    stopAllBackgroundTracks();
    return;
  }
  if (activeBackgroundTrack === name) return;
  stopAllBackgroundTracks();
  const volume = name === "ambience" ? 0.27 : 0.22;
  const played = playTrack(name, { loop: true, volume, restart: false });
  if (played) {
    activeBackgroundTrack = name;
  } else if (name === "ambience") {
    ensureAudioReady();
    if (!ambienceTimer && !ambienceStarting) startAmbience();
  }
}

function playTrack(name, opts = {}) {
  if (!state.soundEnabled) return false;
  initAudioAssets();
  const track = audioTracks[name];
  if (!track || track.dataset.ready !== "1") return false;

  const { loop = false, volume = 0.45, restart = true } = opts;
  track.loop = loop;
  track.volume = volume;
  if (restart) track.currentTime = 0;
  track.play().catch(() => {});
  return true;
}

function ensureAudioReady() {
  if (!state.soundEnabled) return false;
  initAudioAssets();
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return false;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return true;
}

function playTone(freq, duration = 0.12, type = "sine", volume = 0.03, delay = 0, skipEnsure = false) {
  if (skipEnsure) {
    if (!state.soundEnabled || !audioCtx) return;
  } else if (!ensureAudioReady()) {
    return;
  }
  const start = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function startAmbience() {
  if (!state.soundEnabled || ambienceTimer || !audioCtx) return;
  ambienceStarting = true;
  const pulse = () => {
    playTone(130, 0.25, "triangle", 0.012, 0, true);
    playTone(196, 0.22, "sine", 0.01, 0.18, true);
    playTone(146, 0.28, "triangle", 0.009, 0.5, true);
  };
  ambienceTimer = setInterval(pulse, 4500);
  ambienceStarting = false;
  pulse();
}

function startGameAmbience() {
  if (!state.soundEnabled) return;
  setBackgroundTrack("ambience");
}

function stopAmbience() {
  if (ambienceTimer) {
    clearInterval(ambienceTimer);
    ambienceTimer = null;
  }
  if (activeBackgroundTrack === "ambience") {
    activeBackgroundTrack = "";
  }
  stopTrack("ambience");
}

function playCue(trackName, fallback) {
  if (!state.soundEnabled) return;
  const cueVolume = trackName === "lifeline" ? 0.35 : 0.45;
  const played = playTrack(trackName, { loop: false, volume: cueVolume, restart: true });
  if (!played && typeof fallback === "function") fallback();
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  if (!state.soundEnabled) {
    stopAllBackgroundTracks();
    stopAmbience();
  } else {
    ensureAudioReady();
    if (state.screen === "game") startGameAmbience();
    else setBackgroundTrack("menuAmbience");
    playCue("start", () => {
      playTone(440, 0.08, "sine", 0.02, 0);
      playTone(554, 0.08, "sine", 0.016, 0.1);
    });
  }
  saveProgress();
  render();
}

function syncSettingsFromInputs() {
  const anthropicInput = document.getElementById("apiKeyInput");
  const foundryKeyInput = document.getElementById("foundryKeyInput");
  const foundryEndpointInput = document.getElementById("foundryEndpointInput");
  const foundryDeploymentInput = document.getElementById("foundryDeploymentInput");
  const modelSel = document.getElementById("modelSelect");

  if (anthropicInput) state.apiKey = anthropicInput.value.trim();
  if (foundryKeyInput) state.foundryKey = foundryKeyInput.value.trim();
  if (foundryEndpointInput) state.foundryEndpoint = foundryEndpointInput.value.trim();
  if (foundryDeploymentInput) state.foundryDeployment = foundryDeploymentInput.value.trim();
  if (modelSel) state.model = modelSel.value;
}

function openSettings() {
  state.settingsOpen = true;
  render();
}

function closeSettings(event) {
  if (event) event.stopPropagation();
  state.settingsOpen = false;
  render();
}

function saveSettings() {
  syncSettingsFromInputs();
  state.settingsOpen = false;
  saveProgress();
  render();
}

function resetRoundState() {
  state.currentQ = null;
  state.currentTopic = null;
  state.selectedAnswer = null;
  state.revealedCorrect = false;
  state.usedLifelines = { fifty: false, audience: false, phone: false };
  state.status = "";
  state.feedbackType = "";
  state.feedbackMsg = "";
  state.eliminated = [];
  state.hintText = "";
  state.loading = false;
  state.answering = false;
  state.errorMsg = "";
}

function startStage(stageKey) {
  ensureAudioReady();
  startGameAmbience();
  playCue("start", () => {
    playTone(330, 0.08, "sine", 0.014, 0);
  });
  usedTopicIdxs.clear();
  state.currentStageKey = stageKey;
  state.screen = "game";
  state.qNum = 0;
  resetRoundState();
  setCheckpoint("stage", stageKey, 0);
  saveProgress();
  loadQuestion();
}

function startGame() {
  syncSettingsFromInputs();
  state.unlockedStages = ["recruit"];
  state.completedStages = [];
  state.bestStageProgress = {};
  state.checkpoint = null;
  clearSavedProgress();
  startStage("recruit");
}

function choosePromotion(stageKey) {
  if (!state.unlockedStages.includes(stageKey)) return;
  startStage(stageKey);
}

function resumeProgress() {
  ensureAudioReady();
  if (!state.checkpoint) {
    if (state.currentStageKey && STAGE_MAP[state.currentStageKey]) {
      state.screen = "splash";
      render();
    }
    return;
  }

  if (state.checkpoint.type === "promotion") {
    state.currentStageKey = state.checkpoint.stageKey;
    state.screen = "promotion";
    resetRoundState();
    saveProgress();
    render();
    return;
  }

  usedTopicIdxs.clear();
  state.currentStageKey = state.checkpoint.stageKey;
  state.screen = "game";
  state.qNum = state.checkpoint.qNum;
  resetRoundState();
  saveProgress();
  loadQuestion();
}

function goHome() {
  state.screen = "splash";
  state.currentQ = null;
  state.currentTopic = null;
  saveProgress();
  render();
}

function completeCurrentStage() {
  const stage = getCurrentStage();
  state.currentQ = null;
  state.currentTopic = null;
  state.selectedAnswer = null;
  state.revealedCorrect = false;
  updateBestProgress(stage.key, QUESTIONS_PER_STAGE);
  state.completedStages = Array.from(new Set([...state.completedStages, stage.key]));

  if (stage.key === "recruit") {
    state.unlockedStages = Array.from(new Set([...state.unlockedStages, ...stage.nextChoices]));
    setCheckpoint("promotion", stage.key, QUESTIONS_PER_STAGE);
    state.screen = "promotion";
    endSoundPlayedForScreen = "";
    saveProgress();
    render();
    return;
  }

  setCheckpoint(null);
  state.screen = "won";
  playCue("win", () => {
    playTone(392, 0.12, "triangle", 0.02, 0.02);
    playTone(523, 0.12, "triangle", 0.02, 0.16);
    playTone(784, 0.2, "triangle", 0.02, 0.32);
  });
  endSoundPlayedForScreen = "";
  saveProgress();
  render();
}

/* RENDER */
function render() {
  const app = document.getElementById("app");
  if (state.screen === "game") {
    startGameAmbience();
  } else if (state.screen === "splash" || state.screen === "promotion") {
    stopAmbience();
    setBackgroundTrack("menuAmbience");
  } else {
    stopAllBackgroundTracks();
    stopAmbience();
  }
  if (state.screen !== "won" && state.screen !== "walkaway" && state.screen !== "lost") {
    endSoundPlayedForScreen = "";
  }
  if (state.screen === "splash") return renderSplash(app);
  if (state.screen === "game") return renderGame(app);
  if (state.screen === "promotion") return renderPromotion(app);
  return renderEnd(app);
}

function renderSettingsModal() {
  if (!state.settingsOpen) return "";
  const isFoundry = state.provider === "foundry";

  return `
    <div class="settings-overlay" onclick="closeSettings(event)">
      <div class="settings-modal" onclick="event.stopPropagation()">
        <div class="settings-head">
          <div>
            <h2>Settings</h2>
            <p>Choose your model provider and manage the credentials used to generate questions.</p>
          </div>
          <button class="settings-close" onclick="closeSettings(event)" aria-label="Close settings">X</button>
        </div>

        <div class="provider-toggle">
          <button class="provider-tab ${!isFoundry ? "active-anthropic" : ""}" onclick="setProvider('anthropic')">
            Anthropic (Claude)
          </button>
          <button class="provider-tab ${isFoundry ? "active-openai" : ""}" onclick="setProvider('foundry')">
            Microsoft Foundry
          </button>
        </div>

        <div class="api-key-section" style="${isFoundry ? "display:none" : ""}">
          <label for="apiKeyInput">Anthropic API Key</label>
          <input id="apiKeyInput" type="password" placeholder="sk-ant-..." value="${state.apiKey}" />
          <label for="modelSelect" style="margin-top:4px">Model</label>
          <select id="modelSelect" class="model-select">
            <option value="claude-sonnet-4-20250514" ${state.model === "claude-sonnet-4-20250514" ? "selected" : ""}>Claude Sonnet 4 (recommended)</option>
            <option value="claude-opus-4-5" ${state.model === "claude-opus-4-5" ? "selected" : ""}>Claude Opus 4.5</option>
            <option value="claude-haiku-4-5-20251001" ${state.model === "claude-haiku-4-5-20251001" ? "selected" : ""}>Claude Haiku 4.5 (fastest)</option>
          </select>
          <div class="hint">
            Key goes directly to <a href="https://api.anthropic.com" target="_blank">api.anthropic.com</a> and is only kept in this browser session.
          </div>
        </div>

        <div class="api-key-section" style="${!isFoundry ? "display:none" : ""}">
          <label for="foundryKeyInput">Azure AI Foundry API Key</label>
          <input id="foundryKeyInput" type="password" placeholder="Paste your Azure/OpenAI key" value="${state.foundryKey}" />
          <label for="foundryEndpointInput" style="margin-top:4px">Endpoint</label>
          <input id="foundryEndpointInput" type="text" placeholder="https://your-resource.openai.azure.com/openai/v1/" value="${state.foundryEndpoint}" />
          <label for="foundryDeploymentInput" style="margin-top:4px">Deployment Name</label>
          <input id="foundryDeploymentInput" type="text" placeholder="gpt-4.1-mini" value="${state.foundryDeployment}" />
          <div class="hint">
            Uses the Azure OpenAI-compatible chat completions API from your Microsoft Foundry resource.
          </div>
        </div>

        <div class="settings-actions">
          <button class="secondary-btn" onclick="closeSettings(event)">Cancel</button>
          <button class="cta-btn" style="padding:0.75rem 1.4rem;font-size:14px" onclick="saveSettings()">Save Settings</button>
        </div>
      </div>
    </div>`;
}

function renderSplash(app) {
  const hasProgress = hasSavedProgress();
  const primaryAction = hasProgress
    ? `<button class="cta-btn splash-primary" onclick="resumeProgress()">Resume Progress</button>`
    : `<button class="cta-btn splash-primary" onclick="startGame()">Start Recruit Stage</button>`;
  const secondaryAction = hasProgress
    ? `<button class="secondary-btn splash-secondary" onclick="startGame()">Start New Career</button>`
    : `<button disabled class="settings-launch splash-secondary" onclick="openSettings()">Open Settings</button>`;
  const mobileSettingsAction = `<button disabled class="settings-launch splash-mobile-settings" onclick="openSettings()">Settings</button>`;

  app.innerHTML = `
    <div class="splash">
      <div class="splash-eyebrow">Mission Control</div>
      <h1>Climb the Agent Academy Rank Ladder</h1>
      <p class="splash-lead">Sharpen real Copilot Studio instincts through staged mission rounds, then unlock your next assignment.</p>

      <div class="splash-hero">
        <div class="hero-panel hero-panel-main">
          <div class="hero-kicker">Your Path</div>
          <p>Begin as <strong>Recruit</strong>, clear 15 practical missions, and earn access to <strong>Operative</strong> plus the available <strong>Special Ops</strong> tracks.</p>
          <div class="lifeline-chips">
            <span>50:50</span>
            <span>Ask the Audience</span>
            <span>Phone a Friend</span>
          </div>
        </div>

        <div class="hero-panel hero-panel-side">
          <div class="hero-kicker">Current Setup</div>
          <div class="settings-summary">
            ${state.provider === "foundry"
              ? `Provider: Microsoft Foundry<br>Deployment: ${state.foundryDeployment}`
              : `Provider: Anthropic Claude<br>Model: ${state.model}`}
          </div>
          <button disabled class="settings-launch splash-settings" onclick="openSettings()">Open Settings</button>
        </div>
      </div>

      <div class="progress-summary ${hasProgress ? "has-progress" : "empty"}">
        <div class="hero-kicker">${hasProgress ? "Progress Snapshot" : "Fresh Career"}</div>
        <div class="progress-copy">
          ${hasProgress
            ? getCareerSummary()
            : "No saved checkpoint yet. Start Recruit to create your first promotion path and auto-save checkpoint."}
        </div>
      </div>

      <div class="splash-actions">
        ${primaryAction}
        ${secondaryAction}
        ${mobileSettingsAction}
      </div>

      <p class="note">
        Questions generated by AI - Based on the
        <a href="https://aka.ms/agent-academy" target="_blank">Agent Academy curriculum</a>
      </p>
    </div>
    ${renderSettingsModal()}`;
}

function renderGame(app) {
  const stage = getCurrentStage();
  const missionNumber = state.qNum + 1;

  let answersBtns = "";
  if (state.currentQ) {
    state.currentQ.options.forEach((opt, i) => {
      let cls = "answer-btn";
      if (state.eliminated.includes(i)) cls += " eliminated";
      if (state.selectedAnswer === i && i === state.currentQ.correct) cls += " correct";
      if (state.selectedAnswer === i && i !== state.currentQ.correct) cls += " wrong";
      if (state.revealedCorrect && i === state.currentQ.correct && state.selectedAnswer !== i) cls += " reveal-correct";

      answersBtns += `
        <button class="${cls}" onclick="answer(${i})" ${(state.answering || state.loading) ? "disabled" : ""}>
          <span class="letter">${LETTERS[i]}:</span>
          <span class="answer-copy">${opt}</span>
        </button>`;
    });
  } else if (state.loading) {
    answersBtns = `
      <div class="loading">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        <span>Generating your question...</span>
      </div>`;
  }

  const ladder = Array.from({ length: QUESTIONS_PER_STAGE }, (_, i) => {
    let cls = "prize-rung";
    if (i === state.qNum) cls += " active";
    else if (i < state.qNum) cls += " won";
    if (i === QUESTIONS_PER_STAGE - 1) cls += " milestone";
    return `
      <div class="${cls}">
        <span class="num">M${i + 1}</span>
        <span class="amount">Mission ${i + 1}</span>
      </div>`;
  }).reverse().join("");

  app.innerHTML = `
    <div class="game-layout ${state.feedbackType ? `hit-${state.feedbackType}` : ""}">
      <div class="main-panel">
        <div class="top-bar">
          <span class="q-label">${stage.title} - Mission ${missionNumber} of ${QUESTIONS_PER_STAGE}</span>
          <div>
          <button class="walk-away-btn" onclick="walkAway()">🛇 Exit Stage</button>
          <button class="walk-away-btn" onclick="toggleSound()">
            ${state.soundEnabled ? "🔊 Sound: On" : "🔇 Sound: Off"}
          </button>
          </div>
        </div>

        <div class="question-box">
          <div>
            <div class="question-prize">${stage.title}</div>
            <div class="question-text">
              ${state.currentQ ? state.currentQ.question : (state.loading ? "Generating your question..." : "")}
            </div>
          </div>
        </div>

        ${state.errorMsg ? `
          <div class="err-box">
            <span>${state.errorMsg}</span>
            <button class="retry-btn" onclick="loadQuestion()">Retry</button>
          </div>` : ""}

        <div class="answers-stage">
          <div class="answer-mid-badge">${missionNumber}</div>
          <div class="answers-grid">${answersBtns}</div>
        </div>

        ${state.feedbackMsg ? `<div class="feedback ${state.feedbackType}">${state.feedbackMsg}</div>` : ""}
        ${state.hintText ? `<div class="hint-box">${state.hintText}</div>` : ""}

        <div class="lifelines">
          <button class="lifeline-btn${state.usedLifelines.fifty ? " used" : ""}" onclick="useFifty()" ${(state.usedLifelines.fifty || !state.currentQ || state.answering) ? "disabled" : ""}>
            🔀 50:50
          </button>
          <button class="lifeline-btn${state.usedLifelines.audience ? " used" : ""}" onclick="useAudience()" ${(state.usedLifelines.audience || !state.currentQ || state.answering) ? "disabled" : ""}>
            👥 Ask the Audience
          </button>
          <button class="lifeline-btn${state.usedLifelines.phone ? " used" : ""}" onclick="usePhone()" ${(state.usedLifelines.phone || !state.currentQ || state.answering) ? "disabled" : ""}>
            📞 Phone a Friend
          </button>
        </div>

        <div class="status-bar">
          ${[
            state.status,
            getSourceMeta(),
            `${state.qNum} of ${QUESTIONS_PER_STAGE} cleared`,
          ].filter(Boolean).join(" - ")}
        </div>
      </div>

      <div>
        <div class="ladder-label">${stage.shortTitle} Progress</div>
        <div class="prize-ladder">${ladder}</div>
      </div>
    </div>`;
}

function renderPromotion(app) {
  const stage = getCurrentStage();
  const cards = stage.nextChoices
    .map((stageKey) => STAGE_MAP[stageKey])
    .filter(Boolean)
    .map((choice) => `
      <button class="cta-btn promotion-btn" onclick="choosePromotion('${choice.key}')">${choice.title}</button>
      <p class="promotion-copy">${choice.intro}</p>
    `)
    .join("");

  app.innerHTML = `
    <div class="end-screen promotion-screen">
      <h1>Recruit Cleared</h1>
      <div class="big-prize">Promotion Unlocked</div>
      <p>You completed all ${QUESTIONS_PER_STAGE} Recruit missions. Choose the next track you want to enter.</p>
      <div class="promotion-grid">${cards}</div>
      <div class="end-actions">
        <button class="secondary-btn" onclick="startGame()">Restart Recruit</button>
        <button class="walk-away-btn" onclick="goHome()">Home</button>
      </div>
    </div>`;
}

function renderEnd(app) {
  const stage = getCurrentStage();
  let title = "";
  let msg = "";
  let badge = "";

  if (state.screen === "won") {
    title = `${stage.title} Cleared`;
    msg = `You completed all ${QUESTIONS_PER_STAGE} missions in the ${stage.title} track.`;
    badge = "Stage Complete";
  } else if (state.screen === "walkaway") {
    title = "Stage Paused";
    msg = `You stepped away from the ${stage.title} track after clearing ${state.qNum} of ${QUESTIONS_PER_STAGE} missions.`;
    badge = `${state.qNum}/${QUESTIONS_PER_STAGE}`;
  } else {
    title = "Mission Failed";
    msg = `You missed a question in the ${stage.title} track after clearing ${state.qNum} of ${QUESTIONS_PER_STAGE} missions.`;
    badge = `${state.qNum}/${QUESTIONS_PER_STAGE}`;
  }

  const endSoundKey = state.screen;
  if (endSoundPlayedForScreen !== endSoundKey) {
    if (state.screen === "lost") {
      playCue("fail", () => {
        playTone(220, 0.16, "sawtooth", 0.02, 0.02);
        playTone(165, 0.2, "sawtooth", 0.022, 0.2);
      });
    } else if (state.screen === "walkaway") {
      playCue("walkaway", () => {
        playTone(280, 0.1, "triangle", 0.015, 0);
      });
    }
    endSoundPlayedForScreen = endSoundKey;
  }

  app.innerHTML = `
    <div class="end-screen">
      <h1>${title}</h1>
      <div class="big-prize">${badge}</div>
      <p>${msg}</p>
      <div class="end-actions">
        <button class="cta-btn" onclick="startStage('${stage.key}')">Try This Stage Again</button>
        <button class="secondary-btn" onclick="goHome()">Home</button>
        <a href="https://aka.ms/agent-academy" target="_blank">
          <button class="walk-away-btn" style="padding:10px 18px;font-size:14px">Visit Agent Academy</button>
        </a>
      </div>
    </div>`;
}

/* API */
async function callAI(userPrompt) {
  if (state.provider === "foundry") return callFoundry(userPrompt);
  return callAnthropic(userPrompt);
}

async function callAnthropic(userPrompt) {
  const key = state.apiKey.trim();
  if (!key) throw new Error("No Anthropic API key provided. Please enter it in settings.");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: state.model,
      max_tokens: 800,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function callFoundry(userPrompt) {
  const key = state.foundryKey.trim();
  const endpoint = state.foundryEndpoint.trim();
  const deployment = state.foundryDeployment.trim();

  if (!key) throw new Error("No Azure AI Foundry API key provided. Please enter it in settings.");
  if (!endpoint) throw new Error("No Azure AI Foundry endpoint provided. Please enter it in settings.");
  if (!deployment) throw new Error("No deployment name provided. Please enter it in settings.");

  const baseUrl = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;
  const res = await fetch(`${baseUrl}chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": key,
    },
    body: JSON.stringify({
      model: deployment,
      max_tokens: 800,
      store: true,
      messages: [
        { role: "developer", content: "You are a helpful assistant." },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Azure AI Foundry API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

/* GAMEPLAY */
async function loadQuestion() {
  state.loading = true;
  state.currentQ = null;
  state.selectedAnswer = null;
  state.revealedCorrect = false;
  state.eliminated = [];
  state.hintText = "";
  state.feedbackMsg = "";
  state.feedbackType = "";
  state.errorMsg = "";
  state.answering = false;
  render();

  const stage = getCurrentStage();
  const stageTopics = getStageTopics();
  const difficulty = getDifficulty();

  const available = stageTopics.map((_, i) => i).filter((i) => !usedTopicIdxs.has(i));
  const pool = available.length > 0 ? available : stageTopics.map((_, i) => i);
  const topicIndex = pool[Math.floor(Math.random() * pool.length)];
  usedTopicIdxs.add(topicIndex);

  const topic = stageTopics[topicIndex];
  state.currentTopic = topic;

  const prompt = `You are writing a ${difficulty}-level multiple choice question for a stage-based Microsoft Copilot Studio quiz.
Use the topic below as source material, but write the question as a natural, realistic, practical product or implementation question.

Topic: ${topic.label}
Current stage: ${stage.title}
Mission number: ${state.qNum + 1} of ${QUESTIONS_PER_STAGE}

Requirements:
- Exactly 4 answer options
- One clearly correct answer
- Three plausible but wrong distractors
- Place the correct answer at a random position from 0-3
- The explanation must be a single concise sentence
- Do not mention "Agent Academy", "academy", "rank", "Special Ops", "curriculum", "course", or "module" in the question or options unless required for factual accuracy
- Prefer realistic scenarios, implementation decisions, configuration choices, troubleshooting situations, or best-practice questions
- Keep the wording natural and professional, as if asked in a real team discussion, certification prep, or product interview

Respond with only valid JSON in this exact structure:
{"question":"...","options":["...","...","...","..."],"correct":2,"explanation":"..."}`;

  try {
    const txt = await callAI(prompt);
    const json = JSON.parse(txt.trim());
    if (!json.question || !Array.isArray(json.options) || json.options.length !== 4 || typeof json.correct !== "number") {
      throw new Error("Unexpected JSON shape from API");
    }
    state.currentQ = json;
    state.status = "";
  } catch (err) {
    state.errorMsg = `Could not load question: ${err.message}`;
  }

  state.loading = false;
  if (!state.errorMsg) {
    playCue("lockin", () => {
      playTone(290, 0.06, "triangle", 0.01, 0);
    });
  }
  setCheckpoint("stage", stage.key, state.qNum);
  saveProgress();
  render();
}

function answer(idx) {
  if (!state.currentQ || state.answering) return;
  ensureAudioReady();
  playCue("lockin", () => {
    playTone(360, 0.06, "sine", 0.015, 0);
  });

  state.answering = true;
  state.selectedAnswer = idx;
  state.revealedCorrect = false;

  if (idx === state.currentQ.correct) {
    state.feedbackType = "correct";
    state.feedbackMsg = `Correct! ${state.currentQ.explanation}`;
    playCue("correct", () => {
      playTone(392, 0.12, "triangle", 0.02, 0.02);
      playTone(523, 0.12, "triangle", 0.02, 0.16);
      playTone(659, 0.18, "triangle", 0.02, 0.32);
    });
    render();

    setTimeout(() => {
      state.qNum += 1;
      updateBestProgress();
      setCheckpoint("stage", state.currentStageKey, Math.min(state.qNum, QUESTIONS_PER_STAGE - 1));
      saveProgress();
      if (state.qNum >= QUESTIONS_PER_STAGE) completeCurrentStage();
      else loadQuestion();
    }, 2000);
    return;
  }

  state.feedbackType = "wrong";
  state.feedbackMsg = `Not this one. The right answer was ${LETTERS[state.currentQ.correct]}. ${state.currentQ.explanation}`;
  playCue("wrong", () => {
    playTone(220, 0.16, "sawtooth", 0.02, 0.02);
    playTone(165, 0.2, "sawtooth", 0.022, 0.2);
  });
  render();

  setTimeout(() => {
    state.revealedCorrect = true;
    render();
  }, 650);

  setTimeout(() => {
    state.screen = "lost";
    state.currentQ = null;
    updateBestProgress();
    setCheckpoint("stage", state.currentStageKey, state.qNum);
    saveProgress();
    render();
  }, 2800);
}

function walkAway() {
  ensureAudioReady();
  state.screen = "walkaway";
  state.currentQ = null;
  state.currentTopic = null;
  updateBestProgress();
  setCheckpoint("stage", state.currentStageKey, state.qNum);
  saveProgress();
  render();
}

function useFifty() {
  if (!state.currentQ || state.usedLifelines.fifty) return;
  ensureAudioReady();
  playCue("lifeline", () => {
    playTone(620, 0.08, "sine", 0.015, 0);
  });
  state.usedLifelines.fifty = true;
  const wrongs = [0, 1, 2, 3].filter((i) => i !== state.currentQ.correct);
  state.eliminated = wrongs.sort(() => Math.random() - 0.5).slice(0, 2);
  state.status = "50:50 used - two wrong answers removed";
  saveProgress();
  render();
}

function useAudience() {
  if (!state.currentQ || state.usedLifelines.audience) return;
  ensureAudioReady();
  playCue("lifeline", () => {
    playTone(540, 0.08, "sine", 0.015, 0);
  });
  state.usedLifelines.audience = true;

  const pcts = [0, 0, 0, 0];
  const active = [0, 1, 2, 3].filter((i) => !state.eliminated.includes(i));
  const correctPct = Math.floor(Math.random() * 25) + 55;
  pcts[state.currentQ.correct] = correctPct;

  let remaining = 100 - correctPct;
  const others = active.filter((i) => i !== state.currentQ.correct);
  others.forEach((i, index) => {
    const value = index === others.length - 1 ? remaining : Math.floor(Math.random() * (remaining + 1));
    pcts[i] = value;
    remaining -= value;
  });

  state.hintText = `Audience vote - A: ${pcts[0]}%&nbsp;&nbsp;B: ${pcts[1]}%&nbsp;&nbsp;C: ${pcts[2]}%&nbsp;&nbsp;D: ${pcts[3]}%`;
  state.status = "Audience has voted";
  saveProgress();
  render();
}

async function usePhone() {
  if (!state.currentQ || state.usedLifelines.phone) return;
  ensureAudioReady();
  playCue("lifeline", () => {
    playTone(460, 0.1, "sine", 0.015, 0);
  });
  state.usedLifelines.phone = true;
  state.hintText = "Calling your expert friend...";
  state.status = "Phone a Friend in progress...";
  render();

  try {
    const hint = await callAI(`You are a Microsoft Copilot Studio expert being called as a lifeline on a quiz show.
Your friend is stuck on this question:

"${state.currentQ.question}"

Options:
A: ${state.currentQ.options[0]}
B: ${state.currentQ.options[1]}
C: ${state.currentQ.options[2]}
D: ${state.currentQ.options[3]}

Give a natural, friendly 2-sentence phone-call style hint. Sound about 80% confident.
Do not state the answer letter directly - guide them toward the right answer naturally.`);

    state.hintText = `Your expert says: "${hint.trim()}"`;
  } catch {
    state.hintText = "Call dropped! Your expert friend couldn't be reached.";
  }

  state.status = "Phone a Friend used";
  saveProgress();
  render();
}

loadSavedProgress();
render();
