import { MIN_CUSTOM_TOPICS_PER_STAGE, QUESTIONS_PER_STAGE } from "../constants";
import { cleanConfigValue, makeKey } from "../config";

export function getCustomShowSignature(gameState) {
  return JSON.stringify({
    title: cleanConfigValue(gameState.customShowTitle),
    topic: cleanConfigValue(gameState.customShowTopic),
    source: cleanConfigValue(gameState.customShowSource),
  });
}

export function hasCustomShow(gameState) {
  return Boolean(gameState.customShowEnabled && gameState.customShowTopic?.trim());
}

export function getCustomShowTitle(gameState) {
  return cleanConfigValue(gameState.customShowTitle) || "Studio Millionaire Custom Show";
}

export function getCustomShowSourceReferences(gameState) {
  const source = typeof gameState.customShowSource === "string" ? gameState.customShowSource : "";
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /^https?:\/\//i.test(line))
    .slice(0, 6);
}

export function normalizeCustomShowPlan(raw, gameState) {
  if (!raw || typeof raw !== "object") return null;
  const title = cleanConfigValue(raw.title) || getCustomShowTitle(gameState);
  const splashCopy = raw.splashCopy && typeof raw.splashCopy === "object"
    ? {
        title: cleanConfigValue(raw.splashCopy.title),
        description: cleanConfigValue(raw.splashCopy.description),
        confidence: Number(raw.splashCopy.confidence),
      }
    : null;
  const safeSplashCopy = splashCopy &&
    splashCopy.title &&
    splashCopy.description &&
    Number.isFinite(splashCopy.confidence) &&
    splashCopy.confidence > 85
    ? splashCopy
    : null;
  const rawStages = Array.isArray(raw.stages) ? raw.stages : [];
  const stageInput = rawStages.length ? rawStages : [{ title, shortTitle: title, intro: `Answer ${QUESTIONS_PER_STAGE} missions about ${cleanConfigValue(gameState.customShowTopic) || title}.` }];
  const stages = stageInput.slice(0, 6).map((stage, index) => {
    const key = makeKey(stage.key || stage.title, `custom-stage-${index + 1}`);
    return {
      key,
      title: cleanConfigValue(stage.title) || `Stage ${index + 1}`,
      shortTitle: cleanConfigValue(stage.shortTitle) || cleanConfigValue(stage.title) || `Stage ${index + 1}`,
      intro: cleanConfigValue(stage.intro) || "Clear these missions to continue.",
      nextChoices: [],
    };
  });
  if (!stages.length) return null;

  stages.forEach((stage, index) => {
    const explicit = Array.isArray(rawStages[index]?.nextChoices) ? rawStages[index].nextChoices.map((choice) => makeKey(choice, "")).filter(Boolean) : [];
    const nextKey = stages[index + 1]?.key;
    stage.nextChoices = explicit.filter((key) => stages.some((candidate) => candidate.key === key));
    if (!stage.nextChoices.length && nextKey) stage.nextChoices = [nextKey];
  });

  const sourceReferences = Array.isArray(raw.sourceReferences)
    ? raw.sourceReferences.filter((ref) => typeof ref === "string").map(cleanConfigValue).filter(Boolean).slice(0, 8)
    : getCustomShowSourceReferences(gameState);
  const rawTopics = Array.isArray(raw.topics) ? raw.topics : [];
  const normalizedRawTopics = rawTopics.map((topic, index) => {
    const stageKey = makeKey(topic.stageKey || topic.stage || stages[Math.min(stages.length - 1, Math.floor(index / QUESTIONS_PER_STAGE))]?.key, stages[0].key);
    const validStageKey = stages.some((stage) => stage.key === stageKey) ? stageKey : stages[0].key;
    return {
      label: cleanConfigValue(topic.label) || `${stages.find((stage) => stage.key === validStageKey)?.title || "Stage"}: Mission ${index + 1}`,
      url: cleanConfigValue(topic.url),
      stageKey: validStageKey,
      objective: cleanConfigValue(topic.objective),
      difficulty: cleanConfigValue(topic.difficulty) || "intermediate",
      sourceReferences,
      customTopic: cleanConfigValue(gameState.customShowTopic),
      customShowTitle: title,
    };
  });

  const topics = [];
  const customTopic = cleanConfigValue(gameState.customShowTopic) || title;
  stages.forEach((stage, stageIndex) => {
    let stageTopics = normalizedRawTopics.filter((topic) => topic.stageKey === stage.key);
    if (stageTopics.length < MIN_CUSTOM_TOPICS_PER_STAGE) {
      const missing = MIN_CUSTOM_TOPICS_PER_STAGE - stageTopics.length;
      const fallbackSeeds = [
        "Core concepts",
        "Terminology and responsibilities",
        "Implementation choices",
        "Troubleshooting scenarios",
        "Readiness and best practices",
      ];
      for (let i = 0; i < missing; i += 1) {
        stageTopics.push({
          label: `${stage.title}: ${fallbackSeeds[(stageTopics.length + i) % fallbackSeeds.length]}`,
          url: sourceReferences[i % Math.max(1, sourceReferences.length)] || "",
          stageKey: stage.key,
          objective: `Build confidence with ${customTopic}.`,
          difficulty: stageIndex === 0 ? "beginner" : stageIndex === stages.length - 1 ? "expert" : "intermediate",
          sourceReferences,
          customTopic,
          customShowTitle: title,
        });
      }
    }

    const expanded = Array.from({ length: QUESTIONS_PER_STAGE }, (_, missionIndex) => {
      const seed = stageTopics[missionIndex % stageTopics.length];
      return {
        ...seed,
        label: seed.label.includes(":") ? seed.label : `${stage.title}: ${seed.label}`,
        missionNumber: missionIndex + 1,
      };
    });
    topics.push(...expanded);
  });

  return { title, stages, topics, sourceReferences, splashCopy: safeSplashCopy };
}

export function getCustomShowPlan(gameState) {
  if (!hasCustomShow(gameState)) return null;
  const signature = getCustomShowSignature(gameState);
  if (gameState.customShowPlan && gameState.customShowPlanSignature === signature) {
    return normalizeCustomShowPlan(gameState.customShowPlan, gameState);
  }
  return null;
}

export function getCustomShowTopics(gameState) {
  return getCustomShowPlan(gameState)?.topics || [];
}
