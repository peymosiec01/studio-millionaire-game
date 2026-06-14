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
        <button className="secondary-btn" onClick={onRestart}>Restart {currentStage?.shortTitle || "Stage"}</button>
        <button className="walk-away-btn" onClick={onHome}>Home</button>
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
  onPrimary,
  onHome,
}) {
  const title = screen === "sprintover"
    ? "Drill Sprint Complete"
    : screen === "won"
      ? `${activeShowTitle} Cleared`
      : screen === "walkaway"
        ? "Stage Paused"
        : "Mission Failed";
  const bigPrize = screen === "sprintover"
    ? `${sprintScore} pts`
    : screen === "won"
      ? "Stage Complete"
      : `${qNum}/${QUESTIONS_PER_STAGE}`;
  const copy = screen === "sprintover"
    ? `You scored ${sprintScore} points. ${sprintNewBest ? "New personal best." : `Best score: ${sprintBestScore}.`}`
    : screen === "won"
      ? `You completed all ${QUESTIONS_PER_STAGE} missions in the ${activeShowTitle} show.`
      : screen === "walkaway"
        ? `You stepped away from the ${activeShowTitle} show after clearing ${qNum} of ${QUESTIONS_PER_STAGE}.`
        : `You missed a question in the ${activeShowTitle} show after clearing ${qNum} of ${QUESTIONS_PER_STAGE}.`;

  return (
    <div className="end-screen">
      <h1>{title}</h1>
      <div className="big-prize">{bigPrize}</div>
      <p>{copy}</p>
      <div className="end-actions">
        <button className="cta-btn" onClick={onPrimary}>
          {screen === "sprintover" ? "Retry Drill Sprint" : "Try This Stage Again"}
        </button>
        <button className="secondary-btn" onClick={onHome}>Home</button>
      </div>
    </div>
  );
}
