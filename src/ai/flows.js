import { normalizeCustomShowPlan } from "../domain/customShow";
import { validateQuestionStyle } from "../domain/validation";
import { parseJsonWithRepair } from "../utils/json";
import {
  buildCustomShowPlanPrompt,
  buildCustomShowRepairPrompt,
  buildQuestionRepairPrompt,
  getQuestionRetryInstruction,
} from "./prompts";

export async function designCustomShowPlan({ current, sourceReferences, runAgent }) {
  const basePrompt = buildCustomShowPlanPrompt(current, sourceReferences);
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const retryInstruction = attempt === 0
        ? ""
        : "\n\nThe previous custom show blueprint was malformed or unusable. Return a smaller valid JSON object this time: 3 stages, 5 topics per stage, no markdown, no trailing commas, no comments.";
      const txt = await runAgent("showrunner", `${basePrompt}${retryInstruction}`);
      const parsed = await parseJsonWithRepair(txt, async (brokenJson, parseError) => {
        return runAgent("jsonMedic", buildCustomShowRepairPrompt(brokenJson, parseError));
      });
      const normalized = normalizeCustomShowPlan(parsed, current);
      if (!normalized) throw new Error("The model did not return a usable custom show blueprint.");
      return normalized;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("The model did not return a usable custom show blueprint.");
}

export async function generateQuestionDraft({ prompt, customShow, runAgent }) {
  let json = null;
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const retryInstruction = attempt === 0 ? "" : getQuestionRetryInstruction(customShow);
      const txt = await runAgent("questionWriter", `${prompt}${retryInstruction}`);
      const candidate = await parseJsonWithRepair(txt, async (brokenJson, parseError) => {
        return runAgent("jsonMedic", buildQuestionRepairPrompt(brokenJson, parseError));
      });
      if (
        !candidate.question ||
        !Array.isArray(candidate.options) ||
        candidate.options.length !== 4 ||
        candidate.options.some((option) => typeof option !== "string" || !option.trim()) ||
        typeof candidate.correct !== "number" ||
        candidate.correct < 0 ||
        candidate.correct > 3 ||
        !candidate.explanation ||
        typeof candidate.explanation !== "string"
      ) {
        throw new Error("Unexpected JSON shape from API");
      }
      candidate.options = candidate.options.map((option) => option.trim());
      candidate.question = candidate.question.trim();
      candidate.explanation = candidate.explanation.trim();
      validateQuestionStyle(candidate, { customShow });
      json = candidate;
      break;
    } catch (err) {
      lastError = err;
    }
  }
  if (!json) throw lastError || new Error("Could not generate a valid question");
  return json;
}
