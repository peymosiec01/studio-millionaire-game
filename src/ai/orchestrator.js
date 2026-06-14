export const ORCHESTRATOR_AGENTS = {
  showrunner: {
    name: "Showrunner Agent",
    decides: "How to turn a topic and source material into a playable Studio Millionaire show.",
    skillIds: ["custom_show_planning", "curriculum_mapping", "splash_copy_review"],
  },
  knowledgeScout: {
    name: "Knowledge Scout Agent",
    decides: "How to keep generated questions tied to the configured Foundry Agent or provided source material.",
    skillIds: ["foundry_agent_grounding", "source_reference_extraction"],
  },
  questionWriter: {
    name: "Question Writer Agent",
    decides: "How to frame a concise, factual, game-ready multiple-choice question.",
    skillIds: ["question_generation", "difficulty_targeting", "distractor_design"],
  },
  safetyJudge: {
    name: "Safety Judge Agent",
    decides: "Whether generated content is safe, specific, answerable, and ready for gameplay.",
    skillIds: ["json_shape_validation", "question_quality_guardrails", "source_grounding_checks"],
  },
  jsonMedic: {
    name: "JSON Medic Agent",
    decides: "How to repair malformed model output without changing the intended structured content.",
    skillIds: ["json_repair"],
  },
  lifelineCoach: {
    name: "Lifeline Coach Agent",
    decides: "How to give a brief, helpful Phone a Friend recommendation.",
    skillIds: ["answer_hinting", "confidence_summary"],
  },
};

export const ORCHESTRATOR_SKILLS = {
  custom_show_planning: {
    knowsHow: "Create a reusable show blueprint with stages, missions, references, and splash copy.",
    implementation: "src/ai/flows.js and src/domain/customShow.js",
  },
  curriculum_mapping: {
    knowsHow: "Map source material into progressive teachable topic areas.",
    implementation: "src/ai/prompts.js and src/domain/customShow.js",
  },
  splash_copy_review: {
    knowsHow: "Judge whether home-screen copy is punchy, natural, and confidence-worthy.",
    implementation: "src/ai/prompts.js",
  },
  foundry_agent_grounding: {
    knowsHow: "Ask the configured Azure AI Foundry Agent to use its attached Foundry IQ knowledge before answering.",
    implementation: "src/ai/providers.js and src/ai/prompts.js",
  },
  source_reference_extraction: {
    knowsHow: "Extract source references from custom show source material.",
    implementation: "src/domain/customShow.js",
  },
  question_generation: {
    knowsHow: "Generate a practical four-option game-show question with one correct answer.",
    implementation: "src/ai/prompts.js and src/ai/flows.js",
  },
  difficulty_targeting: {
    knowsHow: "Adjust question difficulty for career missions and drill sprint phases.",
    implementation: "src/domain/progression.jsx and src/domain/sprint.js",
  },
  distractor_design: {
    knowsHow: "Create plausible but incorrect answer options.",
    implementation: "src/ai/prompts.js",
  },
  json_shape_validation: {
    knowsHow: "Verify generated JSON has the exact playable question shape.",
    implementation: "src/ai/flows.js",
  },
  question_quality_guardrails: {
    knowsHow: "Reject generic, thin, or hidden-label question drafts.",
    implementation: "src/domain/validation.js",
  },
  source_grounding_checks: {
    knowsHow: "Keep generated questions tied to provided source material or Foundry Agent grounding.",
    implementation: "src/ai/prompts.js and src/domain/validation.js",
  },
  json_repair: {
    knowsHow: "Repair malformed model JSON while preserving intended content.",
    implementation: "src/utils/json.js and src/ai/flows.js",
  },
  answer_hinting: {
    knowsHow: "Recommend the most likely answer for Phone a Friend.",
    implementation: "src/ai/prompts.js",
  },
  confidence_summary: {
    knowsHow: "Summarize answer confidence in a short, friendly way.",
    implementation: "src/ai/prompts.js",
  },
};

export function buildAgentPrompt(agentKey, taskPrompt) {
  const agent = ORCHESTRATOR_AGENTS[agentKey] || ORCHESTRATOR_AGENTS.questionWriter;
  const skillSummary = agent.skillIds
    .map((skillId) => {
      const skill = ORCHESTRATOR_SKILLS[skillId];
      return skill ? `- ${skillId}: ${skill.knowsHow}` : `- ${skillId}`;
    })
    .join("\n");
  return `Studio Millionaire Orchestrator
Active agent: ${agent.name}
Agent decides: ${agent.decides}
Skills this agent can use:
${skillSummary}

Operating rules:
- Use only the skills needed for this task.
- Keep outputs factual, compact, and suitable for gameplay.
- Follow the requested response format exactly.
- Do not reveal orchestration notes, hidden labels, or internal reasoning to the player.

Task:
${taskPrompt}`;
}
