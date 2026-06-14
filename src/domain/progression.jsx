import React from "react";
import { QUESTIONS_PER_STAGE, STAGE_MAP, TOPICS } from "../constants";
import { getCustomShowPlan } from "./customShow";

export function getCustomStageMap(gameState) {
  const stages = Array.isArray(gameState?.customShowPlan?.stages) ? gameState.customShowPlan.stages : [];
  return Object.fromEntries(stages.map((stage) => [stage.key, stage]));
}

export function isValidStageKey(key, gameState) {
  return Boolean(STAGE_MAP[key] || getCustomStageMap(gameState)[key]);
}

export function normalizeStageList(list, fallback = ["recruit"], gameState = null) {
  const valid = Array.isArray(list) ? list.filter((key) => isValidStageKey(key, gameState)) : [];
  return valid.length ? Array.from(new Set(valid)) : fallback;
}

export function normalizeBestProgress(best, gameState = null) {
  const result = {};
  if (!best || typeof best !== "object") return result;
  Object.entries(best).forEach(([stageKey, value]) => {
    if (isValidStageKey(stageKey, gameState) && Number.isFinite(value)) {
      result[stageKey] = Math.max(0, Math.min(QUESTIONS_PER_STAGE, Math.floor(value)));
    }
  });
  return result;
}

export function normalizeCheckpoint(checkpoint, gameState = null) {
  if (!checkpoint || typeof checkpoint !== "object") return null;
  if (!isValidStageKey(checkpoint.stageKey, gameState)) return null;
  if (checkpoint.type === "promotion") return { type: "promotion", stageKey: checkpoint.stageKey, qNum: QUESTIONS_PER_STAGE };
  const qNum = Number.isFinite(checkpoint.qNum) ? Math.max(0, Math.min(QUESTIONS_PER_STAGE - 1, Math.floor(checkpoint.qNum))) : 0;
  return { type: "stage", stageKey: checkpoint.stageKey, qNum };
}

export function getCurrentStage(gameState) {
  return getStageByKey(gameState, gameState.currentStageKey) || getCustomShowPlan(gameState)?.stages?.[0] || STAGE_MAP.recruit;
}

export function getStageByKey(gameState, stageKey) {
  const customStage = getCustomStageMap(gameState)[stageKey];
  if (customStage) {
    return {
      ...customStage,
      topicFilter: (topic) => topic.stageKey === customStage.key,
      nextChoices: Array.isArray(customStage.nextChoices) ? customStage.nextChoices : [],
    };
  }
  return STAGE_MAP[stageKey] || null;
}

export function getStageTopics(stageKey, gameState = null) {
  const stage = gameState ? getStageByKey(gameState, stageKey) || STAGE_MAP.recruit : STAGE_MAP[stageKey] || STAGE_MAP.recruit;
  const topicSource = getCustomShowPlan(gameState)?.topics || TOPICS;
  return topicSource.filter((topic) => stage.topicFilter(topic));
}

export function getDifficulty(gameState) {
  if (gameState.qNum < 5) return "beginner";
  if (gameState.qNum < 10) return "intermediate";
  if (gameState.qNum < 13) return "advanced";
  return "expert";
}

export function hasSavedProgress(gameState) {
  return Boolean(gameState.checkpoint) || gameState.completedStages.length > 0 || gameState.unlockedStages.length > 1;
}

export function getCareerSummary(gameState) {
  if (!hasSavedProgress(gameState)) return "";
  const checkpoint = gameState.checkpoint;
  const checkpointText = checkpoint && checkpoint.type === "stage"
    ? `${STAGE_MAP[checkpoint.stageKey]?.title || "Stage"} at mission ${checkpoint.qNum + 1}`
    : checkpoint && checkpoint.type === "promotion"
      ? "promotion selection ready"
      : "no active checkpoint";

  return (
    <>
      Unlocked tracks: {gameState.unlockedStages.length} - Completed tracks: {gameState.completedStages.length}
      <br />
      Resume point: {checkpointText}
    </>
  );
}
