import {
  SPRINT_BASE_POINTS,
  SPRINT_SCORE_BONUS_POINTS,
  SPRINT_TIME_BONUS,
  TOPICS,
} from "../constants";
import { getCustomShowTopics, hasCustomShow } from "./customShow";

export function isSprintMode(gameState) {
  return gameState.gameMode === "sprint";
}

export function getSprintDrill(gameState) {
  if (!isSprintMode(gameState)) return null;
  if (gameState.qNum < 4) return { label: "Foundation Drill", difficulty: "beginner", topicFilter: (topic) => topic.label.startsWith("Recruit:") };
  if (gameState.qNum < 8) return { label: "Applied Drill", difficulty: "intermediate", topicFilter: (topic) => topic.label.startsWith("Recruit:") || topic.label.startsWith("Operative:") };
  if (gameState.qNum < 12) return { label: "Pressure Drill", difficulty: "advanced", topicFilter: () => true };
  return { label: "Elite Drill", difficulty: "expert", topicFilter: () => true };
}

export function getSprintTopics(gameState) {
  if (hasCustomShow(gameState)) return getCustomShowTopics(gameState);
  const drill = getSprintDrill(gameState);
  if (!drill) return TOPICS;
  const filtered = TOPICS.filter((topic) => drill.topicFilter(topic));
  return filtered.length ? filtered : TOPICS;
}

export function getSprintReward(gameState, drill) {
  const difficulty = drill?.difficulty || "beginner";
  const bonusChance = {
    beginner: 0.25,
    intermediate: 0.35,
    advanced: 0.45,
    expert: 0.55,
  }[difficulty] ?? 0.3;

  if (Math.random() >= bonusChance) {
    return { label: `+${SPRINT_BASE_POINTS} Score`, points: SPRINT_BASE_POINTS, timeBonus: 0, type: "standard" };
  }

  const rewardType = Math.random();
  const preferTimeBonus = difficulty === "beginner" || difficulty === "intermediate";

  if (rewardType < 0.2) {
    const lifelineTypes = ["fifty", "audience", "phone"];
    const pickedLifeline = lifelineTypes[Math.floor(Math.random() * lifelineTypes.length)];
    const lifelineLabels = { fifty: "50:50", audience: "Audience", phone: "Phone" };
    return {
      label: `+${SPRINT_BASE_POINTS} Score +${lifelineLabels[pickedLifeline]}`,
      points: SPRINT_BASE_POINTS,
      timeBonus: 0,
      lifeline: pickedLifeline,
      type: "lifeline",
    };
  }

  if ((preferTimeBonus && rewardType < 0.75) || (!preferTimeBonus && rewardType < 0.5)) {
    return {
      label: `+${SPRINT_BASE_POINTS} Score +${SPRINT_TIME_BONUS}s`,
      points: SPRINT_BASE_POINTS,
      timeBonus: SPRINT_TIME_BONUS,
      type: "time",
    };
  }

  return {
    label: `+${SPRINT_BASE_POINTS + SPRINT_SCORE_BONUS_POINTS} Score`,
    points: SPRINT_BASE_POINTS + SPRINT_SCORE_BONUS_POINTS,
    timeBonus: 0,
    type: "points",
  };
}

export function formatTime(seconds) {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds) % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
