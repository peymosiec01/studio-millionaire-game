export const SAVE_KEY = "copilot-rank-ladder-progress-v1";
export const DEFAULT_SHOW_TITLE = "Copilot Studio Agent Academy";
export const QUESTIONS_PER_STAGE = 15;
export const MIN_CUSTOM_TOPICS_PER_STAGE = 5;
export const SPRINT_PRIZE_LADDER_COUNT = 10;
export const LETTERS = ["A", "B", "C", "D"];
export const SPRINT_TOTAL_SECONDS = 300;
export const SPRINT_BASE_POINTS = 2;
export const SPRINT_SCORE_BONUS_POINTS = 5;
export const SPRINT_TIME_BONUS = 5;
export const SPRINT_TIME_PENALTY = 4;

export const SPRINT_PRIZE_TIERS = [
  { score: 10, name: "Warm-up Gift", reward: "1 Gem", accent: "blue", wallet: { gems: 1 } },
  { score: 20, name: "Lifeline Crate", reward: "2 Gems", accent: "green", wallet: { gems: 2 } },
  { score: 30, name: "Time Spark", reward: "3 Gems", accent: "gold", wallet: { gems: 3 } },
  { score: 40, name: "Loot Cache", reward: "12 Loot", accent: "blue", wallet: { loot: 12 } },
  { score: 50, name: "Elite Pack", reward: "5 Gems", accent: "red", wallet: { gems: 5 } },
  { score: 60, name: "Token Drop", reward: "1 Token", accent: "purple", wallet: { tokens: 1 } },
  { score: 70, name: "Master Badge", reward: "8 Gems", accent: "purple", wallet: { gems: 8 } },
  { score: 85, name: "Power Cache", reward: "20 Loot", accent: "green", wallet: { loot: 20 } },
  { score: 100, name: "Champion Token", reward: "2 Tokens", accent: "gold", wallet: { tokens: 2 } },
  { score: 120, name: "Sprint Honors", reward: "10 Gems + 2 Tokens", accent: "red", wallet: { gems: 10, tokens: 2 } },
];

export const AUDIO_FILES = {
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

export const RECRUIT_URL = "https://microsoft.github.io/agent-academy/recruit/";
export const OPERATIVE_URL = "https://microsoft.github.io/agent-academy/operative/";
export const SPECIAL_OPS_URL = "https://microsoft.github.io/agent-academy/special-ops/";

export const TOPICS = [
  { label: "Recruit: Course Setup", url: `${RECRUIT_URL}00-course-setup/` },
  { label: "Recruit: Introduction to Agents", url: `${RECRUIT_URL}01-introduction-to-agents/` },
  { label: "Recruit: Copilot Studio Fundamentals", url: `${RECRUIT_URL}02-copilot-studio-fundamentals/` },
  { label: "Recruit: Create a Declarative Agent for Microsoft 365 Copilot", url: `${RECRUIT_URL}03-create-a-declarative-agent-for-M365Copilot/` },
  { label: "Recruit: Creating a Solution", url: `${RECRUIT_URL}04-create-a-solution/` },
  { label: "Recruit: Get Started with Pre-Built Agents", url: `${RECRUIT_URL}05-using-prebuilt-agents/` },
  { label: "Recruit: Build a Custom Agent", url: `${RECRUIT_URL}06-create-agent-from-conversation/` },
  { label: "Recruit: Add a Topic with Triggers", url: `${RECRUIT_URL}07-add-new-topic-with-trigger/` },
  { label: "Recruit: Enhance with Adaptive Cards", url: `${RECRUIT_URL}08-adaptive-card/` },
  { label: "Recruit: Automate with Agent Flows", url: `${RECRUIT_URL}09-agent-flows/` },
  { label: "Recruit: Add Event Triggers", url: `${RECRUIT_URL}10-event-trigger/` },
  { label: "Recruit: Publish Your Agent", url: `${RECRUIT_URL}11-publish-to-teams-and-M365/` },
  { label: "Recruit: Understanding Licensing", url: `${RECRUIT_URL}12-licensing/` },
  { label: "Operative: Get started with the Hiring Agent", url: `${OPERATIVE_URL}01-get-started-with-the-hiring-agent/` },
  { label: "Operative: Authoring Agent Instructions", url: `${OPERATIVE_URL}02-authoring-agent-instructions/` },
  { label: "Operative: Make your agent multi-agent ready with connected agents", url: `${OPERATIVE_URL}03-connected-agents/` },
  { label: "Operative: Automate your agent with Triggers", url: `${OPERATIVE_URL}04-triggers/` },
  { label: "Operative: Understanding Agent Models and Response Formatting", url: `${OPERATIVE_URL}05-understanding-agent-models/` },
  { label: "Operative: Content Moderation and AI Safety Essentials", url: `${OPERATIVE_URL}06-content-moderation/` },
  { label: "Operative: Extracting Resume Contents with Multi-Modal Prompts", url: `${OPERATIVE_URL}07-multimodal-resume-extraction/` },
  { label: "Operative: Prompts - Dataverse Grounding", url: `${OPERATIVE_URL}08-dataverse-grounding/` },
  { label: "Operative: Generating an Interview Prep Document", url: `${OPERATIVE_URL}09-interview-prep-document/` },
  { label: "Operative: Integrate with MCP Servers", url: `${OPERATIVE_URL}10-mcp/` },
  { label: "Operative: Obtain User Feedback with Adaptive Cards", url: `${OPERATIVE_URL}11-user-feedback-with-adaptive-cards/` },
  { label: "Special Ops: MCS MCP", url: `${SPECIAL_OPS_URL}mcs-mcp/` },
  { label: "Special Ops: Microsoft Learn Docs MCP", url: `${SPECIAL_OPS_URL}ms-learn-mcp/` },
  { label: "Special Ops: Power Platform CLI MCP", url: `${SPECIAL_OPS_URL}power-platform-cli-mcp/` },
  { label: "Special Ops: YAML Specialist", url: `${SPECIAL_OPS_URL}yaml-specialist/` },
];

export const STAGES = [
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

export const STAGE_MAP = Object.fromEntries(STAGES.map((stage) => [stage.key, stage]));
