import {
  SPRINT_BASE_POINTS,
  SPRINT_PRIZE_TIERS,
} from "../constants";

export const BONUS_SHOP_ITEMS = [
  { id: "hint-pack", name: "Hint Pack", description: "Gain 3 bonus hints for future games", cost: 25, icon: "ðŸ’¡" },
  { id: "lifeline-unlock", name: "Lifeline Unlock", description: "Unlock one random lifeline (50:50, Audience, or Phone)", cost: 40, icon: "ðŸŽ" },
  { id: "time-boost", name: "Time Boost", description: "Add 30 seconds to your next sprint", cost: 30, icon: "â°" },
  { id: "score-multiplier", name: "Score Multiplier", description: "2x points on your next 5 questions", cost: 60, icon: "ðŸš€" },
];

export const REWARD_SHOP_ITEMS = [
  { id: "buy-fifty", name: "50:50", description: "Add one 50:50 lifeline to this sprint.", cost: { loot: 5 }, icon: "50:50", rarity: "Lifeline" },
  { id: "buy-audience", name: "Ask Audience", description: "Add one audience lifeline to this sprint.", cost: { loot: 7 }, icon: "AUD", rarity: "Lifeline" },
  { id: "buy-phone", name: "Phone Friend", description: "Add one phone lifeline to this sprint.", cost: { loot: 9 }, icon: "CALL", rarity: "Lifeline" },
  { id: "timer-pause", name: "Pause Timer", description: "Freeze the timer for your next 3 answers. Gameplay continues.", cost: { gems: 1 }, icon: "PAUSE", rarity: "Timer" },
  { id: "timer-reset", name: "Reset Timer", description: "Restore the sprint timer to the full 5 minutes.", cost: { tokens: 2 }, icon: "5:00", rarity: "Timer" },
  { id: "full-lifeline-pack", name: "Lifeline Pack", description: "Add one of each lifeline.", cost: { gems: 3, tokens: 1 }, icon: "ALL", rarity: "Bundle" },
];

export const REWARD_RULES = [
  { label: "Loot", earn: "Streak events", spend: "Buy lifelines", example: "5 Loot = 50:50" },
  { label: "Gems", earn: "Prize ladder", spend: "Freeze timer", example: "1 Gem = 3-question freeze" },
  { label: "Tokens", earn: "Big achievements", spend: "Reset timer", example: "2 Tokens = reset to 5:00" },
];

export const REWARD_PRINCIPLES = [
  { label: "Score", role: "Regular progress", detail: "+2 points for each correct answer" },
  { label: "Boosts", role: "Intermittent rewards", detail: "Random bonus score, time, or lifeline offers" },
  { label: "Currencies", role: "Event-based rewards", detail: "Loot, Gems, and Tokens from streaks, ladders, and achievements" },
];

export function getWallet(gameState) {
  return {
    loot: Math.max(0, Math.floor(gameState.rewardWallet?.loot || 0)),
    gems: Math.max(0, Math.floor(gameState.rewardWallet?.gems || 0)),
    tokens: Math.max(0, Math.floor(gameState.rewardWallet?.tokens || 0)),
  };
}

export function addCurrency(draft, currency, amount) {
  if (!draft.rewardWallet) draft.rewardWallet = { loot: 0, gems: 0, tokens: 0 };
  draft.rewardWallet[currency] = Math.max(0, (draft.rewardWallet[currency] || 0) + amount);
}

export function canAfford(wallet, cost) {
  return Object.entries(cost).every(([currency, amount]) => (wallet[currency] || 0) >= amount);
}

export function spendCurrency(draft, cost) {
  if (!draft.rewardWallet) draft.rewardWallet = { loot: 0, gems: 0, tokens: 0 };
  Object.entries(cost).forEach(([currency, amount]) => {
    draft.rewardWallet[currency] = Math.max(0, (draft.rewardWallet[currency] || 0) - amount);
  });
}

export function formatCost(cost) {
  return Object.entries(cost)
    .filter(([, amount]) => amount > 0)
    .map(([currency, amount]) => `${amount} ${currency === "gems" ? "Gem" : currency === "tokens" ? "Token" : "Loot"}${amount === 1 ? "" : "s"}`)
    .join(" + ");
}

export function getImmediateRewardPreview(reward) {
  const normalized = reward || { points: SPRINT_BASE_POINTS, timeBonus: 0, type: "standard" };
  const parts = [`+${normalized.points || SPRINT_BASE_POINTS} Score`];
  if (normalized.timeBonus) parts.push(`+${normalized.timeBonus}s`);
  if (normalized.lifeline) parts.push("+Lifeline");
  return parts.join(" | ");
}

export function getImmediateRewardChips(reward) {
  const normalized = reward || { points: SPRINT_BASE_POINTS, timeBonus: 0, type: "standard" };
  const chips = [`+${normalized.points || SPRINT_BASE_POINTS}pts`];
  if (normalized.timeBonus) chips.push(`+${normalized.timeBonus}secs`);
  if (normalized.lifeline) chips.push("+lifeline");
  return chips;
}

export function getRewardVisual(type) {
  if (type === "lifeline") return "Gift";
  if (type === "time") return "Time";
  if (type === "points") return "Prize";
  return "Base";
}

export function getNextPrizeTier(score) {
  return SPRINT_PRIZE_TIERS.find((tier) => score < tier.score) || SPRINT_PRIZE_TIERS[SPRINT_PRIZE_TIERS.length - 1];
}

export function getSprintPrizeProgress(score) {
  const nextTier = getNextPrizeTier(score);
  const previousTier = [...SPRINT_PRIZE_TIERS].reverse().find((tier) => score >= tier.score && tier.score < nextTier.score);
  const floor = previousTier?.score || 0;
  const span = Math.max(1, nextTier.score - floor);
  return Math.min(100, Math.max(0, ((score - floor) / span) * 100));
}

export function awardSprintPrizeTier(draft, tier) {
  if (!tier || draft.sprint.claimedPrizeTiers?.includes(tier.score)) return "";
  if (!Array.isArray(draft.sprint.claimedPrizeTiers)) draft.sprint.claimedPrizeTiers = [];
  draft.sprint.claimedPrizeTiers.push(tier.score);

  Object.entries(tier.wallet || {}).forEach(([currency, amount]) => {
    addCurrency(draft, currency, amount);
  });
  return ` Milestone event: ${tier.reward}.`;
}

export function awardSprintEventCurrencies(draft) {
  const messages = [];
  const streak = draft.sprint.streak || 0;
  if (streak > 0 && streak % 3 === 0) {
    addCurrency(draft, "loot", 5);
    messages.push("+5 Loot streak event");
  }
  if (streak > 0 && streak % 5 === 0) {
    addCurrency(draft, "loot", 10);
    messages.push("+10 Loot streak event");
  }
  if (streak > 0 && streak % 8 === 0) {
    addCurrency(draft, "tokens", 1);
    messages.push("+1 Token achievement event");
  }
  return messages.length ? ` ${messages.join(". ")}.` : "";
}
