import React from "react";

import { REWARD_PRINCIPLES, REWARD_RULES } from "../domain/rewards";

export function AppGuideLauncher({ onToggle }) {
  return (
    <button
      className="reward-guide-launcher"
      type="button"
      aria-label="Open app guide"
      title="App guide"
      onClick={onToggle}
    >
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M7 14h10M7 8.5h14M7 19.5h6" />
      </svg>
    </button>
  );
}

export function AppGuidePanel({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="reward-guide-panel" role="dialog" aria-label="App guide">
      <div className="reward-guide-head">
        <div>
          <h2>App Guide</h2>
          <p>How the show, settings, and sprint rewards fit together.</p>
        </div>
        <button type="button" onClick={onClose}>X</button>
      </div>
      <div className="app-guide-body">
        <section className="guide-section">
          <div className="reward-rules-head">
            <span>Studio Millionaire</span>
            <small>Core loop</small>
          </div>
          <div className="guide-card-list">
            <div className="guide-mini-card">
              <strong>Career</strong>
              <span>Play 15 missions in a stage, then promote into the next track when one is available.</span>
            </div>
            <div className="guide-mini-card">
              <strong>Drill Sprint</strong>
              <span>Answer under time pressure, build streaks, and chase the 10-step prize ladder.</span>
            </div>
            <div className="guide-mini-card">
              <strong>Custom Show</strong>
              <span>Settings can turn your topic and source material into a generated show structure before play starts.</span>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <div className="reward-rules-head">
            <span>Settings</span>
            <small>What changes affect</small>
          </div>
          <div className="guide-card-list">
            <div className="guide-mini-card">
              <strong>Model provider</strong>
              <span>Choose standard Foundry, a Foundry Agent with Foundry IQ, or Claude credentials.</span>
            </div>
            <div className="guide-mini-card">
              <strong>Show</strong>
              <span>Use Copilot Studio Agent Academy by default, or enable a custom show for a new topic.</span>
            </div>
            <div className="guide-mini-card">
              <strong>Save Settings</strong>
              <span>Saving restarts the game, clears career progress, and regenerates custom show structure when needed.</span>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <div className="reward-rules-head">
            <span>Agent Orchestration</span>
            <small>How questions are produced</small>
          </div>
          <div className="guide-card-list">
            <div className="guide-mini-card">
              <strong>Showrunner</strong>
              <span>Builds custom stages, topic missions, source references, and splash copy before play starts.</span>
            </div>
            <div className="guide-mini-card">
              <strong>Knowledge Scout</strong>
              <span>Keeps prompts tied to the configured Foundry Agent or provided source material.</span>
            </div>
            <div className="guide-mini-card">
              <strong>Question Writer</strong>
              <span>Creates the four-option question, explanation, and difficulty fit for Career or Drill Sprint.</span>
            </div>
            <div className="guide-mini-card">
              <strong>Safety Judge</strong>
              <span>Rejects weak JSON, blank options, generic wording, and hidden stage labels before the question appears.</span>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <div className="reward-rules-head">
            <span>Rewards</span>
            <small>Used in Drill Sprint</small>
          </div>
          <div className="guide-card-list">
            {REWARD_PRINCIPLES.map((principle) => (
              <div key={principle.label} className="guide-mini-card reward-principle">
                <strong>{principle.label}</strong>
                <span>{principle.role}</span>
                <small>{principle.detail}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="guide-section">
          <div className="reward-rules-head">
            <span>Reward Uses</span>
            <small>Spend during sprint play</small>
          </div>
          <div className="guide-card-list">
            {REWARD_RULES.map((rule) => (
              <div key={rule.label} className={`guide-mini-card reward-rule reward-${rule.label.toLowerCase()}`}>
                <strong>{rule.label}</strong>
                <span>{rule.earn}</span>
                <em>{rule.spend}</em>
                <small>{rule.example}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
