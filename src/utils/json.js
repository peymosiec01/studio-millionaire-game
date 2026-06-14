export function extractJsonObject(text) {
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) throw new Error("The model returned an empty response.");
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("The model response did not include a JSON object.");
  return candidate.slice(start, end + 1);
}

export async function parseJsonWithRepair(text, repairFn) {
  const jsonText = extractJsonObject(text);
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    if (typeof repairFn !== "function") throw err;
    let lastError = err;
    let candidate = jsonText;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const repaired = await repairFn(candidate, lastError, attempt + 1);
      candidate = extractJsonObject(repaired);
      try {
        return JSON.parse(candidate);
      } catch (repairError) {
        lastError = repairError;
      }
    }
    throw lastError;
  }
}
