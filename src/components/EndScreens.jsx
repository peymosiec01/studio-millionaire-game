import React from "react";

import { QUESTIONS_PER_STAGE, SPRINT_PRIZE_TIERS } from "../constants";

const SPRINT_FINAL_TIER_SCORE = SPRINT_PRIZE_TIERS[SPRINT_PRIZE_TIERS.length - 1]?.score || 0;

function CelebrationBurst() {
  return (
    <div className="victory-celebration" aria-hidden="true">
      <div className="trophy-mark">&#127942;</div>
      <div className="firework fw-one"><span></span><span></span><span></span><span></span></div>
      <div className="firework fw-two"><span></span><span></span><span></span><span></span></div>
      <div className="firework fw-three"><span></span><span></span><span></span><span></span></div>
    </div>
  );
}

export function PromotionScreen({
  currentStage,
  choices,
  onChoosePromotion,
  onRestart,
  onHome,
}) {
  return (
    <div className="end-screen promotion-screen victory-screen">
      <CelebrationBurst />
      <h1>Recruit Cleared</h1>
      <div className="big-prize">Promotion Unlocked</div>
      <p>You completed all {QUESTIONS_PER_STAGE} Recruit missions. Choose the next track.</p>
      <div className="promotion-grid">
        {choices.map((choice) => (
          <div key={choice.key}>
            <button className="cta-btn promotion-btn" onClick={() => onChoosePromotion(choice.key)}>{choice.title}</button>
            <p className="promotion-copy">{choice.intro}</p>
          </div>
        ))}
      </div>
      <div className="end-actions">
        <button className="secondary-btn end-action-btn" onClick={onRestart}>
          <span className="end-action-icon" aria-hidden="true">&#8635;</span>
          <span className="end-action-full">Restart {currentStage?.shortTitle || "Stage"}</span>
          <span className="end-action-short">Restart</span>
        </button>
        <button className="walk-away-btn end-action-btn" onClick={onHome}>
          <span className="end-action-icon" aria-hidden="true">&#8962;</span>
          <span className="end-action-full">Home</span>
          <span className="end-action-short">Home</span>
        </button>
      </div>
    </div>
  );
}

export function EndScreen({
  screen,
  activeShowTitle,
  qNum,
  sprintScore,
  sprintBestScore,
  sprintNewBest,
  sprintFinishReason,
  practiceMode,
  onPrimary,
  onHome,
}) {
  const sprintVictory = screen === "sprintover" && (sprintFinishReason === "complete" || sprintScore >= SPRINT_FINAL_TIER_SCORE);
  const victory = screen === "won" || sprintVictory;
  const title = screen === "sprintover"
    ? sprintVictory ? "Drill Sprint Victory" : "Drill Sprint Complete"
    : screen === "won"
      ? practiceMode ? "Practice Complete" : `${activeShowTitle} Cleared`
      : screen === "walkaway"
        ? practiceMode ? "Practice Ended" : "Stage Paused"
        : "Mission Failed";
  const bigPrize = screen === "sprintover"
    ? `${sprintScore} pts`
    : screen === "won"
      ? "Stage Complete"
      : `${qNum}/${QUESTIONS_PER_STAGE}`;
  const copy = screen === "sprintover"
    ? sprintVictory
      ? `Victory! You cleared the final sprint tier with ${sprintScore} points. ${sprintNewBest ? "New personal best." : `Best score: ${sprintBestScore}.`}`
      : `You scored ${sprintScore} points. ${sprintNewBest ? "New personal best." : `Best score: ${sprintBestScore}.`}`
    : screen === "won"
      ? practiceMode
        ? `Victory! You completed all ${QUESTIONS_PER_STAGE} practice missions in ${activeShowTitle}. Career unlocks were not changed.`
        : `Victory! You completed all ${QUESTIONS_PER_STAGE} missions in the ${activeShowTitle} show.`
      : screen === "walkaway"
        ? practiceMode
          ? `You ended practice in ${activeShowTitle} after clearing ${qNum} of ${QUESTIONS_PER_STAGE}.`
          : `You stepped away from the ${activeShowTitle} show after clearing ${qNum} of ${QUESTIONS_PER_STAGE}.`
        : practiceMode
          ? `Practice stopped after ${qNum} of ${QUESTIONS_PER_STAGE}. Career progress was not changed.`
          : `You missed a question in the ${activeShowTitle} show after clearing ${qNum} of ${QUESTIONS_PER_STAGE}.`;

  return (
    <div className={`end-screen ${victory ? "victory-screen" : ""}`}>
      {victory && <CelebrationBurst />}
      <h1>{title}</h1>
      <div className="big-prize">{bigPrize}</div>
      <p>{copy}</p>
      <div className="end-actions">
        <button className="cta-btn end-action-btn" onClick={onPrimary}>
          <span className="end-action-icon" aria-hidden="true">&#8635;</span>
          <span className="end-action-full">
            {screen === "sprintover" ? "Retry Drill Sprint" : "Try This Stage Again"}
          </span>
          <span className="end-action-short">
            {screen === "sprintover" ? "Retry" : "Again"}
          </span>
        </button>
        <button className="secondary-btn end-action-btn" onClick={onHome}>
          <span className="end-action-icon" aria-hidden="true">&#8962;</span>
          <span className="end-action-full">Home</span>
          <span className="end-action-short">Home</span>
        </button>
      </div>
    </div>
  );
}
