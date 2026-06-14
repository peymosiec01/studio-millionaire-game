const LESSON_LABEL_PATTERN = /\b(recruit|recruitment|operative|special\s*ops|spec\s*ops|academy|curriculum|course|module|lesson|rank)\b/i;
const COPILOT_STUDIO_KNOWLEDGE_PATTERN = /\b(copilot studio|agent|topic|trigger|action|connector|knowledge source|generative answers|publish|channel|teams|environment|solution|dataverse|power automate|adaptive card|entity|variable|condition|node|conversation|authentication|content moderation|prompt|deployment|handoff|flow)\b/i;

export function validateQuestionStyle(question, options = {}) {
  const visibleText = [
    question.question,
    ...(Array.isArray(question.options) ? question.options : []),
    question.explanation,
  ].filter(Boolean).join(" ");

  if (LESSON_LABEL_PATTERN.test(visibleText)) {
    throw new Error("Generated question included lesson or stage labels");
  }

  if (options.customShow) {
    if (visibleText.trim().length < 80) {
      throw new Error("Generated custom show question was too thin");
    }
    return;
  }

  if (!COPILOT_STUDIO_KNOWLEDGE_PATTERN.test(visibleText)) {
    throw new Error("Generated question was not specific to Copilot Studio knowledge");
  }
}
