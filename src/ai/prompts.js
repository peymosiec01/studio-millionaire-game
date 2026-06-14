import { QUESTIONS_PER_STAGE } from "../constants";
import { cleanConfigValue } from "../config";
import { getCustomShowTitle } from "../domain/customShow";

export function buildCustomShowPlanPrompt(current, sourceReferences) {
  return `You are designing the structure for an AI-powered Studio Millionaire learning game show.
Create a reusable show blueprint similar to a curriculum:
- 3 to 4 progressive stages
- Each stage has a key, title, shortTitle, intro, and nextChoices
- Return 5 to 8 seed topics per stage; the app will expand them into 15 playable missions
- Each stage must cover at least 5 distinct topic areas
- Topics must be specific, teachable, and suitable for generating multiple-choice game-show questions
- Keep labels concise, under 80 characters
- Keep intros under 120 characters
- Use plain ASCII punctuation only
- Use the user's source material and URLs as source signals, but do not claim page contents were read unless text was pasted
- Create punchy, natural home splash copy for the show
- Splash title should feel like "Rank Up in Agent Academy", but adapted to the custom show
- Splash description should feel practical, confident, and game-like
- Include a confidence score from 0 to 100 for the splash copy
- Only give confidence above 85 if the copy is genuinely smart, catchy, and natural
- Do not generate questions yet

Show title: ${getCustomShowTitle(current)}
Topic: ${current.customShowTopic.trim()}
Source material:
${cleanConfigValue(current.customShowSource).slice(0, 7000) || "No source material provided."}

Detected source references:
${sourceReferences.length ? sourceReferences.map((ref, index) => `[${index + 1}] ${ref}`).join("\n") : "None"}

Return only valid JSON in this shape:
{
  "title": "...",
  "stages": [
    {"key":"stage-key","title":"...","shortTitle":"...","intro":"...","nextChoices":["next-stage-key"]}
  ],
  "topics": [
    {"stageKey":"stage-key","label":"Stage Name: Specific mission topic","objective":"What this mission teaches","difficulty":"beginner|intermediate|advanced|expert","url":"optional source URL"}
  ],
  "sourceReferences":["optional URLs"],
  "splashCopy":{"title":"...","description":"...","confidence":90}
}
Before returning, check that every object and array item has a comma where required and that the JSON parses with JSON.parse.`;
}

export function buildCustomShowRepairPrompt(brokenJson, parseError) {
  return `Repair this malformed JSON for a Studio Millionaire custom show blueprint.
Return only valid JSON. Do not add markdown or explanation.
Preserve the intended title, stages, topics, and sourceReferences.
It is acceptable to remove duplicate or incomplete topic objects if needed to make the JSON valid.
Return 3 to 4 stages and at least 5 topics per stage.
Parse error: ${parseError.message}

Malformed JSON:
${brokenJson}`;
}

export function buildQuestionRepairPrompt(brokenJson, parseError) {
  return `Repair this malformed JSON for a multiple-choice quiz question.
Return only valid JSON in this exact shape:
{"question":"...","options":["...","...","...","..."],"correct":2,"explanation":"..."}
All four options must be non-empty, distinct, plausible answer choices.
Do not add markdown or explanation.
Parse error: ${parseError.message}

Malformed JSON:
${brokenJson}`;
}

export function buildGroundingBlock({
  foundryAgentMode,
  customShow,
  customShowSource,
  customSourceReferences,
  customShowTopic,
}) {
  if (foundryAgentMode) {
    return `\nFoundry Agent grounding mode:\nUse your configured Foundry IQ knowledge source/tool as the factual basis before answering. Do not use the public web, do not rely on unsupported memory, and say so internally if your configured knowledge does not contain enough evidence. Return only the requested game-ready output.`;
  }
  if (customShow && customShowSource) {
    return `\nCustom show source material:\n${customShowSource.slice(0, 6000)}\n\nDetected source references:\n${customSourceReferences.length ? customSourceReferences.map((ref, index) => `[${index + 1}] ${ref}`).join("\n") : "No URL references detected."}\n\nUse this source material as the factual basis for the question. If the source material is only URLs, use them as topic/source signals but keep the question conservative and avoid claiming you read page contents that were not pasted.`;
  }
  if (customShow) {
    return `\nNo custom source material was provided. Generate a conservative question from broadly reliable knowledge about the custom show topic: ${customShowTopic}.`;
  }
  return "\nNo Foundry Agent grounding is configured for this run. Use only broadly reliable Microsoft Copilot Studio product knowledge and keep the question conservative.";
}

export function buildQuestionPrompt({
  current,
  stage,
  sprintDrill,
  topic,
  difficulty,
  customShow,
  customShowTitle,
  customShowPhase,
  groundingBlock,
  sprintMode,
}) {
  const hiddenContextRule = "Use the topic, stage, and drill labels only as hidden source context. Do not copy those label words into the question, answer options, or explanation.";
  const copilotStudioRule = "Every question must test Microsoft Copilot Studio product knowledge. Anchor the scenario in building, configuring, troubleshooting, publishing, or governing Copilot Studio agents, topics, triggers, actions, connectors, knowledge sources, environments, solutions, variables, nodes, authentication, or channels. Do not write generic training, learning-path, session-planning, assessment, onboarding, or platform-administration questions.";
  const subjectRule = customShow
    ? `Every question must test the custom show topic: "${current.customShowTopic.trim()}". Write in the voice of "${customShowTitle}" while keeping the question useful, factual, and answerable.`
    : copilotStudioRule;
  const modeLine = sprintMode
    ? `You are writing a ${difficulty}-level multiple choice question for a time-based Drill Sprint game show.`
    : `You are writing a ${difficulty}-level multiple choice question for a stage-based game show.`;
  const contextLines = sprintMode
    ? `Current drill phase: ${sprintDrill.label}
Question number so far: ${current.qNum + 1}`
    : `Current stage: ${customShow ? customShowTitle : stage.title}
Mission number: ${current.qNum + 1} of ${QUESTIONS_PER_STAGE}`;

  return `${modeLine}
Use the topic below as source material, but write the question as a natural, realistic, practical product or implementation question.
${hiddenContextRule}
${subjectRule}
${groundingBlock}

Topic: ${topic.label}
${customShow ? `Custom show phase: ${customShowPhase}
Custom show structure: Foundations -> Core Skills -> Applied Scenarios -> Exam Readiness
Source signal: ${current.customShowTopic.trim()}` : ""}
${contextLines}

Requirements:
- Exactly 4 answer options
- One clearly correct answer
- Three plausible but wrong distractors
- Place the correct answer at a random position from 0-3
- The explanation must be a single concise sentence
- Do not mention "Recruit", "Recruitment", "Operative", "Special Ops", "Spec Ops", "Agent Academy", "academy", "rank", "curriculum", "course", "module", "lesson", "stage", "mission", or "track" in the question, options, or explanation
- ${customShow ? "The question must be specific to the custom show topic and avoid vague trivia that could fit any subject" : "The question must include or clearly imply a Copilot Studio feature or implementation task; avoid vague wording like \"within the platform\""}
- Prefer realistic scenarios, implementation decisions, configuration choices, troubleshooting situations, or best-practice questions
- Keep the wording natural and professional, as if asked in a real team discussion, certification prep, or product interview

Respond with only valid JSON in this exact structure:
{"question":"...","options":["...","...","...","..."],"correct":2,"explanation":"..."}`;
}

export function getQuestionRetryInstruction(customShow) {
  return customShow
    ? "\n\nThe previous draft either used hidden stage labels, was too generic, or did not return the required JSON shape. Rewrite it as a concrete, factual question for the custom show topic and source material. Do not use lesson or stage labels."
    : "\n\nThe previous draft either used lesson/stage labels or was too generic. Rewrite it as a concrete Microsoft Copilot Studio product question about agent building, topics, triggers, actions, knowledge sources, publishing, environments, connectors, or configuration. Do not use lesson or stage labels.";
}

export function buildPhoneFriendPrompt(question) {
  return `You are a Microsoft Copilot Studio expert being called as a lifeline on a quiz show.
Your friend is stuck on this question: "${question.question}"
Options:
A: ${question.options[0]}
B: ${question.options[1]}
C: ${question.options[2]}
D: ${question.options[3]}
Based on your expertise, what is your best guess for the correct answer? State the answer letter (A, B, C, or D) and your confidence level (high, medium, or low) in a brief, natural, and friendly way. Be direct about what you think the answer is.`;
}
