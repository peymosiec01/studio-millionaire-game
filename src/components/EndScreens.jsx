import React from "react";

import { QUESTIONS_PER_STAGE } from "../constants";

export function PromotionScreen({
  currentStage,
  choices,
  onChoosePromotion,
  onRestart,
  onHome,
}) {
  return (
    <div className="end-screen promotion-screen">
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
  practiceMode,
  onPrimary,
  onHome,
}) {
  const title = screen === "sprintover"
    ? "Drill Sprint Complete"
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
    ? `You scored ${sprintScore} points. ${sprintNewBest ? "New personal best." : `Best score: ${sprintBestScore}.`}`
    : screen === "won"
      ? practiceMode
        ? `You completed all ${QUESTIONS_PER_STAGE} practice missions in ${activeShowTitle}. Career unlocks were not changed.`
        : `You completed all ${QUESTIONS_PER_STAGE} missions in the ${activeShowTitle} show.`
      : screen === "walkaway"
        ? practiceMode
          ? `You ended practice in ${activeShowTitle} after clearing ${qNum} of ${QUESTIONS_PER_STAGE}.`
          : `You stepped away from the ${activeShowTitle} show after clearing ${qNum} of ${QUESTIONS_PER_STAGE}.`
        : practiceMode
          ? `Practice stopped after ${qNum} of ${QUESTIONS_PER_STAGE}. Career progress was not changed.`
          : `You missed a question in the ${activeShowTitle} show after clearing ${qNum} of ${QUESTIONS_PER_STAGE}.`;

  return (
    <div className="end-screen">
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
