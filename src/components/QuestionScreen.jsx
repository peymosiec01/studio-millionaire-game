import React from "react";

import { LETTERS, QUESTIONS_PER_STAGE } from "../constants";
import { formatTime } from "../domain/sprint";

function SprintSessionHeader({
  sprintDrill,
  missionNumber,
  sprint,
  soundEnabled,
  wallet,
  qualifiedShopItems,
  onTogglePause,
  onStop,
  onToggleSound,
  onOpenShop,
  onRedeem,
}) {
  return (
    <div className="sprint-session-shell">
      <div className="sprint-session-bar">
        <div className="sprint-session-label">
          Drill Sprint - {sprintDrill.label} - Q{missionNumber}
        </div>
        <div className="sprint-session-controls">
          <button className="sprint-control-btn" type="button" onClick={onTogglePause}>
            {sprint.paused ? "▶ Resume" : sprint.pausePending ? "⏸ Pause Queued" : "⏸ Pause"}
          </button>
          <button className="sprint-control-btn sprint-stop-btn" type="button" onClick={onStop}>
            🛑 Stop
          </button>
          <button className="sprint-control-btn" type="button" onClick={onToggleSound}>
            {soundEnabled ? "🔊 Sound: On" : "🔇 Sound: Off"}
          </button>
        </div>
      </div>

      <div className="sprint-points-bar currency-bar">
        <button className="cur-chip dp" type="button" onClick={onOpenShop}>💰 {wallet.loot}</button>
        <button className="cur-chip dia" type="button" onClick={onOpenShop}>💎 {wallet.gems}</button>
        <button className="cur-chip tok" type="button" onClick={onOpenShop}>🪙 {wallet.tokens}</button>
        <div className="cur-sep"></div>
        <div className="qualified-tools" aria-label="Affordable sprint shop items">
          <span className="qualified-label">Can buy</span>
          {qualifiedShopItems.length > 0 ? (
            <>
              {qualifiedShopItems.slice(0, 3).map((item) => (
                <button key={item.id} className="qualified-tool" type="button" onClick={() => onRedeem(item.id)}>
                  {item.name}
                </button>
              ))}
              {qualifiedShopItems.length > 3 && <span className="qualified-more">+{qualifiedShopItems.length - 3} more</span>}
            </>
          ) : (
            <span className="qualified-empty">Nothing yet</span>
          )}
        </div>
        <div className="session-meta">
          <div className="streak-badge">&#128293; {sprint.streak}</div>
          <div className="timer-badge">&#9716; {formatTime(sprint.timeLeft)}</div>
          {sprint.timerFreezeQuestions > 0 && (
            <div className="timer-freeze-badge">Freeze {sprint.timerFreezeQuestions}Q</div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionHeader({
  sprintMode,
  sprintDrill,
  stage,
  missionNumber,
  bonusPoints,
  sprint,
  soundEnabled,
  onTogglePause,
  onOpenShop,
  onWalkAway,
  onToggleSound,
}) {
  return (
    <div className="top-bar">
      <span className="q-label">
        {sprintMode ? `Drill Sprint - ${sprintDrill.label} - Question ${missionNumber}` : `${stage.title} - Mission ${missionNumber} of ${QUESTIONS_PER_STAGE}`}
      </span>
      <div className="walk-away">
        {sprintMode && (
          <button className="walk-away-btn" onClick={onTogglePause}>
            {sprint.paused ? "▶ Resume" : sprint.pausePending ? "⏸ Pause Queued" : "⏸ Pause"}
          </button>
        )}
        {sprintMode && (
          <button className="bonus-points-btn" onClick={onOpenShop}>
            <span className="bonus-points-value">💎 {bonusPoints} pts</span>
            <span className="bonus-points-clean">DP {bonusPoints}</span>
            <span className="bonus-points-action">Redeem</span>
          </button>
        )}
        <button className="walk-away-btn" onClick={onWalkAway}>{sprintMode ? "🛑 Stop Round" : "🛇 Exit Stage"}</button>
        <button className="walk-away-btn" onClick={onToggleSound}>{soundEnabled ? "🔊 Sound: On" : "🔇 Sound: Off"}</button>
      </div>
    </div>
  );
}

function AnswersGrid({ state, missionNumber, onAnswer }) {
  return (
    <div className={`answers-stage ${state.sprint.paused ? "paused" : ""}`}>
      <div className="answer-mid-badge">{missionNumber}</div>
      <div className="answers-grid">
        {state.currentQ && state.currentQ.options.map((opt, i) => {
          let cls = "answer-btn";
          if (state.eliminated.includes(i)) cls += " eliminated";
          if (state.selectedAnswer === i && i === state.currentQ.correct) cls += " correct";
          if (state.selectedAnswer === i && i !== state.currentQ.correct) cls += " wrong";
          if (state.revealedCorrect && i === state.currentQ.correct && state.selectedAnswer !== i) cls += " reveal-correct";
          return (
            <button key={i} className={cls} onClick={() => onAnswer(i)} disabled={state.answering || state.loading || state.sprint.paused}>
              <span className="letter">{LETTERS[i]}:</span>
              <span className="answer-copy">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Lifelines({ state, onFifty, onAudience, onPhone }) {
  return (
    <div className="lifelines">
      <button className={`lifeline-btn${state.usedLifelines.fifty > 0 ? " available" : " used"}`} onClick={onFifty} disabled={state.usedLifelines.fifty <= 0 || !state.currentQ || state.answering || state.sprint.paused}>
        🔀 50:50
        {state.usedLifelines.fifty > 1 && <span className="lifeline-badge">{state.usedLifelines.fifty}</span>}
      </button>
      <button className={`lifeline-btn${state.usedLifelines.audience > 0 ? " available" : " used"}`} onClick={onAudience} disabled={state.usedLifelines.audience <= 0 || !state.currentQ || state.answering || state.sprint.paused}>
        👥 Ask the Audience
        {state.usedLifelines.audience > 1 && <span className="lifeline-badge">{state.usedLifelines.audience}</span>}
      </button>
      <button className={`lifeline-btn${state.usedLifelines.phone > 0 ? " available" : " used"}`} onClick={onPhone} disabled={state.usedLifelines.phone <= 0 || !state.currentQ || state.answering || state.sprint.paused}>
        📞 Phone a Friend
        {state.usedLifelines.phone > 1 && <span className="lifeline-badge">{state.usedLifelines.phone}</span>}
      </button>
    </div>
  );
}

function QuestionSidebar({ sprintMode, stage, state, ladder, sprintPrizeProgress }) {
  return (
    <aside className="sprint-sidebar">
      {sprintMode && (
        <div className="sprint-reward-panel">
          <div className="sprint-panel-title">SPRINT SCORE</div>
          <div className="sm-score-display">
            <div className="sm-score-num">{state.sprint.score}</div>
            <div className="sm-score-sub">Best: {state.sprintBestScore}</div>
          </div>
          <div className="sprint-pass-progress" aria-label="Next sprint prize progress">
            <div style={{ width: `${sprintPrizeProgress}%` }} />
          </div>
        </div>
      )}
      <div className="ladder-label">{sprintMode ? "PRIZE LADDER" : `${stage.shortTitle} Progress`}</div>
      <div className="prize-ladder">
        {ladder.map((item) => (
          <div key={item.key} className={`prize-rung ${item.cls}`}>
            <span className="num">{item.num}</span>
            <span className="amount">{item.amount}</span>
            {item.reward && <span className="rung-reward">{item.reward}</span>}
          </div>
        ))}
      </div>
    </aside>
  );
}

export function QuestionScreen({
  state,
  sprintMode,
  sprintDrill,
  stage,
  activeShowTitle,
  missionNumber,
  wallet,
  qualifiedShopItems,
  immediateRewardChips,
  sourceMeta,
  statusText,
  ladder,
  sprintPrizeProgress,
  onTogglePause,
  onWalkAway,
  onToggleSound,
  onOpenShop,
  onRedeem,
  onRetryQuestion,
  onAnswer,
  onFifty,
  onAudience,
  onPhone,
}) {
  return (
    <div className={`game-layout ${sprintMode ? "sprint-game-layout" : ""} ${state.feedbackType ? `hit-${state.feedbackType}` : ""}`}>
      <div className="main-panel">
        {sprintMode && (
          <SprintSessionHeader
            sprintDrill={sprintDrill}
            missionNumber={missionNumber}
            sprint={state.sprint}
            soundEnabled={state.soundEnabled}
            wallet={wallet}
            qualifiedShopItems={qualifiedShopItems}
            onTogglePause={onTogglePause}
            onStop={onWalkAway}
            onToggleSound={onToggleSound}
            onOpenShop={onOpenShop}
            onRedeem={onRedeem}
          />
        )}

        <QuestionHeader
          sprintMode={sprintMode}
          sprintDrill={sprintDrill}
          stage={stage}
          missionNumber={missionNumber}
          bonusPoints={state.bonusPoints}
          sprint={state.sprint}
          soundEnabled={state.soundEnabled}
          onTogglePause={onTogglePause}
          onOpenShop={onOpenShop}
          onWalkAway={onWalkAway}
          onToggleSound={onToggleSound}
        />

        <div className={`question-box ${state.sprint.paused ? "paused" : ""}`}>
          <div>
            <div className="question-prize">
              {sprintMode ? (
                <div className="sprint-question-meta simple-reward-meta">
                  <div className="drill-chip">{sprintDrill.label}</div>
                  <div className="reward-chip-group">
                    {immediateRewardChips.map((chip) => (
                      <span key={chip} className="reward-pill">{chip}</span>
                    ))}
                  </div>
                  <span className="legacy-reward-badge"></span>
                </div>
              ) : activeShowTitle}
            </div>
            <div className="question-text">{state.currentQ ? state.currentQ.question : (state.loading ? "Generating your question..." : "")}</div>
          </div>
        </div>

        {state.errorMsg && <div className="err-box"><span>{state.errorMsg}</span><button className="retry-btn" onClick={onRetryQuestion}>Retry</button></div>}
        <AnswersGrid state={state} missionNumber={missionNumber} onAnswer={onAnswer} />
        {state.feedbackMsg && <div className={`feedback ${state.feedbackType}`}>{state.feedbackMsg}</div>}
        {state.hintText && <div className="hint-box">{state.hintText}</div>}
        <Lifelines state={state} onFifty={onFifty} onAudience={onAudience} onPhone={onPhone} />
        {sprintMode && state.sprint.pausePending && !state.sprint.paused && <div className="pause-banner pending">Pause queued - finish this question</div>}
        {sprintMode && state.sprint.paused && <div className="pause-banner">Paused - resume when ready</div>}
        <div className="status-bar">{[sourceMeta, statusText].filter(Boolean).join(" - ")}</div>
      </div>

      <QuestionSidebar
        sprintMode={sprintMode}
        stage={stage}
        state={state}
        ladder={ladder}
        sprintPrizeProgress={sprintPrizeProgress}
      />
    </div>
  );
}
