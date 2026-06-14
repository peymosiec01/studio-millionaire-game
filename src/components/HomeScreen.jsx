import React from "react";

export function AppHeader({ customShowActive, showTitle, onOpenSettings }) {
  return (
    <header>
      <div className="brand-lockup">
        <div className="hero-mark" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="47" stroke="#F2E88F" strokeWidth="1.5" opacity="0.75" />
            <circle cx="50" cy="50" r="34" stroke="#5B89DE" strokeWidth="1.5" opacity="0.7" />
            <circle cx="50" cy="50" r="20" stroke="#F2E88F" strokeWidth="1.5" opacity="0.55" />
            <path d="M50 10V90M10 50H90M23 23L77 77M77 23L23 77" stroke="#2E59A9" strokeWidth="1.4" opacity="0.45" />
            <circle cx="50" cy="50" r="8" fill="#F2E88F" />
            <path d="M31 50C31 39.5 39.5 31 50 31C60.5 31 69 39.5 69 50" stroke="#F2E88F" strokeWidth="3" strokeLinecap="round" />
            <path d="M34 61C38 66 43 69 50 69C57 69 62 66 66 61" stroke="#5B89DE" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <div className="brand-copy">
          <div className="logo-eyebrow">Learning Game</div>
          <div className="brand-title">Studio<span className="brand-accent"> Millionaire</span></div>
          <div className="brand-sub">{showTitle}</div>
        </div>
      </div>
      <div className="header-actions">
        {!customShowActive && (
          <div className="copilot-badge" aria-label="Microsoft Copilot badge">
            <img src="/copilot_studio_logo.svg" alt="Copilot logo" className="copilot-logo" height="24" />
            <span>Copilot</span>
          </div>
        )}
        <button className="header-settings-btn" type="button" aria-label="Open settings" title="Settings" onClick={onOpenSettings}>⚙</button>
      </div>
    </header>
  );
}

export function SplashScreen({
  customShowActive,
  splashTitle,
  splashLead,
  homeNote,
  hasProgress,
  careerSummary,
  bestSprintScore,
  modelSummary,
  customShowPlanning,
  errorMsg,
  onStartGame,
  onResumeProgress,
  onStartSprint,
}) {
  const splashTitleMatch = splashTitle.match(/^(Rank Up in)\s+(.+)$/i);

  return (
    <div className="splash">
      <div className="home-hero">
        <div className="home-copy">
          <div className="splash-eyebrow">Mission Control</div>
          <h1>
            {splashTitleMatch ? (
              <>
                <span className="splash-title-prefix">{splashTitleMatch[1]}</span>
                <span className="splash-title-subject">{splashTitleMatch[2]}</span>
              </>
            ) : splashTitle}
          </h1>
          <p className="splash-lead">{splashLead}</p>

          <div className="splash-actions">
            {hasProgress
              ? <button className="cta-btn splash-primary" onClick={onResumeProgress} disabled={customShowPlanning}>Resume Progress</button>
              : <button className="cta-btn splash-primary" onClick={onStartGame} disabled={customShowPlanning}>{customShowPlanning ? "Designing Show..." : "Start Career"}</button>}
            <button className="secondary-btn splash-secondary" onClick={onStartSprint} disabled={customShowPlanning}>Drill Sprint</button>
          </div>
          {customShowPlanning && <div className="planning-note">Building your custom show structure before the first question...</div>}
          {errorMsg && <div className="err-box"><span>{errorMsg}</span></div>}
        </div>

        <div className="home-showcase" aria-hidden="true">
          <div className="showcase-ring">
            <div className="showcase-core">
              <span>15</span>
              <small>Missions</small>
            </div>
          </div>
          <div className="showcase-stat showcase-stat-top">50:50</div>
          <div className="showcase-stat showcase-stat-mid">Audience</div>
          <div className="showcase-stat showcase-stat-bottom">Phone</div>
        </div>
      </div>

      <div className="home-summary-grid">
        <div className={`home-summary-item ${hasProgress ? "has-progress" : "empty"}`}>
          <div className="summary-header">
            <div className="hero-kicker">{hasProgress ? "Progress" : "Career"}</div>
            {hasProgress && (
              <button className="reset-link" onClick={onStartGame}>Reset</button>
            )}
          </div>
          <div className="progress-copy">{hasProgress ? careerSummary : "No checkpoint yet."}</div>
        </div>
        <div className="home-summary-item">
          <div className="hero-kicker">Drill Sprint</div>
          <div className="progress-copy">Best score: <strong>{bestSprintScore || 0}</strong></div>
        </div>
        <div className="home-summary-item">
          <div className="hero-kicker">Model</div>
          <div className="progress-copy">{modelSummary}</div>
        </div>
      </div>
      <p className="note">
        {customShowActive ? homeNote : <>Questions generated with Azure AI Foundry and grounded by Foundry IQ knowledge retrieval from the <a href="https://aka.ms/agent-academy" target="_blank" rel="noreferrer">Agent Academy</a> curriculum.</>}
      </p>
    </div>
  );
}
